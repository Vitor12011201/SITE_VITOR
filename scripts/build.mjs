import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(await readFile(path.join(root, "config/site.json"), "utf8"));
const locales = {
  pt: JSON.parse(await readFile(path.join(root, "content/pt.json"), "utf8")),
  en: JSON.parse(await readFile(path.join(root, "content/en.json"), "utf8"))
};

const esc = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);

const attr = esc;
const paletteStyle = Object.entries(site.palette)
  .map(([key, value]) => `--${key}:${value}`)
  .join(";");

function standloudSymbol(instance, className = "brand__symbol") {
  const gradientId = `standloud-gradient-${instance}`;
  return `<svg class="${attr(className)}" viewBox="0 0 78 64" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${gradientId}" x1="4" y1="58" x2="72" y2="5" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7C3AED"/>
        <stop offset=".52" stop-color="#2563EB"/>
        <stop offset="1" stop-color="#22D3EE"/>
      </linearGradient>
    </defs>
    <g fill="url(#${gradientId})">
      <path class="standloud-bar standloud-bar--one" d="M4 58 13 50 17 35 26 28 21 58Z"/>
      <path class="standloud-bar standloud-bar--two" d="M25 58 34 50 41 22 51 14 42 58Z"/>
      <path class="standloud-bar standloud-bar--three" d="M46 58 54 50 61 10 72 3 63 45h12L61 58Z"/>
    </g>
  </svg>`;
}

function options(items) {
  return items.map((item, index) =>
    `<option value="${index ? attr(item) : ""}">${esc(item)}</option>`
  ).join("");
}

function sceneStep(scene, index, locale) {
  const cta = [];
  if (scene.primary) {
    cta.push(`<a class="button button--primary" href="#contact">${esc(scene.primary)}<span aria-hidden="true">↗</span></a>`);
  }
  if (scene.secondary) {
    const target = scene.id === "studio" ? "#services" : site.contact.whatsappUrl;
    cta.push(`<a class="button button--ghost" href="${target}">${esc(scene.secondary)}</a>`);
  }
  return `
    <article class="world-step${index === 0 ? " is-active" : ""}" id="scene-${attr(scene.id)}"
      data-scene="${index}" data-image="../assets/scenes/${attr(scene.id)}.svg"
      aria-labelledby="scene-title-${attr(scene.id)}">
      <div class="world-step__copy glass-panel">
        <div class="scene-index" aria-hidden="true">${String(index + 1).padStart(2, "0")} / 08</div>
        <p class="eyebrow">${esc(scene.eyebrow)}</p>
        <h1 id="scene-title-${attr(scene.id)}">${esc(scene.title)}</h1>
        <p class="scene-body">${esc(scene.body)}</p>
        ${scene.tags.length ? `<ul class="tag-list">${scene.tags.map((tag) => `<li>${esc(tag)}</li>`).join("")}</ul>` : ""}
        ${cta.length ? `<div class="button-row">${cta.join("")}</div>` : ""}
      </div>
      <img class="world-step__mobile-visual" src="../assets/scenes/${attr(scene.id)}.svg"
        width="1600" height="900" loading="${index < 2 ? "eager" : "lazy"}"
        decoding="async" alt="${attr(scene.alt)}">
    </article>`;
}

function serviceCards(items) {
  return items.map(([title, body], index) => `
    <article class="service-card reveal">
      <span class="service-card__num">${String(index + 1).padStart(2, "0")}</span>
      <div class="service-card__icon" aria-hidden="true"><i></i><i></i></div>
      <h3>${esc(title)}</h3>
      <p>${esc(body)}</p>
    </article>`).join("");
}

function projectCards(items) {
  return items.map((item) => {
    const tag = item.caseUrl ? "a" : "article";
    const href = item.caseUrl ? ` href="${attr(item.caseUrl)}"` : "";
    return `<${tag} class="project-card reveal${item.caseUrl ? " project-link" : ""}"${href} data-project-status="${attr(item.status)}">
      <div class="project-card__visual">
        <img src="../assets/scenes/${attr(item.image)}.svg" width="1600" height="900" loading="lazy" alt="">
        <span>${esc(item.type)}</span>
      </div>
      <div class="project-card__content"><p class="eyebrow">${esc(item.type)}</p><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><small>${esc(item.tags)}</small></div>
    </${tag}>`;
  }).join("");
}

