// Tests for scripts/check-a6.mjs — the A6 CLAUDE.md sync-allowlist gate.
//
// The rule being enforced (Framework §2.7 + §4.3.1, plan §2.4): a PR that touches an
// allowlist trigger file must also update root CLAUDE.md. The only bypass is a literal
// "[skip a6]" in the PR title AND a reviewer sign-off — and the sign-off half is what
// the previous shell implementation never checked.

import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { spawnSync } from "node:child_process";

import { isA6Trigger, evaluateA6, parseNameStatusZ, flattenReviews } from "../scripts/check-a6.mjs";

const SCRIPT = fileURLToPath(new URL("../scripts/check-a6.mjs", import.meta.url));
const HEAD = "a".repeat(40);
const OLD = "b".repeat(40);

/** A review that WOULD be a valid sign-off, so each test can spoil exactly one field. */
function review(overrides = {}) {
  return {
    id: 100,
    user: { login: "reviewer" },
    author_association: "MEMBER",
    state: "APPROVED",
    body: "A6 N/A confirmed",
    commit_id: HEAD,
    submitted_at: "2026-07-16T10:00:00Z",
    ...overrides,
  };
}

function evalWith(overrides = {}) {
  return evaluateA6({
    changes: [{ status: "M", path: "VERSION" }],
    title: "docs: something [skip a6]",
    reviews: [review()],
    authorLogin: "author",
    headSha: HEAD,
    ...overrides,
  });
}

// ------------------------------------------------------------------ isA6Trigger
test("isA6Trigger matches every §2.7 allowlist category", () => {
  for (const p of [
    "docs/rule/[STANDARD]_Documentation_Framework.md",
    "docs/rule/[STANDARD]_Commit_Message_Convention.md",
    "VERSION",
    ".claude-plugin/marketplace.json",
    "plugins/learn-kit/.claude-plugin/plugin.json",
    "plugins/diagram-kit/.claude-plugin/plugin.json",
    ".claude/skills/mp-doc-validate/SKILL.md",
    "plugins/learn-kit/skills/three-views/SKILL.md",
  ]) {
    assert.equal(isA6Trigger(p), true, `expected trigger: ${p}`);
  }
});

test("isA6Trigger matches the Codex dual-native additions", () => {
  for (const p of [
    ".agents/plugins/marketplace.json",
    "plugins/learn-kit/.codex-plugin/plugin.json",
    "plugins/learn-kit/skills/three-views/agents/openai.yaml",
    "plugins/learn-kit/.mcp.json",
    "plugins/learn-kit/nlm-bridge/pyproject.toml",
    "plugins/learn-kit/nlm-bridge/src/learn_kit_nlm_bridge/bridge.py",
    "plugins/learn-kit/scripts/install-nlm-bridge.mjs",
    "scripts/generate-nlm-contract.mjs",
    "scripts/probe-learn-kit-nlm-bridge.mjs",
    "scripts/resolve-release-state.mjs",
  ]) {
    assert.equal(isA6Trigger(p), true, `expected trigger: ${p}`);
  }
});

test("isA6Trigger ignores non-allowlist paths", () => {
  for (const p of [
    "CLAUDE.md", // the sync target itself is not a trigger
    "README.md",
    "CHANGELOG.md",
    "plugins/learn-kit/CHANGELOG.md",
    "docs/adr/[ADR]_Codex_Dual_Native_Plugin_Support.md",
    "docs/guide/[GUIDE]_Version_Management.md",
    "docs/INDEX.md",
    "scripts/validate-dual-host.mjs",
    "scripts/check-a6.mjs",
    "tests/check-a6.test.mjs",
    ".github/workflows/a6.yml",
    "plugins/learn-kit/skills/three-views/templates/artifact-mind_map.md",
    "plugins/learn-kit/skills/three-views/scripts/hash-upload-corpus.mjs",
    ".claude/settings.json",
  ]) {
    assert.equal(isA6Trigger(p), false, `expected NOT a trigger: ${p}`);
  }
});

