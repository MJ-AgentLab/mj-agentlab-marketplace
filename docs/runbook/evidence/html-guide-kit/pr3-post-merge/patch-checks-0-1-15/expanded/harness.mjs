#!/usr/bin/env node
// Reviewer-only control program. Never copy this directory into a model environment.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { compileExpandedPlan } from "./expanded-plan.mjs";

const REVIEWER = path.dirname(fileURLToPath(import.meta.url));
const SPEC = "docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md";
const PLUGIN = "html-guide-kit", MARKET = "mj-agentlab-marketplace";
const CACHE_FILES = ["plugin.json", "skills/guide/SKILL.md", "skills/guide/references/guide-framework.md", "skills/guide/references/interaction-design.md", "skills/guide/agents/openai.yaml", "assets/icon.svg", "assets/icon.png"];
const uuid = () => crypto.randomUUID();
const digest = data => crypto.createHash("sha256").update(data).digest("hex");
const now = () => ({ utc: new Date().toISOString(), timezone: "Asia/Taipei" });
const json = p => JSON.parse(fs.readFileSync(p, "utf8"));
const writeJson = (p, value) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(value, null, 2) + "\n"); };
const norm = p => p.replaceAll("\\", "/");
function requireThat(value, message) { if (!value) throw new Error(message); }
function argsObject(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 2) {
    requireThat(argv[i].startsWith("--") && argv[i + 1] !== undefined, "flags require explicit values");
    result[argv[i].slice(2)] = argv[i + 1];
  }
  return result;
}
function safePath(p, root) {
  const resolved = path.resolve(p), base = path.resolve(root), relative = path.relative(base, resolved);
  requireThat(relative && !relative.startsWith("..") && !path.isAbsolute(relative), "path must remain inside its designated root");
  return resolved;
}
function git(repo, argv, binary = false) {
  const r = spawnSync("git", ["-C", repo, ...argv], { encoding: binary ? undefined : "utf8", shell: false, windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
  requireThat(r.status === 0, `git command failed: ${String(r.stderr ?? "").slice(0, 1000)}`);
  return r.stdout;
}
function readBlob(repo, sha, rel) { return git(repo, ["show", `${sha}:${rel}`], true); }
const compilePlan = compileExpandedPlan;
function codexVector(explicit) {
  if (explicit) { const v = JSON.parse(explicit); requireThat(Array.isArray(v) && v.length && v.every(x => typeof x === "string"), "invalid executable vector"); return v; }
  const js = path.join(process.env.APPDATA ?? "", "npm/node_modules/@openai/codex/bin/codex.js");
  requireThat(fs.existsSync(js), "provide --codex-command-json with the actual baseline executable vector");
  requireThat(process.platform === "win32", "provide the actual native executable vector on this platform");
  const target = process.arch === "arm64" ? "aarch64-pc-windows-msvc" : "x86_64-pc-windows-msvc";
  let vendor;
  try { vendor = path.join(path.dirname(createRequire(js).resolve(process.arch === "arm64" ? "@openai/codex-win32-arm64/package.json" : "@openai/codex-win32-x64/package.json")), "vendor"); }
  catch { vendor = path.resolve(path.dirname(js), "../vendor"); }
  const executable = path.join(vendor, target, "bin/codex.exe");
  requireThat(fs.existsSync(executable), "actual npm-selected native executable missing; do not substitute another CLI");
  return [executable];
}
function configProfile(sourceHome) {
  const file = path.join(sourceHome, "config.toml");
  if (!fs.existsSync(file)) return { source: file, retainedLines: [], values: {}, limitation: "source has no config.toml; use actual CLI defaults" };
  const retainedLines = [], values = {};
  let top = true;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (/^\s*\[/.test(line)) top = false;
    if (!top) continue;
    const match = line.match(/^\s*(model|model_provider|model_reasoning_effort|model_reasoning_summary)\s*=\s*("(?:[^"\\]|\\.)*"|'[^']*')\s*(?:#.*)?$/);
    if (!match) continue;
    retainedLines.push(`${match[1]} = ${match[2]}`);
    values[match[1]] = match[2][0] === '"' ? JSON.parse(match[2]) : match[2].slice(1, -1);
  }
  requireThat(!values.model_provider || values.model_provider === "openai", "custom default provider requires its nonsecret provider configuration; no arbitrary provider fallback");
  return { source: file, retainedLines, values };
}
function isolatedEnv(paths) {
  const result = { ...process.env };
  for (const key of Object.keys(result)) if (/(TOKEN|SECRET|API_KEY|PASSWORD)/i.test(key)) delete result[key];
  return { ...result, HOME: paths.home, USERPROFILE: paths.home, CODEX_HOME: paths.codexHome, APPDATA: paths.roaming, LOCALAPPDATA: paths.local, XDG_CONFIG_HOME: paths.config, TEMP: paths.tmp, TMP: paths.tmp, TMPDIR: paths.tmp };
}
function redactor(authPath) {
  const secrets = [];
  if (fs.existsSync(authPath)) {
    const collect = (value, key = "") => {
      if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => collect(v, k));
      else if (typeof value === "string" && value.length > 12 && /(token|key|secret)/i.test(key)) secrets.push(value);
    };
    collect(json(authPath));
  }
  return text => {
    let result = String(text);
    for (const value of secrets) result = result.replaceAll(value, "[REDACTED_AUTH]");
    return result.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED_AUTH]");
  };
}
async function call(vector, argv, { cwd, env, input = "", timeoutMs = 240000, clean = s => s, onChunk = null }) {
  return await new Promise(resolve => {
    const child = spawn(vector[0], [...vector.slice(1), ...argv], { cwd, env, shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    let stdout = "", stderr = "", timedOut = false, error = null;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, timeoutMs);
    child.stdout.on("data", d => { const s = clean(d.toString()); stdout += s; onChunk?.("stdout", s); });
    child.stderr.on("data", d => { const s = clean(d.toString()); stderr += s; onChunk?.("stderr", s); });
    child.on("error", e => { error = e.message; });
    child.on("close", status => { clearTimeout(timer); resolve({ status, stdout: clean(stdout), stderr: clean(stderr), timedOut, error }); });
    child.stdin.on("error", () => {});
    child.stdin.end(input);
  });
}
function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(root, entry.name);
    requireThat(!entry.isSymbolicLink(), "symlink rejected in isolated tree");
    return entry.isDirectory() ? walkFiles(file) : [file];
  });
}
function parseEvents(text) {
  const events = [], nonJson = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try { events.push({ line: index + 1, event: JSON.parse(line) }); } catch { nonJson.push({ line: index + 1, text: line }); }
  }
  return { events, nonJson };
}
function harvestSession(batch, threadId, since) {
  const candidates = [];
  for (const file of walkFiles(path.join(batch.paths.codexHome, "sessions"))) {
    if (fs.statSync(file).mtimeMs < since - 2000) continue;
    const text = fs.readFileSync(file, "utf8"), records = parseEvents(text).events.map(v => v.event);
    const meta = records.find(v => v.type === "session_meta")?.payload;
    if (meta && (!threadId || meta.id === threadId)) candidates.push({ file, text, meta, records });
  }
  requireThat(candidates.length === 1, `expected one exact isolated session, found ${candidates.length}`);
  const session = candidates[0], turns = session.records.filter(v => v.type === "turn_context").map(v => v.payload);
  return { ...session, identity: { sessionId: session.meta.id, cliVersion: session.meta.cli_version ?? "unknown", originator: session.meta.originator ?? "unknown", modelProvider: session.meta.model_provider ?? "unknown", models: [...new Set(turns.map(t => t.model).filter(Boolean))], reasoning: [...new Set(turns.map(t => t.effort ?? t.reasoning_effort).filter(Boolean))] } };
}
function loadBatch(batchFile) {
  const batch = json(batchFile);
  requireThat(batch.schemaVersion === 1 && batch.baselineVersion === "codex-cli 0.147.0", "batch is not a verified baseline installation");
  requireThat(path.resolve(batch.reviewerRoot) === REVIEWER, "reviewer root mismatch");
  for (const row of batch.runtime) {
    const cached = path.join(batch.cacheRoot, row.relative);
    requireThat(fs.existsSync(cached) && digest(fs.readFileSync(cached)) === row.sourceSha256, `cache runtime changed: ${row.relative}`);
  }
  return batch;
}
function saveBatch(batchFile, batch) { writeJson(batchFile, batch); }
function caseState(batch, id) { const state = batch.cases[id]; requireThat(state, "unknown reviewer variant"); return state; }
function currentAttempt(state) { return state.attempts.at(-1); }
function finalText(events) { return events.filter(v => v.event.type === "item.completed" && v.event.item?.type === "agent_message").map(v => v.event.item.text ?? "").join("\n\n"); }

