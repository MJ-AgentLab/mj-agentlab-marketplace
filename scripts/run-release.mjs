#!/usr/bin/env node
// Draft-first release orchestrator (plan §3 Task 3, lines 521–524; §2.4 evaluator contract).
//
//   RELEASE_SHA=<40hex> GITHUB_REPOSITORY=<owner/repo> GH_TOKEN=<token> node scripts/run-release.mjs
//
// Exit 0 = release created/resumed/published/verified, 1 = a policy/identity/integrity violation,
// 2 = bad input / the run could not proceed.
//
// EVERY DECISION lives in resolve-release-state.mjs, which this file IMPORTS — none of the phase
// transition, digest normalisation or canonical-selection rules are re-encoded here. This
// orchestrator only gathers facts and performs writes; the evaluator alone says what to do next.
// That is exactly the plan's "the workflow gathers facts and performs writes, and copies no ...
// logic into shell" — realised as a tested Node module rather than untestable YAML shell, so the
// draft-first state machine (which cannot be exercised end-to-end without a real GitHub release
// API) is covered by unit tests against a simulated remote.
//
// ALL external I/O goes through the injected `io`, so tests drive the full progression
// (none → draft → uploaded → published, plus every rejection) against a fake. productionIo() is the
// only place git / gh / uv / the filesystem are touched for real.
//
// DRAFT-FIRST, FAIL-CLOSED. A run creates an EMPTY draft, re-queries, uploads the two assets,
// re-queries, downloads + digest/bytes-verifies + install-verifies them, re-queries one last time
// adjacent to publish, and only then publishes. A bug or a moving remote fails before publish,
// leaving an unpublished draft a human can inspect and delete. A published asset is never
// re-uploaded, overwritten or deleted — the fix for a bad publish is a new patch version.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  evaluateReleaseIdentity,
  evaluateReleaseIntegrity,
  checksumAssetBytes,
  parseAssetDigest,
  PolicyError,
  InputError,
} from "./resolve-release-state.mjs";
import { WHEEL_NAME, CHECKSUM_NAME } from "../plugins/learn-kit/scripts/install-nlm-bridge.mjs";
import { verifyReleaseInstall } from "./release-verify-install.mjs";

const SHA_RE = /^[0-9a-f]{40}$/;
const sha256Hex = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const isSha = (v) => typeof v === "string" && SHA_RE.test(v);

// ------------------------------------------------------------------ pure fact builders

/** Combine the static release context with a fresh remote probe into identity facts. */
export function mkIdentityFacts(rel, probe) {
  return {
    version: rel.version,
    releaseSha: rel.releaseSha,
    mainTipSha: rel.mainTipSha,
    releaseShaIsMainAncestor: rel.releaseShaIsMainAncestor,
    targetCommitVersion: rel.targetCommitVersion,
    targetNotes: rel.targetNotes,
    immutabilityEnabled: rel.immutabilityEnabled,
    tag: probe.tag,
    release: probe.release,
  };
}

export function mkIntegrityFacts(idFacts, canonical, priorPhase, expected) {
  return { ...idFacts, expectedCanonicalIdentity: canonical, priorPhase, expectedAssets: expected };
}

export function mkExpectedAssets(built) {
  return {
    wheel: { name: built.wheel.name, size: built.wheel.size, rawSha256: built.wheel.rawSha256 },
    checksum: { name: built.checksum.name, size: built.checksum.size, rawSha256: built.checksum.rawSha256 },
  };
}

/**
 * Extract the raw CHANGELOG section body for a version — the text under `## [X.Y.Z]...` up to the
 * next `## [`. This is extraction only; the evaluator normalises (CRLF/trim) and rejects an empty
 * section, so no canonicalisation happens here.
 */