test("a trigger path containing a newline is still a trigger", () => {
  // -z parsing exists so that newline-bearing paths survive intact; classification must not
  // undo that. A pattern built on `.` would silently drop these, since JS `.` never matches \n.
  assert.equal(isA6Trigger("plugins/learn-kit/nlm-bridge/foo\nbar.py"), true);
  assert.equal(isA6Trigger("plugins/we\nird/skills/three-views/SKILL.md"), true);
  assert.equal(isA6Trigger("docs/rule/[STANDARD]_x\ny.md"), true);
});

test("trigger patterns anchor to end of input, not to a trailing newline", () => {
  // "VERSION\n" is a different file from "VERSION"; matching it would over-classify. This
  // exercises the /^VERSION$/ pattern specifically and fails if /m is added to it. Adding /m
  // is fail-CLOSED (it only widens what matches), so it can never open the gate — but it would
  // still wrongly flag a non-trigger path, which this pins for at least one pattern.
  assert.equal(isA6Trigger("VERSION\n"), false);
  assert.equal(isA6Trigger("\nVERSION"), false);
});

test("isA6Trigger is anchored — near-miss paths do not match", () => {
  for (const p of [
    "vendor/VERSION",
    "VERSION.bak",
    "docs/rule/[STANDARD]_Framework.md.bak",
    "docs/rule/README.md",
    "docs/rule/nested/[STANDARD]_Thing.md",
    "plugins/learn-kit/skills/three-views/SKILL.md.orig",
    ".claude/skills/other-skill/SKILL.md", // not mp-*
    "plugins/learn-kit/nlm-bridge", // the dir entry itself, no child path
  ]) {
    assert.equal(isA6Trigger(p), false, `expected NOT a trigger: ${p}`);
  }
});

// ------------------------------------------------------ evaluateA6: the happy paths
test("passes when the diff touches no trigger file", () => {
  const r = evaluateA6({
    changes: [{ status: "M", path: "README.md" }],
    title: "docs: tidy readme",
    reviews: [],
    authorLogin: "author",
    headSha: HEAD,
  });
  assert.equal(r.ok, true);
  assert.equal(r.reason, "no-trigger");
  assert.deepEqual(r.triggers, []);
});

test("passes when a trigger file is accompanied by a modified CLAUDE.md", () => {
  const r = evalWith({
    changes: [
      { status: "M", path: "VERSION" },
      { status: "M", path: "CLAUDE.md" },
    ],
    title: "infra: bump",
    reviews: [],
  });
  assert.equal(r.ok, true);
  assert.equal(r.reason, "claude-md-synced");
  assert.deepEqual(r.triggers, ["VERSION"]);
});

test("passes when CLAUDE.md is newly added alongside a trigger", () => {
  const r = evalWith({
    changes: [
      { status: "M", path: "VERSION" },
      { status: "A", path: "CLAUDE.md" },
    ],
    title: "infra: bump",
    reviews: [],
  });
  assert.equal(r.ok, true);
  assert.equal(r.reason, "claude-md-synced");
});

test("reports every triggered path, not just the first", () => {
  const r = evalWith({
    changes: [
      { status: "M", path: "VERSION" },
      { status: "M", path: ".claude-plugin/marketplace.json" },
      { status: "M", path: "README.md" },
      { status: "M", path: "CLAUDE.md" },
    ],
    title: "infra: bump",
    reviews: [],
  });
  assert.deepEqual(r.triggers, ["VERSION", ".claude-plugin/marketplace.json"]);
});

// ------------------------------------------------------ evaluateA6: the blocking paths
test("blocks when a trigger file is touched and CLAUDE.md is absent", () => {
  const r = evalWith({ title: "infra: bump", reviews: [] });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "trigger-without-sync");
  assert.deepEqual(r.triggers, ["VERSION"]);
});

test("deleting root CLAUDE.md does NOT count as syncing it", () => {
  const r = evalWith({
    changes: [
      { status: "M", path: "VERSION" },
      { status: "D", path: "CLAUDE.md" },
    ],
    title: "infra: bump",
    reviews: [],
  });
  assert.equal(r.ok, false, "a deleted CLAUDE.md must not satisfy the gate");
  assert.equal(r.reason, "trigger-without-sync");
});

