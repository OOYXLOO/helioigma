import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mimeTypes = new Map([
  [".css", "text/css"],
  [".gif", "image/gif"],
  [".html", "text/html"],
  [".js", "text/javascript"],
  [".json", "application/json"],
  [".md", "text/markdown"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".ps1", "text/plain"],
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

async function readGameFacts(page) {
  return page.evaluate(() => {
    const demo = document.querySelector("#demoButton")?.getBoundingClientRect();
    const judgePath = document.querySelector(".judge-path")?.getBoundingClientRect();
    const ordered = [...document.querySelectorAll("body *")];
    const controls = document.querySelector(".quick-controls");
    const canvas = document.querySelector("#game");
    return {
      demoBeforeCanvas: ordered.indexOf(controls) >= 0 && ordered.indexOf(controls) < ordered.indexOf(canvas),
      demoVisible: Boolean(demo && demo.top >= 0 && demo.bottom <= innerHeight),
      judgePathBeforeCanvas: Boolean(judgePath && ordered.indexOf(document.querySelector(".judge-path")) >= 0 && ordered.indexOf(document.querySelector(".judge-path")) < ordered.indexOf(canvas)),
      judgePathVisible: Boolean(judgePath && judgePath.top >= 0 && judgePath.bottom <= innerHeight),
      judgePathCards: [...document.querySelectorAll(".judge-path article strong")].map((node) => node.textContent.trim()),
      shortcutMap: {
        start: document.querySelector("#startButton")?.getAttribute("aria-keyshortcuts"),
        reset: document.querySelector("#resetButton")?.getAttribute("aria-keyshortcuts"),
        demo: document.querySelector("#demoButton")?.getAttribute("aria-keyshortcuts"),
        canvas: canvas?.getAttribute("aria-keyshortcuts"),
      },
      judgeLinks: [...document.querySelectorAll(".judge-links a")].map((link) => link.textContent.trim()),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

async function main() {
  const { server, baseUrl } = await startStaticServer();
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    const desktop = await readGameFacts(page);
    assert(desktop.overflowX === 0, "desktop has horizontal overflow");
    assert(desktop.demoVisible, "desktop Demo Solve is not visible in the first viewport");
    assert(desktop.demoBeforeCanvas, "Demo Solve controls are not before the canvas");
    assert(desktop.judgePathVisible, "desktop Judge path is not visible in the first viewport");
    assert(desktop.judgePathBeforeCanvas, "Judge path is not before the canvas");
    assert(desktop.judgePathCards.join("|") === "1. Play|2. Demo Solve|3. Verify", "Judge path cards changed");
    assert(desktop.shortcutMap.start === "Enter", "start shortcut is not exposed");
    assert(desktop.shortcutMap.reset === "Escape R", "reset shortcut is not exposed");
    assert(desktop.shortcutMap.demo === "D", "demo shortcut is not exposed");
    assert(desktop.shortcutMap.canvas === "1 2 3 4 5 6 7 8 9", "node shortcuts are not exposed");
    assert(desktop.judgeLinks.includes("Demo GIF"), "first screen does not link the current GIF");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    const mobile = await readGameFacts(page);
    assert(mobile.overflowX === 0, "mobile has horizontal overflow");
    assert(mobile.demoVisible, "mobile Demo Solve is not visible in the first viewport");
    assert(mobile.judgePathVisible, "mobile Judge path is not visible in the first viewport");

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${baseUrl}judge.html`, { waitUntil: "domcontentloaded" });
    const judge = await page.evaluate(() => ({
      actions: [...document.querySelectorAll(".action strong")].map((node) => node.textContent.trim()),
      hasDevConsole: document.body.innerText.includes("DEV Console"),
      hasGif: document.body.innerText.includes("GIF"),
      hasWebm: document.body.innerText.includes("WebM"),
      hasPublishAssistant: document.body.innerText.includes("Publish Assistant"),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(judge.overflowX === 0, "judge page has horizontal overflow");
    assert(judge.hasGif, "judge page does not point to the current GIF");
    assert(judge.hasWebm, "judge page does not point to the current WebM video");
    assert(!judge.hasDevConsole, "judge page exposes DEV Console");
    assert(!judge.hasPublishAssistant, "judge page exposes Publish Assistant");
    assert(judge.actions.includes("Watch Video"), "judge page is missing video action");
    assert(judge.actions.includes("Run Smoke Test"), "judge page is missing smoke action");
    assert(judge.actions.includes("Verify Proof"), "judge page is missing verifier action");
    assert(judge.actions.includes("Open Manifest"), "judge page is missing manifest action");

    const manifestResponse = await page.goto(`${baseUrl}judge-manifest.json`);
    assert(manifestResponse?.ok(), "judge manifest did not return HTTP 200");
    assert((manifestResponse.headers()["content-type"] || "").includes("application/json"), "judge manifest did not return application/json");
    const manifest = JSON.parse(await page.textContent("body"));
    assert(manifest.project === "Solstice Cipher", "judge manifest project changed");
    assert(manifest.challenge?.target_prize_usd === 200, "judge manifest prize target changed");
    assert(manifest.challenge?.target_category === "Best Ode to Alan Turing", "judge manifest category changed");
    assert(manifest.proof?.stable_receipt === "SC-4P-2907-62-Y5VFX1", "judge manifest proof changed");
    assert(manifest.verification?.expected_smoke_checks === 29, "judge manifest smoke count changed");
    assert(manifest.status?.no_secrets === true, "judge manifest no-secret boundary changed");

    const videoResponse = await page.goto(`${baseUrl}solstice-cipher-demo.webm`);
    assert(videoResponse?.ok(), "WebM demo did not return HTTP 200");
    assert((videoResponse.headers()["content-type"] || "").includes("video/webm"), "WebM demo did not return video/webm");

    await page.goto(`${baseUrl}proof-verifier.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#result")?.textContent.includes("Valid run receipt"));
    const proof = await page.evaluate(() => ({
      facts: [...document.querySelectorAll("#proofFacts dd")].map((node) => node.textContent.trim()),
      hasCaveat: document.body.innerText.includes("not anti-cheat or identity proof"),
      result: document.querySelector("#result")?.textContent.trim(),
    }));
    assert(proof.result === "Valid run receipt: 2907 points across 62 shifts.", "proof verifier did not validate the stable receipt");
    assert(proof.hasCaveat, "proof verifier is missing the receipt caveat");
    assert(proof.facts.join("|") === "4/4|2907|62|Y5VFX1", "proof verifier facts changed");

    await page.goto(`${baseUrl}smoke.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const status = document.querySelector("#status")?.textContent || "";
      return status.startsWith("PASS") || status.startsWith("FAIL");
    }, { timeout: 25000 });
    const smoke = await page.evaluate(() => ({
      checks: [...document.querySelectorAll("#checks li")].length,
      failures: [...document.querySelectorAll("#checks li")].filter((li) => li.textContent.startsWith("FAIL")).map((li) => li.textContent),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      status: document.querySelector("#status")?.textContent.trim(),
    }));
    assert(smoke.status.startsWith("PASS - Longest day held."), `smoke failed: ${smoke.status}`);
    assert(smoke.status.includes("62 shifts"), `smoke did not report the expected shift count: ${smoke.status}`);
    assert(smoke.checks === 29, `expected 29 smoke checks, got ${smoke.checks}`);
    assert(smoke.failures.length === 0, `smoke failures: ${smoke.failures.join("; ")}`);
    assert(smoke.overflowX === 0, "smoke page has horizontal overflow");

    console.log(`PASS browser smoke at ${baseUrl}`);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolveClose) => server.close(resolveClose));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
