// Tests for scripts/run-release.mjs — the draft-first orchestration and its pure fact builders.
// The orchestration is driven against a simulated remote (a fake `io`) so the whole state machine
// runs without a real GitHub release API. Decisions still come from resolve-release-state.mjs; these
// tests prove the orchestrator threads facts, sequences writes and fails closed correctly.

import test from "node:test";
import assert from "node:assert/strict";

import {
  runRelease,
  extractChangelogSection,
  parseReleaseFromList,
  mkExpectedAssets,
  verifyAssetDigests,
  DRAFT_VISIBILITY_BACKOFF_MS,
} from "../scripts/run-release.mjs";
import { PolicyError, InputError, normalizeNotes } from "../scripts/resolve-release-state.mjs";

const SHA = "a".repeat(40);
const OTHER = "b".repeat(40);
const VERSION = "7.0.0";
const NOTES = "### Added\n\n- codex dual-native\n";
const WHEEL = "learn_kit_nlm_bridge-4.0.0-py3-none-any.whl";
const CHECKSUM = `${WHEEL}.sha256`;
const WHEEL_SHA = "1a".repeat(32);
const CHECKSUM_SHA = "2b".repeat(32);

const BUILT = {
  wheelPath: "/tmp/w.whl",
  checksumPath: "/tmp/w.whl.sha256",
  wheel: { name: WHEEL, size: 1234, rawSha256: WHEEL_SHA },
  checksum: { name: CHECKSUM, size: 99, rawSha256: CHECKSUM_SHA },
};

function uploadedAssets() {
  return [
    { id: 1, name: WHEEL, state: "uploaded", size: 1234, digest: `sha256:${WHEEL_SHA}` },
    { id: 2, name: CHECKSUM, state: "uploaded", size: 99, digest: `sha256:${CHECKSUM_SHA}` },
  ];
}

// A stateful fake remote. `state` mutates as the orchestrator writes to it, so re-queries observe
// the effect of createDraft/uploadAssets/publish — the same progression a real remote goes through.
function makeIo(state = {}, hooks = {}) {
  const calls = [];
  const rel = {
    releaseSha: SHA,
    mainTipSha: SHA,
    releaseShaIsMainAncestor: true,
    version: VERSION,
    targetCommitVersion: VERSION,
    targetNotes: NOTES,
    immutabilityEnabled: false,
  };
  const io = {
    calls,
    sleeps: [],
    log: () => {},
    sleep: async (ms) => {
      io.sleeps.push(ms);
    },
    async resolveRelease() {
      return { ...rel, ...(hooks.rel || {}) };
    },
    async probe() {
      if (hooks.probe) return hooks.probe(state);
      const tag = state.published ? { present: true, sha: SHA } : { present: false };
      let release = { present: false };
      if (state.draft || state.published) {
        release = {
          present: true,
          id: 5,
          tag: `v${VERSION}`,
          name: `v${VERSION}`,
          targetCommitish: SHA,
          isDraft: !state.published,
          isPrerelease: false,
          body: NOTES,
          assets: state.uploaded ? uploadedAssets() : [],
        };
      }
      return { tag, release };
    },
    async build() {
      calls.push("build");
      return BUILT;
    },
    async createDraft() {
      calls.push("createDraft");
      state.draft = true;
    },
    async uploadAssets() {
      calls.push("uploadAssets");
      state.uploaded = true;
    },
    received: {},
    async downloadAndVerify(version, expected) {
      calls.push("downloadAndVerify");
      io.received.downloadAndVerify = { version, expected };
    },
    async publish(version) {
      calls.push("publish");
      io.received.publish = { version };
      state.published = true;
    },
    async postPublish() {
      calls.push("postPublish");
    },
  };
  return io;
}

test("fresh release: build → create draft → upload → verify → publish → post-publish", async () => {
  const io = makeIo({});
  const r = await runRelease(io);
  assert.equal(r.result, "published");
  assert.deepEqual(io.calls, ["build", "createDraft", "uploadAssets", "downloadAndVerify", "publish", "postPublish"]);
  // The pre-publish verify and publish must receive the canonical version and the built assets — a
  // stale/wrong argument here would be invisible to a call-name-only assertion.
  assert.equal(io.received.downloadAndVerify.version, VERSION);
  assert.deepEqual(io.received.downloadAndVerify.expected, mkExpectedAssets(BUILT));
  assert.equal(io.received.publish.version, VERSION);
});