test("a CLAUDE.md typechange does not count as syncing it", () => {
  // T = file replaced by a symlink. It exists at HEAD, but it was not authored.
  const r = evalWith({
    changes: [
      { status: "M", path: "VERSION" },
      { status: "T", path: "CLAUDE.md" },
    ],
    title: "infra: bump",
    reviews: [],
  });
  assert.equal(r.ok, false);
});

test("only ROOT CLAUDE.md counts — a plugin CLAUDE.md does not", () => {
  const r = evalWith({
    changes: [
      { status: "M", path: "VERSION" },
      { status: "M", path: "plugins/learn-kit/CLAUDE.md" },
    ],
    title: "infra: bump",
    reviews: [],
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "trigger-without-sync");
});

// -------------------------------------------- evaluateA6: the bypass (the actual bug)
test("REGRESSION: [skip a6] alone does not bypass the gate", () => {
  // The pre-fix ci.yml exited 0 here on the title alone, with no sign-off of any kind.
  const r = evalWith({ reviews: [] });
  assert.equal(r.ok, false, "[skip a6] with zero reviews must not pass");
  assert.equal(r.reason, "skip-token-without-signoff");
});

test("[skip a6] plus a valid reviewer sign-off bypasses the gate", () => {
  const r = evalWith();
  assert.equal(r.ok, true);
  assert.equal(r.reason, "skip-token-with-signoff");
  assert.equal(r.signoffBy, "reviewer");
});

test("the skip token must be the literal string", () => {
  for (const title of ["docs: thing [skip A6]", "docs: thing skip a6", "docs: thing [skip-a6]", "docs: thing"]) {
    const r = evalWith({ title });
    assert.equal(r.ok, false, `title must not bypass: ${title}`);
    assert.equal(r.reason, "trigger-without-sync");
  }
});

test("a sign-off without the skip token does not bypass the gate", () => {
  const r = evalWith({ title: "infra: bump" });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "trigger-without-sync");
});

// -------------------------------------------- evaluateA6: sign-off validity rules
test("the PR author cannot sign off on their own PR", () => {
  const r = evalWith({ reviews: [review({ user: { login: "author" }, author_association: "OWNER" })] });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "skip-token-without-signoff");
});

test("author self-signoff is rejected case-insensitively", () => {
  const r = evalWith({ reviews: [review({ user: { login: "AuThOr" } })] });
  assert.equal(r.ok, false, "GitHub logins are case-insensitive; case must not launder a self-signoff");
});

test("only OWNER / MEMBER / COLLABORATOR may sign off", () => {
  for (const assoc of ["CONTRIBUTOR", "FIRST_TIME_CONTRIBUTOR", "FIRST_TIMER", "NONE", "MANNEQUIN", ""]) {
    const r = evalWith({ reviews: [review({ author_association: assoc })] });
    assert.equal(r.ok, false, `association must not sign off: ${assoc}`);
  }
  for (const assoc of ["OWNER", "MEMBER", "COLLABORATOR"]) {
    const r = evalWith({ reviews: [review({ author_association: assoc })] });
    assert.equal(r.ok, true, `association should sign off: ${assoc}`);
  }
});

test("a sign-off against a stale head SHA does not count", () => {
  const r = evalWith({ reviews: [review({ commit_id: OLD })] });
  assert.equal(r.ok, false, "an approval of an older commit must not carry forward");
  assert.equal(r.reason, "skip-token-without-signoff");
});

test("the review must be an APPROVAL, not a comment", () => {
  for (const state of ["COMMENTED", "CHANGES_REQUESTED", "DISMISSED", "PENDING"]) {
    const r = evalWith({ reviews: [review({ state })] });
    assert.equal(r.ok, false, `state must not sign off: ${state}`);
  }
});

test("the review body must equal the sign-off phrase exactly", () => {
  for (const body of [
    "A6 N/A confirmed but actually I did not check",
    "LGTM. A6 N/A confirmed",
    "a6 n/a confirmed",
    "A6 N/A",
    "confirmed",
    "",
    null,
    undefined,
  ]) {
    const r = evalWith({ reviews: [review({ body })] });
    assert.equal(r.ok, false, `body must not sign off: ${JSON.stringify(body)}`);
  }
});

