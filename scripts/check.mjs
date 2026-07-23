import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
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
  "config/site.json",
  "content/lab/pt.json",
  "content/lab/en.json",
  "prompts/generated/manifest.json"
];
const css = await readFile(path.join(root, "assets/css/styles.css"), "utf8");
const clientJs = await readFile(path.join(root, "assets/js/site.js"), "utf8");
const site = JSON.parse(await readFile(path.join(root, "config/site.json"), "utf8"));
const storyboard = JSON.parse(await readFile(path.join(root, "prompts/scroll-world.json"), "utf8"));
const lab = {
  pt: JSON.parse(await readFile(path.join(root, "content/lab/pt.json"), "utf8")),
  en: JSON.parse(await readFile(path.join(root, "content/lab/en.json"), "utf8"))
};

for (const file of required) {
  try { await access(path.join(root, file)); }
  catch { errors.push(`Missing ${file}`); }
}

const selectors = [
  ".commercial-hero",
  ".hero-title__highlight",
  ".quick-proof",
  ".problems",
  ".service-offers",
  ".scene-intro",
  ".scroll-proof",
  ".build-scene__browser",
  ".lumina-header",
  ".lumina-hero",
  ".lumina-stats",
  ".lumina-services",
  ".project-showcase",
  ".brand-gravity",
  ".gravity-browser",
  ".nexora-page",
  ".process-commercial",
  ".case-study",
  ".differentials",
  ".about",
  ".diagnostic",
  ".faq",
  ".contact",
  ".quote-form",
  ".site-footer"
];
for (const selector of selectors) {
  if (!css.includes(selector)) errors.push(`CSS: missing required selector ${selector}`);
}
for (const breakpoint of ["1100", "920", "760"]) {
  if (!css.includes(`@media (max-width: ${breakpoint}px)`)) {
    errors.push(`CSS: missing ${breakpoint}px responsive breakpoint`);
  }
}
if (!css.includes("@media (prefers-reduced-motion: reduce)") ||
    !css.includes("--proof-content-opacity: 1") ||
    !css.includes("--brand-browser-opacity: 1")) {
  errors.push("CSS: reduced-motion final states are incomplete");
}
if (!css.includes("linear-gradient(135deg, #7c3aed, #2563eb 52%, #22d3ee)") ||
    !css.includes("background-clip: text") ||
    !css.includes("-webkit-text-fill-color: transparent") ||
    !css.includes(".hero-title__lead { color: #f5f5f7; }")) {
  errors.push("Hero: premium bilingual title gradient or readable fallback is incomplete");
}
if (!css.includes(".site-header.is-menu-open .primary-nav") ||
    !clientJs.includes('header.classList.toggle("is-menu-open")')) {
  errors.push("Mobile navigation contract is incomplete");
}
if (!css.includes("@keyframes standloud-rise") ||
    !css.includes("@media (max-width: 359px)") ||
    !css.includes(".brand--header .brand__name { display: none; }")) {
  errors.push("STANDLOUD responsive identity contract is incomplete");
}

if (site.home.maxScenes > 4 || site.home.scenes.length > site.home.maxScenes) {
  errors.push("Home scene configuration exceeds the four-scene limit");
}
const enabledScenes = site.home.scenes.filter((scene) => scene.enabled).map((scene) => scene.id);
if (enabledScenes.join(",") !== "lumina,brandGravity") {
  errors.push(`Home: expected only Lumina and Brand Gravity enabled, found ${enabledScenes.join(",")}`);
}
if (site.home.scenes.find((scene) => scene.id === "attentionToAction")?.enabled !== false) {
  errors.push("Home: attentionToAction must remain configured but disabled");
}
const requiredRoutes = [
  "projects", "projectNuppac", "projectLumina", "projectNexora",
  "services", "process", "about", "contact", "lab"
];
for (const key of requiredRoutes) {
  const route = site.routes[key];
  if (!route?.pt || !route?.en || !route?.fallback?.startsWith("#")) {
    errors.push(`Routes: ${key} is missing a bilingual future path or working Home fallback`);
  }
}

