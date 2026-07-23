import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(await readFile(path.join(root, "config/site.json"), "utf8"));
const locales = {
  pt: JSON.parse(await readFile(path.join(root, "content/pt.json"), "utf8")),
  en: JSON.parse(await readFile(path.join(root, "content/en.json"), "utf8"))
};
const labLocales = {
  pt: JSON.parse(await readFile(path.join(root, "content/lab/pt.json"), "utf8")),
  en: JSON.parse(await readFile(path.join(root, "content/lab/en.json"), "utf8"))
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

function routeHref(locale, key) {
  const route = site.routes[key];
  if (!route) throw new Error(`Unknown route: ${key}`);
  return route.implemented ? route[locale.locale] : route.fallback;
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
            <h2 id="scroll-proof-title">${esc(proof.title)}</h2>
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
                  <a class="nexora-button nexora-button--secondary" href="#projects">${esc(landing.secondary)}</a>
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

function heroSection(locale) {
  return `<section class="commercial-hero section-shell" id="hero" aria-labelledby="hero-title">
    <div class="commercial-hero__copy">
      <p class="eyebrow">${esc(locale.hero.eyebrow)}</p>
      <h1 id="hero-title">${esc(locale.hero.title)}</h1>
      <p class="commercial-hero__body">${esc(locale.hero.body)}</p>
      <div class="button-row">
        <a class="button button--primary" href="#diagnostic">${esc(locale.hero.primary)}<span aria-hidden="true">↗</span></a>
        <a class="button button--ghost" href="#projects">${esc(locale.hero.secondary)}</a>
      </div>
      <p class="commercial-hero__micro"><i aria-hidden="true"></i>${esc(locale.hero.micro)}</p>
      <p class="commercial-hero__proof">${esc(locale.hero.proof)}</p>
    </div>
    <div class="commercial-hero__visual" aria-hidden="true">
      <div class="hero-browser">
        <div class="hero-browser__bar"><i></i><i></i><i></i><span>standloud.studio</span></div>
        <div class="hero-browser__canvas">
          <span class="hero-browser__eyebrow">STANDLOUD / PROCESS</span>
          <div class="hero-process">
            ${locale.hero.visual.map((step, index) => `<article class="hero-process__step" style="--step:${index}">
              <span>${esc(step.number)} / ${esc(step.label)}</span>
              <strong>${esc(step.body)}</strong>
            </article>`).join("")}
          </div>
          <div class="hero-process__rail">
            ${locale.hero.visual.map((step, index) => `<span style="--step:${index}"><i></i>${esc(step.number)} / ${esc(step.label)}</span>`).join("")}
          </div>
          <div class="hero-browser__signal"><i></i><i></i><i></i></div>
        </div>
      </div>
      <span class="hero-orbit hero-orbit--a"></span>
      <span class="hero-orbit hero-orbit--b"></span>
    </div>
  </section>`;
}

function quickProofSection(locale) {
  return `<section class="quick-proof section-shell" aria-labelledby="quick-proof-title">
    <div class="section-heading reveal">
      <div><p class="eyebrow">${esc(locale.quickProof.eyebrow)}</p><h2 id="quick-proof-title">${esc(locale.quickProof.title)}</h2></div>
      <p>${esc(locale.quickProof.process)}</p>
    </div>
    <div class="quick-proof__grid">
      ${locale.quickProof.items.map((item, index) => `<article class="proof-card reveal">
        <span>0${index + 1}</span>
        <p class="eyebrow">${esc(item.type)}</p>
        <h3>${esc(item.name)}</h3>
        <p>${esc(item.body)}</p>
      </article>`).join("")}
    </div>
  </section>`;
}

function problemsSection(locale) {
  return `<section class="problems section-shell" aria-labelledby="problems-title">
    <div class="problems__heading reveal">
      <p class="eyebrow">${esc(locale.problems.eyebrow)}</p>
      <h2 id="problems-title">${esc(locale.problems.title)}</h2>
    </div>
    <ol class="problems__list">
      ${locale.problems.items.map((item, index) => `<li class="reveal"><span>0${index + 1}</span><p>${esc(item)}</p></li>`).join("")}
    </ol>
  </section>`;
}

function servicesSection(locale) {
  return `<section class="services-commercial section-shell" id="services" aria-labelledby="services-title">
    <div class="section-heading reveal">
      <div><p class="eyebrow">${esc(locale.services.eyebrow)}</p><h2 id="services-title">${esc(locale.services.title)}</h2></div>
      <p>${esc(locale.services.body)}</p>
    </div>
    <div class="service-offers">
      ${locale.services.items.map((item, index) => `<article class="service-offer reveal">
        <div class="service-offer__top"><span>0${index + 1}</span><i aria-hidden="true"></i></div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.body)}</p>
        <ul>${item.deliverables.map((deliverable) => `<li>${esc(deliverable)}</li>`).join("")}</ul>
        <a href="#contact" data-service-choice="${attr(item.title)}">${esc(item.cta)}<span aria-hidden="true">↗</span></a>
      </article>`).join("")}
    </div>
  </section>`;
}

