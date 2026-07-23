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
  "favicon.svg",
  "prompts/generated/manifest.json"
];
const errors = [];
const css = await readFile(path.join(root, "assets/css/styles.css"), "utf8");
const clientJs = await readFile(path.join(root, "assets/js/site.js"), "utf8");
const storyboardSource = JSON.parse(
  await readFile(path.join(root, "prompts/scroll-world.json"), "utf8")
);
const requiredSelectors = [
  ".scroll-proof",
  ".scroll-proof__stage",
  ".build-scene__browser",
  ".wire-block",
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
if (!css.includes("min-height: 420vh") ||
    !css.includes(".scroll-proof__stage") ||
    !css.includes("position: sticky") ||
    !css.includes("100svh")) {
  errors.push("scroll proof: missing 420vh sticky 100vh stage contract");
}
if (!css.includes(".site-header.is-menu-open .primary-nav") ||
    !clientJs.includes('header.classList.toggle("is-menu-open")')) {
  errors.push("mobile navigation contract is incomplete");
}
if (!clientJs.includes('localStorage.setItem("nova-frame-language"')) {
  errors.push("manual language selection persistence is missing");
}
if (!clientJs.includes("[data-scroll-proof]") ||
    !clientJs.includes("--scene-progress") ||
    !clientJs.includes("requestAnimationFrame(readScroll)") ||
    !clientJs.includes("setScrollProofProgress(clamp01(-rect.top / travel))")) {
  errors.push("scroll proof: missing normalized rAF scroll progress contract");
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
  if (!html.includes("data-scroll-proof")) errors.push(`${locale}: missing scroll proof section`);
  if (!html.includes("--scene-progress:0")) errors.push(`${locale}: missing exposed scene progress variable`);
  if (locale === "pt" && !html.includes("Ideias se transformam em experiências digitais.")) {
    errors.push("pt: missing final scroll proof phrase");
  }
  if (locale === "en" && !html.includes("Ideas become digital experiences.")) {
    errors.push("en: missing final scroll proof phrase");
  }
  if ((html.match(/<article class="world-step/g) || []).length !== 8) errors.push(`${locale}: expected 8 scenes`);
  if ((html.match(/<details/g) || []).length !== 5) errors.push(`${locale}: expected 5 FAQ items`);
  if (/(>98<|>1\.2s<|>AA<)/.test(html)) errors.push(`${locale}: contains unverified performance metrics`);
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
if (!rootHtml.includes('location.replace("./" + language + "/")')) {
  errors.push("root: language redirect must remain relative");
}
if (!rootHtml.includes('href="./pt/"') || !rootHtml.includes('href="./en/"')) {
  errors.push("root: language fallback links must remain relative");
}
if (!rootHtml.includes('href="./favicon.svg"')) {
  errors.push("root: missing relative favicon");
}

try {
  await access(path.join(root, ".github/workflows/deploy-pages.yml"));
  errors.push("unexpected GitHub Pages deployment workflow");
} catch {
  // Expected: Cloudflare Pages deploys through its Git integration.
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Checks passed: bilingual pages, scroll proof, 8 scenes, FAQ, language detection and motion fallback.");
