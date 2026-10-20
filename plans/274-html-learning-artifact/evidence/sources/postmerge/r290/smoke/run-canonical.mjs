import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const config = JSON.parse(fs.readFileSync(new URL('./run-config.json', import.meta.url), 'utf8'));
if (!/^[0-9a-f]{40}$/.test(config.canonicalSha)) throw new Error('fixed canonical SHA required');
const same = (a, b) => fs.realpathSync.native(a).toLowerCase() === fs.realpathSync.native(b).toLowerCase();
if (!same(os.tmpdir(), config.shortTemp) || !same(process.env.TEMP, config.shortTemp) || !same(process.env.TMP, config.shortTemp)) throw new Error('canonical child temporary root differs from authorized process root');
const { verifyReleaseInstall } = await import(pathToFileURL(path.join(config.repository, 'scripts/release-verify-install.mjs')));
const result = await verifyReleaseInstall({ canonicalSha: config.canonicalSha, repoRoot: config.repository });
console.log(JSON.stringify(result, null, 2));
