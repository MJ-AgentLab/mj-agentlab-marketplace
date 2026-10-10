import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PNG } from "pngjs";

export const ICON_FIELDS = Object.freeze(["logo", "composerIcon", "logoDark", "composerIconDark"]);
export const ICON_LIMITS = Object.freeze({ min: 48, max: 4096, bytes: 5 * 1024 * 1024 });
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const contained = (root, file) => {
  const rel = path.relative(root, file);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
};

/** Resolve a package-owned PNG; inspect every component, including links inside the package. */
export function validateIconReference(reference) {
  if (typeof reference !== "string" || !reference.startsWith("./") || reference.includes("\\") || reference.includes(":") || reference.includes("\0")) throw new Error("icon path must be a ./-prefixed package path");
  const parts = reference.slice(2).split("/");
  if (parts.some(p => !p || p === "." || p === "..") || path.posix.extname(reference) !== ".png") throw new Error("icon path must name a package-owned PNG without traversal");
  return parts;
}

export function resolveIconPath(pluginRoot, reference) {
  const parts = validateIconReference(reference);
  const root = fs.realpathSync.native(pluginRoot);
  if (fs.lstatSync(pluginRoot).isSymbolicLink()) throw new Error("plugin root must not be a reparse link");
  let file = root;
  for (const [i, part] of parts.entries()) {
    file = path.join(file, part);
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error("icon path must not contain a symlink or junction/reparse link");
    if (!contained(root, fs.realpathSync.native(file))) throw new Error("icon resource escapes plugin root");
    if (i < parts.length - 1 ? !stat.isDirectory() : !stat.isFile()) throw new Error("icon path must resolve to an ordinary package file");
  }
  return file;
}

/** Size/dimension bounds precede decoding; CRC and compressed pixel data must decode in full. */
export function inspectPng(file, { min = ICON_LIMITS.min, max = ICON_LIMITS.max } = {}) {
  const bytes = fs.statSync(file).size;
  if (bytes > ICON_LIMITS.bytes) throw new Error("icon exceeds 5 MiB");
  const buffer = fs.readFileSync(file);
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(signature) || buffer.readUInt32BE(8) !== 13 || buffer.toString("ascii", 12, 16) !== "IHDR") throw new Error("icon is not a PNG with a valid IHDR");
  const width = buffer.readUInt32BE(16), height = buffer.readUInt32BE(20);
  if (width !== height) throw new Error("icon must be square");
  if (width < min || width > max) throw new Error(`icon dimensions must be ${min}–${max} pixels`);
  const decoded = PNG.sync.read(buffer, { checkCRC: true });
  if (decoded.width !== width || decoded.height !== height || decoded.data.length !== width * height * 4) throw new Error("icon pixel data is incomplete");
  return { width, height, bytes, sha256: crypto.createHash("sha256").update(buffer).digest("hex") };
}

/** Resource validation deliberately has no approved-plugin-name dependency. */
export function validatePluginIcons(manifest, pluginRoot) {
  const ui = manifest?.extensions?.["com.openai"]?.interface;
  const facts = {};
  for (const field of ICON_FIELDS) {
    if (!Object.hasOwn(ui ?? {}, field)) {
      if (field === "logo" || field === "composerIcon") throw new Error(`interface.${field} is required`);
      continue;
    }
    try {
      facts[field] = { reference: ui[field], ...inspectPng(resolveIconPath(pluginRoot, ui[field])) };
    } catch (error) { throw new Error(`interface.${field}: ${error.message}`, { cause: error }); }
  }
  return facts;
}

export function assertInstalledIcons(sourceRoot, installedRoot) {
  const readManifest = root => JSON.parse(fs.readFileSync(path.join(root, "plugin.json"), "utf8"));
  const source = validatePluginIcons(readManifest(sourceRoot), sourceRoot);
  const installed = validatePluginIcons(readManifest(installedRoot), installedRoot);
  for (const field of ICON_FIELDS) {
    if (JSON.stringify(source[field]) !== JSON.stringify(installed[field])) throw new Error(`installed icon reference/content differs from source: ${field}`);
  }
  return installed;
}