if (!clientJs.includes("[data-scroll-proof]") ||
    !clientJs.includes("--scene-progress") ||
    !clientJs.includes("requestAnimationFrame(readScroll)") ||
    !clientJs.includes("setScrollProofProgress(clamp01(-rect.top / travel))")) {
  errors.push("Lumina: normalized reversible rAF scroll progress is incomplete");
}
if (!clientJs.includes("[data-brand-gravity]") ||
    !clientJs.includes("--brand-gravity-progress") ||
    !clientJs.includes("--brand-attraction") ||
    !clientJs.includes("setBrandGravityProgress(clamp01(-rect.top / travel))")) {
  errors.push("Brand Gravity: normalized reversible rAF scroll progress is incomplete");
}
if (clientJs.includes(".world-step") || clientJs.includes(".world-stage") ||
    clientJs.includes("setScene(") || clientJs.includes("sceneObserver")) {
  errors.push("Client JS still loads the archived eight-scene Home runtime");
}
if (!clientJs.includes("[data-service-choice]") ||
    !clientJs.includes("data-min-submit-delay") && !clientJs.includes("minSubmitDelay") ||
    !clientJs.includes("[name='website']") ||
    !clientJs.includes("form.checkValidity()")) {
  errors.push("Form: service prefill, accidental-submit protection or accessible validation is missing");
}

const storyboardFields = [
  "composition", "objects", "lighting", "focalPoint", "cameraStart",
  "move", "cameraEnd", "transition", "textSafeArea"
];
if (storyboard.scenes.length !== 8) errors.push("Storyboard: expected 8 preserved scenes");
for (const scene of storyboard.scenes) {
  for (const field of storyboardFields) {
    if (!scene[field] || (Array.isArray(scene[field]) && !scene[field].length)) {
      errors.push(`Storyboard ${scene.id}: missing ${field}`);
    }
  }
}
for (const locale of ["pt", "en"]) {
  if (lab[locale].world.scenes.length !== 8) {
    errors.push(`Lab ${locale}: expected 8 archived experimental scene references`);
  }
}

const expected = {
  pt: {
    lang: "pt-BR",
    hero: "Seu negócio merece ser impossível de ignorar.",
    heroLead: "Seu negócio merece ser",
    heroHighlight: "impossível de ignorar.",
    heroBody: "Criamos sites e landing pages estratégicas para marcas e especialistas",
    heroProof: "Projeto real: NUPPAC • Experiência responsiva • Português e inglês",
    lumina: "Espaços pensados para atravessar o tempo.",
    gravity: "A maioria das marcas disputa atenção. Algumas criam sua própria gravidade.",
    real: "Projeto real",
    concept: "Projeto conceitual"
  },
  en: {
    lang: "en",
    hero: "Your business deserves to be impossible to ignore.",
    heroLead: "Your business deserves to be",
    heroHighlight: "impossible to ignore.",
    heroBody: "We create strategic websites and landing pages for brands and specialists",
    heroProof: "Real project: NUPPAC • Responsive experience • Portuguese and English",
    lumina: "Spaces designed to stand the test of time.",
    gravity: "Most brands compete for attention. Some create their own gravity.",
    real: "Real project",
    concept: "Concept project"
  }
};
const orderedMarkers = [
  'class="commercial-hero',
  'class="quick-proof',
  'class="problems',
  'class="services-commercial',
  'class="scene-experience scene-experience--lumina',
  'class="projects-commercial',
  'class="scene-experience scene-experience--brandGravity',
  'class="process-commercial',
  'class="case-study',
  'class="differentials',
  'class="about',
  'class="diagnostic',
  'class="faq',
  'class="contact'
];

