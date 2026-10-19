import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(root, name));
const json = name => JSON.parse(read(name).toString('utf8').replace(/^\uFEFF/, ''));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const write = (name, value) => fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2) + '\n');
const actual = 'f906b1001a86d7b5415451bd973bea26e6cc3a1d';
const oldMain = '7615ca58f410876fc7393b0d93017250fe712091';
const source = 'f68c22b563fab661b803576058c8a08619c6738a';
const pr = json('pr278.json'), reviews = json('pr278-reviews.json');
const suite = json('pr278-rule-suite.json');
const commit = json('actual-main-git-commit.json');
const main = json('main-final.json'), tag = json('tag-ref-final.json');
const release = json('release-final.json'), latest = json('latest-release-final.json');
const run = json('release-run-final.json'), jobs = json('release-jobs-final.json');
const repository = json('repository.json');
const version = read('actual-main-VERSION').toString('utf8').trim();
const changelog = read('actual-main-CHANGELOG.md').toString('utf8');
const lines = changelog.split(/\r?\n/);
const heading = lines.findIndex(line => /^## \[8\.3\.2\]/.test(line));
assert(heading >= 0, 'release version section exists');
const end = lines.findIndex((line, index) => index > heading && /^## \[/.test(line));
const expectedNotes = lines.slice(heading + 1, end < 0 ? undefined : end).join('\n');
const normalized = value => String(value).replace(/\r\n/g, '\n').trim();
const expectedNormalized = normalized(expectedNotes), observedNormalized = normalized(release.body);
fs.writeFileSync(path.join(root, 'expected-v8.3.2-notes.txt'), expectedNormalized + '\n');
const pullRule = suite.rule_evaluations.find(item => item.rule_type === 'pull_request');
const requiredRule = suite.rule_evaluations.find(item => item.rule_type === 'required_status_checks');
const job = jobs.jobs.find(item => item.id === 118116772603);
const log = read('release-job118116772603.log').toString('utf8');
const records = {
  prMerge: pr.merged === true && pr.merge_commit_sha === actual && pr.merged_at === '2026-10-19T14:28:06Z',
  source: pr.head.sha === source && pr.base.sha === oldMain,
  actualCommit: commit.sha === actual && commit.tree.sha === '6e4bc9cc31df2d1eac33e8c10907eb3725ca744d',
  parents: commit.parents.length === 2 && commit.parents[0].sha === oldMain && commit.parents[1].sha === source,
  main: main.commit.sha === actual,
  directTag: tag.object.type === 'commit' && tag.object.sha === actual,
  releaseIdentity: release.tag_name === 'v8.3.2' && release.name === 'v8.3.2' && release.target_commitish === actual && version === '8.3.2',
  bodyMatchesVersionSection: expectedNormalized === observedNormalized,
  publication: release.draft === false && release.prerelease === false && typeof release.published_at === 'string',
  noAssets: Array.isArray(release.assets) && release.assets.length === 0,
  latest: latest.id === release.id,
  workflow: run.id === 39269211915 && run.head_sha === actual && run.status === 'completed' && run.conclusion === 'success',
  job: job?.status === 'completed' && job?.conclusion === 'success',
  workflowCanonicalObservation: log.includes('canonical Git tree installation verified.'),
  ruleSuiteExact: suite.id === 4601606831 && suite.before_sha === oldMain && suite.after_sha === actual && suite.ref === 'refs/heads/main',
  bypassObserved: suite.result === 'bypass',
  approvalFailureObserved: pullRule?.result === 'fail' && pullRule?.details === 'New changes require approval from someone other than the last pusher.',
  requiredChecksObserved: requiredRule?.result === 'pass',
  reviewsEmpty: Array.isArray(reviews) && reviews.length === 0,
};
for (const [name, value] of Object.entries(records)) assert(value, name);
const methods = {
  observedAt: new Date().toISOString(),
  purpose: 'Read-only verification of actual PR 278, its main rule evaluation and automatic v8.3.2 publication; no publication or repository mutations performed.',
  authentication: 'Existing gh authentication only; no token was requested, printed, written, or passed as an explicit command argument.',
  calls: [
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/pulls/278',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/pulls/278/reviews',
    "gh api 'repos/MJ-AgentLab/mj-agentlab-marketplace/rulesets/rule-suites?ref=refs/heads/main&per_page=30'",
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/rulesets/rule-suites/4601606831',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/39269211915',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/39269211915/jobs',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/jobs/118116772603/logs',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/branches/main',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/git/commits/f906b1001a86d7b5415451bd973bea26e6cc3a1d',
    "gh api 'repos/MJ-AgentLab/mj-agentlab-marketplace/contents/VERSION?ref=f906b1001a86d7b5415451bd973bea26e6cc3a1d'",
    "gh api 'repos/MJ-AgentLab/mj-agentlab-marketplace/contents/CHANGELOG.md?ref=f906b1001a86d7b5415451bd973bea26e6cc3a1d'",
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/git/ref/tags/v8.3.2',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/releases',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/releases/tags/v8.3.2',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/releases/latest',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace',
  ],
  originalResponses: 'gh stdout was redirected to the named JSON/log files without filtering. Initial, second and final snapshots are separate. Initial tag-release 404 is retained; releases list later yielded published v8.3.2.',
  comparisons: 'VERSION decoded from the base64 contents response. Expected notes extracted only from exact main commit CHANGELOG section ## [8.3.2] until the next ## [. Both body strings are compared after CRLF-to-LF normalization and trim, matching release-state text semantics; raw and normalized hashes remain distinct.',
  ruleAudit: 'Exact before/after/ref match selects suite 4601606831. Per-rule results are read directly; bypass is not inferred from the empty review list.',
  immutability: 'The repository response has no immutable_releases property, so configuration is UNKNOWN. Release immutable:false is a separate actual observation. The workflow message defaults an unavailable configuration field to false and does not establish configured policy.',
  limits: ['Workflow canonical-install confirmation does not expose thirteen per-scenario raw logs or Python counts.', 'No fresh post-publication installation is represented by this audit.', 'No Owner product acceptance, native-window test, real learning effect or Sites access change is inferred.'],
};
write('methods.json', methods);
const summary = {
  schemaVersion: 1,
  observedAt: new Date().toISOString(),
  checks: records,
  pr: { number: 278, mergeSha: actual, mergedAt: pr.merged_at, source, base: oldMain, tree: commit.tree.sha, reviews: [] },
  governance: { status: 'NOT_MET_BYPASS_OBSERVED', suiteId: suite.id, actor: suite.actor_name, before: suite.before_sha, after: suite.after_sha, pushedAt: suite.pushed_at, result: suite.result, evaluations: suite.rule_evaluations.map(({rule_type,result,details,rule_source}) => ({type:rule_type,result,details,source:rule_source})) },
  publication: { status: 'PUBLISHED', releaseId: release.id, version, tag: release.tag_name, name: release.name, mainSha: main.commit.sha, directTagSha: tag.object.sha, releaseTarget: release.target_commitish, releaseUrl: release.html_url, publishedAt: release.published_at, draft: release.draft, prerelease: release.prerelease, assets: release.assets, immutable: release.immutable, immutableConfiguration: Object.hasOwn(repository, 'immutable_releases') ? repository.immutable_releases : 'UNKNOWN', latest: latest.id === release.id },
  body: { matches: records.bodyMatchesVersionSection, normalization: 'CRLF-to-LF then trim', expectedNormalizedSha256: hash(expectedNormalized), observedNormalizedSha256: hash(observedNormalized), observedRawUtf8Sha256: hash(String(release.body)), expectedNotesFile: 'expected-v8.3.2-notes.txt' },
  workflow: { id: run.id, attempt: run.run_attempt, head: run.head_sha, status: run.status, conclusion: run.conclusion, createdAt: run.created_at, updatedAt: run.updated_at, job: { id: job.id, status: job.status, conclusion: job.conclusion, startedAt: job.started_at, completedAt: job.completed_at }, canonicalInstall: 'Observed workflow log confirmation only; no per-scenario/Python counts inferred.' },
  limits: methods.limits,
};
write('publication-summary.json', summary);
const manifest = fs.readdirSync(root).filter(name => fs.statSync(path.join(root, name)).isFile() && name !== 'evidence-manifest.json').sort().map(name => ({ path: name, bytes: read(name).length, sha256: hash(read(name)), capturedFileMtimeUtc: fs.statSync(path.join(root, name)).mtime.toISOString() }));
write('evidence-manifest.json', { schemaVersion: 1, generatedAt: new Date().toISOString(), files: manifest });
console.log(JSON.stringify({ok:true,checks:Object.keys(records).length,publication:summary.publication,governance:summary.governance.status,bodyMatches:summary.body.matches,workflow:summary.workflow.conclusion,evidenceFiles:manifest.length}));
