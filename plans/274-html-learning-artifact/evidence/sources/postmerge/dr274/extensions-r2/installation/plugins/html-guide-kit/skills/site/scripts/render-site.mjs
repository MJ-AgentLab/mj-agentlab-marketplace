#!/usr/bin/env node
/** Original local renderer. See references/input-contract.md for the supported input. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(import.meta.url);
const SKILL_ROOT = path.resolve(path.dirname(SCRIPT), "..");
const PLUGIN_ROOT = path.resolve(SKILL_ROOT, "../..");
const RESERVED = ["index.html", "theme.css", "learning.js", "artifact-manifest.json", "license", "third_party_notices.md", "licenses"];
const GENERATED_NOTICE_SCOPE = `# Generated artifact asset notices

The package LICENSE covers MJ-AgentLab's original template and runtime contributions,
including the scaffold portions of index.html, theme.css and learning.js. These
notices do not relicense supplied materials, learning content or source documents;
those retain their respective rights and permissions.

The complete package notices below retain their original bytes. Paths such as
skills/site/references/resource-provenance.json refer to the original installed plugin,
not to files promised inside this generated artifact. The accompanying Apache text
preserves the package's upstream-reference notice and does not classify independently
implemented ideas or supplied content as Apache-licensed derivative works.

---

`;
const ID = /^[a-z][a-z0-9-]*$/;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const localURL = value => value.split("/").map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)).join("/");
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const decodeHTMLText = value => value.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[entity]);
const digest = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const fail = message => { throw new Error(message); };
const isWithin = (root, value) => { const relative = path.relative(root, value); return !relative || (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`)); };

/** Check all existing ancestors, including the supplied root itself. */
function ordinaryPath(value, kind) {
  const absolute = path.resolve(value), parsed = path.parse(absolute);
  let current = parsed.root;
  for (const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (fs.lstatSync(current).isSymbolicLink()) fail(`symlink or junction is not permitted: ${current}`);
  }
  const stat = fs.statSync(absolute);
  if (kind === "directory" ? !stat.isDirectory() : !stat.isFile()) fail(`expected ordinary ${kind}: ${absolute}`);
  return fs.realpathSync.native(absolute);
}

function relativeFile(value, label) {
  if (typeof value !== "string" || !value || /[\\:#?\x00-\x1f]/.test(value) || value.startsWith("/") || value.split("/").some(part => !part || part === "." || part === "..")) fail(`${label} must be a normal relative file path without traversal`);
  if (!/\.(?:md|txt|csv|json|pdf)$/i.test(value)) fail(`${label} must be a passive .md, .txt, .csv, .json or .pdf source`);
  return value;
}

function keys(object, expected, label) {
  if (!object || typeof object !== "object" || Array.isArray(object) || Object.keys(object).some(key => !expected.includes(key))) fail(`${label} contains an unsupported field or is not an object`);
}
function text(value, label) { if (typeof value !== "string" || !value.trim() || !value.isWellFormed() || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)) fail(`${label} must be nonempty, well-formed text`); return value; }
function stringArray(value, label, allowEmpty = false) {
  if (!Array.isArray(value) || (!allowEmpty && !value.length)) fail(`${label} must be an array${allowEmpty ? "" : " with an item"}`);
  value.forEach((item, i) => text(item, `${label}[${i}]`));
  if (new Set(value).size !== value.length) fail(`${label} must not contain duplicates`);
}
function remoteURL(value, label) {
  text(value, label);
  let url; try { url = new URL(value); } catch { fail(`${label} is not an absolute URL`); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) fail(`${label} must be HTTP(S) without credentials`);
  return value;
}

// JSON.parse intentionally keeps the last duplicate key; metadata must not do so.
function parseMetadata(json) {
  const parsed = JSON.parse(json);
  let offset = 0;
  const whitespace = () => { while (/\s/.test(json[offset] || "") && offset < json.length) offset++; };
  const string = () => {
    const start = offset++;
    while (json[offset] !== '"') { if (json[offset] === "\\") offset++; offset++; }
    offset++; return JSON.parse(json.slice(start, offset));
  };
  const value = () => {
    whitespace();
    if (json[offset] === '"') { string(); return; }
    if (json[offset] === "{") {
      offset++; whitespace(); const names = new Set();
      if (json[offset] === "}") { offset++; return; }
      while (true) {
        whitespace(); const key = string(); if (names.has(key)) fail(`duplicate JSON key: ${key}`); names.add(key);
        whitespace(); offset++; value(); whitespace();
        if (json[offset++] === "}") return;
      }
    }
    if (json[offset] === "[") {
      offset++; whitespace(); if (json[offset] === "]") { offset++; return; }
      while (true) { value(); whitespace(); if (json[offset++] === "]") return; }
    }
    while (offset < json.length && !/[\s,}\]]/.test(json[offset])) offset++;
  };
  value(); return parsed;
}