test("resume from an empty draft: skips create, uploads, then publishes", async () => {
  const io = makeIo({ draft: true });
  const r = await runRelease(io);
  assert.equal(r.result, "published");
  assert.deepEqual(io.calls, ["build", "uploadAssets", "downloadAndVerify", "publish", "postPublish"]);
});

test("resume from a fully-uploaded draft: verifies then publishes", async () => {
  const io = makeIo({ draft: true, uploaded: true });
  const r = await runRelease(io);
  assert.equal(r.result, "published");
  assert.deepEqual(io.calls, ["build", "downloadAndVerify", "publish", "postPublish"]);
});

test("already published and correct: noop, no writes, no re-verify", async () => {
  const io = makeIo({ draft: true, uploaded: true, published: true });
  const r = await runRelease(io);
  assert.equal(r.result, "noop");
  assert.deepEqual(io.calls, ["build"]); // build is needed to compute expected assets; nothing else runs
});

test("a foreign asset on the draft fails closed before any publish", async () => {
  const io = makeIo({}, {
    probe: (state) => {
      const tag = { present: false };
      if (!state.draft) return { tag, release: { present: false } };
      return {
        tag,
        release: {
          present: true, id: 5, tag: `v${VERSION}`, name: `v${VERSION}`, targetCommitish: SHA,
          isDraft: true, isPrerelease: false, body: NOTES,
          assets: [...uploadedAssets(), { id: 9, name: "surprise.txt", state: "uploaded", size: 1, digest: `sha256:${"c".repeat(64)}` }],
        },
      };
    },
  });
  await assert.rejects(() => runRelease(io), PolicyError);
  assert.ok(!io.calls.includes("publish"), "must not publish when a foreign asset is present");
});

test("release notes drift on the draft fails closed", async () => {
  const io = makeIo({}, {
    probe: (state) => {
      const tag = { present: false };
      if (!state.draft) return { tag, release: { present: false } };
      return {
        tag,
        release: {
          present: true, id: 5, tag: `v${VERSION}`, name: `v${VERSION}`, targetCommitish: SHA,
          isDraft: true, isPrerelease: false, body: "### Something else entirely", assets: uploadedAssets(),
        },
      };
    },
  });
  await assert.rejects(() => runRelease(io), PolicyError);
  assert.ok(!io.calls.includes("publish"));
});

test("a release SHA that is not on main is rejected at identity", async () => {
  const io = makeIo({}, { rel: { releaseShaIsMainAncestor: false } });
  await assert.rejects(() => runRelease(io), PolicyError);
  assert.ok(!io.calls.includes("createDraft"));
});

test("starting a brand-new release from a stale (non-tip) commit is refused", async () => {
  const io = makeIo({}, { rel: { mainTipSha: OTHER } });
  await assert.rejects(() => runRelease(io), PolicyError);
});

test("a draft asset whose digest disagrees with the build fails closed before publish", async () => {
  const io = makeIo({ draft: true }, {
    probe: () => {
      const assets = uploadedAssets();
      assets[0].digest = `sha256:${"e".repeat(64)}`; // wrong wheel digest
      return {
        tag: { present: false },
        release: { present: true, id: 5, tag: `v${VERSION}`, name: `v${VERSION}`, targetCommitish: SHA, isDraft: true, isPrerelease: false, body: NOTES, assets },
      };
    },
  });
  await assert.rejects(() => runRelease(io), PolicyError);
  assert.ok(!io.calls.includes("publish"), "must not publish when a draft asset digest is wrong");
});

// ------------------------------------------------------------------ post-create list-visibility poll

// A probe that hides the freshly-created draft from the releases list for `lagPolls` reads after
// createDraft (GitHub's eventual-consistency window), then reveals it. `Infinity` = it never appears.
function laggyDraftProbe(lagPolls) {
  let postCreate = 0;
  return (state) => {
    const lagging = state.draft && !state.published && postCreate < lagPolls;
    if (lagging) postCreate++;
    if ((!state.draft && !state.published) || lagging) {
      return { tag: { present: false }, release: { present: false } };
    }
    return {
      tag: state.published ? { present: true, sha: SHA } : { present: false },
      release: {
        present: true, id: 5, tag: `v${VERSION}`, name: `v${VERSION}`, targetCommitish: SHA,
        isDraft: !state.published, isPrerelease: false, body: NOTES,
        assets: state.uploaded ? uploadedAssets() : [],
      },
    };
  };
}

