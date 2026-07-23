import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "_site");
const allowedDirectories = [
  ["assets/css", "assets/css", new Set([".css"])],
  ["assets/js", "assets/js", new Set([".js"])],
  ["assets/scenes", "assets/scenes", new Set([".svg", ".png", ".webp", ".avif", ".jpg", ".jpeg"])],
  ["assets/vid", "assets/vid", new Set([".mp4", ".webm", ".mov", ".png", ".webp", ".avif", ".jpg", ".jpeg"])],
  ["public", "", new Set([".html", ".css", ".js", ".ico", ".svg", ".png", ".webp", ".avif", ".jpg", ".jpeg", ".webmanifest", ".txt", ".xml", ".json"])]
];
const specialPublicFiles = new Set(["_headers", "_redirects"]);
const temporaryPattern = /(^\.|\.tmp$|\.swp$|\.kate-swp$|~$)/i;
const secretPatterns = [
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:api[_-]?key|secret|password)\s*[:=]\s*["'][^"']+["']/i
];

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function copyAllowedTree(relativeSource, relativeDestination, allowedExtensions) {
  const source = path.join(root, relativeSource);
  if (!(await exists(source))) return 0;

  let copied = 0;
  async function walk(current, relative = "") {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (temporaryPattern.test(entry.name)) continue;
      const sourcePath = path.join(current, entry.name);
      const relativePath = path.join(relative, entry.name);
      if (entry.isDirectory()) {
        await walk(sourcePath, relativePath);
        continue;
      }
      const extensionAllowed = allowedExtensions.has(path.extname(entry.name).toLowerCase());
      const specialFileAllowed = relativeSource === "public" && specialPublicFiles.has(entry.name);
      if (!entry.isFile() || (!extensionAllowed && !specialFileAllowed)) continue;
      const destination = path.join(output, relativeDestination, relativePath);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(sourcePath, destination);
      copied += 1;
    }
  }

  await walk(source);
  return copied;
}

async function collectFiles(directory, relative = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryRelative = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path.join(directory, entry.name), entryRelative));
    else if (entry.isFile()) files.push(entryRelative);
  }
  return files;
}

function normalizeSiteUrl() {
  const candidate = process.env.SITE_URL || process.env.CF_PAGES_URL || "http://127.0.0.1:4173";
  const url = new URL(candidate);
  return url.href.replace(/\/$/, "");
}

async function writeDiscoveryFiles() {
  const siteUrl = normalizeSiteUrl();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc></url>
  <url><loc>${siteUrl}/pt/</loc></url>
  <url><loc>${siteUrl}/en/</loc></url>
</urlset>
`;
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
  await writeFile(path.join(output, "sitemap.xml"), sitemap);
  await writeFile(path.join(output, "robots.txt"), robots);
}

async function validateOutput() {
  const files = await collectFiles(output);
  const forbiddenTopLevels = new Set([
    ".git",
    ".github",
    "node_modules",
    "config",
    "content",
    "docs",
    "prompts",
    "scripts"
  ]);
  const required = [
    "index.html",
    "pt/index.html",
    "en/index.html",
    "assets/css/styles.css",
    "assets/js/site.js",
    "favicon.svg",
    "robots.txt",
    "sitemap.xml"
  ];

  for (const file of required) {
    if (!files.includes(file)) throw new Error(`Cloudflare output is missing ${file}`);
  }
  for (const file of files) {
    const [topLevel] = file.split(path.sep);
    if (forbiddenTopLevels.has(topLevel) || temporaryPattern.test(path.basename(file))) {
      throw new Error(`Unsafe file in Cloudflare output: ${file}`);
    }
    const extension = path.extname(file).toLowerCase();
    if (["", ".html", ".css", ".js", ".json", ".xml", ".txt", ".svg"].includes(extension)) {
      const contents = await readFile(path.join(output, file), "utf8");
      if (secretPatterns.some((pattern) => pattern.test(contents))) {
        throw new Error(`Possible credential in Cloudflare output: ${file}`);
      }
    }
  }

  for (const locale of ["pt", "en"]) {
    const pagePath = path.join(output, locale, "index.html");
    const html = await readFile(pagePath, "utf8");
    const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
    for (const reference of references) {
      if (/^(#|mailto:|https?:)/.test(reference)) continue;
      const pathname = decodeURIComponent(new URL(reference, `https://example.test/${locale}/`).pathname);
      const target = path.resolve(output, `.${pathname}`);
      if ((target !== output && !target.startsWith(`${output}${path.sep}`)) || !(await exists(target))) {
        throw new Error(`${locale}: broken public reference ${reference}`);
      }
    }
  }

  const rootHtml = await readFile(path.join(output, "index.html"), "utf8");
  if (!rootHtml.includes('location.replace("./" + language + "/")')) {
    throw new Error("Root language redirect is not relative");
  }

  return files;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of ["index.html", "favicon.svg"]) {
  await copyFile(path.join(root, entry), path.join(output, entry));
}
for (const locale of ["pt", "en"]) {
  await mkdir(path.join(output, locale), { recursive: true });
  await copyFile(path.join(root, locale, "index.html"), path.join(output, locale, "index.html"));
}

for (const [source, destination, extensions] of allowedDirectories) {
  await copyAllowedTree(source, destination, extensions);
}

await writeDiscoveryFiles();
const files = await validateOutput();
const totalBytes = (await Promise.all(
  files.map(async (file) => (await stat(path.join(output, file))).size)
)).reduce((sum, size) => sum + size, 0);

console.log(`Cloudflare output ready: ${files.length} public files, ${totalBytes} bytes in _site/.`);
