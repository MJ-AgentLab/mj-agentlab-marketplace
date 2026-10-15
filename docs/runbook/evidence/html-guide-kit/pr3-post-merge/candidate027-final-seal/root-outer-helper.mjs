import fs from 'node:fs';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',original=fs.readFileSync(base+'/tracking/record-016-root-outer.mjs','utf8');
const adapted=original.replaceAll('0-1-16','0-1-17').replaceAll('8018554a-75b5-482c-bf9c-801603038c9e','40bfff4c-4195-431e-af4d-be1b09a72012').replaceAll('016-root-operator','017-root-operator').replaceAll('b4fb2468bd0baec6d57494eed39514ec724ca5e5','5bf3edf7e4c7ded20f9344ecfe4fbcae9104330b');
await import('data:text/javascript;base64,'+Buffer.from(adapted).toString('base64'));