test("post-create list lag: polls with backoff until the draft appears, then publishes", async () => {
  const io = makeIo({}, { probe: laggyDraftProbe(3) });
  const r = await runRelease(io);
  assert.equal(r.result, "published");
  assert.deepEqual(io.calls, ["build", "createDraft", "uploadAssets", "downloadAndVerify", "publish", "postPublish"]);
  // Assert the exact recorded delays, not just the count: a sleep(0)/constant backoff would keep the
  // count right yet complete all probes inside the replication window, reintroducing the first-run race.
  assert.deepEqual(io.sleeps, DRAFT_VISIBILITY_BACKOFF_MS.slice(0, 3), "backs off on the exact exported schedule until the draft is visible");
});

test("post-create list lag that never resolves: fails closed after the backoff budget, no publish", async () => {
  const io = makeIo({}, { probe: laggyDraftProbe(Infinity) });
  await assert.rejects(
    () => runRelease(io),
    (e) => e instanceof PolicyError && /never appeared in the releases list/.test(e.message),
  );
  assert.equal(io.calls.filter((c) => c === "createDraft").length, 1, "createDraft is called once, never re-created during polling");
  assert.ok(!io.calls.includes("publish"), "must not publish when the draft never becomes visible");
  assert.deepEqual(io.sleeps, DRAFT_VISIBILITY_BACKOFF_MS, "exhausts exactly the exported backoff schedule (real delays, not sleep(0)) before failing closed");
});

test("no list lag: the draft is visible on the first re-query, so no backoff sleep happens", async () => {
  const io = makeIo({});
  const r = await runRelease(io);
  assert.equal(r.result, "published");
  assert.equal(io.sleeps.length, 0, "the happy path must not wait");
});

test("a mismatched draft observed right after createDraft fails closed immediately, not retried as lag", async () => {
  // The draft appears in the list at once but with drifted notes — NOT the visibility transient. It
  // must fail closed on the first re-query, never be retried as though the list were merely lagging.
  const io = makeIo({}, {
    probe: (state) => {
      if (!state.draft) return { tag: { present: false }, release: { present: false } };
      return {
        tag: { present: false },
        release: { present: true, id: 5, tag: `v${VERSION}`, name: `v${VERSION}`, targetCommitish: SHA, isDraft: true, isPrerelease: false, body: "### drifted notes", assets: [] },
      };
    },
  });
  await assert.rejects(() => runRelease(io), PolicyError);
  assert.equal(io.sleeps.length, 0, "a genuine mismatch is not retried as a visibility lag");
  assert.ok(!io.calls.includes("publish"));
});

