import path from "node:path";
import { exportSvg } from "../../../../scripts/export-icons.mjs";
import { renderIconComparison } from "../../../../scripts/render-brand-previews.mjs";

const root = path.resolve(import.meta.dirname, "../../../.."), base = "assets/brand/communication-kit/candidates";
const icons = ["a", "b", "c"].map((id, i) => ({
  id: `communication-${id}`,
  label: ["A / Message and pen", "B / Dialogue", "C / Document rewrite"][i],
  output: `${base}/${id}.png`,
  previews: Object.fromEntries([32, 48, 64].map(size => [size, `${base}/${id}-${size}.png`])),
}));
for (const [i, id] of ["a", "b", "c"].entries()) {
  const input = path.join(root, base, `${id}.svg`);
  exportSvg({ input, output: path.join(root, base, `${id}.png`) });
  for (const size of [32, 48, 64]) exportSvg({ input, output: path.join(root, base, `${id}-${size}.png`), size });
  renderIconComparison({ root, title: icons[i].label, icons: [icons[i]], output: `${base}/${id}-previews.png` });
}
console.log(renderIconComparison({ root, title: "Communication Kit / D candidates", icons, output: `${base}/comparison.png` }));