test("surrounding whitespace and CRLF in the sign-off body are tolerated", () => {
  // Bodies typed in the GitHub web UI arrive CRLF-terminated.
  for (const body of ["A6 N/A confirmed\r\n", "  A6 N/A confirmed  ", "\nA6 N/A confirmed\n"]) {
    const r = evalWith({ reviews: [review({ body })] });
    assert.equal(r.ok, true, `body should sign off: ${JSON.stringify(body)}`);
  }
});

test("a later CHANGES_REQUESTED from the same reviewer revokes their sign-off", () => {
  const r = evalWith({
    reviews: [
      review({ id: 1, submitted_at: "2026-07-16T10:00:00Z" }),
      review({ id: 2, submitted_at: "2026-07-16T11:00:00Z", state: "CHANGES_REQUESTED", body: "wait" }),
    ],
  });
  assert.equal(r.ok, false, "the reviewer's latest word on this SHA is CHANGES_REQUESTED");
});

test("a re-approval after CHANGES_REQUESTED restores the sign-off", () => {
  const r = evalWith({
    reviews: [
      review({ id: 1, submitted_at: "2026-07-16T10:00:00Z", state: "CHANGES_REQUESTED", body: "wait" }),
      review({ id: 2, submitted_at: "2026-07-16T11:00:00Z" }),
    ],
  });
  assert.equal(r.ok, true);
});

test("review recency follows submitted_at, not array position or id", () => {
  // evaluateA6 is an exported pure function; its ordering must rest on submitted_at, not on an
  // undocumented GitHub API habit of returning reviews chronologically. The APPROVED review is
  // given a HIGHER id but an EARLIER timestamp than the CHANGES_REQUESTED that revoked it, and
  // is listed LAST. So the correct verdict (block) is reached only by comparing timestamps:
  //   - "last element wins"  -> APPROVED (last)      -> would pass   (wrong)
  //   - "highest id wins"    -> APPROVED (id 5)      -> would pass   (wrong)
  //   - "latest submitted_at"-> CHANGES_REQUESTED    -> blocks       (correct)
  // GitHub review ids are monotonic per-repo, not per-PR, so id and submitted_at genuinely
  // diverge across a force-push + re-review; this is not a contrived ordering.
  const r = evalWith({
    reviews: [
      review({ id: 1, submitted_at: "2026-07-16T11:00:00Z", state: "CHANGES_REQUESTED", body: "wait" }),
      review({ id: 5, submitted_at: "2026-07-16T10:00:00Z" }),
    ],
  });
  assert.equal(r.ok, false, "the CHANGES_REQUESTED is latest by timestamp, so the sign-off is revoked");
});

test("review recency falls back to id when submitted_at ties", () => {
  const r = evalWith({
    reviews: [
      review({ id: 1, submitted_at: "2026-07-16T10:00:00Z" }),
      review({ id: 2, submitted_at: "2026-07-16T10:00:00Z", state: "CHANGES_REQUESTED", body: "wait" }),
    ],
  });
  assert.equal(r.ok, false, "id 2 is the later review");
});

test("one reviewer's CHANGES_REQUESTED does not void another's valid sign-off", () => {
  const r = evalWith({
    reviews: [
      review({ id: 1, user: { login: "grumpy" }, state: "CHANGES_REQUESTED", body: "no" }),
      review({ id: 2, user: { login: "reviewer" } }),
    ],
  });
  assert.equal(r.ok, true);
  assert.equal(r.signoffBy, "reviewer");
});

test("a reviewer with no login is ignored rather than crashing", () => {
  const r = evalWith({ reviews: [review({ user: null }), review({ id: 2 })] });
  assert.equal(r.ok, true);
});

