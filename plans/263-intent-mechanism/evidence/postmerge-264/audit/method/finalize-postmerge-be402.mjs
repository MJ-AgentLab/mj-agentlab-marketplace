import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const directory = path.join(root, 'postmerge-be402435-final');
const capture = JSON.parse(fs.readFileSync(path.join(directory, 'captured-audit.json'), 'utf8'));
const suite = capture.suiteDetails.find(item => item.id === 4591526268)?.data;
if (!suite) throw new Error('expected exact merge rule-suite unavailable');
const graph = capture.graph.data.repository.pullRequest;
const prRule = capture.rules.find(rule => rule.type === 'pull_request').parameters;
const required = capture.rules.find(rule => rule.type === 'required_status_checks').parameters.required_status_checks;
const checksBeforeMerge = capture.checks.filter(check => check.head_sha === capture.head && Date.parse(check.completed_at) <= Date.parse(capture.pull.merged_at));
const requiredCheckResults = required.map(required => ({ context: required.context, checks: checksBeforeMerge.filter(check => check.name === required.context).map(check => ({ head: check.head_sha, status: check.status, conclusion: check.conclusion, completedAt: check.completed_at, url: check.html_url })) }));
const matrix = checksBeforeMerge.filter(check => /^Baseline compat \((?:ubuntu|windows)-latest\)$/.test(check.name)).map(check => ({ name: check.name, head: check.head_sha, status: check.status, conclusion: check.conclusion, completedAt: check.completed_at, url: check.html_url }));
const approvalFailure = suite.rule_evaluations.find(item => item.rule_type === 'pull_request');
const suiteExact = suite.after_sha === capture.merge && suite.before_sha === capture.mergeCommit.parents[0] && suite.ref === 'refs/heads/develop' && suite.actor_name === capture.pull.merged_by && Date.parse(suite.pushed_at) === Date.parse(capture.pull.merged_at);
const requiredChecksPass = requiredCheckResults.every(item => item.checks.some(check => check.status === 'completed' && check.conclusion === 'success'));
const auditRequest = capture.requests.find(item => item.name === 'repository-org-audit-log');
const sameTree = capture.mergeCommit.tree === capture.headCommit.tree;
const report = {
  schemaVersion: 1, reviewer: '/root/latest_intent_fit', independent: true, capturedAt: new Date().toISOString(), capturedAtTaipei: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }) + ' Asia/Taipei',
  scope: 'Read-only independent audit of actual #264 merge and available protection execution evidence. TEMP evidence writes only; no repository changes, comments, approvals, review requests, identity changes, merges or rollback.',
  merged: capture.pull, mergeCommit: capture.mergeCommit, sourceHead: capture.headCommit, sameTree, actualDevelop: capture.actualDevelop,
  identityOutcome: capture.pull.actualMerge === capture.merge && capture.actualDevelop === capture.merge && sameTree && JSON.stringify(capture.mergeCommit.parents) === JSON.stringify(['e3ffecf4414f6ff27039a969b2ef670b1b9dc55e', capture.head]) ? 'PASS' : 'FAIL',
  approvalProtectionOutcome: 'NOT_MET_BYPASS_OBSERVED',
  observed: {
    ruleSuite: { id: suite.id, exactMergeBindingVerified: suiteExact, url: `https://api.github.com/repos/MJ-AgentLab/mj-agentlab-marketplace/rulesets/rule-suites/${suite.id}`, actor: suite.actor_name, before: suite.before_sha, after: suite.after_sha, ref: suite.ref, pushedAt: suite.pushed_at, result: suite.result, ruleEvaluations: suite.rule_evaluations },
    decisiveApprovalFailure: { enforcement: approvalFailure.enforcement, ruleType: approvalFailure.rule_type, result: approvalFailure.result, exactDetails: approvalFailure.details },
    actualReviews: capture.reviews, currentReviewDecision: graph.reviewDecision,
    threadCollection: { total: graph.reviewThreads.totalCount, retrieved: graph.reviewThreads.nodes.length, hasNextPage: graph.reviewThreads.pageInfo.hasNextPage, unresolved: graph.reviewThreads.nodes.filter(thread => !thread.isResolved) },
    headRequiredChecksCompletedBeforeMerge: { outcome: requiredChecksPass ? 'PASS' : 'NOT_PROVEN', results: requiredCheckResults },
    headPlatformMatrixCompletedBeforeMerge: matrix,
    currentActiveRules: { rulesetId: capture.ruleset.id, enforcement: capture.ruleset.enforcement, pullRequest: prRule, currentUserCanBypass: capture.ruleset.current_user_can_bypass, bypassActors: capture.ruleset.bypass_actors },
  },
  classification: {
    directlyObserved: 'GitHub suite4591526268 explicitly reports result=bypass for the exact e3ff-to-be402 develop update, with an active pull_request rule failure and its preserved last-push approval message. Bypass is not inferred solely from empty reviews. The same suite reports required_status_checks pass.',
    limitedInference: 'The observed current bypass permission is consistent with technical capability to bypass. It is not business authorization, proof of intent, a retroactive acceptance or a future exemption. No additional bypass mechanism or motive is inferred.',
    notEstablished: ['The organization audit-log endpoint returnedHTTP404. This does not establish that no audit event exists; organization audit evidence is unavailable through this request.', 'No real current-head non-author approval is present in the fully paginated review records; approval is not reconstructed from merge completion, checked CI or Agent acceptance.', 'Owner final INTENT product acceptance and acceptance of the draft wording remain unprovided; the other task acceptance does not cover Epic263.', 'Native unanswered-window persistence and long-term business effect remain outside this audit and unproved.', 'Parent Agent post-merge full tests, installations, Python and source recovery are separate work; this audit does not claim those runs completed.'],
  },
  organizationAuditAvailability: { exit: auditRequest.exit, response: capture.audit, source: 'repository-org-audit-log.json' },
  conclusions: ['Actual merge identity/tree/parents are verified.', 'Head checks and both platform matrices completed successfully before the recorded merge, but that does not repair the failed approval rule.', 'Protected approval was not met. Preserve the actual bypass fact and empty reviews without reporting protection PASS or assuming future exemption.', 'No rollback was performed or recommended as an autonomous action; retain facts and use normal protection for later corrective/documentation PRs.'],
  captureCorrection: capture.captureCorrection,
  sources: capture.requests,
};
if (!suiteExact || suite.result !== 'bypass' || approvalFailure.result !== 'fail') throw new Error('decisive suite does not match claimed bypass outcome');
fs.writeFileSync(path.join(directory, 'independent-postmerge-audit.json'), JSON.stringify(report, null, 2));
function ordinaryFiles(folder, prefix = '') {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => { const rel = prefix ? `${prefix}/${entry.name}` : entry.name; if (entry.isSymbolicLink()) throw new Error('unexpected evidence symlink'); return entry.isDirectory() ? ordinaryFiles(path.join(folder, entry.name), rel) : [rel]; });
}
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const files = ordinaryFiles(directory).filter(relative => relative !== 'audit-file-manifest.json').map(relative => ({ group: 'final', relative, absolute: path.join(directory, relative), bytes: fs.statSync(path.join(directory, relative)).size, sha256: hash(fs.readFileSync(path.join(directory, relative))) }));
const firstDirectory = path.join(root, 'postmerge-be402435');
for (const relative of ordinaryFiles(firstDirectory)) files.push({ group: 'initial-query-error', relative: `initial-query-error/${relative}`, absolute: path.join(firstDirectory, relative), bytes: fs.statSync(path.join(firstDirectory, relative)).size, sha256: hash(fs.readFileSync(path.join(firstDirectory, relative))) });
for (const relative of ['capture-postmerge-be402-query-error-r1.mjs', 'capture-postmerge-be402.mjs', 'finalize-postmerge-be402.mjs']) files.push({ group: 'method', relative, absolute: path.join(root, relative), bytes: fs.statSync(path.join(root, relative)).size, sha256: hash(fs.readFileSync(path.join(root, relative))) });
const manifest = { schemaVersion: 1, capturedAt: new Date().toISOString(), scope: 'Complete final and original failed-query evidence; preserve groups and exact bytes when copying', merge: capture.merge, files };
fs.writeFileSync(path.join(directory, 'audit-file-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ directory, audit: path.join(directory, 'independent-postmerge-audit.json'), manifest: path.join(directory, 'audit-file-manifest.json'), manifestSha256: hash(fs.readFileSync(path.join(directory, 'audit-file-manifest.json'))), files: files.length, identityOutcome: report.identityOutcome, sameTree, requiredChecksPass, approvalProtectionOutcome: report.approvalProtectionOutcome, ruleSuite: report.observed.ruleSuite.id, orgAuditStatus: capture.audit.status }, null, 2));