export function validateArtifact(config) {
  keys(config, ["schemaVersion", "title", "version", "audience", "task", "goals", "markdown", "sources", "terms", "activities"], "artifact");
  if (config.schemaVersion !== 1) fail("artifact.schemaVersion must be 1");
  for (const key of ["title", "version", "audience", "task"]) text(config[key], `artifact.${key}`);
  stringArray(config.goals, "artifact.goals");
  relativeFile(config.markdown, "artifact.markdown");
  if (!config.markdown.endsWith(".md")) fail("artifact.markdown must name a .md document");
  if (!Array.isArray(config.sources) || !config.sources.length) fail("artifact.sources must contain a source");
  const sourceIDs = new Set();
  config.sources.forEach((source, i) => {
    const label = `sources[${i}]`;
    keys(source, ["id", "title", "path", "url", "locator"], label);
    if (typeof source.id !== "string" || !ID.test(source.id) || sourceIDs.has(source.id)) fail(`${label}.id must be a unique lowercase identifier`);
    sourceIDs.add(source.id);
    text(source.title, `${label}.title`); text(source.locator, `${label}.locator`);
    if (!source.path && !source.url) fail(`${label} needs path or url`);
    if (Object.hasOwn(source, "path")) relativeFile(source.path, `${label}.path`);
    if (Object.hasOwn(source, "url")) remoteURL(source.url, `${label}.url`);
  });
  if (!Array.isArray(config.terms)) fail("artifact.terms must be an array");
  const terms = new Set();
  config.terms.forEach((term, i) => {
    const label = `terms[${i}]`; keys(term, ["english", "chinese", "forbidden"], label);
    text(term.english, `${label}.english`); text(term.chinese, `${label}.chinese`);
    if (terms.has(term.english)) fail(`${label}.english must be unique`); terms.add(term.english);
    if (Object.hasOwn(term, "forbidden")) {
      stringArray(term.forbidden, `${label}.forbidden`, true);
      if (term.forbidden.some(word => word === term.english || word === term.chinese)) fail(`${label}.forbidden cannot reject the preferred term`);
    }
  });
  if (!Array.isArray(config.activities)) fail("artifact.activities must be an array");
  const activityIDs = new Set();
  config.activities.forEach((activity, i) => {
    const label = `activities[${i}]`;
    keys(activity, ["id", "type", "title", "prompt", "options", "correctIndex", "reference", "sourceId"], label);
    if (typeof activity.id !== "string" || !ID.test(activity.id) || activityIDs.has(activity.id)) fail(`${label}.id must be a unique lowercase identifier`);
    activityIDs.add(activity.id);
    if (activity.type !== "choice") fail(`${label}.type must be choice`);
    for (const key of ["title", "prompt", "reference"]) text(activity[key], `${label}.${key}`);
    if (!sourceIDs.has(activity.sourceId)) fail(`${label}.sourceId must identify a supplied source`);
    if (!Array.isArray(activity.options) || activity.options.length < 2) fail(`${label}.options needs at least two options`);
    activity.options.forEach((option, j) => { keys(option, ["label", "feedback"], `${label}.options[${j}]`); text(option.label, `${label}.options[${j}].label`); text(option.feedback, `${label}.options[${j}].feedback`); });
    if (!Number.isInteger(activity.correctIndex) || activity.correctIndex < 0 || activity.correctIndex >= activity.options.length) fail(`${label}.correctIndex is outside options`);
  });
  return config;
}

