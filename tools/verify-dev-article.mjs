import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const articlePath = resolve(root, "dev-article-final.md");
const manifestPath = resolve(root, "judge-manifest.json");

const publicPrefix = "https://ooyxloo.github.io/helioigma/";
const stableReceipt = "SC-4P-2907-62-Y5VFX1";
const mediaVersion = "20260615-fresh-media";

function fail(message) {
  throw new Error(message);
}

function readText(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function localFileExistsForUrl(urlText) {
  const url = new URL(urlText);
  if (url.origin + "/" !== publicPrefix) return true;
  const relativePath = decodeURIComponent(url.pathname.replace(/^\/helioigma\/?/, "")) || "index.html";
  if (relativePath === "") return existsSync(resolve(root, "index.html"));
  return existsSync(resolve(root, relativePath));
}

function collectUrls(text) {
  const matches = text.matchAll(/https?:\/\/[^\s<>)\]]+/g);
  return [...matches].map((match) => match[0].replace(/[.,;:]+$/g, ""));
}

function assertIncludes(text, pattern, label = pattern) {
  if (!text.includes(pattern)) fail(`DEV article missing ${label}`);
}

function assertNotIncludes(text, pattern, label = pattern) {
  if (text.includes(pattern)) fail(`DEV article unexpectedly contains ${label}`);
}

const article = readText("dev-article-final.md");
const manifest = JSON.parse(readText("judge-manifest.json"));

const frontMatter = article.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!frontMatter) fail("DEV article front matter is missing");

const front = Object.fromEntries(
  frontMatter[1]
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf(":");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^"|"$/g, "")];
    }),
);

if (front.title !== "Helioigma: a Turing-wheel puzzle for holding the longest day") {
  fail(`DEV article title drifted: ${front.title || "(missing)"}`);
}
if (front.published !== "true") fail("DEV article must be publish-ready with published: true");
if (front.cover_image !== manifest.public_urls.cover_image) fail("DEV cover image must match judge manifest");

const tags = (front.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
for (const tag of ["devchallenge", "gamechallenge", "gamedev", "javascript"]) {
  if (!tags.includes(tag)) fail(`DEV article tags missing ${tag}`);
}
if (tags.length !== 4) fail(`DEV article should keep exactly 4 tags; found ${tags.join(", ")}`);

const requiredText = [
  "This is a submission for the [June Solstice Game Jam]",
  "It targets the Best Ode to Alan Turing category",
  "Reviewer Fast Path",
  "What I Built",
  "Playability Proof",
  "Video Demo",
  "Quick Links",
  "Judge in 60 Seconds",
  "After the first minute, the captioned WebM, GIF preview, judge page, smoke test, and rubric scorecard are there for deeper review.",
  "Code",
  "How to Play",
  "Accessibility, Fair Play, and Privacy",
  "How I Built It",
  "Prize Category",
  "An Ode with Restraint",
  "Why It Is Not Just a Cipher Demo",
  "Rubric Fit",
  "Originality and Build Window",
  "Challenge Compliance",
  "Verification",
  stableReceipt,
  "No account, backend, Google AI claim, API key, private data, or hidden judge dashboard is needed",
  "does not claim Best Google AI Usage",
  "not anti-cheat, identity, payout, or eligibility proof",
];
for (const pattern of requiredText) assertIncludes(article, pattern);

const judgeMinute = article.match(/## Judge in 60 Seconds\r?\n([\s\S]*?)(?=\r?\n## Code)/);
if (!judgeMinute) fail("DEV article missing bounded Judge in 60 Seconds section");
const judgeMinuteSteps = [...judgeMinute[1].matchAll(/^\d+\.\s/gm)].length;
if (judgeMinuteSteps !== 4) {
  fail(`DEV article Judge in 60 Seconds should keep exactly 4 numbered steps; found ${judgeMinuteSteps}`);
}

const requiredUrls = [
  manifest.challenge.challenge_url,
  manifest.public_urls.play,
  manifest.public_urls.auto_demo,
  manifest.public_urls.sample_receipt_verifier,
  manifest.public_urls.judge,
  manifest.public_urls.source,
  manifest.public_urls.smoke,
  manifest.public_urls.manifest,
  manifest.public_urls.rubric_scorecard,
  manifest.public_urls.demo_webm,
  manifest.public_urls.demo_gif,
  manifest.public_urls.mobile_completion_image,
  manifest.public_urls.cover_image,
  manifest.public_urls.privacy_review,
];
for (const url of requiredUrls) assertIncludes(article, url, url);

assertIncludes(article, "{% embed https://github.com/OOYXLOO/helioigma %}", "GitHub DEV embed");
assertIncludes(article, "Plain source URL: https://github.com/OOYXLOO/helioigma", "plain source URL");

const forbiddenText = [
  "https://ooyxloo.github.io/solstice-cipher",
  "https://github.com/OOYXLOO/solstice-cipher",
  "dev-solstice-cipher",
  "money-" + "goal-200usd",
  ".codex",
  "Optional legacy MP4 fallback",
  "helioigma-demo.mp4",
  "positive reactions as a tie-breaker",
  "published: false",
];
for (const pattern of forbiddenText) assertNotIncludes(article, pattern);

const secretPatterns = [
  ["secret key", /\bsk-[A-Za-z0-9._-]{8,}\b/],
  ["email address", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ["phone number", /\b1[3-9]\d{9}\b/],
  ["card number", /\b(?:\d[ -]?){16}\b/],
  ["Windows/local path", /(?<![A-Za-z])[A-Za-z]:[\\/][^\s`"')]+/],
];
for (const [label, pattern] of secretPatterns) {
  if (pattern.test(article)) fail(`DEV article contains possible ${label}`);
}

const urls = collectUrls(article);
for (const urlText of urls) {
  const url = new URL(urlText);
  if (url.hostname === "ooyxloo.github.io" && !urlText.startsWith(publicPrefix)) {
    fail(`DEV article public Pages URL is outside Helioigma slug: ${urlText}`);
  }
  if (urlText.includes("?v=") && url.searchParams.get("v") !== mediaVersion) {
    fail(`DEV article media URL has stale version: ${urlText}`);
  }
  if (!localFileExistsForUrl(urlText)) {
    fail(`DEV article public URL has no matching local artifact: ${urlText}`);
  }
}

const imageUrls = [
  ...article.matchAll(/!\[[^\]]+\]\((https:\/\/ooyxloo\.github\.io\/helioigma\/[^)]+)\)/g),
].map((match) => match[1]);
if (imageUrls.length < 3) fail("DEV article should keep at least three public image embeds");
for (const imageUrl of imageUrls) {
  const url = new URL(imageUrl);
  if (url.searchParams.get("v") !== mediaVersion) {
    fail(`DEV article image embed missing fresh media version: ${imageUrl}`);
  }
}

console.log("PASS DEV article verification");