function projectsSection(locale) {
  const routeKeys = {
    nuppac: "projectNuppac",
    lumina: "projectLumina",
    nexora: "projectNexora"
  };
  return `<section class="projects-commercial section-shell" id="projects" aria-labelledby="projects-title">
    <div class="section-heading reveal">
      <div><p class="eyebrow">${esc(locale.projects.eyebrow)}</p><h2 id="projects-title">${esc(locale.projects.title)}</h2></div>
      <p>${esc(locale.projects.body)}</p>
    </div>
    <div class="project-showcase">
      ${locale.projects.items.map((item, index) => `<article class="commercial-project commercial-project--${attr(item.id)} reveal">
        <div class="commercial-project__visual" aria-hidden="true">
          <span>0${index + 1}</span><i></i><i></i><i></i>
        </div>
        <div class="commercial-project__content">
          <p class="eyebrow">${esc(item.type)}</p>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.body)}</p>
          <ul>${item.scope.map((scope) => `<li>${esc(scope)}</li>`).join("")}</ul>
          <a href="${attr(routeHref(locale, routeKeys[item.id]))}">${esc(locale.projects.linkLabel)}<span aria-hidden="true">↗</span></a>
        </div>
      </article>`).join("")}
    </div>
  </section>`;
}

function processSection(locale) {
  return `<section class="process-commercial section-shell" id="process" aria-labelledby="process-title">
    <div class="section-heading reveal">
      <div><p class="eyebrow">${esc(locale.process.eyebrow)}</p><h2 id="process-title">${esc(locale.process.title)}</h2></div>
      <p>${esc(locale.process.body)}</p>
    </div>
    <ol class="process-commercial__list">
      ${locale.process.steps.map((step) => `<li class="reveal">
        <span>${esc(step.number)}</span><h3>${esc(step.title)}</h3><p>${esc(step.body)}</p>
      </li>`).join("")}
    </ol>
  </section>`;
}

function caseStudySection(locale) {
  const caseStudy = locale.caseStudy;
  return `<section class="case-study section-shell" id="case-nuppac" aria-labelledby="case-title">
    <div class="case-study__header reveal">
      <p class="eyebrow">${esc(caseStudy.eyebrow)}</p>
      <h2 id="case-title">${esc(caseStudy.title)}</h2>
      <p>${esc(caseStudy.intro)}</p>
    </div>
    <div class="case-study__body">
      <div class="case-study__visual reveal" aria-hidden="true">
        <div class="case-window"><span>NUPPAC</span><i></i><i></i><i></i></div>
      </div>
      <div class="case-study__details">
        ${caseStudy.facts.map((fact) => `<article class="reveal"><h3>${esc(fact.label)}</h3><p>${esc(fact.body)}</p></article>`).join("")}
      </div>
    </div>
    <div class="case-study__footer reveal">
      <ul>${caseStudy.deliverables.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      <a class="button button--primary" href="#contact" data-service-choice="${attr(locale.services.items[1].title)}">${esc(caseStudy.cta)}<span aria-hidden="true">↗</span></a>
    </div>
  </section>`;
}

