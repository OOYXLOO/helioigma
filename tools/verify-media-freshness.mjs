import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const freshnessSlackMs = 2000;
const sourceFiles = [
  "index.html",
  "styles.css",
  "game.js",
  "judge.html",
  "dev-article-final.md",
  "tools/capture-public-media.mjs",
  "tools/build-demo-video.mjs",
  "tools/build-demo-gif.py",
];
const generatedFiles = [
  "desktop-check-v5.png",
  "mobile-check-v6.png",
  "desktop-complete-v4.png",
  "mobile-complete-v1.png",
  "helioigma-demo.webm",
  "helioigma-demo.gif",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mtime(relativePath) {
  return statSync(join(root, relativePath)).mtimeMs;
}

function assertPrefix(relativePath, bytes) {
  const actual = readFileSync(join(root, relativePath)).subarray(0, bytes.length);
  assert(Buffer.compare(actual, Buffer.from(bytes)) === 0, `${relativePath} has an unexpected file signature`);
}

function pngDimensions(relativePath) {
  const bytes = readFileSync(join(root, relativePath));
  assert(Buffer.compare(bytes.subarray(0, 8), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) === 0, `${relativePath} has an unexpected PNG signature`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const newestSource = Math.max(...sourceFiles.map(mtime));
const staleMedia = generatedFiles.filter((file) => mtime(file) + freshnessSlackMs < newestSource);
if (staleMedia.length > 0) {
  throw new Error(
    `Generated media is older than source files: ${staleMedia.join(", ")}. ` +
      "Run npm run build:media, npm run build:gif, and npm run build:video."
  );
}

const frames = readdirSync(join(root, "demo-frames-v3")).filter((name) => /^\d{2}-.+\.png$/.test(name));
assert(frames.length >= 7, `Expected at least 7 demo frames; found ${frames.length}`);

for (const png of generatedFiles.filter((file) => file.endsWith(".png"))) {
  assertPrefix(png, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}
const cover = pngDimensions("cover.png");
assert(cover.width === 1000 && cover.height === 420, `cover.png must be the DEV-friendly 1000x420 size; got ${cover.width}x${cover.height}`);
assert(mtime("cover.png") + freshnessSlackMs >= mtime("tools/build-cover.py"), "cover.png is older than tools/build-cover.py. Run npm run build:cover.");
assertPrefix("helioigma-demo.webm", [0x1a, 0x45, 0xdf, 0xa3]);
const gifHeader = readFileSync(join(root, "helioigma-demo.gif")).subarray(0, 6).toString("ascii");
assert(gifHeader === "GIF87a" || gifHeader === "GIF89a", "helioigma-demo.gif has an unexpected GIF signature");

console.log("PASS media freshness");
