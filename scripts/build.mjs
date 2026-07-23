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
    <a class="brand" href="#top" aria-label="${attr(brand)}">
      <span class="brand__mark" aria-hidden="true"><i></i><i></i></span>
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
          <span class="metric metric--a"><i></i>98</span>
          <span class="metric metric--b"><i></i>1.2s</span>
          <span class="metric metric--c"><i></i>AA</span>
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
        ${locale.portfolio.items.map(([type, title, body, tags], index) => `<article class="project-card reveal">
          <div class="project-card__visual">
            <img src="../assets/scenes/${["design", "services", "portfolio"][index]}.svg" width="1600" height="900" loading="lazy" alt="">
            <span>${String(index + 1).padStart(2, "0")}</span>
          </div>
          <div class="project-card__content"><p class="eyebrow">${esc(type)}</p><h3>${esc(title)}</h3><p>${esc(body)}</p><small>${esc(tags)}</small></div>
        </article>`).join("")}
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
      <a class="brand brand--footer" href="#top"><span class="brand__mark" aria-hidden="true"><i></i><i></i></span><span class="brand__name">${esc(brand)}</span></a>
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
<link rel="alternate" hreflang="pt-BR" href="./pt/"><link rel="alternate" hreflang="en" href="./en/">
<style>html{background:${site.palette.background};color:${site.palette.text};font-family:system-ui}body{min-height:100vh;display:grid;place-items:center;margin:0}a{color:${site.palette.cyan}}</style>
<script>
  (() => {
    const saved = localStorage.getItem("nova-frame-language");
    const detected = (navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "en";
    const language = saved || detected;
    location.replace("./" + language + "/");
  })();
</script></head><body><noscript><p><a href="./pt/">Português</a> · <a href="./en/">English</a></p></noscript></body></html>`;
await writeFile(path.join(root, "index.html"), rootPage);

console.log("Built PT/EN pages and 8 local scene placeholders.");
