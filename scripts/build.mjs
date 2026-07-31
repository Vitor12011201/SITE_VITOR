import { access, mkdir, readFile, writeFile } from "node:fs/promises";
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
const siteUrl = new URL(site.site.baseUrl).href.replace(/\/$/, "");
const projectImageRoot = path.join(root, "assets/images");
const nuppacComparison = site.projectAssets?.nuppac?.comparison || {};

async function projectImageExists(relativePath) {
  if (!relativePath) return false;
  const resolved = path.resolve(root, relativePath);
  if (resolved !== projectImageRoot && !resolved.startsWith(`${projectImageRoot}${path.sep}`)) {
    return false;
  }
  try {
    await access(resolved);
    return true;
  } catch {
    return false;
  }
}

const nuppacComparisonReady = Boolean(
  await projectImageExists(nuppacComparison.previous) &&
  await projectImageExists(nuppacComparison.newDirection)
);

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

function projectClass(id) {
  return id.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function featuredProject(locale, id) {
  const project = locale.featuredProjects?.find((item) => item.id === id);
  if (!project) throw new Error(`Unknown featured project: ${id}`);
  return project;
}

function heroTitle(locale) {
  const lines = locale.hero.titleLines || [
    locale.hero.titleLead,
    locale.hero.titleHighlight
  ];
  return lines.map((line, index) => {
    const accent = index >= lines.length - 2 ? " hero-title-accent" : "";
    return `<span class="hero-title-line${accent}">${esc(line)}</span>`;
  }).join("");
}

function projectVisual(project) {
  if (project.id === "aquaform") {
    return `<figure class="project-site__visual project-site__visual--car" aria-hidden="true">
      <svg viewBox="0 0 420 180" focusable="false">
        <path d="M55 116C73 78 112 53 174 49h75c38 0 67 20 94 62l34 5c18 3 30 18 27 35H32c-3-20 5-31 23-35Z"/>
        <path d="M128 58 102 97h196l-43-38Z"/>
        <circle cx="116" cy="150" r="22"/><circle cx="318" cy="150" r="22"/>
      </svg>
      <i></i><b></b><em></em>
    </figure>`;
  }
  if (project.id === "brasa27") {
    return `<figure class="project-site__visual project-site__visual--plate" aria-hidden="true">
      <span></span><i></i><i></i><i></i><b></b><em></em>
    </figure>`;
  }
  return `<figure class="project-site__visual project-site__visual--law" aria-hidden="true">
    <svg viewBox="0 0 360 260" focusable="false">
      <path d="M58 204h244M86 178h188M112 151h126M80 56h204v122H80Z"/>
      <path d="M106 137 166 86l42 36 48-54"/>
      <circle cx="166" cy="86" r="6"/><circle cx="208" cy="122" r="6"/><circle cx="256" cy="68" r="6"/>
    </svg>
    <i></i><b></b>
  </figure>`;
}

function projectSite(project, options = {}) {
  const compact = options.compact ? " project-site--compact" : "";
  const className = projectClass(project.id);
  return `<article class="project-site project-site--${attr(className)}${compact}">
    <header class="project-site__nav">
      <a href="#${attr(project.anchor)}" class="project-site__brand">${esc(project.shortName)}</a>
      <nav aria-label="${attr(project.shortName)}">${project.nav.map((item) => `<a href="#${attr(project.anchor)}">${esc(item)}</a>`).join("")}</nav>
      <a class="project-site__nav-cta" href="#contact">${esc(project.primary)}</a>
    </header>
    <section class="project-site__hero">
      <div class="project-site__copy">
        <p class="project-site__eyebrow">${esc(project.eyebrow)}</p>
        <h2>${esc(project.title)}</h2>
        <p>${esc(project.body)}</p>
        <div class="project-site__actions">
          <a href="#contact">${esc(project.primary)}</a>
          <a href="#${attr(project.anchor)}-details">${esc(project.secondary)}</a>
        </div>
      </div>
      ${projectVisual(project)}
    </section>
    <section class="project-site__details" id="${attr(project.anchor)}-details" aria-label="${attr(project.segment)}">
      ${project.services.slice(0, options.compact ? 4 : project.services.length).map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(item)}</h3></article>`).join("")}
    </section>
    <section class="project-site__conversion">
      <div><strong>${esc(project.signature)}</strong><span>${esc(project.hours)}</span><small>${esc(project.notice)}</small></div>
      <a href="#contact">${esc(project.planCta)}</a>
    </section>
  </article>`;
}

function projectPreviewFeature(locale, project) {
  const isPt = locale.locale === "pt";
  if (project.id === "aquaform") {
    return `<div class="preview-before-after"><i></i><b></b></div><p>${isPt ? "Antes / depois técnico" : "Technical before / after"}</p>`;
  }
  if (project.id === "brasa27") {
    return `<div class="preview-reservation"><span>${isPt ? "Data" : "Date"}</span><span>${isPt ? "Horário" : "Time"}</span><span>${isPt ? "Pessoas" : "Guests"}</span></div><p>${isPt ? "Reserva sem atrito" : "Frictionless booking"}</p>`;
  }
  return `<div class="preview-route"><i></i><i></i><i></i></div><p>${isPt ? "Direção clara" : "Clear direction"}</p>`;
}

function projectPreviewSite(locale, project) {
  const className = projectClass(project.id);
  const services = project.services.slice(0, project.id === "atlasVale" ? 6 : 4);
  const plans = project.plans.slice(0, 4);
  return `<article class="project-preview-site project-preview-site--${attr(className)}" aria-hidden="true">
    <header class="preview-navbar">
      <strong>${esc(project.shortName)}</strong>
      <nav>${project.nav.slice(0, 4).map((item) => `<span>${esc(item)}</span>`).join("")}</nav>
      <a href="#${attr(project.anchor)}" tabindex="-1">${esc(project.primary)}</a>
    </header>
    <section class="preview-hero">
      <div>
        <p>${esc(project.eyebrow)}</p>
        <h2>${esc(project.title)}</h2>
        <span>${esc(project.primary)}</span>
      </div>
      ${projectVisual(project)}
    </section>
    <section class="preview-services">
      ${services.map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(item)}</h3></article>`).join("")}
    </section>
    <section class="preview-feature">${projectPreviewFeature(locale, project)}</section>
    <section class="preview-content-grid">
      ${plans.map((item) => `<article>${esc(item)}</article>`).join("")}
    </section>
    <section class="preview-final-cta">
      <strong>${esc(project.signature)}</strong>
      <span>${esc(project.planCta)}</span>
    </section>
    <footer class="preview-footer"><span>${esc(project.location)}</span><span>${esc(project.hours)}</span></footer>
  </article>`;
}

