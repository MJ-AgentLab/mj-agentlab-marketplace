import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { frozenEvidenceResources } from "../scripts/frozen-evidence-resources.mjs";
import { documentResource, collectNavigationResources, sha256 } from "../scripts/document-harness.mjs";

const REPO = path.resolve(import.meta.dirname, ".."), DIRECTORY = "docs/runbook/evidence/html-guide-kit/pr2-reviewer/unit", INDEX = `${DIRECTORY}/index.json`;
function write(root, relative, bytes) {
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true }); fs.writeFileSync(path.join(root, relative), bytes);
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "frozen-resource-test-"));
  t.after(() => {
    const relative = path.relative(fs.realpathSync.native(os.tmpdir()), fs.realpathSync.native(root));
    assert.ok(relative && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  const content = '{"frozenOriginalPlan":true}\r\n';
  const packet = { schemaVersion: 1, kind: "lossless-reviewer-packet", scope: "root-control", entries: [{ relativeOriginalPath: "plan.json", originalAbsolutePath: "Z:/forbidden-original/plan.json", bytes: Buffer.byteLength(content), sha256: sha256(Buffer.from(content)), encoding: "utf8", content }] };
  const packetBytes = Buffer.from(JSON.stringify(packet, null, 2) + "\n"), identity = Buffer.from('{"historicalIdentity":true}\n');
  const descriptor = { file: "packets/root-control-001.json", scope: "root-control", bytes: packetBytes.length, sha256: sha256(packetBytes), fileCount: 1 };
  const index = { schemaVersion: 1, kind: "lossless-reviewer-evidence-index", sourceRoot: "Z:/forbidden-original", fileCount: 1, originalBytes: Buffer.byteLength(content), packets: [descriptor], files: [{ relativeOriginalPath: "plan.json", originalAbsolutePath: "Z:/forbidden-original/plan.json", bytes: packet.entries[0].bytes, sha256: packet.entries[0].sha256, encoding: "utf8", packet: descriptor.file, entryIndex: 0, jsonPointer: "/entries/0" }], pinnedOriginalByteSha256: { "plan.json": packet.entries[0].sha256 }, identityEvidenceSha256: sha256(identity) };
  const save = () => { write(root, INDEX, JSON.stringify(index)); write(root, `${DIRECTORY}/${descriptor.file}`, packetBytes); write(root, `${DIRECTORY}/identities.json`, identity); };
  save(); return { root, index, packet, descriptor, packetBytes, save };
}
const read = f => frozenEvidenceResources(f.root, INDEX, documentResource);

test("known frozen packet/control/inventory resources remain readable without following absolute provenance or redefining PLAN", t => {
  const f = fixture(t), original = fs.readFileSync(path.join(f.root, `${DIRECTORY}/${f.descriptor.file}`));
  const result = read(f);
  assert.equal(result.coverage.restoredFiles, 1); assert.equal(result.coverage.packets, 1);
  assert.deepEqual(result.resources, [`${DIRECTORY}/packets/root-control-001.json`, `${DIRECTORY}/identities.json`]);
  assert.match(result.coverage.semantics, /no model\/client rerun/);
  assert.ok(fs.readFileSync(path.join(f.root, `${DIRECTORY}/${f.descriptor.file}`)).equals(original));
  const closure = collectNavigationResources(f.root, [INDEX]);
  assert.ok(closure.includes(`${DIRECTORY}/packets/root-control-001.json`));
  assert.ok(!closure.some(file => file.includes("Z:")));
});

test("missing or modified packets/identities, changed inventory mapping, malformed types and traversal fail", t => {
  const f = fixture(t), packetPath = `${DIRECTORY}/${f.descriptor.file}`;
  fs.unlinkSync(path.join(f.root, packetPath)); assert.throws(() => read(f), /ENOENT/); f.save();
  fs.appendFileSync(path.join(f.root, packetPath), "changed"); assert.throws(() => read(f), /bytes\/hash differ/); f.save();
  fs.appendFileSync(path.join(f.root, `${DIRECTORY}/identities.json`), "changed"); assert.throws(() => read(f), /identity evidence bytes differ/); f.save();
  f.index.files[0].entryIndex = "0"; f.save(); assert.throws(() => read(f), /packet locator/);
  f.index.files[0].entryIndex = 1; f.save(); assert.throws(() => read(f), /exact packet entry/);
  f.index.files[0].entryIndex = 0; f.descriptor.sha256 = [sha256(f.packetBytes)]; f.save(); assert.throws(() => read(f), /bytes\/hash differ/);
  f.descriptor.sha256 = sha256(f.packetBytes); f.descriptor.file = "packets/../../escape.json"; f.save(); assert.throws(() => read(f), /public container/);
});

test("a matching outer packet digest cannot hide altered restored source bytes", t => {
  const f = fixture(t);
  f.packet.entries[0].content = f.packet.entries[0].content.replaceAll("\r\n", "\n");
  const changed = Buffer.from(JSON.stringify(f.packet));
  f.descriptor.sha256 = sha256(changed); f.descriptor.bytes = changed.length;
  write(f.root, INDEX, JSON.stringify(f.index)); write(f.root, `${DIRECTORY}/${f.descriptor.file}`, changed);
  assert.throws(() => read(f), /bytes\/hash differ/);
});

for (const [list, locator] of [["entries", "name"], ["rows", "relative"], ["files", "relative"], ["files", "archiveRelative"], ["files", "rel"]]) test(`known public receipt adapter ${list}.${locator} reads owned bytes only`, t => {
  const f = fixture(t), directory = "docs/runbook/evidence/html-guide-kit/pr3-post-merge/test", file = `${directory}/archive-index.json`, bytes = Buffer.from("original receipt\r\n");
  write(f.root, `${directory}/raw/receipt.txt`, bytes);
  const value = { [list]: [{ [locator]: "raw/receipt.txt", bytes: bytes.length, sha256: sha256(bytes), source: "Z:/not-readable", file: "Z:/not-readable" }] };
  // In the rel generation, file is explicitly original provenance, not a dependency.
  write(f.root, file, JSON.stringify(value));
  const result = frozenEvidenceResources(f.root, file, documentResource);
  assert.equal(result.coverage.receipts, 1); assert.deepEqual(result.resources, [`${directory}/raw/receipt.txt`]);
  fs.unlinkSync(path.join(f.root, `${directory}/raw/receipt.txt`));
  assert.throws(() => frozenEvidenceResources(f.root, file, documentResource), /ENOENT/);
});

test("actual original HTML PR2 frozen scope restores 247 original files including its pinned control and plan", () => {
  const result = frozenEvidenceResources(REPO, "docs/runbook/evidence/html-guide-kit/pr2-reviewer/final/index.json", documentResource);
  assert.equal(result.coverage.restoredFiles, 247); assert.equal(result.coverage.packets, 10);
  assert.ok(result.resources.includes("docs/runbook/evidence/html-guide-kit/pr2-reviewer/final/packets/root-control-001.json"));
});