test("an unexpected non-transient action right after createDraft fails closed at once (not treated as lag)", async () => {
  // The draft appears immediately WITH correct assets — a state createDraft never produces. The
  // evaluator returns publish-draft, which is neither resume-draft nor the create-draft transient, so
  // the poll must reject it immediately rather than back off as though the list were catching up.
  const io = makeIo({}, {
    probe: (state) => {
      if (!state.draft) return { tag: { present: false }, release: { present: false } };
      return {
        tag: { present: false },
        release: { present: true, id: 5, tag: `v${VERSION}`, name: `v${VERSION}`, targetCommitish: SHA, isDraft: true, isPrerelease: false, body: NOTES, assets: uploadedAssets() },
      };
    },
  });
  await assert.rejects(
    () => runRelease(io),
    (e) => e instanceof PolicyError && /expected resume-draft \(or the transient create-draft/.test(e.message),
  );
  assert.equal(io.sleeps.length, 0, "an unexpected action is not retried as a visibility lag");
  assert.ok(!io.calls.includes("uploadAssets") && !io.calls.includes("publish"));
});

// ------------------------------------------------------------------ verifyAssetDigests helper

const EXP = {
  wheel: { name: WHEEL, size: 1234, rawSha256: WHEEL_SHA },
  checksum: { name: CHECKSUM, size: 99, rawSha256: CHECKSUM_SHA },
};
const goodOnDisk = (name) => (name === WHEEL ? WHEEL_SHA : CHECKSUM_SHA);

test("verifyAssetDigests passes when both REST digest and on-disk bytes match", () => {
  assert.doesNotThrow(() => verifyAssetDigests({ present: true, assets: uploadedAssets() }, EXP, goodOnDisk));
});

test("verifyAssetDigests rejects a vanished draft", () => {
  assert.throws(() => verifyAssetDigests({ present: false }, EXP, goodOnDisk), PolicyError);
});

test("verifyAssetDigests rejects a missing asset", () => {
  assert.throws(() => verifyAssetDigests({ present: true, assets: [uploadedAssets()[0]] }, EXP, goodOnDisk), PolicyError);
});

test("verifyAssetDigests rejects an absent/non-canonical digest", () => {
  const a = uploadedAssets();
  a[0].digest = null;
  assert.throws(() => verifyAssetDigests({ present: true, assets: a }, EXP, goodOnDisk), PolicyError);
});

test("verifyAssetDigests rejects a REST digest that disagrees with the build", () => {
  const a = uploadedAssets();
  a[0].digest = `sha256:${"f".repeat(64)}`;
  assert.throws(() => verifyAssetDigests({ present: true, assets: a }, EXP, goodOnDisk), PolicyError);
});

test("verifyAssetDigests rejects on-disk bytes that disagree with the build", () => {
  const badOnDisk = (name) => (name === WHEEL ? "0".repeat(64) : CHECKSUM_SHA);
  assert.throws(() => verifyAssetDigests({ present: true, assets: uploadedAssets() }, EXP, badOnDisk), PolicyError);
});

// ------------------------------------------------------------------ pure helpers

test("extractChangelogSection pulls the body under the version heading only", () => {
  const cl = [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    "## [7.0.0] - 2026-07-20",
    "",
    "### Added",
    "- a thing",
    "",
    "## [6.3.1] - 2026-06-15",
    "",
    "- older",
  ].join("\n");
  const s = extractChangelogSection(cl, "7.0.0");
  assert.match(s, /### Added/);
  assert.match(s, /- a thing/);
  assert.doesNotMatch(s, /older/);
  assert.doesNotMatch(s, /Unreleased/);
  assert.equal(normalizeNotes(s), "### Added\n- a thing");
});

test("extractChangelogSection returns empty for a missing version", () => {
  assert.equal(extractChangelogSection("## [1.0.0]\n\n- x\n", "7.0.0"), "");
});

test("extractChangelogSection does not confuse 7.0.0 with 7.0.00-style prefixes", () => {
  const cl = "## [7.0.0] - d\n\n- real\n\n## [7.0.0-rc] - d\n\n- rc\n";
  assert.match(extractChangelogSection(cl, "7.0.0"), /real/);
  assert.doesNotMatch(extractChangelogSection(cl, "7.0.0"), /rc/);
});

test("parseReleaseFromList finds a draft by tag_name and maps its fields", () => {
  const list = [
    { id: 1, tag_name: "v6.3.1", draft: false },
    { id: 2, tag_name: "v7.0.0", name: "v7.0.0", target_commitish: SHA, draft: true, prerelease: false, body: NOTES, assets: [{ id: 3, name: WHEEL, state: "uploaded", size: 1234, digest: `sha256:${WHEEL_SHA}` }] },
  ];
  const r = parseReleaseFromList(list, "7.0.0");
  assert.equal(r.present, true);
  assert.equal(r.isDraft, true);
  assert.equal(r.targetCommitish, SHA);
  assert.equal(r.assets.length, 1);
  assert.equal(r.assets[0].digest, `sha256:${WHEEL_SHA}`);
});

test("parseReleaseFromList reports absence when nothing matches", () => {
  assert.deepEqual(parseReleaseFromList([{ id: 1, tag_name: "v1.0.0" }], "7.0.0"), { present: false });
});

test("parseReleaseFromList refuses to guess between duplicate tags", () => {
  assert.throws(() => parseReleaseFromList([{ tag_name: "v7.0.0" }, { tag_name: "v7.0.0" }], "7.0.0"), PolicyError);
});

test("parseReleaseFromList treats a branch-name target_commitish as no binding", () => {
  const r = parseReleaseFromList([{ id: 2, tag_name: "v7.0.0", target_commitish: "main", draft: false, assets: [] }], "7.0.0");
  assert.equal(r.targetCommitish, undefined);
});

test("parseReleaseFromList rejects a non-array response", () => {
  assert.throws(() => parseReleaseFromList({ not: "an array" }, "7.0.0"), InputError);
});

test("mkExpectedAssets carries exactly name/size/rawSha256 for both assets", () => {
  assert.deepEqual(mkExpectedAssets(BUILT), {
    wheel: { name: WHEEL, size: 1234, rawSha256: WHEEL_SHA },
    checksum: { name: CHECKSUM, size: 99, rawSha256: CHECKSUM_SHA },
  });
});
