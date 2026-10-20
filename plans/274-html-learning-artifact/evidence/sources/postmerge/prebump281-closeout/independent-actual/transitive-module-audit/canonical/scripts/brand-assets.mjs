import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Resvg } from "@resvg/resvg-js";
import { inspectPng } from "./plugin-icons.mjs";

const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
function owned(root, rel) {
  if (typeof rel !== "string" || path.isAbsolute(rel) || rel.includes("\\") || rel.split("/").some(p => !p || p === "." || p === "..")) throw new Error("invalid brand resource path");
  let file = fs.realpathSync.native(root);
  for (const part of rel.split("/")) {
    file = path.join(file, part);
    if (fs.lstatSync(file).isSymbolicLink()) throw new Error("brand resource must not be a reparse link");
  }
  const relative = path.relative(fs.realpathSync.native(root), fs.realpathSync.native(file));
  if (!relative || relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative) || !fs.statSync(file).isFile()) throw new Error("brand resource must be an owned file");
  return file;
}

/** Check maintained references, theme consistency and actual native-preview dimensions. */
export function validateBrandAssets(root) {
  const tokens = JSON.parse(fs.readFileSync(owned(root, "assets/brand/tokens.json"), "utf8"));
  if (tokens.canvas !== 1024 || Object.values(tokens.colors).some(color => !/^#[0-9A-F]{6}$/.test(color))) throw new Error("invalid brand colors/canvas");
  const config = JSON.parse(fs.readFileSync(owned(root, "assets/brand/exports.json"), "utf8"));
  if (!Array.isArray(config.icons) || !config.icons.length || new Set(config.icons.map(i => i.id)).size !== config.icons.length) throw new Error("invalid brand export inventory");
  const palette = new Set(Object.values(tokens.colors));
  for (const icon of config.icons) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.id) || !icon.source.endsWith(".svg")) throw new Error("invalid brand source identity");
    const svg = fs.readFileSync(owned(root, icon.source), "utf8");
    const parsed = new Resvg(svg, { font: { loadSystemFonts: false } });
    if (parsed.width !== tokens.canvas || parsed.height !== tokens.canvas) throw new Error(`brand SVG dimensions drift: ${icon.id}`);
    if (!svg.includes(`viewBox="0 0 ${tokens.canvas} ${tokens.canvas}"`) || !svg.includes(`rx="${tokens.tileRadius}"`)) throw new Error(`brand canvas/tile drift: ${icon.id}`);
    for (const color of svg.match(/#[0-9a-fA-F]{6}/g) ?? []) if (!palette.has(color.toUpperCase())) throw new Error(`brand palette drift: ${icon.id}`);
    for (const [key, value] of Object.entries(tokens.gradient)) if (!svg.includes(`${key}="${value}"`)) throw new Error(`brand gradient drift: ${icon.id}`);
    inspectPng(owned(root, icon.output), { min: 1024, max: 1024 });
    for (const size of [32, 48, 64]) inspectPng(owned(root, `assets/brand/previews/${icon.id}-${size}.png`), { min: size, max: size });
  }
  const provenance = JSON.parse(fs.readFileSync(owned(root, "assets/brand/provenance.json"), "utf8"));
  for (const source of provenance.sources) if (hash(owned(root, `assets/brand/${source.file}`)) !== source.sha256) throw new Error("brand reference differs from recorded original");
  for (const rel of ["assets/brand/templates/icon.svg", "assets/brand/design-prompts.md", "assets/brand/previews/plugin-family.png", "assets/brand/previews/marketplace-candidates.png"]) owned(root, rel);
  return { icons: config.icons.length, referenceSources: provenance.sources.length };
}