function scrollProof(locale) {
  const proof = locale.scrollProof;
  const landing = proof.landing;

  return `<section class="scroll-proof" id="scroll-proof" data-scroll-proof aria-labelledby="scroll-proof-title" style="--scene-progress:0;--scene-phase-a:0;--scene-phase-b:0;--scene-phase-c:0;--scene-phase-d:0;--scene-phase-e:0">
      <div class="scroll-proof__stage">
        <div class="scroll-proof__ambient" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i><i></i>
        </div>
        <div class="scroll-proof__viewport">
          <div class="scroll-proof__copy">
            <p class="eyebrow">${esc(proof.eyebrow)}</p>
            <h1 id="scroll-proof-title">${esc(proof.title)}</h1>
            <p>${esc(proof.body)}</p>
            <span class="scroll-proof__hint"><i aria-hidden="true"></i>${esc(proof.scrollHint)}</span>
          </div>
          <div class="build-scene">
            <div class="build-scene__floor" aria-hidden="true"></div>
            <div class="build-scene__browser">
              <div class="build-scene__bar" aria-hidden="true"><span></span><span></span><span></span><i></i><b>lumina.arq</b></div>
              <div class="landing-page lumina-page">
                <div class="landing-page__guides" aria-hidden="true"></div>
                <header class="lumina-header wire-block wire-block--nav">
                  <a class="lumina-logo" href="#scroll-proof"><i aria-hidden="true"></i><span>${esc(landing.brand)}</span></a>
                  <nav class="lumina-nav" aria-label="${esc(landing.brand)}">
                    ${landing.nav.map((item, index) => `<a href="${index === 0 ? "#lumina-projects" : index === 1 ? "#lumina-studio" : index === 2 ? "#lumina-services" : "#contact"}">${esc(item)}</a>`).join("")}
                  </nav>
                  <a class="lumina-contact" href="#contact">${esc(landing.nav[3])}<span aria-hidden="true">↗</span></a>
                  <span class="lumina-menu" aria-hidden="true"><i></i><i></i></span>
                </header>
                <section class="lumina-hero" id="lumina-projects">
                  <div class="lumina-hero__copy">
                    <p class="lumina-eyebrow wire-block wire-block--eyebrow">${esc(landing.eyebrow)}</p>
                    <h2 class="lumina-title wire-block wire-block--title">${esc(landing.title)}</h2>
                    <p class="lumina-body wire-block wire-block--body">${esc(landing.body)}</p>
                    <div class="lumina-actions wire-block wire-block--actions">
                      <a class="lumina-button lumina-button--primary" href="#lumina-services">${esc(landing.primary)}</a>
                      <a class="lumina-button lumina-button--secondary" href="#contact">${esc(landing.secondary)}</a>
                    </div>
                  </div>
                  <div class="lumina-visual wire-block wire-block--media" role="img" aria-label="${esc(landing.project)}">
                    <span class="lumina-visual__sky" aria-hidden="true"></span>
                    <span class="lumina-visual__sun" aria-hidden="true"></span>
                    <span class="lumina-visual__volume lumina-visual__volume--rear" aria-hidden="true"></span>
                    <span class="lumina-visual__volume lumina-visual__volume--front" aria-hidden="true"></span>
                    <span class="lumina-visual__glass" aria-hidden="true"></span>
                    <span class="lumina-visual__ground" aria-hidden="true"></span>
                    <small>${esc(landing.project)}</small>
                  </div>
                </section>
                <section class="lumina-stats" id="lumina-studio" aria-label="${esc(landing.statsLabel)}">
                  ${landing.stats.map((item, index) => `<div class="lumina-stat wire-block wire-block--stat-${String.fromCharCode(97 + index)}"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></div>`).join("")}
                </section>
                <section class="lumina-services" id="lumina-services" aria-label="${esc(landing.servicesLabel)}">
                  ${landing.services.map((item, index) => `<article class="lumina-service wire-block wire-block--card-${String.fromCharCode(97 + index)}">
                    <span>0${index + 1}</span>
                    <h3>${esc(item.title)}</h3>
                    <p>${esc(item.body)}</p>
                    <i aria-hidden="true">↗</i>
                  </article>`).join("")}
                </section>
                <aside class="lumina-cta wire-block wire-block--cta">
                  <p>${esc(landing.cta)}</p>
                  <a href="#contact">${esc(landing.ctaButton)}<span aria-hidden="true">↗</span></a>
                </aside>
              </div>
            </div>
            <div class="build-scene__launch">
              <i aria-hidden="true"></i><span>${esc(proof.launch)}</span>
            </div>
          </div>
          <div class="scroll-proof__meter" aria-hidden="true">
            <span>${esc(proof.status)}</span>
            <i></i>
          </div>
        </div>
      </div>
    </section>`;
}

function brandGravity(locale) {
  const gravity = locale.brandGravity;
  const landing = gravity.landing;
  const noiseBrands = ["Mono", "Vertex", "Flow", "Prime", "Orbit", "Shift", "Core", "Pixel", "Scale", "North", "Unit", "Form"];
  const noiseTypes = ["site", "ad", "product", "browser", "banner", "card"];
  const noisePanels = noiseBrands.map((brand, index) => {
    const headline = gravity.noise[index % gravity.noise.length];
    return `<article class="noise-panel noise-panel--${noiseTypes[index % noiseTypes.length]}" aria-hidden="true">
      <div class="noise-panel__chrome"><i></i><i></i><span>www.${brand.toLowerCase()}.site</span></div>
      <div class="noise-panel__nav"><b>${esc(brand)}</b><span>Home</span><span>About</span><span>Contact</span></div>
      <div class="noise-panel__content">
        <small>Digital solutions</small>
        <strong>${esc(headline)}</strong>
        <p>${esc(gravity.noiseBody)}</p>
        <span class="noise-panel__button">${esc(gravity.noiseCta)}</span>
        <i class="noise-panel__media"></i>
      </div>
    </article>`;
  }).join("");

  return `<section class="brand-gravity" id="brand-gravity" data-brand-gravity aria-labelledby="brand-gravity-title" style="--brand-gravity-progress:0;--brand-noise:0;--brand-pulse:0;--brand-attraction:0;--brand-dominance:0;--brand-final:0">
      <div class="brand-gravity__stage">
        <div class="brand-gravity__floor" aria-hidden="true"></div>
        <div class="brand-gravity__beams" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="brand-gravity__label">
          <p>${esc(gravity.eyebrow)}</p>
          <h2 id="brand-gravity-title">${esc(gravity.title)}</h2>
          <span>${esc(gravity.status)}</span>
        </div>
        <div class="brand-gravity__noise">${noisePanels}</div>
        <div class="brand-core" aria-hidden="true">
          <i></i><i></i><i></i>
          <span class="brand-core__symbol">${standloudSymbol("gravity", "brand-core__mark")}</span>
        </div>
        <div class="gravity-browser">
          <div class="gravity-browser__chrome" aria-hidden="true"><i></i><i></i><i></i><span>nexora.studio</span></div>
          <div class="nexora-page">
            <header class="nexora-nav gravity-component gravity-component--nav">
              <a class="nexora-brand" href="#brand-gravity"><i aria-hidden="true"></i><span>${esc(landing.brand)}</span></a>
              <nav aria-label="${esc(landing.brand)}">${landing.nav.map((item) => `<a href="#brand-gravity">${esc(item)}</a>`).join("")}</nav>
              <a class="nexora-nav__cta" href="#contact">${esc(landing.navCta)}<span aria-hidden="true">↗</span></a>
              <span class="nexora-menu" aria-hidden="true"><i></i><i></i></span>
            </header>
            <section class="nexora-hero">
              <div class="nexora-hero__copy">
                <p class="nexora-eyebrow gravity-component gravity-component--eyebrow">${esc(landing.eyebrow)}</p>
                <h3 class="nexora-title gravity-component gravity-component--title">${esc(landing.title)} <em>${esc(landing.highlight)}</em></h3>
                <p class="nexora-body gravity-component gravity-component--body">${esc(landing.body)}</p>
                <div class="nexora-actions gravity-component gravity-component--actions">
                  <a class="nexora-button nexora-button--primary" href="#contact">${esc(landing.primary)}</a>
                  <a class="nexora-button nexora-button--secondary" href="#work">${esc(landing.secondary)}</a>
                </div>
              </div>
              <div class="nexora-visual gravity-component gravity-component--visual" role="img" aria-label="${esc(landing.visualLabel)}">
                <span class="nexora-visual__halo" aria-hidden="true"></span>
                <svg viewBox="0 0 420 360" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="nexora-ribbon" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stop-color="#22D3EE"/>
                      <stop offset=".42" stop-color="#2563EB"/>
                      <stop offset="1" stop-color="#7C3AED"/>
                    </linearGradient>
                    <filter id="nexora-glow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                  <path class="nexora-ribbon nexora-ribbon--ghost" d="M72 238C124 82 318 68 344 180C365 270 204 313 142 243C91 186 151 119 224 128C286 136 291 205 246 226"/>
                  <path class="nexora-ribbon" d="M72 238C124 82 318 68 344 180C365 270 204 313 142 243C91 186 151 119 224 128C286 136 291 205 246 226"/>
                  <path class="nexora-ribbon nexora-ribbon--fine" d="M96 272C176 330 320 281 355 192"/>
                </svg>
                <span class="nexora-visual__axis" aria-hidden="true"></span>
                <small>${esc(landing.visualLabel)}</small>
              </div>
            </section>
            <section class="nexora-cards" aria-label="${esc(landing.eyebrow)}">
              ${landing.cards.map((card, index) => `<article class="nexora-card gravity-component gravity-component--card-${String.fromCharCode(97 + index)}">
                <i aria-hidden="true"><span></span></i>
                <h4>${esc(card.title)}</h4>
                <p>${esc(card.body)}</p>
                <small>0${index + 1}</small>
              </article>`).join("")}
            </section>
            <div class="nexora-proof gravity-component gravity-component--proof">
              <p>${esc(landing.proof)}</p>
              <div>${landing.proofBrands.map((brand) => `<span>${esc(brand)}</span>`).join("")}</div>
            </div>
          </div>
        </div>
        <div class="brand-gravity__established"><i aria-hidden="true"></i><span>${esc(gravity.established)}</span></div>
        <div class="brand-gravity__meter" aria-hidden="true"><span>${esc(gravity.title)}</span><i></i></div>
      </div>
    </section>`;
}

function page(locale) {
  const isPt = locale.locale === "pt";
  const otherLocale = isPt ? "EN" : "PT";
  const otherHref = isPt ? "../en/" : "../pt/";
  const brand = site.brand.name;
  const socialLinks = [
    ["Instagram", site.contact.instagramUrl],
    ["LinkedIn", site.contact.linkedinUrl],
    ["Behance", site.contact.behanceUrl]
  ];

  return `<!doctype html>
<html lang="${attr(locale.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="${attr(site.palette.background)}">
  <meta name="description" content="${attr(locale.seo.description)}">
  <meta name="robots" content="index,follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${attr(brand)} — ${attr(locale.seo.title)}">
  <meta property="og:description" content="${attr(locale.seo.description)}">
  <meta property="og:image" content="../assets/scenes/studio.svg">
  <link rel="icon" href="../assets/brand/standloud-symbol.svg" type="image/svg+xml" sizes="any">
  <link rel="mask-icon" href="../assets/brand/standloud-symbol-mono.svg" color="#7C3AED">
  <link rel="alternate" hreflang="pt-BR" href="../pt/">
  <link rel="alternate" hreflang="en" href="../en/">
  <link rel="alternate" hreflang="x-default" href="../pt/">
  <script>document.documentElement.classList.add("js")</script>
  <link rel="stylesheet" href="../assets/css/styles.css">
  <style>:root{${paletteStyle}}</style>
  <title>${esc(brand)} — ${esc(locale.seo.title)}</title>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brand,
    description: locale.seo.description,
    email: site.contact.email,
    areaServed: "Worldwide"
  }).replace(/</g, "\\u003c")}</script>
