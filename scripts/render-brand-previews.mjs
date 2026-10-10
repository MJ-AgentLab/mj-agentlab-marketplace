#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Resvg } from "@resvg/resvg-js";

/** Comparison sheets embed the actual exported rasters; small previews display at native size. */
export function renderBrandPreviews(root = path.resolve(import.meta.dirname, "..")) {
  const config = JSON.parse(fs.readFileSync(path.join(root, "assets/brand/exports.json"), "utf8"));
  const sheet = (title, icons, output) => {
    const image = (file, x, y, size) => `<image x="${x}" y="${y}" width="${size}" height="${size}" href="data:image/png;base64,${fs.readFileSync(path.join(root, file)).toString("base64")}"/>`;
    const text = (x, y, value, size = 18, fill = "#223D66") => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="Arial, sans-serif">${value}</text>`;
    let body = `<rect width="1200" height="650" fill="#F4F7FA"/>${text(36, 49, title, 28)}${text(36, 82, "Native previews below: 32 / 48 / 64 px", 18)}`;
    icons.forEach((icon, index) => {
      const x = 36 + index * 388;
      body += text(x, 124, icon.label, 21) + image(icon.output, x + 62, 148, 224);
      body += `<rect x="${x}" y="404" width="352" height="94" rx="16" fill="#FFFFFF"/><rect x="${x}" y="520" width="352" height="94" rx="16" fill="#212121"/>`;
      [32, 48, 64].forEach((size, i) => {
        const px = x + 26 + i * 112;
        body += image(`assets/brand/previews/${icon.id}-${size}.png`, px, 420, size);
        body += image(`assets/brand/previews/${icon.id}-${size}.png`, px, 536, size);
      });
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="650" viewBox="0 0 1200 650">${body}</svg>`;
    const file = path.join(root, output);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, new Resvg(svg).render().asPng());
    return file;
  };
  const plugins = config.icons.filter(i => i.id.endsWith("-kit")).map(i => ({ ...i, label: i.id }));
  const candidates = config.icons.filter(i => /^marketplace-[abc]$/.test(i.id)).map((i, n) => ({ ...i, label: ["A / Diagonal bridge", "B / Module hub", "C / Stepped connector"][n] }));
  return [sheet("MJ AgentLab / D plugin family", plugins, "assets/brand/previews/plugin-family.png"), sheet("MJ AgentLab Marketplace / logo candidates", candidates, "assets/brand/previews/marketplace-candidates.png")];
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) console.log(JSON.stringify(renderBrandPreviews(), null, 2));
