// Operator convenience: select a literal option from actual output, never an answer key.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
const [batchFile, variant, turnArg] = process.argv.slice(2), turn = Number(turnArg ?? 1);
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8")), attempt = batch.cases[variant]?.attempts.at(-1);
const record = attempt?.turns[turn - 1];
if (record?.transportStatus !== "COMPLETE") throw new Error("actual completed output required");
const output = fs.readFileSync(record.outputFile, "utf8");
const labelMatch = output.match(/(?:方案|选项)\s*[A-Ca-c1-3一二三](?![A-Za-z0-9])/);
const headingMatch = output.match(/^\s*(?:#{1,5}\s*)?([1-3])[.、）)]\s*[^\r\n]+/m);
const label = labelMatch?.[0] ?? headingMatch?.[1];
if (!label) throw new Error("no unambiguous actual option label; manual choose required");
const quoteFile = path.join(path.dirname(record.outputFile), `selection-turn-${turn}.txt`);
// Complete original output is an exact excerpt and stays reviewer-only. Model receives label only.
fs.writeFileSync(quoteFile, output);
const r = spawnSync(process.execPath, [path.join(root, "harness.mjs"), "choose", "--batch", batchFile, "--variant", variant, "--turn", String(turn), "--label", label, "--quote-file", quoteFile], { encoding: "utf8", shell: false, windowsHide: true });
process.stdout.write(r.stdout); process.stderr.write(r.stderr); process.exitCode = r.status ?? 1;
