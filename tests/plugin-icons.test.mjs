import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PNG } from "pngjs";
import { validatePluginIcons, assertInstalledIcons, resolveIconPath, inspectPng, ICON_LIMITS } from "../scripts/plugin-icons.mjs";
import { exportSvg } from "../scripts/export-icons.mjs";
import { validateManifest, validateRepository } from "../scripts/validate-portable.mjs";
import { validateBrandAssets } from "../scripts/brand-assets.mjs";

const repo = path.resolve(import.meta.dirname, "..");
const manifest = () => ({ name: "future-workflow-kit", extensions: { "com.openai": { interface: { logo: "./assets/icon.png", composerIcon: "./assets/icon.png" } } } });
const ui = m => m.extensions["com.openai"].interface;
function png(width = 48, height = width, color = [18, 108, 176, 255]) {
  const image = new PNG({ width, height });
  for (let i = 0; i < image.data.length; i += 4) image.data.set(color, i);
  return PNG.sync.write(image);
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "plugin-icons-"));
  t.after(() => {
    const rel = path.relative(fs.realpathSync.native(os.tmpdir()), fs.realpathSync.native(root));
    assert.ok(rel && !rel.startsWith("..") && !path.isAbsolute(rel));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(root, "assets"));
  fs.writeFileSync(path.join(root, "assets/icon.png"), png());
  const m = manifest(); fs.writeFileSync(path.join(root, "plugin.json"), JSON.stringify(m));
  return { root, m, file: path.join(root, "assets/icon.png") };
}

test("new plugin name receives full generic icon validation without changing registration authority", t => {
  const { root, m } = fixture(t), result = validatePluginIcons(m, root);
  assert.equal(result.logo.width, 48); assert.equal(result.logo.sha256, result.composerIcon.sha256);
  assert.equal(result.logo.reference, "./assets/icon.png");
  const canonical = JSON.parse(fs.readFileSync(path.join(repo, "plugins/diagram-kit/plugin.json")));
  canonical.name = m.name; assert.throws(() => validateManifest(canonical), /identity/);
});

test("required and optional Dark fields validate types and resources", t => {
  const { root, m } = fixture(t);
  for (const field of ["logo", "composerIcon"]) {
    const copy = structuredClone(m); delete ui(copy)[field]; assert.throws(() => validatePluginIcons(copy, root), new RegExp(field));
  }
  for (const field of ["logo", "composerIcon", "logoDark", "composerIconDark"]) for (const value of [null, 3, "", [], "./assets/missing.png"]) {
    const copy = structuredClone(m); ui(copy)[field] = value; assert.throws(() => validatePluginIcons(copy, root), new RegExp(field));
  }
  ui(m).logoDark = "./assets/icon.png"; ui(m).composerIconDark = "./assets/icon.png";
  assert.equal(Object.keys(validatePluginIcons(m, root)).length, 4);
});

test("icon paths reject escape, platform paths, URLs, traversal and unsupported extensions", t => {
  const { root, m } = fixture(t);
  for (const reference of ["../outside.png", "./../outside.png", "./assets/../icon.png", "./assets//icon.png", "./assets/./icon.png", "/tmp/icon.png", "C:/icon.png", "./C:/icon.png", "https://example.test/icon.png", "./assets\\icon.png", "./assets/icon.png\0", "./assets/icon.jpg"]) {
    ui(m).logo = reference; assert.throws(() => validatePluginIcons(m, root), /interface.logo/);
  }
  ui(m).logo = "./assets"; assert.throws(() => validatePluginIcons(m, root));
  fs.mkdirSync(path.join(root, "assets/directory.png"));
  assert.throws(() => resolveIconPath(root, "./assets/directory.png"), /ordinary/);
});

test("PNG decoder rejects corrupted pixels and CRC, wrong content and missing data", t => {
  const { root, m, file } = fixture(t), good = png();
  const crc = Buffer.from(good); crc[29] ^= 1;
  const data = Buffer.from(good); data[45] ^= 1;
  for (const bytes of [Buffer.from("not PNG"), good.subarray(0, 33), crc, data, good.subarray(0, good.length - 15)]) {
    fs.writeFileSync(file, bytes); assert.throws(() => validatePluginIcons(m, root));
  }
  fs.writeFileSync(file, good); assert.equal(validatePluginIcons(m, root).logo.width, 48);
});

test("square, minimum, dimension maximum and byte maximum are checked before decode", t => {
  const { root, m, file } = fixture(t);
  for (const bytes of [png(64, 48), png(47), Buffer.alloc(ICON_LIMITS.bytes + 1)]) {
    fs.writeFileSync(file, bytes); assert.throws(() => validatePluginIcons(m, root));
  }
  const oversized = png(); oversized.writeUInt32BE(4097, 16); oversized.writeUInt32BE(4097, 20);
  fs.writeFileSync(file, oversized); assert.throws(() => validatePluginIcons(m, root), /dimensions/);
});

