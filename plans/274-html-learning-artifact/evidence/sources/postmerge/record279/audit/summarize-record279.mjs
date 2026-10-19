import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = 'MJ-AgentLab/mj-agentlab-marketplace';
const actual = 'e3dc40f734fc972e05956da3e908091e09963675';
const published = 'f906b1001a86d7b5415451bd973bea26e6cc3a1d';
const develop = '65d756efd3024ac10d1d0e6ea189055fbe6f1545';
const source = '315b5942a3a61c6bf7ab17513b8263496bd7a48a';
const tree = 'ae121f6b256d1a44ea05a06061ba025b605655d9';
const read = name => fs.readFileSync(path.join(root, name));
const json = name => JSON.parse(read(name).toString('utf8').replace(/^\uFEFF/, ''));
const write = (name, value) => fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2) + '\n');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const normalize = value => String(value).replace(/\r\n/g, '\n').trim();
const decoded = name => Buffer.from(json(name).content, 'base64');
const notes = bytes => {
  const lines = bytes.toString('utf8').split(/\r?\n/);
  const start = lines.findIndex(line => /^## \[8\.3\.2\]/.test(line));
  assert(start >= 0, '8.3.2 section exists');
  const end = lines.findIndex((line, index) => index > start && /^## \[/.test(line));
  return normalize(lines.slice(start + 1, end < 0 ? undefined : end).join('\n'));
};
const pr = json('pr279.json'), reviews = json('pr279-reviews.json');
const suite = json('pr279-rule-suite.json');
const mainCommit = json('actual-main-git-commit.json'), sourceCommit = json('actual-source-git-commit.json');
const main = json('main-terminal.json'), dev = json('develop-terminal.json');
const inherited = json('develop-to-main-compare.json'), publicationParent = json('published-to-record-main-compare.json');
const tag = json('tag-v8.3.2-terminal.json'), release = json('release-v8.3.2-terminal.json'), repository = json('repository.json');
const potential = json('tested-potential-merge-git-commit.json');
const mainRules = json('main-active-rules.json'), developRules = json('develop-active-rules.json');
const pullRule = suite.rule_evaluations.find(item => item.rule_type === 'pull_request');
const statusRule = suite.rule_evaluations.find(item => item.rule_type === 'required_status_checks');
const protectedPr = developRules.find(item => item.type === 'pull_request');
const protectedChecks = developRules.find(item => item.type === 'required_status_checks');
const publishedNotes = notes(decoded('published-changelog-content.json'));
const currentNotes = notes(decoded('record-main-changelog-content.json'));
const publishedVersion = normalize(decoded('published-version-content.json'));
const currentVersion = normalize(decoded('record-main-version-content.json'));
fs.writeFileSync(path.join(root, 'published-VERSION'), decoded('published-version-content.json'));
fs.writeFileSync(path.join(root, 'record-main-VERSION'), decoded('record-main-version-content.json'));
fs.writeFileSync(path.join(root, 'expected-published-v8.3.2-notes.txt'), publishedNotes + '\n');
const git = spawnSync('git', ['rev-parse', 'origin/main', 'origin/develop'], { cwd: 'C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop', encoding: 'utf8', shell: false });
const gitRefs = git.status === 0 ? git.stdout.trim().split(/\r?\n/) : [];
write('local-refs-readonly.json', { capturedAt: new Date().toISOString(), method: ['git', 'rev-parse', 'origin/main', 'origin/develop'], cwd: 'C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop', status: git.status, stdout: git.stdout, stderr: git.stderr });
const checks = {
  actualPrMerge: pr.merged === true && pr.merge_commit_sha === actual && pr.merged_at === '2026-10-19T15:17:09Z',
  exactPrHeadBase: pr.head.sha === source && pr.base.sha === published,
  actualMain: main.commit.sha === actual && mainCommit.sha === actual,
  exactParents: mainCommit.parents.length === 2 && mainCommit.parents[0].sha === published && mainCommit.parents[1].sha === source,
  sameSourceTree: mainCommit.tree.sha === tree && sourceCommit.sha === source && sourceCommit.tree.sha === tree,
  sameTestedPotentialTree: potential.sha === '687b70abd58a8556ee566c74c340dd66480fe407' && potential.tree.sha === tree && potential.parents.length === 2 && potential.parents[0].sha === published && potential.parents[1].sha === source,
  exactDevelop: dev.commit.sha === develop,
  developFullAncestry: inherited.status === 'ahead' && inherited.behind_by === 0 && inherited.merge_base_commit.sha === develop,
  publishedMainFullAncestry: publicationParent.status === 'ahead' && publicationParent.behind_by === 0 && publicationParent.merge_base_commit.sha === published,
  exactMatchedSuite: suite.id === 4602541728 && suite.ref === 'refs/heads/main' && suite.before_sha === published && suite.after_sha === actual,
  bypassActuallyObserved: suite.result === 'bypass',
  approvalFailureActuallyObserved: pullRule?.result === 'fail' && pullRule?.details === 'New changes require approval from someone other than the last pusher.',
  requiredStatusActuallyPassed: statusRule?.result === 'pass',
  reviewsActuallyEmpty: Array.isArray(reviews) && reviews.length === 0,
  publishedTagUnchanged: tag.object.type === 'commit' && tag.object.sha === published,
  releaseIdentityUnchanged: release.id === 417390526 && release.tag_name === 'v8.3.2' && release.name === 'v8.3.2' && release.target_commitish === published,
  publishedVersions: publishedVersion === '8.3.2' && currentVersion === '8.3.2',
  publishedBodyMatches: publishedNotes === normalize(release.body),
  publishedSectionPreservedInNewMain: publishedNotes === currentNotes,
  actualPublishedState: release.draft === false && release.prerelease === false && release.published_at === '2026-10-19T14:30:16Z',
  actualAssetsEmpty: Array.isArray(release.assets) && release.assets.length === 0,
  developRulesActual: protectedPr?.ruleset_id === 14008221 && protectedPr.parameters.required_approving_review_count === 1 && protectedPr.parameters.require_last_push_approval === true && protectedPr.parameters.dismiss_stale_reviews_on_push === true && protectedPr.parameters.required_review_thread_resolution === true && protectedPr.parameters.require_code_owner_review === false && JSON.stringify(protectedPr.parameters.allowed_merge_methods) === '["merge"]' && protectedChecks?.parameters.strict_required_status_checks_policy === true && ['Validate Structure', 'A6 / Check'].every(name => protectedChecks.parameters.required_status_checks.some(item => item.context === name)),
};
for (const [name, passed] of Object.entries(checks)) assert(passed, name);
const captureFiles = fs.readdirSync(root).filter(name => name.endsWith('.json') && !['methods.json','summary.json','evidence-manifest.json'].includes(name));
const captureRange = captureFiles.map(name => fs.statSync(path.join(root, name)).mtime.toISOString()).sort();
const methods = {
  generatedAt: new Date().toISOString(),
  responseFileCaptureMtimeRangeUtc: { start: captureRange[0], end: captureRange.at(-1), limitation: 'Response-file write times delimit local capture, not exact server-response or Owner-message time.' },
  scope: 'Read-only actual PR 279 merge/rules/publication/ancestry audit; no repository editing, fetch, push, PR creation/merge, release mutation, bypass, or messages to other people.',
  authentication: 'Existing gh authentication only; no credential requested, printed, or saved.',
  calls: [
    `gh api repos/${repo}/pulls/279`,
    `gh api repos/${repo}/pulls/279/reviews`,
    `gh api 'repos/${repo}/rulesets/rule-suites?ref=refs/heads/main&per_page=30'`,
    `gh api repos/${repo}/rulesets/rule-suites/4602541728`,
    ...['main','develop'].flatMap(branch => [`gh api repos/${repo}/branches/${branch}`, `gh api repos/${repo}/rules/branches/${branch}`]),
    ...[actual,source,'687b70abd58a8556ee566c74c340dd66480fe407'].map(sha => `gh api repos/${repo}/git/commits/${sha}`),
    ...[develop,published].map(base => `gh api repos/${repo}/compare/${base}...${actual}`),
    `gh api repos/${repo}/git/ref/tags/v8.3.2`,
    `gh api repos/${repo}/releases/tags/v8.3.2`,
    `gh api repos/${repo}`,
    ...[published,actual].flatMap(sha => ['VERSION','CHANGELOG.md'].map(name => `gh api 'repos/${repo}/contents/${name}?ref=${sha}'`)),
    'git rev-parse origin/main origin/develop (read-only local snapshot)',
  ],
  retainedError: { files: ['source-prefix-probe.json','source-prefix-probe.stderr.txt'], cause: 'An exploratory source request used an incorrect unresolved abbreviated prefix 315d2ce and returned 404. It is not used for any conclusion. The exact source was then taken from PR279 head and fetched successfully as 315b5942a3a61c6bf7ab17513b8263496bd7a48a.' },
  comparisons: 'Git ancestry is independently established by REST compare status/ahead/behind/merge_base identities; actual merge/source trees and parents are direct Git commit API fields. VERSION/CHANGELOG bytes are decoded from base64 contents responses. Release body is compared after CRLF-to-LF and trim to the published f906 version section and the same section in e3dc.',
  governance: 'Source-match exact ref/before/after rule-suite, then read each rule result directly. Empty reviews are retained separately and never prove a bypass by themselves.',
  immutability: 'Release immutable:false is the actual release observation. The repository response does not return immutable_releases, so configured immutability is UNKNOWN.',
  priorCiReference: { path: 'C:/Users/Admin/.codex/worktrees/html-learning-artifact/record-evidence-279-315b594/ci/final-manifest.json', sha256: hash(fs.readFileSync('C:/Users/Admin/.codex/worktrees/html-learning-artifact/record-evidence-279-315b594/ci/final-manifest.json')), expectedRootSuppliedSha256: '9267bd2b89fd549f1a0088e2e012510cf0f9d50b7c17d582d76d0d9003e9fc2b', scope: 'Prior 315/687 CI evidence reference and manifest-byte observation only, not rerunning those checks or representing any test as a new e3dc execution.' },
  exclusions: ['No fresh actual-e3dc canonical installation, Python execution, full test suite, browser run or Owner acceptance performed in this audit.', 'Prior candidate 315/687 checks are not renamed as actual-merge runs.'],
};
write('methods.json', methods);
const summary = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  checks,
  actual: { pr: 279, merge: actual, mergedAt: pr.merged_at, tree, source, testedPotentialMerge: potential.sha, testedPotentialTree: potential.tree.sha, parents: mainCommit.parents.map(parent => parent.sha), main: main.commit.sha, develop: dev.commit.sha, localOriginRefsMatch: git.status === 0 && gitRefs[0] === actual && gitRefs[1] === develop },
  ancestry: { develop: { status: inherited.status, ahead: inherited.ahead_by, behind: inherited.behind_by, mergeBase: inherited.merge_base_commit.sha }, publishedMain: { status: publicationParent.status, ahead: publicationParent.ahead_by, behind: publicationParent.behind_by, mergeBase: publicationParent.merge_base_commit.sha } },
  governance: { status: 'NOT_MET_BYPASS_OBSERVED', suite: suite.id, before: suite.before_sha, after: suite.after_sha, ref: suite.ref, result: suite.result, actor: suite.actor_name, pushedAt: suite.pushed_at, reviews: [], evaluations: suite.rule_evaluations.map(({rule_type,result,details,rule_source}) => ({ type: rule_type, result, details, source: rule_source })) },
  activeRules: { main: mainRules, develop: developRules },
  release: { id: release.id, tag: release.tag_name, target: release.target_commitish, directTag: tag.object.sha, publishedAt: release.published_at, updatedAt: release.updated_at, draft: release.draft, prerelease: release.prerelease, assets: release.assets, immutable: release.immutable, immutableConfiguration: Object.hasOwn(repository,'immutable_releases') ? repository.immutable_releases : 'UNKNOWN', url: release.html_url, version: publishedVersion, currentMainVersion: currentVersion, publishedBodyHashNormalized: hash(publishedNotes), observedBodyHashNormalized: hash(normalize(release.body)), currentMainSectionHashNormalized: hash(currentNotes), normalization: 'CRLF-to-LF then trim' },
  exclusions: methods.exclusions,
};
write('summary.json', summary);
const files = fs.readdirSync(root).filter(name => fs.statSync(path.join(root,name)).isFile() && name !== 'evidence-manifest.json').sort().map(name => ({ path:name, bytes:read(name).length, sha256:hash(read(name)) }));
write('evidence-manifest.json', { schemaVersion:1, generatedAt:new Date().toISOString(), terminalIdentities: { currentMain: main.commit.sha, currentMainTree: tree, currentDevelop: dev.commit.sha, publishedVersion: publishedVersion, publishedTagSha: tag.object.sha, publishedReleaseTarget: release.target_commitish, releasedCommitDiffersFromCurrentMain: tag.object.sha !== main.commit.sha }, files });
console.log(JSON.stringify({ok:true,checks:Object.keys(checks).length,actual:summary.actual,governance:summary.governance.status,suite:suite.id,tagAndRelease:published,bodyPreserved:checks.publishedSectionPreservedInNewMain,immutabilityConfiguration:summary.release.immutableConfiguration,coveredFiles:files.length}));