function differentialsSection(locale) {
  return `<section class="differentials section-shell" aria-labelledby="differentials-title">
    <div class="differentials__intro reveal">
      <p class="eyebrow">${esc(locale.differentials.eyebrow)}</p>
      <h2 id="differentials-title">${esc(locale.differentials.title)}</h2>
    </div>
    <ol class="differentials__list">
      ${locale.differentials.items.map((item, index) => `<li class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></li>`).join("")}
    </ol>
  </section>`;
}

function aboutSection(locale) {
  return `<section class="about section-shell" id="about" aria-labelledby="about-title">
    <div class="about__mark reveal" aria-hidden="true">${standloudSymbol("about", "about__symbol")}</div>
    <div class="about__copy reveal">
      <p class="eyebrow">${esc(locale.about.eyebrow)}</p>
      <h2 id="about-title">${esc(locale.about.title)}</h2>
      <p>${esc(locale.about.body)}</p>
      <strong>${esc(locale.about.signature)}</strong>
    </div>
  </section>`;
}

function diagnosticSection(locale) {
  return `<section class="diagnostic section-shell" id="diagnostic" aria-labelledby="diagnostic-title">
    <div class="diagnostic__panel reveal">
      <div>
        <p class="eyebrow">${esc(locale.diagnostic.eyebrow)}</p>
        <h2 id="diagnostic-title">${esc(locale.diagnostic.title)}</h2>
        <p>${esc(locale.diagnostic.body)}</p>
      </div>
      <a class="button button--primary" href="#contact">${esc(locale.diagnostic.cta)}<span aria-hidden="true">↗</span></a>
    </div>
  </section>`;
}

function faqSection(locale) {
  return `<section class="faq section-shell" id="faq">
    <div class="faq__heading reveal"><p class="eyebrow">${esc(locale.faq.eyebrow)}</p><h2>${esc(locale.faq.title)}</h2></div>
    <div class="faq-list">
      ${locale.faq.items.map(([question, answer], index) => `<details class="reveal"${index === 0 ? " open" : ""}><summary><span>${esc(question)}</span><i aria-hidden="true"></i></summary><p>${esc(answer)}</p></details>`).join("")}
    </div>
  </section>`;
}

function contactSection(locale) {
  const labels = locale.contact.labels;
  return `<section class="contact section-shell" id="contact" aria-labelledby="contact-title">
    <div class="contact__shell">
      <div class="contact__intro reveal">
        <p class="eyebrow">${esc(locale.contact.eyebrow)}</p>
        <h2 id="contact-title">${esc(locale.contact.title)}</h2>
        <p>${esc(locale.contact.body)}</p>
        <div class="availability"><i></i>${esc(locale.contact.availability)}</div>
      </div>
      <form class="quote-form reveal" data-demo-form data-min-submit-delay="1600" novalidate>
        <div class="field"><label for="name">${esc(labels.name)}</label><input id="name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="contact-channel">${esc(labels.contact)}</label><input id="contact-channel" name="contact" autocomplete="email" required></div>
        <div class="field field--wide"><label for="business">${esc(labels.business)}</label><input id="business" name="business" autocomplete="organization" required></div>
        <div class="field"><label for="service">${esc(labels.service)}</label><select id="service" name="service" required>${options(locale.contact.serviceOptions)}</select></div>
        <div class="field"><label for="budget">${esc(labels.budget)}</label><select id="budget" name="budget" required>${options(locale.contact.budgetOptions)}</select></div>
        <div class="field field--wide"><label for="current-link">${esc(labels.currentLink)}</label><input id="current-link" name="currentLink" type="url" inputmode="url" placeholder="https://"></div>
        <div class="field field--wide"><label for="message">${esc(labels.message)}</label><textarea id="message" name="message" rows="5" minlength="20" required></textarea></div>
        <div class="field field--trap" aria-hidden="true"><label for="website-confirmation">${esc(labels.honeypot)}</label><input id="website-confirmation" name="website" tabindex="-1" autocomplete="off"></div>
        <button class="button button--primary form-submit" type="submit">${esc(labels.submit)}<span aria-hidden="true">↗</span></button>
        <p class="form-status" role="status" aria-live="polite" data-form-status
          data-loading="${attr(locale.contact.loading)}" data-success="${attr(locale.contact.success)}"
          data-error="${attr(locale.contact.error)}"></p>
      </form>
    </div>
  </section>`;
}

