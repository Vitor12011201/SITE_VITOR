import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const files = ["index.html", "pt/index.html", "en/index.html", "pt/projetos/index.html", "en/projects/index.html", "assets/css/styles.css", "assets/js/site.js", "config/site.json", "content/pt.json", "content/en.json"];
for (const file of files) {
  try { await access(path.join(root, file)); }
  catch { errors.push(`Missing ${file}`); }
}

const site = JSON.parse(await readFile(path.join(root, "config/site.json"), "utf8"));
const css = await readFile(path.join(root, "assets/css/styles.css"), "utf8");
const clientJs = await readFile(path.join(root, "assets/js/site.js"), "utf8");
if (site.home.scenes.length || site.home.maxScenes !== 0) errors.push("Home must not configure experimental scenes.");
const expectedOrder = ["hero", "problems", "services", "case:nuppac", "process", "differentials", "about", "contact"];
if (site.home.sectionOrder.join(",") !== expectedOrder.join(",")) errors.push("Home section order is not the concise commercial order.");
if (site.contact.email || site.contact.whatsappUrl || Object.values(site.contact).some((value) => value === "#")) errors.push("Contact config exposes an unconfigured or placeholder public channel.");
for (const selector of [".hero", ".problems", ".service-grid", ".case-study", ".process__list", ".differentials", ".about", ".contact", ".site-footer"]) {
  if (!css.includes(selector)) errors.push(`CSS is missing ${selector}`);
}
for (const breakpoint of ["1100px", "920px", "760px", "430px"]) {
  if (!css.includes(`max-width: ${breakpoint}`)) errors.push(`CSS is missing the ${breakpoint} breakpoint.`);
}
if (!css.includes("prefers-reduced-motion") || !clientJs.includes("IntersectionObserver")) errors.push("Motion preferences or subtle reveal behavior are incomplete.");
for (const legacy of ["scrollProof", "brandGravity", "commercialProject", "selectedWork", "data-demo-form", "form.checkValidity"]) {
  if (clientJs.includes(legacy)) errors.push(`Client JS still includes legacy behavior: ${legacy}`);
}

const expected = {
  pt: { lang: "pt-BR", title: "Sites que transformam atenção em oportunidades.", work: "NUPPAC", real: "Projeto real", service: "Landing Page Estratégica" },
  en: { lang: "en", title: "Websites that turn attention into opportunities.", work: "NUPPAC", real: "Real project", service: "Strategic Landing Page" }
};
const forbidden = ["AQUAFORM", "BRASA 27", "ATLAS &amp; VALE", "ATLAS & VALE", "Projeto conceitual", "Concept project", "hello@example.com", "data-demo-form", "validated locally", "validados localmente", "Solicitar diagnóstico", "Request a review", "href=\"#\""];
const sectionMarkers = ["class=\"hero", "class=\"problems", "class=\"services", "class=\"case-study", "class=\"process", "class=\"differentials", "class=\"about", "class=\"contact"];

for (const [locale, data] of Object.entries(expected)) {
  const html = await readFile(path.join(root, locale, "index.html"), "utf8");
  if (!html.includes(`<html lang="${data.lang}">`)) errors.push(`${locale}: invalid language attribute.`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1 || !html.includes(data.title)) errors.push(`${locale}: missing commercial hero h1.`);
  if (!html.includes(data.work) || !html.includes(data.real) || !html.includes(data.service)) errors.push(`${locale}: missing bilingual commercial content.`);
  if ((html.match(/class="service-card(?:\s|")/g) || []).length !== 3) errors.push(`${locale}: expected three service cards.`);
  if ((html.match(/<li class="reveal">/g) || []).length < 5) errors.push(`${locale}: process steps are incomplete.`);
  if (html.includes("<form") || html.includes("<input") || html.includes("<textarea")) errors.push(`${locale}: public form is rendered without a configured endpoint.`);
  for (const term of forbidden) if (html.includes(term)) errors.push(`${locale}: forbidden public content: ${term}`);
  let last = -1;
  for (const marker of sectionMarkers) {
    const position = html.indexOf(marker);
    if (position < 0 || position <= last) { errors.push(`${locale}: invalid commercial section flow at ${marker}.`); break; }
    last = position;
  }
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const reference of [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1])) {
    if (reference.startsWith("#") && !ids.has(reference.slice(1))) errors.push(`${locale}: broken local anchor ${reference}.`);
  }
}

for (const [locale, directory] of [["pt", "projetos"], ["en", "projects"]]) {
  const html = await readFile(path.join(root, locale, directory, "index.html"), "utf8");
  if (!html.includes("NUPPAC") || html.includes("AQUAFORM") || html.includes("BRASA 27") || html.includes("ATLAS")) errors.push(`${locale}: work route must present only NUPPAC.`);
}

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("Checks passed: concise PT/EN commercial Home, NUPPAC-only work, valid navigation and no placeholder contact UI.");
