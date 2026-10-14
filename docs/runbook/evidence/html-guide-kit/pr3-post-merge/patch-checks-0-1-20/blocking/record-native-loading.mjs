// Reviewer-only source observations; produces no semantic grade.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const [batchFile] = process.argv.slice(2);
if (!batchFile) throw new Error("supply the exact reviewer batch.json");
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const norm = s => s.replace(/\\+/g, "/").replace(/^\/+\?\//, "").toLowerCase();
const resources = Object.fromEntries(["SKILL.md", "references/guide-framework.md", "references/interaction-design.md"].map(relative => {
  const locator = path.join(batch.cacheRoot, "skills/guide", relative), bytes = fs.readFileSync(locator);
  return [relative, { locator, sha256: sha(bytes), text: bytes.toString("utf8") }];
}));
const observations = [];
for (const [variant, state] of Object.entries(batch.cases)) for (const attempt of state.attempts) {
  const first = attempt.turns[0]; if (!first?.sessionSnapshot || !fs.existsSync(first.sessionSnapshot)) continue;
  const input = fs.readFileSync(first.inputFile, "utf8"), nativeAttachments = [], successfulShellReads = [], toolEvents = [];
  const session = fs.readFileSync(first.sessionSnapshot, "utf8").split(/\r?\n/);
  session.forEach((line, index) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type !== "response_item" || event.payload?.type !== "message" || event.payload.role !== "user") return;
    for (const content of event.payload.content ?? []) {
      if (typeof content.text !== "string") continue;
      for (const match of content.text.matchAll(/<skill>\s*<name>([^<]+)<\/name>\s*<path>([^<]+)<\/path>\s*([\s\S]*?)<\/skill>/g)) {
        nativeAttachments.push({ sessionFile: first.sessionSnapshot, jsonlLine: index + 1, role: "user", name: match[1], suppliedPath: match[2], cachePathMatches: norm(match[2]) === norm(resources["SKILL.md"].locator), exactUtf8TrimBodyMatchesCache: match[3].trim() === resources["SKILL.md"].text.trim(), cachedBytesSha256: resources["SKILL.md"].sha256, operatorStdinContainsCachedBody: input.includes(resources["SKILL.md"].text.trim()) });
      }
    }
  });
  for (const turn of attempt.turns) {
    if (!fs.existsSync(turn.eventsFile)) continue;
    fs.readFileSync(turn.eventsFile, "utf8").split(/\r?\n/).forEach((line, index) => {
      if (!line.trim()) return;
      const event = JSON.parse(line), item = event.item;
      if (event.type !== "item.completed" || !item || item.type === "agent_message") return;
      toolEvents.push({ turn: turn.turn, eventsFile: turn.eventsFile, jsonlLine: index + 1, itemId: item.id, type: item.type, status: item.status, exitCode: item.exit_code });
      if (item.type !== "command_execution" || item.exit_code !== 0 || item.status !== "completed") return;
      for (const [relative, resource] of Object.entries(resources)) {
        if (norm(item.command ?? "").includes(norm(resource.locator)) && (item.aggregated_output ?? "").includes(resource.text.trim())) successfulShellReads.push({ relative, locator: resource.locator, cachedBytesSha256: resource.sha256, turn: turn.turn, eventsFile: turn.eventsFile, jsonlLine: index + 1, itemId: item.id, successfulCommand: true, completeReturnedContentMatchesCacheUtf8Trim: true });
      }
    });
  }
  observations.push({ variant, attemptId: attempt.attemptId, realSessionUuid: attempt.threadId, method: attempt.method, nativeAttachments, successfulShellReads, toolEvents, noFabricatedToolEvents: true, noModelClaimsUsedAsSourceProof: true, semanticStatus: "UNKNOWN_NOT_GRADED_BY_OPERATOR", scopeNote: "Native loader attachment is a supplemental client source fact, separately preserved from successful/declined shell reads. The independent reviewer determines applicability and contract interpretation." });
}
const out = path.join(batch.recordRoot, "native-loading-observations.json");
fs.writeFileSync(out, JSON.stringify({ recordedAt: new Date().toISOString(), canonicalSha: batch.source.canonicalSha, runtimeSourceMirrorCache: batch.runtime, observations }, null, 2) + "\n");
console.log(JSON.stringify({ observationFile: out, semanticStatus: "UNKNOWN", attempts: observations.length }, null, 2));
