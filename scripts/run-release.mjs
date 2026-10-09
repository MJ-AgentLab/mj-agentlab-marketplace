#!/usr/bin/env node
// Draft-first Git/tag release. Verify the canonical install and re-query immediately before publication.
// No build, upload, overwrite or deletion of release assets.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  evaluateReleaseIdentity,
  evaluateReleaseIntegrity,
  PolicyError,
  InputError,
} from "./resolve-release-state.mjs";
import { verifyReleaseInstall } from "./release-verify-install.mjs";

const SHA_RE = /^[0-9a-f]{40}$/;
const isSha = (v) => typeof v === "string" && SHA_RE.test(v);

// Backoff for the post-createDraft releases-list-visibility poll. GitHub's releases list is eventually
// consistent, so the draft this run just created can be briefly absent from `gh api .../releases`.
// 6 probes total (1 immediate re-query + these 5 backed-off retries), ~30s of tolerance for the list
// to catch up before failing closed. Exported so the tests bound their assertions to it, not a literal.
export const DRAFT_VISIBILITY_BACKOFF_MS = [1000, 2000, 4000, 8000, 15000];

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

export function mkIntegrityFacts(idFacts, canonical, priorPhase) {
  return { ...idFacts, expectedCanonicalIdentity: canonical, priorPhase };
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
  if (!Array.isArray(r.assets)) throw new InputError("release assets response must be an array; unknown asset state cannot prove an empty release");
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
    assets: r.assets.map((a) => ({ id: a.id, name: a.name, state: a.state, size: a.size, digest: a.digest ?? null })),
  };
}

export async function runRelease(io) {
  const rel = await io.resolveRelease();

  // --- Stage 1: identity, from the first remote probe.
  const idFacts = mkIdentityFacts(rel, await io.probe(rel.version));
  const id = evaluateReleaseIdentity(idFacts);
  const canonical = id.canonicalIdentity;
  io.log(`canonical: v${canonical.version}@${canonical.sha.slice(0, 12)}  phase=${id.phase}`);

  let lastPhase = id.phase;
  let integ = evaluateReleaseIntegrity(mkIntegrityFacts(idFacts, canonical, lastPhase));
  lastPhase = integ.phase;
  io.log(`action=${integ.action}`);

  if (integ.action === "noop") {
    // The integrity evaluator only returns noop for a published release whose tag, body and both
    // source identity already verifies. There is nothing left to do — and nothing to re-verify that reaching
    // this point did not already establish.
    io.log("release is already published and correct — nothing to do.");
    return { result: "noop", canonical };
  }

  // Re-query the mutable remote (tag + release), rebuild facts with the last observed phase, and
  // re-evaluate. Asserts the action is the one the progression expects, or fails closed.
  const reeval = async (expect) => {
    const facts = mkIntegrityFacts(mkIdentityFacts(rel, await io.probe(rel.version)), canonical, lastPhase);
    const r = evaluateReleaseIntegrity(facts);
    lastPhase = r.phase;
    if (expect && r.action !== expect) throw new PolicyError(`after re-query expected action=${expect}, got ${r.action}`);
    return r;
  };

  // After createDraft, GitHub's releases list is eventually consistent: the draft this run just created
  // can be briefly absent from `gh api .../releases`, during which the evaluator still reads "no release"
  // and returns create-draft (phase=initial). Poll with backoff until it flips to publish-draft. ONLY that
  // one transient action is tolerated — an evaluator throw (a foreign or mismatched draft) or any other
  // action propagates immediately, and exhausting the budget fails closed too. Without this, the FIRST run
  // of every release loses the create->re-query race and fails closed, needing a manual re-dispatch. This
  // never risks a wrong publish: it only waits for a draft this run itself created to become observable.
  const settleAfterCreate = async () => {
    for (let attempt = 0; ; attempt++) {
      const r = evaluateReleaseIntegrity(mkIntegrityFacts(mkIdentityFacts(rel, await io.probe(rel.version)), canonical, lastPhase));
      if (r.action === "publish-draft") {
        lastPhase = r.phase;
        return r;
      }
      if (r.action !== "create-draft") {
        throw new PolicyError(`after createDraft expected publish-draft (or the transient create-draft while the releases list catches up), got ${r.action}`);
      }
      if (attempt >= DRAFT_VISIBILITY_BACKOFF_MS.length) {
        const waited = Math.round(DRAFT_VISIBILITY_BACKOFF_MS.reduce((a, b) => a + b, 0) / 1000);
        throw new PolicyError(`the draft created for v${canonical.version} never appeared in the releases list after ${attempt + 1} probes (~${waited}s of backoff); failing closed — inspect and delete the draft, then re-run`);
      }
      // Do NOT advance lastPhase here: the phase legitimately has not moved (the draft is not yet
      // observable), so the eventual initial->draft transition must stay valid on the next probe.
      io.log(`draft for v${canonical.version} not visible in the releases list yet; waiting ${DRAFT_VISIBILITY_BACKOFF_MS[attempt]}ms (probe ${attempt + 1}/${DRAFT_VISIBILITY_BACKOFF_MS.length + 1})`);
      await io.sleep(DRAFT_VISIBILITY_BACKOFF_MS[attempt]);
    }
  };

  if (integ.action === "create-draft") {
    await io.createDraft(canonical);
    io.log("created empty draft.");
    integ = await settleAfterCreate();
  }

  if (integ.action !== "publish-draft") throw new PolicyError(`unexpected action before publish: ${integ.action}`);

  const install = await io.verifyInstall(canonical);
  if (install?.ok !== true) throw new PolicyError("canonical installation verification did not succeed");
  io.log("canonical Git tree installation verified.");

  // Adjacent-to-publish re-query. Nothing below writes to the remote until publish, so this is the
  // last observation before the release goes public.
  integ = await reeval("publish-draft");
  await io.publish(canonical.version);
  io.log(`published v${canonical.version}.`);

  await io.postPublish(rel, canonical);
  return { result: "published", canonical };
}

// ------------------------------------------------------------------ production io (real git/gh)

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

export function productionIo() {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo || !/^[^/]+\/[^/]+$/.test(repo)) throw new InputError("GITHUB_REPOSITORY (owner/repo) is required");
  const tmp = process.env.RUNNER_TEMP && fs.existsSync(process.env.RUNNER_TEMP) ? process.env.RUNNER_TEMP : os.tmpdir();

  return {
    log: (m) => process.stdout.write(`release: ${m}\n`),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

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

    async createDraft(canonical) {
      const notesPath = path.join(tmp, `release-notes-v${canonical.version}.md`);
      fs.writeFileSync(notesPath, canonical.notes, { encoding: "utf8" });
      must(
        "gh",
        ["release", "create", `v${canonical.version}`, "--draft", "--title", `v${canonical.version}`, "--notes-file", notesPath, "--target", canonical.sha],
        "create draft release",
      );
    },

    async verifyInstall(canonical) {
      return await verifyReleaseInstall({ canonicalSha: canonical.sha });
    },

    async publish(version) {
      must("gh", ["release", "edit", `v${version}`, "--draft=false"], "publish draft release");
    },

    async postPublish(rel, canonical) {
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

      evaluateReleaseIntegrity(mkIntegrityFacts(mkIdentityFacts(rel, await this.probe(canonical.version)), canonical, "published"));
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
