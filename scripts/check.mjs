import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "index.html",
  "pt/index.html",
  "en/index.html",
  "assets/css/styles.css",
  "assets/js/site.js",
  "prompts/generated/manifest.json"
];
const errors = [];

for (const file of required) {
  try { await access(path.join(root, file)); }
  catch { errors.push(`Missing ${file}`); }
}

for (const locale of ["pt", "en"]) {
  const pagePath = path.join(root, locale, "index.html");
  const html = await readFile(pagePath, "utf8");
  const expectedLang = locale === "pt" ? "pt-BR" : "en";
  if (!html.includes(`<html lang="${expectedLang}">`)) errors.push(`${locale}: incorrect lang`);
  if (!html.includes("class=\"language-switcher\"")) errors.push(`${locale}: missing language switcher`);
  if (!html.includes("prefers-reduced-motion")) {
    const css = await readFile(path.join(root, "assets/css/styles.css"), "utf8");
    if (!css.includes("prefers-reduced-motion")) errors.push("missing reduced-motion support");
  }
  if ((html.match(/<article class="world-step/g) || []).length !== 8) errors.push(`${locale}: expected 8 scenes`);
  if ((html.match(/<details/g) || []).length !== 5) errors.push(`${locale}: expected 5 FAQ items`);
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(#|mailto:|https?:)/.test(reference)) continue;
    const target = path.resolve(path.dirname(pagePath), reference);
    try { await access(target); }
    catch { errors.push(`${locale}: broken local reference ${reference}`); }
  }
}

const rootHtml = await readFile(path.join(root, "index.html"), "utf8");
if (!rootHtml.includes("navigator.language")) errors.push("root: missing browser language detection");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Checks passed: bilingual pages, 8 scenes, FAQ, language detection and motion fallback.");
