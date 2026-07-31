import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runName = process.argv[2] === "final" ? "final" : "baseline";
const outputDirectory = path.join(projectRoot, "qa", runName);
const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const results = {
  runName,
  baseUrl,
  generatedAt: new Date().toISOString(),
  routes: [],
  interactions: {},
  accessibility: {},
  reducedMotion: {},
  noJavaScript: {},
  failures: []
};

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function routeChecks() {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const route of ["/", "/pt/", "/en/", "/pt/projetos/", "/en/projects/", "/not-found/"]) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    results.routes.push({
      route,
      status: response?.status() || null,
      finalUrl: page.url(),
      lang: await page.locator("html").getAttribute("lang"),
      title: await page.title(),
      comparisonLabels: await page.locator("[data-image-comparison]").count()
        ? await page.locator("[data-image-comparison]").evaluate((node) => ({
            before: node.dataset.beforeLabel,
            after: node.dataset.afterLabel,
            assets: node.dataset.comparisonAssets
          }))
        : null
    });
  }
  await context.close();
}

async function interactionChecks() {
  const context = await browser.newContext({
    locale: "pt-BR",
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(`${baseUrl}/pt/`, { waitUntil: "networkidle" });

  const menuButton = page.locator(".menu-toggle");
  await menuButton.click();
  const menuOpened = await page.locator(".site-header").evaluate((node) => node.classList.contains("is-menu-open"));
  await page.keyboard.press("Escape");
  const menuClosedWithEscape = !await page.locator(".site-header").evaluate((node) => node.classList.contains("is-menu-open"));
  if (!menuClosedWithEscape) await menuButton.click();
  await menuButton.click();
  await page.locator(".primary-nav a").first().click();
  const menuClosedByLink = !await page.locator(".site-header").evaluate((node) => node.classList.contains("is-menu-open"));

  const activeDotBefore = await page.locator("[data-selected-work-dot][aria-selected='true']").getAttribute("aria-label");
  await page.locator("[data-selected-work-next]").click();
  const activeDotAfterNext = await page.locator("[data-selected-work-dot][aria-selected='true']").getAttribute("aria-label");
  await page.locator("[data-selected-work-dot]").nth(2).focus();
  await page.keyboard.press("ArrowLeft");
  const activeDotAfterKeyboard = await page.locator("[data-selected-work-dot][aria-selected='true']").getAttribute("aria-label");

  const comparison = page.locator("[data-image-comparison]").first();
  await comparison.scrollIntoViewIfNeeded();
  const comparisonInitial = await comparison.evaluate((node) => ({
    role: node.getAttribute("role"),
    min: node.getAttribute("aria-valuemin"),
    max: node.getAttribute("aria-valuemax"),
    now: Number(node.getAttribute("aria-valuenow")),
    label: node.getAttribute("aria-label"),
    before: node.dataset.beforeLabel,
    after: node.dataset.afterLabel,
    assets: node.dataset.comparisonAssets,
    userSelect: getComputedStyle(node).userSelect,
    touchAction: getComputedStyle(node).touchAction
  }));
  await comparison.focus();
  const comparisonFocus = await comparison.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor };
  });
  await page.keyboard.press("ArrowLeft");
  const comparisonAfterLeft = Number(await comparison.getAttribute("aria-valuenow"));
  await page.keyboard.press("End");
  const comparisonAfterEnd = Number(await comparison.getAttribute("aria-valuenow"));
  await page.keyboard.press("Home");
  const comparisonAfterHome = Number(await comparison.getAttribute("aria-valuenow"));
  await page.keyboard.press("ArrowRight");
  const comparisonAfterRight = Number(await comparison.getAttribute("aria-valuenow"));

  let comparisonAfterMouse = null;
  const comparisonBox = await comparison.boundingBox();
  if (comparisonBox) {
    await page.mouse.move(comparisonBox.x + comparisonBox.width * .25, comparisonBox.y + comparisonBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(comparisonBox.x + comparisonBox.width * .75, comparisonBox.y + comparisonBox.height / 2, { steps: 5 });
    await page.mouse.up();
    comparisonAfterMouse = Number(await comparison.getAttribute("aria-valuenow"));
  }
  const comparisonAfterTouch = await comparison.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const emit = (type, x) => node.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: 73,
      pointerType: "touch",
      isPrimary: true,
      clientX: rect.left + rect.width * x,
      clientY: rect.top + rect.height / 2
    }));
    emit("pointerdown", .75);
    emit("pointermove", .25);
    emit("pointerup", .25);
    return Number(node.getAttribute("aria-valuenow"));
  });
  await page.setViewportSize({ width: 430, height: 932 });
  const comparisonAfterResize = Number(await comparison.getAttribute("aria-valuenow"));

  await page.locator("#contact").scrollIntoViewIfNeeded();
  const form = page.locator("[data-contact-form]");
  const initialSubmitDisabled = await form.locator("[type='submit']").isDisabled();
  const initialStatus = await form.locator("[data-form-status]").textContent();
  await form.locator("[type='submit']").evaluate((button) => {
    button.disabled = false;
  });
  await form.locator("[type='submit']").click();
  const invalidStatus = await form.locator("[data-form-status]").textContent();
  const invalidFocus = await page.evaluate(() => document.activeElement?.id || "");

  await page.waitForTimeout(1700);
  await form.locator("#name").fill("Teste local");
  await form.locator("#contact-channel").fill("teste@example.test");
  await form.locator("#business").fill("Negócio de teste");
  await form.locator("#service").selectOption({ index: 1 });
  await form.locator("#budget").selectOption({ index: 1 });
  await form.locator("#message").fill("Mensagem local de validação com mais de vinte caracteres.");
  await form.locator("[type='submit']").click();
  await page.waitForTimeout(450);
  const unavailableStatus = await form.locator("[data-form-status]").textContent();
  const formReset = await form.locator("#name").inputValue() === "";

  results.interactions = {
    menuOpened,
    menuClosedWithEscape,
    menuClosedByLink,
    activeDotBefore,
    activeDotAfterNext,
    activeDotAfterKeyboard,
    comparison: {
      initial: comparisonInitial,
      focus: comparisonFocus,
      afterLeft: comparisonAfterLeft,
      afterEnd: comparisonAfterEnd,
      afterHome: comparisonAfterHome,
      afterRight: comparisonAfterRight,
      afterMouse: comparisonAfterMouse,
      afterTouch: comparisonAfterTouch,
      afterResize: comparisonAfterResize
    },
    invalidStatus: invalidStatus?.trim(),
    invalidFocus,
    initialSubmitDisabled,
    initialStatus: initialStatus?.trim(),
    unavailableStatus: unavailableStatus?.trim(),
    formReset,
    consoleErrors
  };

  results.accessibility.interactiveElements = await page.evaluate(() => {
    const labelText = (element) => {
      if (element.labels?.length) {
        return [...element.labels].map((label) => label.textContent?.trim()).filter(Boolean).join(" ");
      }
      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        return labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent?.trim()).filter(Boolean).join(" ");
      }
      return element.getAttribute("aria-label") ||
        element.textContent?.trim() ||
        element.getAttribute("title") ||
        element.getAttribute("placeholder") ||
        "";
    };
    return [...document.querySelectorAll("a, button, input, select, textarea, [role='slider']")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && !element.closest("[inert]");
      })
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        className: element.className || null,
        name: labelText(element),
        disabled: element.matches(":disabled, [aria-disabled='true']"),
        tabindex: element.getAttribute("tabindex")
      }))
      .filter((element) => !element.name);
  });

  await context.close();
}

