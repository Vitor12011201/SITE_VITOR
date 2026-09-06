import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(await readFile(path.join(root, "config/site.json"), "utf8"));
const locales = Object.fromEntries(await Promise.all(["pt", "en"].map(async (key) => [key, JSON.parse(await readFile(path.join(root, `content/${key}.json`), "utf8"))])));

const esc = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
const attr = esc;
const paletteStyle = Object.entries(site.palette).map(([key, value]) => `--${key}:${value}`).join(";");

function symbol(instance, className = "brand__symbol") {
  const gradient = `standloud-gradient-${instance}`;
  return `<svg class="${attr(className)}" viewBox="0 0 78 64" aria-hidden="true" focusable="false"><defs><linearGradient id="${gradient}" x1="4" y1="58" x2="72" y2="5" gradientUnits="userSpaceOnUse"><stop stop-color="#7C3AED"/><stop offset=".52" stop-color="#2563EB"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs><g fill="url(#${gradient})"><path d="M4 58 13 50 17 35 26 28 21 58Z"/><path d="M25 58 34 50 41 22 51 14 42 58Z"/><path d="M46 58 54 50 61 10 72 3 63 45h12L61 58Z"/></g></svg>`;
}

function heroSection(locale) {
  return `<section class="hero section-shell" id="hero" aria-labelledby="hero-title"><div class="hero__copy reveal"><p class="eyebrow">${esc(locale.hero.eyebrow)}</p><h1 id="hero-title">${esc(locale.hero.title)}</h1><p class="hero__body">${esc(locale.hero.body)}</p><div class="button-row"><a class="button button--primary" href="#contact">${esc(locale.hero.primary)}<span aria-hidden="true">↗</span></a><a class="button button--ghost" href="#work">${esc(locale.hero.secondary)}</a></div><p class="hero__micro"><i aria-hidden="true"></i>${esc(locale.hero.micro)}</p></div><div class="hero__visual reveal" aria-hidden="true"><div class="hero-orbit hero-orbit--one"></div><div class="hero-orbit hero-orbit--two"></div>${symbol("hero", "hero__symbol")}<span class="hero__label">STANDLOUD</span></div></section>`;
}

function problemsSection(locale) {
  return `<section class="problems section-shell" aria-labelledby="problems-title"><div class="section-heading reveal"><div><p class="eyebrow">${esc(locale.problems.eyebrow)}</p><h2 id="problems-title">${esc(locale.problems.title)}</h2></div></div><ol class="problems__list">${locale.problems.items.map((item, index) => `<li class="reveal"><span>0${index + 1}</span><p>${esc(item)}</p></li>`).join("")}</ol></section>`;
}

function servicesSection(locale) {
  return `<section class="services section-shell" id="services" aria-labelledby="services-title"><div class="section-heading reveal"><div><p class="eyebrow">${esc(locale.services.eyebrow)}</p><h2 id="services-title">${esc(locale.services.title)}</h2></div><p>${esc(locale.services.body)}</p></div><div class="service-grid">${locale.services.items.map((item, index) => `<article class="service-card reveal"><span class="service-card__number">0${index + 1}</span><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><ul>${item.deliverables.map((deliverable) => `<li>${esc(deliverable)}</li>`).join("")}</ul><a href="#contact">${esc(item.cta)} <span aria-hidden="true">↗</span></a></article>`).join("")}</div></section>`;
}

function caseStudySection(locale, compact = false) {
  const caseStudy = locale.caseStudy;
  return `<section class="case-study section-shell${compact ? " case-study--page" : ""}" id="work" aria-labelledby="case-title"><div class="case-study__header reveal"><div><p class="eyebrow">${esc(caseStudy.eyebrow)}</p><p class="case-study__badge">${esc(caseStudy.badge)}</p><h2 id="case-title">${esc(caseStudy.title)}</h2></div><p>${esc(caseStudy.intro)}</p></div><div class="case-study__body"><div class="case-study__visual reveal" aria-label="${esc(caseStudy.title)}"><div class="case-window"><span>NUPPAC</span><i></i><i></i><i></i></div><div class="case-window__content"><b></b><b></b><b></b><span></span><span></span></div></div><div class="case-study__details">${caseStudy.facts.map((fact) => `<article class="reveal"><h3>${esc(fact.label)}</h3><p>${esc(fact.body)}</p></article>`).join("")}</div></div><div class="case-study__footer reveal"><ul>${caseStudy.deliverables.map((item) => `<li>${esc(item)}</li>`).join("")}</ul><a class="button button--primary" href="#contact">${esc(caseStudy.cta)}<span aria-hidden="true">↗</span></a></div></section>`;
}

