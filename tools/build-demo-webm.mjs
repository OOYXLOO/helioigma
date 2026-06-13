import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const frameDir = join(root, "demo-frames-v3");
const outputPath = join(root, "solstice-cipher-demo.webm");
const frameFiles = readdirSync(frameDir)
  .filter((name) => /^\d{2}-.+\.png$/.test(name))
  .sort();

if (frameFiles.length < 4) {
  throw new Error("Expected at least four demo frames");
}

const frames = frameFiles.map((name) => ({
  name,
  dataUrl: `data:image/png;base64,${readFileSync(join(frameDir, name)).toString("base64")}`,
}));

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setContent("<!doctype html><canvas id=\"stage\"></canvas>");
  const bytes = await page.evaluate(async ({ frames: browserFrames }) => {
    const loadImage = (src) => new Promise((resolveImage, rejectImage) => {
      const image = new Image();
      image.onload = () => resolveImage(image);
      image.onerror = () => rejectImage(new Error(`Could not load frame ${src.slice(0, 48)}`));
      image.src = src;
    });

    const images = [];
    for (const frame of browserFrames) {
      images.push({ name: frame.name, image: await loadImage(frame.dataUrl) });
    }

    const canvas = document.querySelector("#stage");
    canvas.width = images[0].image.naturalWidth;
    canvas.height = images[0].image.naturalHeight;
    const context = canvas.getContext("2d");
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const stream = canvas.captureStream(3);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1800000 });
    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
    const drawFrame = (image) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    recorder.start();
    for (const { image } of images) {
      drawFrame(image);
      await wait(720);
    }
    drawFrame(images.at(-1).image);
    await wait(1000);
    recorder.stop();

    await new Promise((resolveStop) => {
      recorder.onstop = resolveStop;
    });
    const blob = new Blob(chunks, { type: "video/webm" });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }, { frames });

  if (bytes.length < 4096) {
    throw new Error(`Generated WebM is unexpectedly small: ${bytes.length} bytes`);
  }
  writeFileSync(outputPath, Buffer.from(bytes));
  console.log(`Wrote ${outputPath} (${bytes.length} bytes) from ${frameFiles.length} frames`);
} finally {
  await browser.close();
}
