import { verifyReleaseInstall } from 'file:///C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop/scripts/release-verify-install.mjs';
const canonicalSha = 'fdede3cf5578dee8a41aef4310a9387d695c56bd';
const result = await verifyReleaseInstall({ canonicalSha, repoRoot: 'C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop' });
console.log(JSON.stringify(result, null, 2));
