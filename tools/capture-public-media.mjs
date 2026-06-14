import { createReadStream, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const frameDir = join(root, "demo-frames-v3");
const stableReceipt = "SC-4P-2907-62-Y5VFX1";
const mimeTypes = new Map([
  [".css", "text/css"],
  [".gif", "image/gif"],
  [".html", "text/html"],
  [".js", "text/javascript"],
  [".json", "application/json"],
  [".md", "text/markdown"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".webm", "video/webm"],
  [".yml", "text/yaml"],
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requestPathToFilePath(requestUrl) {
  const url = new URL(requestUrl, "http://127.0.0.1");
  const decodedPath = decodeURIComponent(url.pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.slice(1);
  const filePath = normalize(join(root, relativePath));
  const rootWithSep = root.endsWith(sep) ? root : `${root}${sep}`;
  assert(filePath === root || filePath.startsWith(rootWithSep), "Blocked path traversal");
  return filePath;
}

function startStaticServer() {
  const server = createServer((request, response) => {
    try {
      const filePath = requestPathToFilePath(request.url || "/");
      const stat = statSync(filePath);
      assert(stat.isFile(), "Not a file");
      response.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": mimeTypes.get(extname(filePath)) || "application/octet-stream",
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("not found");
    }
  });

  return new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolveServer({ server, baseUrl: `http://127.0.0.1:${address.port}/` });
    });
  });
}

async function withPage(browser, viewport, callback) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  try {
    await callback(page);
    assert(pageErrors.length === 0, `Page errors: ${pageErrors.join("; ")}`);
  } finally {
    await context.close();
  }
}

async function assertCleanFirstScreen(page, label) {
  const facts = await page.evaluate(() => ({
    score: document.querySelector("#scoreLabel")?.textContent.trim(),
    best: document.querySelector("#bestLabel")?.textContent.trim(),
    shifts: document.querySelector("#shiftLabel")?.textContent.trim(),
    phaseProof: document.querySelector("#phaseProof")?.textContent.trim(),
    resetVisible: getComputedStyle(document.querySelector("#resetButton")).display !== "none",
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  assert(facts.score === "0", `${label} first screen inherited score ${facts.score}`);
  assert(facts.best === "0", `${label} first screen inherited best score ${facts.best}`);
  assert(facts.shifts === "0", `${label} first screen inherited shifts ${facts.shifts}`);
  assert(facts.phaseProof === "Solstice crib starts state transitions.", `${label} first screen phase proof drifted`);
  assert(facts.resetVisible, `${label} Reset control is not visible`);
  assert(facts.overflowX === 0, `${label} first screen has horizontal overflow`);
}

async function captureFirstScreens(browser, baseUrl) {
  await withPage(browser, { width: 1280, height: 900 }, async (page) => {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await assertCleanFirstScreen(page, "desktop");
    await page.screenshot({ path: join(root, "desktop-check-v5.png"), fullPage: false });
    await page.screenshot({ path: join(frameDir, "00-ready.png"), fullPage: false });
  });

  await withPage(browser, { width: 390, height: 844 }, async (page) => {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await assertCleanFirstScreen(page, "mobile");
    await page.screenshot({ path: join(root, "mobile-check-v6.png"), fullPage: false });
  });
}

async function captureDemoFrames(browser, baseUrl) {
  await withPage(browser, { width: 1280, height: 900 }, async (page) => {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await assertCleanFirstScreen(page, "demo");

    await page.click("#startButton");
    await page.waitForTimeout(450);
    await page.screenshot({ path: join(frameDir, "01-start.png"), fullPage: false });

    await page.keyboard.press("H");
    await page.keyboard.press("1");
    await page.waitForTimeout(450);
    await page.screenshot({ path: join(frameDir, "02-phase-1.png"), fullPage: false });

    await page.click("#resetButton");
    await page.waitForTimeout(250);
    await page.click("#demoButton");
    await page.waitForFunction(() => document.querySelector("#phaseObjective")?.textContent.trim() === "XOR meridian", null, { timeout: 8000 });
    await page.screenshot({ path: join(frameDir, "03-phase-2.png"), fullPage: false });
    await page.waitForFunction(() => document.querySelector("#phaseObjective")?.textContent.trim() === "Carry twilight", null, { timeout: 8000 });
    await page.screenshot({ path: join(frameDir, "04-phase-3.png"), fullPage: false });
    await page.waitForFunction(() => document.querySelector("#phaseObjective")?.textContent.trim() === "Checksum night", null, { timeout: 8000 });
    await page.screenshot({ path: join(frameDir, "05-phase-4.png"), fullPage: false });
    await page.waitForFunction(
      (receipt) => document.querySelector("#proofCode")?.textContent.trim() === receipt,
      stableReceipt,
      { timeout: 20000 }
    );
    await page.locator("#proofPanel").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(root, "desktop-complete-v4.png"), fullPage: false });
    await page.screenshot({ path: join(frameDir, "06-complete.png"), fullPage: false });
  });
}

async function captureMobileCompletion(browser, baseUrl) {
  await withPage(browser, { width: 390, height: 844 }, async (page) => {
    await page.goto(`${baseUrl}?demo=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      (receipt) => document.querySelector("#proofCode")?.textContent.trim() === receipt,
      stableReceipt,
      { timeout: 20000 }
    );
    await page.locator("#proofPanel").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(root, "mobile-complete-v1.png"), fullPage: false });
  });
}

async function main() {
  mkdirSync(frameDir, { recursive: true });
  const { server, baseUrl } = await startStaticServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    await captureFirstScreens(browser, baseUrl);
    await captureDemoFrames(browser, baseUrl);
    await captureMobileCompletion(browser, baseUrl);
    console.log(`Captured Helioigma public media from clean browser contexts at ${baseUrl}`);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolveClose) => server.close(resolveClose));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
