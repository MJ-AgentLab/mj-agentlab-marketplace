// Mechanical observations only. Independent reviewer judges meaning and applicability.
import fs from "node:fs";
import path from "node:path";
const batchFile = process.argv[2], batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
const rows = [];
for (const [id, state] of Object.entries(batch.cases)) for (const attempt of state.attempts) {
  const turns = [];
  for (const turn of attempt.turns) {
    const output = fs.existsSync(turn.outputFile) ? fs.readFileSync(turn.outputFile, "utf8") : "";
    const records = fs.existsSync(turn.eventsFile) ? fs.readFileSync(turn.eventsFile, "utf8").split(/\r?\n/).filter(Boolean).flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } }) : [];
    const tools = records.filter(r => r.type === "item.completed" && r.item?.type !== "agent_message").map(r => ({ type: r.item?.type, id: r.item?.id, status: r.item?.status, exitCode: r.item?.exit_code, command: r.item?.command ?? null }));
    turns.push({ turn: turn.turn, transportStatus: turn.transportStatus, actualIdentity: turn.actualIdentity ?? null, outputFile: turn.outputFile, unicodeCodePoints: [...output].length, hanCharacterCount: [...output].filter(c => /\p{Script=Han}/u.test(c)).length, tools, noSemanticGradeInferred: true });
  }
  rows.push({ variant: id, attemptId: attempt.attemptId, actualUuid: attempt.threadId, executionStatus: state.executionStatus, turns });
}
const file = path.join(batch.recordRoot, "operator-observations.json");
fs.writeFileSync(file, JSON.stringify({ recordedAt: new Date().toISOString(), canonicalSha: batch.source.canonicalSha, runtimeRawHashes: batch.runtime, effectStatus: "NOT_MEASURED", semanticStatus: "UNKNOWN_INDEPENDENT_REVIEW_REQUIRED", rows }, null, 2) + "\n");
console.log(JSON.stringify({ operatorObservationFile: file, noSemanticGrade: true }));
