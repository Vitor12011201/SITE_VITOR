import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runName = process.argv[2] === "final" ? "final" : "baseline";
const outputDirectory = path.join(projectRoot, "qa", runName);
const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const baselineScenarios = [
  { locale: "pt", width: 1440, height: 900, label: "desktop" },
  { locale: "pt", width: 390, height: 844, label: "mobile" },
  { locale: "pt", width: 320, height: 568, label: "mobile-narrow" },
  { locale: "en", width: 1440, height: 900, label: "desktop" },
  { locale: "en", width: 390, height: 844, label: "mobile" },
  { locale: "en", width: 320, height: 568, label: "mobile-narrow" }
];
const finalViewports = [
  { width: 1920, height: 1080, label: "desktop-wide" },
  { width: 1440, height: 900, label: "desktop" },
  { width: 1024, height: 768, label: "notebook" },
  { width: 768, height: 1024, label: "tablet" },
  { width: 430, height: 932, label: "mobile-wide" },
  { width: 390, height: 844, label: "mobile" },
  { width: 360, height: 800, label: "mobile-small" },
  { width: 320, height: 568, label: "mobile-narrow" }
];
const scenarios = runName === "final"
  ? ["pt", "en"].flatMap((locale) => finalViewports.map((viewport) => ({ locale, ...viewport })))
  : baselineScenarios;

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

async function screenshot(page, name, options = {}) {
  const target = path.join(outputDirectory, `${name}.png`);
  await page.screenshot({ path: target, animations: "disabled", ...options });
  return path.relative(projectRoot, target);
}

async function captureLocator(page, selector, name) {
  const locator = page.locator(selector).first();
  if (!await locator.count()) return null;
  await page.evaluate((targetSelector) => {
    document.activeElement?.blur();
    document.documentElement.style.scrollBehavior = "auto";
    const target = document.querySelector(targetSelector);
    const top = target.getBoundingClientRect().top + scrollY;
    scrollTo(0, Math.max(0, top - 96));
  }, selector);
  await page.waitForTimeout(200);
  return screenshot(page, name);
}

async function captureComparison(page, name, position) {
  const comparison = page.locator("[data-image-comparison]").first();
  if (!await comparison.count()) return null;
  await comparison.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const box = await comparison.boundingBox();
  if (!box) return null;
  await page.mouse.click(box.x + box.width * (position / 100), box.y + box.height / 2);
  await page.waitForTimeout(80);
  const target = path.join(outputDirectory, `${name}.png`);
  await comparison.screenshot({ path: target, animations: "disabled" });
  return path.relative(projectRoot, target);
}

