#!/usr/bin/env node
// Release state / identity / integrity evaluator (plan §2.4).
//
//   node scripts/resolve-release-state.mjs --tag-exists true --release-exists false
//   node scripts/resolve-release-state.mjs --identity-facts-file <facts.json>
//   node scripts/resolve-release-state.mjs --facts-file <facts.json>
//
// Exit 0 = ok, 1 = identity/integrity/state violation, 2 = bad input.
//
// Node stdlib only. This is the SINGLE place release business rules live: the workflow
// gathers facts and performs writes, and copies no phase-transition, digest-normalisation or
// canonical-selection logic into shell.
//
// THE CIRCULARITY THIS SPLIT EXISTS TO BREAK: you cannot know the expected asset digests
// until you have built, and you cannot build until you know which commit is canonical. So
// identity is settled FIRST, alone, from remote+commit facts (evaluateReleaseIdentity). The
// workflow then builds from that commit, and only then submits the full picture
// (evaluateReleaseIntegrity), which re-derives identity itself and demands the caller's
// expectation still matches.
//
// PHASE IS NOT IDENTITY. `phase` is live remote state and legitimately moves
// initial -> draft -> published across a single run. Only `canonicalIdentity` is stable, so
// only it is bound across stages. Binding phase would make the run fail the instant it
// succeeded at its own first step.

const WHEEL_NAME = "learn_kit_nlm_bridge-4.0.0-py3-none-any.whl";
const CHECKSUM_NAME = `${WHEEL_NAME}.sha256`;

const SHA_RE = /^[0-9a-f]{40}$/;
const HEX256_RE = /^[0-9a-f]{64}$/;
const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

const PHASES = ["initial", "draft", "published"];
// Allowed: stay put, or advance one step. A run may legitimately re-observe the same phase.
const PHASE_TRANSITIONS = new Set(["initial>initial", "draft>draft", "published>published", "initial>draft", "draft>published"]);

/** Bad input shape/type — the caller built the request wrong. Exit 2. */
export class InputError extends Error {}
/** A release rule was violated — the remote state is not what policy allows. Exit 1. */
export class PolicyError extends Error {}

// ------------------------------------------------------------------ small helpers

