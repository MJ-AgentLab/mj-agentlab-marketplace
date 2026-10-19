import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { captureBrowserStderr } from "./helpers/capture-browser-stderr.mjs";

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

test("self-consistent material declarations cannot hide generated HTML or scripts from checks", t => {
  for (const declaration of [
    { kind: "source", name: "index.html" },
    { kind: "source", name: "INDEX.HTML" },
    { kind: "source", name: "learning.js" },
    { kind: "markdown", name: "index.html" },
    { kind: "source", name: "artifact-manifest.json" },
  ]) {
    const f = fixture(t);
    if (declaration.kind === "source") f.artifact.sources[0].path = declaration.name;
    else f.artifact.markdown = declaration.name;
    fs.writeFileSync(path.join(f.root, "artifact.json"), JSON.stringify(f.artifact));
    fs.writeFileSync(path.join(f.root, "index.html"), "<p>缺少完整文档结构</p>");
    fs.writeFileSync(path.join(f.root, "learning.js"), 'import("https://example.invalid/remote.js")');
    f.manifest();
    const result = run("check_artifact.py", ["--input", f.root]);
    assert.equal(result.status, 1, `${declaration.kind}:${declaration.name}: ${result.stdout}`);
    assert.equal(result.report.status, "FAIL");
    assert.equal(result.report.summary.pages, 1, "index.html must be inspected despite material declarations");
    assert.ok(failed(result.report, "index.html:structure"));
    assert.ok(failed(result.report, "learning.js:import:"));
    assert.ok(failed(result.report, declaration.kind === "source" ? "source:0:file" : "artifact:markdown-file"));
    assert.equal(failed(result.report, "manifest:source-hash"), false, "fixture hashes are self-consistent");
    assert.equal(failed(result.report, "manifest:complete-unique-files"), false, "fixture inventory is complete");
  }
});

