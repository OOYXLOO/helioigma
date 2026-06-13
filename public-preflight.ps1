param(
  [switch]$Public
)

$ErrorActionPreference = "Stop"

function Assert-File {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Missing required file: $Path"
  }
  if ((Get-Item -LiteralPath $Path).Length -le 0) {
    throw "Required file is empty: $Path"
  }
}

function Assert-Contains {
  param([string]$Path, [string]$Pattern)
  if (-not (Select-String -Path $Path -Pattern $Pattern -SimpleMatch -Quiet)) {
    throw "Missing pattern '$Pattern' in $Path"
  }
}

function Assert-NotContains {
  param([string]$Path, [string]$Pattern)
  if (Select-String -Path $Path -Pattern $Pattern -SimpleMatch -Quiet) {
    throw "Unexpected pattern '$Pattern' in $Path"
  }
}

function Assert-Http200 {
  param([string]$Url)
  try {
    $response = Invoke-WebRequest -Uri $Url -Method Head -MaximumRedirection 5 -TimeoutSec 20 -UseBasicParsing
    if ($response.StatusCode -ne 200) {
      throw "HTTP $($response.StatusCode)"
    }
    Write-Output "OK  $Url"
  } catch {
    throw "URL check failed for $Url - $($_.Exception.Message)"
  }
}

function Assert-PngSignature {
  param([string]$Path)
  $expected = @(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)
  $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $Path))
  for ($i = 0; $i -lt $expected.Count; $i += 1) {
    if ($bytes[$i] -ne $expected[$i]) {
      throw "PNG signature mismatch: $Path"
    }
  }
}

function Assert-WebmSignature {
  param([string]$Path)
  $expected = @(0x1A, 0x45, 0xDF, 0xA3)
  $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $Path))
  for ($i = 0; $i -lt $expected.Count; $i += 1) {
    if ($bytes[$i] -ne $expected[$i]) {
      throw "WebM/EBML signature mismatch: $Path"
    }
  }
}

