import test from "node:test";
import assert from "node:assert/strict";
import {runRelease,extractChangelogSection,parseReleaseFromList,DRAFT_VISIBILITY_BACKOFF_MS} from "../scripts/run-release.mjs";
import {PolicyError,InputError,normalizeNotes} from "../scripts/resolve-release-state.mjs";
const SHA="a".repeat(40), OTHER="b".repeat(40), VERSION="8.0.0", NOTES="### Changed\n\n- Git distribution\n";
function makeIo({draft=false,published=false,lag=0,rel={},mutateProbe,install={ok:true}}={}) {
  const calls=[], sleeps=[]; let probes=0;
  const io={calls,sleeps,log(){},sleep:async ms=>sleeps.push(ms),
    resolveRelease:async()=>({releaseSha:SHA,mainTipSha:SHA,releaseShaIsMainAncestor:true,version:VERSION,targetCommitVersion:VERSION,targetNotes:NOTES,immutabilityEnabled:false,...rel}),
    probe:async()=>{probes++;const hidden=draft&&!published&&lag-->0;
      const state={tag:published?{present:true,sha:SHA}:{present:false},release:(draft||published)&&!hidden?{present:true,id:5,tag:'v'+VERSION,name:'v'+VERSION,targetCommitish:SHA,isDraft:!published,isPrerelease:false,body:NOTES,assets:[]}:{present:false}};
      return mutateProbe?.(state,probes)??state;},
    createDraft:async()=>{calls.push("createDraft");draft=true;},
    verifyInstall:async canonical=>{calls.push("verifyInstall");assert.equal(canonical.sha,SHA);return install;},
    publish:async()=>{calls.push("publish");published=true;},
    postPublish:async()=>{calls.push("postPublish");}
  }; return io;
}
test("fresh empty draft verifies canonical install then publishes",async()=>{
  const io=makeIo();assert.equal((await runRelease(io)).result,"published");
  assert.deepEqual(io.calls,["createDraft","verifyInstall","publish","postPublish"]);
});
test("draft resume does not build or upload attachments",async()=>{
  const io=makeIo({draft:true});await runRelease(io);
  assert.deepEqual(io.calls,["verifyInstall","publish","postPublish"]);
});
test("correct published release is read-only noop",async()=>{
  const io=makeIo({published:true});assert.equal((await runRelease(io)).result,"noop");assert.deepEqual(io.calls,[]);
});
test("installation failure never publishes",async()=>{
  for(const install of [undefined,{ok:false},{}]) {
    const io=makeIo({draft:true,install:install??{}});await assert.rejects(runRelease(io),PolicyError);
    assert.deepEqual(io.calls,["verifyInstall"]);
  }
});
test("foreign attachment, tag or body on a draft fail before mutations",async()=>{
  for(const changes of [{assets:[{name:"foreign"}]},{body:"drift"},{targetCommitish:OTHER}]) {
    const io=makeIo({draft:true,mutateProbe:s=>({...s,release:{...s.release,...changes}})});
    await assert.rejects(runRelease(io),PolicyError);assert.deepEqual(io.calls,[]);
  }
});
test("adjacent-to-publish query blocks changes after install",async()=>{
  for(const changes of [{body:"drift"},{assets:[{name:"foreign"}]},{targetCommitish:OTHER},{present:false}]) {
    const io=makeIo({draft:true,mutateProbe:(s,n)=>n>1?{...s,release:{...s.release,...changes}}:s});
    await assert.rejects(runRelease(io),PolicyError);assert.deepEqual(io.calls,["verifyInstall"]);
  }
});
test("non-main and stale first release commits fail closed",async()=>{
  for(const rel of [{releaseShaIsMainAncestor:false},{mainTipSha:OTHER}]) {
    const io=makeIo({rel});await assert.rejects(runRelease(io),PolicyError);assert.deepEqual(io.calls,[]);
  }
});
test("draft list lag uses bounded backoff and a single create",async()=>{
  const io=makeIo({lag:3});await runRelease(io);
  assert.deepEqual(io.sleeps,DRAFT_VISIBILITY_BACKOFF_MS.slice(0,3));
  assert.deepEqual(io.calls,["createDraft","verifyInstall","publish","postPublish"]);
});
test("never-visible draft fails closed without retrying create",async()=>{
  const io=makeIo({lag:100});await assert.rejects(runRelease(io),PolicyError);
  assert.deepEqual(io.sleeps,DRAFT_VISIBILITY_BACKOFF_MS);assert.deepEqual(io.calls,["createDraft"]);
});
test("foreign draft observed after create is never treated as lag",async()=>{
  const io=makeIo({mutateProbe:(s,n)=>n>1?{...s,release:{...s.release,body:"foreign"}}:s});
  await assert.rejects(runRelease(io),PolicyError);assert.deepEqual(io.sleeps,[]);assert.deepEqual(io.calls,["createDraft"]);
});
test("extractChangelogSection pulls the body under the version heading only", () => {
  const cl = [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    "## [8.0.0] - 2026-07-20",
    "",
    "### Added",
    "- a thing",
    "",
    "## [6.3.1] - 2026-06-15",
    "",
    "- older",
  ].join("\n");
  const s = extractChangelogSection(cl, VERSION);
  assert.match(s, /### Added/);
  assert.match(s, /- a thing/);
  assert.doesNotMatch(s, /older/);
  assert.doesNotMatch(s, /Unreleased/);
  assert.equal(normalizeNotes(s), "### Added\n- a thing");
});

test("extractChangelogSection returns empty for a missing version", () => {
  assert.equal(extractChangelogSection("## [1.0.0]\n\n- x\n", VERSION), "");
});

test("extractChangelogSection does not confuse 8.0.0 with 8.0.00-style prefixes", () => {
  const cl = "## [8.0.0] - d\n\n- real\n\n## [8.0.0-rc] - d\n\n- rc\n";
  assert.match(extractChangelogSection(cl, VERSION), /real/);
  assert.doesNotMatch(extractChangelogSection(cl, VERSION), /rc/);
});

test("parseReleaseFromList finds a draft by tag_name and maps its fields", () => {
  const list = [
    { id: 1, tag_name: "v6.3.1", draft: false },
    { id: 2, tag_name: "v8.0.0", name: "v8.0.0", target_commitish: SHA, draft: true, prerelease: false, body: NOTES, assets: [{ id: 3, name: "unexpected.zip", state: "uploaded", size: 1234, digest: "sha256:" + "a".repeat(64) }] },
  ];
  const r = parseReleaseFromList(list, VERSION);
  assert.equal(r.present, true);
  assert.equal(r.isDraft, true);
  assert.equal(r.targetCommitish, SHA);
  assert.equal(r.assets.length, 1);
  assert.equal(r.assets[0].digest, "sha256:" + "a".repeat(64));
});

test("parseReleaseFromList reports absence when nothing matches", () => {
  assert.deepEqual(parseReleaseFromList([{ id: 1, tag_name: "v1.0.0" }], VERSION), { present: false });
});

test("parseReleaseFromList refuses to guess between duplicate tags", () => {
  assert.throws(() => parseReleaseFromList([{ tag_name: "v8.0.0" }, { tag_name: "v8.0.0" }], VERSION), PolicyError);
});

test("parseReleaseFromList treats a branch-name target_commitish as no binding", () => {
  const r = parseReleaseFromList([{ id: 2, tag_name: "v8.0.0", target_commitish: "main", draft: false, assets: [] }], VERSION);
  assert.equal(r.targetCommitish, undefined);
});

test("parseReleaseFromList rejects a non-array response", () => {
  assert.throws(() => parseReleaseFromList({ not: "an array" }, VERSION), InputError);
});

test("API parser rejects unknown asset state instead of pretending it is empty",()=>{
 for(const assets of [undefined,null,{},'[]']) assert.throws(()=>parseReleaseFromList([{tag_name:'v'+VERSION,assets}],VERSION),InputError);
});
