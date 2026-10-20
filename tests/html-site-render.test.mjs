import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { renderSite, renderMarkdown, validateArtifact } from "../plugins/html-guide-kit/skills/site/scripts/render-site.mjs";

const REPO = path.resolve(import.meta.dirname, "..");
const SKILL = path.join(REPO, "plugins/html-guide-kit/skills/site");
const EXAMPLE = path.join(SKILL, "examples/representative");
const TEMP = fs.realpathSync.native(os.tmpdir());
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const readJSON = file => JSON.parse(fs.readFileSync(file, "utf8"));
function copyTree(source, destination) {
  // fs.cpSync in the Windows Node 22 baseline mangles a non-ASCII target.
  // Primitive file operations retain the intended Unicode test paths.
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name), to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to); else fs.writeFileSync(to, fs.readFileSync(from));
  }
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(TEMP, "html-site-render-"));
  t.after(() => {
    const resolved = fs.realpathSync.native(root), relative = path.relative(TEMP, resolved);
    assert.ok(relative && !path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`) && path.basename(resolved).startsWith("html-site-render-"));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  const input = path.join(root, "材料 input"); copyTree(EXAMPLE, input);
  return { root, input, output: path.join(root, "网页 output") };
}
function changeConfig(input, change) {
  const file = path.join(input, "artifact.json"), config = readJSON(file); change(config);
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
}
function inventory(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? inventory(path.join(root, entry.name)).map(name => `${entry.name}/${name}`) : [entry.name]).sort();
}
function contrast(first, second) {
  const luminance = hex => hex.slice(1).match(/../g).map(value => Number.parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}

test("omitted and explicit warm-paper preserve default assets while neutral changes only the stylesheet", t => {
  const f = fixture(t), installedCSS = fs.readFileSync(path.join(SKILL, "assets/warm-paper/theme.css"));
  const sourceAssets = new Map(["theme.css", "learning.js", "shell.html"].map(name => [name, fs.readFileSync(path.join(SKILL, "assets/warm-paper", name))]));
  renderSite(f);
  const defaultFiles = inventory(f.output);
  assert.deepEqual(fs.readFileSync(path.join(f.output, "theme.css")), installedCSS);
  assert.equal(Object.hasOwn(readJSON(path.join(f.output, "artifact.json")), "theme"), false, "omission must not rewrite original metadata");
  for (const theme of ["warm-paper", "neutral"]) {
    changeConfig(f.input, config => { config.theme = theme; });
    const originals = new Map(inventory(f.input).map(relative => [relative, fs.readFileSync(path.join(f.input, relative))]));
    const output = path.join(f.root, theme);
    assert.equal(renderSite({ input: f.input, output }).status, "GENERATED");
    assert.deepEqual(inventory(output), defaultFiles, "themes must share the same resource closure");
    for (const [relative, bytes] of originals) {
      assert.deepEqual(fs.readFileSync(path.join(f.input, relative)), bytes, "selected input remains intact");
      assert.deepEqual(fs.readFileSync(path.join(output, relative)), bytes, "selected input is copied without rewriting");
    }
    for (const relative of defaultFiles.filter(name => !["theme.css", "artifact.json", "artifact-manifest.json"].includes(name))) assert.deepEqual(fs.readFileSync(path.join(output, relative)), fs.readFileSync(path.join(f.output, relative)), relative);
    const css = fs.readFileSync(path.join(output, "theme.css"));
    if (theme === "warm-paper") assert.deepEqual(css, installedCSS);
    else {
      assert.notDeepEqual(css, installedCSS);
      assert.deepEqual(css.subarray(0, installedCSS.length), installedCSS, "neutral must append its bounded override to the installed stylesheet");
      const variables = Object.fromEntries([...css.toString().matchAll(/(--[a-z-]+):\s*([^;]+);/g)].map(match => [match[1], match[2]]));
      assert.notEqual(variables["--paper"], "#faf9f5");
      assert.equal(variables["--serif"], "var(--sans)", "neutral headings use the existing local sans stack");
      for (const background of [variables["--paper"], variables["--wash"], "#ffffff"]) {
        for (const color of ["--ink", "--body", "--deep-clay"]) assert.ok(contrast(variables[color], background) >= 4.5, `${color} must support normal text against ${background}`);
        for (const color of ["--line", "--clay", "--deep-clay"]) assert.ok(contrast(variables[color], background) >= 3, `${color} must retain a distinguishable control/selection/focus boundary against ${background}`);
      }
      assert.ok(contrast("#ffffff", variables["--deep-clay"]) >= 4.5, "normal button text remains readable");
    }
    const manifest = readJSON(path.join(output, "artifact-manifest.json"));
    const declaredCSS = manifest.files.find(item => item.path === "theme.css");
    assert.equal(declaredCSS.sha256, hash(css)); assert.equal(declaredCSS.bytes, css.length);
    assert.equal(manifest.sourceSha256, hash(originals.get("artifact.json")));
  }
  for (const [name, bytes] of sourceAssets) assert.deepEqual(fs.readFileSync(path.join(SKILL, "assets/warm-paper", name)), bytes, "theme rendering must not alter installed assets");
});

test("unknown theme values and types fail before any output is created", t => {
  const f = fixture(t);
  for (const [index, theme] of ["", "dark", "Neutral", "../theme.css", "#fff", null, true, 1, [], {}].entries()) {
    changeConfig(f.input, config => { config.theme = theme; });
    const originals = new Map(inventory(f.input).map(relative => [relative, fs.readFileSync(path.join(f.input, relative))]));
    const output = path.join(f.root, `rejected-theme-${index}`);
    assert.throws(() => renderSite({ input: f.input, output }), /artifact\.theme/);
    assert.equal(fs.existsSync(output), false);
    for (const [relative, bytes] of originals) assert.deepEqual(fs.readFileSync(path.join(f.input, relative)), bytes);
  }
  const invalid = readJSON(path.join(f.input, "artifact.json")); invalid.theme = undefined;
  assert.throws(() => validateArtifact(invalid), /artifact\.theme/);
});

test("representative generation preserves selected inputs and independently verifiable hashes", t => {
  const f = fixture(t), inputs = new Map(inventory(f.input).map(relative => [relative, fs.readFileSync(path.join(f.input, relative))]));
  fs.writeFileSync(path.join(f.input, "unselected-private.txt"), "This must not be bundled.");
  const result = renderSite(f); assert.equal(result.status, "GENERATED"); assert.equal(result.understandingEffects, "NOT_MEASURED");
  const manifest = readJSON(path.join(f.output, "artifact-manifest.json"));
  assert.equal(manifest.sourceSha256, hash(inputs.get("artifact.json")));
  assert.equal(manifest.version, readJSON(path.join(f.input, "artifact.json")).version);
  assert.deepEqual(manifest.files.map(item => item.path).sort(), inventory(f.output).filter(relative => relative !== "artifact-manifest.json"));
  for (const item of manifest.files) { const bytes = fs.readFileSync(path.join(f.output, item.path)); assert.equal(item.sha256, hash(bytes)); assert.equal(item.bytes, bytes.length); }
  for (const [relative, bytes] of inputs) { assert.deepEqual(fs.readFileSync(path.join(f.output, relative)), bytes); assert.deepEqual(fs.readFileSync(path.join(f.input, relative)), bytes); }
  assert.equal(fs.existsSync(path.join(f.output, "unselected-private.txt")), false);
  const html = fs.readFileSync(path.join(f.output, "index.html"), "utf8");
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1);
  assert.ok(html.includes("2026-11-05")); assert.ok(html.includes("没有成功确认不等于已确认失败"));
  assert.ok(html.includes('href="#source-renewal-rules"'));
  const state = JSON.parse(html.match(/<script type="application\/json" id="artifact-state">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(state.activities, readJSON(path.join(f.input, "artifact.json")).activities);
});

test("installed renderer locates its own assets from an unrelated consumer directory", t => {
  const f = fixture(t), installed = path.join(f.root, "installed", "html-guide-kit", "skills", "site"), consumer = path.join(f.root, "consumer");
  fs.cpSync(path.join(REPO, "plugins/html-guide-kit"), path.resolve(installed, "../.."), { recursive: true }); fs.mkdirSync(consumer);
  fs.appendFileSync(path.join(installed, "assets/warm-paper/theme.css"), "\n/* isolated installed stylesheet */\n");
  const run = spawnSync(process.execPath, [path.join(installed, "scripts/render-site.mjs"), "--input", f.input, "--output", f.output], { cwd: consumer, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr); assert.equal(JSON.parse(run.stdout).status, "GENERATED");
  assert.deepEqual(fs.readFileSync(path.join(f.output, "theme.css")), fs.readFileSync(path.join(installed, "assets/warm-paper/theme.css")));
  assert.equal(fs.existsSync(path.join(consumer, "dist")), false);
});

test("bounded Markdown retains paragraphs, relations, code, links and heading hierarchy", () => {
  const rendered = renderMarkdown("# Core Name · 核心名称\n\n正文 **条件** 与 `x < y`。\n\n- 一项\n- 二项\n\n1. 开始\n2. 结束\n\n| 名称 | 值 |\n| --- | --- |\n| 条件 | 且 |\n\n```html\n<script>alert('teaching example')</script>\n```\n\n[依据](sources/rules.md) 和 [核心](#section-1)。", new Set(["sources/rules.md"]));
  assert.ok(rendered.html.includes('<h2 id="section-1">Core Name · 核心名称</h2>'));
  assert.ok(rendered.html.includes("<strong>条件</strong>")); assert.ok(rendered.html.includes("<code>x &lt; y</code>"));
  assert.ok(rendered.html.includes("&lt;script&gt;")); assert.ok(!rendered.html.includes("<script>"));
  assert.ok(rendered.html.includes('<th scope="col">名称</th>')); assert.deepEqual(rendered.links, ["sources/rules.md", "#section-1"]);
});

test("unsupported Markdown and broken links fail before creating output", t => {
  const cases = ["", "  nested", "> quote", "![image](photo.png)", "<script>alert(1)</script>", "##### deep heading", "- [ ] task", "*emphasis*", "```js\nunclosed", "[missing](absent.md)", "[missing](#absent)", "line  \nnext", "| head |\nnot a separator"];
  const f = fixture(t);
  for (const [index, markdown] of cases.entries()) {
    fs.writeFileSync(path.join(f.input, "content.md"), markdown);
    const output = path.join(f.root, `rejected-${index}`);
    assert.throws(() => renderSite({ input: f.input, output }), /Markdown/);
    assert.equal(fs.existsSync(output), false);
  }
});

test("configuration errors cannot silently produce a different activity or source", t => {
  const f = fixture(t), original = readJSON(path.join(f.input, "artifact.json"));
  const changes = [config => { delete config.sources[0].id; }, config => { delete config.activities[0].id; }, config => { config.activities[0].correctIndex = 99; }, config => { config.activities[0].sourceId = "missing"; }, config => { config.extra = true; }, config => { config.sources[0].url = "https://user:password@example.test/"; }, config => { config.terms[0].forbidden = [config.terms[0].english]; }];
  for (const change of changes) { const config = structuredClone(original); change(config); assert.throws(() => validateArtifact(config)); }
  fs.writeFileSync(path.join(f.input, "artifact.json"), '{"schemaVersion":1,"schemaVersion":2}');
  assert.throws(() => renderSite(f), /duplicate JSON key/); assert.equal(fs.existsSync(f.output), false);
  fs.writeFileSync(path.join(f.input, "artifact.json"), Buffer.from([0xff, 0x7b, 0x7d]));
  assert.throws(() => renderSite(f), /valid UTF-8 JSON/); assert.equal(fs.existsSync(f.output), false);
});

test("literal replacement markers and HTML in config remain inert and complete", t => {
  const f = fixture(t);
  changeConfig(f.input, config => { config.title = 'Names $& __BODY__ __STATE__ <img src=x onerror=alert(1)>'; config.activities[0].prompt = "</script><script>alert(2)</script>"; });
  renderSite(f);
  const html = fs.readFileSync(path.join(f.output, "index.html"), "utf8");
  assert.ok(html.includes('Names $&amp; __BODY__ __STATE__ &lt;img src=x onerror=alert(1)&gt;'));
  assert.equal([...html.matchAll(/<script(?:\s|>)/g)].length, 2);
  const state = JSON.parse(html.match(/<script type="application\/json" id="artifact-state">([\s\S]*?)<\/script>/)[1]);
  assert.equal(state.activities[0].prompt, "</script><script>alert(2)</script>");
});

test("traversal, resource collisions and existing output fail without changing inputs", t => {
  const f = fixture(t), original = fs.readFileSync(path.join(f.input, "artifact.json"));
  for (const relative of ["../outside.md", "C:/outside.md", "sources\\rules.md", "sources//rules.md", "artifact-manifest.json", "learning.js/source.md"]) {
    fs.writeFileSync(path.join(f.input, "artifact.json"), original); changeConfig(f.input, config => { config.sources[0].path = relative; });
    assert.throws(() => renderSite(f)); assert.equal(fs.existsSync(f.output), false);
  }
  fs.writeFileSync(path.join(f.input, "artifact.json"), original);
  assert.throws(() => renderSite({ input: f.input, output: path.join(f.input, "nested-output") }), /independent/);
  fs.mkdirSync(f.output); fs.writeFileSync(path.join(f.output, "keep.txt"), "keep");
  assert.throws(() => renderSite(f), /new directory/); assert.equal(fs.readFileSync(path.join(f.output, "keep.txt"), "utf8"), "keep");
});

test("plugin caches and borrowed input or output ancestors cannot be written", t => {
  const f = fixture(t), cache = path.join(f.root, ".codex", "plugins", "cache", "plugin");
  fs.mkdirSync(cache, { recursive: true }); assert.throws(() => renderSite({ input: f.input, output: path.join(cache, "generated") }), /plugin installation or cache/);
  assert.throws(() => renderSite({ input: f.input, output: path.join(SKILL, "generated-never-created") }), /plugin installation or cache/);
  const foreign = path.join(f.root, "foreign"), borrowed = path.join(f.input, "borrowed"), outputLink = path.join(f.root, "output-link");
  fs.mkdirSync(foreign); fs.writeFileSync(path.join(foreign, "source.md"), "foreign");
  try { fs.symlinkSync(foreign, borrowed, process.platform === "win32" ? "junction" : "dir"); fs.symlinkSync(foreign, outputLink, process.platform === "win32" ? "junction" : "dir"); }
  catch (error) { if (error.code === "EPERM") { t.skip("host cannot create a test symlink"); return; } throw error; }
  changeConfig(f.input, config => { config.sources[0].path = "borrowed/source.md"; });
  assert.throws(() => renderSite(f), /symlink or junction/); assert.equal(fs.existsSync(f.output), false);
  assert.throws(() => renderSite({ input: EXAMPLE, output: path.join(outputLink, "generated") }), /symlink or junction/);
  assert.equal(fs.existsSync(path.join(foreign, "generated")), false);
});

test("known terminology mismatches and invalid input bytes remain generation failures", t => {
  const f = fixture(t);
  fs.appendFileSync(path.join(f.input, "content.md"), "\n\n规则批准\n");
  assert.throws(() => renderSite(f), /known terminology mismatch/); assert.equal(fs.existsSync(f.output), false);
  fs.writeFileSync(path.join(f.input, "content.md"), Buffer.from([0xff]));
  assert.throws(() => renderSite(f), /encoded data/); assert.equal(fs.existsSync(f.output), false);
});

test("known English terms use case-insensitive word boundaries without rejecting Threshold", t => {
  const f = fixture(t);
  changeConfig(f.input, config => { config.terms = [{ english: "Threshold", chinese: "阈值", forbidden: ["old"] }]; });
  fs.appendFileSync(path.join(f.input, "content.md"), "\n\nThreshold threshold GOLD old_metric gold.\n");
  const firstOutput = path.join(f.root, "threshold-allowed");
  assert.equal(renderSite({ input: f.input, output: firstOutput }).status, "GENERATED");
  fs.appendFileSync(path.join(f.input, "content.md"), "\n\nOLD\n");
  assert.throws(() => renderSite(f), /known terminology mismatch: old/); assert.equal(fs.existsSync(f.output), false);
});

test("YAML frontmatter and Setext headings are rejected while separated thematic breaks remain valid", t => {
  const f = fixture(t);
  for (const markdown of ["---\ntitle: Core Name\n---\n\n正文", "---\n标题: 核心名称\n...\n\n正文", "---\n---\n\n正文", "---\nplain scalar\n\n---\n\n正文", "Core Name\n---", "Core Name\n==="]) {
    fs.writeFileSync(path.join(f.input, "content.md"), markdown);
    assert.throws(() => renderSite(f), /YAML frontmatter|[Ss]etext/); assert.equal(fs.existsSync(f.output), false);
  }
  const ordinary = renderMarkdown("# Core Name · 核心名称\n\n正文。\n\n---\n\n另一段。\n\n---");
  assert.equal([...ordinary.html.matchAll(/<hr>/g)].length, 2);
  assert.ok(ordinary.html.includes('id="section-1"'));
  assert.ok(renderMarkdown("---\n\n正文。").html.startsWith("<hr>"));
});

test("literal percent, Chinese and spaces in local filenames round-trip through browser URLs", t => {
  const f = fixture(t), markdownPath = "正文 %.md", sourcePath = "sources/renewal%20规则 空格.md";
  fs.renameSync(path.join(f.input, "content.md"), path.join(f.input, markdownPath));
  fs.renameSync(path.join(f.input, "sources/renewal-rules.md"), path.join(f.input, sourcePath));
  changeConfig(f.input, config => { config.markdown = markdownPath; config.sources[0].path = sourcePath; config.sources[0].url = "https://example.invalid/rules"; });
  const bodyPath = path.join(f.input, markdownPath), body = fs.readFileSync(bodyPath, "utf8").replace("sources/renewal-rules.md", sourcePath);
  fs.writeFileSync(bodyPath, body); renderSite(f);
  const html = fs.readFileSync(path.join(f.output, "index.html"), "utf8"), manifest = readJSON(path.join(f.output, "artifact-manifest.json"));
  assert.ok(manifest.files.some(item => item.path === sourcePath)); assert.ok(manifest.files.some(item => item.path === markdownPath));
  const links = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  const encodedSource = links.find(link => link.startsWith("sources/"));
  assert.ok(encodedSource.includes("%2520")); assert.ok(encodedSource.includes("%20"));
  const resolved = new URL(encodedSource, "https://example.invalid/artifact/");
  assert.equal(decodeURIComponent(resolved.pathname.slice("/artifact/".length)), sourcePath);
  const download = links.find(link => link.startsWith("%E6%AD%A3%E6%96%87")); assert.equal(decodeURIComponent(download), markdownPath);
  assert.deepEqual(fs.readFileSync(path.join(f.output, sourcePath)), fs.readFileSync(path.join(f.input, sourcePath)));
  assert.deepEqual(fs.readFileSync(path.join(f.output, markdownPath)), fs.readFileSync(path.join(f.input, markdownPath)));
  const state = JSON.parse(html.match(/<script type="application\/json" id="artifact-state">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(state.sources, readJSON(path.join(f.input, "artifact.json")).sources);
  assert.equal(state.sources[0].path, sourcePath); assert.equal(state.sources[0].url, "https://example.invalid/rules");
});

test("empty optional activities and terms still provide a static artifact and export", t => {
  const f = fixture(t); changeConfig(f.input, config => { config.activities = []; config.terms = []; }); renderSite(f);
  const html = fs.readFileSync(path.join(f.output, "index.html"), "utf8");
  assert.ok(!html.includes("data-activity=")); assert.ok(html.includes('id="reflection"')); assert.ok(html.includes('id="sources-heading"'));
});