function selectedWorkPreview(locale, project) {
  return `<div class="work-preview work-preview--${attr(projectClass(project.id))}">
    ${projectPreviewSite(locale, project)}
  </div>`;
}

function selectedWorkSlide(locale, item, index) {
  const project = featuredProject(locale, item.id);
  const active = index === 0;
  return `<article class="selected-work__slide selected-work__slide--${attr(item.id)}${active ? " is-active" : ""}"
            id="selected-work-${attr(locale.locale)}-${index + 1}"
            data-selected-work-slide
            data-address="${attr(item.address)}"
            data-href="${attr(item.href)}"
            aria-hidden="${active ? "false" : "true"}"${active ? "" : " inert"}>
            <div class="selected-work__preview">${selectedWorkPreview(locale, project)}</div>
          </article>`;
}

function heroSection(locale) {
  return `<section class="commercial-hero section-shell" id="hero" aria-labelledby="hero-title">
    <div class="commercial-hero__copy">
      <p class="eyebrow">${esc(locale.hero.eyebrow)}</p>
      <h1 id="hero-title" class="hero-title">${heroTitle(locale)}</h1>
      <p class="commercial-hero__body">${esc(locale.hero.body)}</p>
      <div class="button-row">
        <a class="button button--primary" href="#contact">${esc(locale.hero.primary)}<span aria-hidden="true">↗</span></a>
        <a class="button button--ghost" href="#projects">${esc(locale.hero.secondary)}</a>
      </div>
      <p class="commercial-hero__micro"><i aria-hidden="true"></i>${esc(locale.hero.micro)}</p>
    </div>
    <div class="commercial-hero__visual">
      <section class="project-showcase selected-work" data-selected-work aria-label="${attr(locale.hero.carouselLabel)}">
        <div class="project-browser hero-browser">
          <div class="hero-browser__bar" aria-hidden="true"><i></i><i></i><i></i><span data-selected-work-address>${esc(locale.hero.visual[0].address)}</span></div>
          <div class="hero-browser__canvas">
          <div class="selected-work__viewport">
            ${locale.hero.visual.map((item, index) => selectedWorkSlide(locale, item, index)).join("")}
          </div>
          </div>
        </div>
        <div class="project-action">
          <a class="button button--primary selected-work__link" data-selected-work-action href="${attr(locale.hero.visual[0].href)}">${esc(locale.hero.viewProject)}<span aria-hidden="true">↗</span></a>
        </div>
        <div class="project-carousel-controls">
          <button class="selected-work__arrow" type="button" data-selected-work-prev aria-label="${attr(locale.hero.previousProject)}">‹</button>
          <div class="selected-work__dots" role="tablist" aria-label="${attr(locale.hero.carouselLabel)}">
            ${locale.hero.visual.map((item, index) => `<button type="button"
              class="selected-work__dot${index === 0 ? " is-active" : ""}"
              data-selected-work-dot="${index}"
              role="tab"
              aria-selected="${index === 0 ? "true" : "false"}"
              aria-controls="selected-work-${attr(locale.locale)}-${index + 1}"
              aria-label="${attr(item.name)}"></button>`).join("")}
          </div>
          <button class="selected-work__arrow" type="button" data-selected-work-next aria-label="${attr(locale.hero.nextProject)}">›</button>
        </div>
      </section>
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
  const labels = locale.projects.labels;
  return `<section class="projects-commercial section-shell" id="projects" aria-labelledby="projects-title">
    <div class="section-heading reveal">
      <div><p class="eyebrow">${esc(locale.projects.eyebrow)}</p><h2 id="projects-title">${esc(locale.projects.title)}</h2></div>
      <p>${esc(locale.projects.body)}</p>
    </div>
    <div class="project-card-showcase">
      ${locale.projects.items.map((item, index) => `<article class="commercial-project commercial-project--${attr(projectClass(item.id))} reveal" id="${attr(item.anchor)}">
        ${item.id === "nuppac"
          ? nuppacComparisonVisual(locale, item)
          : `<div class="commercial-project__visual" id="${attr(item.anchor)}-visual" aria-hidden="true">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <strong>${esc(item.name)}</strong>
              <i></i><i></i><i></i>
            </div>`}
        <div class="commercial-project__content">
          <p class="eyebrow">${esc(item.type)}</p>
          <h3>${esc(item.name)}</h3>
          <p class="commercial-project__segment">${esc(item.segment)}</p>
          <dl class="commercial-project__decisions">
            <div><dt>${esc(labels.context)}</dt><dd>${esc(item.context)}</dd></div>
            <div><dt>${esc(labels.direction)}</dt><dd>${esc(item.direction)}</dd></div>
          </dl>
          <a href="#${attr(item.anchor)}-visual">${esc(item.linkLabel)}<span aria-hidden="true">↗</span></a>
        </div>
      </article>`).join("")}
    </div>
  </section>`;
}

function nuppacComparisonVisual(locale, item) {
  const copy = locale.projects.comparison;
  const width = Number(nuppacComparison.width) || 1440;
  const height = Number(nuppacComparison.height) || 900;
  const media = (kind) => {
    const isPrevious = kind === "previous";
    if (!nuppacComparisonReady) {
      return `<div class="image-comparison__placeholder" aria-hidden="true"></div>`;
    }
    const src = isPrevious ? nuppacComparison.previous : nuppacComparison.newDirection;
    const alt = isPrevious ? copy.beforeAlt : copy.afterAlt;
    return `<img src="../${attr(src)}" alt="${attr(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async" draggable="false">`;
  };

  return `<div class="commercial-project__visual commercial-project__visual--comparison">
    <i class="commercial-project__legacy-shape" aria-hidden="true"></i>
    <i class="commercial-project__legacy-shape" aria-hidden="true"></i>
    <i class="commercial-project__legacy-shape" aria-hidden="true"></i>
    <div class="image-comparison${nuppacComparisonReady ? " has-assets" : " is-placeholder"}"
      id="${attr(item.anchor)}-visual"
      data-image-comparison
      data-comparison-assets="${nuppacComparisonReady ? "ready" : "pending"}"
      data-comparison-label="${attr(copy.label)}"
      data-before-label="${attr(copy.before)}"
      data-after-label="${attr(copy.after)}"
      style="--compare-position:50%">
      <div class="image-comparison__layer image-comparison__layer--after">${media("after")}</div>
      <div class="image-comparison__layer image-comparison__layer--before">${media("previous")}</div>
      <span class="image-comparison__label image-comparison__label--before"><strong>${esc(copy.before)}</strong>${nuppacComparisonReady ? "" : `<small>${esc(copy.pending)}</small>`}</span>
      <span class="image-comparison__label image-comparison__label--after"><strong>${esc(copy.after)}</strong>${nuppacComparisonReady ? "" : `<small>${esc(copy.pending)}</small>`}</span>
      <span class="image-comparison__divider" aria-hidden="true"></span>
      <span class="image-comparison__handle" aria-hidden="true"><b>←</b><b>→</b></span>
      <p class="image-comparison__fallback">${esc(copy.fallback)}</p>
    </div>
  </div>`;
}

function processSection(locale) {
  return `<section class="process-commercial section-shell" id="process" aria-labelledby="process-title">
    <div class="section-heading reveal">
      <div><p class="eyebrow">${esc(locale.process.eyebrow)}</p><h2 id="process-title">${esc(locale.process.title)}</h2></div>
      <p>${esc(locale.process.body)}</p>
    </div>
    <aside class="process-principle reveal">
      <strong>${esc(locale.process.principle)}</strong>
      <p>${esc(locale.process.principleBody)}</p>
    </aside>
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
  const contactReady = Boolean(site.contact.email);
  return `<section class="contact section-shell" id="contact" aria-labelledby="contact-title">
    <div class="contact__shell">
      <div class="contact__intro reveal">
        <p class="eyebrow">${esc(locale.contact.eyebrow)}</p>
        <h2 id="contact-title">${esc(locale.contact.title)}</h2>
        <p>${esc(locale.contact.body)}</p>
        <div class="availability"><i></i>${esc(locale.contact.availability)}</div>
      </div>
      <form class="quote-form reveal" data-contact-form data-min-submit-delay="1600"
        data-recipient="${attr(site.contact.email)}"
        data-subject="${attr(locale.contact.subject)}"
        action="${contactReady ? `mailto:${attr(site.contact.email)}` : "#contact"}" method="post">
        <div class="field"><label for="name">${esc(labels.name)}</label><input id="name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="contact-channel">${esc(labels.contact)}</label><input id="contact-channel" name="contact" type="email" autocomplete="email" required></div>
        <div class="field field--wide"><label for="business">${esc(labels.business)}</label><input id="business" name="business" autocomplete="organization" required></div>
        <div class="field"><label for="service">${esc(labels.service)}</label><select id="service" name="service" required>${options(locale.contact.serviceOptions)}</select></div>
        <div class="field"><label for="budget">${esc(labels.budget)}</label><select id="budget" name="budget" required>${options(locale.contact.budgetOptions)}</select></div>
        <div class="field field--wide"><label for="current-link">${esc(labels.currentLink)}</label><input id="current-link" name="currentLink" type="url" inputmode="url" placeholder="https://"></div>
        <div class="field field--wide"><label for="message">${esc(labels.message)}</label><textarea id="message" name="message" rows="5" minlength="20" required></textarea></div>
        <div class="field field--trap" aria-hidden="true"><label for="website-confirmation">${esc(labels.honeypot)}</label><input id="website-confirmation" name="website" tabindex="-1" autocomplete="off"></div>
        <button class="button button--primary form-submit" type="submit"${contactReady ? "" : " disabled"}>${esc(labels.submit)}<span aria-hidden="true">↗</span></button>
        <p class="form-status${contactReady ? "" : " is-error"}" role="status" aria-live="polite" data-form-status
          data-loading="${attr(locale.contact.loading)}" data-success="${attr(locale.contact.success)}"
          data-error="${attr(locale.contact.error)}" data-unavailable="${attr(locale.contact.unavailable)}">${contactReady ? "" : esc(locale.contact.unavailable)}</p>
      </form>
    </div>
  </section>`;
}