async function reducedMotionChecks() {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce"
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/pt/`, { waitUntil: "networkidle" });
  results.reducedMotion = await page.evaluate(() => ({
    preference: matchMedia("(prefers-reduced-motion: reduce)").matches,
    comparison: (() => {
      const node = document.querySelector("[data-image-comparison]");
      const layer = node?.querySelector(".image-comparison__layer--before");
      return {
        position: Number(node?.getAttribute("aria-valuenow")),
        transitionDuration: layer ? getComputedStyle(layer).transitionDuration : null
      };
    })(),
    documentHeight: document.documentElement.scrollHeight,
    visibleRevealCount: [...document.querySelectorAll(".reveal")].filter((node) => getComputedStyle(node).opacity !== "0").length,
    totalRevealCount: document.querySelectorAll(".reveal").length
  }));
  await context.close();
}

async function noJavaScriptChecks() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false
  });
  const page = await context.newPage();
  const response = await page.goto(`${baseUrl}/pt/`, { waitUntil: "networkidle" });
  results.noJavaScript = await page.evaluate(() => ({
    status: document.readyState,
    h1: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() || null,
    visibleRevealCount: [...document.querySelectorAll(".reveal")].filter((node) => getComputedStyle(node).opacity !== "0").length,
    totalRevealCount: document.querySelectorAll(".reveal").length,
    formNoValidate: document.querySelector("form")?.noValidate ?? null,
    menuButtonVisible: getComputedStyle(document.querySelector(".menu-toggle")).display !== "none",
    primaryNavigationVisible: getComputedStyle(document.querySelector(".primary-nav")).visibility !== "hidden",
    comparison: (() => {
      const node = document.querySelector("[data-image-comparison]");
      const fallback = node?.querySelector(".image-comparison__fallback");
      return {
        role: node?.getAttribute("role") || null,
        enhanced: node?.classList.contains("is-enhanced") || false,
        position: getComputedStyle(node).getPropertyValue("--compare-position").trim(),
        fallbackVisible: fallback ? getComputedStyle(fallback).visibility !== "hidden" : false
      };
    })()
  }));
  results.noJavaScript.httpStatus = response?.status() || null;
  await context.close();
}

await routeChecks();
await interactionChecks();
await reducedMotionChecks();
await noJavaScriptChecks();
await browser.close();

if (!results.interactions.menuClosedWithEscape) {
  results.failures.push("Mobile menu does not close with Escape.");
}
if (results.accessibility.interactiveElements.length) {
  results.failures.push("Visible interactive elements without an accessible name were found.");
}
const comparison = results.interactions.comparison;
if (comparison.initial.role !== "slider" || comparison.initial.min !== "0" ||
    comparison.initial.max !== "100" || comparison.initial.now !== 50 ||
    comparison.afterLeft !== 45 || comparison.afterEnd !== 100 ||
    comparison.afterHome !== 0 || comparison.afterRight !== 5 ||
    Math.abs(comparison.afterMouse - 75) > 2 ||
    Math.abs(comparison.afterTouch - 25) > 2 ||
    comparison.afterResize !== comparison.afterTouch) {
  results.failures.push("NUPPAC comparison failed pointer, touch, keyboard, bounds or resize checks.");
}
if (comparison.focus.outlineStyle === "none" || comparison.focus.outlineWidth === "0px") {
  results.failures.push("NUPPAC comparison does not expose a visible keyboard focus.");
}
if (results.reducedMotion.comparison.position !== 50 ||
    !["0s", "0.01ms"].includes(results.reducedMotion.comparison.transitionDuration)) {
  results.failures.push("Reduced-motion NUPPAC comparison is not stable.");
}
if (results.noJavaScript.visibleRevealCount !== results.noJavaScript.totalRevealCount) {
  results.failures.push("Some reveal content is hidden without JavaScript.");
}
if (results.noJavaScript.menuButtonVisible || !results.noJavaScript.primaryNavigationVisible) {
  results.failures.push("No-JavaScript mobile navigation fallback is not usable.");
}
if (results.noJavaScript.comparison.role !== null ||
    results.noJavaScript.comparison.enhanced ||
    !results.noJavaScript.comparison.fallbackVisible ||
    results.noJavaScript.comparison.position !== "50%") {
  results.failures.push("No-JavaScript NUPPAC comparison fallback is not understandable.");
}

await writeFile(
  path.join(outputDirectory, "interaction-results.json"),
  `${JSON.stringify(results, null, 2)}\n`
);

console.log(`Interaction QA ${runName}: ${results.failures.length} findings.`);
console.log(`Evidence: qa/${runName}/interaction-results.json`);