test("static source URLs reject embedded credentials while passive local source formats remain valid", t => {
  const f = fixture(t);
  f.artifact.sources.push({ id: "remote", title: "定位", url: "https://fixture-user:fixture-password@example.invalid/source", locator: "第一节" });
  fs.writeFileSync(path.join(f.root, "artifact.json"), JSON.stringify(f.artifact));
  f.manifest();
  const result = run("check_artifact.py", ["--input", f.root]);
  assert.equal(result.status, 1);
  assert.ok(failed(result.report, "source:1:url"));
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

test("browser workspace cleanup retries actual late-file ENOTEMPTY and fails closed on persistent writes", () => {
  const py = python();
  const cases = String.raw`
import errno, importlib.util, json, os, pathlib, shutil, signal, subprocess, sys, tempfile, time
from unittest.mock import patch
spec = importlib.util.spec_from_file_location('layout_checker', sys.argv[1])
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)
real_rmdir = os.rmdir
results = []
for persistent in (False, True):
    root = pathlib.Path(tempfile.mkdtemp(prefix='html-site-layout-'))
    (root/'profile').mkdir()
    (root/'profile'/'cache').write_text('initial browser cache')
    calls = [0]
    lifecycle = []
    def late_write(directory, *args, **kwargs):
        if pathlib.Path(directory) == root and (persistent or calls[0] == 0):
            calls[0] += 1
            (root/'late-cache').write_text('late profile writer')
        return real_rmdir(directory, *args, **kwargs)
    try:
        with patch.object(os, 'rmdir', side_effect=late_write):
            if persistent:
                try:
                    qa.cleanup_workspace(root, lifecycle, attempts=3, delay=0)
                except OSError as error:
                    assert error.errno in (errno.ENOTEMPTY, errno.EACCES, errno.EPERM)
                else:
                    raise AssertionError('persistent late writes must not report success')
                assert root.is_dir()
                assert lifecycle[-1]['status'] == 'FAIL'
                assert lifecycle[-1]['attempts'] == 3
            else:
                qa.cleanup_workspace(root, lifecycle, attempts=3, delay=0)
                assert not root.exists()
                assert lifecycle[-1]['status'] == 'PASS'
                assert lifecycle[-1]['attempts'] == 2
        results.append({'persistent':persistent,'lateWrites':calls[0],'lifecycle':lifecycle})
    finally:
        if root.exists(): shutil.rmtree(root)
foreign = pathlib.Path(tempfile.mkdtemp(prefix='unowned-browser-'))
try:
    (foreign/'keep').write_text('unrelated data')
    try: qa.cleanup_workspace(foreign, [])
    except ValueError: pass
    else: raise AssertionError('unowned directory must never be deleted')
    assert (foreign/'keep').read_text() == 'unrelated data'
finally: shutil.rmtree(foreign)
session_case = {'status':'NOT_APPLICABLE', 'platform':os.name}
with patch.object(qa.sys, 'platform', 'darwin'):
    try:
        qa.live_group_members(1)
    except RuntimeError: pass
    else: raise AssertionError('unsupported POSIX inspection must not report an empty session')
if sys.platform == 'linux':
    with patch.object(qa.Path, 'iterdir', side_effect=PermissionError(errno.EACCES, 'injected incomplete /proc scan')):
        try: qa.live_group_members(1)
        except RuntimeError: pass
        else: raise AssertionError('incomplete process inventory must fail closed')
    foreign_process = subprocess.Popen([sys.executable,'-c','import time;time.sleep(30)'], start_new_session=True)
    session_results = []
    try:
        for separate_group in (False, True):
            # A child can change pgrp while retaining the owned sid. Its writer
            # recreates the root if cleanup incorrectly precedes process exit.
            root = pathlib.Path(tempfile.mkdtemp(prefix='html-site-layout-'))
            marker = root/'child-cache'
            writer = "import json,os,pathlib,sys,time\np=pathlib.Path(sys.argv[1])\nif sys.argv[2]=='True': os.setpgid(0,0)\nwhile True:\n p.parent.mkdir(exist_ok=True)\n p.write_text(json.dumps({'pid':os.getpid(),'group':os.getpgrp(),'session':os.getsid(0)}))\n time.sleep(0.01)"
            launcher = "import subprocess,sys; subprocess.Popen([sys.executable,'-c',sys.argv[1],sys.argv[2],sys.argv[3]],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)"
            owned = subprocess.Popen([sys.executable,'-c',launcher,writer,str(marker),str(separate_group)], start_new_session=True)
            child_pid = None
            try:
                owned.wait(timeout=5)
                deadline = time.monotonic()+3
                data = None
                while time.monotonic()<deadline:
                    try:
                        data = json.loads(marker.read_text())
                        break
                    except (FileNotFoundError, json.JSONDecodeError): time.sleep(0.01)
                assert data, 'child must actually write after launcher exit'
                child_pid = data['pid']
                assert data['session'] == owned.pid
                assert (data['group'] != owned.pid) == separate_group
                assert child_pid in qa.live_group_members(owned.pid)
                lifecycle = []
                qa.close_browser(owned, None, lifecycle)
                assert not qa.live_group_members(owned.pid)
                child_stat = pathlib.Path('/proc')/str(child_pid)/'stat'
                try: child_state = child_stat.read_text().rsplit(')',1)[1].split()[0]
                except FileNotFoundError: child_state = None
                assert child_state in (None,'Z','X')
                assert foreign_process.poll() is None, 'foreign session must not be signalled'
                qa.cleanup_workspace(root, lifecycle)
                time.sleep(0.1)
                assert not root.exists(), 'no writer may recreate the cleaned root'
                assert any(item['phase']=='owned-browser-session-exit' and item['status']=='PASS' for item in lifecycle)
                session_results.append({'separateGroup':separate_group,'writer':data,'foreignUnaffected':True,'rootRecreated':False,'lifecycle':lifecycle})
            finally:
                if child_pid:
                    try: os.kill(child_pid, signal.SIGKILL)
                    except ProcessLookupError: pass
                try: os.killpg(owned.pid, signal.SIGKILL)
                except ProcessLookupError: pass
                if root.exists(): shutil.rmtree(root)
        session_case = {'status':'PASS', 'variants':session_results}
    finally:
        foreign_process.terminate()
        foreign_process.wait(timeout=5)
print(json.dumps({'cleanup':results,'ownedSession':session_case}))
`;
  const result = spawnSync(py.command, [...py.args, "-c", cases, path.join(scripts, "check_renderings.py")], {
    encoding: "utf8", shell: false, timeout: 15000,
    env: { ...process.env, PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" },
  });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const reports = JSON.parse(result.stdout);
  assert.deepEqual(reports.cleanup.map(row => row.lifecycle.at(-1).status), ["PASS", "FAIL"]);
  assert.deepEqual(reports.cleanup.map(row => row.lateWrites), [1, 3]);
  assert.equal(reports.ownedSession.status, process.platform === "linux" ? "PASS" : "NOT_APPLICABLE");
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
  const captured = process.platform === "linux"
    ? captureBrowserStderr({ directory: f.temporary, executable, pythonCommand: python().command, pythonArgs: python().args })
    : { executable, diagnostics: () => ({ instrumented: false, reason: "Linux startup capture only; original browser path retained" }) };
  const before = hash(fs.readFileSync(path.join(f.root, "index.html")));
  const good = run("check_renderings.py", ["--input", f.root, "--browser", captured.executable, "--screenshots", goodShots], 45000);
  assert.equal(good.status, 0, good.stdout + good.stderr + (good.status === 0 ? "" : "\nStartup stderr diagnostics: " + JSON.stringify(captured.diagnostics())));
  assert.equal(good.report.status, "PASS");
  assert.equal(good.report.lifecycle.at(-1).phase, "temporary-cleanup");
  assert.equal(good.report.lifecycle.at(-1).status, "PASS");
  assert.ok(good.report.lifecycle.some(item => item.phase === "browser-process-exit" && item.status === "PASS"));
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
  const bad = run("check_renderings.py", ["--input", f.root, "--browser", captured.executable, "--screenshots", path.join(f.temporary, "bad-shots"), "--viewport", "390x844"], 45000);
  assert.equal(bad.status, 1, bad.stdout + bad.stderr + (bad.status === 1 ? "" : "\nStartup stderr diagnostics: " + JSON.stringify(captured.diagnostics())));
  const codes = bad.report.viewports.flatMap(v => v.issues.map(issue => issue.code));
  for (const code of ["horizontal-overflow", "severe-horizontal-clipping", "severe-vertical-clipping", "extreme-text-wrapping"]) assert.ok(codes.includes(code), `${code}: ${bad.stdout}`);
});
