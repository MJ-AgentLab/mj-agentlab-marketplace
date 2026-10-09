#!/usr/bin/env node
// Git/tag-only release identity and draft-first state evaluator. Existing public versions are immutable.
// Exit 0: valid; 1: policy violation; 2: bad input. Node stdlib only.

const SHA_RE = /^[0-9a-f]{40}$/;
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

/**
 * @returns {{ phase, action: "create-draft"|"publish-draft"|"noop",
 *             assetAction: "noop", canonicalIdentity }}
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

  if (!Array.isArray(f.release.assets)) throw new InputError("release.assets must be an array");
  if (f.release.assets.length !== 0) throw new PolicyError("unexpected assets: new releases are distributed only through Git and tags; existing published assets must remain untouched");

  if (fresh.phase === "draft") {
    if (f.release.tag !== `v${c.version}`) throw new PolicyError(`draft tag ${JSON.stringify(f.release.tag)} != v${c.version}`);
    if (f.release.name !== `v${c.version}`) throw new PolicyError(`draft name ${JSON.stringify(f.release.name)} != v${c.version}`);
    if (normalizeNotes(f.release.body) !== c.notes) throw new PolicyError("draft body does not match the canonical release notes");
    if (f.release.isPrerelease !== false) throw new PolicyError("draft is marked prerelease");

    if (!f.tag.present && f.release.targetCommitish !== c.sha) throw new PolicyError("draft without a tag needs an exact canonical target SHA");
    return { phase: fresh.phase, action: "publish-draft", assetAction: "noop", canonicalIdentity: c };
  }

  // published: verify only. A published asset is never re-uploaded, overwritten or deleted —
  // the fix for a bad publish is a new patch version, not mutation of a public artifact.
  if (!f.tag.present) throw new PolicyError("published release has no tag");
  if (f.release.tag !== `v${c.version}`) throw new PolicyError(`published tag ${JSON.stringify(f.release.tag)} != v${c.version}`);
  if (normalizeNotes(f.release.body) !== c.notes) throw new PolicyError("published body does not match the canonical release notes");
  if (f.release.name !== `v${c.version}` || f.release.isPrerelease !== false) throw new PolicyError("published release metadata differs from the canonical release");
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
