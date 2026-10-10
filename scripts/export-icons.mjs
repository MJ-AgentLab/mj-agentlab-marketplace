#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { inspectPng } from "./plugin-icons.mjs";

export function exportSvg({ input, output, size = 1024 }) {
  if (!Number.isInteger(size) || size < 1 || size > 4096) throw new Error("export size must be an integer from 1 to 4096");
  const svg = fs.readFileSync(input, "utf8");
  const renderer = new Resvg(svg, { fitTo: { mode: "width", value: size }, font: { loadSystemFonts: false } });
  if (renderer.width !== renderer.height) throw new Error("icon SVG must be square");
  const rendered = renderer.render();
  const buffer = rendered.asPng();
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, buffer);
  return { input, output, ...inspectPng(output, { min: size, max: size }) };
}

export function exportRepositoryIcons(root = path.resolve(import.meta.dirname, "..")) {
  const config = JSON.parse(fs.readFileSync(path.join(root, "assets/brand/exports.json"), "utf8"));
  return config.icons.flatMap(({ id, source, output }) => [
    exportSvg({ input: path.join(root, source), output: path.join(root, output) }),
    ...[32, 48, 64].map(size => exportSvg({ input: path.join(root, source), output: path.join(root, `assets/brand/previews/${id}-${size}.png`), size })),
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (!args.length) console.log(JSON.stringify(exportRepositoryIcons(), null, 2));
  else {
    if (args.length % 2 || args.some((arg, i) => i % 2 === 0 && !["--input", "--output", "--size"].includes(arg))) throw new Error("expected --input SVG --output PNG [--size pixels]");
    const opts = Object.fromEntries(Array.from({ length: args.length / 2 }, (_, i) => [args[i * 2].slice(2), args[i * 2 + 1]]));
    if (!opts.input || !opts.output) throw new Error("--input and --output are required");
    console.log(JSON.stringify(exportSvg({ ...opts, ...(opts.size ? { size: Number(opts.size) } : {}) }), null, 2));
  }
}
