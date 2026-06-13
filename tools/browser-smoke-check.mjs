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
    const hint = document.querySelector("#hintButton")?.getBoundingClientRect();
    const judgePath = document.querySelector(".judge-path")?.getBoundingClientRect();
    const dayMeter = document.querySelector("#dayMeter")?.getBoundingClientRect();
    const objectiveStrip = document.querySelector(".objective-strip")?.getBoundingClientRect();
    const tracePanel = document.querySelector("#tracePanel");
    const ordered = [...document.querySelectorAll("body *")];
    const controls = document.querySelector(".quick-controls");
    const canvas = document.querySelector("#game");
    const canvasRect = canvas?.getBoundingClientRect();
    return {
      demoBeforeCanvas: ordered.indexOf(controls) >= 0 && ordered.indexOf(controls) < ordered.indexOf(canvas),
      demoVisible: Boolean(demo && demo.top >= 0 && demo.bottom <= innerHeight),
      hintVisible: Boolean(hint && hint.top >= 0 && hint.bottom <= innerHeight),
      judgePathBeforeCanvas: Boolean(judgePath && ordered.indexOf(document.querySelector(".judge-path")) >= 0 && ordered.indexOf(document.querySelector(".judge-path")) < ordered.indexOf(canvas)),
      judgePathVisible: Boolean(judgePath && judgePath.top >= 0 && judgePath.bottom <= innerHeight),
      dayMeterVisible: Boolean(dayMeter && dayMeter.top >= 0 && dayMeter.bottom <= innerHeight),
      dayMeterLabel: document.querySelector("#dayMeterLabel")?.textContent.trim(),
      objectiveVisible: Boolean(objectiveStrip && objectiveStrip.top >= 0 && objectiveStrip.bottom <= innerHeight),
      objective: {
        phase: document.querySelector("#phaseObjective")?.textContent.trim(),
        target: document.querySelector("#phaseTargetLine")?.textContent.trim(),
        alignment: document.querySelector("#phaseAlignment")?.textContent.trim(),
      },
      canvasTop: canvasRect?.top,
      canvasVisibleHeight: canvasRect ? Math.max(0, Math.min(canvasRect.bottom, innerHeight) - Math.max(canvasRect.top, 0)) : 0,
      trace: {
        phase: document.querySelector("#tracePhase")?.textContent.trim(),
        match: document.querySelector("#traceMatch")?.textContent.trim(),
        next: document.querySelector("#traceNext")?.textContent.trim(),
        last: document.querySelector("#traceLast")?.textContent.trim(),
        exists: Boolean(tracePanel),
      },
      judgePathCards: [...document.querySelectorAll(".judge-path article strong")].map((node) => node.textContent.trim()),
      shortcutMap: {
        start: document.querySelector("#startButton")?.getAttribute("aria-keyshortcuts"),
        reset: document.querySelector("#resetButton")?.getAttribute("aria-keyshortcuts"),
        hint: document.querySelector("#hintButton")?.getAttribute("aria-keyshortcuts"),
        demo: document.querySelector("#demoButton")?.getAttribute("aria-keyshortcuts"),
        demoLabel: document.querySelector("#demoButton")?.getAttribute("aria-label"),
        demoPrimary: document.querySelector("#demoButton")?.classList.contains("primary-control"),
        canvas: canvas?.getAttribute("aria-keyshortcuts"),
      },
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
    assert(desktop.demoVisible, "desktop Demo Solve is not visible in the first viewport");
    assert(desktop.hintVisible, "desktop Hint is not visible in the first viewport");
    assert(desktop.canvasTop < 520, `desktop game canvas starts too low: ${desktop.canvasTop}`);
    assert(desktop.demoBeforeCanvas, "Demo Solve controls are not before the canvas");
    assert(desktop.judgePathVisible, "desktop Judge path is not visible in the first viewport");
    assert(desktop.dayMeterVisible, "desktop daylight meter is not visible in the first viewport");
    assert(desktop.dayMeterLabel === "45s", "desktop daylight meter did not initialize");
    assert(desktop.objectiveVisible, "desktop phase objective is not visible in the first viewport");
    assert(desktop.objective.phase === "Crib dawn", "phase objective initial label changed");
    assert(desktop.objective.target === "SOL LUX XOR BIN SOL XOR", "phase objective target line changed");
    assert(desktop.objective.alignment === "0/6 nodes aligned", "phase objective alignment changed");
    assert(desktop.trace.exists, "rotor trace panel is missing");
    assert(desktop.trace.phase === "1 - Crib dawn", "rotor trace initial phase changed");
    assert(desktop.trace.next === "Node 1: XOR -> SOL", "rotor trace initial mismatch changed");
    assert(desktop.judgePathBeforeCanvas, "Judge path is not before the canvas");
    assert(desktop.judgePathCards.join("|") === "1. Play|2. Demo Solve + Rotor Trace|3. Receipt", "Judge path cards changed");
    assert(desktop.shortcutMap.start === "Enter", "start shortcut is not exposed");
    assert(desktop.shortcutMap.reset === "Escape R", "reset shortcut is not exposed");
    assert(desktop.shortcutMap.hint === "H", "hint shortcut is not exposed");
    assert(desktop.shortcutMap.demo === "D", "demo shortcut is not exposed");
    assert(desktop.shortcutMap.demoLabel === "Demo Solve full judge route", "demo button judge route label is not exposed");
    assert(desktop.shortcutMap.demoPrimary === true, "demo button is not marked as the primary judge control");
    assert(desktop.shortcutMap.canvas === "1 2 3 4 5 6 7 8 9", "node shortcuts are not exposed");
    assert(desktop.judgeLinks.includes("Auto demo"), "first screen does not link the auto demo route");
    assert(desktop.judgeLinks.includes("Verify sample"), "first screen does not link the sample receipt verifier");
    assert(desktop.judgeLinkHrefs.includes("proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"), "first screen sample verifier link is not prefilled");
    assert(desktop.judgeLinks.includes("Demo GIF"), "first screen does not link the current GIF");

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

    await page.click("#hintButton");
    const hintPulse = await page.evaluate(() => ({
      status: document.querySelector("#statusLine")?.textContent.trim(),
      hinted: Boolean(document.querySelector("#nodeButtons .node-button.hinted")),
      recent: Boolean(document.querySelector("#nodeButtons .node-button.recent")),
      traceLast: document.querySelector("#traceLast")?.textContent.trim(),
    }));
    assert(hintPulse.status === "Hint: rotate node 1 toward SOL.", "hint status no longer gives a clear target");
    assert(hintPulse.hinted && hintPulse.recent, "hint does not create a visible tactile node pulse");
    assert(hintPulse.traceLast === "Hint node 1: target SOL.", "hint trace does not name the target node");

    await page.keyboard.press("1");
    const shiftPulse = await page.evaluate(() => ({
      status: document.querySelector("#statusLine")?.textContent.trim(),
      recent: Boolean(document.querySelector("#nodeButtons .node-button.recent")),
      recentLocked: Boolean(document.querySelector("#nodeButtons .node-button.recent-locked")),
      traceLast: document.querySelector("#traceLast")?.textContent.trim(),
    }));
    assert(shiftPulse.status === "Node 1 shifted to LUX; target SOL.", "manual shift status no longer names current and target glyphs");
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
      status: document.querySelector("#statusLine")?.textContent.trim(),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(autoDemo.overflowX === 0, "auto demo route has horizontal overflow");
    assert(autoDemo.receipt === "SC-4P-2907-62-Y5VFX1", "auto demo route did not reach the stable receipt");
    assert(autoDemo.verifyHref === "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1", "auto demo route did not build a verifier link");
    assert(autoDemo.judgeRunSummary.includes("4/4 solstice phases") && autoDemo.judgeRunSummary.includes("2907 score"), "auto demo route did not build the judge run summary");
    assert(autoDemo.judgeRunFacts.includes("state alignment + checksum reasoning"), "auto demo route did not build the judge run facts");
    assert(autoDemo.awardSignals.includes("Solstice loop") && autoDemo.awardSignals.includes("Turing ode") && autoDemo.awardSignals.includes("Judge proof"), "auto demo route did not expose award signals");
    assert(autoDemo.copyRunSummaryDisabled === false, "auto demo route did not enable the judge summary copy button");
    assert(autoDemo.status.includes("Demo solve complete"), "auto demo route did not report demo completion");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    const mobile = await readGameFacts(page);
    assert(mobile.overflowX === 0, "mobile has horizontal overflow");
    assert(mobile.demoVisible, "mobile Demo Solve is not visible in the first viewport");
    assert(mobile.hintVisible, "mobile Hint is not visible in the first viewport");
    assert(mobile.dayMeterVisible, "mobile daylight meter is not visible in the first viewport");
    assert(mobile.objectiveVisible, "mobile phase objective is not visible in the first viewport");
    assert(mobile.judgePathVisible, "mobile Judge path is not visible in the first viewport");
    assert(mobile.judgePathBeforeCanvas, "mobile Judge path is not before the canvas");
    assert(mobile.judgePathCards.join("|") === "1. Play|2. Demo Solve + Rotor Trace|3. Receipt", "mobile Judge path cards changed");
    assert(mobile.objective.phase === "Crib dawn", "mobile phase objective initial label changed");
    assert(mobile.canvasTop < 844, "mobile game canvas does not begin in the first viewport");
    assert(mobile.canvasVisibleHeight >= 260, `mobile first viewport shows too little gameplay canvas: ${mobile.canvasVisibleHeight}`);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${baseUrl}judge.html`, { waitUntil: "domcontentloaded" });
    const judge = await page.evaluate(() => ({
      actions: [...document.querySelectorAll(".action strong")].map((node) => node.textContent.trim()),
      primaryActions: [...document.querySelectorAll(".primary-actions .action strong")].map((node) => node.textContent.trim()),
      evidenceActions: [...document.querySelectorAll(".evidence-actions .action strong")].map((node) => node.textContent.trim()),
      reviewSteps: [...document.querySelectorAll(".review-flow ol strong")].map((node) => node.textContent.trim()),
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
      hasOldPublicPageCopy: document.body.innerText.includes("Watch the public page complete all four phases"),
      hasPlayablePageCopy: document.body.innerText.includes("Watch the playable page complete all four phases"),
      hasPrefilledVerifierCopy: document.body.innerText.includes("pre-filled sample verifier") || document.body.innerText.includes("prefilled sample verifier"),
      hasRubricSnapshot: document.body.innerText.includes("Rubric snapshot"),
      hasAwardThesis: document.body.innerText.toLowerCase().includes("award thesis"),
      verdictItems: [...document.querySelectorAll(".review-verdict strong")].map((node) => node.textContent.trim()),
      rubricItems: [...document.querySelectorAll(".rubric-item strong")].map((node) => node.textContent.trim()),
      hasPublishAssistant: document.body.innerText.includes("Publish Assistant"),
      usesRadialGradient: getComputedStyle(document.body).backgroundImage.includes("radial-gradient"),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      verifyReceiptHref: document.querySelector('.evidence-actions a[href^="proof-verifier.html"]')?.getAttribute("href"),
    }));
    assert(judge.overflowX === 0, "judge page has horizontal overflow");
    assert(judge.hasGif, "judge page does not point to the current GIF");
    assert(judge.hasWebm, "judge page does not point to the current WebM video");
    assert(judge.hasRunReceiptCopy, "judge page does not use run receipt wording");
    assert(!judge.hasRunProofCopy, "judge page still exposes run proof wording");
    assert(!judge.hasOldPublicPageCopy, "judge page still calls the prelaunch route a public page");
    assert(judge.hasPlayablePageCopy, "judge page does not describe the playable page review path");
    assert(judge.hasPrefilledVerifierCopy, "judge page does not describe the prefilled verifier path");
    assert(judge.verifyReceiptHref === "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1", "judge page verifier action is not prefilled");
    assert(judge.hasRubricSnapshot, "judge page is missing rubric snapshot");
    assert(judge.hasAwardThesis, "judge page is missing the award thesis");
    assert(judge.verdictItems.join("|") === "Playable ode|Judge-verifiable|Finished surface", "judge award thesis cards changed");
    assert(judge.rubricItems.join("|") === "Theme relevance|Creativity|Technical execution|Writing quality|Turing category", "judge rubric snapshot changed");
    assert(!judge.usesRadialGradient, "judge page still uses radial background blobs");
    assert(!judge.hasDevConsole, "judge page exposes DEV Console");
    assert(!judge.hasPublishAssistant, "judge page exposes Publish Assistant");
    assert(judge.actions.includes("Watch Video"), "judge page is missing video action");
    assert(judge.actions.includes("Auto Demo"), "judge page is missing auto demo action");
    assert(judge.actions.includes("Run Smoke Test"), "judge page is missing smoke action");
    assert(judge.actions.includes("Verify Receipt"), "judge page is missing verifier action");
    assert(judge.actions.includes("Open Manifest"), "judge page is missing manifest action");
    assert(judge.primaryActions.join("|") === "Play|Auto Demo", "judge page primary actions should lead with Play before Auto Demo");
    assert(judge.reviewSteps.join("|") === "Play First.|Open Auto Demo.|Run Smoke Test.|Verify Receipt.|Check Source.", "judge review steps changed");
    assert(judge.evidenceActions.includes("Source"), "judge page evidence row is missing source");
    assert(judge.evidenceActions.includes("Open Manifest"), "judge page evidence row is missing manifest");
    assert(judge.evidenceActions.includes("Read README"), "judge page evidence row is missing README");
    assert(judge.primaryInsideReview, "judge page primary actions are not embedded in the 60-second review path");
    assert(judge.reviewBeforeEvidence, "judge page does not put the 60-second review path before evidence links");

    const manifestResponse = await page.goto(`${baseUrl}judge-manifest.json`);
    assert(manifestResponse?.ok(), "judge manifest did not return HTTP 200");
    assert((manifestResponse.headers()["content-type"] || "").includes("application/json"), "judge manifest did not return application/json");
    const manifest = JSON.parse(await page.textContent("body"));
    assert(manifest.project === "Helioigma", "judge manifest project changed");
    assert(manifest.public_urls?.auto_demo === "https://ooyxloo.github.io/helioigma/?demo=1", "judge manifest auto demo URL changed");
    assert(manifest.public_urls?.sample_receipt_verifier === "https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1", "judge manifest sample receipt verifier URL changed");
    assert(manifest.challenge?.target_prize_usd === 200, "judge manifest prize target changed");
    assert(manifest.challenge?.target_category === "Best Ode to Alan Turing", "judge manifest category changed");
    assert(manifest.challenge?.award_thesis?.startsWith("Helioigma is a playable ode"), "judge manifest award thesis changed");
    assert(manifest.challenge?.rubric_snapshot?.length === 5, "judge manifest rubric snapshot changed");
    assert(manifest.proof?.stable_receipt === "SC-4P-2907-62-Y5VFX1", "judge manifest proof changed");
    assert(manifest.verification?.expected_smoke_checks === 56, "judge manifest smoke count changed");
    assert(manifest.status?.no_secrets === true, "judge manifest no-secret boundary changed");

    const videoResponse = await page.goto(`${baseUrl}helioigma-demo.webm`);
    assert(videoResponse?.ok(), "WebM demo did not return HTTP 200");
    assert((videoResponse.headers()["content-type"] || "").includes("video/webm"), "WebM demo did not return video/webm");

    await page.goto(`${baseUrl}proof-verifier.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#result")?.textContent.includes("Checksum-valid receipt"));
    const proof = await page.evaluate(() => ({
      facts: [...document.querySelectorAll("#proofFacts dd")].map((node) => node.textContent.trim()),
      hasCaveat: document.body.innerText.includes("not anti-cheat or identity proof"),
      hasProofBoundary: document.body.innerText.toLowerCase().includes("what this proves") && document.body.innerText.toLowerCase().includes("what this does not prove"),
      hasSamplePayload: document.body.innerText.includes("solstice|4|2907|62|4"),
      usesRadialGradient: getComputedStyle(document.body).backgroundImage.includes("radial-gradient"),
      result: document.querySelector("#result")?.textContent.trim(),
    }));
    assert(proof.result === "Checksum-valid receipt within published demo bounds: 2907 points across 62 shifts.", "proof verifier did not validate the stable receipt");
    assert(proof.hasCaveat, "proof verifier is missing the receipt caveat");
    assert(proof.hasProofBoundary, "proof verifier is missing the proof boundary explanation");
    assert(proof.hasSamplePayload, "proof verifier is missing the sample payload breakdown");
    assert(!proof.usesRadialGradient, "proof verifier still uses radial background blobs");
    assert(proof.facts.join("|") === "4/4|2907|62|Y5VFX1", "proof verifier facts changed");

    await page.goto(`${baseUrl}proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#result")?.textContent.includes("Checksum-valid receipt"));
    const proofFromQuery = await page.evaluate(() => ({
      input: document.querySelector("#proofInput")?.value.trim(),
      result: document.querySelector("#result")?.textContent.trim(),
    }));
    assert(proofFromQuery.input === "SC-4P-2907-62-Y5VFX1", "proof verifier did not read receipt query parameter");
    assert(proofFromQuery.result === "Checksum-valid receipt within published demo bounds: 2907 points across 62 shifts.", "proof verifier query route did not validate");

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
    assert(smoke.checks === 56, `expected 56 smoke checks, got ${smoke.checks}`);
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
