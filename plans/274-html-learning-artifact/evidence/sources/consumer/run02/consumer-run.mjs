import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chromium } from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

// Usage: node consumer-run.mjs <exact-installed-site/SKILL.md> <new-evidence-dir>
// This independent consumer does not edit the package or contact Sites.
const [skillArgument, evidenceArgument] = process.argv.slice(2);
if (!skillArgument || !evidenceArgument) throw new Error('Require exact installed SKILL.md and a new evidence directory');
const skill = path.resolve(skillArgument), site = path.dirname(skill), evidence = path.resolve(evidenceArgument);
assert.equal(path.basename(skill), 'SKILL.md');
assert.ok(fs.statSync(skill).isFile());
assert.equal(fs.existsSync(evidence), false, 'Use a new evidence directory, preserving earlier runs');
fs.mkdirSync(evidence, { recursive: true });
const consumer = path.join(evidence, 'consumer-cwd');
fs.mkdirSync(consumer);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => fs.readFileSync(file, 'utf8');
const digestFile = file => sha(fs.readFileSync(file));
const report = { schemaVersion: 1, role: 'Independent content/learning-design and installed-package consumer', executedAt: new Date().toISOString(), skillLocator: skill, skillSha256: digestFile(skill), cases: [], limitations: ['Synthetic local browser and engineering checks do not establish Sites publication, protected GitHub approval, Owner final acceptance or understanding effects.', 'Clipboard rejection/missing-API paths are explicitly injected faults in a real browser. Successful copy is separately checked through unmodified native Clipboard API and actual readback.', 'Initial desktop/mobile screenshots and no-JavaScript static content are bounded checks, not full visual/accessibility or learner-effect evaluation.'] };
const save = () => fs.writeFileSync(path.join(evidence, 'consumer-report.json'), JSON.stringify(report, null, 2) + '\n');
async function step(id, action) {
  try { const detail = await action(); report.cases.push({ id, status: 'PASS', detail }); save(); }
  catch (error) { report.cases.push({ id, status: 'FAIL', detail: String(error.stack || error) }); report.status = 'FAIL'; save(); throw error; }
}
function copyTree(source, target) {
  assert.equal(fs.lstatSync(source).isSymbolicLink(), false);
  fs.mkdirSync(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    assert.equal(entry.isSymbolicLink(), false);
    const from = path.join(source, entry.name), to = path.join(target, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else { assert.ok(entry.isFile()); fs.writeFileSync(to, fs.readFileSync(from)); }
  }
}
function execute(name, command, args, timeout=60000) {
  const result = spawnSync(command, args, { cwd: consumer, encoding: 'utf8', shell: false, timeout, maxBuffer: 8*1024*1024, env: { ...process.env, PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1' } });
  fs.writeFileSync(path.join(evidence, name + '.stdout.log'), result.stdout || '');
  fs.writeFileSync(path.join(evidence, name + '.stderr.log'), result.stderr || '');
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, `${name}: ${result.stdout}\n${result.stderr}`);
  return result;
}

let browser, server;
const input = path.join(consumer, 'representative-input'), artifact = path.join(consumer, 'artifact');
let config, material, original;
try {
  await step('installed-resources-read-and-source-snapshot', async () => {
    const refs = path.join(site, 'references'), resources = [];
    const texts = { 'SKILL.md': read(skill) };
    for (const name of fs.readdirSync(refs).sort()) {
      const file = path.join(refs, name);
      assert.ok(fs.statSync(file).isFile());
      const body = read(file);
      if (name.endsWith('.json')) JSON.parse(body);
      texts['references/' + name] = body;
      resources.push({ path: 'references/' + name, sha256: digestFile(file), bytes: fs.statSync(file).size });
    }
    fs.writeFileSync(path.join(evidence, 'read-resources.json'), JSON.stringify({ skillSha256: report.skillSha256, resources, texts }, null, 2));
    copyTree(path.join(site, 'examples/representative'), input);
    config = JSON.parse(read(path.join(input, 'artifact.json')));
    material = read(path.join(input, config.markdown));
    original = read(path.join(input, config.sources[0].path));
    report.inputHashes = { 'artifact.json': digestFile(path.join(input, 'artifact.json')), [config.markdown]: digestFile(path.join(input, config.markdown)), [config.sources[0].path]: digestFile(path.join(input, config.sources[0].path)) };
    report.packageVersion = JSON.parse(read(path.resolve(site, '../../plugin.json'))).version;
    return { packageVersion: report.packageVersion, referenceCount: resources.length, consumerCwd: consumer, sourcePaths: config.sources.map(s => s.path || s.url) };
  });
  await step('render-and-actual-installed-python-checkers', async () => {
    execute('renderer', process.execPath, [path.join(site, 'scripts/render-site.mjs'), '--input', input, '--output', artifact]);
    const python = process.env.HTML_SITE_PYTHON || process.env.PYTHON || 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
    const chrome = process.env.HTML_SITE_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
    execute('static', python, [path.join(site, 'scripts/check_artifact.py'), '--input', artifact, '--output', path.join(evidence, 'static.json')]);
    execute('layout', python, [path.join(site, 'scripts/check_renderings.py'), '--input', artifact, '--screenshots', path.join(evidence, 'screenshots'), '--output', path.join(evidence, 'layout.json'), '--browser', chrome]);
    const a = JSON.parse(read(path.join(evidence, 'static.json'))), b = JSON.parse(read(path.join(evidence, 'layout.json')));
    assert.equal(a.status, 'PASS'); assert.equal(b.status, 'PASS');
    assert.equal(a.summary.pages, 1);
    assert.deepEqual(b.viewports.map(v => v.viewport), [{width:1366,height:900},{width:390,height:844}]);
    report.generatedManifestSha256 = digestFile(path.join(artifact, 'artifact-manifest.json'));
    return { static: a.summary, viewports: b.viewports.map(v => ({viewport:v.viewport,screenshot:v.screenshot,screenshotSha256:v.screenshotSha256})), pythonVersion:a.pythonVersion };
  });
  await step('independent-LIB-rules-date-and-criteria-review', async () => {
    // Expected decisions are derived independently from the actual source rules:
    // LIB2 AND of two conditions; LIB3 + seven calendar days on success only;
    // LIB4 requires both success text and updated date, with unknown preserved.
    for (const label of ['LIB1','LIB2','LIB3','LIB4']) assert.ok(original.includes(label));
    assert.ok(original.includes('且没有其他读者预约'));
    assert.ok(original.includes('七个日历日'));
    assert.ok(original.includes('失败时，原到期日不变'));
    assert.ok(original.includes('没有成功确认不等于已确认失败'));
    const combinations = [[true,true,true],[true,false,false],[false,true,false],[false,false,false]];
    assert.deepEqual(combinations.map(([notOverdue,noReservation]) => notOverdue && noReservation), combinations.map(row => row[2]));
    const date = new Date('2026-10-29T00:00:00Z'); date.setUTCDate(date.getUTCDate()+7);
    assert.equal(date.toISOString().slice(0,10), '2026-11-05');
    assert.ok(material.includes('2026-11-05') && material.includes('失败时仍为 2026-10-29'));
    assert.ok(material.includes('不是申请日') || material.includes('没有用申请日'));
    assert.ok(material.includes('不能自行选择') && material.includes('不等于已确认失败'));
    const expected = [{id:'permission-check',correctIndex:1},{id:'date-check',correctIndex:0},{id:'completion-check',correctIndex:1}];
    assert.deepEqual(config.activities.map(({id,correctIndex}) => ({id,correctIndex})), expected);
    assert.match(config.activities[0].options[1].label, /不允许/);
    assert.match(config.activities[0].options[0].feedback, /还要求没有其他读者预约/);
    assert.match(config.activities[1].options[0].label, /2026-11-05.*2026-10-29/);
    assert.match(config.activities[2].options[1].label, /已提交.*不能确认.*不能.*失败/);
    for (const term of config.terms) { assert.ok(material.includes(term.english)); assert.ok(material.includes(term.chinese)); }
    return { sourceSha256:report.inputHashes[config.sources[0].path], combinations, successDate:date.toISOString().slice(0,10), failureDate:'2026-10-29', expected, assessment:'Conditions, exceptions, cross-month date and three local criteria agree with LIB1–LIB4 within this synthetic material; no real library policy or learner improvement inferred.' };
  });
  const requests = [];
  server = http.createServer((request,response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname), file = path.resolve(artifact, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(artifact + path.sep) || !fs.statSync(file).isFile()) throw new Error('not found');
      const type = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.md':'text/markdown'}[path.extname(file)] || 'application/octet-stream';
      requests.push({path:pathname,status:200}); response.writeHead(200,{'Content-Type':type+';charset=utf-8'}); response.end(fs.readFileSync(file));
    } catch { requests.push({path:request.url,status:404}); response.writeHead(404); response.end('not found'); }
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({executablePath:process.env.HTML_SITE_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const context = await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],viewport:{width:1366,height:900}});
  const page = await context.newPage(), pageErrors = [];
  page.on('pageerror',error => pageErrors.push(String(error)));
  await page.goto(origin, {waitUntil:'networkidle'});
  const q1 = page.locator('form[data-activity="permission-check"]'), q2 = page.locator('form[data-activity="date-check"]'), q3 = page.locator('form[data-activity="completion-check"]');
  const field = page.locator('#export-text'), status = page.locator('#export-status');
  await step('rendered-content-table-source-and-terminology', async () => {
    const rows = await page.locator('.reading table tbody tr').allTextContents();
    assert.equal(rows.length,4);
    assert.match(rows[0], /是\s*是\s*允许/);
    for (const row of rows.slice(1)) assert.match(row,/不允许/);
    const body = await page.locator('body').innerText();
    for (const term of config.terms) { assert.ok(body.includes(term.english)); assert.ok(body.includes(term.chinese)); for(const forbidden of term.forbidden || []) assert.equal(body.includes(forbidden),false); }
    assert.ok(body.includes('NOT_MEASURED'));
    for(const source of config.sources) {
      assert.ok((await page.locator(`#source-${source.id}`).innerText()).includes(source.locator));
      const fetched = await context.request.get(origin+'/'+source.path.split('/').map(encodeURIComponent).join('/'));
      assert.equal(fetched.status(),200); assert.deepEqual(await fetched.body(),fs.readFileSync(path.join(input,source.path)));
    }
    return { rows, sourceBytesMatch:true, semanticScope:'LIB synthetic exercise only' };
  });
  await step('unselected-is-not-an-answer',async () => {
    assert.equal(await page.locator('input[type=radio]:checked').count(),0);
    await q1.locator('button[type=submit]').click();
    assert.match(await q1.locator('[data-feedback]').innerText(), /未选择不算回答/);
    assert.match(await page.locator('#practice-status').innerText(), /0\s*\/\s*3/);
    await page.locator('[data-export]').click();
    assert.equal((await field.inputValue()).includes('核对次数：1'),false);
    return {checked:0,reviewed:0};
  });
  await step('wrong-feedback-change-invalidation-and-correct-recheck',async () => {
    await q1.locator('input[value="0"]').check(); await q1.locator('button[type=submit]').click();
    assert.equal(await q1.locator('[data-feedback]').getAttribute('data-result'),'review');
    assert.match(await q1.locator('[data-feedback]').innerText(), /还要求没有其他读者预约/);
    await page.locator('[data-export]').click(); assert.ok((await field.inputValue()).includes('需要复核'));
    await q1.locator('input[value="1"]').check();
    assert.equal(await field.inputValue(),''); assert.equal(await page.locator('[data-copy]').isDisabled(),true);
    assert.equal(await q1.locator('[data-feedback]').getAttribute('data-result'),null);
    assert.match(await q1.locator('[data-feedback]').innerText(), /重新核对/);
    await q1.locator('button[type=submit]').click();
    assert.equal(await q1.locator('[data-feedback]').getAttribute('data-result'),'match');
    assert.equal(await q1.locator('[data-feedback] a').getAttribute('href'),'#source-renewal-rules');
    await q2.locator('input[value="0"]').check(); await q2.locator('button[type=submit]').click();
    await q3.locator('input[value="1"]').check(); await q3.locator('button[type=submit]').click();
    assert.match(await page.locator('#practice-status').innerText(), /3\s*\/\s*3/);
    return {q1Attempts:2,reviewed:3};
  });
  let exported;
  await step('export-version-state-source-locators-and-actual-downloads',async () => {
    await page.locator('#reflection').fill('合成消费者核验：提交不等于完成，未知结果保留未知。');
    await page.locator('[data-export]').click(); exported = await field.inputValue();
    assert.ok(exported.includes(`材料版本：${config.version}`));
    assert.equal((exported.match(/本次判断：与参考匹配/g)||[]).length,3);
    assert.ok(exported.includes('核对次数：2'));
    for(const source of config.sources) for(const value of [source.id,source.title,source.locator,source.path,source.url].filter(Boolean)) assert.ok(exported.includes(value));
    assert.equal(/[A-Za-z]:[\\/]|\/Users\//.test(exported),false,'export must not disclose host absolute paths');
    fs.writeFileSync(path.join(evidence,'export-checked.md'),exported);
    const [download] = await Promise.all([page.waitForEvent('download'),page.locator('[data-download]').click()]);
    await download.saveAs(path.join(evidence,'downloaded-learning-record.md'));
    assert.equal(read(path.join(evidence,'downloaded-learning-record.md')),exported);
    const [materialDownload] = await Promise.all([page.waitForEvent('download'),page.locator(`a[download][href="${config.markdown}"]`).click()]);
    await materialDownload.saveAs(path.join(evidence,'downloaded-material.md'));
    assert.deepEqual(fs.readFileSync(path.join(evidence,'downloaded-material.md')),fs.readFileSync(path.join(input,config.markdown)));
    return {recordSha256:sha(exported),recordDownloadSha256:digestFile(path.join(evidence,'downloaded-learning-record.md')),materialDownloadSha256:digestFile(path.join(evidence,'downloaded-material.md')),sourceLocatorCount:config.sources.length};
  });
  await step('real-native-clipboard-success-and-readback',async () => {
    const native = await page.evaluate(() => ({secure:isSecureContext,writeText:String(navigator.clipboard.writeText)}));
    assert.equal(native.secure,true); assert.ok(native.writeText.includes('[native code]'));
    await page.locator('[data-copy]').click();
    await page.waitForFunction(() => document.getElementById('export-status').textContent.includes('已复制本次记录'));
    const actual = await page.evaluate(() => navigator.clipboard.readText());
    fs.writeFileSync(path.join(evidence,'clipboard-readback.txt'),actual);
    const normalized = actual.replace(/\r\n/g,'\n');
    assert.equal(normalized,exported,'Windows Clipboard CRLF conversion may change newline representation only; all content must remain exact');
    return {mechanism:'Unmodified native navigator.clipboard.writeText on local secure origin; actual native readText matches all content after Windows CRLF-to-LF newline normalization only',rawClipboardSha256:sha(actual),normalizedClipboardSha256:sha(normalized),exportSha256:sha(exported),rawBytes:Buffer.byteLength(actual),exportBytes:Buffer.byteLength(exported),byteIdentical:actual===exported,crlfCount:(actual.match(/\r\n/g)||[]).length,scope:'Actual successful copy and content preservation; not a byte-identical LF clipboard claim. First strict-byte comparison failure remains in run01.'};
  });
  await step('clipboard-rejection-fault-selects-text-and-Escape-returns-focus',async () => {
    await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new DOMException('Consumer QA injected rejection','NotAllowedError')}}}));
    await page.locator('[data-copy]').click();
    await page.waitForFunction(() => document.activeElement === document.getElementById('export-text'));
    const selection = await field.evaluate(el => ({start:el.selectionStart,end:el.selectionEnd,length:el.value.length}));
    assert.equal(selection.start,0); assert.equal(selection.end,selection.length);
    assert.match(await status.innerText(),/自动复制未成功/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-copy]').evaluate(el=>document.activeElement===el),true);
    assert.equal(await page.locator('[data-copy-return]').isVisible(),false);
    assert.match(await status.innerText(),/未作确认/);
    return {faultInjection:'writeText rejects with NotAllowedError in real browser; not a success simulation',selection,returnedBy:'Escape',manualCopyCompletion:'UNCONFIRMED'};
  });
  await step('missing-clipboard-API-fault-selects-text-and-return-button',async () => {
    await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
    await page.locator('[data-copy]').click();
    await page.waitForFunction(() => document.activeElement === document.getElementById('export-text'));
    assert.equal(await field.evaluate(el=>el.selectionStart===0&&el.selectionEnd===el.value.length),true);
    await page.locator('[data-copy-return]').click();
    assert.equal(await page.locator('[data-copy]').evaluate(el=>document.activeElement===el),true);
    assert.match(await status.innerText(),/未作确认/);
    return {faultInjection:'navigator.clipboard absent in real browser',returnedBy:'visible return button',manualCopyCompletion:'UNCONFIRMED'};
  });
  await step('changed-answer-export-and-reset-remove-stale-checked-state',async () => {
    await q1.locator('input[value="0"]').check();
    assert.equal(await field.inputValue(),''); assert.equal(await page.locator('[data-download]').isVisible(),false);
    await page.locator('[data-export]').click();
    const changed = await field.inputValue(), q1Section = changed.split('## permission-check')[1].split('## date-check')[0];
    assert.ok(q1Section.includes('当前选择尚未核对')); assert.equal(q1Section.includes('对应反馈：'),false);
    fs.writeFileSync(path.join(evidence,'export-changed-unchecked.md'),changed);
    await q1.locator('button[type=submit]').click(); await page.locator('[data-export]').click();
    assert.ok((await field.inputValue()).includes('本次判断：需要复核'));
    await page.locator('[data-reset]').click();
    assert.equal(await page.locator('input[type=radio]:checked').count(),0);
    assert.equal(await field.inputValue(),''); assert.equal(await page.locator('#reflection').inputValue(),'');
    assert.equal(await page.locator('[data-copy]').isDisabled(),true); assert.equal(await page.locator('[data-download]').isVisible(),false);
    await page.locator('[data-export]').click();
    const reset = await field.inputValue();
    assert.equal((reset.match(/核对次数：0/g)||[]).length,3); assert.equal((reset.match(/当前选择：未选择/g)||[]).length,3);
    assert.equal(reset.includes('对应反馈：'),false); assert.equal(reset.includes('本次判断：与参考匹配'),false);
    fs.writeFileSync(path.join(evidence,'export-reset.md'),reset);
    assert.deepEqual(pageErrors,[]);
    return {changedSelectionRequiresRecheck:true,resetCounts:[0,0,0],oldFeedbackAbsent:true,pageErrors};
  });
  await step('JavaScript-disabled-static-reading-and-native-reference-disclosure',async () => {
    const staticContext = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}), staticPage = await staticContext.newPage();
    await staticPage.goto(origin,{waitUntil:'networkidle'});
    assert.equal(await staticPage.locator('html').getAttribute('class'),null);
    assert.equal(await staticPage.locator('.reading table tbody tr').count(),4);
    const text = await staticPage.locator('.reading').innerText();
    assert.ok(text.includes('2026-11-05') && text.includes('没有成功确认不等于已确认失败'));
    assert.equal(await staticPage.locator('[data-export]').isVisible(),false);
    for(let i=0;i<3;i++) {
      const detail = staticPage.locator('.activity details').nth(i);
      await detail.locator('summary').click();
      assert.equal(await detail.getAttribute('open'),'');
      assert.ok((await detail.innerText()).includes(config.activities[i].reference));
    }
    await staticPage.screenshot({path:path.join(evidence,'static-no-js-mobile.png'),fullPage:true});
    await staticContext.close();
    return {necessaryContentReadable:true,conditionRows:4,nativeReferenceDisclosures:3,javascript:false};
  });
  report.browserVersion = browser.version();
  report.requestLog = requests;
  report.status = 'PASS';
} catch(error) {
  report.status = 'FAIL'; report.error = String(error.stack || error); process.exitCode = 1;
} finally {
  if(browser) await browser.close();
  if(server) await new Promise(resolve => server.close(resolve));
  report.completedAt = new Date().toISOString(); save();
  console.log(JSON.stringify({status:report.status,cases:report.cases.map(({id,status})=>({id,status})),evidence},null,2));
}
