#!/usr/bin/env node
// A6 gate — root CLAUDE.md sync-allowlist enforcement (plan §2.4; Framework §2.7 + §4.3.1).
//
//   A6_BASE_SHA=<sha> A6_HEAD_SHA=<sha> A6_PR_TITLE=<title> A6_PR_AUTHOR=<login> \
//   A6_REVIEWS_FILE=<json> node scripts/check-a6.mjs
//
// Exit 0 = gate satisfied, 1 = gate blocks, 2 = bad input / the check could not be run.
//
// Node stdlib only, by design: this gate must keep working when the repo's devDependencies
// are absent or themselves under review, so it imports neither `yaml` nor the validator.
//
// WHY THIS EXISTS AS A SCRIPT AND NOT A SHELL STEP — every item below was a live defect in
// the ci.yml step this replaces:
//
//   1. `[skip a6]` in the PR title exited 0 on the spot. The reviewer sign-off that §4.3.1
//      requires was echoed as a reminder and never verified, so any author could clear the
//      gate by titling their own PR.
//   2. The PR title was interpolated into the shell via `${{ ... }}`, making a PR title an
//      arbitrary command-execution vector on the runner.
//   3. The diff used a two-dot range. Once the base branch moved ahead with its own
//      CLAUDE.md edit, that edit showed up in BASE..HEAD and satisfied the gate for a PR
//      that never touched CLAUDE.md.
//   4. `--name-only` cannot tell a deletion from an edit, so deleting root CLAUDE.md read
//      as syncing it.
//   5. Newline-split parsing of unquoted paths misreads paths containing newlines.
//
// Inputs arrive as environment variables and are never concatenated into a shell command;
// git is invoked with an argv array and shell:false.

import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SIGNOFF_BODY = "A6 N/A confirmed";
const SKIP_TOKEN = "[skip a6]";
const SIGNOFF_ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
const SHA_RE = /^[0-9a-f]{40}$/i;

// Framework §2.7 categories 1–3, plus the Codex dual-native surfaces this branch adds.
// Anchored on both ends: these are exact repo-relative git paths, never substrings.
const TRIGGERS = [
  // Category 1 — global standards
  /^docs\/rule\/\[STANDARD\]_[^/]+\.md$/,
  // Category 2 — runtime info
  /^VERSION$/,
  /^\.claude-plugin\/marketplace\.json$/,
  /^plugins\/[^/]+\/\.claude-plugin\/plugin\.json$/,
  // Category 3 — directory entries
  /^\.claude\/skills\/mp-[^/]+\/SKILL\.md$/,
  /^plugins\/[^/]+\/skills\/[^/]+\/SKILL\.md$/,
  // Codex dual-native additions
  /^\.agents\/plugins\/marketplace\.json$/,
  /^plugins\/[^/]+\/\.codex-plugin\/plugin\.json$/,
  /^plugins\/[^/]+\/skills\/[^/]+\/agents\/openai\.yaml$/,
  /^plugins\/learn-kit\/\.mcp\.json$/,
  /^plugins\/learn-kit\/nlm-bridge\/.+$/,
  /^plugins\/learn-kit\/scripts\/install-nlm-bridge\.mjs$/,
  /^scripts\/(generate-nlm-contract|probe-learn-kit-nlm-bridge|resolve-release-state)\.mjs$/,
];

export function isA6Trigger(p) {
  if (typeof p !== "string" || p === "") return false;
  return TRIGGERS.some((re) => re.test(p));
}

/**
 * Parse `git diff --name-status --no-renames -z` output.
 * The stream is a flat run of NUL-terminated STATUS, PATH, STATUS, PATH ... tokens.
 */
export function parseNameStatusZ(out) {
  const parts = String(out ?? "").split("\0").filter((s) => s !== "");
  const changes = [];
  for (let i = 0; i < parts.length; ) {
    const raw = parts[i++];
    const status = raw[0];
    // R/C records carry TWO paths. --no-renames means we should never see one; consuming
    // it as a single-path record would desynchronise every record after it, so refuse.
    if (status === "R" || status === "C") {
      throw new Error(`unexpected rename/copy record "${raw}" — --no-renames is required`);
    }
    if (!/^[AMDTUX]$/.test(status)) {
      throw new Error(`unrecognised diff status: ${JSON.stringify(raw)}`);
    }
    const path = parts[i++];
    if (path === undefined) {
      throw new Error(`diff status ${raw} has no path`);
    }
    changes.push({ status, path });
  }
  return changes;
}

