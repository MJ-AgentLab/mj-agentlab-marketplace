#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { Resvg } from "@resvg/resvg-js";
import { PNG } from "pngjs";
import { exportSvg } from "../../../../../scripts/export-icons.mjs";

// Candidate-only export: do not change the approved repository export list.
const directory = import.meta.dirname;
const root = path.resolve(directory, "../../../../..");
const tokens = JSON.parse(fs.readFileSync(path.join(root, "assets/brand/tokens.json"), "utf8"));
const choices = [
  { id: "a", label: "A / HTML textbook" },
  { id: "b", label: "B / HTML teaching board" },
  { id: "c", label: "C / HTML lesson cards" },
];
const readPng = file => PNG.sync.read(fs.readFileSync(path.join(directory, file)));
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(path.join(directory, file))).digest("hex");
const report = {
  status: "pending-owner-selection",
  revision: 2,
  authority: "Owner requested redesign combining HTML and teaching elements; no round-2 candidate has been selected",
  exporter: "@resvg/resvg-js 2.6.2",
  verification: {
    result: "PASS",
    checks: ["SVG has no font, bitmap, script or external dependency", "Brand colors and tile radius match tokens", "PNG dimensions and transparent corners", "Native light/dark previews have the correct dimensions and background corners"],
  },
  candidates: [],
};

for (const { id } of choices) {
  const source = `${id}.svg`;
  const svg = fs.readFileSync(path.join(directory, source), "utf8");
  assert(!/<(?:image|text|script)\b|\b(?:href|onload)=/i.test(svg), "editable icon has no font, bitmap, script or external dependency");
  assert(svg.includes('rx="144"'), "rounded tile matches token");
  for (const color of Object.values(tokens.colors)) assert(svg.includes(color), `missing brand color ${color}`);
  const files = [source];
  for (const size of [1024, 32, 48, 64]) {
    const name = size === 1024 ? `${id}.png` : `${id}-${size}.png`;
    exportSvg({ input: path.join(directory, source), output: path.join(directory, name), size });
    files.push(name);
    const native = readPng(name);
    assert.equal(native.width, size);
    assert.equal(native.height, size);
    assert.equal(native.data[3], 0, "tile keeps transparent corner");
    if (size === 1024) continue;
    for (const [background, color] of Object.entries(tokens.previewBackgrounds)) {
      const result = new PNG({ width: size, height: size });
      const rgb = color.slice(1).match(/../g).map(channel => Number.parseInt(channel, 16));
      for (let i = 0; i < native.data.length; i += 4) {
        const alpha = native.data[i + 3] / 255;
        for (let channel = 0; channel < 3; channel++) result.data[i + channel] = Math.round(native.data[i + channel] * alpha + rgb[channel] * (1 - alpha));
        result.data[i + 3] = 255;
      }
      const output = `${id}-${size}-${background}.png`;
      fs.writeFileSync(path.join(directory, output), PNG.sync.write(result));
      files.push(output);
      const verified = readPng(output);
      assert.equal(verified.width, size);
      assert.equal(verified.height, size);
      assert.deepEqual(Array.from(verified.data.subarray(0, 4)), [...rgb, 255]);
    }
  }
  report.candidates.push({ id, source, files: files.map(file => ({ file, sha256: hash(file), bytes: fs.statSync(path.join(directory, file)).size })) });
}

const embedded = (file, x, y, size) => `<image x="${x}" y="${y}" width="${size}" height="${size}" href="data:image/png;base64,${fs.readFileSync(path.join(directory, file)).toString("base64")}"/>`;
const label = (x, y, value, size = 18, fill = tokens.colors.navy) => `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" fill="${fill}">${value}</text>`;
let body = `<rect width="1200" height="712" fill="${tokens.previewBackgrounds.light}"/>${label(36, 49, "HTML Guide Kit / Round 2: HTML + teaching", 28)}${label(36, 82, "Pending owner selection. Native previews: 32 / 48 / 64 px.", 18)}`;
for (const [index, { id, label: name }] of choices.entries()) {
  const x = 36 + index * 388;
  body += label(x, 124, name, 21) + embedded(`${id}.png`, x + 62, 148, 224);
  for (const [row, [background, color]] of Object.entries(tokens.previewBackgrounds).entries()) {
    const y = 408 + row * 132;
    body += `<rect x="${x}" y="${y}" width="352" height="108" rx="16" fill="${color}"/>`;
    for (const [position, size] of [32, 48, 64].entries()) {
      const px = x + 26 + position * 112;
      body += embedded(`${id}-${size}-${background}.png`, px, y + 18, size);
      body += label(px, y + 96, `${size}`, 14, background === "dark" ? "#FFFFFF" : tokens.colors.navy);
    }
  }
}
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="712" viewBox="0 0 1200 712">${body}</svg>`;
fs.writeFileSync(path.join(directory, "overview.png"), new Resvg(sheet).render().asPng());
const overview = readPng("overview.png");
assert.equal(overview.width, 1200);
assert.equal(overview.height, 712);
report.overview = { file: "overview.png", sha256: hash("overview.png"), width: overview.width, height: overview.height };
fs.writeFileSync(path.join(directory, "resource-checks.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, candidates: choices.length, pngs: 31, sizes: [1024, 32, 48, 64], nativeBackgrounds: Object.keys(tokens.previewBackgrounds), result: "PASS" }));