for (const locale of ["pt", "en"]) {
  const pagePath = path.join(root, locale, "index.html");
  const html = await readFile(pagePath, "utf8");
  if (!html.includes(`<html lang="${expected[locale].lang}">`)) errors.push(`${locale}: incorrect lang`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1 ||
      !html.includes(`class="hero-title__lead">${expected[locale].heroLead}</span>`) ||
      !html.includes(`class="hero-title__highlight">${expected[locale].heroHighlight}</span>`)) {
    errors.push(`${locale}: Home must have one commercial hero h1 with the approved message`);
  }
  if (!html.includes(expected[locale].heroBody) ||
      !html.includes(expected[locale].heroProof) ||
      (html.match(/class="hero-process__step"/g) || []).length !== 3 ||
      !html.includes(`class="button button--primary" href="#diagnostic"`) ||
      !html.includes(`class="button button--ghost" href="#projects"`)) {
    errors.push(`${locale}: compact Hero message, three-step visual or CTA targets are incomplete`);
  }
  if (!html.includes(expected[locale].lumina) ||
      !html.includes("data-scroll-proof") ||
      !html.includes("--scene-progress:0")) {
    errors.push(`${locale}: Lumina scene is incomplete`);
  }
  if (!html.includes(expected[locale].gravity) ||
      !html.includes("data-brand-gravity") ||
      !html.includes("--brand-gravity-progress:0")) {
    errors.push(`${locale}: Brand Gravity scene is incomplete`);
  }
  if ((html.match(/data-scroll-proof/g) || []).length !== 1 ||
      (html.match(/data-brand-gravity/g) || []).length !== 1) {
    errors.push(`${locale}: expected exactly two active Home animations`);
  }
  if (html.includes("attentionToAction") || html.includes("Da atenção à ação") ||
      html.includes("From attention to action") || html.includes("class=\"world\"") ||
      html.includes("world-step")) {
    errors.push(`${locale}: disabled or archived scenes are visible on the Home`);
  }
  if ((html.match(/class="service-offer reveal"/g) || []).length !== 3) {
    errors.push(`${locale}: expected three commercial services`);
  }
  if ((html.match(/class="commercial-project /g) || []).length !== 3 ||
      !html.includes("NUPPAC") || !html.includes(expected[locale].real) ||
      (html.match(new RegExp(expected[locale].concept, "g")) || []).length < 2) {
    errors.push(`${locale}: project showcase must distinguish NUPPAC from conceptual work`);
  }
  if ((html.match(/class="process-commercial__list"/g) || []).length !== 1 ||
      (html.match(/<li class="reveal">/g) || []).length < 5) {
    errors.push(`${locale}: five-step process is missing`);
  }
  if ((html.match(/<details/g) || []).length !== 8) errors.push(`${locale}: expected 8 FAQ items`);
  if (!html.includes('data-min-submit-delay="1600"') ||
      !html.includes('name="website"') ||
      !html.includes("data-success=") ||
      !html.includes("data-error=")) {
    errors.push(`${locale}: accessible protected form contract is incomplete`);
  }
  if (!html.includes('rel="icon" href="../assets/brand/standloud-symbol.svg"') ||
      !html.includes("class=\"brand brand--header\"") ||
      html.includes("NOVA//FRAME")) {
    errors.push(`${locale}: STANDLOUD identity is incomplete or obsolete identity remains`);
  }
  let lastPosition = -1;
  for (const marker of orderedMarkers) {
    const position = html.indexOf(marker);
    if (position < 0 || position <= lastPosition) {
      errors.push(`${locale}: commercial Home section order is incorrect at ${marker}`);
      break;
    }
    lastPosition = position;
  }
  if (/(>98<|>1\.2s<|>AA<)/.test(html)) errors.push(`${locale}: contains unverified metrics`);

  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const reference of references) {
    if (reference.startsWith("#")) {
      if (reference !== "#" && !ids.has(reference.slice(1))) {
        errors.push(`${locale}: broken Home anchor ${reference}`);
      }
      continue;
    }
    if (/^(mailto:|https?:)/.test(reference)) continue;
    try { await access(path.resolve(path.dirname(pagePath), reference)); }
    catch { errors.push(`${locale}: broken local reference ${reference}`); }
  }
}

const rootHtml = await readFile(path.join(root, "index.html"), "utf8");
if (!rootHtml.includes("navigator.language") ||
    !rootHtml.includes('localStorage.getItem("standloud-language")') ||
    !rootHtml.includes('location.replace("./" + language + "/")') ||
    !rootHtml.includes('href="./pt/"') ||
    !rootHtml.includes('href="./en/"')) {
  errors.push("Root: bilingual relative redirect contract is incomplete");
}
const favicon = await readFile(path.join(root, "favicon.svg"), "utf8");
if (!favicon.includes("standloud-favicon-gradient") ||
    (favicon.match(/<path/g) || []).length !== 3 ||
    favicon.includes("<rect")) {
  errors.push("Favicon: expected transparent three-part STANDLOUD symbol");
}
try {
  await access(path.join(root, ".github/workflows/deploy-pages.yml"));
  errors.push("Unexpected GitHub Pages workflow");
} catch {
  // Cloudflare Worker deploys through its Git integration.
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Checks passed: commercial PT/EN Home, two active scenes, Lab archive, routes, form and motion fallbacks.");