function commercialProjectScene(locale, id) {
  const project = featuredProject(locale, id);
  const className = projectClass(project.id);
  return `<section class="commercial-project-scene commercial-project-scene--${attr(className)}"
      id="${attr(project.anchor)}"
      data-commercial-project-scene
      aria-labelledby="${attr(project.anchor)}-title"
      tabindex="-1"
      style="--project-progress:0;--project-phase-a:0;--project-phase-b:0;--project-phase-c:0;--project-phase-d:0">
    <div class="commercial-project-scene__stage">
      <div class="commercial-project-scene__intro">
        <p class="eyebrow">${esc(project.badge)}</p>
        <h2 id="${attr(project.anchor)}-title">${esc(project.name)}</h2>
        <p>${esc(project.segment)}. ${esc(project.concept)}</p>
      </div>
      <div class="commercial-project-scene__workspace">
        <div class="project-parts" aria-hidden="true">
          ${project.services.slice(0, 6).map((item, index) => `<span style="--part:${index}">${esc(item)}</span>`).join("")}
        </div>
        <div class="commercial-project-scene__browser">
          <div class="commercial-project-scene__bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(project.shortName.toLowerCase().replaceAll(" ", ""))}.concept</span></div>
          ${projectSite(project)}
        </div>
        <div class="commercial-project-scene__final"><i aria-hidden="true"></i><span>${esc(project.finalMessage)}</span></div>
      </div>
    </div>
  </section>`;
}