</head>
<body data-locale="${attr(locale.locale)}">
  <a class="skip-link" href="#main">${esc(locale.skip)}</a>
  <header class="site-header" data-header>
    <a class="brand brand--header" href="#top" aria-label="${attr(`${brand} — ${site.brand.tagline}`)}">
      ${standloudSymbol("header")}
      <span class="brand__name">${esc(brand)}</span>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">
      <span></span><span></span><span class="sr-only">${isPt ? "Abrir menu" : "Open menu"}</span>
    </button>
    <nav class="primary-nav" id="primary-nav" aria-label="${isPt ? "Navegação principal" : "Primary navigation"}">
      <a href="#services">${esc(locale.nav.services)}</a>
      <a href="#process">${esc(locale.nav.process)}</a>
      <a href="#work">${esc(locale.nav.work)}</a>
      <a href="#faq">${esc(locale.nav.faq)}</a>
    </nav>
    <div class="header-actions">
      <div class="language-switcher" aria-label="${isPt ? "Selecionar idioma" : "Choose language"}">
        <span aria-current="page">${isPt ? "PT" : "EN"}</span>
        <i aria-hidden="true">|</i>
        <a href="${otherHref}" data-language="${otherLocale.toLowerCase()}">${otherLocale}</a>
      </div>
      <a class="header-cta" href="#contact">${esc(locale.headerCta)}<span aria-hidden="true">↗</span></a>
    </div>
  </header>

  <main id="main">
    <div id="top" aria-hidden="true"></div>
    ${scrollProof(locale)}
    ${brandGravity(locale)}
    <section class="world" id="experience" aria-label="${attr(locale.world.aria)}">
      <div class="world-stage" aria-hidden="true">
        <div class="world-stage__halo"></div>
        <div class="world-stage__grid"></div>
        <img class="world-stage__image world-stage__image--a is-visible"
          src="../assets/scenes/studio.svg" width="1600" height="900" alt="">
        <img class="world-stage__image world-stage__image--b"
          src="../assets/scenes/studio.svg" width="1600" height="900" alt="">
        <div class="world-stage__vignette"></div>
        <div class="world-stage__label"><span>SCROLL/WORLD</span><i></i><span>PREVIS 01</span></div>
      </div>
      <div class="world-progress" role="progressbar" aria-label="${attr(locale.world.progress)}"
        aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
      <nav class="world-route" aria-label="${isPt ? "Cenas da experiência" : "Experience scenes"}">
        ${locale.world.scenes.map((scene, index) => `<a href="#scene-${attr(scene.id)}" data-route="${index}"${index === 0 ? " class=\"is-active\" aria-current=\"step\"" : ""}><i></i><span>${esc(scene.label)}</span></a>`).join("")}
      </nav>
      <div class="world-steps">
        ${locale.world.scenes.map((scene, index) => sceneStep(scene, index, locale)).join("")}
      </div>
      <div class="scroll-hint" aria-hidden="true"><span>${esc(locale.world.scrollHint)}</span><i></i></div>
    </section>

    <section class="manifesto section-shell">
      <div class="manifesto__orb" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="section-intro reveal">
        <p class="eyebrow">${esc(locale.manifesto.eyebrow)}</p>
        <h2>${esc(locale.manifesto.title)}</h2>
        <p>${esc(locale.manifesto.body)}</p>
      </div>
    </section>

    <section class="services section-shell" id="services">
      <div class="section-heading reveal">
        <div><p class="eyebrow">${esc(locale.services.eyebrow)}</p><h2>${esc(locale.services.title)}</h2></div>
        <p>${esc(locale.services.body)}</p>
      </div>
      <div class="services-grid">${serviceCards(locale.services.items)}</div>
    </section>

    <section class="process section-shell" id="process">
      <div class="section-heading reveal">
        <div><p class="eyebrow">${esc(locale.process.eyebrow)}</p><h2>${esc(locale.process.title)}</h2></div>
      </div>
      <ol class="process-list">
        ${locale.process.steps.map(([num, title, body]) => `<li class="reveal"><span>${esc(num)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></li>`).join("")}
      </ol>
    </section>

    <section class="reasons section-shell">
      <div class="reasons__panel reveal">
        <div class="reasons__visual" aria-hidden="true">
          ${locale.reasons.indicators.map((indicator, index) => `<span class="metric metric--${["a", "b", "c"][index]}"><i></i>${esc(indicator)}</span>`).join("")}
          <div class="core"><i></i><i></i><i></i></div>
        </div>
        <div class="reasons__copy">
          <p class="eyebrow">${esc(locale.reasons.eyebrow)}</p>
          <h2>${esc(locale.reasons.title)}</h2>
          <ul>${locale.reasons.items.map((item) => `<li><span aria-hidden="true">↗</span>${esc(item)}</li>`).join("")}</ul>
        </div>
      </div>
    </section>

    <section class="portfolio section-shell" id="work">
      <div class="section-heading reveal">
        <div><p class="eyebrow">${esc(locale.portfolio.eyebrow)}</p><h2>${esc(locale.portfolio.title)}</h2></div>
        <p>${esc(locale.portfolio.body)}</p>
      </div>
      <div class="portfolio-grid">
        ${projectCards(locale.portfolio.items)}
      </div>
    </section>

    <section class="faq section-shell" id="faq">
      <div class="faq__heading reveal"><p class="eyebrow">${esc(locale.faq.eyebrow)}</p><h2>${esc(locale.faq.title)}</h2></div>
      <div class="faq-list">
        ${locale.faq.items.map(([question, answer], index) => `<details class="reveal"${index === 0 ? " open" : ""}><summary><span>${esc(question)}</span><i aria-hidden="true"></i></summary><p>${esc(answer)}</p></details>`).join("")}
      </div>
    </section>

    <section class="contact section-shell" id="contact">
      <div class="contact__shell">
        <div class="contact__intro reveal">
          <p class="eyebrow">${esc(locale.contact.eyebrow)}</p>
          <h2>${esc(locale.contact.title)}</h2>
          <p>${esc(locale.contact.body)}</p>
          <div class="availability"><i></i>${esc(locale.contact.availability)}</div>
          <a class="contact-email" href="mailto:${attr(site.contact.email)}">${esc(site.contact.email)}</a>
        </div>
        <form class="quote-form reveal" data-demo-form novalidate>
          <div class="field"><label for="name">${esc(locale.contact.labels.name)}</label><input id="name" name="name" autocomplete="name" required></div>
          <div class="field"><label for="email">${esc(locale.contact.labels.email)}</label><input id="email" name="email" type="email" autocomplete="email" required></div>
          <div class="field field--wide"><label for="company">${esc(locale.contact.labels.company)}</label><input id="company" name="company" autocomplete="organization"></div>
          <div class="field field--wide"><label for="service">${esc(locale.contact.labels.service)}</label><select id="service" name="service" required>${options(locale.contact.serviceOptions)}</select></div>
          <div class="field field--wide"><label for="idea">${esc(locale.contact.labels.idea)}</label><textarea id="idea" name="idea" rows="5" required></textarea></div>
          <div class="field"><label for="budget">${esc(locale.contact.labels.budget)}</label><select id="budget" name="budget">${options(locale.contact.budgetOptions)}</select></div>
          <div class="field"><label for="timeline">${esc(locale.contact.labels.timeline)}</label><select id="timeline" name="timeline">${options(locale.contact.timelineOptions)}</select></div>
          <button class="button button--primary form-submit" type="submit">${esc(locale.contact.labels.submit)}<span aria-hidden="true">↗</span></button>
          <p class="form-status" role="status" aria-live="polite" data-form-status data-message="${attr(locale.contact.success)}"></p>
        </form>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-top">
      <a class="brand brand--footer" href="#top" aria-label="${attr(`${brand} — ${site.brand.tagline}`)}">
        ${standloudSymbol("footer")}
        <span class="brand__lockup">
          <strong class="brand__name">${esc(brand)}</strong>
          <span class="brand__tagline">${esc(site.brand.tagline)}</span>
        </span>
      </a>
      <p>${esc(locale.footer.line)}</p>
      <a class="footer-back" href="#top">${esc(locale.footer.back)} ↑</a>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year></span> ${esc(site.brand.legalName)}. ${esc(locale.footer.legal)}</span>
      <nav aria-label="${attr(locale.footer.social)}">${socialLinks.map(([name, href]) => `<a href="${attr(href)}"${href === "#" ? " data-placeholder aria-disabled=\"true\"" : ""}>${esc(name)}</a>`).join("")}</nav>
      <div class="language-switcher"><a href="../pt/"${isPt ? " aria-current=\"page\"" : ""}>PT</a><i>|</i><a href="../en/"${!isPt ? " aria-current=\"page\"" : ""}>EN</a></div>
    </div>
  </footer>
  <a class="whatsapp-float" href="${attr(site.contact.whatsappUrl)}"
    aria-label="${isPt ? "Falar pelo WhatsApp" : "Contact on WhatsApp"}">
    <span>WA</span><i aria-hidden="true"></i>
  </a>
  <script src="../assets/js/site.js" defer></script>
