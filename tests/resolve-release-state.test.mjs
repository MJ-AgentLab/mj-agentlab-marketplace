// Tests for scripts/resolve-release-state.mjs (plan §2.4; acceptance list at plan §6).

import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  resolveReleaseState,
  evaluateReleaseIdentity,
  evaluateReleaseIntegrity,
  normalizeNotes,
  InputError,
  PolicyError,
} from "../scripts/resolve-release-state.mjs";

const SCRIPT = fileURLToPath(new URL("../scripts/resolve-release-state.mjs", import.meta.url));

const SHA = "a".repeat(40);
const OTHER_SHA = "b".repeat(40);
const NOTES = "### Added\n\n- portable Git release\n";

function identityFacts(o = {}) {
  return {
    version: "7.0.0",
    releaseSha: SHA,
    mainTipSha: SHA,
    releaseShaIsMainAncestor: true,
    targetCommitVersion: "7.0.0",
    targetNotes: NOTES,
    immutabilityEnabled: false,
    tag: { present: false },
    release: { present: false },
    ...o,
  };
}

function draftRelease(o = {}) {
  return { present: true, id: 5, tag: "v7.0.0", name: "v7.0.0", targetCommitish: SHA, isDraft: true, isPrerelease: false, body: NOTES, assets: [], ...o };
}

function integrityFacts(o = {}) {
  const base = identityFacts(o.identity);
  delete o.identity;
  return {
    ...base,
    expectedCanonicalIdentity: { sha: SHA, version: "7.0.0", notes: normalizeNotes(NOTES) },
    priorPhase: "initial",
    ...o,
  };
}

// ------------------------------------------------------------------ structural state
test("resolveReleaseState classifies all four shapes", () => {
  assert.equal(resolveReleaseState(false, false), "none");
  assert.equal(resolveReleaseState(true, false), "tag-only");
  assert.equal(resolveReleaseState(false, true), "release-only");
  assert.equal(resolveReleaseState(true, true), "both");
});

test("resolveReleaseState does not pre-judge release-only", () => {
  // A release with no tag is a legal draft in progress; erroring here would break draft-first.
  assert.doesNotThrow(() => resolveReleaseState(false, true));
});

test("resolveReleaseState demands real booleans", () => {
  for (const v of ["true", 1, null, undefined]) {
    assert.throws(() => resolveReleaseState(v, false), InputError);
    assert.throws(() => resolveReleaseState(false, v), InputError);
  }
});

// ------------------------------------------------------------------ helpers
test("normalizeNotes folds CRLF and trims the outside only", () => {
  assert.equal(normalizeNotes("\r\n### A\r\n\r\n- x\r\n\r\n"), "### A\n\n- x");
  assert.equal(normalizeNotes("  ### A\n\n- x  "), "### A\n\n- x");
});

// ------------------------------------------------------------------ identity
test("identity returns the canonical triple and phase=initial with no release", () => {
  const r = evaluateReleaseIdentity(identityFacts());
  assert.equal(r.phase, "initial");
  assert.deepEqual(r.canonicalIdentity, { sha: SHA, version: "7.0.0", notes: normalizeNotes(NOTES) });
});

test("identity reports draft and published phases", () => {
  assert.equal(evaluateReleaseIdentity(identityFacts({ release: draftRelease() })).phase, "draft");
  assert.equal(evaluateReleaseIdentity(identityFacts({ release: draftRelease({ isDraft: false }) })).phase, "published");
});

test("identity rejects a commit that is not on main", () => {
  assert.throws(() => evaluateReleaseIdentity(identityFacts({ releaseShaIsMainAncestor: false })), PolicyError);
});

test("identity rejects a VERSION that disagrees with the release", () => {
  assert.throws(() => evaluateReleaseIdentity(identityFacts({ targetCommitVersion: "6.9.9" })), PolicyError);
});

test("identity rejects empty release notes", () => {
  for (const notes of ["", "   ", "\r\n\r\n"]) {
    assert.throws(() => evaluateReleaseIdentity(identityFacts({ targetNotes: notes })), PolicyError);
  }
});

test("identity rejects a tag pointing at an older ancestor", () => {
  // The classic bad state: v7.0.0 exists but peels to a commit that is not the release.
  assert.throws(
    () => evaluateReleaseIdentity(identityFacts({ tag: { present: true, sha: OTHER_SHA } })),
    PolicyError,
  );
});