for (const scenario of scenarios) {
  const context = await browser.newContext({
    locale: scenario.locale === "pt" ? "pt-BR" : "en-US",
    viewport: { width: scenario.width, height: scenario.height },
    reducedMotion: "no-preference"
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText || "failed"}`);
  });

  const url = `${baseUrl}/${scenario.locale}/`;
  const response = await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);

  const prefix = `${scenario.locale}-${scenario.width}x${scenario.height}`;
  const evidence = [await screenshot(page, `${prefix}-home`)];
  const metrics = await page.evaluate(() => {
    const primary = document.querySelector(".commercial-hero .button--primary");
    const secondary = document.querySelector(".commercial-hero .button--ghost");
    const primaryBox = primary?.getBoundingClientRect();
    const secondaryBox = secondary?.getBoundingClientRect();
    const navigation = performance.getEntriesByType("navigation")[0];
    const labelText = (element) => {
      if (element.labels?.length) {
        return [...element.labels].map((label) => label.textContent?.trim()).filter(Boolean).join(" ");
      }
      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        return labelledBy.split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim())
          .filter(Boolean)
          .join(" ");
      }
      return element.getAttribute("aria-label") || element.textContent?.trim() ||
        element.getAttribute("title") || element.getAttribute("placeholder") || "";
    };
    const interactiveWithoutName = [...document.querySelectorAll("a, button, input, select, textarea")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const visible = style.display !== "none" && style.visibility !== "hidden" &&
          element.getClientRects().length > 0;
        return visible && !labelText(element);
      }).length;
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      h1Count: document.querySelectorAll("h1").length,
      headingOutline: [...document.querySelectorAll("h1, h2, h3")].map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: heading.textContent?.replace(/\s+/g, " ").trim() || ""
      })),
      landmarkCounts: {
        header: document.querySelectorAll("header").length,
        nav: document.querySelectorAll("nav").length,
        main: document.querySelectorAll("main").length,
        footer: document.querySelectorAll("footer").length
      },
      domElementCount: document.getElementsByTagName("*").length,
      documentHeight: document.documentElement.scrollHeight,
      decodedBodyBytes: navigation?.decodedBodySize || null,
      domContentLoadedMs: navigation ? Math.round(navigation.domContentLoadedEventEnd) : null,
      loadMs: navigation ? Math.round(navigation.loadEventEnd) : null,
      primaryCtaInFirstViewport: Boolean(primaryBox && primaryBox.top >= 0 && primaryBox.bottom <= innerHeight),
      secondaryCtaInFirstViewport: Boolean(secondaryBox && secondaryBox.top >= 0 && secondaryBox.bottom <= innerHeight),
      missingImageAltCount: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
      interactiveWithoutName
    };
  });

  const primaryCta = page.locator(".commercial-hero .button--primary").first();
  if (await primaryCta.count()) {
    await primaryCta.focus();
    const focusStyle = await primaryCta.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor };
    });
    metrics.primaryCtaFocus = focusStyle;
    evidence.push(await screenshot(page, `${prefix}-primary-cta-focus`));
  }

  if (scenario.label === "desktop") {
    for (const [selector, suffix] of [
      ["#projects", "projects"],
      [".commercial-project", "project-nuppac-card"],
      ["#process", "process"],
      ["#about", "about"],
      ["#faq", "faq"],
      ["#contact", "contact"],
      [".site-footer", "footer"]
    ]) {
      const capture = await captureLocator(page, selector, `${prefix}-${suffix}`);
      if (capture) evidence.push(capture);
    }
    for (const position of [25, 50, 75]) {
      const capture = await captureComparison(page, `${prefix}-nuppac-comparison-${position}`, position);
      if (capture) evidence.push(capture);
    }
  }

  if (scenario.label === "mobile") {
    await page.locator(".menu-toggle").click();
    await page.waitForTimeout(150);
    evidence.push(await screenshot(page, `${prefix}-menu-open`));
    await page.locator(".menu-toggle").click();
    const contactCapture = await captureLocator(page, "#contact", `${prefix}-contact`);
    if (contactCapture) evidence.push(contactCapture);
    const projectCapture = await captureLocator(page, ".commercial-project", `${prefix}-project-nuppac-card`);
    if (projectCapture) evidence.push(projectCapture);
    const aboutCapture = await captureLocator(page, "#about", `${prefix}-about`);
    if (aboutCapture) evidence.push(aboutCapture);
    const faqCapture = await captureLocator(page, "#faq", `${prefix}-faq`);
    if (faqCapture) evidence.push(faqCapture);
    const footerCapture = await captureLocator(page, ".site-footer", `${prefix}-footer`);
    if (footerCapture) evidence.push(footerCapture);
    const comparisonCapture = await captureComparison(page, `${prefix}-nuppac-comparison-50`, 50);
    if (comparisonCapture) evidence.push(comparisonCapture);
  }

  if (scenario.width === 320) {
    const comparisonCapture = await captureComparison(page, `${prefix}-nuppac-comparison-50`, 50);
    if (comparisonCapture) evidence.push(comparisonCapture);
  }

  results.push({
    route: `/${scenario.locale}/`,
    viewport: `${scenario.width}x${scenario.height}`,
    browser: "Chromium",
    httpStatus: response?.status() || null,
    metrics,
    consoleErrors,
    pageErrors,
    failedRequests,
    evidence,
    limitations: [
      "Viewport and targeted-section captures are evidence, not visual approval.",
      "NUPPAC comparison captures use explicit 25%, 50% and 75% control states."
    ]
  });

  await context.close();
}

if (runName === "final") {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/not-found/`, { waitUntil: "networkidle" });
    await screenshot(page, `404-${viewport.width}x${viewport.height}`);
    await context.close();
  }
}

await browser.close();
await writeFile(
  path.join(outputDirectory, "results.json"),
  `${JSON.stringify({ runName, baseUrl, generatedAt: new Date().toISOString(), results }, null, 2)}\n`
);

const failures = results.filter((result) =>
  result.httpStatus !== 200 ||
  result.metrics.horizontalOverflow > 0 ||
  result.consoleErrors.length ||
  result.pageErrors.length ||
  result.failedRequests.length
);

console.log(`Browser QA ${runName}: ${results.length} scenarios, ${failures.length} with technical failures.`);
console.log(`Evidence: ${path.relative(projectRoot, outputDirectory)}/`);
if (failures.length) process.exitCode = 1;