// ------------------------------------------------------------------ input handling
test("evaluateA6 rejects malformed input rather than guessing", () => {
  assert.throws(() => evaluateA6({ changes: "nope", title: "t", reviews: [], authorLogin: "a", headSha: HEAD }), TypeError);
  assert.throws(() => evaluateA6({ changes: [], title: 42, reviews: [], authorLogin: "a", headSha: HEAD }), TypeError);
  assert.throws(() => evaluateA6({ changes: [], title: "t", reviews: "nope", authorLogin: "a", headSha: HEAD }), TypeError);
  assert.throws(() => evaluateA6({ changes: [], title: "t", reviews: [], authorLogin: "a", headSha: "" }), TypeError);
  assert.throws(() => evaluateA6({ changes: [{ path: "VERSION" }], title: "t", reviews: [], authorLogin: "a", headSha: HEAD }), TypeError);
});

test("flattenReviews accepts both a plain array and --paginate --slurp nesting", () => {
  assert.deepEqual(flattenReviews([{ id: 1 }]), [{ id: 1 }]);
  assert.deepEqual(flattenReviews([[{ id: 1 }], [{ id: 2 }]]), [{ id: 1 }, { id: 2 }]);
  assert.deepEqual(flattenReviews([]), []);
  assert.deepEqual(flattenReviews([[], []]), []);
  assert.throws(() => flattenReviews({ id: 1 }), TypeError);
  assert.throws(() => flattenReviews([[[{ id: 1 }]]]), TypeError, "only one level of nesting is defined");
});

// ------------------------------------------------------------------ NUL-safe parsing
test("parseNameStatusZ parses git's STATUS\\0PATH\\0 records", () => {
  assert.deepEqual(parseNameStatusZ("M\0VERSION\0A\0CLAUDE.md\0"), [
    { status: "M", path: "VERSION" },
    { status: "A", path: "CLAUDE.md" },
  ]);
});

test("parseNameStatusZ handles an empty diff", () => {
  assert.deepEqual(parseNameStatusZ(""), []);
  assert.deepEqual(parseNameStatusZ("\0"), []);
});

test("parseNameStatusZ keeps newlines inside a path intact", () => {
  // A path containing a newline is legal on Linux. Splitting on \n would invent two paths
  // and silently drop the trigger — which is the whole reason -z is mandatory.
  const evil = "docs/rule/[STANDARD]_x\nnot-a-real-line.md";
  assert.deepEqual(parseNameStatusZ(`M\0${evil}\0`), [{ status: "M", path: evil }]);
});

test("parseNameStatusZ strips similarity scores from status codes", () => {
  assert.deepEqual(parseNameStatusZ("M100\0VERSION\0"), [{ status: "M", path: "VERSION" }]);
});

test("parseNameStatusZ rejects a rename record instead of misreading it", () => {
  // --no-renames is mandatory; an R record means the caller built the command wrong,
  // and its two-path shape would desynchronise the whole stream if consumed blindly.
  assert.throws(() => parseNameStatusZ("R100\0old.md\0new.md\0"), Error);
});

test("parseNameStatusZ rejects a trailing status with no path", () => {
  assert.throws(() => parseNameStatusZ("M\0VERSION\0A\0"), Error);
});

// ------------------------------------------------------------------ CLI contract
//
// The CLI is exercised against real throwaway git repositories rather than an injectable
// "here are the changes" hook: the git invocation itself (three-dot range, --no-renames,
// -z) is part of what needs verifying, and a test-only input channel would be a bypass
// in production.