test("symlink and Windows junction components are rejected even when they point inside the package", t => {
  const { root, m } = fixture(t), linked = path.join(root, "assets/link");
  const owned = path.join(root, "owned"); fs.mkdirSync(owned); fs.writeFileSync(path.join(owned, "icon.png"), png());
  fs.symlinkSync(owned, linked, process.platform === "win32" ? "junction" : "dir");
  ui(m).logo = "./assets/link/icon.png";
  assert.throws(() => validatePluginIcons(m, root), /symlink|reparse/);
  fs.unlinkSync(linked);
  const outside = fixture(t).root; fs.writeFileSync(path.join(outside, "icon.png"), png());
  fs.symlinkSync(outside, linked, process.platform === "win32" ? "junction" : "dir");
  assert.throws(() => validatePluginIcons(m, root), /symlink|reparse/); fs.unlinkSync(linked);
});

test("installed comparison rejects missing resources, content drift, reference drift and Dark-field loss", t => {
  const source = fixture(t), installed = fixture(t);
  assert.doesNotThrow(() => assertInstalledIcons(source.root, installed.root));
  fs.unlinkSync(installed.file); assert.throws(() => assertInstalledIcons(source.root, installed.root));
  fs.writeFileSync(installed.file, png(48, 48, [1, 2, 3, 255])); assert.throws(() => assertInstalledIcons(source.root, installed.root), /differs/);
  fs.writeFileSync(installed.file, png()); fs.copyFileSync(installed.file, path.join(installed.root, "assets/other.png"));
  const m = manifest(); ui(m).logo = "./assets/other.png"; fs.writeFileSync(path.join(installed.root, "plugin.json"), JSON.stringify(m));
  assert.throws(() => assertInstalledIcons(source.root, installed.root), /differs/);
  fs.writeFileSync(path.join(installed.root, "plugin.json"), JSON.stringify(manifest()));
  ui(source.m).logoDark = "./assets/icon.png"; fs.writeFileSync(path.join(source.root, "plugin.json"), JSON.stringify(source.m));
  assert.throws(() => assertInstalledIcons(source.root, installed.root), /differs/);
});

test("SVG export renders real pixel colors and native size rather than only a valid header", t => {
  const { root } = fixture(t), input = path.join(root, "source.svg"), output = path.join(root, "render.png");
  fs.writeFileSync(input, '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#223D66"/><rect x="32" y="32" width="64" height="64" fill="#37C3D2"/></svg>');
  for (const size of [32, 48, 64, 1024]) {
    exportSvg({ input, output, size }); const decoded = PNG.sync.read(fs.readFileSync(output));
    assert.equal(decoded.width, size); assert.equal(decoded.height, size);
    assert.deepEqual([...decoded.data.subarray(0, 4)], [34, 61, 102, 255]);
    const offset = ((size / 2) * size + size / 2) * 4;
    assert.deepEqual([...decoded.data.subarray(offset, offset + 4)], [55, 195, 210, 255]);
  }
  assert.equal(inspectPng(output).width, 1024);
  fs.writeFileSync(input, '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="64"/>');
  assert.throws(() => exportSvg({ input, output }), /square/);
  fs.writeFileSync(input, '<svg broken'); assert.throws(() => exportSvg({ input, output }));
});

test("repository validation fails when a registered plugin loses its icon resource", t => {
  const { root } = fixture(t), isolated = path.join(root, "repo"); fs.mkdirSync(isolated);
  for (const rel of ["assets", ".agents", ".codex", ".github", "scripts", "tests", "plugins", "docs", "AGENTS.md", "README.md", "CONTRIBUTING.md", "GLOSSARY.md", "CHANGELOG.md", "VERSION"]) fs.cpSync(path.join(repo, rel), path.join(isolated, rel), { recursive: true });
  assert.equal(validateRepository(isolated).ok, true);
  fs.unlinkSync(path.join(isolated, "plugins/explain-kit/assets/icon.png"));
  const result = validateRepository(isolated); assert.equal(result.ok, false); assert.ok(result.errors.some(e => e.includes("explain-kit icons")));
});

test("brand verification detects original-reference drift, theme drift and wrong native-preview size", t => {
  const { root } = fixture(t), isolated = path.join(root, "repo"); fs.mkdirSync(isolated);
  fs.cpSync(path.join(repo, "assets"), path.join(isolated, "assets"), { recursive: true });
  fs.cpSync(path.join(repo, "plugins"), path.join(isolated, "plugins"), { recursive: true });
  assert.equal(validateBrandAssets(isolated).icons, 7);
  const original = path.join(isolated, "assets/brand/references/team-logo-original.png"), bytes = fs.readFileSync(original);
  fs.writeFileSync(original, png()); assert.throws(() => validateBrandAssets(isolated), /recorded original/); fs.writeFileSync(original, bytes);
  const source = path.join(isolated, "plugins/diagram-kit/assets/icon.svg"), svg = fs.readFileSync(source, "utf8");
  fs.writeFileSync(source, svg.replaceAll("#223D66", "#FF0000")); assert.throws(() => validateBrandAssets(isolated), /palette drift/);
  fs.writeFileSync(source, svg.replaceAll('x2="100%"', 'x2="0%"')); assert.throws(() => validateBrandAssets(isolated), /gradient drift/); fs.writeFileSync(source, svg);
  fs.writeFileSync(path.join(isolated, "assets/brand/previews/diagram-kit-32.png"), png(48)); assert.throws(() => validateBrandAssets(isolated), /dimensions/);
});