/** `gh api` returns one array; `gh api --paginate --slurp` returns an array of arrays. */
export function flattenReviews(parsed) {
  if (!Array.isArray(parsed)) throw new TypeError("reviews must be a JSON array");
  if (parsed.length === 0) return [];
  const pages = parsed.filter(Array.isArray);
  if (pages.length === 0) return parsed;
  if (pages.length !== parsed.length) throw new TypeError("reviews mixes pages and review objects");
  const flat = pages.flat();
  if (flat.some(Array.isArray)) throw new TypeError("reviews is nested more than one level deep");
  return flat;
}

/** Later-review ordering: submitted_at first, id as the tiebreak. */
function reviewOrder(r) {
  const t = Date.parse(r?.submitted_at ?? "");
  return [Number.isNaN(t) ? 0 : t, Number(r?.id) || 0];
}

function isLater(a, b) {
  const [at, ai] = reviewOrder(a);
  const [bt, bi] = reviewOrder(b);
  return at !== bt ? at > bt : ai > bi;
}

/**
 * A valid sign-off is a non-author reviewer of sufficient standing whose LATEST review on
 * the CURRENT head SHA is an approval whose body is exactly the sign-off phrase.
 *
 * Scoping to headSha is what stops an approval from carrying across a force-push, and
 * taking each reviewer's latest is what lets a follow-up CHANGES_REQUESTED revoke it.
 */
function findSignoff(reviews, authorLogin, headSha) {
  const author = String(authorLogin).toLowerCase();
  const latestByUser = new Map();
  for (const r of reviews) {
    if (!r || typeof r !== "object") continue;
    const login = r.user?.login;
    if (typeof login !== "string" || login === "") continue;
    if (r.commit_id !== headSha) continue; // an approval of an older commit is not of this one
    const key = login.toLowerCase();
    const prev = latestByUser.get(key);
    if (!prev || isLater(r, prev)) latestByUser.set(key, r);
  }
  for (const [key, r] of latestByUser) {
    if (key === author) continue; // GitHub blocks self-approval; do not rely on that alone
    if (!SIGNOFF_ASSOCIATIONS.has(String(r.author_association ?? "").toUpperCase())) continue;
    if (String(r.state ?? "").toUpperCase() !== "APPROVED") continue;
    if (String(r.body ?? "").trim() !== SIGNOFF_BODY) continue;
    return r.user.login;
  }
  return null;
}

/**
 * @param {{ changes: {status: string, path: string}[], title: string, reviews: object[],
 *           authorLogin: string, headSha: string }} input
 * @returns {{ ok: boolean, reason: string, triggers: string[], signoffBy?: string }}
 */
export function evaluateA6({ changes, title, reviews, authorLogin, headSha }) {
  if (!Array.isArray(changes)) throw new TypeError("changes must be an array");
  for (const c of changes) {
    if (!c || typeof c.status !== "string" || typeof c.path !== "string") {
      throw new TypeError("each change must be { status: string, path: string }");
    }
  }
  if (typeof title !== "string") throw new TypeError("title must be a string");
  if (!Array.isArray(reviews)) throw new TypeError("reviews must be an array");
  if (typeof authorLogin !== "string") throw new TypeError("authorLogin must be a string");
  if (typeof headSha !== "string" || headSha === "") throw new TypeError("headSha must be a non-empty string");

  const triggers = changes.filter((c) => isA6Trigger(c.path)).map((c) => c.path);
  if (triggers.length === 0) return { ok: true, reason: "no-trigger", triggers };

  // Only an add or a modify counts. A delete (D) removes the file the gate exists to keep
  // current; a typechange (T) swaps it for a symlink. Neither is "CLAUDE.md was updated".
  const synced = changes.some((c) => c.path === "CLAUDE.md" && (c.status === "A" || c.status === "M"));
  if (synced) return { ok: true, reason: "claude-md-synced", triggers };

  if (!title.includes(SKIP_TOKEN)) return { ok: false, reason: "trigger-without-sync", triggers };

  const signoffBy = findSignoff(reviews, authorLogin, headSha);
  if (!signoffBy) return { ok: false, reason: "skip-token-without-signoff", triggers };
  return { ok: true, reason: "skip-token-with-signoff", triggers, signoffBy };
}