/** Canonical notes: LF-only, outer whitespace trimmed, inner Markdown untouched. */
export function normalizeNotes(s) {
  if (typeof s !== "string") throw new InputError("notes must be a string");
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

/**
 * GitHub REST asset `digest`. Exactly one accepted spelling: "sha256:<64 lowercase hex>".
 * Any other algorithm, casing, length, or absence is a failure — never a soft pass.
 */
export function parseAssetDigest(digest) {
  if (typeof digest !== "string") return null;
  if (!digest.startsWith("sha256:")) return null;
  const hex = digest.slice("sha256:".length); // strip once, deliberately not a global replace
  return HEX256_RE.test(hex) ? hex : null;
}

/** The checksum asset's exact bytes: UTF-8, no BOM, LF only, exactly one trailing newline. */
export function checksumAssetBytes(wheelSha256) {
  if (!HEX256_RE.test(String(wheelSha256))) throw new InputError("wheel sha256 must be 64 lowercase hex");
  return `${wheelSha256}  ${WHEEL_NAME}\n`;
}

function requireSha(name, v) {
  if (typeof v !== "string" || !SHA_RE.test(v)) throw new InputError(`${name} must be a 40-char lowercase hex SHA (got ${JSON.stringify(v)})`);
}
function requireBool(name, v) {
  if (typeof v !== "boolean") throw new InputError(`${name} must be a boolean (got ${JSON.stringify(v)})`);
}
function requireSemver(name, v) {
  if (typeof v !== "string" || !SEMVER_RE.test(v)) throw new InputError(`${name} must be exactly X.Y.Z (got ${JSON.stringify(v)})`);
}

// ------------------------------------------------------------------ structural state

/**
 * Pure structural classification. Deliberately does NOT judge: "release-only" is a legal
 * draft-in-progress, and calling it an error here would break the draft-first flow.
 */
export function resolveReleaseState(tagExists, releaseExists) {
  requireBool("tagExists", tagExists);
  requireBool("releaseExists", releaseExists);
  if (!tagExists && !releaseExists) return "none";
  if (tagExists && !releaseExists) return "tag-only";
  if (!tagExists && releaseExists) return "release-only";
  return "both";
}

// ------------------------------------------------------------------ identity

/**
 * @param {object} f identity facts:
 *   version, releaseSha, mainTipSha, releaseShaIsMainAncestor,
 *   targetCommitVersion, targetNotes, immutabilityEnabled,
 *   tag: { present, sha?, isMainAncestor?, taggedCommitVersion?, taggedNotes? },
 *   release: { present, id?, tag?, name?, targetCommitish?, isDraft?, isPrerelease?, body?, isImmutable?, assets? }
 * @returns {{ phase: "initial"|"draft"|"published", canonicalIdentity: { sha, version, notes } }}
 */
export function evaluateReleaseIdentity(f) {
  if (!f || typeof f !== "object") throw new InputError("identity facts must be an object");

  requireSemver("version", f.version);
  requireSha("releaseSha", f.releaseSha);
  requireSha("mainTipSha", f.mainTipSha);
  requireBool("releaseShaIsMainAncestor", f.releaseShaIsMainAncestor);
  requireSemver("targetCommitVersion", f.targetCommitVersion);
  if (!f.tag || typeof f.tag !== "object") throw new InputError("tag facts must be an object");
  if (!f.release || typeof f.release !== "object") throw new InputError("release facts must be an object");
  requireBool("tag.present", f.tag.present);
  requireBool("release.present", f.release.present);

  const notes = normalizeNotes(f.targetNotes);

  // --- policy: the commit must actually be releasable
  if (!f.releaseShaIsMainAncestor) throw new PolicyError(`releaseSha ${f.releaseSha} is not an ancestor of main`);
  if (f.targetCommitVersion !== f.version) {
    throw new PolicyError(`VERSION at ${f.releaseSha} is ${f.targetCommitVersion}, but the release claims ${f.version}`);
  }
  if (notes === "") throw new PolicyError(`the CHANGELOG section at ${f.releaseSha} is empty — nothing to publish as notes`);

  // --- policy: an existing tag must be THIS commit's tag, not an older ancestor's
  if (f.tag.present) {
    requireSha("tag.sha", f.tag.sha);
    if (f.tag.sha !== f.releaseSha) {
      throw new PolicyError(`tag v${f.version} peels to ${f.tag.sha}, not the canonical ${f.releaseSha}`);
    }
    if (f.tag.taggedCommitVersion !== undefined && f.tag.taggedCommitVersion !== f.version) {
      throw new PolicyError(`tagged commit VERSION ${f.tag.taggedCommitVersion} != ${f.version}`);
    }
  }

  // --- phase, and the release's own binding to the canonical commit
  let phase = "initial";
  if (f.release.present) {
    requireBool("release.isDraft", f.release.isDraft);
    phase = f.release.isDraft ? "draft" : "published";
    if (f.release.targetCommitish !== undefined && f.release.targetCommitish !== f.releaseSha) {
      throw new PolicyError(`release targetCommitish ${f.release.targetCommitish} does not point at the canonical ${f.releaseSha}`);
    }
  }

  return { phase, canonicalIdentity: { sha: f.releaseSha, version: f.version, notes } };
}

// ------------------------------------------------------------------ assets

function classifyAssets(assets, expected) {
  if (!Array.isArray(assets)) throw new InputError("release.assets must be an array");

  const wanted = new Map([
    [expected.wheel.name, expected.wheel],
    [expected.checksum.name, expected.checksum],
  ]);

  const seen = new Map();
  for (const a of assets) {
    if (!a || typeof a !== "object" || typeof a.name !== "string") throw new InputError("each asset needs a string name");
    // An asset the workflow never intended to publish means someone else wrote to this
    // draft. Refuse rather than reconcile.
    if (!wanted.has(a.name)) throw new PolicyError(`unexpected asset on the release: ${a.name}`);
    if (seen.has(a.name)) throw new PolicyError(`duplicate asset: ${a.name}`);
    seen.set(a.name, a);
  }

  if (seen.size === 0) return "absent";

  // A half-uploaded draft is not resumable by re-uploading: we cannot tell a truncated
  // upload from a foreign one. Fail and let a human look.
  if (seen.size !== wanted.size) {
    throw new PolicyError(`partial assets: found ${[...seen.keys()].join(", ")}, expected ${[...wanted.keys()].join(", ")}`);
  }

  for (const [name, exp] of wanted) {
    const a = seen.get(name);
    if (a.state !== "uploaded") throw new PolicyError(`asset ${name} is in state ${JSON.stringify(a.state)}, not "uploaded"`);
    if (a.size !== exp.size) throw new PolicyError(`asset ${name} size ${a.size} != expected ${exp.size}`);
    const hex = parseAssetDigest(a.digest);
    if (hex === null) throw new PolicyError(`asset ${name} digest ${JSON.stringify(a.digest)} is not a canonical "sha256:<64 lowercase hex>"`);
    if (hex !== exp.rawSha256) throw new PolicyError(`asset ${name} digest ${hex} != expected ${exp.rawSha256}`);
  }

  return "correct";
}

function requireExpectedAssets(e) {
  if (!e || typeof e !== "object") throw new InputError("expectedAssets must be an object");
  for (const [key, name] of [["wheel", WHEEL_NAME], ["checksum", CHECKSUM_NAME]]) {
    const a = e[key];
    if (!a || typeof a !== "object") throw new InputError(`expectedAssets.${key} must be an object`);
    if (a.name !== name) throw new InputError(`expectedAssets.${key}.name must be ${name} (got ${JSON.stringify(a.name)})`);
    if (!Number.isInteger(a.size) || a.size <= 0) throw new InputError(`expectedAssets.${key}.size must be a positive integer`);
    if (!HEX256_RE.test(String(a.rawSha256))) throw new InputError(`expectedAssets.${key}.rawSha256 must be 64 lowercase hex`);
  }
}

// ------------------------------------------------------------------ integrity

/**
 * @returns {{ phase, action: "create-draft"|"resume-draft"|"publish-draft"|"noop",
 *             assetAction: "upload"|"noop", canonicalIdentity }}
 */
export function evaluateReleaseIntegrity(f) {
  if (!f || typeof f !== "object") throw new InputError("facts must be an object");

  // Re-derive identity here rather than trusting what the caller carried over. The caller's
  // expectation is then checked against it — not the other way round.
  const fresh = evaluateReleaseIdentity(f);

  const exp = f.expectedCanonicalIdentity;
  if (!exp || typeof exp !== "object") throw new InputError("expectedCanonicalIdentity is required");
  const c = fresh.canonicalIdentity;
  if (exp.sha !== c.sha || exp.version !== c.version || normalizeNotes(exp.notes) !== c.notes) {
    throw new PolicyError(
      `canonical identity moved under this run: expected ${exp.version}@${exp.sha}, now ${c.version}@${c.sha}` +
        (normalizeNotes(exp.notes) !== c.notes ? " (release notes also differ)" : ""),
    );
  }

  if (!PHASES.includes(f.priorPhase)) throw new InputError(`priorPhase must be one of ${PHASES.join("|")} (got ${JSON.stringify(f.priorPhase)})`);
  if (!PHASE_TRANSITIONS.has(`${f.priorPhase}>${fresh.phase}`)) {
    throw new PolicyError(`illegal phase transition ${f.priorPhase} -> ${fresh.phase}`);
  }

  requireExpectedAssets(f.expectedAssets);

  const state = resolveReleaseState(f.tag.present, f.release.present);

  if (fresh.phase === "initial") {
    // Nothing published yet. Only two shapes can start a release.
    if (state === "none") {
      // Racing a moving main would tag a commit that is not the tip anyone reviewed.
      if (f.releaseSha !== f.mainTipSha) {
        throw new PolicyError(`releaseSha ${f.releaseSha} is not main's tip ${f.mainTipSha}; refusing to start a release from a stale commit`);
      }
      return { phase: fresh.phase, action: "create-draft", assetAction: "noop", canonicalIdentity: c };
    }
    // tag-only: a previous run tagged then died. The tag already peeled to canonical in
    // evaluateReleaseIdentity, so recovery is safe.
    if (state === "tag-only") {
      return { phase: fresh.phase, action: "create-draft", assetAction: "noop", canonicalIdentity: c };
    }
    throw new PolicyError(`unreachable structural state ${state} while phase=initial`);
  }

  const assets = classifyAssets(f.release.assets, f.expectedAssets);

  if (fresh.phase === "draft") {
    if (f.release.tag !== `v${c.version}`) throw new PolicyError(`draft tag ${JSON.stringify(f.release.tag)} != v${c.version}`);
    if (f.release.name !== `v${c.version}`) throw new PolicyError(`draft name ${JSON.stringify(f.release.name)} != v${c.version}`);
    if (normalizeNotes(f.release.body) !== c.notes) throw new PolicyError("draft body does not match the canonical release notes");
    if (f.release.isPrerelease !== false) throw new PolicyError("draft is marked prerelease");

    if (assets === "absent") return { phase: fresh.phase, action: "resume-draft", assetAction: "upload", canonicalIdentity: c };
    return { phase: fresh.phase, action: "publish-draft", assetAction: "noop", canonicalIdentity: c };
  }

  // published: verify only. A published asset is never re-uploaded, overwritten or deleted —
  // the fix for a bad publish is a new patch version, not mutation of a public artifact.
  if (!f.tag.present) throw new PolicyError("published release has no tag");
  if (f.release.tag !== `v${c.version}`) throw new PolicyError(`published tag ${JSON.stringify(f.release.tag)} != v${c.version}`);
  if (normalizeNotes(f.release.body) !== c.notes) throw new PolicyError("published body does not match the canonical release notes");
  if (assets !== "correct") throw new PolicyError(`published release has ${assets} assets; publishing cannot be repaired in place`);
  return { phase: fresh.phase, action: "noop", assetAction: "noop", canonicalIdentity: c };
}

// ------------------------------------------------------------------------------ CLI

import fs from "node:fs";

function fail(msg, code) {
  process.stderr.write(`resolve-release-state: ${msg}\n`);
  return code;
}

function readFacts(p) {
  let raw;
  try {
    raw = fs.readFileSync(p, "utf8");
  } catch (e) {
    throw new InputError(`cannot read ${p}: ${e.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new InputError(`${p} is not valid JSON: ${e.message}`);
  }
}

function parseBoolFlag(v, flag) {
  if (v === "true") return true;
  if (v === "false") return false;
  throw new InputError(`${flag} must be literally true or false (got ${JSON.stringify(v)})`);
}

function main(argv) {
  try {
    const a = {};
    for (let i = 0; i < argv.length; i++) {
      const k = argv[i];
      if (!["--tag-exists", "--release-exists", "--identity-facts-file", "--facts-file"].includes(k)) {
        throw new InputError(`unknown argument: ${k}`);
      }
      const v = argv[++i];
      if (v === undefined) throw new InputError(`${k} requires a value`);
      a[k] = v;
    }

    const modes = [
      a["--facts-file"] !== undefined,
      a["--identity-facts-file"] !== undefined,
      a["--tag-exists"] !== undefined || a["--release-exists"] !== undefined,
    ].filter(Boolean).length;
    if (modes !== 1) throw new InputError("choose exactly one of --tag-exists/--release-exists, --identity-facts-file, --facts-file");

    if (a["--facts-file"] !== undefined) {
      const r = evaluateReleaseIntegrity(readFacts(a["--facts-file"]));
      process.stdout.write(JSON.stringify(r) + "\n");
      return 0;
    }
    if (a["--identity-facts-file"] !== undefined) {
      const r = evaluateReleaseIdentity(readFacts(a["--identity-facts-file"]));
      process.stdout.write(JSON.stringify(r) + "\n");
      return 0;
    }
    if (a["--tag-exists"] === undefined || a["--release-exists"] === undefined) {
      throw new InputError("--tag-exists and --release-exists must be given together");
    }
    // Success stdout for the boolean CLI is the bare classification, nothing else.
    process.stdout.write(resolveReleaseState(parseBoolFlag(a["--tag-exists"], "--tag-exists"), parseBoolFlag(a["--release-exists"], "--release-exists")) + "\n");
    return 0;
  } catch (e) {
    if (e instanceof PolicyError) return fail(e.message, 1);
    if (e instanceof InputError) return fail(e.message, 2);
    return fail(`unexpected: ${e.message}`, 2);
  }
}

if (process.argv[1]?.endsWith("resolve-release-state.mjs")) {
  process.exit(main(process.argv.slice(2)));
}