const homeSceneRenderers = {
  aquaform: (locale) => commercialProjectScene(locale, "aquaform"),
  brasa27: (locale) => commercialProjectScene(locale, "brasa27"),
  atlasVale: (locale) => commercialProjectScene(locale, "atlasVale")
};

function configuredScene(locale, id) {
  const scene = site.home.scenes.find((item) => item.id === id);
  if (!scene || !scene.enabled) return "";
  const renderer = homeSceneRenderers[id];
  if (!renderer) throw new Error(`Enabled Home scene has no renderer: ${id}`);
  return renderer(locale);
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
  const localePath = isPt ? "/pt/" : "/en/";
  const otherPath = isPt ? "/en/" : "/pt/";
  const canonicalUrl = `${siteUrl}${localePath}`;
  const otherUrl = `${siteUrl}${otherPath}`;
  const brand = site.brand.name;
  const socialLinks = [
    ["Instagram", site.contact.instagramUrl],
    ["LinkedIn", site.contact.linkedinUrl],
    ["Behance", site.contact.behanceUrl]
  ].filter(([, href]) => href);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brand,
    description: locale.seo.description,
    url: canonicalUrl,
    areaServed: ["Brazil", "International"],
    knowsLanguage: ["Portuguese", "English"],
    ...(site.contact.email ? { email: site.contact.email } : {}),
    ...(socialLinks.length ? { sameAs: socialLinks.map(([, href]) => href) } : {})
  };
  const socialImageUrl = `${siteUrl}/assets/images/standloud-logo-reference.png`;

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
  <meta property="og:url" content="${attr(canonicalUrl)}">
  <meta property="og:site_name" content="${attr(brand)}">
  <meta property="og:locale" content="${isPt ? "pt_BR" : "en_US"}">
  <meta property="og:image" content="${attr(socialImageUrl)}">
  <meta property="og:image:alt" content="${attr(`${brand} — ${site.brand.tagline}`)}">
  <meta property="og:image:width" content="1254">
  <meta property="og:image:height" content="1254">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(`${brand} — ${locale.seo.title}`)}">
  <meta name="twitter:description" content="${attr(locale.seo.description)}">
  <meta name="twitter:image" content="${attr(socialImageUrl)}">
  <link rel="canonical" href="${attr(canonicalUrl)}">
  <link rel="icon" href="../assets/brand/standloud-symbol.svg" type="image/svg+xml" sizes="any">
  <link rel="mask-icon" href="../assets/brand/standloud-symbol-mono.svg" color="#7C3AED">
  <link rel="alternate" hreflang="pt-BR" href="${attr(isPt ? canonicalUrl : otherUrl)}">
  <link rel="alternate" hreflang="en-US" href="${attr(isPt ? otherUrl : canonicalUrl)}">
  <link rel="alternate" hreflang="x-default" href="${attr(`${siteUrl}/pt/`)}">
  <script>document.documentElement.classList.add("js")</script>
  <link rel="stylesheet" href="../assets/css/styles.css">
  <style>:root{${paletteStyle}}</style>
  <title>${esc(brand)} — ${esc(locale.seo.title)}</title>
  <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