async function probeAppServer(vector, paths, cwd) {
  const clean = redactor(path.join(paths.codexHome, "auth.json"));
  const requests = [{ id: 1, method: "initialize", params: { clientInfo: { name: "local-diagnostics", version: "0.1.0" } } }, { method: "initialized" }, { id: 2, method: "model/list", params: { includeHidden: true } }, { id: 3, method: "skills/list", params: { cwds: [cwd], forceReload: true } }];
  return await new Promise(resolve => {
    const child = spawn(vector[0], [...vector.slice(1), "--disable", "remote_plugin", "app-server", "--stdio"], { cwd, env: isolatedEnv(paths), shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    let stdout = "", stderr = "", buffer = "", error = null, closing = false;
    const responses = {};
    const finish = message => { if (closing) return; closing = true; error = message; clearTimeout(timer); child.stdin.end(); child.kill(); };
    const timer = setTimeout(() => finish("app-server metadata probe timed out"), 45000);
    const send = value => child.stdin.write(JSON.stringify(value) + "\n");
    child.stdin.on("error", () => {});
    child.stdout.on("data", chunk => {
      stdout += chunk; buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
        let response; try { response = JSON.parse(line); } catch { continue; }
        if (![1, 2, 3].includes(response.id)) continue;
        responses[response.id] = response;
        if (response.error) { finish(`app-server ${response.id} returned an error`); break; }
        if (response.id === 1) requests.slice(1).forEach(send);
        if (responses[2] && responses[3]) { finish(null); break; }
      }
    });
    child.stderr.on("data", chunk => stderr += chunk);
    child.on("error", e => { error = e.message; clearTimeout(timer); });
    child.on("close", () => { clearTimeout(timer); resolve({ requests, responses, stdout: clean(stdout), stderr: clean(stderr), error }); });
    send(requests[0]);
  });
}
function validateNative(probe, cacheRoot, codexHome) {
  requireThat(!probe.error && probe.responses[3]?.result?.data?.length === 1, "native skills metadata probe failed");
  const entry = probe.responses[3].result.data[0];
  requireThat(Array.isArray(entry.errors) && entry.errors.length === 0, "native skill loader reported errors");
  const publicSkills = entry.skills.filter(s => s.name.includes(":"));
  requireThat(publicSkills.length === 1 && publicSkills[0].name === "html-guide-kit:guide" && publicSkills[0].enabled === true && norm(path.resolve(publicSkills[0].path)).toLowerCase() === norm(path.join(cacheRoot, "skills/guide/SKILL.md")).toLowerCase(), "native public inventory is not exactly the isolated cached HTML Guide");
  for (const skill of entry.skills.filter(s => !s.name.includes(":"))) {
    requireThat(!skill.name.startsWith("mp-") && norm(path.resolve(skill.path)).toLowerCase().startsWith(norm(path.join(codexHome, "skills/.system")).toLowerCase() + "/"), "foreign or repository skill leaked into consumer");
  }
  return { publicSkills: publicSkills.map(s => s.name), builtInSystemSkills: entry.skills.filter(s => !s.name.includes(":")).map(s => s.name), errors: [] };
}
async function diagnose(options) {
  const batch = json(path.resolve(options.batch)), dir = path.join(REVIEWER, "diagnostics", uuid()); fs.mkdirSync(dir, { recursive: true });
  requireThat(batch.baselineVersion === "codex-cli 0.147.0", "diagnose the pinned baseline only");
  const clean = redactor(path.join(batch.paths.codexHome, "auth.json"));
  const featureResult = await call(batch.vector, ["features", "list"], { cwd: batch.paths.consumers, env: isolatedEnv(batch.paths), clean, timeoutMs: 30000 });
  fs.writeFileSync(path.join(dir, "features.txt"), featureResult.stdout); fs.writeFileSync(path.join(dir, "features.stderr.txt"), featureResult.stderr);
  requireThat(featureResult.status === 0 && /^remote_plugin\s+stable\s+true\s*$/m.test(featureResult.stdout), "baseline remote_plugin feature support was not established");
  const probe = await probeAppServer(batch.vector, batch.paths, Object.values(batch.cases)[0].consumer);
  writeJson(path.join(dir, "requests.json"), probe.requests); fs.writeFileSync(path.join(dir, "events.jsonl"), probe.stdout); fs.writeFileSync(path.join(dir, "stderr.txt"), probe.stderr);
  writeJson(path.join(dir, "models.json"), probe.responses[2] ?? {}); writeJson(path.join(dir, "native-skills.json"), probe.responses[3] ?? {});
  requireThat(!probe.error, probe.error ?? "metadata probe incomplete");
  const defaults = probe.responses[2]?.result?.data?.filter(m => m.isDefault && !m.hidden) ?? [];
  requireThat(defaults.length === 1 && defaults[0].model && defaults[0].defaultReasoningEffort, "actual model/list did not expose one usable default");
  const native = validateNative(probe, batch.cacheRoot, batch.paths.codexHome);
  const cache = json(path.join(batch.paths.codexHome, "models_cache.json"));
  const metadata = { schemaVersion: 1, recorded: now(), baselineVersion: batch.baselineVersion, sourceBatch: path.resolve(options.batch), originalConfiguredIdentity: batch.configuredIdentity.values, actualDefault: defaults[0], modelsApiFile: path.join(dir, "models.json"), modelsApiSha256: digest(fs.readFileSync(path.join(dir, "models.json"))), modelsCacheMetadata: { client_version: cache.client_version, fetched_at: cache.fetched_at, etag: cache.etag }, remotePlugin: { feature: "remote_plugin", featureFile: path.join(dir, "features.txt"), defaultEnabled: true, disabledOnlyForMetadataInvocation: true, native }, requestsFile: path.join(dir, "requests.json"), eventsFile: path.join(dir, "events.jsonl"), stderrFile: path.join(dir, "stderr.txt"), nativeSkillsFile: path.join(dir, "native-skills.json"), noModelTurnStarted: true, originalHomeModified: false };
  const file = path.join(dir, "metadata.json"); writeJson(file, metadata);
  return { metadataFile: file, actualDefault: { model: defaults[0].model, reasoning: defaults[0].defaultReasoningEffort }, native, noModelTurnStarted: true };
}

async function prepare(options) {
  const repo = path.resolve(options.repo), canonical = options.canonical;
  requireThat(/^[a-f0-9]{40}$/i.test(canonical ?? ""), "prepare requires the parent-provided full canonical SHA");
  const planFile = path.resolve(options.plan ?? path.join(REVIEWER, "plan.json")), plan = json(planFile);
  const selectedIds = options.variants ? options.variants.split(",").map(s => s.trim()) : plan.variants.filter(v => v.runnable !== false).map(v => v.id);
  requireThat(selectedIds.length && new Set(selectedIds).size === selectedIds.length && selectedIds.every(id => plan.variants.some(v => v.id === id)), "invalid or duplicate subset variant");
  const selectedVariants = plan.variants.filter(v => selectedIds.includes(v.id));
  requireThat(selectedVariants.every(v => v.runnable !== false && v.turns.length), "native lifecycle NOT_RUN variants cannot be CLI substituted");
  const plannedTurns = selectedVariants.reduce((sum, v) => sum + v.turns.length, 0);
  requireThat(digest(readBlob(repo, canonical, SPEC)) === plan.specSha256, "canonical grading SPEC differs from frozen plan");
  const manifest = JSON.parse(readBlob(repo, canonical, `plugins/${PLUGIN}/plugin.json`).toString());
  requireThat(manifest.name === PLUGIN && manifest.version, "canonical has no complete HTML package");
  const runId = uuid(), recordRoot = safePath(path.join(REVIEWER, "runs", runId), REVIEWER);
  const root = path.join(fs.realpathSync(os.tmpdir()), uuid());
  const paths = Object.fromEntries(["home", "codexHome", "roaming", "local", "config", "tmp", "mirror", "consumers"].map(key => [key, path.join(root, uuid())]));
  Object.values(paths).forEach(p => fs.mkdirSync(p, { recursive: true }));
  fs.mkdirSync(recordRoot, { recursive: true });
  writeJson(path.join(recordRoot, "preparation.json"), { schemaVersion: 1, runId, created: now(), canonicalSha: canonical, paths, status: "PREPARING", modelStatus: "NOT_RUN" });
  const sourceHome = path.resolve(options["source-codex-home"] ?? process.env.CODEX_HOME ?? path.join(os.homedir(), ".codex"));
  const profile = configProfile(sourceHome), originalAuth = path.join(sourceHome, "auth.json"), copiedAuth = path.join(paths.codexHome, "auth.json");
  requireThat(options["baseline-default-proof"], "prepare requires actual pinned model/list default proof after the unsupported desktop-model attempt");
  const proofPath = path.resolve(options["baseline-default-proof"]), proof = json(proofPath);
  requireThat(proof.baselineVersion === "codex-cli 0.147.0" && proof.actualDefault?.isDefault === true && proof.actualDefault.hidden === false && digest(fs.readFileSync(proof.modelsApiFile)) === proof.modelsApiSha256, "baseline default proof is invalid or changed");
  const effectiveValues = { model: proof.actualDefault.model, model_reasoning_effort: proof.actualDefault.defaultReasoningEffort, ...(profile.values.model_provider ? { model_provider: profile.values.model_provider } : {}) };
  const effectiveLines = Object.entries(effectiveValues).map(([key, value]) => `${key} = ${JSON.stringify(value)}`);
  requireThat(fs.existsSync(originalAuth), "actual auth.json unavailable; no login or account switch performed");
  fs.copyFileSync(originalAuth, copiedAuth);
  fs.writeFileSync(path.join(paths.codexHome, "config.toml"), effectiveLines.join("\n") + '\nsandbox_mode = "read-only"\napproval_policy = "never"\n\n[features]\nremote_plugin = false\n');
  const clean = redactor(copiedAuth), env = isolatedEnv(paths), vector = codexVector(options["codex-command-json"]);
  const listing = git(repo, ["ls-tree", "-r", "--name-only", canonical]).trim().split(/\r?\n/);
  const excluded = [], copied = [];
  for (const rel of listing) {
    const pieces = rel.split("/");
    const allowed = rel === ".agents/plugins/marketplace.json" || (rel.startsWith("plugins/") && !pieces.some(p => /^(tests?|evals?|evidence|results?|reviewer|control)$/i.test(p)));
    if (!allowed) { excluded.push(rel); continue; }
    const bytes = readBlob(repo, canonical, rel), dest = safePath(path.join(paths.mirror, rel), paths.mirror);
    fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, bytes); copied.push({ path: rel, sha256: digest(bytes) });
  }
  requireThat(excluded.includes("AGENTS.md") && excluded.includes("README.md") && excluded.includes(SPEC), "reviewer/control exclusion incomplete");
  git(paths.mirror, ["init", "-q"]);
  const commands = [];
  const execute = async argv => {
    const r = await call(vector, argv, { cwd: paths.consumers, env, clean, timeoutMs: 60000 });
    commands.push({ argv, ...r });
    writeJson(path.join(recordRoot, "installation.json"), commands);
    requireThat(r.status === 0 && !r.error && !r.timedOut, "isolated installation command failed; retained installation.json");
    return r.stdout;
  };
  const baselineVersion = (await execute(["--version"])).trim();
  requireThat(baselineVersion === "codex-cli 0.147.0", `exact baseline required, found ${baselineVersion}`);
  await execute(["plugin", "marketplace", "add", paths.mirror, "--json"]);
  await execute(["plugin", "add", PLUGIN, "--marketplace", MARKET, "--json"]);
  const installed = JSON.parse(await execute(["plugin", "list", "--json"]));
  requireThat(installed.installed?.length === 1 && installed.installed[0].name === PLUGIN && installed.installed[0].enabled && installed.installed[0].installed, "dedicated cache must install only HTML Guide Kit");
  const cacheRoot = path.join(paths.codexHome, "plugins/cache", MARKET, PLUGIN, manifest.version);
  const metadataProbe = await probeAppServer(vector, paths, paths.consumers);
  writeJson(path.join(recordRoot, "metadata-requests.json"), metadataProbe.requests); fs.writeFileSync(path.join(recordRoot, "metadata-events.jsonl"), metadataProbe.stdout); fs.writeFileSync(path.join(recordRoot, "metadata-stderr.txt"), metadataProbe.stderr);
  writeJson(path.join(recordRoot, "models.json"), metadataProbe.responses[2] ?? {}); writeJson(path.join(recordRoot, "native-skills.json"), metadataProbe.responses[3] ?? {});
  requireThat(!metadataProbe.error, metadataProbe.error ?? "prepared model metadata probe failed");
  requireThat(metadataProbe.responses[2]?.result?.data?.some(m => m.isDefault && !m.hidden && m.model === effectiveValues.model && m.defaultReasoningEffort === effectiveValues.model_reasoning_effort), "actual prepared baseline default drifted from proof");
  const nativeInventory = validateNative(metadataProbe, cacheRoot, paths.codexHome);
  const runtime = [...CACHE_FILES].sort().map(relative => {
    const source = readBlob(repo, canonical, `plugins/${PLUGIN}/${relative}`), mirror = fs.readFileSync(path.join(paths.mirror, "plugins", PLUGIN, relative)), cache = fs.readFileSync(path.join(cacheRoot, relative));
    const row = { relative, sourceSha256: digest(source), mirrorSha256: digest(mirror), cacheSha256: digest(cache) };
    requireThat(row.sourceSha256 === row.mirrorSha256 && row.sourceSha256 === row.cacheSha256, `runtime mismatch: ${relative}`);
    return row;
  });
  const cases = {};
  for (const variant of selectedVariants) {
    const consumer = path.join(paths.consumers, uuid()); fs.mkdirSync(consumer);
    const material = variant.material && variant.inputMode !== "snapshot" ? path.join(consumer, uuid() + ".md") : null;
    if (material && variant.inputMode !== "deferred") fs.writeFileSync(material, plan.materials[variant.material]);
    const updateMaterial = variant.supplementalMaterial ? path.join(consumer, uuid() + ".md") : null;
    cases[variant.id] = { base: variant.base, plannedTurns: variant.turns.length, consumer, material, inputMode: variant.inputMode ?? "file", materialSha256: variant.material ? digest(Buffer.from(plan.materials[variant.material])) : null, updateMaterial, updateMaterialSha256: updateMaterial ? digest(Buffer.from(plan.materials[variant.supplementalMaterial])) : null, scopeRefusalEligible: variant.scopeRefusalEligible === true, attempts: [], behaviorStatus: "UNKNOWN", executionStatus: "NOT_RUN" };
  }
  const batch = { schemaVersion: 1, runId, created: now(), reviewerRoot: REVIEWER, recordRoot, planFile, source: { repo, canonicalSha: canonical, canonicalTree: git(repo, ["rev-parse", `${canonical}^{tree}`]).trim() }, mirror: { root: paths.mirror, copied, excluded, identity: "exact file inventory; no equality claim with complete canonical tree" }, paths, vector, baselineVersion, configuredIdentity: profile, baselineCompatibility: { proofPath, proofSha256: digest(fs.readFileSync(proofPath)), originalDesktop: profile.values, effectiveBaseline: effectiveValues, reason: "actual pinned CLI model/list default after unsupported desktop model; separate fresh batch" }, isolation: { remotePluginDisabled: true, nativeInventory, nativeSkillsFile: path.join(recordRoot, "native-skills.json"), modelMetadataFile: path.join(recordRoot, "models.json"), originalHomeModified: false }, authentication: { copiedAuthFileOnly: true, sourceHome, secretsExcludedFromLogs: true }, packageVersion: manifest.version, cacheRoot, runtime, runtimeInventorySha256: digest(Buffer.from(runtime.map(r => `${r.relative}\t${r.cacheSha256}\n`).join(""))), selectedIds: selectedVariants.map(v => v.id), fullPlanFreshVariants: plan.freshVariants, fullPlanTurns: plan.plannedTurns, freshVariants: selectedVariants.length, plannedTurns, effectStatus: "NOT_MEASURED", cases };
  const batchFile = path.join(recordRoot, "batch.json"); saveBatch(batchFile, batch);
  writeJson(path.join(recordRoot, "preparation.json"), { schemaVersion: 1, runId, completed: now(), canonicalSha: canonical, paths, status: "VERIFIED_INSTALLATION_ONLY", modelStatus: "NOT_RUN", batchFile });
  return { batchFile, installationStatus: "VERIFIED_INSTALLATION_ONLY", modelStatus: "NOT_RUN", selectedIds: batch.selectedIds, freshVariants: batch.freshVariants, plannedTurns };
}

