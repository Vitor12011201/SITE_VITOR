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
  "public/404.html",
  "config/site.json",
  "content/lab/pt.json",
  "content/lab/en.json",
  "content/lab/legacy-concepts-pt.json",
  "content/lab/legacy-concepts-en.json",
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
  ".hero-title-accent",
  ".selected-work",
  ".project-showcase",
  ".project-browser",
  ".project-action",
  ".project-carousel-controls",
  ".project-preview-site",
  ".project-card-showcase",
  ".image-comparison",
  ".process-commercial",
  ".about",
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
    !css.includes(".selected-work__slide { transition: none !important; }") ||
    !css.includes(".image-comparison__layer--before { transition: none !important; }")) {
  errors.push("CSS: reduced-motion final states are incomplete");
}
if (!css.includes("linear-gradient(135deg, #7c3aed, #2563eb 52%, #22d3ee)") ||
    !css.includes("background-clip: text") ||
    !css.includes("-webkit-text-fill-color: transparent") ||
    !css.includes(".hero-title-line") ||
    !css.includes("overflow: visible")) {
  errors.push("Hero: premium bilingual title gradient or readable fallback is incomplete");
}
if (!css.includes(".js .site-header.is-menu-open .primary-nav") ||
    !clientJs.includes("const setMenuOpen") ||
    !clientJs.includes('event.key !== "Escape"')) {
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
if (enabledScenes.length) {
  errors.push(`Home: content architecture must not render long scenes, found ${enabledScenes.join(",")}`);
}
const requiredRoutes = [
  "projects", "projectNuppac", "projectAquaform", "projectBrasa27", "projectAtlasVale",
  "services", "process", "about", "contact", "lab"
];
for (const key of requiredRoutes) {
  const route = site.routes[key];
  if (!route?.pt || !route?.en || !route?.fallback?.startsWith("#")) {
    errors.push(`Routes: ${key} is missing a bilingual future path or working Home fallback`);
  }
}

if (clientJs.includes("[data-commercial-project-scene]") ||
    clientJs.includes("--project-progress") ||
    clientJs.includes("setCommercialProjectProgress(scene)") ||
    !clientJs.includes("requestAnimationFrame(readScroll)")) {
  errors.push("Home: archived scroll-scene runtime is still public or header rAF is missing");
}
if (!clientJs.includes("[data-selected-work]") ||
    !clientJs.includes("selectedWorkReady") ||
    !clientJs.includes("visibilitychange") ||
    !clientJs.includes("pointerdown") ||
    !clientJs.includes("aria-hidden")) {
  errors.push("Selected Work Carousel: accessible guarded runtime is incomplete");
}
if (clientJs.includes(".world-step") || clientJs.includes(".world-stage") ||
    clientJs.includes("setScene(") || clientJs.includes("sceneObserver")) {
  errors.push("Client JS still loads the archived eight-scene Home runtime");
}
if (clientJs.includes("scrollProof") || clientJs.includes("brandGravity") ||
    css.includes(".scroll-proof") || css.includes(".brand-gravity")) {
  errors.push("Public CSS or JS still loads archived Lumina/Nexora scene runtime");
}
if (!clientJs.includes("[data-service-choice]") ||
    !clientJs.includes("data-min-submit-delay") && !clientJs.includes("minSubmitDelay") ||
    !clientJs.includes("[name='website']") ||
    !clientJs.includes("form.checkValidity()") ||
    !clientJs.includes("status.dataset.unavailable")) {
  errors.push("Form: service prefill, accidental-submit protection or accessible validation is missing");
}
if (!clientJs.includes("[data-image-comparison]") ||
    !clientJs.includes('setAttribute("role", "slider")') ||
    !clientJs.includes('"aria-valuenow"') ||
    !clientJs.includes('"pointerdown"') ||
    !clientJs.includes('event.key === "Home"') ||
    !clientJs.includes('event.key === "End"') ||
    !css.includes("touch-action: pan-y") ||
    !css.includes(".image-comparison:focus-visible")) {
  errors.push("NUPPAC comparison: Pointer Events, keyboard or accessible slider contract is incomplete");
}
const nuppacComparison = site.projectAssets?.nuppac?.comparison;
if (nuppacComparison?.previous !== "assets/images/projects/nuppac/previous-site.webp" ||
    nuppacComparison?.newDirection !== "assets/images/projects/nuppac/new-direction.webp" ||
    nuppacComparison?.width !== 1440 ||
    nuppacComparison?.height !== 900) {
  errors.push("NUPPAC comparison: expected real-asset paths and dimensions are not configured");
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
    heroLines: ["Seu negócio", "merece ser", "impossível", "de ignorar."],
    heroBody: "Criamos sites e landing pages para marcas e especialistas",
    selectedWork: "Trabalhos conceituais selecionados da STANDLOUD",
    projects: ["AQUAFORM Auto Spa", "BRASA 27", "ATLAS &amp; VALE"],
    anchors: ["projeto-aquaform", "projeto-brasa-27", "projeto-atlas-vale"],
    concept: "Projeto conceitual"
  },
  en: {
    lang: "en-US",
    hero: "Your business deserves to be impossible to ignore.",
    heroLines: ["Your business", "deserves to be", "impossible", "to ignore."],
    heroBody: "We create websites and landing pages for brands and specialists",
    selectedWork: "Selected STANDLOUD concept work",
    projects: ["AQUAFORM Auto Spa", "BRASA 27", "ATLAS &amp; VALE"],
    anchors: ["projeto-aquaform", "projeto-brasa-27", "projeto-atlas-vale"],
    concept: "Independent concept project"
  }
};
const orderedMarkers = [
  'class="commercial-hero',
  'class="projects-commercial',
  'class="process-commercial',
  'class="about',
  'class="faq',
  'class="contact'
];

