import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
const repository = "C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop";
const temp = "C:/Users/Admin/AppData/Local/Temp";
const prefix = path.join(temp, "html-learning-274-browser-stderr");
const startedAt = new Date().toISOString();
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const files = ["tests/helpers/capture-browser-stderr.mjs", "tests/browser-stderr.test.mjs", "plugins/html-guide-kit/skills/site/scripts/check_renderings.py"].map(file => {
  const bytes = fs.readFileSync(path.join(repository, file));
  return {file, bytes: bytes.length, sha256: hash(bytes), data: bytes.toString("base64")};
});
const windows = spawnSync(process.execPath, ["--test", "tests/browser-stderr.test.mjs"], {
  cwd: repository, encoding: "utf8", shell: false, timeout: 60000,
  env: {...process.env, HTML_SITE_PYTHON: "C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"},
});
fs.writeFileSync(prefix + "-windows-tests-r3.log", windows.stdout + windows.stderr, {flag:"wx"});
const noVersionProbe = [
  "import assert from 'node:assert/strict';",
  "import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';",
  "import {pathToFileURL} from 'node:url';",
  "const {captureBrowserStderr}=await import(pathToFileURL(path.join(process.argv[1],'tests/helpers/capture-browser-stderr.mjs')));",
  "const directory=fs.mkdtempSync(path.join(os.tmpdir(),'browser-stderr-no-version-'));",
  "const marker=path.join(directory,'browser-launched');",
  "const executable=path.join(directory,'term-ignoring-browser');",
  "fs.writeFileSync(executable,'#!/usr/bin/env bash\\nprintf launched > '+JSON.stringify(marker)+'\\ntrap \"\" TERM\\nsleep 60\\n',{mode:0o700});",
  "const capture=captureBrowserStderr({directory,executable,pythonCommand:'/usr/bin/python3'});",
  "const initial=capture.diagnostics();",
  "const attempt=path.join(initial.captureRoot,'attempt-fixture'); fs.mkdirSync(attempt);",
  "fs.writeFileSync(path.join(attempt,'metadata.json'),JSON.stringify({instrumented:true,acceptanceStatus:'NOT_RUN'}));",
  "fs.writeFileSync(path.join(attempt,'stderr.tail'),'original startup failure');",
  "const started=performance.now(); const diagnostic=capture.diagnostics(); const elapsedMs=performance.now()-started;",
  "assert.equal(diagnostic.attempts.length,1); assert.ok(elapsedMs<1000); assert.equal(fs.existsSync(marker),false);",
  "assert.equal(Object.hasOwn(diagnostic,'executableVersion'),false);",
  "fs.rmSync(directory,{recursive:true,force:true});",
  "console.log(JSON.stringify({status:'PASS',guardSeconds:7,elapsedMs,browserLaunched:false,versionCommandExecuted:false,attempts:diagnostic.attempts.length,fixtureCleanup:!fs.existsSync(directory),role:'implementation-author regression probe; not independent acceptance'}));",
].join("\n");
const linuxSource = [
  "import base64, hashlib, json, os, pathlib, signal, subprocess, sys, tempfile",
  "payload=json.load(sys.stdin)",
  "root=pathlib.Path(tempfile.mkdtemp(prefix='html-learning-274-browser-stderr-source-'))",
  "for item in payload['files']:",
  "    target=root/item['file']; target.parent.mkdir(parents=True,exist_ok=True)",
  "    data=base64.b64decode(item['data']); assert len(data)==item['bytes'] and hashlib.sha256(data).hexdigest()==item['sha256']",
  "    target.write_bytes(data)",
  "node_root=pathlib.Path('/tmp/html-browser-stderr-node-22.18.0')",
  "archive=node_root/'node-v22.18.0-linux-x64.tar.xz'",
  "sha=hashlib.sha256(archive.read_bytes()).hexdigest()",
  "expected=next(line.split()[0] for line in (node_root/'SHASUMS256.txt').read_text().splitlines() if line.endswith('  '+archive.name))",
  "assert sha==expected",
  "node=node_root/'node-v22.18.0-linux-x64/bin/node'",
  "result=subprocess.run([str(node),'--test','tests/browser-stderr.test.mjs'],cwd=root,encoding='utf-8',capture_output=True,timeout=75)",
  "probe=subprocess.Popen([str(node),'--input-type=module','-e',payload['probe'],str(root)],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True)",
  "try:",
  "    probeout,probeerr=probe.communicate(timeout=7)",
  "except subprocess.TimeoutExpired:",
  "    os.killpg(probe.pid,signal.SIGKILL); probeout,probeerr=probe.communicate(); probeerr+='\\n7-second probe guard expired'",
  "finally:",
  "    try: os.killpg(probe.pid,signal.SIGKILL)",
  "    except ProcessLookupError: pass",
  "unchanged=all(hashlib.sha256((root/item['file']).read_bytes()).hexdigest()==item['sha256'] for item in payload['files'])",
  "print(json.dumps({'snapshotRoot':str(root),'sourceUnchanged':unchanged,'status':result.returncode,'stdout':result.stdout,'stderr':result.stderr,'noVersionProbe':{'status':probe.returncode,'stdout':probeout,'stderr':probeerr},'node':{'url':'https://nodejs.org/dist/v22.18.0/'+archive.name,'sha256':sha,'expectedSha256':expected,'shasumsURL':'https://nodejs.org/dist/v22.18.0/SHASUMS256.txt','version':subprocess.check_output([str(node),'--version'],text=True).strip()},'python':{'executable':sys.executable,'version':sys.version},'platform':sys.platform}))",
].join("\n");
const linux = spawnSync("wsl.exe", ["-d", "mj-bi-p3-w2-20261003", "--exec", "/usr/bin/python3", "-c", linuxSource], {
  input: JSON.stringify({files,probe:noVersionProbe}), encoding: "utf8", shell: false, timeout: 90000, maxBuffer: 4 * 1024 * 1024,
});
fs.writeFileSync(prefix + "-wsl-driver-r2.stdout.log", linux.stdout ?? "", {flag:"wx"});
fs.writeFileSync(prefix + "-wsl-driver-r2.stderr.log", linux.stderr ?? "", {flag:"wx"});
let parsed;
try { parsed = JSON.parse(linux.stdout); } catch {}
if (parsed) {
  fs.writeFileSync(prefix + "-linux-tests-r2.log", parsed.stdout + parsed.stderr, {flag:"wx"});
  fs.writeFileSync(prefix + "-no-version-probe-r2.log", parsed.noVersionProbe.stdout + parsed.noVersionProbe.stderr, {flag:"wx"});
  delete parsed.stdout;
  delete parsed.stderr;
}
const summary = {
  role:"implementation author targeted retest after optional version probe removal; not independent acceptance or GitHub approval",
  startedAt, completedAt:new Date().toISOString(), repository,
  sources:files.map(({data,...rest})=>rest),
  windows:{status:windows.status,error:windows.error?.message??null,node:process.version,log:prefix+"-windows-tests-r3.log"},
  linux:{driverStatus:linux.status,error:linux.error?.message??null,...parsed},
  originalSourceUnchanged:files.every(item=>hash(fs.readFileSync(path.join(repository,item.file)))===item.sha256),
  limitation:"Linux runs exact-byte temporary source projection because the isolated WSL distro has Windows automount disabled; fake browser exercises original checker NOT_RUN, not actual Chromium readiness. External no-version probe plants an existing attempt and confirms diagnostics never launches a TERM-ignoring executable; 7s parent guard kills the whole probe session on regression.",
};
fs.writeFileSync(prefix + "-targeted-summary-r2.json", JSON.stringify(summary,null,2)+"\n", {flag:"wx"});
console.log(JSON.stringify(summary));
process.exitCode=windows.status===0 && linux.status===0 && parsed?.status===0 && parsed?.noVersionProbe.status===0 && summary.originalSourceUnchanged?0:1;
