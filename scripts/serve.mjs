import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootFlag = process.argv.indexOf("--root");
const requestedRoot = rootFlag >= 0 ? process.argv[rootFlag + 1] : ".";
if (!requestedRoot) throw new Error("Missing value after --root");
const root = path.resolve(projectRoot, requestedRoot);
if (root !== projectRoot && !root.startsWith(`${projectRoot}${path.sep}`)) {
  throw new Error("Preview root must stay inside the project");
}
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error("Invalid path");
    const info = await stat(file);
    if (info.isDirectory()) file = path.join(file, "index.html");
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Preview (${path.relative(projectRoot, root) || "."}): http://127.0.0.1:${port}/pt/`);
});