for (const locale of ["pt", "en"]) {
  const pagePath = path.join(root, locale, "index.html");
  const html = await readFile(pagePath, "utf8");
  if (!html.includes(`<html lang="${expected[locale].lang}">`)) errors.push(`${locale}: incorrect lang`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1 ||
      expected[locale].heroLines.some((line) => !html.includes(`>${line}</span>`))) {
    errors.push(`${locale}: Home must have one commercial hero h1 with the approved message`);
  }
  if (!html.includes(expected[locale].heroBody) ||
      html.includes("Projeto real: NUPPAC • Experiência responsiva") ||
      html.includes("Real project: NUPPAC • Responsive experience") ||
      (html.match(/data-selected-work-slide/g) || []).length !== 3 ||
      (html.match(/data-selected-work-dot=/g) || []).length !== 3 ||
      (html.match(/data-selected-work-action/g) || []).length !== 1 ||
      html.includes("project-meta") ||
      !html.includes(expected[locale].selectedWork) ||
      !html.includes(`class="button button--primary" href="#contact"`) ||
      !html.includes(`class="button button--ghost" href="#projects"`)) {
    errors.push(`${locale}: compact Hero message, selected-work carousel or CTA targets are incomplete`);
  }
  for (const project of expected[locale].projects) {
    if (!html.includes(project)) errors.push(`${locale}: missing featured project ${project}`);
  }
  for (const anchor of expected[locale].anchors) {
    if (!html.includes(`id="${anchor}"`) || !html.includes(`href="#${anchor}"`)) {
      errors.push(`${locale}: missing working anchor for ${anchor}`);
    }
  }
  if ((html.match(/data-commercial-project-scene/g) || []).length !== 0 ||
      html.includes("--project-progress:0")) {
    errors.push(`${locale}: long commercial project scenes must not render on the simplified Home`);
  }
  if (html.includes("attentionToAction") || html.includes("Da atenção à ação") ||
      html.includes("From attention to action") || html.includes("data-scroll-proof") ||
      html.includes("data-brand-gravity") || html.includes("class=\"world\"") ||
      html.includes("world-step")) {
    errors.push(`${locale}: disabled or archived scenes are visible on the Home`);
  }
  if (html.includes('class="quick-proof') ||
      html.includes('class="problems') ||
      html.includes('class="services-commercial') ||
      html.includes('class="case-study') ||
      html.includes('class="differentials') ||
      html.includes('class="diagnostic')) {
    errors.push(`${locale}: duplicate commercial sections remain visible after consolidation`);
  }
  if ((html.match(/class="commercial-project /g) || []).length !== 4 ||
      (html.match(new RegExp(expected[locale].concept, "g")) || []).length < 3) {
    errors.push(`${locale}: project showcase must contain NUPPAC and three clearly labeled concept projects`);
  }
  const expectedComparisonLabels = locale === "pt"
    ? ["SITE ANTERIOR", "NOVA DIREÇÃO"]
    : ["PREVIOUS WEBSITE", "NEW DIRECTION"];
  const comparisonPending = html.includes('data-comparison-assets="pending"');
  const comparisonReady = html.includes('data-comparison-assets="ready"');
  if (!html.includes("data-image-comparison") ||
      (!comparisonPending && !comparisonReady) ||
      expectedComparisonLabels.some((label) => !html.includes(label)) ||
      (comparisonPending && !html.includes(locale === "pt" ? "Captura real pendente" : "Real screenshot pending")) ||
      (comparisonReady && (!html.includes("../assets/images/projects/nuppac/previous-site.webp") ||
        !html.includes("../assets/images/projects/nuppac/new-direction.webp")))) {
    errors.push(`${locale}: NUPPAC comparison placeholder or bilingual labels are incomplete`);
  }
  if (!html.includes('id="case-nuppac"') ||
      !html.includes(locale === "pt" ? "Projeto real" : "Real project")) {
    errors.push(`${locale}: NUPPAC real-project proof is missing`);
  }
  if ((html.match(/class="process-commercial__list"/g) || []).length !== 1 ||
      (html.match(/class="process-commercial__list"[\s\S]*?<\/ol>/g) || []).some((block) =>
        (block.match(/<li class="reveal">/g) || []).length !== 3)) {
    errors.push(`${locale}: simplified three-step process is missing`);
  }
  if ((html.match(/<details/g) || []).length !== 6) errors.push(`${locale}: expected 6 essential FAQ items`);
  if (!html.includes('data-contact-form') ||
      !html.includes('data-min-submit-delay="1600"') ||
      !html.includes('name="website"') ||
      !html.includes("data-success=") ||
      !html.includes("data-error=") ||
      !html.includes("data-unavailable=")) {
    errors.push(`${locale}: accessible protected form contract is incomplete`);
  }
  if (!html.includes('rel="canonical"') ||
      !html.includes('property="og:url"') ||
      !html.includes('hreflang="en-US"') ||
      !html.includes('property="og:image"') ||
      !html.includes('name="twitter:card" content="summary_large_image"') ||
      !html.includes('"knowsLanguage":["Portuguese","English"]')) {
    errors.push(`${locale}: canonical bilingual metadata is incomplete`);
  }
  if (html.includes("hello@example.com") || html.includes("whatsapp-float") ||
      html.includes('property="og:image" content="../assets/scenes/studio.svg"')) {
    errors.push(`${locale}: placeholder contact or obsolete social preview remains public`);
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
  if (/(>98<|>1\.2s<|>AA<|18 anos|64 projetos|12 prêmios|18 years|64 completed|12 architecture awards|Reservas limitadas|Limited reservations)/.test(html)) {
    errors.push(`${locale}: contains unverified metrics or scarcity`);
  }

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
console.log("Checks passed: simplified PT/EN Home, NUPPAC comparison, honest project status, routes, form and accessibility fallbacks.");
