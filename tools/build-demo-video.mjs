import { copyFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workDir = "C:/Users/YXL/.codex/tmp/hks-yxl/solstice-video-capture";
const outputPath = join(root, "solstice-cipher-demo.webm");
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

async function installCaptionOverlay(page) {
  await page.addStyleTag({
    content: `
      .demo-caption {
        position: fixed;
        left: 24px;
        bottom: 24px;
        z-index: 9999;
        max-width: min(680px, calc(100vw - 48px));
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(7, 15, 24, 0.92);
        color: #f7f3df;
        box-shadow: 0 16px 60px rgba(0, 0, 0, 0.34);
        padding: 12px 14px;
        font: 800 16px/1.35 Inter, ui-sans-serif, system-ui, sans-serif;
      }
      .demo-caption small {
        display: block;
        margin-top: 4px;
        color: #aeb8c5;
        font: 700 12px/1.35 Inter, ui-sans-serif, system-ui, sans-serif;
      }
    `,
  });
  await page.evaluate(() => {
    if (document.querySelector(".demo-caption")) return;
    const caption = document.createElement("div");
    caption.className = "demo-caption";
    caption.setAttribute("aria-hidden", "true");
    document.body.append(caption);
  });
}

async function setCaption(page, title, detail) {
  await page.evaluate(({ title: nextTitle, detail: nextDetail }) => {
    const caption = document.querySelector(".demo-caption");
    if (!caption) return;
    caption.innerHTML = "";
    caption.append(document.createTextNode(nextTitle));
    const small = document.createElement("small");
    small.textContent = nextDetail;
    caption.append(small);
  }, { title, detail });
}

async function main() {
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });

  const { server, baseUrl } = await startStaticServer();
  let browser;
  let context;
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      recordVideo: { dir: workDir, size: { width: 1280, height: 900 } },
    });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await installCaptionOverlay(page);
    await setCaption(
      page,
      "1/5 - First screen: play path, timer, rotor, and receipt goal",
      "Judges can start manually, ask for a Hint, or use Demo Solve without hunting through a menu."
    );
    await page.waitForTimeout(4200);

    await page.click("#startButton");
    await setCaption(
      page,
      "2/5 - Manual play has a visible hint path",
      "Hint highlights the next mismatch; clicks, taps, and keys 1-9 rotate the SOL/XOR/LUX/BIN wheel."
    );
    await page.keyboard.press("H");
    await page.waitForTimeout(700);
    for (const key of ["1", "2", "3"]) {
      await page.keyboard.press(key);
      await page.waitForTimeout(500);
    }
    await page.locator("#tracePanel").scrollIntoViewIfNeeded();
    await setCaption(
      page,
      "2/5 - Rotor Trace makes the state machine readable",
      "The panel mirrors phase, aligned count, next mismatch, and the last action."
    );
    await page.waitForTimeout(2600);
    await page.locator("#demoButton").scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);

    await page.click("#resetButton");
    await page.waitForTimeout(700);
    await page.click("#demoButton");
    await setCaption(
      page,
      "3/5 - Demo Solve runs the same four-phase path deterministically",
      "The timer is stabilized so the published judge receipt is reproducible."
    );
    await page.waitForFunction(() => document.querySelector("#proofPanel")?.hidden === false, { timeout: 25000 });

    await setCaption(
      page,
      "4/5 - A completed run leaves a local receipt",
      "SC-4P-2907-62-Y5VFX1 records phases, score, shifts, and a checksum suffix."
    );
    await page.waitForTimeout(6500);

    await page.goto(`${baseUrl}proof-verifier.html`, { waitUntil: "domcontentloaded" });
    await installCaptionOverlay(page);
    await setCaption(
      page,
      "5/5 - The verifier recomputes the receipt checksum locally",
      "No backend, account, API key, or private data is needed to inspect the judge path."
    );
    await page.click("#verifyButton");
    await page.waitForFunction(() => document.querySelector("#result")?.textContent.includes("Valid run receipt"));
    await page.waitForTimeout(7500);

    const video = page.video();
    await context.close();
    context = null;
    const recordedPath = await video.path();
    copyFileSync(recordedPath, outputPath);
    const bytes = statSync(outputPath).size;
    if (bytes < 100000) {
      throw new Error(`Generated demo video is unexpectedly small: ${bytes} bytes`);
    }
    console.log(`Wrote ${outputPath} (${bytes} bytes) from a live browser recording`);
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
    await new Promise((resolveClose) => server.close(resolveClose));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
