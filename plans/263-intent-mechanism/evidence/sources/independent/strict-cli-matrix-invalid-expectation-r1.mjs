import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const fixedRun = path.join(root, '1093fe79');
const original = 'docs/intent/[INTENT]_INT-2026-001_Independent.md';
const pristine = path.join(fixedRun, 'fixture-01-valid');
const source = fs.readFileSync(path.join(pristine, original), 'utf8');
const cases = [
  ['non-scalar-owner', source.replace('owner: independent-agent', 'owner: [independent-agent]')],
  ['impossible-date', source.replace('updated: 2026-10-19', 'updated: 2026-02-30')],
  ['working-intent-layer', source.replace('layer: canonical', 'layer: working')],
  ['owned-path-escape', source.replace('Complete synthetic input ', 'Complete synthetic input [source](../../../outside.md) ')],
];
const results = cases.map(([name, input]) => {
  const fixture = path.join(fixedRun, `strict-cli-${name}`);
  fs.cpSync(pristine, fixture, { recursive: true });
  fs.writeFileSync(path.join(fixture, original), input);
  const argv = [path.join(fixedRun, 'fixed/scripts/document-harness.mjs'), fixture, '--file', original];
  const executed = spawnSync(process.execPath, argv, { encoding: 'utf8', windowsHide: true });
  const output = JSON.parse(executed.stdout);
  return { name, input, fixture, argv, status: executed.status, stdout: executed.stdout, stderr: executed.stderr, met: executed.status === 1 && output.ok === false && output.intents.uniqueness.checked === false, output };
});
const report = { rubric: 'INTENT-IA-R1', scope: 'S8 strict public CLI metadata/date/layer/path variants', implementation: '1093fe7994493e8d621c2a0de1ecd6f3dad37688', capturedAt: new Date().toISOString(), reviewer: '/root/latest_intent_fit', independent: true, pinnedSourceSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(fixedRun, 'fixed/scripts/document-harness.mjs'))).digest('hex'), results, met: results.filter(r => r.met).length, total: results.length };
fs.writeFileSync(path.join(fixedRun, 'strict-cli-matrix-results.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ met: report.met, total: report.total, results: results.map(r => ({ name: r.name, met: r.met, status: r.status, errors: r.output.errors })) }, null, 2));
process.exitCode = report.met === report.total ? 0 : 1;
