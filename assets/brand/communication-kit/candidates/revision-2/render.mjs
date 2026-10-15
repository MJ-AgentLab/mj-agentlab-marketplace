import path from "node:path";
import { exportSvg } from "../../../../../scripts/export-icons.mjs";
import { renderIconComparison } from "../../../../../scripts/render-brand-previews.mjs";

const root = path.resolve(import.meta.dirname, "../../../../.."), base = "assets/brand/communication-kit/candidates/revision-2";
const icons = ["d", "e", "f"].map((id, i) => ({
  id: `communication-${id}`,
  label: ["D / Globe and clear text", "E / Globe and message", "F / Globe and document"][i],
  output: `${base}/${id}.png`,
  previews: Object.fromEntries([32, 48, 64].map(size => [size, `${base}/${id}-${size}.png`])),
}));
for (const [i, id] of ["d", "e", "f"].entries()) {
  const input = path.join(root, base, `${id}.svg`);
  exportSvg({ input, output: path.join(root, base, `${id}.png`) });
  for (const size of [32, 48, 64]) exportSvg({ input, output: path.join(root, base, `${id}-${size}.png`), size });
  renderIconComparison({ root, title: icons[i].label, icons: [icons[i]], output: `${base}/${id}-previews.png` });
}
console.log(renderIconComparison({ root, title: "Communication Kit / globe and text", icons, output: `${base}/comparison.png` }));