</head>
<body data-locale="${attr(locale.locale)}">
  <a class="skip-link" href="#main">${esc(locale.skip)}</a>
  <header class="site-header" data-header>
    <a class="brand brand--header" href="#top" aria-label="${attr(`${brand} — ${site.brand.tagline}`)}">
      ${standloudSymbol("header")}
      <span class="brand__name">${esc(brand)}</span>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav"
      data-open-label="${isPt ? "Abrir menu" : "Open menu"}"
      data-close-label="${isPt ? "Fechar menu" : "Close menu"}">
      <span></span><span></span><span class="sr-only">${isPt ? "Abrir menu" : "Open menu"}</span>
    </button>
    <nav class="primary-nav" id="primary-nav" aria-label="${isPt ? "Navegação principal" : "Primary navigation"}">
      <a href="#projects">${esc(locale.nav.projects)}</a>
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
      <a class="header-cta" href="#contact">${esc(locale.nav.diagnostic)}<span aria-hidden="true">↗</span></a>
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
          <a href="#process">${esc(locale.nav.process)}</a>
          <a href="#about">${esc(locale.nav.about)}</a>
          <a href="#contact">${esc(locale.nav.contact)}</a>
        </nav>
        <a class="footer-back" href="#top">${esc(locale.footer.back)} ↑</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year></span> ${esc(site.brand.legalName)}. ${esc(locale.footer.legal)}</span>