// ------------------------------------------------------------------------------ CLI

function fail(msg) {
  process.stderr.write(`check-a6: ${msg}\n`);
  return 2;
}

function readChanges(baseSha, headSha) {
  // Three-dot: compare HEAD against the merge base, so commits the base branch gained
  // after this PR forked are not misread as part of it.
  const out = execFileSync("git", ["diff", "--name-status", "--no-renames", "-z", `${baseSha}...${headSha}`], {
    encoding: "buffer",
    maxBuffer: 64 * 1024 * 1024,
  });
  return parseNameStatusZ(out.toString("utf8"));
}

function main() {
  const baseSha = process.env.A6_BASE_SHA ?? "";
  const headSha = process.env.A6_HEAD_SHA ?? "";
  const title = process.env.A6_PR_TITLE ?? "";
  const authorLogin = process.env.A6_PR_AUTHOR ?? "";
  const reviewsFile = process.env.A6_REVIEWS_FILE ?? "";

  if (!SHA_RE.test(baseSha)) return fail("A6_BASE_SHA must be a 40-character hex SHA");
  if (!SHA_RE.test(headSha)) return fail("A6_HEAD_SHA must be a 40-character hex SHA");
  if (authorLogin === "") return fail("A6_PR_AUTHOR is required");
  if (reviewsFile === "") return fail("A6_REVIEWS_FILE is required");

  let reviews;
  try {
    reviews = flattenReviews(JSON.parse(fs.readFileSync(reviewsFile, "utf8")));
  } catch (e) {
    return fail(`cannot read A6_REVIEWS_FILE (${reviewsFile}): ${e.message}`);
  }

  let changes;
  try {
    changes = readChanges(baseSha, headSha);
  } catch (e) {
    // Never degrade a broken git call into "no triggers found" — that would open the gate.
    return fail(`git diff ${baseSha}...${headSha} failed: ${e.message}`);
  }

  let result;
  try {
    result = evaluateA6({ changes, title, reviews, authorLogin, headSha });
  } catch (e) {
    return fail(e.message);
  }

  const list = result.triggers.map((t) => `  - ${t}`).join("\n");
  switch (result.reason) {
    case "no-trigger":
      process.stdout.write("A6 OK — no §2.7 allowlist trigger files in this PR.\n");
      return 0;
    case "claude-md-synced":
      process.stdout.write(`A6 OK — trigger files present and root CLAUDE.md is updated.\nTriggered files:\n${list}\n`);
      return 0;
    case "skip-token-with-signoff":
      process.stdout.write(
        `A6 BYPASSED — "${SKIP_TOKEN}" in the PR title, signed off by @${result.signoffBy}.\nTriggered files:\n${list}\n`,
      );
      return 0;
    case "skip-token-without-signoff":
      process.stdout.write(
        `::error::A6 FAIL — the PR title carries "${SKIP_TOKEN}" but no reviewer sign-off applies to this commit.\n` +
          `Triggered files:\n${list}\n\n` +
          `A bypass needs BOTH halves (Framework §4.3.1):\n` +
          `  1. "${SKIP_TOKEN}" in the PR title — present.\n` +
          `  2. An APPROVED review of ${headSha.slice(0, 7)} from an OWNER/MEMBER/COLLABORATOR other\n` +
          `     than @${authorLogin}, whose body is exactly: ${SIGNOFF_BODY}\n` +
          `A sign-off given before the latest push does not carry over — re-approve the current commit.\n`,
      );
      return 1;
    case "trigger-without-sync":
      process.stdout.write(
        `::error::A6 FAIL — this PR touches Framework §2.7 sync-allowlist trigger files but root CLAUDE.md is unchanged.\n` +
          `Triggered files:\n${list}\n\n` +
          `Fix, either:\n` +
          `  1. Update root CLAUDE.md to reflect the change (per §2.7); or\n` +
          `  2. Add "${SKIP_TOKEN}" to the PR title AND get a reviewer to approve with the exact\n` +
          `     body: ${SIGNOFF_BODY}\n` +
          `Ref: docs/rule/[STANDARD]_Documentation_Framework.md §2.7 + §4.3.1\n`,
      );
      return 1;
    default:
      return fail(`unhandled result: ${result.reason}`);
  }
}

if (process.argv[1]?.endsWith("check-a6.mjs")) {
  process.exit(main());
}
