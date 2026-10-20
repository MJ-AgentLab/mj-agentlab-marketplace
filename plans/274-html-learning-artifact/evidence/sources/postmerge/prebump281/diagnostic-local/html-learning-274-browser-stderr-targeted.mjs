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
fs.writeFileSync(prefix + "-windows-tests-r2.log", windows.stdout + windows.stderr);
const linuxSource = [
  "import base64, hashlib, json, os, pathlib, subprocess, sys, tempfile",
  "payload=json.load(sys.stdin)",
  "root=pathlib.Path(tempfile.mkdtemp(prefix='html-learning-274-browser-stderr-source-'))",
  "for item in payload:",
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
  "unchanged=all(hashlib.sha256((root/item['file']).read_bytes()).hexdigest()==item['sha256'] for item in payload)",
  "print(json.dumps({'snapshotRoot':str(root),'sourceUnchanged':unchanged,'status':result.returncode,'stdout':result.stdout,'stderr':result.stderr,'node':{'url':'https://nodejs.org/dist/v22.18.0/'+archive.name,'sha256':sha,'expectedSha256':expected,'shasumsURL':'https://nodejs.org/dist/v22.18.0/SHASUMS256.txt','version':subprocess.check_output([str(node),'--version'],text=True).strip()},'python':{'executable':sys.executable,'version':sys.version},'platform':sys.platform}))",
].join("\n");
const linux = spawnSync("wsl.exe", ["-d", "mj-bi-p3-w2-20261003", "--exec", "/usr/bin/python3", "-c", linuxSource], {
  input: JSON.stringify(files), encoding: "utf8", shell: false, timeout: 90000, maxBuffer: 4 * 1024 * 1024,
});
fs.writeFileSync(prefix + "-wsl-driver-r1.stdout.log", linux.stdout ?? "");
fs.writeFileSync(prefix + "-wsl-driver-r1.stderr.log", linux.stderr ?? "");
let parsed;
try { parsed = JSON.parse(linux.stdout); } catch {}
if (parsed) {
  fs.writeFileSync(prefix + "-linux-tests-r1.log", parsed.stdout + parsed.stderr);
  delete parsed.stdout;
  delete parsed.stderr;
}
const summary = {
  role:"implementation author targeted test; not independent acceptance or GitHub approval",
  startedAt, completedAt:new Date().toISOString(), repository,
  sources:files.map(({data,...rest})=>rest),
  windows:{status:windows.status,error:windows.error?.message??null,node:process.version,log:prefix+"-windows-tests-r2.log"},
  linux:{driverStatus:linux.status,error:linux.error?.message??null,...parsed},
  originalSourceUnchanged:files.every(item=>hash(fs.readFileSync(path.join(repository,item.file)))===item.sha256),
  limitation:"Linux runs exact-byte temporary source projection because the isolated WSL distro has Windows automount disabled; fake browser exercises original checker NOT_RUN, not actual Chromium readiness.",
};
fs.writeFileSync(prefix + "-targeted-summary-r1.json", JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
process.exitCode=windows.status===0 && linux.status===0 && parsed?.status===0 && summary.originalSourceUnchanged?0:1;