/** A deliberately bounded Markdown dialect; unsupported constructs fail before output creation. */
export function renderMarkdown(markdown, allowedFiles = new Set()) {
  if (!markdown.trim()) fail("Markdown material must not be empty");
  const links = [], headings = [];
  function linkTarget(value, line) {
    if (value.startsWith("#")) { if (value.length === 1 || /\s/.test(value)) fail(`Markdown line ${line}: invalid anchor`); }
    else if (/^https?:\/\//i.test(value)) { if (/\s/.test(value)) fail(`Markdown line ${line}: remote URL must not contain whitespace`); remoteURL(value, `Markdown line ${line} link`); }
    else if (!allowedFiles.has(value)) fail(`Markdown line ${line}: link must name an explicitly supplied file or HTTP(S) URL: ${value}`);
    links.push(value); return escapeHTML(allowedFiles.has(value) ? localURL(value) : value);
  }
  function inline(value, line) {
    let output = "";
    for (let i = 0; i < value.length;) {
      const rest = value.slice(i);
      if (rest[0] === "\\") {
        if (rest.length < 2 || !/[\\`*_[\]{}()#+.!|>-]/.test(rest[1])) fail(`Markdown line ${line}: unsupported escape`);
        output += escapeHTML(rest[1]); i += 2;
      } else if (rest[0] === "`") {
        const end = value.indexOf("`", i + 1); if (end < 0 || end === i + 1) fail(`Markdown line ${line}: unsupported or unclosed inline code`);
        output += `<code>${escapeHTML(value.slice(i + 1, end))}</code>`; i = end + 1;
      } else if (rest.startsWith("**")) {
        const end = value.indexOf("**", i + 2); if (end < 0 || end === i + 2) fail(`Markdown line ${line}: unclosed strong text`);
        output += `<strong>${inline(value.slice(i + 2, end), line)}</strong>`; i = end + 2;
      } else if (rest[0] === "[") {
        const match = rest.match(/^\[([^\]\n]+)\]\(([^()\n]+)\)/);
        if (!match) fail(`Markdown line ${line}: unsupported link syntax`);
        output += `<a href="${linkTarget(match[2], line)}">${escapeHTML(match[1])}</a>`; i += match[0].length;
      } else {
        if (/^(?:!\[|\]\[|\[\^|~~|<\/?[A-Za-z!]|<https?:)/.test(rest)) fail(`Markdown line ${line}: unsupported image, reference, footnote, strikethrough, autolink or raw HTML`);
        if (/^\*[^*]+\*/.test(rest) || /^_[^_]+_/.test(rest)) fail(`Markdown line ${line}: emphasis is unsupported; use plain text or **strong**`);
        output += escapeHTML(value[i]); i++;
      }
    }
    return output;
  }
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const first = lines.findIndex(line => line.trim());
  if (lines[first] === "---") {
    const close = lines.findIndex((line, index) => index > first && /^(?:---|\.\.\.)$/.test(line));
    if (close >= 0 || /^[^#\s][^:]*:(?:\s|$)/.test(lines[first + 1] || "")) fail(`Markdown line ${first + 1}: YAML frontmatter is unsupported`);
  }
  let html = "", paragraph = [], list = null, code = null, codeLines = [];
  const flush = () => {
    if (paragraph.length) { html += `<p>${inline(paragraph.map(item => item.text).join(" "), paragraph[0].line)}</p>\n`; paragraph = []; }
    if (list) { html += `</${list}>\n`; list = null; }
  };
  const cells = line => line.replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i], number = i + 1;
    if (code !== null) {
      if (raw === "```") { html += `<pre><code${code ? ` class="language-${escapeHTML(code)}"` : ""}>${escapeHTML(codeLines.join("\n"))}</code></pre>\n`; code = null; codeLines = []; }
      else codeLines.push(raw);
      continue;
    }
    if (!raw.trim()) { flush(); continue; }
    if (/^```/.test(raw)) { flush(); const match = raw.match(/^```([a-zA-Z0-9+-]*)\s*$/); if (!match) fail(`Markdown line ${number}: unsupported code fence`); code = match[1]; continue; }
    if (/^(?:\s|>|~~~)| {2,}$/.test(raw) || /^\s*(?:!\[|\[\^|\[[^\]]+\]:|<)/.test(raw)) fail(`Markdown line ${number}: unsupported indentation, quote, hard break, image, reference, footnote or raw HTML`);
    if (raw.startsWith("|")) {
      flush();
      if (!lines[i + 1] || !/^\|\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)+\|?$/.test(lines[i + 1])) fail(`Markdown line ${number}: table requires a pipe separator row`);
      const headers = cells(raw), alignment = cells(lines[i + 1]);
      if (headers.length !== alignment.length || headers.some(cell => !cell)) fail(`Markdown line ${number}: inconsistent table header`);
      html += `<div class="table-scroll" tabindex="0" role="region" aria-label="可横向查看的材料表格"><table><thead><tr>${headers.map(cell => `<th scope="col">${inline(cell, number)}</th>`).join("")}</tr></thead><tbody>`;
      i++;
      while (lines[i + 1]?.startsWith("|")) {
        i++; const row = cells(lines[i]); if (row.length !== headers.length) fail(`Markdown line ${i + 1}: table column count differs`);
        html += `<tr>${row.map(cell => `<td>${inline(cell, i + 1)}</td>`).join("")}</tr>`;
      }
      html += "</tbody></table></div>\n"; continue;
    }
    const heading = raw.match(/^(#{1,4})\s+(.+)$/);
    if (heading) { flush(); const id = `section-${headings.length + 1}`, level = heading[1].length + 1; headings.push({ id, text: heading[2] }); html += `<h${level} id="${id}">${inline(heading[2], number)}</h${level}>\n`; continue; }
    if (/^#{1,6}(?:\s|$)/.test(raw) || /^[-*+]\s*$/.test(raw) || /^(?:\*\*\*|___)/.test(raw)) fail(`Markdown line ${number}: unsupported heading or separator`);
    if (/^-{3,}$/.test(raw)) {
      if (paragraph.length) fail(`Markdown line ${number}: Setext headings are unsupported; a thematic break needs a separating blank line`);
      flush(); html += "<hr>\n"; continue;
    }
    const item = raw.match(/^(-|\d+\.)\s+(.+)$/);
    if (item) {
      if (paragraph.length) { html += `<p>${inline(paragraph.map(entry => entry.text).join(" "), paragraph[0].line)}</p>\n`; paragraph = []; }
      const tag = item[1] === "-" ? "ul" : "ol";
      if (list !== tag) { if (list) html += `</${list}>\n`; html += `<${tag}${tag === "ol" ? ` start="${Number.parseInt(item[1], 10)}"` : ""}>`; list = tag; }
      if (/^\[[ xX]\]\s/.test(item[2])) fail(`Markdown line ${number}: task lists are unsupported`);
      html += `<li>${inline(item[2], number)}</li>`; continue;
    }
    if (/^[+*]\s|^[=-]{2,}\s*$/.test(raw)) fail(`Markdown line ${number}: unsupported list or setext heading`);
    if (list) { html += `</${list}>\n`; list = null; }
    paragraph.push({ text: raw, line: number });
  }
  if (code !== null) fail("Markdown: unclosed fenced code block");
  flush();
  return { html, headings, links };
}

function activityHTML(activity) {
  const id = escapeHTML(activity.id);
  return `<article class="activity" id="activity-${id}"><h3>${escapeHTML(activity.title)}</h3><p class="scenario">${escapeHTML(activity.prompt)}</p><form data-activity="${id}"><fieldset><legend>选择一个判断，再核对理由</legend>${activity.options.map((option, i) => `<label class="option"><input type="radio" name="${id}" value="${i}"><span>${escapeHTML(option.label)}</span></label>`).join("")}</fieldset><button class="enhancement" type="submit">核对判断</button><div data-feedback id="feedback-${id}" role="status" aria-live="polite" aria-atomic="true"></div></form><details><summary>Reference Judgment · 查看参考判断</summary><p>${escapeHTML(activity.options[activity.correctIndex].label)}</p><p>${escapeHTML(activity.reference)}</p><a href="#source-${escapeHTML(activity.sourceId)}">查看依据</a></details></article>`;
}

function buildHTML(config, markdown) {
  const sources = config.sources.map(source => `<li id="source-${escapeHTML(source.id)}"><strong>${escapeHTML(source.title)}</strong><p>${escapeHTML(source.locator)}</p>${source.path ? `<a href="${escapeHTML(localURL(source.path))}">读取本地材料</a>` : ""}${source.path && source.url ? " · " : ""}${source.url ? `<a href="${escapeHTML(source.url)}">访问来源</a>` : ""}</li>`).join("");
  const terms = config.terms.length ? `<section aria-labelledby="terms-heading"><h2 id="terms-heading">Terminology · 术语</h2><dl class="terms">${config.terms.map(term => `<div><dt>${escapeHTML(term.english)}</dt><dd>${escapeHTML(term.chinese)}</dd></div>`).join("")}</dl></section>` : "";
  const activities = config.activities.length ? `<section aria-labelledby="activities-heading"><h2 id="activities-heading">Local Practice · 局部练习</h2><p>先作判断，再核对参考与依据。参考仅适用于本题材料；作答不代表长期掌握或理解改善。</p><div class="practice-controls enhancement"><p id="practice-status" role="status">尚未核对题目。</p><button type="button" data-reset>重新开始</button></div>${config.activities.map(activityHTML).join("")}</section>` : "";
  const reflection = `<section aria-labelledby="reflection-heading"><h2 id="reflection-heading">Reflection · 应用与意见</h2><label for="reflection">写下你的解释、应用判断或待核对问题</label><textarea id="reflection" rows="5"></textarea><p>记录只在当前页面会话中；刷新或关闭后不保留。可复制文字自行保存。</p><div class="enhancement export-controls"><button type="button" data-export>生成记录</button><button type="button" data-copy disabled>复制记录</button><a data-download hidden download="learning-record.md">下载记录</a></div><div class="enhancement export-box"><label for="export-text">本次记录，可手动复制</label><textarea id="export-text" rows="8" readonly aria-describedby="export-status"></textarea><p id="export-status" role="status" aria-live="polite"></p><button type="button" data-copy-return hidden>返回复制按钮</button></div></section>`;
  const body = `<header class="masthead"><p>Learning Artifact · 学习制品</p><p>Version · ${escapeHTML(config.version)}</p></header><main id="main"><section class="hero"><p class="eyebrow">Read · Explore · Check</p><h1>${escapeHTML(config.title)}</h1><dl><dt>Audience · 目标读者</dt><dd>${escapeHTML(config.audience)}</dd><dt>Task · 使用任务</dt><dd>${escapeHTML(config.task)}</dd></dl><h2>Understanding Goals · 理解目标</h2><ul>${config.goals.map(goal => `<li>${escapeHTML(goal)}</li>`).join("")}</ul><p class="scope">Understanding Effects · NOT_MEASURED。页面、工程检查和本题核对各按实际范围报告，理解效果尚未测量。</p><a href="${escapeHTML(localURL(config.markdown))}" download>下载材料 Markdown</a></section><section class="reading" aria-label="学习材料">${markdown.html}</section>${terms}${activities}${reflection}<section aria-labelledby="sources-heading"><h2 id="sources-heading">Sources and Scope · 来源与范围</h2><ol class="sources">${sources}</ol></section></main><footer>材料、练习记录、实际检查与学习效果分别判断。</footer>`;
  const state = JSON.stringify({ title: config.title, version: config.version, audience: config.audience, task: config.task, activities: config.activities, sources: config.sources }).replace(/</g, "\\u003c");
  const shell = fs.readFileSync(ordinaryPath(path.join(SKILL_ROOT, "assets/warm-paper/shell.html"), "file"), "utf8");
  return shell.replace(/__(TITLE|BODY|STATE)__/g, (_, key) => ({ TITLE: escapeHTML(config.title), BODY: body, STATE: state })[key]);
}

export function renderSite({ input, output }) {
  const inputRoot = ordinaryPath(input, "directory"), outputPath = path.resolve(output);
  if (fs.existsSync(outputPath)) fail("output must be a new directory; existing output is never overwritten");
  const outputParent = ordinaryPath(path.dirname(outputPath), "directory");
  const target = path.join(outputParent, path.basename(outputPath));
  if (isWithin(inputRoot, target) || isWithin(target, inputRoot)) fail("input and output must be independent and must not overlap");
  if (isWithin(PLUGIN_ROOT, target) || /(?:^|\/)plugins\/cache(?:\/|$)/i.test(target.replaceAll("\\", "/"))) fail("output must not be inside a plugin installation or cache");
  const artifactPath = ordinaryPath(path.join(inputRoot, "artifact.json"), "file");
  const configBytes = fs.readFileSync(artifactPath);
  let config; try { config = parseMetadata(new TextDecoder("utf-8", { fatal: true }).decode(configBytes)); } catch (error) { fail(`artifact.json must contain valid UTF-8 JSON without duplicate keys: ${error.message}`); }
  validateArtifact(config);
  const relatives = [...new Set(["artifact.json", config.markdown, ...config.sources.filter(source => source.path).map(source => source.path)])];
  const lower = relatives.map(file => file.toLowerCase());
  if (new Set(lower).size !== lower.length || lower.some(file => RESERVED.some(reserved => file === reserved || file.startsWith(`${reserved}/`)))) fail("input file paths conflict with another input or generated output");
  for (let i = 0; i < lower.length; i++) for (let j = i + 1; j < lower.length; j++) if (lower[i].startsWith(`${lower[j]}/`) || lower[j].startsWith(`${lower[i]}/`)) fail("input file and directory paths conflict");
  const originals = new Map(relatives.map(relative => {
    const file = ordinaryPath(path.join(inputRoot, relative), "file");
    if (!isWithin(inputRoot, file)) fail(`input file escapes its directory: ${relative}`);
    return [relative, fs.readFileSync(file)];
  }));
  const markdownBytes = originals.get(config.markdown);
  const markdown = renderMarkdown(new TextDecoder("utf-8", { fatal: true }).decode(markdownBytes), new Set(relatives));
  const html = buildHTML(config, markdown);
  const anchors = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const link of markdown.links) if (link.startsWith("#") && !anchors.has(escapeHTML(link.slice(1)))) fail(`Markdown link target does not exist: ${link}`);
  const visibleText = decodeHTMLText(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, " "));
  for (const term of config.terms) for (const word of term.forbidden || []) {
    const pattern = /^[A-Za-z0-9_ -]+$/.test(word) ? `(?<![A-Za-z0-9_])${escapeRegex(word)}(?![A-Za-z0-9_])` : escapeRegex(word);
    if (new RegExp(pattern, "iu").test(visibleText)) fail(`known terminology mismatch: ${word}`);
  }
  const files = new Map([
    ["index.html", Buffer.from(html)],
    ["theme.css", fs.readFileSync(ordinaryPath(path.join(SKILL_ROOT, "assets/warm-paper/theme.css"), "file"))],
    ["learning.js", fs.readFileSync(ordinaryPath(path.join(SKILL_ROOT, "assets/warm-paper/learning.js"), "file"))],
    ["LICENSE", fs.readFileSync(ordinaryPath(path.join(PLUGIN_ROOT, "LICENSE"), "file"))],
    ["THIRD_PARTY_NOTICES.md", Buffer.concat([Buffer.from(GENERATED_NOTICE_SCOPE), fs.readFileSync(ordinaryPath(path.join(PLUGIN_ROOT, "THIRD_PARTY_NOTICES.md"), "file"))])],
    ["licenses/Apache-2.0.txt", fs.readFileSync(ordinaryPath(path.join(PLUGIN_ROOT, "licenses/Apache-2.0.txt"), "file"))],
    ...originals,
  ]);
  const manifest = { schemaVersion: 1, artifactPath: "artifact.json", sourceSha256: digest(configBytes), version: config.version, files: [...files].map(([relative, bytes]) => ({ path: relative, sha256: digest(bytes), bytes: bytes.length })).sort((a, b) => a.path.localeCompare(b.path)) };
  // All parsing, schema, links and source reads succeed before the first write.
  fs.mkdirSync(target);
  for (const [relative, bytes] of files) { const file = path.join(target, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes, { flag: "wx" }); }
  fs.writeFileSync(path.join(target, "artifact-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
  return { status: "GENERATED", output: target, version: config.version, files: manifest.files.length, sourceSha256: manifest.sourceSha256, understandingEffects: "NOT_MEASURED" };
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT) {
  try {
    const args = process.argv.slice(2), options = {};
    if (args.length !== 4) fail("usage: node render-site.mjs --input <material-directory> --output <new-independent-directory>");
    for (let i = 0; i < args.length; i += 2) { const name = args[i]; if (!["--input", "--output"].includes(name) || Object.hasOwn(options, name.slice(2)) || !args[i + 1]) fail("expected one --input and one --output"); options[name.slice(2)] = args[i + 1]; }
    if (!options.input || !options.output) fail("both --input and --output are required");
    console.log(JSON.stringify(renderSite(options)));
  } catch (error) { console.error(`Generation failed: ${error.message}`); process.exitCode = 1; }
}