export function extractChangelogSection(changelog, version) {
  const lines = String(changelog).split(/\r?\n/);
  const head = new RegExp(`^## \\[${version.replace(/\./g, "\\.")}\\]`);
  let i = 0;
  for (; i < lines.length; i++) if (head.test(lines[i])) break;
  if (i === lines.length) return "";
  const body = [];
  for (i++; i < lines.length; i++) {
    if (/^## \[/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n");
}

/** Parse `gh api --paginate .../releases` (one merged array) into evaluator release facts. */
export function parseReleaseFromList(releases, version) {
  if (!Array.isArray(releases)) throw new InputError("releases response is not an array");
  const tag = `v${version}`;
  const matches = releases.filter((r) => r && r.tag_name === tag);
  if (matches.length === 0) return { present: false };
  if (matches.length > 1) throw new PolicyError(`more than one release carries tag ${tag} (${matches.length}); refusing to guess`);
  const r = matches[0];
  return {
    present: true,
    id: r.id,
    tag: r.tag_name,
    name: r.name,
    // GitHub keeps a draft's target_commitish verbatim (the SHA we pass). A published release may
    // report the branch name instead; treat a non-SHA as "no binding" and let the peeled tag carry
    // identity, rather than fail a correct release on a normalised field.
    targetCommitish: isSha(r.target_commitish) ? r.target_commitish : undefined,
    isDraft: r.draft === true,
    isPrerelease: r.prerelease === true,
    body: typeof r.body === "string" ? r.body : "",
    isImmutable: typeof r.immutable === "boolean" ? r.immutable : undefined,
    assets: Array.isArray(r.assets)
      ? r.assets.map((a) => ({ id: a.id, name: a.name, state: a.state, size: a.size, digest: a.digest ?? null }))
      : [],
  };
}

/**
 * Verify the two draft assets against what we built: the release's REST digest must be the canonical
 * sha256, and the on-disk downloaded bytes must hash to the same. Pure over already-fetched facts +
 * an on-disk hash lookup, so it is unit-tested directly rather than only through the live gh path.
 * `onDiskShaOf(name)` returns the sha256 of the downloaded asset file.
 */
export function verifyAssetDigests(release, expected, onDiskShaOf) {
  if (!release || !release.present) throw new PolicyError("draft vanished before the pre-publish digest check");
  for (const key of ["wheel", "checksum"]) {
    const exp = expected[key];
    const asset = (release.assets || []).find((a) => a.name === exp.name);
    if (!asset) throw new PolicyError(`draft is missing asset ${exp.name} at the digest check`);
    const hex = parseAssetDigest(asset.digest);
    if (hex === null) throw new PolicyError(`asset ${exp.name} has no canonical sha256 digest (${JSON.stringify(asset.digest)})`);
    if (hex !== exp.rawSha256) throw new PolicyError(`asset ${exp.name} REST digest ${hex} != built ${exp.rawSha256}`);
    const onDisk = onDiskShaOf(exp.name);
    if (onDisk !== exp.rawSha256) throw new PolicyError(`downloaded ${exp.name} bytes ${onDisk} != built ${exp.rawSha256}`);
  }
}

// ------------------------------------------------------------------ orchestration

/**
 * The draft-first progression. `io` supplies every side effect; this function only sequences them
 * and consults the imported evaluator. Any evaluator throw (identity/integrity/phase violation)
 * propagates unchanged, which is the fail-closed behaviour we want.
 */
export async function runRelease(io) {
  const rel = await io.resolveRelease();

  // --- Stage 1: identity, from the first remote probe.
  const idFacts = mkIdentityFacts(rel, await io.probe(rel.version));
  const id = evaluateReleaseIdentity(idFacts);
  const canonical = id.canonicalIdentity;
  io.log(`canonical: v${canonical.version}@${canonical.sha.slice(0, 12)}  phase=${id.phase}`);

  // --- Stage 2: build the assets from the one canonical commit.
  const built = await io.build(canonical.sha);
  const expected = mkExpectedAssets(built);
  io.log(`built: wheel ${built.wheel.size}B sha=${built.wheel.rawSha256.slice(0, 12)}  checksum ${built.checksum.size}B`);

  // priorPhase threads the phase observed at the previous query. The first integrity call reuses
  // the identity probe, so its priorPhase is the identity phase and the re-derived phase matches.
  let lastPhase = id.phase;
  let integ = evaluateReleaseIntegrity(mkIntegrityFacts(idFacts, canonical, lastPhase, expected));
  lastPhase = integ.phase;
  io.log(`action=${integ.action} assetAction=${integ.assetAction}`);

  if (integ.action === "noop") {
    // The integrity evaluator only returns noop for a published release whose tag, body and both
    // assets already verify. There is nothing left to do — and nothing to re-verify that reaching
    // this point did not already establish.
    io.log("release is already published and correct — nothing to do.");
    return { result: "noop", canonical };
  }

  // Re-query the mutable remote (tag + release), rebuild facts with the last observed phase, and
  // re-evaluate. Asserts the action is the one the progression expects, or fails closed.
  const reeval = async (expect) => {
    const facts = mkIntegrityFacts(mkIdentityFacts(rel, await io.probe(rel.version)), canonical, lastPhase, expected);
    const r = evaluateReleaseIntegrity(facts);
    lastPhase = r.phase;
    if (expect && r.action !== expect) throw new PolicyError(`after re-query expected action=${expect}, got ${r.action}`);
    return r;
  };

  if (integ.action === "create-draft") {
    await io.createDraft(canonical);
    io.log("created empty draft.");
    integ = await reeval("resume-draft");
  }

  if (integ.action === "resume-draft") {
    if (integ.assetAction !== "upload") throw new PolicyError(`resume-draft with assetAction=${integ.assetAction}, expected upload`);
    await io.uploadAssets(canonical.version, built);
    io.log("uploaded both assets to the draft.");
    integ = await reeval("publish-draft");
  }

  if (integ.action !== "publish-draft") throw new PolicyError(`unexpected action before publish: ${integ.action}`);

  // Download the draft's own assets through the authenticated API, verify their REST digest + exact
  // bytes against what we built, then install-verify. All reads/local — no remote write.
  await io.downloadAndVerify(canonical.version, expected);
  io.log("draft assets downloaded, digest + bytes + install verified.");

  // Adjacent-to-publish re-query. Nothing below writes to the remote until publish, so this is the
  // last observation before the release goes public.
  integ = await reeval("publish-draft");
  await io.publish(canonical.version);
  io.log(`published v${canonical.version}.`);

  await io.postPublish(rel, canonical, expected);
  return { result: "published", canonical };
}

// ------------------------------------------------------------------ production io (real git/gh/uv)

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...opts });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", error: r.error };
}

