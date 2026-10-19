import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const repo = process.argv[2];
const directory = path.join(root, 'postmerge-be402435-final');
fs.mkdirSync(directory, { recursive: true });
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const requests = [];
function read(name, argv, optional = false) {
  const startedAt = new Date().toISOString();
  const result = spawnSync('gh', argv, { cwd: repo, maxBuffer: 32 * 1024 * 1024, windowsHide: true });
  const endedAt = new Date().toISOString();
  const stdout = result.stdout ?? Buffer.alloc(0), stderr = result.stderr ?? Buffer.alloc(0);
  fs.writeFileSync(path.join(directory, `${name}.json`), stdout);
  fs.writeFileSync(path.join(directory, `${name}.stderr`), stderr);
  requests.push({ name, argv: ['gh', ...argv], startedAt, endedAt, exit: result.status, optional, stdout: { path: `${name}.json`, bytes: stdout.length, sha256: hash(stdout) }, stderr: { path: `${name}.stderr`, bytes: stderr.length, sha256: hash(stderr) } });
  fs.writeFileSync(path.join(directory, 'requests-partial.json'), JSON.stringify(requests, null, 2));
  if (result.status !== 0 && !optional) throw new Error(`Required read failed: ${name}: ${stderr}`);
  try { return JSON.parse(stdout); } catch { return null; }
}
const merge = 'be4024353155ebaad8301dba8a9949666d376877';
const head = 'b978b44f10524a42407df2866dff7b4711d14e38';
const pull = read('pull-264', ['api', 'repos/MJ-AgentLab/mj-agentlab-marketplace/pulls/264']);
const mergeCommit = read('merge-commit', ['api', `repos/MJ-AgentLab/mj-agentlab-marketplace/commits/${merge}`]);
const headCommit = read('head-commit', ['api', `repos/MJ-AgentLab/mj-agentlab-marketplace/commits/${head}`]);
const branch = read('develop-ref', ['api', 'repos/MJ-AgentLab/mj-agentlab-marketplace/git/ref/heads/develop']);
const reviews = read('reviews-paginated', ['api', '--paginate', '--slurp', 'repos/MJ-AgentLab/mj-agentlab-marketplace/pulls/264/reviews?per_page=100']).flat();
const rules = read('develop-effective-rules', ['api', 'repos/MJ-AgentLab/mj-agentlab-marketplace/rules/branches/develop']);
const ruleset = read('develop-ruleset', ['api', 'repos/MJ-AgentLab/mj-agentlab-marketplace/rulesets/14008221']);
const suites = read('develop-rule-suites', ['api', '--paginate', '--slurp', 'repos/MJ-AgentLab/mj-agentlab-marketplace/rulesets/rule-suites?ref=refs%2Fheads%2Fdevelop&per_page=100'], true);
const suiteList = Array.isArray(suites) ? suites.flat() : [];
const selected = suiteList.filter(suite => JSON.stringify(suite).includes(merge));
const suiteDetails = selected.map(suite => ({ id: suite.id, data: read(`rule-suite-${suite.id}`, ['api', `repos/MJ-AgentLab/mj-agentlab-marketplace/rulesets/rule-suites/${suite.id}`], true) }));
const checks = read('head-checks-paginated', ['api', '--paginate', '--slurp', `repos/MJ-AgentLab/mj-agentlab-marketplace/commits/${head}/check-runs?per_page=100`]).flatMap(page => page.check_runs);
const mergeChecks = read('merge-checks-paginated', ['api', '--paginate', '--slurp', `repos/MJ-AgentLab/mj-agentlab-marketplace/commits/${merge}/check-runs?per_page=100`], true);
const query = `query {
  repository(owner:"MJ-AgentLab", name:"mj-agentlab-marketplace") {
    pullRequest(number:264) {
      number headRefOid baseRefOid mergedAt
      mergeCommit { oid tree { oid } }
      author { login } mergedBy { login } reviewDecision
      reviewThreads(first:100) {
        totalCount pageInfo { hasNextPage endCursor }
        nodes { id isResolved isOutdated path line comments(first:1) { nodes { url author { login } } } }
      }
    }
  }
}`;
if ((query.match(/\{/g) ?? []).length !== (query.match(/\}/g) ?? []).length) throw new Error('local GraphQL brace balance failed');
const graph = read('pull-graphql', ['api', 'graphql', '-f', `query=${query}`]);
const audit = read('repository-org-audit-log', ['api', '--method', 'GET', 'orgs/MJ-AgentLab/audit-log', '-f', 'phrase=repo:MJ-AgentLab/mj-agentlab-marketplace created:2026-10-19', '-f', 'per_page=100'], true);
const capture = { schemaVersion: 1, reviewer: '/root/latest_intent_fit', readOnly: true, capturedAt: new Date().toISOString(), merge, head, directory, pull: { merged: pull.merged, merged_at: pull.merged_at, merged_by: pull.merged_by?.login, author: pull.user.login, actualMerge: pull.merge_commit_sha, sourceHead: pull.head.sha }, mergeCommit: { sha: mergeCommit.sha, tree: mergeCommit.commit.tree.sha, parents: mergeCommit.parents.map(p => p.sha) }, headCommit: { sha: headCommit.sha, tree: headCommit.commit.tree.sha }, actualDevelop: branch.object.sha, reviews, rules, ruleset, ruleSuitePageCount: Array.isArray(suites) ? suites.length : null, selectedSuites: selected, suiteDetails, checks, mergeChecks, graph, audit, requests, captureCorrection: 'The first read-only capture stopped at a GraphQL query with a missing closing brace. Its script and all raw partial responses remain in postmerge-be402435 and query-error-r1.mjs. This final capture is separate, with a balanced multiline query and per-request durable metadata; no repository state was changed.' };
fs.writeFileSync(path.join(directory, 'captured-audit.json'), JSON.stringify(capture, null, 2));
console.log(JSON.stringify({ directory, pull: capture.pull, mergeCommit: capture.mergeCommit, headCommit: capture.headCommit, actualDevelop: capture.actualDevelop, reviews: reviews.length, selectedSuites: selected, suiteDetails, reviewDecision: graph?.data?.repository?.pullRequest?.reviewDecision, threads: graph?.data?.repository?.pullRequest?.reviewThreads, auditRequest: requests.find(r => r.name === 'repository-org-audit-log') }, null, 2));