${socialLinks.length ? `      <nav aria-label="${attr(locale.footer.social)}">${socialLinks.map(([name, href]) =>
        `<a href="${attr(href)}">${esc(name)}</a>`
      ).join("")}</nav>` : ""}
      <div class="language-switcher"><a href="../pt/"${isPt ? " aria-current=\"page\"" : ""}>PT</a><i>|</i><a href="../en/"${!isPt ? " aria-current=\"page\"" : ""}>EN</a></div>
    </div>
  </footer>
${site.contact.whatsappUrl ? `  <a class="whatsapp-float" href="${attr(site.contact.whatsappUrl)}"
    aria-label="${isPt ? "Falar pelo WhatsApp" : "Contact on WhatsApp"}">
    <span>WA</span><i aria-hidden="true"></i>
  </a>` : ""}
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
<link rel="alternate" hreflang="pt-BR" href="${attr(`${siteUrl}/pt/`)}"><link rel="alternate" hreflang="en-US" href="${attr(`${siteUrl}/en/`)}">
<link rel="alternate" hreflang="x-default" href="${attr(`${siteUrl}/pt/`)}">
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

const notFoundPage = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow"><meta name="theme-color" content="${attr(site.palette.background)}">
<title>404 — ${esc(site.brand.name)}</title>
<link rel="icon" href="/assets/brand/standloud-symbol.svg" type="image/svg+xml" sizes="any">
<style>
  :root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:${site.palette.background};color:${site.palette.text}}
  *{box-sizing:border-box}body{min-height:100svh;display:grid;place-items:center;margin:0;padding:1.5rem;background:radial-gradient(circle at 75% 15%,rgba(37,99,235,.16),transparent 34%),${site.palette.background}}
  main{width:min(100%,54rem);padding:clamp(2rem,7vw,5rem);border:1px solid rgba(245,245,247,.12);border-radius:1.5rem;background:rgba(17,17,26,.74)}
  .mark{width:3rem;height:auto}.code{margin:2.5rem 0 0;color:${site.palette.cyan};font-size:.72rem;font-weight:800;letter-spacing:.18em}
  h1{max-width:12ch;margin:.8rem 0 0;font-size:clamp(2.7rem,8vw,6.5rem);letter-spacing:-.06em;line-height:.95}
  p{max-width:52ch;margin:1.4rem 0 0;color:${site.palette.muted};line-height:1.7}
  nav{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem}a{min-height:2.9rem;display:inline-flex;align-items:center;padding:0 1.1rem;border:1px solid rgba(245,245,247,.14);border-radius:999px;color:${site.palette.text};text-decoration:none}
  a:first-child{border-color:transparent;background:linear-gradient(135deg,${site.palette.purple},${site.palette.blue} 55%,${site.palette.cyan});color:white}
  a:focus-visible{outline:2px solid ${site.palette.cyan};outline-offset:3px}
</style></head><body><main>
${standloudSymbol("404", "mark")}
<p class="code">404 / PAGE NOT FOUND</p>
<h1>Esta rota não existe.</h1>
<p>Volte para a STANDLOUD em português ou inglês. This route does not exist — choose your language to return.</p>
<nav aria-label="Escolher idioma / Choose language"><a href="/pt/">Ir para português</a><a href="/en/">Go to English</a></nav>
</main></body></html>`;
await mkdir(path.join(root, "public"), { recursive: true });
await writeFile(path.join(root, "public/404.html"), notFoundPage);

console.log("Built PT/EN commercial Home and preserved 8 Lab scene assets.");
