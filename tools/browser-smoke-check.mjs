import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (error) {
  const missingPlaywright = error?.code === "MODULE_NOT_FOUND" && String(error.message || "").includes("playwright");
  if (!missingPlaywright) throw error;
  console.error("Missing Playwright dependency. Run `npm ci` from the Helioigma repository root, then rerun `npm run smoke`.");
  process.exit(1);
}

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

async function assertLocalAssetOk(baseUrl, path, contentTypeSnippet) {
  const response = await fetch(new URL(path, baseUrl));
  assert(response.ok, `${path} did not return HTTP 200`);
  const contentType = response.headers.get("content-type") || "";
  assert(contentType.includes(contentTypeSnippet), `${path} did not return ${contentTypeSnippet}`);
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
    const reset = document.querySelector("#resetButton")?.getBoundingClientRect();
    const hint = document.querySelector("#hintButton")?.getBoundingClientRect();
    const sound = document.querySelector("#soundButton")?.getBoundingClientRect();
    const judgePath = document.querySelector(".judge-path")?.getBoundingClientRect();
    const dayMeter = document.querySelector("#dayMeter")?.getBoundingClientRect();
    const objectiveStrip = document.querySelector(".objective-strip")?.getBoundingClientRect();
    const tracePanel = document.querySelector("#tracePanel");
    const phaseProof = document.querySelector("#phaseProof");
    const phaseProofStyle = phaseProof ? getComputedStyle(phaseProof) : null;
    const ordered = [...document.querySelectorAll("body *")];
    const controls = document.querySelector(".quick-controls");
    const canvas = document.querySelector("#game");
    const canvasRect = canvas?.getBoundingClientRect();
    const targetRowBounds = canvas?.dataset.targetRowBounds ? JSON.parse(canvas.dataset.targetRowBounds) : null;
    return {
      demoBeforeCanvas: ordered.indexOf(controls) >= 0 && ordered.indexOf(controls) < ordered.indexOf(canvas),
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      demoVisible: Boolean(demo && demo.top >= 0 && demo.bottom <= innerHeight),
      resetVisible: Boolean(reset && reset.top >= 0 && reset.bottom <= innerHeight && getComputedStyle(document.querySelector("#resetButton")).display !== "none"),
      hintVisible: Boolean(hint && hint.top >= 0 && hint.bottom <= innerHeight),
      soundVisible: Boolean(sound && sound.top >= 0 && sound.bottom <= innerHeight),
      judgePathBeforeCanvas: Boolean(judgePath && canvasRect && judgePath.bottom <= canvasRect.top + 1),
      judgePathAfterCanvas: Boolean(judgePath && canvasRect && judgePath.top >= canvasRect.bottom - 1),
      judgePathVisible: Boolean(judgePath && judgePath.top >= 0 && judgePath.bottom <= innerHeight),
      dayMeterVisible: Boolean(dayMeter && dayMeter.top >= 0 && dayMeter.bottom <= innerHeight),
      dayMeterLabel: document.querySelector("#dayMeterLabel")?.textContent.trim(),
      objectiveVisible: Boolean(objectiveStrip && objectiveStrip.top >= 0 && objectiveStrip.bottom <= innerHeight),
      objective: {
        phase: document.querySelector("#phaseObjective")?.textContent.trim(),
        target: document.querySelector("#phaseTargetLine")?.textContent.trim(),
        alignment: document.querySelector("#phaseAlignment")?.textContent.trim(),
        proof: phaseProof?.textContent.trim(),
        proofFits: phaseProof ? phaseProof.scrollWidth <= phaseProof.clientWidth + 1 : false,
        proofTextOverflow: phaseProofStyle?.textOverflow || "",
      },
      statusLine: document.querySelector("#statusLine")?.textContent.trim(),
      playRule: document.querySelector(".play-rule")?.textContent.trim(),
      judgePathText: document.querySelector(".judge-path")?.textContent.trim(),
      mobileCues: [...document.querySelectorAll(".mobile-cue")].map((node) => ({
        text: node.textContent.trim(),
        visible: getComputedStyle(node).display !== "none",
      })),
      canvasTop: canvasRect?.top,
      canvasVisibleHeight: canvasRect ? Math.max(0, Math.min(canvasRect.bottom, innerHeight) - Math.max(canvasRect.top, 0)) : 0,
      targetRowBounds,
      inputHint: canvas?.dataset.inputHint || "",
      trace: {
        phase: document.querySelector("#tracePhase")?.textContent.trim(),
        match: document.querySelector("#traceMatch")?.textContent.trim(),
        next: document.querySelector("#traceNext")?.textContent.trim(),
        last: document.querySelector("#traceLast")?.textContent.trim(),
        exists: Boolean(tracePanel),
      },
      judgePathCards: [...document.querySelectorAll(".judge-path article strong")].map((node) => node.textContent.trim()),
      heroHook: document.querySelector(".hero-hook")?.textContent.trim(),
      shortcutMap: {
        start: document.querySelector("#startButton")?.getAttribute("aria-keyshortcuts"),
        startText: document.querySelector("#startButton")?.textContent.trim(),
        reset: document.querySelector("#resetButton")?.getAttribute("aria-keyshortcuts"),
        hint: document.querySelector("#hintButton")?.getAttribute("aria-keyshortcuts"),
        demo: document.querySelector("#demoButton")?.getAttribute("aria-keyshortcuts"),
        demoLabel: document.querySelector("#demoButton")?.getAttribute("aria-label"),
        demoPrimary: document.querySelector("#demoButton")?.classList.contains("primary-control"),
        sound: document.querySelector("#soundButton")?.getAttribute("aria-keyshortcuts"),
        soundPressed: document.querySelector("#soundButton")?.getAttribute("aria-pressed"),
        soundLabel: document.querySelector("#soundButton")?.getAttribute("aria-label"),
        soundText: document.querySelector("#soundButton")?.textContent.trim(),
        canvas: canvas?.getAttribute("aria-keyshortcuts"),
        startDisabled: document.querySelector("#startButton")?.disabled,
      },
      controlHeights: [...document.querySelectorAll(".quick-controls button")]
        .filter((button) => getComputedStyle(button).display !== "none")
        .map((button) => button.getBoundingClientRect().height),
      controlTextFits: [...document.querySelectorAll(".quick-controls button")]
        .filter((button) => getComputedStyle(button).display !== "none")
        .every((button) => button.scrollWidth <= button.clientWidth + 1 && button.scrollHeight <= button.clientHeight + 1),
      controlWidths: Object.fromEntries(
        [...document.querySelectorAll(".quick-controls button")]
          .filter((button) => getComputedStyle(button).display !== "none")
          .map((button) => [button.id, Math.round(button.getBoundingClientRect().width)]),
      ),
      judgeLinks: [...document.querySelectorAll(".judge-links a")].map((link) => link.textContent.trim()),
      judgeLinkHrefs: [...document.querySelectorAll(".judge-links a")].map((link) => link.getAttribute("href")),
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
    assert(desktop.title === "Helioigma - Solstice Rotor Turing Ode", "document title no longer carries the solstice/Turing preview hook");
    assert(desktop.canonical === "https://ooyxloo.github.io/helioigma/", "canonical URL changed");
    assert(desktop.ogTitle === "Helioigma - Solstice Rotor Turing Ode", "Open Graph title no longer carries the solstice/Turing preview hook");
    assert(desktop.ogUrl === "https://ooyxloo.github.io/helioigma/", "Open Graph URL changed");
    assert(desktop.demoVisible, "desktop Demo Solve is not visible in the first viewport");
    assert(desktop.hintVisible, "desktop Hint is not visible in the first viewport");
    assert(desktop.soundVisible, "desktop Audio toggle is not visible in the first viewport");
    assert(desktop.canvasTop < 410, `desktop game canvas starts too low for game-first review: ${desktop.canvasTop}`);
    assert(desktop.demoBeforeCanvas, "Demo Solve controls are not before the canvas");
    assert(desktop.dayMeterVisible, "desktop daylight meter is not visible in the first viewport");
    assert(desktop.dayMeterLabel === "45s", "desktop daylight meter did not initialize");
    assert(desktop.objectiveVisible, "desktop phase objective is not visible in the first viewport");
    assert(desktop.objective.phase === "Crib dawn", "phase objective initial label changed");
    assert(desktop.objective.target === "SOL LUX XOR BIN SOL XOR", "phase objective target line changed");
    assert(desktop.objective.alignment === "0/6 nodes aligned", "phase objective alignment changed");
    assert(desktop.objective.proof === "Crib checks state.", "Turing cue initial copy changed");
    assert(desktop.objective.proofFits, "desktop Turing cue text is clipped");
    assert(desktop.heroHook === "Seal the daylight run.", "first screen no longer leads with the game hook");
    assert(desktop.statusLine?.includes("Cycle SOL>XOR>LUX>BIN"), "status line no longer exposes the first-screen node-cycle cue");
    assert(desktop.playRule?.includes("Start with 45s daylight") && desktop.playRule?.includes("Rotate numbered nodes") && desktop.playRule?.includes("match the target glyphs") && desktop.playRule?.includes("survive nightfall") && desktop.playRule?.includes("SOL -> XOR -> LUX -> BIN"), "play rule no longer gives the rushed-judge goal");
    assert(desktop.inputHint === "Tap nodes or press 1-9. H = hint, D = demo.", "desktop canvas lost the first-action input hint");
    assert(desktop.trace.exists, "rotor trace panel is missing");
    assert(desktop.trace.phase === "1 - Crib dawn", "rotor trace initial phase changed");
    assert(desktop.trace.next === "Node 1: XOR -> SOL", "rotor trace initial mismatch changed");
    assert(!desktop.judgePathBeforeCanvas, "desktop Run Path should sit after the canvas so the wheel appears earlier");
    assert(desktop.judgePathCards.join("|") === "1. Match|2. Trace|3. Seal", "run path cards changed");
    assert(desktop.judgePathText?.includes("Finish all four phases") && desktop.judgePathText?.includes("verify the sample receipt"), "run path no longer keeps receipt verification after play");
    assert(desktop.shortcutMap.start === "Enter", "start shortcut is not exposed");
    assert(desktop.shortcutMap.startText === "Start Run", "start button no longer names the play action");
    assert(desktop.shortcutMap.reset === "Escape R", "reset shortcut is not exposed");
    assert(desktop.shortcutMap.hint === "H", "hint shortcut is not exposed");
    assert(desktop.shortcutMap.demo === "D", "demo shortcut is not exposed");
    assert(desktop.shortcutMap.sound === "S", "audio shortcut is not exposed");
    assert(desktop.shortcutMap.soundPressed === "false", "audio cues should default off");
    assert(desktop.shortcutMap.soundLabel === "Audio cues off", "audio default label changed");
    assert(desktop.shortcutMap.soundText === "Audio", "audio default button text changed");
    assert(desktop.shortcutMap.demoLabel === "Demo Solve full judge route", "demo button judge route label is not exposed");
    assert(desktop.shortcutMap.demoPrimary === true, "demo button is not marked as the primary judge control");
    assert(desktop.shortcutMap.canvas === "1 2 3 4 5 6 7 8 9", "node shortcuts are not exposed");
    assert(desktop.controlTextFits, "desktop quick-control text overflows");
    assert(desktop.judgeLinks.includes("Auto demo"), "judge shortcut row does not link the auto demo route");
    assert(desktop.judgeLinks.includes("Verify sample"), "judge shortcut row does not link the sample receipt verifier");
    assert(desktop.judgeLinkHrefs.includes("proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"), "judge shortcut row sample verifier link is not prefilled");
    assert(desktop.judgeLinks.includes("Watch video"), "judge shortcut row does not link the current WebM video");
    assert(desktop.judgeLinkHrefs.includes("helioigma-demo.webm?v=20260615-fresh-media"), "judge shortcut row WebM video link is not cache-busted to the current media");
    assert(desktop.judgeLinks.length === 4, `judge shortcut row should stay focused on four routes, found ${desktop.judgeLinks.length}`);
    assert(!desktop.judgeLinks.includes("Demo GIF"), "judge shortcut row should leave GIF fallback inside the judge pack");

    await page.click("#startButton");
    const startCoach = await page.evaluate(() => ({
      status: document.querySelector("#statusLine")?.textContent.trim(),
      hinted: Boolean(document.querySelector("#nodeButtons .node-button.hinted")),
      recent: Boolean(document.querySelector("#nodeButtons .node-button.recent")),
      traceLast: document.querySelector("#traceLast")?.textContent.trim(),
    }));
    assert(startCoach.status === "First move: rotate node 1 toward SOL.", "start button no longer gives a first-move coach");
    assert(startCoach.hinted && startCoach.recent, "first-move coach does not highlight the next node");
    assert(startCoach.traceLast === "First move cue: node 1 target SOL.", "first-move coach trace changed");
    const activeStart = await readGameFacts(page);
    assert(activeStart.shortcutMap.startDisabled === true, "start button should lock during active manual runs");

    await page.click("#hintButton");
    const hintPulse = await page.evaluate(() => ({
      status: document.querySelector("#statusLine")?.textContent.trim(),
      hinted: Boolean(document.querySelector("#nodeButtons .node-button.hinted")),
      recent: Boolean(document.querySelector("#nodeButtons .node-button.recent")),
      traceLast: document.querySelector("#traceLast")?.textContent.trim(),
    }));
    assert(hintPulse.status === "Hint: rotate node 1 toward SOL.", "hint status no longer gives a clear target");
    assert(hintPulse.hinted && hintPulse.recent, "hint does not create a visible tactile node pulse");
    assert(
      hintPulse.traceLast.startsWith("Hint node 1: target SOL.") && hintPulse.traceLast.includes("Crib scan: first mismatch."),
      "hint trace does not name the target node and phase scan"
    );

    await page.keyboard.press("1");
    const shiftPulse = await page.evaluate(() => ({
      status: document.querySelector("#statusLine")?.textContent.trim(),
      recent: Boolean(document.querySelector("#nodeButtons .node-button.recent")),
      recentLocked: Boolean(document.querySelector("#nodeButtons .node-button.recent-locked")),
      traceLast: document.querySelector("#traceLast")?.textContent.trim(),
    }));
    assert(shiftPulse.status === "Node 1 shifted to LUX; target SOL. Daylight -0.45s.", "manual shift status no longer names current, target glyphs, and daylight penalty");
    assert(shiftPulse.recent && !shiftPulse.recentLocked, "manual shift does not create a visible tactile pulse");
    assert(shiftPulse.traceLast === "Node 1 shifted to LUX.", "manual shift trace changed");

    await page.goto(`${baseUrl}?demo=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#proofPanel")?.hidden === false, { timeout: 25000 });
    await page.waitForFunction(() => document.querySelector("#demoButton")?.disabled === false, { timeout: 5000 });
    const autoDemo = await page.evaluate(() => ({
      receipt: document.querySelector("#proofCode")?.textContent.trim(),
      verifyHref: document.querySelector("#verifyProofLink")?.getAttribute("href"),
      judgeRunSummary: document.querySelector("#judgeRunSummaryText")?.textContent.trim(),
      judgeRunFacts: document.querySelector("#judgeRunFacts")?.textContent.trim(),
      awardSignals: document.querySelector("#awardSignals")?.textContent.trim(),
      copyRunSummaryDisabled: document.querySelector("#copyRunSummaryButton")?.disabled,
      proofPanelTop: document.querySelector("#proofPanel")?.getBoundingClientRect().top,
      proofPanelBottom: document.querySelector("#proofPanel")?.getBoundingClientRect().bottom,
      activeElementId: document.activeElement?.id,
      status: document.querySelector("#statusLine")?.textContent.trim(),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(autoDemo.overflowX === 0, "auto demo route has horizontal overflow");
    assert(autoDemo.receipt === "SC-4P-2907-62-Y5VFX1", "auto demo route did not reach the stable receipt");
    assert(autoDemo.verifyHref === "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1", "auto demo route did not build a verifier link");
    assert(autoDemo.judgeRunSummary.includes("4/4 solstice phases") && autoDemo.judgeRunSummary.includes("2907 score"), "auto demo route did not build the judge run summary");
    assert(autoDemo.judgeRunFacts.includes("state alignment + checksum reasoning"), "auto demo route did not build the judge run facts");
    assert(autoDemo.awardSignals.includes("Solstice loop") && autoDemo.awardSignals.includes("Turing ode") && autoDemo.awardSignals.includes("Judge receipt"), "auto demo route did not expose award signals");
    assert(autoDemo.copyRunSummaryDisabled === false, "auto demo route did not enable the judge summary copy button");
    assert(autoDemo.proofPanelTop >= 0 && autoDemo.proofPanelTop < 450, `auto demo route did not scroll the receipt into view: ${autoDemo.proofPanelTop}`);
    assert(autoDemo.proofPanelBottom > 180, "auto demo route receipt panel is not visible after completion");
    assert(autoDemo.activeElementId === "verifyProofLink", "auto demo route did not focus the verifier link after completion");
    assert(autoDemo.status.includes("Demo solve complete"), "auto demo route did not report demo completion");

    await page.goto(`${baseUrl}?nostore=1`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.setItem("helioigma-best-score", "7777"));
    await page.reload({ waitUntil: "domcontentloaded" });
    const noStoreInitial = await page.evaluate(() => ({
      best: document.querySelector("#bestLabel")?.textContent.trim(),
      stored: localStorage.getItem("helioigma-best-score"),
      playRule: document.querySelector(".play-rule")?.textContent.trim(),
    }));
    assert(noStoreInitial.best === "0", "?nostore=1 should not read the stored best score");
    assert(noStoreInitial.stored === "7777", "?nostore=1 setup did not preserve the stored sentinel");
    assert(noStoreInitial.playRule?.includes("SOL -> XOR -> LUX -> BIN"), "?nostore=1 route lost the visible glyph cycle cue");
    await page.click("#demoButton");
    await page.waitForFunction(() => document.querySelector("#proofPanel")?.hidden === false, { timeout: 25000 });
    const noStoreAfterDemo = await page.evaluate(() => ({
      best: document.querySelector("#bestLabel")?.textContent.trim(),
      stored: localStorage.getItem("helioigma-best-score"),
      receipt: document.querySelector("#proofCode")?.textContent.trim(),
    }));
    assert(noStoreAfterDemo.receipt === "SC-4P-2907-62-Y5VFX1", "?nostore=1 route did not preserve Demo Solve");
    assert(Number(noStoreAfterDemo.best) >= 2907, "?nostore=1 should keep an in-memory best score during the run");
    assert(noStoreAfterDemo.stored === "7777", "?nostore=1 should not overwrite localStorage");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#game")?.dataset.targetRowBounds, { timeout: 5000 });
    const mobile = await readGameFacts(page);
    assert(mobile.overflowX === 0, "mobile has horizontal overflow");
    assert(mobile.demoVisible, "mobile Demo Solve is not visible in the first viewport");
    assert(mobile.resetVisible, "mobile Reset is not visible in the first viewport");
    assert(mobile.hintVisible, "mobile Hint is not visible in the first viewport");
    assert(mobile.soundVisible, "mobile Audio toggle is not visible in the first viewport");
    assert(mobile.controlHeights.every((height) => height >= 40), `mobile visible control buttons are too short: ${mobile.controlHeights.join(",")}`);
    assert(mobile.controlTextFits, "mobile quick-control text overflows");
    assert(mobile.controlWidths.demoButton >= mobile.controlWidths.startButton * 1.75, `mobile Demo Solve is not visually prioritized: ${JSON.stringify(mobile.controlWidths)}`);
    assert(mobile.dayMeterVisible, "mobile daylight meter is not visible in the first viewport");
    assert(mobile.objectiveVisible, "mobile phase objective is not visible in the first viewport");
    assert(mobile.judgePathAfterCanvas, "mobile Run Path should sit after the playable canvas");
    assert(mobile.heroHook === "Seal the daylight run.", "mobile first screen no longer leads with the game hook");
    assert(mobile.judgePathCards.join("|") === "1. Match|2. Trace|3. Seal", "mobile run path cards changed");
    assert(mobile.mobileCues.map((cue) => cue.text).join("|") === "Rotate|Trace|Receipt", "mobile run path cues changed");
    assert(mobile.mobileCues.every((cue) => cue.visible), "mobile run path explanatory cues are not visible");
    assert(mobile.playRule?.includes("SOL -> XOR -> LUX -> BIN"), "mobile play rule lost the visible glyph cycle cue");
    assert(mobile.inputHint === "Tap nodes or press 1-9. H = hint, D = demo.", "mobile canvas lost the first-action input hint");
    assert(mobile.objective.phase === "Crib dawn", "mobile phase objective initial label changed");
    assert(mobile.statusLine?.includes("Cycle SOL>XOR>LUX>BIN"), "mobile status line no longer exposes the node-cycle cue");
    assert(
      mobile.objective.proof === "Crib checks state.",
      "mobile Turing cue initial copy changed"
    );
    assert(mobile.objective.proofFits, "mobile Turing cue text is clipped");
    assert(mobile.objective.proofTextOverflow !== "ellipsis", "mobile Turing cue is still ellipsized");
    assert(mobile.targetRowBounds, "mobile target row bounds were not published by the canvas renderer");
    assert(mobile.targetRowBounds.left >= 24, `mobile target row is too close to the left canvas edge: ${JSON.stringify(mobile.targetRowBounds)}`);
    assert(mobile.targetRowBounds.right <= mobile.targetRowBounds.width - 24, `mobile target row is too close to the right canvas edge: ${JSON.stringify(mobile.targetRowBounds)}`);
    assert(mobile.targetRowBounds.inset >= 48, `mobile target row inset is too small for glyph labels: ${JSON.stringify(mobile.targetRowBounds)}`);
    assert(mobile.canvasTop < 400, `mobile game canvas starts too low for game-first review: ${mobile.canvasTop}`);
    assert(mobile.canvasVisibleHeight >= 330, `mobile first viewport shows too little gameplay canvas: ${mobile.canvasVisibleHeight}`);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${baseUrl}judge.html`, { waitUntil: "domcontentloaded" });
    const judge = await page.evaluate(() => ({
      actions: [...document.querySelectorAll(".action strong")].map((node) => node.textContent.trim()),
      heading: document.querySelector("h1")?.textContent.trim(),
      dek: document.querySelector(".dek")?.textContent.trim(),
      primaryActions: [...document.querySelectorAll(".primary-actions .action strong")].map((node) => node.textContent.trim()),
      evidenceActions: [...document.querySelectorAll(".evidence-actions .action strong")].map((node) => node.textContent.trim()),
      reviewSteps: [...document.querySelectorAll(".review-flow ol strong")].map((node) => node.textContent.trim()),
      primaryInsideVisualHero: Boolean(document.querySelector(".visual-judge-hero .primary-actions")),
      primaryInsideReview: Boolean(document.querySelector(".review-flow .primary-actions")),
      reviewBeforeEvidence: Boolean(
        document.querySelector(".review-flow") &&
        document.querySelector(".evidence-actions") &&
        (document.querySelector(".review-flow").compareDocumentPosition(document.querySelector(".evidence-actions")) & Node.DOCUMENT_POSITION_FOLLOWING),
      ),
      hasDevConsole: document.body.innerText.includes("DEV Console"),
      hasGif: document.body.innerText.includes("GIF"),
      hasWebm: document.body.innerText.includes("WebM"),
      hasRunReceiptCopy: document.body.innerText.includes("run receipt"),
      hasRunProofCopy: document.body.innerText.includes("run proof"),
      hasNightfallRecovery: document.body.innerText.includes("Nightfall Recovery"),
      hasNightfallRecoveryCopy: document.body.innerText.includes("the Nightfall report summarizes aligned nodes"),
      hasOldPublicPageCopy: document.body.innerText.includes("Watch the public page complete all four phases"),
      hasPlayablePageCopy: document.body.innerText.includes("Watch the playable page complete all four phases"),
      hasPrefilledVerifierCopy: document.body.innerText.includes("pre-filled sample verifier") || document.body.innerText.includes("prefilled sample verifier"),
      hasOfficialRouteSnapshot: document.body.innerText.toLowerCase().includes("official route snapshot"),
      routeSnapshotItems: [...document.querySelectorAll(".route-snapshot strong")].map((node) => node.textContent.trim()),
      hasPrizeRouteCopy: document.body.innerText.includes("Best Ode to Alan Turing category route in the official challenge"),
      hasDeadlineCopy: document.body.innerText.includes("June 21, 2026 at 11:59 PM PDT"),
      hasBoundaryCopy: document.body.innerText.includes("No Google AI claim, backend, account login, API key, or private data"),
      hasRubricSnapshot: document.body.innerText.includes("Rubric snapshot"),
      hasAwardThesis: document.body.innerText.toLowerCase().includes("award thesis"),
      hasVisualJudgeHero: document.body.innerText.toLowerCase().includes("visual judge start"),
      hasVisualJudgeCopy: document.body.innerText.toLowerCase().includes("the core artifact is a playable rotor puzzle"),
      hasTimedLoopCopy: document.body.innerText.toLowerCase().includes("timed node-rotation loop"),
      hasPlayabilityProof: document.body.innerText.includes("Playability proof"),
      playabilityItems: [...document.querySelectorAll(".playability-item strong")].map((node) => node.textContent.trim()),
      playabilityCopy: document.querySelector('[aria-label="Playability proof"]')?.textContent.trim() || "",
      visualHeroVideoSrc: document.querySelector(".visual-judge-hero video")?.getAttribute("src"),
      visualHeroVideoPoster: document.querySelector(".visual-judge-hero video")?.getAttribute("poster"),
      demoFrameImageSrc: document.querySelector(".demo-frame img")?.getAttribute("src"),
      visualHeroTop: document.querySelector(".visual-judge-hero")?.getBoundingClientRect().top,
      visualHeroBottom: document.querySelector(".visual-judge-hero")?.getBoundingClientRect().bottom,
      verdictItems: [...document.querySelectorAll(".review-verdict strong")].map((node) => node.textContent.trim()),
      standoutHeading: [...document.querySelectorAll(".rubric-snapshot h2")].some((node) => node.textContent.trim() === "Why it stands out in a jam review"),
      standoutItems: [...document.querySelectorAll(".standout-item strong")].map((node) => node.textContent.trim()),
      standoutCopy: document.querySelector('[aria-label="Why Helioigma stands out"]')?.textContent.trim() || "",
      rubricItems: [...document.querySelectorAll(".rubric-item strong")].map((node) => node.textContent.trim()),
      hasPublishAssistant: document.body.innerText.includes("Publish Assistant"),
      usesRadialGradient: getComputedStyle(document.body).backgroundImage.includes("radial-gradient"),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      verifyReceiptHref: document.querySelector('.evidence-actions a[href^="proof-verifier.html"]')?.getAttribute("href"),
      scorecardHref: document.querySelector(".evidence-actions a[href$='RUBRIC_SCORECARD.md']")?.getAttribute("href"),
      storyHref: document.querySelector(".evidence-actions a[href$='dev-article-final.md']")?.getAttribute("href"),
      readmeHref: document.querySelector(".evidence-actions a[href$='README.md']")?.getAttribute("href"),
    }));
    assert(judge.overflowX === 0, "judge page has horizontal overflow");
    assert(judge.heading === "Helioigma is a playable Turing ode for holding the longest day.", "judge page heading no longer leads with the award thesis");
    assert(judge.dek?.includes("small static four-phase game") && judge.dek?.includes("transparent receipt") && judge.dek?.includes("receipt checker"), "judge page deck no longer gives the quick review frame");
    assert(judge.hasGif, "judge page does not point to the current GIF");
    assert(judge.hasWebm, "judge page does not point to the current WebM video");
    assert(judge.hasRunReceiptCopy, "judge page does not use run receipt wording");
    assert(!judge.hasRunProofCopy, "judge page still exposes run proof wording");
    assert(judge.hasNightfallRecovery, "judge page is missing Nightfall Recovery card");
    assert(judge.hasNightfallRecoveryCopy, "judge page does not describe Nightfall recovery behavior");
    assert(!judge.hasOldPublicPageCopy, "judge page still calls the prelaunch route a public page");
    assert(judge.hasPlayablePageCopy, "judge page does not describe the playable page review path");
    assert(judge.hasPrefilledVerifierCopy, "judge page does not describe the prefilled verifier path");
    assert(judge.hasOfficialRouteSnapshot, "judge page is missing the official route snapshot");
    assert(judge.routeSnapshotItems.join("|") === "Prize route|Submit by|Judge run|Boundary", "judge page official route snapshot changed");
    assert(judge.hasPrizeRouteCopy, "judge page does not name the Turing category route");
    assert(judge.hasDeadlineCopy, "judge page does not name the submission deadline");
    assert(judge.hasBoundaryCopy, "judge page does not state the no-Google-AI/no-private-data boundary");
    assert(judge.verifyReceiptHref === "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1", "judge page verifier action is not prefilled");
    assert(judge.hasRubricSnapshot, "judge page is missing rubric snapshot");
    assert(judge.hasAwardThesis, "judge page is missing the award thesis");
    assert(judge.hasVisualJudgeHero, "judge page is missing the visual judge hero");
    assert(judge.hasVisualJudgeCopy, "judge page does not lead with a playable-game visual claim");
    assert(judge.hasTimedLoopCopy, "judge page does not foreground the timed node-rotation loop");
    assert(judge.hasPlayabilityProof, "judge page is missing the playability proof section");
    assert(judge.playabilityItems.join("|") === "Readable decisions|Immediate feedback|Finished failure state", "judge playability proof cards changed");
    const playabilityCopy = judge.playabilityCopy.toLowerCase();
    assert(playabilityCopy.includes("short, finishable jam game") && playabilityCopy.includes("choose a node") && playabilityCopy.includes("nightfall wins"), "judge playability proof no longer foregrounds game feel");
    assert(judge.visualHeroVideoSrc === "helioigma-demo.webm?v=20260615-fresh-media", "judge page visual hero does not use the current cache-busted WebM demo");
    assert(judge.visualHeroVideoPoster === "desktop-check-v5.png?v=20260615-fresh-media", "judge page visual hero does not retain the current cache-busted gameplay screenshot poster");
    assert(judge.demoFrameImageSrc === "helioigma-demo.gif?v=20260615-fresh-media", "judge page demo frame does not use the current cache-busted animated GIF");
    assert(judge.visualHeroTop >= 0 && judge.visualHeroTop < 420, "judge page visual hero is not in the first viewport");
    assert(judge.visualHeroBottom <= 900, "judge page visual hero is too tall for desktop first viewport");
    assert(judge.verdictItems.join("|") === "Playable ode|Inspectable run|Finished surface", "judge award thesis cards changed");
    assert(judge.standoutHeading, "judge page is missing the competitive standout section");
    assert(judge.standoutItems.join("|") === "Not a write-up wrapper|Theme in mechanics|Fast judge confidence|Publication-safe|Finished on failure|Crowded-queue signal", "judge standout cards changed");
    const standoutCopy = judge.standoutCopy.toLowerCase();
    assert(standoutCopy.includes("avoids the common prototype traps") && standoutCopy.includes("the first click opens a timed rotor puzzle") && standoutCopy.includes("same static route instead of separate screenshots") && standoutCopy.includes("losing path also feels complete") && standoutCopy.includes("timed game loop with public receipt evidence"), "judge standout copy no longer names the competitive edge");
    assert(judge.rubricItems.join("|") === "Theme relevance|Creativity|Technical execution|Writing quality|Turing category", "judge rubric snapshot changed");
    assert(!judge.usesRadialGradient, "judge page still uses radial background blobs");
    assert(!judge.hasDevConsole, "judge page exposes DEV Console");
    assert(!judge.hasPublishAssistant, "judge page exposes Publish Assistant");
    assert(judge.actions.includes("Watch Video"), "judge page is missing video action");
    assert(judge.actions.includes("Auto Demo"), "judge page is missing auto demo action");
    assert(judge.actions.includes("Run Smoke Test"), "judge page is missing smoke action");
    assert(judge.actions.includes("Verify Receipt"), "judge page is missing verifier action");
    assert(judge.actions.includes("Open Scorecard"), "judge page is missing scorecard action");
    assert(judge.actions.includes("Open Manifest"), "judge page is missing manifest action");
    assert(judge.primaryActions.join("|") === "Play|Auto Demo", "judge page primary actions should lead with Play before Auto Demo");
    assert(judge.reviewSteps.join("|") === "Play First.|Open Auto Demo.|Verify Receipt.|Check Source.|Optional Smoke.", "judge review steps changed");
    assert(judge.evidenceActions.includes("Source"), "judge page evidence row is missing source");
    assert(judge.evidenceActions.includes("Open Scorecard"), "judge page evidence row is missing scorecard");
    assert(judge.evidenceActions.includes("Open Manifest"), "judge page evidence row is missing manifest");
    assert(judge.evidenceActions.includes("Read README"), "judge page evidence row is missing README");
    assert(judge.scorecardHref === "RUBRIC_SCORECARD.md", "judge page scorecard action is not a local package link");
    assert(judge.storyHref === "dev-article-final.md", "judge page story action is not a local package link");
    assert(judge.readmeHref === "README.md", "judge page README action is not a local package link");
    assert(judge.primaryInsideVisualHero, "judge page primary actions are not embedded in the visual judge hero");
    assert(!judge.primaryInsideReview, "judge page repeats primary actions inside the 60-second review path");
    assert(judge.reviewBeforeEvidence, "judge page does not put the 60-second review path before evidence links");

    await Promise.all([
      assertLocalAssetOk(baseUrl, "helioigma-demo.webm?v=20260615-fresh-media", "video/webm"),
      assertLocalAssetOk(baseUrl, "helioigma-demo.gif?v=20260615-fresh-media", "image/gif"),
      assertLocalAssetOk(baseUrl, "desktop-check-v5.png?v=20260615-fresh-media", "image/png"),
      assertLocalAssetOk(baseUrl, "smoke.html", "text/html"),
      assertLocalAssetOk(baseUrl, "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1", "text/html"),
      assertLocalAssetOk(baseUrl, "verification.html", "text/html"),
      assertLocalAssetOk(baseUrl, "judge-manifest.json", "application/json"),
      assertLocalAssetOk(baseUrl, "RUBRIC_SCORECARD.md", "text/markdown"),
      assertLocalAssetOk(baseUrl, "README.md", "text/markdown"),
      assertLocalAssetOk(baseUrl, "dev-article-final.md", "text/markdown"),
    ]);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}judge.html`, { waitUntil: "domcontentloaded" });
    const mobileJudge = await page.evaluate(() => {
      const media = document.querySelector(".visual-judge-hero video")?.getBoundingClientRect();
      const actions = document.querySelector(".visual-judge-hero .primary-actions")?.getBoundingClientRect();
      return {
        imageVisible: Boolean(media && media.top < innerHeight && media.bottom > 0),
        actionsVisible: Boolean(actions && actions.top < innerHeight && actions.bottom <= innerHeight),
        primaryActions: [...document.querySelectorAll(".visual-judge-hero .action strong")].map((node) => node.textContent.trim()),
        standoutItems: [...document.querySelectorAll(".standout-item strong")].map((node) => node.textContent.trim()),
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    assert(mobileJudge.overflowX === 0, "mobile judge page has horizontal overflow");
    assert(mobileJudge.imageVisible, "mobile judge page does not show the visual gameplay asset in the first viewport");
    assert(mobileJudge.actionsVisible, "mobile judge page does not show Play and Auto Demo in the first viewport");
    assert(mobileJudge.primaryActions.join("|") === "Play|Auto Demo", "mobile judge page primary actions changed");
    assert(mobileJudge.standoutItems.join("|") === "Not a write-up wrapper|Theme in mechanics|Fast judge confidence|Publication-safe|Finished on failure|Crowded-queue signal", "mobile judge page standout cards changed");

    const manifestResponse = await page.goto(`${baseUrl}judge-manifest.json`);
    assert(manifestResponse?.ok(), "judge manifest did not return HTTP 200");
    assert((manifestResponse.headers()["content-type"] || "").includes("application/json"), "judge manifest did not return application/json");
    const manifest = JSON.parse(await page.textContent("body"));
    assert(manifest.project === "Helioigma", "judge manifest project changed");
    assert(manifest.public_urls?.auto_demo === "https://ooyxloo.github.io/helioigma/?demo=1", "judge manifest auto demo URL changed");
    assert(manifest.public_urls?.sample_receipt_verifier === "https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1", "judge manifest sample receipt verifier URL changed");
    assert(manifest.challenge?.target_prize_usd === 200, "judge manifest prize target changed");
    assert(manifest.challenge?.target_category === "Best Ode to Alan Turing", "judge manifest category changed");
    assert(manifest.challenge?.official_route_snapshot?.prize_route === "Best Ode to Alan Turing category route in the official challenge.", "judge manifest official route prize changed");
    assert(manifest.challenge?.official_route_snapshot?.boundary?.startsWith("No Google AI claim"), "judge manifest official route boundary changed");
    assert(manifest.challenge?.award_thesis?.startsWith("Helioigma is a playable ode"), "judge manifest award thesis changed");
    assert(manifest.challenge?.playability_proof?.length === 3, "judge manifest playability proof changed");
    assert(manifest.challenge?.playability_proof?.map((item) => item.claim).join("|") === "Readable decisions|Immediate feedback|Finished failure state", "judge manifest playability proof claims changed");
    assert(manifest.challenge?.rubric_snapshot?.length === 5, "judge manifest rubric snapshot changed");
    assert(manifest.proof?.stable_receipt === "SC-4P-2907-62-Y5VFX1", "judge manifest proof changed");
    assert(manifest.verification?.expected_smoke_checks === 70, "judge manifest smoke count changed");
    assert(manifest.proof?.score_basis?.includes("Score rewards held daylight"), "judge manifest score basis changed");
    assert(manifest.proof?.nightfall_recovery?.includes("Nightfall report"), "judge manifest nightfall recovery changed");
    assert(manifest.status?.no_secrets === true, "judge manifest no-secret boundary changed");
    assert(manifest.challenge?.crowded_jam_differentiator?.game_first?.includes("Timed node decisions"), "judge manifest crowded-jam differentiator missing game-first signal");
    assert(manifest.challenge?.crowded_jam_differentiator?.finished_failure?.includes("Nightfall reports"), "judge manifest crowded-jam differentiator missing finished-failure signal");

    const videoResponse = await page.goto(`${baseUrl}helioigma-demo.webm`);
    assert(videoResponse?.ok(), "WebM demo did not return HTTP 200");
    assert((videoResponse.headers()["content-type"] || "").includes("video/webm"), "WebM demo did not return video/webm");

    await page.goto(`${baseUrl}proof-verifier.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#result")?.textContent.includes("Stable Demo Solve receipt"));
    const proof = await page.evaluate(() => ({
      facts: [...document.querySelectorAll("#proofFacts dd")].map((node) => node.textContent.trim()),
      hasCaveat: document.body.innerText.includes("not anti-cheat, identity, payout, or eligibility proof"),
      hasProofBoundary: document.body.innerText.toLowerCase().includes("what this checks") && document.body.innerText.toLowerCase().includes("what this does not check"),
      hasSamplePayload: document.body.innerText.includes("solstice|4|2907|62|4"),
      hasSourceNote: document.body.innerText.includes("Generated in game.js by buildRunProof") || document.body.innerText.includes("generated in game.js by buildRunProof"),
      hasNeutralBoundary: document.body.innerText.includes("Other formula-valid receipts are shown as neutral checksum-form matches"),
      usesRadialGradient: getComputedStyle(document.body).backgroundImage.includes("radial-gradient"),
      result: document.querySelector("#result")?.textContent.trim(),
      resultClass: document.querySelector("#result")?.className,
    }));
    assert(proof.result === "Stable Demo Solve receipt: 2907 points across 62 shifts.", "proof verifier did not validate the stable receipt");
    assert(proof.resultClass.includes("ok"), "stable receipt should be the only green receipt state");
    assert(proof.hasCaveat, "proof verifier is missing the receipt caveat");
    assert(proof.hasProofBoundary, "proof verifier is missing the proof boundary explanation");
    assert(proof.hasSamplePayload, "proof verifier is missing the sample payload breakdown");
    assert(proof.hasSourceNote, "proof verifier is missing the generator source note");
    assert(proof.hasNeutralBoundary, "proof verifier is missing the non-stable formula-valid boundary");
    assert(!proof.usesRadialGradient, "proof verifier still uses radial background blobs");
    assert(proof.facts.join("|") === "4/4|2907|62|Y5VFX1", "proof verifier facts changed");

    await page.goto(`${baseUrl}proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#result")?.textContent.includes("Stable Demo Solve receipt"));
    const proofFromQuery = await page.evaluate(() => ({
      input: document.querySelector("#proofInput")?.value.trim(),
      result: document.querySelector("#result")?.textContent.trim(),
    }));
    assert(proofFromQuery.input === "SC-4P-2907-62-Y5VFX1", "proof verifier did not read receipt query parameter");
    assert(proofFromQuery.result === "Stable Demo Solve receipt: 2907 points across 62 shifts.", "proof verifier query route did not validate");

    await page.evaluate(() => {
      const input = document.querySelector("#proofInput");
      input.value = "SC-4P-2907-63-3HZ0GI";
      document.querySelector("#verifyButton").click();
    });
    const neutralProof = await page.evaluate(() => ({
      result: document.querySelector("#result")?.textContent.trim(),
      resultClass: document.querySelector("#result")?.className,
    }));
    assert(neutralProof.result === "Checksum-form valid, but not the published stable Demo Solve receipt.", "non-stable formula-valid receipt should be neutral");
    assert(neutralProof.resultClass.includes("neutral") && !neutralProof.resultClass.includes("ok"), "non-stable formula-valid receipt should not be green");

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
    assert(smoke.checks === 70, `expected 70 smoke checks, got ${smoke.checks}`);
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