</body>
</html>`;
}

function sceneSvg(id, index) {
  const p = site.palette;
  const cx = 930 + (index % 2) * 40;
  const accents = [p.purple, p.blue, p.cyan, p.purple, p.blue, p.cyan, p.purple, p.cyan];
  const accent = accents[index];
  const common = `
    <g opacity=".34" stroke="${accent}" fill="none">
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${370 + i * 125} 790 L${cx} 350 L${1530 - i * 90} 790"/>`).join("")}
      ${Array.from({ length: 7 }, (_, i) => `<path d="M330 ${500 + i * 48} H1530"/>`).join("")}
    </g>
    <path d="M560 665 930 450 1320 666 944 874Z" fill="url(#platform)" stroke="${accent}" stroke-opacity=".7"/>
    <path d="M560 665 944 874 944 900 560 693Z" fill="#08080C"/>
    <path d="M944 874 1320 666 1320 696 944 900Z" fill="#11111A"/>`;
  const motifs = [
    `<g filter="url(#glow)"><path d="M720 640V408l206-118 210 120v235L930 764Z" fill="#11111A" stroke="${accent}" stroke-width="4"/><path d="M760 626V438l166-94 169 97v188L930 725Z" fill="url(#glass)" stroke="${p.cyan}" stroke-opacity=".65"/><rect x="805" y="454" width="108" height="70" rx="8" fill="${p.blue}" opacity=".45"/><rect x="944" y="422" width="106" height="115" rx="8" fill="${p.purple}" opacity=".42"/><circle cx="927" cy="599" r="47" fill="${p.cyan}" opacity=".2" stroke="${p.cyan}"/></g>`,
    `<g filter="url(#glow)"><path d="M690 639 690 446 920 319 1160 456 1160 648 930 783Z" fill="#11111A" stroke="${accent}" stroke-width="4"/><g fill="url(#card)" stroke="${p.cyan}" stroke-opacity=".55"><rect x="746" y="441" width="142" height="91" rx="10"/><rect x="923" y="397" width="159" height="106" rx="10"/><rect x="808" y="568" width="213" height="94" rx="10"/></g><path d="M768 497c45-50 73 34 105-18M946 455l32-20 27 21 47-39" fill="none" stroke="${p.cyan}" stroke-width="5"/></g>`,
    `<g filter="url(#glow)"><path d="M686 660V432l240-137 246 142v229L931 805Z" fill="#101018" stroke="${accent}" stroke-width="4"/><rect x="730" y="445" width="176" height="121" rx="14" fill="url(#glass)" stroke="${p.purple}"/><rect x="942" y="393" width="178" height="138" rx="14" fill="url(#glass)" stroke="${p.cyan}"/><circle cx="803" cy="504" r="29" fill="${p.cyan}" opacity=".65"/><path d="M967 446h118M967 472h76" stroke="${p.text}" stroke-opacity=".45" stroke-width="8"/><g fill="${p.purple}"><circle cx="804" cy="616" r="18"/><rect x="844" y="595" width="86" height="41" rx="20"/><rect x="951" y="590" width="114" height="50" rx="12"/></g></g>`,
    `<g filter="url(#glow)"><g stroke="${accent}" stroke-width="3"><path d="M688 616 831 532 977 616 833 702Z" fill="#171729"/><path d="M832 533V386l145 84v146" fill="#11111A"/><path d="M832 386 978 302 1125 387 977 471Z" fill="${p.blue}" opacity=".5"/><path d="M978 470V616l147-84V387" fill="#141421"/><path d="M946 726 1092 642 1238 726 1093 811Z" fill="${p.purple}" opacity=".42"/></g><g fill="${p.cyan}"><rect x="854" y="424" width="8" height="56"/><rect x="878" y="408" width="8" height="83"/><rect x="902" y="433" width="8" height="47"/></g></g>`,
    `<g filter="url(#glow)">${[0,1,2].map((n) => `<g transform="translate(${690+n*170} ${450-n*38})"><path d="M0 60 75 16l76 44v146l-75 44L0 207Z" fill="url(#glass)" stroke="${n===1?p.cyan:accent}" stroke-width="3"/><rect x="27" y="85" width="97" height="71" rx="9" fill="${n===1?p.blue:p.purple}" opacity=".42"/><circle cx="75" cy="185" r="12" fill="${p.cyan}"/></g>`).join("")}<path d="M760 723c137-98 282-93 409-6" fill="none" stroke="${p.cyan}" stroke-width="5" stroke-dasharray="12 14"/></g>`,
    `<g filter="url(#glow)"><circle cx="933" cy="548" r="182" fill="#101018" stroke="${accent}" stroke-width="4"/><circle cx="933" cy="548" r="132" fill="url(#glass)" stroke="${p.cyan}" stroke-opacity=".6"/><circle cx="933" cy="548" r="62" fill="${accent}" opacity=".3"/><path d="M933 548 1024 468" stroke="${p.cyan}" stroke-width="10" stroke-linecap="round"/><g fill="${p.text}" opacity=".7"><circle cx="933" cy="390" r="7"/><circle cx="1090" cy="548" r="7"/><circle cx="933" cy="706" r="7"/><circle cx="775" cy="548" r="7"/></g><rect x="704" y="699" width="142" height="52" rx="12" fill="${p.purple}" opacity=".45"/><rect x="1020" y="699" width="142" height="52" rx="12" fill="${p.blue}" opacity=".45"/></g>`,
    `<g filter="url(#glow)"><path d="M667 671V422l264-150 270 155v251L934 833Z" fill="#101018" stroke="${accent}" stroke-width="4"/><g fill="url(#glass)" stroke="${p.cyan}" stroke-opacity=".65"><rect x="716" y="432" width="178" height="148" rx="12"/><rect x="936" y="376" width="213" height="173" rx="12"/><rect x="786" y="611" width="264" height="103" rx="12"/></g><path d="M747 535 800 481l38 30 39-48M965 497l50-64 36 32 64-79" fill="none" stroke="${p.cyan}" stroke-width="7"/></g>`,
    `<g filter="url(#glow)"><ellipse cx="936" cy="666" rx="254" ry="88" fill="${accent}" opacity=".12"/><path d="M790 701V440c0-97 65-176 145-176s145 79 145 176v261" fill="none" stroke="${accent}" stroke-width="35"/><path d="M840 702V453c0-64 43-116 95-116s95 52 95 116v249" fill="none" stroke="${p.cyan}" stroke-width="7"/><circle cx="935" cy="516" r="91" fill="url(#glass)" stroke="${p.cyan}" stroke-width="3"/><circle cx="935" cy="516" r="35" fill="${p.text}" opacity=".85"/><path d="M935 481v70M900 516h70" stroke="${accent}" stroke-width="9"/></g>`
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img">
  <defs>
    <radialGradient id="bg" cx="62%" cy="45%" r="68%"><stop offset="0" stop-color="${accent}" stop-opacity=".21"/><stop offset=".5" stop-color="${p.surface}"/><stop offset="1" stop-color="${p.background}"/></radialGradient>
    <linearGradient id="platform" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.surface}"/><stop offset=".6" stop-color="${accent}" stop-opacity=".22"/><stop offset="1" stop-color="${p.blue}" stop-opacity=".2"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.text}" stop-opacity=".12"/><stop offset="1" stop-color="${accent}" stop-opacity=".08"/></linearGradient>
    <linearGradient id="card"><stop stop-color="${p.surface}"/><stop offset="1" stop-color="${accent}" stop-opacity=".28"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <circle cx="1330" cy="130" r="210" fill="${accent}" opacity=".06"/>
  <circle cx="420" cy="720" r="270" fill="${p.blue}" opacity=".05"/>
  ${common}
  ${motifs[index]}
  <g fill="${p.text}">${Array.from({ length: 28 }, (_, i) => `<circle cx="${70 + ((i * 149) % 1450)}" cy="${45 + ((i * 83) % 620)}" r="${i % 5 === 0 ? 2.2 : 1}" opacity="${i % 3 === 0 ? .45 : .2}"/>`).join("")}</g>
</svg>`;
}

