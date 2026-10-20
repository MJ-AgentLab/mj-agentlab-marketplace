import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const repo = 'C:/Users/Admin/.codex/worktrees/html-prompt-alignment/develop';
const evidence = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Z]:))/, '$1'));
const python = 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const { renderSite } = await import(pathToFileURL(path.join(repo, 'plugins/html-guide-kit/skills/site/scripts/render-site.mjs')));
const example = path.join(repo, 'plugins/html-guide-kit/skills/site/examples/representative');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const files = root => fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(root, entry.name)).map(name => `${entry.name}/${name}`) : [entry.name]).sort();
const inventory = root => Object.fromEntries(files(root).map(name => [name, digest(fs.readFileSync(path.join(root, name)))]));
const save = (name, value) => fs.writeFileSync(path.join(evidence, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
const originalInputs = inventory(example);
const defaultAfter = path.join(evidence, 'default-after');
renderSite({ input: example, output: defaultAfter });
const beforeInventory = inventory(path.join(evidence, 'default-before'));
const afterInventory = inventory(defaultAfter);
assert.deepEqual(afterInventory, beforeInventory);
save('default-byte-compatibility.json', { recordedAt: new Date().toISOString(), status: 'PASS', before: beforeInventory, after: afterInventory });

function execute(script, args, filename) {
  const run = spawnSync(python, [script, ...args], { cwd: evidence, encoding: 'utf8', shell: false, timeout: 45000, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1' } });
  fs.writeFileSync(path.join(evidence, filename), run.stdout, { flag: 'wx' });
  fs.writeFileSync(path.join(evidence, filename + '.stderr.log'), run.stderr, { flag: 'wx' });
  assert.equal(run.error, undefined, run.error?.message);
  assert.equal(run.status, 0, run.stdout + run.stderr);
  const report = JSON.parse(run.stdout); assert.equal(report.status, 'PASS'); return report;
}
const staticScript = path.join(repo, 'plugins/html-guide-kit/skills/site/scripts/check_artifact.py');
const reports = { default: execute(staticScript, ['--input', defaultAfter], 'default-static.json') };
const browserReports = {};
const computed = {};
function contrast(a, b) {
  const lum = value => value.match(/\d+/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const values = [lum(a), lum(b)].sort((x, y) => y - x); return (values[0] + .05) / (values[1] + .05);
}
for (const theme of ['warm-paper', 'neutral']) {
  const input = path.join(evidence, `${theme}-input`), output = path.join(evidence, `${theme}-output`);
  fs.cpSync(example, input, { recursive: true });
  const artifact = JSON.parse(fs.readFileSync(path.join(input, 'artifact.json'), 'utf8'));
  artifact.theme = theme;
  fs.writeFileSync(path.join(input, 'artifact.json'), JSON.stringify(artifact, null, 2) + '\n');
  const inputs = inventory(input);
  renderSite({ input, output });
  assert.deepEqual(inventory(input), inputs);
  for (const [name, hash] of Object.entries(inputs)) assert.equal(inventory(output)[name], hash);
  reports[theme] = execute(staticScript, ['--input', output], `${theme}-static.json`);
  browserReports[theme] = execute(path.join(evidence, 'browser-palette-probe.py'), [repo, '--input', output, '--screenshots', path.join(evidence, `${theme}-screenshots`)], `${theme}-browser.json`);
  computed[theme] = browserReports[theme].viewports.map(viewport => viewport.palette);
  if (theme === 'neutral') {
    for (const palette of computed[theme]) {
      assert.equal(palette.paper, 'rgb(250, 250, 250)');
      assert.equal(palette.link, 'rgb(64, 64, 64)');
      assert.equal(palette.selectedBoundary, 'rgb(89, 89, 89)');
      assert.equal(palette.activityBoundary, 'rgb(118, 118, 118)');
      assert.ok(palette.headingFont.includes('system-ui'));
      for (const background of [palette.paper, palette.wash, palette.activityBackground]) {
        for (const foreground of [palette.body, palette.heading, palette.link]) assert.ok(contrast(foreground, background) >= 4.5);
        for (const boundary of [palette.accent, palette.selectedBoundary, palette.textareaBoundary, palette.activityBoundary]) assert.ok(contrast(boundary, background) >= 3);
      }
      assert.ok(contrast(palette.buttonText, palette.buttonBackground) >= 4.5);
    }
  }
}
for (let index = 0; index < 2; index++) assert.notEqual(browserReports['warm-paper'].viewports[index].screenshotSha256, browserReports.neutral.viewports[index].screenshotSha256);
assert.deepEqual(inventory(example), originalInputs);
save('verification-summary.json', { recordedAt: new Date().toISOString(), nodeVersion: process.version, python, status: 'PASS', defaultAllOutputBytesPreserved: true, sourceExampleBytesPreserved: true, static: Object.fromEntries(Object.entries(reports).map(([name, report]) => [name, { status: report.status, pythonVersion: report.pythonVersion, checks: report.summary.checks }])), browser: Object.fromEntries(Object.entries(browserReports).map(([name, report]) => [name, { status: report.status, browser: report.browser, viewports: report.viewports.map(v => ({ viewport: v.viewport, status: v.status, screenshotSha256: v.screenshotSha256 })) }])), computedStyles: computed, limitations: ['Bounded local desktop/mobile geometry, initial screenshot and selected-radio computed-style evidence only.', 'No deployed Sites, second client, native question-window lifecycle, comprehensive WCAG or understanding-effect evaluation.'] });
console.log(JSON.stringify({ status: 'PASS', evidence, defaultAllOutputBytesPreserved: true, staticThemes: Object.keys(reports), browserThemes: Object.keys(browserReports) }));
