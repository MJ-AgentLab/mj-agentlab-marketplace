import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scripts = path.join(repo, "plugins/html-guide-kit/skills/site/scripts");
const hash = data => createHash("sha256").update(data).digest("hex");
let interpreter;
function python() {
  if (interpreter) return interpreter;
  const candidates = [];
  if (process.env.HTML_SITE_PYTHON || process.env.PYTHON) candidates.push([process.env.HTML_SITE_PYTHON || process.env.PYTHON, []]);
  candidates.push(["python3", []], ["python", []], ["py", ["-3"]]);
  for (const [command, args] of candidates) {
    const probe = spawnSync(command, [...args, "-c", "import sys; raise SystemExit(0 if sys.version_info >= (3,10) else 1)"], { encoding: "utf8", shell: false, timeout: 10000 });
    if (!probe.error && probe.status === 0) return interpreter = { command, args };
  }
  assert.fail("HTML artifact checks require actual Python >=3.10; use PYTHON or HTML_SITE_PYTHON. Tests cannot claim PASS without executing Python.");
}

function run(script, args, timeout = 30000) {
  const py = python();
  const result = spawnSync(py.command, [...py.args, path.join(scripts, script), ...args], {
    cwd: os.tmpdir(), encoding: "utf8", shell: false, timeout,
    env: { ...process.env, PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" }, maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(result.error, undefined, result.error?.message);
  let report;
  try { report = JSON.parse(result.stdout); }
  catch { assert.fail(`Checker must return structured JSON: ${result.stdout}\n${result.stderr}`); }
  return { ...result, report };
}

function fixture(t, body = '<h1>Understanding Needs 理解需求</h1><p>Evidence 证据支持主张。</p><a href="source.md">查看原材料</a><a href="#source-local">查看依据</a><section id="source-local">来源定位</section>') {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "html-checks-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const root = path.join(temporary, "材料 a b 'q");
  fs.mkdirSync(root);
  const artifact = { schemaVersion: 1, title: "Understanding Needs 理解需求", version: "1.0.0", audience: "新读者", task: "区分主张及其支持", goals: ["给主张找到证据"], markdown: "material.md", sources: [{ id: "local", title: "原材料", path: "source.md", locator: "第一节" }], terms: [{ english: "Evidence", chinese: "证据", forbidden: ["证物错误译名"] }], activities: [] };
  fs.writeFileSync(path.join(root, "artifact.json"), JSON.stringify(artifact));
  fs.writeFileSync(path.join(root, "index.html"), `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Understanding Needs</title><link rel="stylesheet" href="theme.css"><script src="learning.js" defer></script></head><body>${body}</body></html>`);
  fs.writeFileSync(path.join(root, "theme.css"), "body{margin:24px;color:#252521;background:#faf9f5;font:18px system-ui}h1{font-size:28px}");
  fs.writeFileSync(path.join(root, "learning.js"), '"use strict";');
  fs.writeFileSync(path.join(root, "material.md"), "# Understanding Needs\n\n理解需求。\n");
  fs.writeFileSync(path.join(root, "source.md"), "主张需要相应的证据。\n");
  function manifest() {
    const files = fs.readdirSync(root).filter(name => name !== "artifact-manifest.json").map(name => {
      const bytes = fs.readFileSync(path.join(root, name));
      return { path: name, sha256: hash(bytes), bytes: bytes.length };
    });
    fs.writeFileSync(path.join(root, "artifact-manifest.json"), JSON.stringify({ schemaVersion: 1, artifactPath: "artifact.json", sourceSha256: hash(fs.readFileSync(path.join(root, "artifact.json"))), version: artifact.version, files }));
  }
  manifest();
  return { root, temporary, artifact, manifest };
}

function failed(report, prefix) {
  return report.checks.some(item => item.status === "FAIL" && item.code.startsWith(prefix));
}

test("static checker executes Python from unrelated cwd and preserves complete source/hash evidence", t => {
  const f = fixture(t);
  const output = path.join(f.temporary, "static.json");
  const result = run("check_artifact.py", ["--input", f.root, "--output", output]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.report.status, "PASS");
  assert.equal(result.report.summary.pages, 1);
  assert.equal(result.report.summary.files, 6);
  assert.deepEqual(JSON.parse(fs.readFileSync(output)), result.report);
  const before = fs.readFileSync(output);
  const second = run("check_artifact.py", ["--input", f.root, "--output", output]);
  assert.equal(second.status, 2);
  assert.equal(second.report.status, "NOT_RUN");
  assert.deepEqual(fs.readFileSync(output), before, "existing evidence cannot be overwritten");
});

test("static checker detects stale bytes, unknown files and changed schema/version", t => {
  const f = fixture(t);
  fs.appendFileSync(path.join(f.root, "material.md"), "被更改");
  fs.writeFileSync(path.join(f.root, "unintended.env"), "NOT_A_REAL_SECRET=fixture");
  f.artifact.schemaVersion = 2;
  f.artifact.version = "2.0.0";
  fs.writeFileSync(path.join(f.root, "artifact.json"), JSON.stringify(f.artifact));
  const result = run("check_artifact.py", ["--input", f.root]);
  assert.equal(result.status, 1);
  assert.equal(result.report.status, "FAIL");
  assert.ok(failed(result.report, "artifact:schema-version"));
  assert.ok(failed(result.report, "manifest:version"));
  assert.ok(failed(result.report, "manifest:source-hash"));
  assert.ok(failed(result.report, "manifest:complete-unique-files"));
  assert.ok(result.report.checks.some(item => item.status === "FAIL" && item.code.startsWith("manifest:") && item.code.endsWith(":bytes")));
});

test("static checker rejects missing anchors, decoded traversal, remote resources and known forbidden terms", t => {
  const f = fixture(t, '<h1>Evidence 证据</h1><p>证物错误译名</p><a href="#missing">错误锚点</a><a href="%2e%2e/outside.md">逃逸</a><script src="https://example.invalid/x.js"></script><script type="module">import("https://example.invalid/module.js")</script>');
  fs.appendFileSync(path.join(f.root, "theme.css"), '@import "https://example.invalid/font.css"; .x{background:url(https\\3a //example.invalid/pixel.png)}');
  f.manifest();
  const result = run("check_artifact.py", ["--input", f.root]);
  assert.equal(result.status, 1);
  assert.ok(failed(result.report, "index.html:a:"));
  assert.ok(failed(result.report, "index.html:script:"));
  assert.ok(failed(result.report, "index.html:inline-script:"));
  assert.ok(failed(result.report, "theme.css:resource:"));
  assert.ok(failed(result.report, "index.html:term:"));
});

test("static checker rejects source path escape and invalid answer criteria even with consistent hashes", t => {
  const f = fixture(t);
  f.artifact.sources[0].path = "../outside.md";
  f.artifact.activities = [{ id: "q-one", type: "choice", title: "核对", prompt: "请选择", options: [{ label: "甲", feedback: "条件甲" }, { label: "乙", feedback: "条件乙" }], correctIndex: 9, reference: "依据", sourceId: "missing" }];
  fs.writeFileSync(path.join(f.root, "artifact.json"), JSON.stringify(f.artifact));
  f.manifest();
  const result = run("check_artifact.py", ["--input", f.root]);
  assert.equal(result.status, 1);
  assert.ok(failed(result.report, "source:0:file"));
  assert.ok(failed(result.report, "activity:0:type-id-source"));
  assert.ok(failed(result.report, "activity:0:answer"));
});

test("browser unavailable is NOT_RUN with nonzero exit and a persisted missing-scope record", t => {
  const f = fixture(t);
  const output = path.join(f.temporary, "missing-browser.json");
  const shots = path.join(f.temporary, "missing-shots");
  const result = run("check_renderings.py", ["--input", f.root, "--browser", path.join(f.temporary, "absent-browser.exe"), "--screenshots", shots, "--output", output]);
  assert.equal(result.status, 2);
  assert.equal(result.report.status, "NOT_RUN");
  assert.deepEqual(result.report.viewports, []);
  assert.equal(fs.existsSync(shots), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(output)), result.report);
});

function browser() {
  if (process.env.HTML_SITE_BROWSER) return process.env.HTML_SITE_BROWSER;
  for (const base of [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(Boolean)) {
    for (const relative of ["Google/Chrome/Application/chrome.exe", "Microsoft/Edge/Application/msedge.exe"]) {
      const executable = path.join(base, relative);
      if (fs.existsSync(executable)) return executable;
    }
  }
  for (const base of (process.env.PATH || "").split(path.delimiter)) {
    for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "msedge"]) {
      const executable = path.join(base, name);
      if (fs.existsSync(executable)) return executable;
    }
  }
  return null;
}

test("actual browser measures mobile/desktop viewport sizes and detects overflow, clipping and extreme wrapping", { timeout: 100000 }, t => {
  const executable = browser();
  if (!executable) {
    t.skip("Local Chromium unavailable: actual layout tests NOT_RUN; missing-browser behavior was executed separately.");
    return;
  }
  const f = fixture(t);
  const goodShots = path.join(f.temporary, "good-shots");
  const before = hash(fs.readFileSync(path.join(f.root, "index.html")));
  const good = run("check_renderings.py", ["--input", f.root, "--browser", executable, "--screenshots", goodShots], 45000);
  assert.equal(good.status, 0, good.stdout + good.stderr);
  assert.equal(good.report.status, "PASS");
  assert.deepEqual(good.report.viewports.map(v => v.viewport), [{ width: 1366, height: 900 }, { width: 390, height: 844 }]);
  for (const v of good.report.viewports) {
    const pixels = fs.readFileSync(path.join(goodShots, v.screenshot));
    assert.equal(pixels.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(pixels.readUInt32BE(16), v.viewport.width);
    assert.equal(pixels.readUInt32BE(20), v.viewport.height);
    assert.equal(hash(pixels), v.screenshotSha256);
  }
  assert.equal(hash(fs.readFileSync(path.join(f.root, "index.html"))), before, "browser checks must leave original bytes intact");
  fs.appendFileSync(path.join(f.root, "theme.css"), ".wide{width:1800px}.clip{overflow:hidden;width:120px;height:16px}.clip span{display:block;width:500px;height:100px}.wrap{width:12px;word-break:break-all}");
  fs.writeFileSync(path.join(f.root, "index.html"), fs.readFileSync(path.join(f.root, "index.html"), "utf8").replace("</body>", '<div class="wide">横向溢出</div><div class="clip"><span>裁切</span></div><p class="wrap">这是用于检测极端异常换行的长句内容</p></body>'));
  const bad = run("check_renderings.py", ["--input", f.root, "--browser", executable, "--screenshots", path.join(f.temporary, "bad-shots"), "--viewport", "390x844"], 45000);
  assert.equal(bad.status, 1, bad.stdout + bad.stderr);
  const codes = bad.report.viewports.flatMap(v => v.issues.map(issue => issue.code));
  for (const code of ["horizontal-overflow", "severe-horizontal-clipping", "severe-vertical-clipping", "extreme-text-wrapping"]) assert.ok(codes.includes(code), `${code}: ${bad.stdout}`);
});