await mkdir(path.join(root, "pt"), { recursive: true });
await mkdir(path.join(root, "en"), { recursive: true });
await mkdir(path.join(root, "assets/scenes"), { recursive: true });
await writeFile(path.join(root, "pt/index.html"), page(locales.pt));
await writeFile(path.join(root, "en/index.html"), page(locales.en));

await Promise.all(locales.pt.world.scenes.map((scene, index) =>
  writeFile(path.join(root, `assets/scenes/${scene.id}.svg`), sceneSvg(scene.id, index))
));

const rootPage = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow"><title>${esc(site.brand.name)}</title>
<link rel="icon" href="./assets/brand/standloud-symbol.svg" type="image/svg+xml" sizes="any">
<link rel="alternate" hreflang="pt-BR" href="./pt/"><link rel="alternate" hreflang="en" href="./en/">
<style>html{background:${site.palette.background};color:${site.palette.text};font-family:system-ui}body{min-height:100vh;display:grid;place-items:center;margin:0}a{color:${site.palette.cyan}}</style>
<script>
  (() => {
    const saved = localStorage.getItem("standloud-language");
    const detected = (navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "en";
    const language = saved || detected;
    location.replace("./" + language + "/");
  })();
</script></head><body><noscript><p><a href="./pt/">Português</a> · <a href="./en/">English</a></p></noscript></body></html>`;
await writeFile(path.join(root, "index.html"), rootPage);

console.log("Built PT/EN pages and 8 local scene placeholders.");