async function runTurn(options, first = false) {
  const batchFile = path.resolve(options.batch), batch = loadBatch(batchFile), state = caseState(batch, options.variant), plan = json(batch.planFile), specCase = plan.variants.find(v => v.id === options.variant);
  requireThat(batch.isolation?.remotePluginDisabled === true && /\[features\][\s\S]*remote_plugin\s*=\s*false/.test(fs.readFileSync(path.join(batch.paths.codexHome, "config.toml"), "utf8")), "model execution requires the new isolated remote-plugin-disabled batch");
  let attempt = currentAttempt(state);
  if (first) {
    requireThat(!attempt || options.restart === "true", "start already attempted; explicit --restart true preserves original attempt");
    attempt = { attemptId: uuid(), method: "FRESH_FORWARD", started: now(), threadId: null, turns: [], selection: null, behaviorStatus: "UNKNOWN" };
    state.attempts.push(attempt);
  } else requireThat(attempt?.threadId && attempt.turns.length && attempt.turns.at(-1).transportStatus === "COMPLETE", "next requires a complete preceding turn in the same real session");
  const index = attempt.turns.length;
  requireThat(index < specCase.turns.length, "planned turns already complete");
  let prompt = specCase.turns[index];
  if (prompt.includes("{label}") || prompt.includes("{peerLabel}") || prompt.includes("{roleConfirmation}")) requireThat(attempt.selection, "record the actual first-turn option using choose before continuing");
  prompt = prompt.replaceAll("{label}", attempt.selection?.label ?? "").replaceAll("{peerLabel}", attempt.selection?.peerLabel ?? "");
  requireThat(!specCase.turns[index].includes("{peerLabel}") || attempt.selection?.peerLabel, "ambiguous options require actual second-label quote using choose");
  if (prompt.includes("{updateMaterial}")) {
    requireThat(state.updateMaterial && !fs.existsSync(state.updateMaterial), "update material should not exist in earlier model context");
    fs.writeFileSync(state.updateMaterial, plan.materials[specCase.supplementalMaterial]);
    requireThat(digest(fs.readFileSync(state.updateMaterial)) === state.updateMaterialSha256, "updated material hash drift");
  }
  if (prompt.includes("{providedMaterial}")) {
    requireThat(state.material && state.inputMode === "deferred" && !fs.existsSync(state.material), "deferred material should not exist before this explicit delivery");
    fs.writeFileSync(state.material, plan.materials[specCase.material]);
    requireThat(digest(fs.readFileSync(state.material)) === state.materialSha256, "deferred material hash drift");
  }
  prompt = prompt.replaceAll("{updateMaterial}", state.updateMaterial ? norm(state.updateMaterial) : "").replaceAll("{providedMaterial}", state.material ? norm(state.material) : "");
  if (prompt.includes("{roleConfirmation}")) prompt = prompt.replace("{roleConfirmation}", attempt.selection.rolePresent ? `我明确选择并确认 ${attempt.selection.label}，按该方案编排指南。` : `我选择 ${attempt.selection.label}，把读者改为负责核验的现场工作人员，任务改为判断访客资格及核验、领取和库存的关系。我明确确认按该方案编排指南。`);
  if (index === 0) {
    prompt += `\n请先阅读这个已安装入口及当前流程所需的随附参考。\n入口：${norm(path.join(batch.cacheRoot, "skills/guide/SKILL.md"))}\n附件：${norm(path.join(batch.cacheRoot, "skills/guide/references/guide-framework.md"))}\n附件：${norm(path.join(batch.cacheRoot, "skills/guide/references/interaction-design.md"))}`;
    if (state.inputMode === "snapshot") prompt += "\n以下是用户明确提供的当前材料对话快照，除此没有提供文件或持续同步来源：\n" + plan.materials[specCase.material];
    else if (state.inputMode !== "deferred" && state.material) prompt += "\n材料：" + norm(state.material);
  }
  const attemptRoot = safePath(path.join(batch.recordRoot, options.variant, attempt.attemptId), batch.recordRoot);
  fs.mkdirSync(attemptRoot, { recursive: true });
  const prefix = path.join(attemptRoot, String(index + 1).padStart(2, "0"));
  requireThat(!fs.existsSync(prefix + ".input.txt"), "refusing to overwrite original turn");
  fs.writeFileSync(prefix + ".input.txt", prompt + "\n", { flag: "wx" });
  const argv = index === 0 ? ["exec", "--json", "--sandbox", "read-only", "--skip-git-repo-check", "-C", state.consumer, "-"] : ["-c", 'sandbox_mode="read-only"', "exec", "resume", "--json", "--skip-git-repo-check", attempt.threadId, "-"];
  const turn = { turn: index + 1, started: now(), inputFile: prefix + ".input.txt", inputSha256: digest(Buffer.from(prompt + "\n")), argv, transportStatus: "RUNNING", eventsFile: prefix + ".events.jsonl", stderrFile: prefix + ".stderr.txt", outputFile: prefix + ".output.txt" };
  attempt.turns.push(turn); state.executionStatus = "RUNNING"; saveBatch(batchFile, batch);
  const clean = redactor(path.join(batch.paths.codexHome, "auth.json")), started = Date.now();
  fs.writeFileSync(turn.eventsFile, "", { flag: "wx" }); fs.writeFileSync(turn.stderrFile, "", { flag: "wx" });
  const streamBuffers = { stdout: "", stderr: "" };
  const streamLogs = { stdout: turn.eventsFile, stderr: turn.stderrFile };
  const onChunk = (stream, chunk) => {
    streamBuffers[stream] += chunk;
    let newline;
    while ((newline = streamBuffers[stream].indexOf("\n")) >= 0) {
      const line = streamBuffers[stream].slice(0, newline + 1); streamBuffers[stream] = streamBuffers[stream].slice(newline + 1);
      fs.appendFileSync(streamLogs[stream], clean(line));
    }
  };
  const result = await call(batch.vector, argv, { cwd: state.consumer, env: isolatedEnv(batch.paths), input: prompt + "\n", clean, onChunk, timeoutMs: Number(options["timeout-ms"] ?? 240000) });
  fs.writeFileSync(turn.eventsFile, result.stdout); fs.writeFileSync(turn.stderrFile, result.stderr);
  const parsed = parseEvents(result.stdout), output = finalText(parsed.events); fs.writeFileSync(turn.outputFile, output);
  let threadId = parsed.events.find(v => v.event.type === "thread.started")?.event.thread_id ?? null;
  let session = null, identityError = null;
  try {
    session = harvestSession(batch, threadId ?? attempt.threadId, started);
    threadId ??= session.meta.id;
    requireThat(threadId === session.meta.id && /^[a-f0-9-]{36}$/i.test(threadId), "session identity mismatch");
    requireThat(!attempt.threadId || attempt.threadId === threadId, "resume returned a different UUID");
    attempt.threadId = threadId;
    fs.writeFileSync(prefix + ".session.jsonl", clean(session.text));
    turn.actualIdentity = session.identity; turn.sessionSnapshot = prefix + ".session.jsonl";
  } catch (e) { identityError = e.message; }
  const completed = parsed.events.some(v => v.event.type === "turn.completed"), failed = parsed.events.some(v => v.event.type === "turn.failed" || v.event.type === "error");
  turn.completed = now(); turn.exitCode = result.status; turn.timedOut = result.timedOut; turn.processError = result.error; turn.nonJsonLines = parsed.nonJson; turn.identityError = identityError;
  turn.transportStatus = result.status === 0 && completed && !failed && !identityError && !result.timedOut ? "COMPLETE" : "FAILED_OR_INVALID";
  state.executionStatus = turn.transportStatus !== "COMPLETE" ? "FAILED_OR_INVALID" : attempt.turns.length === specCase.turns.length ? "EXECUTED_PENDING_REVIEW" : "PARTIAL_PENDING_NEXT_TURN";
  saveBatch(batchFile, batch);
  return { variant: options.variant, turn: index + 1, threadId: attempt.threadId, transportStatus: turn.transportStatus, executionStatus: state.executionStatus, behaviorStatus: "UNKNOWN", outputFile: turn.outputFile, eventsFile: turn.eventsFile };
}