Push-Location $PSScriptRoot
try {
  node --check game.js | Out-Null

  $requiredFiles = @(
    ".nojekyll",
    "index.html",
    "styles.css",
    "game.js",
    "LICENSE",
    "judge.html",
    "judge-manifest.json",
    "smoke.html",
    "proof-verifier.html",
    "dev-submit-console.html",
    "dev-article-final.md",
    "dev-post-draft.md",
    "publish-assistant.html",
    "publish-after-repo.ps1",
    "tools/build-demo-video.mjs",
    "tools/build-demo-webm.mjs",
    "tools/browser-smoke-check.mjs",
    "verification.html",
    "verification-report.md",
    "cover.png",
    "solstice-cipher-demo.mp4",
    "solstice-cipher-demo.webm",
    "solstice-cipher-demo.gif",
    "desktop-check-v5.png",
    "mobile-check-v6.png",
    "desktop-complete-v4.png",
    "PUBLISHING.md",
    "submission-checklist.md",
    ".github/workflows/verify.yml"
  )

  foreach ($file in $requiredFiles) {
    Assert-File $file
  }

  $demoFrameCount = (Get-ChildItem -LiteralPath "demo-frames-v3" -Filter "*.png" -File).Count
  if ($demoFrameCount -lt 7) {
    throw "Expected at least 7 demo frames in demo-frames-v3; found $demoFrameCount"
  }

  foreach ($png in @(
    "cover.png",
    "desktop-check-v5.png",
    "mobile-check-v6.png",
    "desktop-complete-v4.png"
  )) {
    Assert-PngSignature $png
  }
  Assert-WebmSignature "solstice-cipher-demo.webm"

  $manifest = Get-Content -Raw -LiteralPath "judge-manifest.json" | ConvertFrom-Json
  if ($manifest.project -ne "Helioigma") { throw "judge-manifest project mismatch" }
  if ($manifest.challenge.name -ne "DEV June Solstice Game Jam") { throw "judge-manifest challenge mismatch" }
  if ($manifest.challenge.target_prize_usd -ne 200) { throw "judge-manifest prize mismatch" }
  if ($manifest.challenge.target_category -ne "Best Ode to Alan Turing") { throw "judge-manifest category mismatch" }
  if ($manifest.proof.stable_receipt -ne "SC-4P-2907-62-Y5VFX1") { throw "judge-manifest proof mismatch" }
  if ($manifest.public_urls.auto_demo -ne "https://ooyxloo.github.io/solstice-cipher/?demo=1") { throw "judge-manifest auto demo mismatch" }
  if ($manifest.verification.expected_smoke_checks -ne 41) { throw "judge-manifest smoke count mismatch" }
  if ($manifest.status.no_secrets -ne $true) { throw "judge-manifest no-secret boundary mismatch" }
  if (-not ($manifest.status.public_repo_gate -like "Account-owner launch gate*")) { throw "judge-manifest public repo gate copy mismatch" }
  if (-not ($manifest.status.dev_article_gate -like "Account-owner DEV submission gate*")) { throw "judge-manifest DEV gate copy mismatch" }
  if ($manifest.public_urls.play -ne "https://ooyxloo.github.io/solstice-cipher/") { throw "judge-manifest public play URL mismatch" }
  foreach ($artifact in $manifest.local_artifacts) {
    Assert-File $artifact
  }

  Assert-Contains "dev-article-final.md" "tags: devchallenge, gamechallenge, gamedev"
  Assert-Contains "dev-article-final.md" "What I Built"
  Assert-Contains "dev-article-final.md" "longest day into a countdown machine"
  Assert-Contains "dev-article-final.md" "Video Demo"
  Assert-Contains "dev-article-final.md" "Code"
  Assert-Contains "dev-article-final.md" "How I Built It"
  Assert-Contains "dev-article-final.md" "Prize Category"
  Assert-Contains "dev-article-final.md" "Judge in 60 Seconds"
  Assert-Contains "dev-article-final.md" "judge-manifest.json"
  Assert-Contains "dev-article-final.md" "Rubric Fit"
  Assert-Contains "dev-article-final.md" "Why It Is Not Just a Cipher Demo"
  Assert-Contains "dev-article-final.md" "judge-verifiable loop"
  Assert-Contains "dev-article-final.md" "not only a solstice skin over a puzzle"
  Assert-Contains "dev-article-final.md" "An Ode with Restraint"
  Assert-Contains "dev-article-final.md" "not a biography game"
  Assert-Contains "dev-article-final.md" "careful reasoning about machines and proof"
  Assert-Contains "dev-article-final.md" "After Publishing"
  Assert-Contains "dev-article-final.md" "not spam or fake engagement"
  Assert-Contains "dev-article-final.md" "Best Ode to Alan Turing"
  Assert-Contains "dev-article-final.md" "Helioigma"
  Assert-Contains "dev-article-final.md" "solar rotor"
  Assert-Contains "dev-article-final.md" "I chose a cipher wheel"
  Assert-Contains "dev-article-final.md" "biggest tradeoff"
  Assert-Contains "dev-article-final.md" "only browser storage is a local numeric best-score key"
  Assert-Contains "dev-article-final.md" "public-preflight.ps1 -Public"
  Assert-Contains "dev-article-final.md" "cover_image: https://ooyxloo.github.io/solstice-cipher/cover.png"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/solstice-cipher/?demo=1"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.webm"
  Assert-Contains "dev-article-final.md" "![Helioigma four-phase demo solve]"
  Assert-Contains "dev-article-final.md" "MIT license for the game package"
  Assert-Contains "dev-article-final.md" "does not claim the Best Google AI Usage category"
  Assert-Contains "dev-article-final.md" 'Press `Demo Solve` or `D`'
  Assert-Contains "README.md" 'Use `Demo Solve` or press `D`'
  Assert-Contains "dev-submit-console.html" 'plus a `D` shortcut'
  Assert-Contains "dev-submit-console.html" 'Optional `?demo=1` route'
  Assert-Contains "dev-submit-console.html" "Helioigma"
  Assert-Contains "dev-submit-console.html" "No-Go Gate"
  Assert-Contains "dev-submit-console.html" "Judge in 60 Seconds"
  Assert-Contains "dev-submit-console.html" "longest day into a countdown machine"
  Assert-Contains "dev-submit-console.html" "judge-manifest.json"
  Assert-Contains "dev-submit-console.html" "Rubric Fit"
  Assert-Contains "dev-submit-console.html" "live Rotor Trace, deterministic Demo Solve, and a verifiable run receipt"
  Assert-Contains "dev-submit-console.html" "Ode With Restraint"
  Assert-Contains "dev-submit-console.html" "Rotor Trace"
  Assert-Contains "dev-submit-console.html" "Post-Publish Share Note"
  Assert-Contains "dev-submit-console.html" "static solved cipher"
  Assert-Contains "dev-submit-console.html" "How I Built It"
  Assert-Contains "dev-submit-console.html" "Source: https://github.com/OOYXLOO/solstice-cipher"
  Assert-Contains "dev-submit-console.html" "WebM video"
  Assert-Contains "dev-submit-console.html" "public-preflight.ps1 -Public"
  Assert-Contains "README.md" "only browser storage is the local numeric best score key"
  Assert-Contains "README.md" "Public repository, GitHub Pages, and DEV submission are account-owner launch gates"
  Assert-NotContains "README.md" "backup route"
  Assert-Contains "README.md" "The Turing ode is intentionally restrained"
  Assert-Contains "README.md" "Rotor Trace"
  Assert-Contains "README.md" "?demo=1"
  Assert-Contains "README.md" "MIT license"
  Assert-Contains "LICENSE" "MIT License"
  Assert-Contains "publish-assistant.html" "No-go gate"
  Assert-Contains "publish-assistant.html" "OOYXLOO/solstice-cipher"
  Assert-Contains "publish-assistant.html" "github.com/new?owner=OOYXLOO&name=solstice-cipher&visibility=public"
  Assert-Contains "publish-assistant.html" "Optional GitHub CLI"
  Assert-Contains "publish-assistant.html" "https://ooyxloo.github.io/solstice-cipher/?demo=1"
  Assert-Contains "publish-assistant.html" "41 smoke checks"
  Assert-Contains "submission-checklist.md" "judge-manifest.json"
  Assert-Contains "submission-checklist.md" "account-owner launch gates"
  Assert-Contains "submission-checklist.md" "Optional GitHub CLI path"
  Assert-Contains "submission-checklist.md" "Optional auto-demo route"
  Assert-Contains "submission-checklist.md" "no spam, bought reactions, or fake engagement"
  Assert-Contains "PUBLISHING.md" "judge-manifest.json"
  Assert-Contains "PUBLISHING.md" "Public repository, GitHub Pages, and DEV submission are account-owner launch gates"
  Assert-Contains "PUBLISHING.md" "gh repo create OOYXLOO/solstice-cipher"
  Assert-Contains "PUBLISHING.md" "do not spam, buy reactions, or ask for fake engagement"
  Assert-Contains "publish-after-repo.ps1" "publish-after-repo helper"
  Assert-Contains "publish-after-repo.ps1" "-Push"
  Assert-Contains "publish-after-repo.ps1" "github.com/new?owner=OOYXLOO&name=solstice-cipher&visibility=public"
  Assert-Contains "publish-after-repo.ps1" "Optional GitHub CLI command"
  Assert-Contains "publish-after-repo.ps1" "leave README, license, and .gitignore unchecked"
  Assert-Contains "tools/browser-smoke-check.mjs" "PASS browser smoke"
  Assert-Contains "tools/browser-smoke-check.mjs" "?demo=1"
  Assert-Contains "tools/browser-smoke-check.mjs" "auto demo route did not reach the stable receipt"
  Assert-Contains "tools/browser-smoke-check.mjs" "auto demo route did not build a verifier link"
  Assert-Contains "tools/browser-smoke-check.mjs" "Checksum-valid receipt"
  Assert-Contains "tools/browser-smoke-check.mjs" "expected 41 smoke checks"
  Assert-Contains "tools/browser-smoke-check.mjs" "video/webm"
  Assert-Contains "tools/build-demo-video.mjs" "live browser recording"
  Assert-Contains "tools/build-demo-video.mjs" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "tools/build-demo-webm.mjs" "solstice-cipher-demo.webm"
  Assert-Contains "tools/build-demo-webm.mjs" "demo-frames-v3"
  Assert-Contains ".gitignore" "solstice-cipher-dev-package.zip"
  Assert-Contains "judge.html" "Run Smoke Test"
  Assert-Contains "judge.html" "Open Manifest"
  Assert-Contains "judge.html" "judge-manifest.json"
  Assert-Contains "judge.html" "Watch Video"
  Assert-Contains "judge.html" "Auto Demo"
  Assert-Contains "judge.html" "Helioigma"
  Assert-Contains "judge.html" "Verify Receipt"
  Assert-Contains "judge.html" "solstice-cipher-demo.gif"
  Assert-Contains "judge.html" "solstice-cipher-demo.webm"
  Assert-Contains "judge.html" "recorded from the real browser judge path"
  Assert-Contains "judge.html" "Ode With Restraint"
  Assert-Contains "judge.html" "Judge-Verifiable Loop"
  Assert-Contains "judge.html" "not only a solstice skin over a puzzle"
  Assert-Contains "judge.html" "Rotor Trace"
  Assert-Contains "judge.html" "state, logic, verification"
  Assert-Contains "judge.html" "Run Receipt"
  Assert-Contains "judge.html" "run receipt"
  Assert-NotContains "judge.html" "radial-gradient"
  Assert-NotContains "judge.html" "DEV Console"
  Assert-NotContains "judge.html" "Publish Assistant"
  Assert-Contains "styles.css" "linear-gradient(105deg"
  Assert-NotContains "styles.css" "radial-gradient"
  Assert-Contains "game.js" "Run receipt copied."
  Assert-Contains "game.js" "proof-verifier.html?receipt="
  Assert-Contains "game.js" 'get("demo") === "1"'
  Assert-NotContains "game.js" "Run proof"
  Assert-Contains "index.html" "nodeButtons"
  Assert-Contains "index.html" "phaseTrack"
  Assert-Contains "index.html" "shiftLabel"
  Assert-Contains "index.html" "hintButton"
  Assert-Contains "index.html" "tracePanel"
  Assert-Contains "index.html" "traceNext"
  Assert-Contains "index.html" "demoButton"
  Assert-Contains "index.html" "quick-controls"
  Assert-Contains "index.html" "judge-path"
  Assert-Contains "index.html" "1. Play"
  Assert-Contains "index.html" "2. Demo Solve + Rotor Trace"
  Assert-Contains "index.html" "Press Demo Solve; watch Rotor Trace and score progress through all four phases."
  Assert-Contains "index.html" "3. Receipt"
  Assert-Contains "index.html" "judge-links"
  Assert-Contains "index.html" "dayMeter"
  Assert-Contains "index.html" "dayMeterFill"
  Assert-Contains "index.html" "proofSummary"
  Assert-Contains "index.html" "verifyProofLink"
  Assert-Contains "index.html" "Helioigma"
  Assert-Contains "index.html" "Decode the solstice rotor"
  Assert-Contains "index.html" "20260613-trace-polish"
  Assert-Contains "index.html" "https://ooyxloo.github.io/solstice-cipher/cover.png"
  Assert-Contains "index.html" "twitter:image"
  Assert-Contains "index.html" "aria-keyshortcuts=""H"""
  Assert-Contains "index.html" "aria-keyshortcuts=""D"""
  Assert-Contains "index.html" "aria-keyshortcuts=""1 2 3 4 5 6 7 8 9"""
  Assert-Contains "smoke.html" "first-phase node buttons are present"
  Assert-Contains "smoke.html" "20260613-trace-polish"
  Assert-Contains "smoke.html" "hint button is present"
  Assert-Contains "smoke.html" "hint shortcut is exposed"
  Assert-Contains "smoke.html" "hint shortcut names the next mismatched node"
  Assert-Contains "smoke.html" "hint highlights a node button"
  Assert-Contains "smoke.html" "rotor trace panel is present"
  Assert-Contains "smoke.html" "rotor trace records hint action"
  Assert-Contains "smoke.html" "first-screen judge path is present"
  Assert-Contains "smoke.html" "demo solve button is present"
  Assert-Contains "smoke.html" "daylight meter is present"
  Assert-Contains "smoke.html" "demo shortcut reaches a deterministic judge receipt"
  Assert-Contains "smoke.html" "run receipt verifier link is present"
  Assert-Contains "smoke.html" "completion verifier link carries the final receipt"
  Assert-Contains "smoke.html" "reset shortcut returns to idle"
  Assert-Contains "smoke.html" "judge shortcut links include the auto demo route"
  Assert-Contains "smoke.html" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "smoke.html" "demo solve releases manual controls"
  Assert-Contains "smoke.html" "four-phase progress track is present"
  Assert-Contains "smoke.html" "shift counter records the completed run"
  Assert-Contains "proof-verifier.html" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "proof-verifier.html" "proofFacts"
  Assert-Contains "proof-verifier.html" "Parsed receipt facts"
  Assert-Contains "proof-verifier.html" "Checksum"
  Assert-Contains "proof-verifier.html" "Checksum-valid receipt"
  Assert-Contains "proof-verifier.html" 'get("receipt")'
  Assert-Contains "proof-verifier.html" "not anti-cheat or identity proof"
  Assert-Contains "proof-verifier.html" "linear-gradient(105deg"
  Assert-NotContains "proof-verifier.html" "radial-gradient"
  Assert-Contains "verification-report.md" "PASS - Longest day held"
  Assert-Contains "verification-report.md" "parsed receipt facts"
  Assert-Contains "verification-report.md" "Score variance is expected"
  Assert-Contains "verification.html" "Score variance is expected"
  Assert-Contains "verification.html" "solstice-cipher-demo.webm"
  Assert-Contains "judge-manifest.json" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "judge-manifest.json" "public_repo_gate"
  Assert-Contains "judge-manifest.json" "dev_article_gate"
  Assert-Contains "judge-manifest.json" "Best Ode to Alan Turing"
  Assert-Contains "judge-manifest.json" "ode_note"
  Assert-Contains "judge-manifest.json" "https://ooyxloo.github.io/solstice-cipher/"

  $scanFiles = Get-ChildItem -File -Include *.html,*.js,*.md,*.json -Recurse |
    Where-Object { $_.FullName -notmatch "\\.git\\" }
  $secretHits = $scanFiles | Select-String -Pattern "sk-[A-Za-z0-9._-]{12,}|AKIA[0-9A-Z]{16}|BEGIN PRIVATE KEY|password:|secret:|bank account|card number" -ErrorAction SilentlyContinue
  if ($secretHits) {
    $secretHits | ForEach-Object { Write-Output "Potential secret hit: $($_.Path):$($_.LineNumber)" }
    throw "Potential secret-like content found"
  }

  if ($Public) {
    $urls = @(
      "https://ooyxloo.github.io/solstice-cipher/",
      "https://ooyxloo.github.io/solstice-cipher/judge.html",
      "https://ooyxloo.github.io/solstice-cipher/smoke.html",
      "https://ooyxloo.github.io/solstice-cipher/proof-verifier.html",
      "https://ooyxloo.github.io/solstice-cipher/judge-manifest.json",
      "https://ooyxloo.github.io/solstice-cipher/dev-submit-console.html",
      "https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.webm",
      "https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif",
      "https://github.com/OOYXLOO/solstice-cipher"
    )
    foreach ($url in $urls) {
      Assert-Http200 $url
    }
  }

  Write-Output "PASS Helioigma preflight"
} finally {
  Pop-Location
}