function processSection(locale) {
  return `<section class="process section-shell" id="process" aria-labelledby="process-title"><div class="section-heading reveal"><div><p class="eyebrow">${esc(locale.process.eyebrow)}</p><h2 id="process-title">${esc(locale.process.title)}</h2></div><p>${esc(locale.process.body)}</p></div><ol class="process__list">${locale.process.steps.map((step) => `<li class="reveal"><span>${esc(step.number)}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.body)}</p></div></li>`).join("")}</ol></section>`;
}

function differentialsSection(locale) {
  return `<section class="differentials section-shell" aria-labelledby="differentials-title"><div class="section-heading reveal"><div><p class="eyebrow">${esc(locale.differentials.eyebrow)}</p><h2 id="differentials-title">${esc(locale.differentials.title)}</h2></div></div><ol class="differentials__list">${locale.differentials.items.map((item, index) => `<li class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></li>`).join("")}</ol></section>`;
}

function aboutSection(locale) {
  return `<section class="about section-shell" id="about" aria-labelledby="about-title"><div class="about__mark reveal" aria-hidden="true">${symbol("about", "about__symbol")}</div><div class="about__copy reveal"><p class="eyebrow">${esc(locale.about.eyebrow)}</p><h2 id="about-title">${esc(locale.about.title)}</h2><p>${esc(locale.about.body)}</p><strong>${esc(locale.about.signature)}</strong></div></section>`;
}

function contactSection(locale) {
  const contactMethods = [["Email", site.contact.email, `mailto:${site.contact.email}`], ["WhatsApp", site.contact.whatsappUrl, site.contact.whatsappUrl]].filter(([, value]) => value && value !== "#");
  const methods = contactMethods.length ? `<div class="contact__methods">${contactMethods.map(([label, value, href]) => `<a href="${attr(href)}"><span>${esc(label)}</span>${esc(value)}</a>`).join("")}</div>` : `<p class="contact__pending">${esc(locale.contact.pending)}</p>`;
  return `<section class="contact section-shell" id="contact" aria-labelledby="contact-title"><div class="contact__shell reveal"><div><p class="eyebrow">${esc(locale.contact.eyebrow)}</p><h2 id="contact-title">${esc(locale.contact.title)}</h2><p>${esc(locale.contact.body)}</p></div><div><div class="availability"><i aria-hidden="true"></i>${esc(locale.contact.availability)}</div>${methods}</div></div></section>`;
}

function renderHome(locale) {
  const renderers = { hero: heroSection, problems: problemsSection, services: servicesSection, "case:nuppac": caseStudySection, process: processSection, differentials: differentialsSection, about: aboutSection, contact: contactSection };
  return site.home.sectionOrder.map((section) => {
    const render = renderers[section];
    if (!render) throw new Error(`Unknown Home section: ${section}`);
    return render(locale);
  }).join("\n");
}

function renderProjects(locale) {
  const title = locale.locale === "pt" ? "Trabalho selecionado" : "Selected work";
  const intro = locale.locale === "pt" ? "Um projeto real apresentado com escopo factual." : "A real project presented with factual scope.";
  return `<section class="project-page-intro section-shell"><p class="eyebrow">${esc(locale.caseStudy.eyebrow)}</p><h1>${esc(title)}</h1><p>${esc(intro)}</p></section>${caseStudySection(locale, true)}`;
}

