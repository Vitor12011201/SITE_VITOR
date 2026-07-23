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
  ".github/workflows/deploy-pages.yml",
  "prompts/generated/manifest.json"
];
const errors = [];
const css = await readFile(path.join(root, "assets/css/styles.css"), "utf8");
const storyboardSource = JSON.parse(
  await readFile(path.join(root, "prompts/scroll-world.json"), "utf8")
);
const requiredSelectors = [
  ".world-step",
  ".glass-panel",
  ".button",
  ".services-grid",
  ".service-card",
  ".process-list",
  ".reasons__panel",
  ".portfolio-grid",
  ".project-card",
  ".faq",
  ".contact",
  ".quote-form",
  ".site-footer"
];

for (const selector of requiredSelectors) {
  if (!css.includes(selector)) errors.push(`CSS: missing required selector ${selector}`);
}
if (!css.includes("@media (max-width: 1100px)") ||
    !css.includes("@media (max-width: 920px)") ||
    !css.includes("@media (max-width: 760px)")) {
  errors.push("CSS: missing responsive desktop/tablet/mobile breakpoints");
}
if (!css.includes("@media (prefers-reduced-motion: reduce)")) {
  errors.push("CSS: missing reduced-motion support");
}

const storyboardFields = [
  "composition",
  "objects",
  "lighting",
  "focalPoint",
  "cameraStart",
  "move",
  "cameraEnd",
  "transition",
  "textSafeArea"
];
if (storyboardSource.scenes.length !== 8) {
  errors.push("Storyboard: expected 8 scenes");
}
for (const scene of storyboardSource.scenes) {
  for (const field of storyboardFields) {
    if (!scene[field] || (Array.isArray(scene[field]) && !scene[field].length)) {
      errors.push(`Storyboard ${scene.id}: missing ${field}`);
    }
  }
}

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
  if ((html.match(/<article class="world-step/g) || []).length !== 8) errors.push(`${locale}: expected 8 scenes`);
  if ((html.match(/<details/g) || []).length !== 5) errors.push(`${locale}: expected 5 FAQ items`);
  if (/(>98<|>1\.2s<|>AA<)/.test(html)) errors.push(`${locale}: contains unverified performance metrics`);
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(#|mailto:|https?:)/.test(reference)) continue;
    const pagesUrl = new URL(reference, `https://example.test/SITE_VITOR/${locale}/`);
    if (!pagesUrl.pathname.startsWith("/SITE_VITOR/")) {
      errors.push(`${locale}: reference escapes GitHub Pages base path ${reference}`);
    }
    const target = path.resolve(path.dirname(pagePath), reference);
    try { await access(target); }
    catch { errors.push(`${locale}: broken local reference ${reference}`); }
  }
}

const rootHtml = await readFile(path.join(root, "index.html"), "utf8");
if (!rootHtml.includes("navigator.language")) errors.push("root: missing browser language detection");
if (!rootHtml.includes('location.replace("./" + language + "/")')) {
  errors.push("root: language redirect must remain relative to the GitHub Pages base path");
}
if (!rootHtml.includes('href="./pt/"') || !rootHtml.includes('href="./en/"')) {
  errors.push("root: language fallback links must remain relative");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Checks passed: bilingual pages, 8 scenes, FAQ, language detection and motion fallback.");
