import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const args = new Set(process.argv.slice(2));
const checkPublic = args.has("--public");
const asJson = args.has("--json");

const intended = {
  repo: "https://github.com/OOYXLOO/helioigma",
  pages: "https://ooyxloo.github.io/helioigma/",
  autoDemo: "https://ooyxloo.github.io/helioigma/?demo=1",
  verifier: "https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1",
  devChallenge: "https://dev.to/challenges/june-game-jam-2026-06-03",
};

const requiredFiles = [
  ".nojekyll",
  ".github/workflows/verify.yml",
  "CHALLENGE_COMPLIANCE.md",
  "FIRST_MINUTE.md",
  "JUDGE_REVIEW_CARD.md",
  "LICENSE",
  "PUBLISHING.md",
  "README.md",
  "RUBRIC_SCORECARD.md",
  "cover.png",
  "desktop-check-v5.png",
  "desktop-complete-v4.png",
  "dev-article-final.md",
  "dev-launch-brief.md",
  "game.js",
  "helioigma-demo.gif",
  "helioigma-demo.mp4",
  "helioigma-demo.webm",
  "index.html",
  "judge-manifest.json",
  "judge.html",
  "mobile-check-v6.png",
  "mobile-complete-v1.png",
  "package-lock.json",
  "package.json",
  "proof-verifier.html",
  "public-preflight.ps1",
  "smoke.html",
  "styles.css",
  "submission-checklist.md",
  "tools/browser-smoke-check.mjs",
  "tools/build-demo-gif.py",
  "tools/build-demo-video.mjs",
  "tools/build-demo-webm.mjs",
  "tools/build-package.ps1",
  "tools/capture-public-media.mjs",
  "tools/launch-readiness-audit.mjs",
  "tools/verify-media-freshness.mjs",
  "verification-report.md",
  "verification.html",
];

const mustContain = [
  ["dev-article-final.md", "Playability Proof"],
  ["dev-article-final.md", "published: true"],
  ["dev-article-final.md", "tags: devchallenge, gamechallenge, gamedev, javascript"],
  ["dev-article-final.md", "{% embed https://github.com/OOYXLOO/helioigma %}"],
  ["dev-article-final.md", "tools/build-demo-gif.py"],
  ["dev-article-final.md", "tools/verify-media-freshness.mjs"],
  ["judge.html", "Playability proof"],
  ["judge.html", "Readable decisions"],
  ["judge.html", "Immediate feedback"],
  ["judge.html", "Finished failure state"],
  ["JUDGE_REVIEW_CARD.md", "Playability Proof"],
  ["README.md", "Playability proof for a rushed judge"],
  ["README.md", "npm run build:gif"],
  ["README.md", "npm run verify:media"],
  ["README.md", "tools/build-demo-gif.py"],
  ["README.md", "tools/verify-media-freshness.mjs"],
  ["FIRST_MINUTE.md", "Playability proof appears before the verifier"],
  ["PUBLISHING.md", intended.repo],
  ["PUBLISHING.md", "logged-in DEV challenge flow still accepts a June Solstice Game Jam entry"],
  ["dev-launch-brief.md", intended.pages],
  ["dev-launch-brief.md", "The logged-in DEV challenge flow does not accept a June Solstice Game Jam entry."],
  ["dev-launch-brief.md", "Ethical Visibility Plan"],
  ["dev-launch-brief.md", "positive reactions on the DEV post may be used as a tie-breaker"],
  ["dev-launch-brief.md", "Buy reactions, ask for fake engagement, or pressure friends/coworkers"],
  ["submission-checklist.md", "Confirm the logged-in DEV challenge flow still accepts a June Solstice Game Jam entry"],
  ["submission-checklist.md", "ethical visibility plan"],
];

const expectedPublicLinkHosts = new Set([
  "dev.to",
  "github.com",
  "ooyxloo.github.io",
]);

const forbiddenLiterals = [
  "we target Best Google AI Usage",
  "I target Best Google AI Usage",
  "anti-cheat guarantee",
  "identity guarantee",
  "payout guarantee",
];