function git(cwd, args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${r.stderr}`);
  return r.stdout.trim();
}

function commitAll(dir, message) {
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "--no-verify", "-m", message]);
  return git(dir, ["rev-parse", "HEAD"]);
}

/** A repo with a base commit carrying VERSION + CLAUDE.md. Returns { dir, baseSha }. */
function makeRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "a6-repo-"));
  git(dir, ["init", "-q", "-b", "develop"]);
  git(dir, ["config", "user.email", "test@example.com"]);
  git(dir, ["config", "user.name", "Test"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  fs.writeFileSync(path.join(dir, "VERSION"), "6.3.2\n");
  fs.writeFileSync(path.join(dir, "CLAUDE.md"), "# context\n");
  fs.writeFileSync(path.join(dir, "README.md"), "# readme\n");
  const baseSha = commitAll(dir, "base");
  return { dir, baseSha };
}

function withRepo(fn) {
  const repo = makeRepo();
  try {
    return fn(repo);
  } finally {
    fs.rmSync(repo.dir, { recursive: true, force: true });
  }
}

function writeReviews(dir, reviews) {
  const f = path.join(dir, "reviews.json");
  fs.writeFileSync(f, JSON.stringify(reviews));
  return f;
}

function runCli(dir, env = {}) {
  return spawnSync(process.execPath, [SCRIPT], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

/** Drive the CLI over a real diff: mutate the tree, commit, then evaluate base...head. */
function runGate(repo, { mutate, title = "infra: bump", author = "author", reviews = [] }) {
  mutate(repo.dir);
  const headSha = commitAll(repo.dir, "pr commit");
  const reviewsFile = writeReviews(repo.dir, reviews.map((r) => ({ ...r, commit_id: r.commit_id === HEAD ? headSha : r.commit_id })));
  return runCli(repo.dir, {
    A6_BASE_SHA: repo.baseSha,
    A6_HEAD_SHA: headSha,
    A6_PR_TITLE: title,
    A6_PR_AUTHOR: author,
    A6_REVIEWS_FILE: reviewsFile,
  });
}

test("CLI exits 2 when a required environment variable is missing", () => {
  withRepo((repo) => {
    const r = runCli(repo.dir, {
      A6_BASE_SHA: "",
      A6_HEAD_SHA: "",
      A6_PR_TITLE: "",
      A6_PR_AUTHOR: "",
      A6_REVIEWS_FILE: "",
    });
    assert.equal(r.status, 2);
  });
});

test("CLI exits 2 on an unreadable reviews file", () => {
  withRepo((repo) => {
    const r = runCli(repo.dir, {
      A6_BASE_SHA: repo.baseSha,
      A6_HEAD_SHA: repo.baseSha,
      A6_PR_TITLE: "t",
      A6_PR_AUTHOR: "author",
      A6_REVIEWS_FILE: path.join(repo.dir, "definitely-missing.json"),
    });
    assert.equal(r.status, 2);
  });
});

test("CLI exits 2 on malformed reviews JSON", () => {
  withRepo((repo) => {
    const f = path.join(repo.dir, "reviews.json");
    fs.writeFileSync(f, "{not json");
    const r = runCli(repo.dir, {
      A6_BASE_SHA: repo.baseSha,
      A6_HEAD_SHA: repo.baseSha,
      A6_PR_TITLE: "t",
      A6_PR_AUTHOR: "author",
      A6_REVIEWS_FILE: f,
    });
    assert.equal(r.status, 2);
  });
});

test("CLI exits 2 on an unresolvable SHA rather than treating the diff as empty", () => {
  withRepo((repo) => {
    const r = runCli(repo.dir, {
      A6_BASE_SHA: repo.baseSha,
      A6_HEAD_SHA: "c".repeat(40),
      A6_PR_TITLE: "t",
      A6_PR_AUTHOR: "author",
      A6_REVIEWS_FILE: writeReviews(repo.dir, []),
    });
    assert.equal(r.status, 2, "a failed git call must not silently become 'no triggers'");
  });
});

test("CLI exits 1 and names the triggers when the gate blocks", () => {
  withRepo((repo) => {
    const r = runGate(repo, { mutate: (d) => fs.writeFileSync(path.join(d, "VERSION"), "6.3.3\n") });
    assert.equal(r.status, 1);
    assert.match(r.stdout + r.stderr, /VERSION/);
  });
});

test("CLI exits 0 when CLAUDE.md is synced alongside the trigger", () => {
  withRepo((repo) => {
    const r = runGate(repo, {
      mutate: (d) => {
        fs.writeFileSync(path.join(d, "VERSION"), "6.3.3\n");
        fs.writeFileSync(path.join(d, "CLAUDE.md"), "# context\nupdated\n");
      },
    });
    assert.equal(r.status, 0);
  });
});

test("CLI exits 0 when the PR touches nothing on the allowlist", () => {
  withRepo((repo) => {
    const r = runGate(repo, { mutate: (d) => fs.writeFileSync(path.join(d, "README.md"), "# readme\nedit\n") });
    assert.equal(r.status, 0);
  });
});

test("CLI exits 1 for [skip a6] with no sign-off", () => {
  withRepo((repo) => {
    const r = runGate(repo, {
      mutate: (d) => fs.writeFileSync(path.join(d, "VERSION"), "6.3.3\n"),
      title: "infra: bump [skip a6]",
    });
    assert.equal(r.status, 1, "the title alone must not bypass the gate");
  });
});

test("CLI exits 0 for [skip a6] with a valid sign-off", () => {
  withRepo((repo) => {
    const r = runGate(repo, {
      mutate: (d) => fs.writeFileSync(path.join(d, "VERSION"), "6.3.3\n"),
      title: "infra: bump [skip a6]",
      reviews: [review()],
    });
    assert.equal(r.status, 0);
  });
});

test("CLI exits 1 when deleting root CLAUDE.md is the only 'sync'", () => {
  withRepo((repo) => {
    const r = runGate(repo, {
      mutate: (d) => {
        fs.writeFileSync(path.join(d, "VERSION"), "6.3.3\n");
        fs.rmSync(path.join(d, "CLAUDE.md"));
      },
    });
    assert.equal(r.status, 1);
  });
});

test("CLI uses a three-dot range: a base-branch CLAUDE.md edit cannot satisfy the PR", () => {
  // The pre-fix step used BASE..HEAD. When develop moves ahead with its own CLAUDE.md
  // edit, that two-dot diff reports CLAUDE.md as changed — the PR inherits a sync it
  // never made, and the gate opens. Three-dot compares against the merge base instead.
  withRepo((repo) => {
    git(repo.dir, ["checkout", "-q", "-b", "feature"]);
    fs.writeFileSync(path.join(repo.dir, "VERSION"), "6.3.3\n");
    const headSha = commitAll(repo.dir, "pr: bump VERSION only");

    git(repo.dir, ["checkout", "-q", "develop"]);
    fs.writeFileSync(path.join(repo.dir, "CLAUDE.md"), "# context\nedited on develop\n");
    const newBaseSha = commitAll(repo.dir, "develop: unrelated CLAUDE.md edit");

    // Sanity-check the premise: two-dot really does report CLAUDE.md here.
    const twoDot = git(repo.dir, ["diff", "--name-only", `${newBaseSha}..${headSha}`]);
    assert.match(twoDot, /CLAUDE\.md/, "premise: two-dot diff sees the base-branch edit");

    const r = runCli(repo.dir, {
      A6_BASE_SHA: newBaseSha,
      A6_HEAD_SHA: headSha,
      A6_PR_TITLE: "infra: bump",
      A6_PR_AUTHOR: "author",
      A6_REVIEWS_FILE: writeReviews(repo.dir, []),
    });
    assert.equal(r.status, 1, "the PR did not touch CLAUDE.md; the gate must still block");
  });
});

test("CLI sees a renamed trigger file rather than a rename record", () => {
  withRepo((repo) => {
    const r = runGate(repo, {
      mutate: (d) => {
        fs.rmSync(path.join(d, "VERSION"));
        fs.writeFileSync(path.join(d, "VERSION.txt"), "6.3.2\n");
      },
    });
    assert.equal(r.status, 1, "deleting VERSION is a trigger; --no-renames keeps it visible");
  });
});

test("CLI treats a shell-metacharacter PR title as inert data", () => {
  // The pre-fix step interpolated the title straight into a shell script via ${{ }}.
  // This title would have executed `touch`. Here it must simply not contain the token.
  withRepo((repo) => {
    const canary = path.join(repo.dir, "injection-canary");
    const r = runGate(repo, {
      mutate: (d) => fs.writeFileSync(path.join(d, "VERSION"), "6.3.3\n"),
      title: `"; touch "${canary}"; echo "`,
    });
    assert.equal(r.status, 1);
    assert.equal(fs.existsSync(canary), false, "the PR title must never reach a shell");
  });
});

test("CLI handles a PR title that is exactly the skip token with odd spacing", () => {
  withRepo((repo) => {
    const r = runGate(repo, {
      mutate: (d) => fs.writeFileSync(path.join(d, "VERSION"), "6.3.3\n"),
      title: "[skip a6]",
      reviews: [review()],
    });
    assert.equal(r.status, 0);
  });
});
