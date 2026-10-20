import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const config = JSON.parse(fs.readFileSync(new URL('./run-config.json', import.meta.url), 'utf8'));
if (!/^[0-9a-f]{40}$/.test(config.canonicalSha)) throw new Error('fixed canonical SHA required');
const same = (a, b) => fs.realpathSync.native(a).toLowerCase() === fs.realpathSync.native(b).toLowerCase();
if (!same(os.tmpdir(), config.shortTemp) || !same(process.env.TEMP, config.shortTemp) || !same(process.env.TMP, config.shortTemp)) throw new Error('canonical child temporary root differs from authorized process root');
const { verifyReleaseInstall } = await import(pathToFileURL(path.join(config.repository, 'scripts/release-verify-install.mjs')));
const binding = JSON.parse(fs.readFileSync(new URL('./tag-binding-before.json', import.meta.url), 'utf8'));
if (binding.ref !== 'refs/tags/v8.3.4' || config.canonicalRef !== binding.ref || config.canonicalRemoteURL !== binding.remoteURL || config.canonicalTagObject !== binding.tagObject || config.canonicalSha !== binding.peeledCommit || config.canonicalTree !== binding.tree || !binding.releasePublished) throw new Error('real remote tag/publication binding differs');
const result = await verifyReleaseInstall({ canonicalSha: binding.peeledCommit, repoRoot: config.repository });
result.tagInstallationSource = { remoteURL: binding.remoteURL, ref: binding.ref, tagObject: binding.tagObject, peeledCommit: binding.peeledCommit, tree: binding.tree, releaseId: binding.release.id, publishedAt: binding.release.published_at, resolution: 'exact real remote tag resolved to commit for unchanged canonicalSha Harness API' };
console.log(JSON.stringify(result, null, 2));