const homeSceneRenderers = {
  lumina: scrollProof,
  brandGravity
};

function configuredScene(locale, id) {
  const scene = site.home.scenes.find((item) => item.id === id);
  if (!scene || !scene.enabled) return "";
  const renderer = homeSceneRenderers[id];
  if (!renderer) throw new Error(`Enabled Home scene has no renderer: ${id}`);
  const intro = locale.animationIntros[id];
  const afterHref = id === "lumina" ? "#process" : "#diagnostic";
  return `<div class="scene-experience scene-experience--${attr(id)}">
    <section class="scene-intro section-shell" aria-labelledby="${attr(id)}-intro-title">
      <p class="eyebrow">${esc(intro.eyebrow)}</p>
      <h2 id="${attr(id)}-intro-title">${esc(intro.title)}</h2>
      <p>${esc(intro.body)}</p>
    </section>
    ${renderer(locale)}
    <div class="scene-outro section-shell">
      <a class="button button--ghost" href="${afterHref}">${esc(intro.afterCta)}<span aria-hidden="true">↗</span></a>
    </div>
  </div>`;
}

function renderHome(locale) {
  if (site.home.scenes.length > site.home.maxScenes || site.home.maxScenes > 4) {
    throw new Error("Home supports a maximum of four configured scenes");
  }
  const sectionRenderers = {
    hero: heroSection,
    quickProof: quickProofSection,
    problems: problemsSection,
    services: servicesSection,
    projects: projectsSection,
    process: processSection,
    "case:nuppac": caseStudySection,
    differentials: differentialsSection,
    about: aboutSection,
    diagnostic: diagnosticSection,
    faq: faqSection,
    contact: contactSection
  };
  return site.home.sectionOrder.map((sectionId) => {
    if (sectionId.startsWith("scene:")) return configuredScene(locale, sectionId.slice(6));
    const renderer = sectionRenderers[sectionId];
    if (!renderer) throw new Error(`Unknown Home section: ${sectionId}`);
    return renderer(locale);
  }).join("\n");
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
      <a href="#projects">${esc(locale.nav.projects)}</a>
      <a href="#services">${esc(locale.nav.services)}</a>
      <a href="#process">${esc(locale.nav.process)}</a>
      <a href="#about">${esc(locale.nav.about)}</a>
      <a href="#contact">${esc(locale.nav.contact)}</a>
    </nav>
    <div class="header-actions">
      <div class="language-switcher" aria-label="${isPt ? "Selecionar idioma" : "Choose language"}">
        <span aria-current="page">${isPt ? "PT" : "EN"}</span>
        <i aria-hidden="true">|</i>
        <a href="${otherHref}" data-language="${otherLocale.toLowerCase()}">${otherLocale}</a>
      </div>
      <a class="header-cta" href="#diagnostic">${esc(locale.nav.diagnostic)}<span aria-hidden="true">↗</span></a>
    </div>
  </header>

  <main id="main">
    <div id="top" aria-hidden="true"></div>
    ${renderHome(locale)}
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
      <div class="footer-navigation">
        <nav aria-label="${isPt ? "Links principais" : "Main links"}">
          <a href="#projects">${esc(locale.nav.projects)}</a>
          <a href="#services">${esc(locale.nav.services)}</a>
          <a href="#process">${esc(locale.nav.process)}</a>
          <a href="#about">${esc(locale.nav.about)}</a>
          <a href="#contact">${esc(locale.nav.contact)}</a>
        </nav>
        <a class="footer-back" href="#top">${esc(locale.footer.back)} ↑</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year></span> ${esc(site.brand.legalName)}. ${esc(locale.footer.legal)}</span>
      <nav aria-label="${attr(locale.footer.social)}">${socialLinks.map(([name, href]) =>
        href === "#"
          ? `<span aria-disabled="true">${esc(name)}</span>`
          : `<a href="${attr(href)}">${esc(name)}</a>`
      ).join("")}</nav>
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

await Promise.all(labLocales.pt.world.scenes.map((scene, index) =>
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

console.log("Built PT/EN commercial Home and preserved 8 Lab scene assets.");