function choose(options) {
  const batchFile = path.resolve(options.batch), batch = loadBatch(batchFile), state = caseState(batch, options.variant), attempt = currentAttempt(state);
  const selectionTurn = Number(options.turn ?? 1), selectedOutput = attempt?.turns[selectionTurn - 1];
  requireThat(selectedOutput?.transportStatus === "COMPLETE" && Number.isInteger(selectionTurn), "choose requires an actual completed option output at selected turn");
  requireThat(!attempt.selection || selectionTurn > attempt.selection.sourceTurn, "selection already frozen for this output; updated pending options must cite a later real turn");
  const label = options.label, quote = options["quote-file"] ? fs.readFileSync(options["quote-file"], "utf8").trim() : options.quote;
  requireThat(typeof label === "string" && label.length > 0 && label.length < 80 && !/[\r\n]/.test(label), "use one actual short option label");
  requireThat(quote?.length > 12 && fs.readFileSync(selectedOutput.outputFile, "utf8").includes(quote), "option quote must be an exact excerpt from actual first-turn output");
  requireThat(quote.includes(label), "option excerpt must contain the supplied real label");
  if (options.variant === "B2.1") requireThat(["true", "false"].includes(options["role-present"]), "B2.1 requires reviewer role-present assessment");
  const peerLabel = options["peer-label"], peerQuote = options["peer-quote-file"] ? fs.readFileSync(options["peer-quote-file"], "utf8").trim() : null;
  if (peerLabel) requireThat(peerQuote?.includes(peerLabel) && peerQuote.length > 12 && fs.readFileSync(selectedOutput.outputFile, "utf8").includes(peerQuote), "peer-label requires exact actual option excerpt");
  attempt.selectionHistory ??= []; if (attempt.selection) attempt.selectionHistory.push(attempt.selection);
  attempt.selection = { label, peerLabel: peerLabel ?? null, peerTripletExcerpt: peerQuote, sourceTurn: selectionTurn, originalTripletExcerpt: quote, firstTurnOutput: selectedOutput.outputFile, recorded: now(), rolePresent: options["role-present"] === "true", source: "reviewer reading of actual model output; no answer key in model prompt" };
  saveBatch(batchFile, batch); return { variant: options.variant, selectionRecorded: true, behaviorStatus: "UNKNOWN" };
}
function inspect(options) {
  const batch = loadBatch(path.resolve(options.batch)), result = [];
  for (const [id, state] of Object.entries(batch.cases)) for (const attempt of state.attempts) {
    const toolCandidates = [];
    for (const turn of attempt.turns) {
      if (!fs.existsSync(turn.eventsFile)) continue;
      for (const record of parseEvents(fs.readFileSync(turn.eventsFile, "utf8")).events) {
        const item = record.event.item;
        if (item && item.type !== "agent_message" && record.event.type === "item.completed") toolCandidates.push({ turn: turn.turn, eventsFile: turn.eventsFile, jsonlLine: record.line, type: item.type, itemId: item.id, command: item.command ?? null, tool: item.name ?? item.tool ?? null, successful: item.exit_code === 0 || item.status === "completed", cacheReferences: CACHE_FILES.filter(rel => JSON.stringify(item).includes(path.basename(rel))), reviewRequired: true });
      }
    }
    result.push({ variant: id, attemptId: attempt.attemptId, method: attempt.method, threadId: attempt.threadId, plannedTurns: state.plannedTurns, executedTurns: attempt.turns.length, behaviorStatus: attempt.behaviorStatus, executionStatus: state.executionStatus, toolCandidates, note: "Filename mentions or model self-report are not proof of reading; independently inspect command and returned content." });
  }
  const out = path.join(batch.recordRoot, "inspection.json"); writeJson(out, result); return { inspectionFile: out, behaviorStatus: "UNKNOWN_UNTIL_INDEPENDENT_REVIEW" };
}
function grade(options) {
  const batchFile = path.resolve(options.batch), batch = loadBatch(batchFile), review = json(path.resolve(options.review)), state = caseState(batch, review.variant), attempt = state.attempts.find(a => a.attemptId === review.attemptId);
  requireThat(review.canonicalSha === batch.source.canonicalSha && review.attemptId === attempt?.attemptId, "review must identify exact source and attempt");
  requireThat(["PASS", "FAIL", "UNEXERCISED", "NOT_RUN", "INVALID_RUN", "UNKNOWN"].includes(review.status), "unsupported grade status");
  requireThat(typeof review.reviewer === "string" && review.reviewer && review.method === "independent_semantic_review" && Array.isArray(review.criteria) && review.criteria.length && review.criteria.every(c => c.rationale && Array.isArray(c.evidence)), "review requires independent semantic criteria and evidence citations");
  if (review.status === "PASS") {
    requireThat(attempt.turns.length === state.plannedTurns && attempt.turns.every(t => t.transportStatus === "COMPLETE"), "PASS requires all planned real continuous turns");
    requireThat(review.installedResourceReading?.skill === true && Array.isArray(review.installedResourceReading.evidence) && review.installedResourceReading.evidence.length >= 1, "PASS requires independent verification of actual cached SKILL reading");
    const scopeRefusal = (state.base === "B6.2" || state.scopeRefusalEligible === true) && review.scopeRefusal?.explicitRefusalVerified === true && review.scopeRefusal.targetSelectionStarted === false && review.scopeRefusal.guideDelivered === false && Array.isArray(review.scopeRefusal.evidence) && review.scopeRefusal.evidence.length > 0;
    const referenceApplicable = value => value === true || (value === "NOT_APPLICABLE" && scopeRefusal && typeof review.referencesApplicability?.rationale === "string" && review.referencesApplicability.rationale.length > 20 && Array.isArray(review.referencesApplicability.evidence) && review.referencesApplicability.evidence.length > 0);
    requireThat(referenceApplicable(review.installedResourceReading.framework) && referenceApplicable(review.installedResourceReading.interaction), "both reference reads required unless scope-refusal-eligible variant independently proves scope refusal before any target or guide flow and cites conditional applicability");
    requireThat(review.criteria.every(c => c.status === "PASS" && c.evidence.length), "PASS requires every recorded criterion to pass with citations");
  }
  attempt.reviews ??= []; attempt.reviews.push({ ...review, recorded: now() }); attempt.behaviorStatus = review.status;
  if (attempt === currentAttempt(state)) state.behaviorStatus = review.status;
  saveBatch(batchFile, batch); return { variant: review.variant, behaviorStatus: review.status, reviewRecorded: true };
}
function summary(options) {
  const batch = loadBatch(path.resolve(options.batch)), rows = Object.entries(batch.cases).map(([id, s]) => ({ variant: id, plannedTurns: s.plannedTurns, attempts: s.attempts.map(a => ({ attemptId: a.attemptId, threadId: a.threadId, turns: a.turns.length, status: a.behaviorStatus })), status: s.behaviorStatus, execution: s.executionStatus }));
  const groups = Object.fromEntries(Array.from({ length: 15 }, (_, i) => "E" + (i + 1)).map(group => { const selected = rows.filter(r => batch.cases[r.variant].base === group); return [group, selected.length === 0 ? (["E10", "E11"].includes(group) ? "NOT_RUN_NATIVE_INTERFACE_UNAVAILABLE" : "NOT_IN_THIS_SUBSET") : selected.every(r => r.status === "PASS") ? "PASS" : selected.some(r => r.status === "FAIL") ? "FAIL" : "INCOMPLETE_OR_PENDING_REVIEW"]; }));
  const result = { source: batch.source, packageVersion: batch.packageVersion, client: batch.baselineVersion, configuredIdentity: batch.configuredIdentity.values, baselineCompatibility: batch.baselineCompatibility ?? null, runtime: batch.runtime, selectedIds: batch.selectedIds ?? rows.map(r => r.variant), freshVariants: rows.length, plannedTurns: rows.reduce((sum, r) => sum + r.plannedTurns, 0), groups, variants: rows, effectStatus: "NOT_MEASURED", clientUiStatus: "NOT_RUN", noReleaseAuthority: true };
  const out = path.join(batch.recordRoot, "summary.json"); writeJson(out, result); return { summaryFile: out, groups, effectStatus: "NOT_MEASURED" };
}