function must(cmd, args, label, opts = {}) {
  const r = run(cmd, args, opts);
  if (r.error) throw new InputError(`${label}: could not run ${cmd} (${r.error.message})`);
  if (r.status !== 0) throw new PolicyError(`${label} failed (exit ${r.status}): ${(r.stderr || r.stdout).trim()}`);
  return r.stdout;
}

const BRIDGE_DIR = "plugins/learn-kit/nlm-bridge";
const BUILD_CONSTRAINTS = `${BRIDGE_DIR}/constraints/build-hatchling-1.27.0-py312.txt`;

export function productionIo() {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo || !/^[^/]+\/[^/]+$/.test(repo)) throw new InputError("GITHUB_REPOSITORY (owner/repo) is required");
  const tmp = process.env.RUNNER_TEMP && fs.existsSync(process.env.RUNNER_TEMP) ? process.env.RUNNER_TEMP : os.tmpdir();

  return {
    log: (m) => process.stdout.write(`release: ${m}\n`),

    async resolveRelease() {
      const releaseSha = process.env.RELEASE_SHA;
      if (!isSha(releaseSha)) throw new InputError("RELEASE_SHA must be a 40-character lowercase hex SHA");

      // Fetch main once and pin its tip; later tag fetches must not move what we treat as the tip.
      must("git", ["fetch", "--no-tags", "origin", "main"], "fetch origin main");
      const mainTipSha = must("git", ["rev-parse", "FETCH_HEAD"], "read main tip").trim();
      const ancestor = run("git", ["merge-base", "--is-ancestor", releaseSha, mainTipSha]);
      if (ancestor.error) throw new InputError(`git merge-base: ${ancestor.error.message}`);
      const releaseShaIsMainAncestor = ancestor.status === 0;

      const version = must("git", ["show", `${releaseSha}:VERSION`], "read VERSION at release SHA").trim();
      const changelog = must("git", ["show", `${releaseSha}:CHANGELOG.md`], "read CHANGELOG at release SHA");
      const targetNotes = extractChangelogSection(changelog, version);

      return {
        releaseSha,
        mainTipSha,
        releaseShaIsMainAncestor,
        version,
        targetCommitVersion: version,
        targetNotes,
        immutabilityEnabled: this._probeImmutability(repo),
      };
    },

    // Repo-level immutable-releases is read-only and best-effort: an unknown field or an API hiccup
    // must NOT claim immutability. Default false; only a clearly-true signal enables the post-publish
    // attestation check.
    _probeImmutability(repository) {
      const r = run("gh", ["api", `repos/${repository}`, "--jq", ".immutable_releases // false"]);
      return r.status === 0 && r.stdout.trim() === "true";
    },

    async probe(version) {
      const tagRef = `refs/tags/v${version}`;
      const ls = run("git", ["ls-remote", "--exit-code", "origin", tagRef]);
      // ls-remote: exit 0 = present, exit 2 = the ref is absent, anything else = a real failure.
      let tag;
      if (ls.status === 0) {
        const peeled = run("git", ["ls-remote", "origin", `${tagRef}^{}`]).stdout.trim().split(/\s+/)[0];
        const direct = ls.stdout.trim().split(/\s+/)[0];
        tag = { present: true, sha: peeled || direct };
      } else if (ls.status === 2) {
        tag = { present: false };
      } else {
        throw new PolicyError(`git ls-remote for ${tagRef} failed (exit ${ls.status}): ${(ls.stderr || "").trim()}`);
      }

      // Releases (incl. drafts) come from the list endpoint: GET /releases/tags/{tag} never returns
      // a draft, and a draft has no git tag yet.
      const rel = must("gh", ["api", "--paginate", `repos/${repo}/releases`], "list releases");
      let releases;
      try {
        releases = JSON.parse(rel);
      } catch (e) {
        throw new InputError(`releases response was not JSON: ${e.message}`);
      }
      return { tag, release: parseReleaseFromList(releases, version) };
    },

    async build(sha) {
      // Build from the canonical tree. The orchestrator + evaluator are already loaded from the
      // triggering commit, so this detach only changes what uv reads, not the code deciding things.
      must("git", ["checkout", "--detach", "--force", sha], "checkout canonical commit");
      const epoch = must("git", ["log", "-1", "--format=%ct", sha], "read canonical commit epoch").trim();
      const outDir = fs.mkdtempSync(path.join(tmp, "release-wheel-"));
      must(
        "uv",
        ["build", "--wheel", "--build-constraints", BUILD_CONSTRAINTS, "--require-hashes", "--no-config", "--out-dir", outDir, BRIDGE_DIR],
        "uv build wheel",
        { env: { ...process.env, SOURCE_DATE_EPOCH: epoch } },
      );
      const wheelPath = path.join(outDir, WHEEL_NAME);
      const wheelBuf = fs.readFileSync(wheelPath);
      const wheelSha = sha256Hex(wheelBuf);
      const checksumBytes = checksumAssetBytes(wheelSha); // single source of the exact bytes
      const checksumPath = path.join(outDir, CHECKSUM_NAME);
      fs.writeFileSync(checksumPath, checksumBytes, { encoding: "utf8" });
      return {
        wheelPath,
        checksumPath,
        wheel: { name: WHEEL_NAME, size: wheelBuf.length, rawSha256: wheelSha },
        checksum: { name: CHECKSUM_NAME, size: Buffer.byteLength(checksumBytes, "utf8"), rawSha256: sha256Hex(Buffer.from(checksumBytes, "utf8")) },
      };
    },

    async createDraft(canonical) {
      const notesPath = path.join(tmp, `release-notes-v${canonical.version}.md`);
      fs.writeFileSync(notesPath, canonical.notes, { encoding: "utf8" });
      must(
        "gh",
        ["release", "create", `v${canonical.version}`, "--draft", "--title", `v${canonical.version}`, "--notes-file", notesPath, "--target", canonical.sha],
        "create draft release",
      );
    },

    async uploadAssets(version, built) {
      must("gh", ["release", "upload", `v${version}`, built.wheelPath, built.checksumPath], "upload release assets");
    },

    async downloadAndVerify(version, expected) {
      const dir = fs.mkdtempSync(path.join(tmp, "release-download-"));
      must("gh", ["release", "download", `v${version}`, "--dir", dir, "--pattern", expected.wheel.name, "--pattern", expected.checksum.name], "download draft assets");

      // Re-derive the REST digest of each asset from the release facts and compare to the built
      // digest, then the on-disk bytes, then install-verify. Belt and suspenders before publish.
      const rel = must("gh", ["api", "--paginate", `repos/${repo}/releases`], "re-list releases for digest check");
      const release = parseReleaseFromList(JSON.parse(rel), version);
      verifyAssetDigests(release, expected, (name) => sha256Hex(fs.readFileSync(path.join(dir, name))));

      const summary = await verifyReleaseInstall({
        wheelPath: path.join(dir, expected.wheel.name),
        checksumPath: path.join(dir, expected.checksum.name),
      });
      this.log(`install-verify ok: Python ${summary.python_version}, receipt ${summary.install_receipt_sha256.slice(0, 12)}`);
      fs.rmSync(dir, { recursive: true, force: true });
    },

    async publish(version) {
      must("gh", ["release", "edit", `v${version}`, "--draft=false"], "publish draft release");
    },

    async postPublish(rel, canonical, expected) {
      const { release } = await this.probe(canonical.version);
      if (!release.present || release.isDraft) throw new PolicyError("post-publish: the release is not published");

      if (rel.immutabilityEnabled) {
        if (release.isImmutable !== true) throw new PolicyError("immutable releases are enabled but the published release is not immutable");
        const v = run("gh", ["release", "verify", `v${canonical.version}`, "--repo", repo]);
        if (v.status !== 0) this.log(`WARNING: gh release verify was inconclusive (exit ${v.status}): ${(v.stderr || v.stdout).trim()}`);
        else this.log("immutability attestation verified.");
      } else {
        this.log("immutable releases not enabled on this repo — not claiming immutability.");
      }

      // Final, WARN-ONLY: the production installer, un-injected, against the two public URLs. The
      // release is already public and MUST NOT be repaired in place — a failure here is announced
      // and fixed by a new patch, never by mutating the published assets.
      const r = run("node", ["plugins/learn-kit/scripts/install-nlm-bridge.mjs", "install",
        "--wheel-url", `https://github.com/${repo}/releases/download/v${canonical.version}/${expected.wheel.name}`,
        "--checksum-url", `https://github.com/${repo}/releases/download/v${canonical.version}/${expected.checksum.name}`]);
      if (r.status === 0) {
        this.log("final public-URL production install succeeded.");
        run("node", ["plugins/learn-kit/scripts/install-nlm-bridge.mjs", "uninstall"]);
      } else {
        this.log(`::warning::final public-URL production install did NOT succeed (exit ${r.status}). The release is published and must not be patched in place; fix via a new patch version.\n${(r.stderr || r.stdout).trim()}`);
      }
    },
  };
}

// ------------------------------------------------------------------------------ CLI

function fail(msg, code) {
  process.stderr.write(`run-release: ${msg}\n`);
  return code;
}

async function main() {
  try {
    const summary = await runRelease(productionIo());
    process.stdout.write(JSON.stringify({ ok: true, ...summary }) + "\n");
    return 0;
  } catch (e) {
    if (e instanceof PolicyError) return fail(e.message, 1);
    if (e instanceof InputError) return fail(e.message, 2);
    return fail(`unexpected: ${e.stack || e.message}`, 2);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  main().then((code) => process.exit(code));
}