const sensitiveTextChecks = [
  ["email-like private contact", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ["phone-like private contact", /\b1[3-9]\d{9}\b/],
  ["card-like payment number", /\b(?:\d[ -]?){16}\b/],
  ["secret-key-like token", /\bsk-[A-Za-z0-9._-]{8,}\b/],
  ["password-like assignment", /\b(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"']{8,}/i],
  ["local drive or staging path", /(?<![A-Za-z])[A-Za-z]:[\\/][^\s`"')]+|\.codex[\\/]|hks-yxl|money-goal-200usd/i],
];

const result = {
  status: "READY_LOCALLY",
  head: null,
  dirty: false,
  zip: null,
  deadline: {
    submitBy: "2026-06-21T23:59:00-07:00",
    hoursRemaining: null,
  },
  checks: [],
  public: [],
  next: [],
};

function addCheck(name, ok, detail = "") {
  result.checks.push({ name, ok, detail });
  if (!ok) result.status = "LOCAL_FIX_REQUIRED";
}

function runGit(argsForGit) {
  try {
    return execFileSync("git", argsForGit, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function fileText(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function fileExists(relativePath) {
  const absolute = resolve(root, relativePath);
  return existsSync(absolute) && statSync(absolute).isFile() && statSync(absolute).size > 0;
}

function localReferenceExists(reference) {
  if (!reference || reference.startsWith("#")) return true;
  if (reference.startsWith("mailto:") || reference.startsWith("tel:")) return true;
  if (/^https?:\/\//i.test(reference)) return true;
  const url = new URL(reference, "https://local.helioigma/");
  const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const relativePath = pathname === "" ? "index.html" : pathname;
  return fileExists(relativePath);
}

function collectHtmlReferences(relativePath) {
  const text = fileText(relativePath);
  return [...text.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function collectPublicLinks(relativePath) {
  return collectHtmlReferences(relativePath).filter((reference) => /^https?:\/\//i.test(reference));
}

function collectPunctuationEndedBareUrls(relativePath) {
  const text = fileText(relativePath);
  return [...text.matchAll(/https?:\/\/[^\s<>)\]]+[\.,](?=\s|$)/g)].map((match) => match[0]);
}

function sha256(relativePath) {
  const absolute = resolve(root, relativePath);
  if (!existsSync(absolute)) return null;
  return createHash("sha256").update(readFileSync(absolute)).digest("hex").toUpperCase();
}

async function fetchStatus(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "helioigma-launch-readiness-audit" },
    });
    const text = await response.text();
    return {
      url,
      status: response.status,
      ok: response.ok,
      title: (text.match(/<title[^>]*>(.*?)<\/title>/is)?.[1] || "").replace(/\s+/g, " ").trim(),
    };
  } catch (error) {
    return { url, ok: false, error: error.message };
  } finally {
    clearTimeout(timeout);
  }
}

result.head = {
  short: runGit(["rev-parse", "--short", "HEAD"]),
  full: runGit(["rev-parse", "HEAD"]),
  subject: runGit(["log", "-1", "--pretty=%s"]),
};
result.dirty = Boolean(runGit(["status", "--porcelain"]));
addCheck("git worktree clean", !result.dirty, result.dirty ? "Commit verified changes before pushing." : result.head.subject);

for (const file of requiredFiles) {
  addCheck(`required file ${file}`, fileExists(file), file);
}

for (const [file, pattern] of mustContain) {
  const ok = fileExists(file) && fileText(file).includes(pattern);
  addCheck(`${file} contains ${pattern}`, ok);
}

const judgeReferences = collectHtmlReferences("judge.html");
const missingLocalJudgeReferences = judgeReferences.filter((reference) => !localReferenceExists(reference));
addCheck(
  "judge page local media/evidence references resolve before public launch",
  missingLocalJudgeReferences.length === 0,
  missingLocalJudgeReferences.join("; "),
);

const unexpectedPublicJudgeLinks = collectPublicLinks("judge.html").filter((reference) => {
  const url = new URL(reference);
  return !expectedPublicLinkHosts.has(url.hostname);
});
addCheck(
  "judge page public links stay on expected launch hosts",
  unexpectedPublicJudgeLinks.length === 0,
  unexpectedPublicJudgeLinks.join("; "),
);

const punctuationEndedArticleUrls = collectPunctuationEndedBareUrls("dev-article-final.md");
addCheck(
  "DEV article bare URLs do not include trailing punctuation",
  punctuationEndedArticleUrls.length === 0,
  punctuationEndedArticleUrls.join("; "),
);

const devArticleText = fileText("dev-article-final.md");
addCheck(
  "DEV article front matter is publish-ready",
  devArticleText.includes("published: true") && !devArticleText.includes("published: false"),
  "Use published: true before the final DEV/API publish path.",
);

const trackedFiles = runGit(["ls-files"]).split(/\r?\n/).filter(Boolean);
const forbiddenHits = [];
for (const file of trackedFiles) {
  if (file === "tools/launch-readiness-audit.mjs") continue;
  if (!fileExists(file)) continue;
  if (/\.(png|gif|mp4|webm|zip)$/i.test(file)) continue;
  const text = fileText(file);
  for (const pattern of forbiddenLiterals) {
    if (text.includes(pattern)) {
      forbiddenHits.push(`${file}: forbidden public claim '${pattern}'`);
    }
  }
  for (const [label, pattern] of sensitiveTextChecks) {
    if (file === "public-preflight.ps1" && label === "password-like assignment") {
      continue;
    }
    if (file === "public-preflight.ps1" && label === "local drive or staging path") {
      continue;
    }
    if (pattern.test(text)) {
      forbiddenHits.push(`${file}: ${label}`);
    }
  }
}
addCheck("no forbidden credential/private/stale/public-risk strings in tracked text", forbiddenHits.length === 0, forbiddenHits.slice(0, 8).join("; "));

const manifest = JSON.parse(fileText("judge-manifest.json"));
addCheck("manifest project", manifest.project === "Helioigma", manifest.project);
addCheck("manifest target prize", manifest.challenge?.target_prize_usd === 200, String(manifest.challenge?.target_prize_usd));
addCheck("manifest target category", manifest.challenge?.target_category === "Best Ode to Alan Turing", manifest.challenge?.target_category);
addCheck("manifest playability proof", manifest.challenge?.playability_proof?.length === 3, String(manifest.challenge?.playability_proof?.length || 0));
addCheck("manifest stable receipt", manifest.proof?.stable_receipt === "SC-4P-2907-62-Y5VFX1", manifest.proof?.stable_receipt);
addCheck("manifest no secrets", manifest.status?.no_secrets === true, String(manifest.status?.no_secrets));

const packageJson = JSON.parse(fileText("package.json"));
addCheck("package local audit script", packageJson.scripts?.["audit:launch"] === "node tools/launch-readiness-audit.mjs", packageJson.scripts?.["audit:launch"] || "");
addCheck("package public audit script", packageJson.scripts?.["audit:launch:public"] === "node tools/launch-readiness-audit.mjs --public", packageJson.scripts?.["audit:launch:public"] || "");
addCheck("package smoke script", packageJson.scripts?.smoke === "node tools/browser-smoke-check.mjs", packageJson.scripts?.smoke || "");
addCheck("package GIF build script", packageJson.scripts?.["build:gif"] === "python tools/build-demo-gif.py", packageJson.scripts?.["build:gif"] || "");
addCheck("package media freshness script", packageJson.scripts?.["verify:media"] === "node tools/verify-media-freshness.mjs", packageJson.scripts?.["verify:media"] || "");

try {
  execFileSync("node", ["tools/verify-media-freshness.mjs"], { cwd: root, encoding: "utf8" });
  addCheck("media freshness", true, "PNG/GIF/WebM are newer than source and have valid signatures.");
} catch (error) {
  addCheck("media freshness", false, error.stdout || error.stderr || error.message);
}

const zipHash = sha256("helioigma-dev-package.zip");
result.zip = zipHash ? { file: "helioigma-dev-package.zip", sha256: zipHash } : null;
result.checks.push({
  name: "package zip present",
  ok: Boolean(zipHash),
  detail: zipHash || "Optional in clean CI; run npm run build:package for local transfer.",
});

const deadlineUtc = Date.parse("2026-06-22T06:59:00Z");
result.deadline.hoursRemaining = Math.round(((deadlineUtc - Date.now()) / 36_000)) / 100;
addCheck("deadline still reachable", result.deadline.hoursRemaining > 0, `${result.deadline.hoursRemaining} hours remaining`);

if (checkPublic) {
  result.public = await Promise.all([
    fetchStatus(intended.repo),
    fetchStatus(intended.pages),
    fetchStatus(intended.devChallenge),
  ]);
  const repoLive = result.public.find((item) => item.url === intended.repo)?.ok === true;
  const pagesLive = result.public.find((item) => item.url === intended.pages)?.ok === true;
  if (!repoLive || !pagesLive) {
    if (result.status === "READY_LOCALLY") result.status = "WAIT_USER_GATE";
    result.next.push("Create empty public repo OOYXLOO/helioigma with no README/license/gitignore.");
    result.next.push("Run publish-after-repo.ps1, then publish-after-repo.ps1 -Push after the repo exists.");
    result.next.push("Enable GitHub Pages from main/root, run public-preflight.ps1 -Public, then publish dev-article-final.md.");
  }
}

if (result.status === "READY_LOCALLY") {
  result.next.push("Ready for user-present public repo creation, push, Pages enablement, and DEV article publication.");
}

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Helioigma launch readiness: ${result.status}`);
  console.log(`HEAD: ${result.head.short} ${result.head.subject}`);
  if (result.zip) console.log(`ZIP SHA256: ${result.zip.sha256}`);
  console.log(`Deadline hours remaining: ${result.deadline.hoursRemaining}`);
  for (const check of result.checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
  }
  for (const item of result.public) {
    console.log(`PUBLIC ${item.ok ? "OK" : "WAIT"} ${item.url}${item.status ? ` HTTP ${item.status}` : ""}${item.title ? ` - ${item.title}` : ""}${item.error ? ` - ${item.error}` : ""}`);
  }
  if (result.next.length) {
    console.log("Next:");
    for (const step of result.next) console.log(`- ${step}`);
  }
}

if (result.status === "LOCAL_FIX_REQUIRED") {
  process.exitCode = 1;
}