async function main() {
  const [command, ...argv] = process.argv.slice(2), options = argsObject(argv);
  if (!command || command === "help") { process.stdout.write("Reviewer-only commands: plan, diagnose, prepare, start, choose, next, inspect, grade, summary. Read README.md for explicit interfaces.\n"); return; }
  let result;
  if (command === "plan") {
    const repo = path.resolve(options.repo), sourceSha = git(repo, ["rev-parse", "HEAD"]).trim();
    const text = readBlob(repo, sourceSha, SPEC).toString("utf8");
    const localText = fs.readFileSync(path.join(repo, SPEC), "utf8");
    requireThat(localText.replaceAll("\r\n", "\n") === text.replaceAll("\r\n", "\n"), "local grading SPEC has uncommitted content drift; freeze deliberately before model execution");
    const plan = { ...compilePlan(text), source: { repo, sha: sourceSha, specGitBlob: git(repo, ["rev-parse", `${sourceSha}:${SPEC}`]).trim() } };
    fs.writeFileSync(path.join(REVIEWER, "frozen-spec.md"), text); writeJson(path.join(REVIEWER, "plan.json"), plan);
    writeJson(path.join(REVIEWER, "initial-status.json"), { created: now(), frozenSpecSha256: plan.specSha256, effectStatus: "NOT_MEASURED", variants: plan.variants.map(v => ({ id: v.id, base: v.base, plannedTurns: v.turns.length, behaviorStatus: "UNKNOWN", executionStatus: "NOT_RUN", rubric: plan.criteria[v.base] })) });
    result = { planFile: path.join(REVIEWER, "plan.json"), frozenSpecSha256: plan.specSha256, freshVariants: plan.freshVariants, plannedTurns: plan.plannedTurns, unavailableVariants: plan.unavailableVariants, installationStatus: "NOT_RUN", modelStatus: "NOT_RUN" };
  } else if (command === "prepare") result = await prepare(options);
  else if (command === "diagnose") result = await diagnose(options);
  else if (command === "start") result = await runTurn(options, true);
  else if (command === "next") result = await runTurn(options);
  else if (command === "choose") result = choose(options);
  else if (command === "inspect") result = inspect(options);
  else if (command === "grade") result = grade(options);
  else if (command === "summary") result = summary(options);
  else throw new Error("unknown reviewer command");
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}
main().catch(error => { process.stderr.write(JSON.stringify({ harnessStatus: "FAILED", message: error.message }) + "\n"); process.exitCode = 1; });