test("identity accepts a tag that peels to the canonical commit", () => {
  const r = evaluateReleaseIdentity(identityFacts({ tag: { present: true, sha: SHA } }));
  assert.equal(r.canonicalIdentity.sha, SHA);
});

test("identity rejects a release aimed at another commit", () => {
  assert.throws(
    () => evaluateReleaseIdentity(identityFacts({ release: draftRelease({ targetCommitish: OTHER_SHA }) })),
    PolicyError,
  );
});

test("identity validates its input shape", () => {
  assert.throws(() => evaluateReleaseIdentity(null), InputError);
  assert.throws(() => evaluateReleaseIdentity(identityFacts({ releaseSha: "xyz" })), InputError);
  assert.throws(() => evaluateReleaseIdentity(identityFacts({ version: "7.0" })), InputError);
  assert.throws(() => evaluateReleaseIdentity(identityFacts({ releaseShaIsMainAncestor: "yes" })), InputError);
});

// ------------------------------------------------------------------ integrity: identity binding
test("integrity re-derives identity and demands the caller's expectation match", () => {
  const r = evaluateReleaseIntegrity(integrityFacts());
  assert.deepEqual(r.canonicalIdentity, { sha: SHA, version: "7.0.0", notes: normalizeNotes(NOTES) });
});

test("integrity fails when the canonical commit moved under the run", () => {
  assert.throws(
    () => evaluateReleaseIntegrity(integrityFacts({ expectedCanonicalIdentity: { sha: OTHER_SHA, version: "7.0.0", notes: normalizeNotes(NOTES) } })),
    PolicyError,
  );
});

test("integrity fails when the release notes drift", () => {
  assert.throws(
    () => evaluateReleaseIntegrity(integrityFacts({ expectedCanonicalIdentity: { sha: SHA, version: "7.0.0", notes: "### Different" } })),
    PolicyError,
  );
});

test("integrity compares notes after normalisation, so CRLF alone is not drift", () => {
  const r = evaluateReleaseIntegrity(integrityFacts({ expectedCanonicalIdentity: { sha: SHA, version: "7.0.0", notes: NOTES.replace(/\n/g, "\r\n") } }));
  assert.equal(r.action, "create-draft");
});

// ------------------------------------------------------------------ integrity: phases
test("phase may stay put or advance one step", () => {
  assert.equal(evaluateReleaseIntegrity(integrityFacts({ priorPhase: "initial" })).phase, "initial");
  const draft = { identity: {}, release: draftRelease(), priorPhase: "draft" };
  assert.equal(evaluateReleaseIntegrity(integrityFacts(draft)).phase, "draft");
  assert.equal(evaluateReleaseIntegrity(integrityFacts({ release: draftRelease(), priorPhase: "initial" })).phase, "draft");
});

test("phase must not go backwards", () => {
  assert.throws(() => evaluateReleaseIntegrity(integrityFacts({ priorPhase: "draft" })), PolicyError);
  assert.throws(
    () => evaluateReleaseIntegrity(integrityFacts({ release: draftRelease({ assets: [] }), priorPhase: "published" })),
    PolicyError,
  );
});

test("phase must not skip initial -> published", () => {
  assert.throws(
    () => evaluateReleaseIntegrity(integrityFacts({ tag: { present: true, sha: SHA }, release: draftRelease({ isDraft: false, assets: [] }), priorPhase: "initial" })),
    PolicyError,
  );
});

test("integrity rejects an unknown priorPhase", () => {
  assert.throws(() => evaluateReleaseIntegrity(integrityFacts({ priorPhase: "shipped" })), InputError);
});

// ------------------------------------------------------------------ integrity: actions
test("none + releaseSha at main's tip creates an empty draft", () => {
  const r = evaluateReleaseIntegrity(integrityFacts());
  assert.equal(r.action, "create-draft");
  assert.equal(r.assetAction, "noop", "create-draft never uploads in the same step");
});

test("none but releaseSha behind main's tip refuses to start", () => {
  assert.throws(() => evaluateReleaseIntegrity(integrityFacts({ mainTipSha: OTHER_SHA })), PolicyError);
});

test("a correct tag-only state recovers by creating the draft", () => {
  const r = evaluateReleaseIntegrity(integrityFacts({ tag: { present: true, sha: SHA }, mainTipSha: OTHER_SHA }));
  assert.equal(r.action, "create-draft");
  assert.equal(r.assetAction, "noop");
});

