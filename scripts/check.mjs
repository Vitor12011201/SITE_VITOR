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
  "assets/brand/standloud-symbol.svg",
  "assets/brand/standloud-symbol-mono.svg",
  "assets/brand/standloud-logo-horizontal.svg",
  "assets/brand/standloud-signature.svg",
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
  ".lumina-header",
  ".lumina-hero",
  ".lumina-title",
  ".lumina-visual",
  ".lumina-stats",
  ".lumina-services",
  ".lumina-cta",
  ".build-scene__launch",
  ".brand-gravity",
  ".brand-gravity__stage",
  ".noise-panel",
  ".gravity-browser",
  ".nexora-page",
  ".nexora-hero",
  ".nexora-cards",
  ".nexora-proof",
  ".brand__symbol",
  ".brand__tagline",
  ".brand-core__symbol",
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
if (!css.includes(".wire-block--card-c { display: none; }") ||
    !css.includes("grid-template-columns: 1fr;") ||
    !css.includes("--proof-content-opacity: 1")) {
  errors.push("scroll proof: mobile or reduced-motion final composition is incomplete");
}
if (!css.includes("min-height: 420vh") ||
    !css.includes(".scroll-proof__stage") ||
    !css.includes("position: sticky") ||
    !css.includes("100svh")) {
  errors.push("scroll proof: missing 420vh sticky 100vh stage contract");
}
if (!css.includes("min-height: 470vh") ||
    !css.includes(".brand-gravity__stage") ||
    !css.includes(".noise-panel:nth-child(n + 6)") ||
    !css.includes(".nexora-card:nth-child(n + 3)") ||
    !css.includes("--brand-browser-opacity: 1")) {
  errors.push("brand gravity: desktop, mobile or reduced-motion composition is incomplete");
}
if (!css.includes(".site-header.is-menu-open .primary-nav") ||
    !clientJs.includes('header.classList.toggle("is-menu-open")')) {
  errors.push("mobile navigation contract is incomplete");
}
if (!clientJs.includes('localStorage.setItem("standloud-language"')) {
  errors.push("manual language selection persistence is missing");
}
if (!css.includes("@keyframes standloud-rise") ||
    !css.includes("@keyframes standloud-name-in") ||
    !css.includes("@media (max-width: 359px)") ||
    !css.includes(".brand--header .brand__name { display: none; }") ||
    !css.includes(".brand--header .standloud-bar,") ||
    !css.includes("animation: none !important")) {
  errors.push("STANDLOUD: missing one-time brand animation, narrow mobile mode or reduced-motion fallback");
}
if (!clientJs.includes("[data-scroll-proof]") ||
    !clientJs.includes("--scene-progress") ||
    !clientJs.includes('classList.toggle("is-settled", progressValue >= 0.82)') ||
    !clientJs.includes("requestAnimationFrame(readScroll)") ||
    !clientJs.includes("setScrollProofProgress(clamp01(-rect.top / travel))")) {
  errors.push("scroll proof: missing normalized rAF scroll progress contract");
}
if (!clientJs.includes("[data-brand-gravity]") ||
    !clientJs.includes("--brand-gravity-progress") ||
    !clientJs.includes("--brand-attraction") ||
    !clientJs.includes('classList.toggle("is-settled", progressValue >= 0.85)') ||
    !clientJs.includes("setBrandGravityProgress(clamp01(-rect.top / travel))")) {
  errors.push("brand gravity: missing continuous normalized rAF progress contract");
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
  if (!html.includes("class=\"brand brand--header\"") ||
      !html.includes("class=\"brand brand--footer\"") ||
      !html.includes("class=\"brand__tagline\">Built to be impossible to ignore.</span>") ||
      !html.includes("aria-label=\"STANDLOUD — Built to be impossible to ignore.\"")) {
    errors.push(`${locale}: missing accessible STANDLOUD header or full footer signature`);
  }
  if (html.includes("NOVA//FRAME") || html.includes("Nova Frame")) {
    errors.push(`${locale}: contains obsolete institutional brand name`);
  }
  if (!html.includes("data-scroll-proof")) errors.push(`${locale}: missing scroll proof section`);
  if (!html.includes("--scene-progress:0")) errors.push(`${locale}: missing exposed scene progress variable`);
  if (!html.includes("data-brand-gravity")) errors.push(`${locale}: missing brand gravity section`);
  if (!html.includes("--brand-gravity-progress:0")) errors.push(`${locale}: missing exposed brand gravity progress`);
  if (locale === "pt" && !html.includes("Espaços pensados para atravessar o tempo.")) {
    errors.push("pt: missing Lumina landing page hero title");
  }
  if (locale === "en" && !html.includes("Spaces designed to stand the test of time.")) {
    errors.push("en: missing Lumina landing page hero title");
  }
  if (!html.includes("class=\"lumina-title wire-block wire-block--title\"") ||
      !html.includes("class=\"lumina-stats\"") ||
      !html.includes("class=\"lumina-services\"") ||
      !html.includes("class=\"lumina-header wire-block wire-block--nav\"") ||
      (html.match(/class="lumina-stat wire-block/g) || []).length !== 3 ||
      (html.match(/class="lumina-service wire-block/g) || []).length !== 3) {
    errors.push(`${locale}: scroll proof is missing the complete Lumina landing page structure`);
  }
  if (html.includes("scroll-proof__final")) {
    errors.push(`${locale}: obsolete oversized final overlay is still present`);
  }
  if (locale === "pt" && (!html.includes("Seu negócio merece ser") || !html.includes("impossível de ignorar."))) {
    errors.push("pt: missing Nexora hero title");
  }
  if (locale === "en" && (!html.includes("Your business deserves to be") || !html.includes("impossible to ignore."))) {
    errors.push("en: missing Nexora hero title");
  }
  if (!html.includes("class=\"nexora-page\"") ||
      !html.includes("class=\"nexora-cards\"") ||
      !html.includes("class=\"nexora-proof gravity-component gravity-component--proof\"") ||
      (html.match(/class="noise-panel noise-panel--/g) || []).length !== 12 ||
      (html.match(/class="nexora-card gravity-component/g) || []).length !== 4) {
    errors.push(`${locale}: brand gravity is missing contextual noise or the complete Nexora layout`);
  }
  if (!(html.indexOf("data-scroll-proof") < html.indexOf("data-brand-gravity") &&
        html.indexOf("data-brand-gravity") < html.indexOf("class=\"world\""))) {
    errors.push(`${locale}: brand gravity must remain between the first scroll proof and the 8-scene world`);
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
if (!rootHtml.includes('localStorage.getItem("standloud-language")')) {
  errors.push("root: missing STANDLOUD language preference key");
}
if (!rootHtml.includes('location.replace("./" + language + "/")')) {
  errors.push("root: language redirect must remain relative");
}
if (!rootHtml.includes('href="./pt/"') || !rootHtml.includes('href="./en/"')) {
  errors.push("root: language fallback links must remain relative");
}
if (!rootHtml.includes('href="./favicon.svg"')) {
  errors.push("root: missing relative favicon");
}

const favicon = await readFile(path.join(root, "favicon.svg"), "utf8");
if (!favicon.includes("standloud-favicon-gradient") ||
    (favicon.match(/<path/g) || []).length !== 3 ||
    favicon.includes("<rect")) {
  errors.push("favicon: expected the transparent three-part STANDLOUD symbol");
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
console.log("Checks passed: bilingual pages, 2 scroll proofs, 8 scenes, FAQ, language detection and motion fallbacks.");
