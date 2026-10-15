import fs from 'node:fs';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',original=fs.readFileSync(base+'/tracking/record-016-gh-final.mjs','utf8');
const adapted=original.replaceAll('016-ci-final-snapshot','017-ci-final-snapshot').replaceAll('016-review-threads','017-review-threads').replaceAll('b4fb2468bd0baec6d57494eed39514ec724ca5e5','5bf3edf7e4c7ded20f9344ecfe4fbcae9104330b');
await import('data:text/javascript;base64,'+Buffer.from(adapted).toString('base64'));