function page(locale, options = {}) {
  const isPt = locale.locale === "pt";
  const depth = options.isProjects ? "../../" : "../";
  const rootHref = `${depth}${locale.locale}/`;
  const otherHref = options.isProjects ? (isPt ? "../../en/projects/" : "../../pt/projetos/") : (isPt ? "../en/" : "../pt/");
  const navHref = (id) => options.isProjects ? `${rootHref}#${id}` : `#${id}`;
  const schema = { "@context": "https://schema.org", "@type": "ProfessionalService", name: site.brand.name, description: locale.seo.description, areaServed: "Worldwide" };
  if (site.contact.email) schema.email = site.contact.email;
  return `<!doctype html><html lang="${attr(locale.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="${attr(site.palette.background)}"><meta name="description" content="${attr(locale.seo.description)}"><meta name="robots" content="index,follow"><meta property="og:type" content="website"><meta property="og:title" content="${attr(site.brand.name)} — ${attr(locale.seo.title)}"><meta property="og:description" content="${attr(locale.seo.description)}"><link rel="icon" href="${depth}assets/brand/standloud-symbol.svg" type="image/svg+xml" sizes="any"><link rel="alternate" hreflang="pt-BR" href="${options.isProjects ? "../../pt/projetos/" : "../pt/"}"><link rel="alternate" hreflang="en" href="${options.isProjects ? "../../en/projects/" : "../en/"}"><link rel="alternate" hreflang="x-default" href="${options.isProjects ? "../../pt/projetos/" : "../pt/"}"><script>document.documentElement.classList.add("js")</script><link rel="stylesheet" href="${depth}assets/css/styles.css"><style>:root{${paletteStyle}}</style><title>${esc(site.brand.name)} — ${esc(locale.seo.title)}</title><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script></head><body data-locale="${attr(locale.locale)}"><a class="skip-link" href="#main">${esc(locale.skip)}</a><header class="site-header" data-header><a class="brand brand--header" href="${options.isProjects ? `${rootHref}#top` : "#top"}" aria-label="${attr(`${site.brand.name} — ${site.brand.tagline}`)}">${symbol("header")}<span class="brand__name">${esc(site.brand.name)}</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav"><span></span><span></span><span class="sr-only">${isPt ? "Abrir menu" : "Open menu"}</span></button><nav class="primary-nav" id="primary-nav" aria-label="${isPt ? "Navegação principal" : "Primary navigation"}"><a href="${navHref("work")}">${esc(locale.nav.work)}</a><a href="${navHref("services")}">${esc(locale.nav.services)}</a><a href="${navHref("process")}">${esc(locale.nav.process)}</a><a href="${navHref("about")}">${esc(locale.nav.about)}</a><a href="${navHref("contact")}">${esc(locale.nav.contact)}</a></nav><div class="header-actions"><div class="language-switcher" aria-label="${isPt ? "Selecionar idioma" : "Choose language"}"><span aria-current="page">${isPt ? "PT" : "EN"}</span><i aria-hidden="true">|</i><a href="${otherHref}" data-language="${isPt ? "en" : "pt"}">${isPt ? "EN" : "PT"}</a></div><a class="header-cta" href="${navHref("contact")}">${esc(locale.nav.cta)}<span aria-hidden="true">↗</span></a></div></header><main id="main"><div id="top" aria-hidden="true"></div>${options.isProjects ? renderProjects(locale) : renderHome(locale)}</main><footer class="site-footer"><div class="footer-top"><a class="brand brand--footer" href="${options.isProjects ? `${rootHref}#top` : "#top"}" aria-label="${attr(site.brand.name)}">${symbol("footer")}<span class="brand__name">${esc(site.brand.name)}</span></a><p>${esc(locale.footer.line)}</p><nav aria-label="${isPt ? "Links do rodapé" : "Footer links"}"><a href="${navHref("work")}">${esc(locale.nav.work)}</a><a href="${navHref("services")}">${esc(locale.nav.services)}</a><a href="${navHref("contact")}">${esc(locale.nav.contact)}</a></nav></div><div class="footer-bottom"><span>© <span data-year></span> ${esc(site.brand.name)}. ${esc(locale.footer.legal)}</span><a href="#top">${esc(locale.footer.back)} ↑</a><div class="language-switcher"><a href="${options.isProjects ? "../../pt/projetos/" : "../pt/"}">PT</a><i aria-hidden="true">|</i><a href="${options.isProjects ? "../../en/projects/" : "../en/"}">EN</a></div></div></footer><script src="${depth}assets/js/site.js" defer></script></body></html>`;
}

await Promise.all([
  mkdir(path.join(root, "pt"), { recursive: true }),
  mkdir(path.join(root, "en"), { recursive: true }),
  mkdir(path.join(root, "pt", "projetos"), { recursive: true }),
  mkdir(path.join(root, "en", "projects"), { recursive: true })
]);
await Promise.all([
  writeFile(path.join(root, "pt", "index.html"), page(locales.pt)),
  writeFile(path.join(root, "en", "index.html"), page(locales.en)),
  writeFile(path.join(root, "pt", "projetos", "index.html"), page(locales.pt, { isProjects: true })),
  writeFile(path.join(root, "en", "projects", "index.html"), page(locales.en, { isProjects: true }))
]);
console.log("Built concise PT/EN Home and NUPPAC-only work pages.");