test("an empty canonical draft publishes without attachments", () => {
  const r = evaluateReleaseIntegrity(integrityFacts({ release: draftRelease(), priorPhase: "draft" }));
  assert.equal(r.action, "publish-draft"); assert.equal(r.assetAction, "noop");
});
test("a canonical published Git/tag release is a noop", () => {
  const r = evaluateReleaseIntegrity(integrityFacts({ tag: {present:true, sha:SHA}, release: draftRelease({isDraft:false}), priorPhase:"published" }));
  assert.equal(r.action, "noop");
});
test("foreign draft metadata and missing SHA bindings are refused", () => {
  for (const change of [{tag:"v9.0.0"}, {name:"other"}, {body:"other"}, {isPrerelease:true}, {targetCommitish:undefined}]) {
    assert.throws(() => evaluateReleaseIntegrity(integrityFacts({release:draftRelease(change),priorPhase:"draft"})), PolicyError);
  }
});
test("published releases need a canonical tag and exact metadata", () => {
  assert.throws(() => evaluateReleaseIntegrity(integrityFacts({release:draftRelease({isDraft:false}),priorPhase:"published"})), PolicyError);
  for(const change of [{name:"other"}, {isPrerelease:true}, {body:"other"}]) {
    assert.throws(() => evaluateReleaseIntegrity(integrityFacts({tag:{present:true,sha:SHA},release:draftRelease({isDraft:false,...change}),priorPhase:"published"})), PolicyError);
  }
});
test("existing attachments fail closed and are never repaired", () => {
  for(const isDraft of [true,false]) {
    assert.throws(() => evaluateReleaseIntegrity(integrityFacts({tag:{present:true,sha:SHA},release:draftRelease({isDraft,assets:[{name:"historic-artifact"}]}),priorPhase:isDraft?"draft":"published"})), PolicyError);
  }
});

function runCli(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
}

function withFacts(obj, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rrs-"));
  try {
    const f = path.join(dir, "facts.json");
    fs.writeFileSync(f, JSON.stringify(obj));
    return fn(f);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("CLI boolean mode prints only the classification", () => {
  const r = runCli(["--tag-exists", "true", "--release-exists", "false"]);
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "tag-only\n");
});

test("CLI identity mode prints one line of JSON", () => {
  withFacts(identityFacts(), (f) => {
    const r = runCli(["--identity-facts-file", f]);
    assert.equal(r.status, 0);
    assert.equal(r.stdout.trimEnd().split("\n").length, 1);
    assert.equal(JSON.parse(r.stdout).canonicalIdentity.sha, SHA);
  });
});

test("CLI integrity mode prints one line of JSON", () => {
  withFacts(integrityFacts(), (f) => {
    const r = runCli(["--facts-file", f]);
    assert.equal(r.status, 0);
    assert.equal(JSON.parse(r.stdout).action, "create-draft");
  });
});

test("CLI exits 1 for a policy violation and 2 for bad input", () => {
  withFacts(identityFacts({ releaseShaIsMainAncestor: false }), (f) => {
    assert.equal(runCli(["--identity-facts-file", f]).status, 1, "policy failure");
  });
  withFacts(identityFacts({ releaseSha: "nope" }), (f) => {
    assert.equal(runCli(["--identity-facts-file", f]).status, 2, "bad shape");
  });
  assert.equal(runCli([]).status, 2, "no mode");
  assert.equal(runCli(["--tag-exists", "yes", "--release-exists", "false"]).status, 2, "non-literal boolean");
  assert.equal(runCli(["--tag-exists", "true"]).status, 2, "half the boolean pair");
  assert.equal(runCli(["--facts-file", "/nonexistent/facts.json"]).status, 2, "unreadable");
  assert.equal(runCli(["--bogus", "x"]).status, 2, "unknown flag");
});

test("CLI refuses more than one mode at once", () => {
  withFacts(identityFacts(), (f) => {
    assert.equal(runCli(["--identity-facts-file", f, "--facts-file", f]).status, 2);
    assert.equal(runCli(["--tag-exists", "true", "--release-exists", "false", "--facts-file", f]).status, 2);
  });
});

test("CLI writes nothing to stdout when it fails", () => {
  withFacts(identityFacts({ releaseShaIsMainAncestor: false }), (f) => {
    const r = runCli(["--identity-facts-file", f]);
    assert.equal(r.stdout, "");
    assert.ok(r.stderr.length > 0);
  });
});

test("CLI exits 2 on malformed JSON", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rrs-"));
  try {
    const f = path.join(dir, "facts.json");
    fs.writeFileSync(f, "{not json");
    assert.equal(runCli(["--facts-file", f]).status, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
