import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(await readFile(path.join(root, "prompts/scroll-world.json"), "utf8"));
const out = path.join(root, "prompts/generated");
await mkdir(path.join(out, "stills"), { recursive: true });
await mkdir(path.join(out, "legs"), { recursive: true });

for (const [index, scene] of source.scenes.entries()) {
  const still = `${source.stylePreamble}

Subject: ${scene.subject}

Create a wide 3:2 establishing still. Keep the essential focal point horizontally centered with useful negative space for interface copy on the left.
`;

  const startRule = index === 0
    ? "Use the approved solid-background studio still as the start image."
    : `Use the ACTUAL last frame extracted from the rendered ${source.scenes[index - 1].id} leg as the start image. Do not use the standalone ${scene.id} still as the start frame.`;

  const leg = `Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. ${scene.move}. The camera travels through the connected studio toward ${scene.focalPoint}, revealing this environment: ${scene.subject} In the final second, settle back into a slow, steady forward glide toward ${scene.nextDirection}. ${source.styleTail} Smooth, graceful, slow motion, subtle architectural parallax. No text, no captions, no logos, no people.

Frame handoff: ${startRule}
Desktop render target: 16:9 landscape.
Architecture: continuous-forward-flight; no connector and no end image.
`;

  await writeFile(path.join(out, "stills", `${String(index + 1).padStart(2, "0")}-${scene.id}.txt`), still);
  await writeFile(path.join(out, "legs", `${String(index + 1).padStart(2, "0")}-${scene.id}.txt`), leg);
}

const manifest = {
  architecture: source.architectureName,
  sceneCount: source.scenes.length,
  stillCount: source.scenes.length,
  desktopVideoLegCount: source.scenes.length,
  connectorCount: 0,
  mobileVideoLegCountIfApproved: source.scenes.length
};
await writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("Built 8 still prompts and 8 continuous-flight leg prompts. No generation executed.");
