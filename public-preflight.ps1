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
    "judge.html",
    "smoke.html",
    "proof-verifier.html",
    "dev-submit-console.html",
    "dev-article-final.md",
    "dev-post-draft.md",
    "publish-assistant.html",
    "publish-after-repo.ps1",
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

  Assert-Contains "dev-article-final.md" "tags: devchallenge, gamechallenge, gamedev"
  Assert-Contains "dev-article-final.md" "What I Built"
  Assert-Contains "dev-article-final.md" "Video Demo"
  Assert-Contains "dev-article-final.md" "Code"
  Assert-Contains "dev-article-final.md" "How I Built It"
  Assert-Contains "dev-article-final.md" "Prize Category"
  Assert-Contains "dev-article-final.md" "Judge in 60 Seconds"
  Assert-Contains "dev-article-final.md" "Rubric Fit"
  Assert-Contains "dev-article-final.md" "Best Ode to Alan Turing"
  Assert-Contains "dev-article-final.md" "I chose a cipher wheel"
  Assert-Contains "dev-article-final.md" "biggest tradeoff"
  Assert-Contains "dev-article-final.md" "only browser storage is a local numeric best-score key"
  Assert-Contains "dev-article-final.md" "public-preflight.ps1 -Public"
  Assert-Contains "dev-article-final.md" "cover_image: https://ooyxloo.github.io/solstice-cipher/cover.png"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.webm"
  Assert-Contains "dev-article-final.md" "does not claim the Best Google AI Usage category"
  Assert-Contains "dev-submit-console.html" "No-Go Gate"
  Assert-Contains "dev-submit-console.html" "Judge in 60 Seconds"
  Assert-Contains "dev-submit-console.html" "Rubric Fit"
  Assert-Contains "dev-submit-console.html" "How I Built It"
  Assert-Contains "dev-submit-console.html" "Source: https://github.com/OOYXLOO/solstice-cipher"
  Assert-Contains "dev-submit-console.html" "WebM video"
  Assert-Contains "dev-submit-console.html" "public-preflight.ps1 -Public"
  Assert-Contains "README.md" "only browser storage is the local numeric best score key"
  Assert-Contains "publish-assistant.html" "No-go gate"
  Assert-Contains "publish-assistant.html" "OOYXLOO/solstice-cipher"
  Assert-Contains "publish-assistant.html" "github.com/new?owner=OOYXLOO&name=solstice-cipher&visibility=public"
  Assert-Contains "publish-assistant.html" "28 smoke checks"
  Assert-Contains "publish-after-repo.ps1" "publish-after-repo helper"
  Assert-Contains "publish-after-repo.ps1" "-Push"
  Assert-Contains "publish-after-repo.ps1" "github.com/new?owner=OOYXLOO&name=solstice-cipher&visibility=public"
  Assert-Contains "publish-after-repo.ps1" "leave README, license, and .gitignore unchecked"
  Assert-Contains "tools/browser-smoke-check.mjs" "PASS browser smoke"
  Assert-Contains "tools/browser-smoke-check.mjs" "Valid run receipt"
  Assert-Contains "tools/browser-smoke-check.mjs" "expected 28 smoke checks"
  Assert-Contains "tools/browser-smoke-check.mjs" "video/webm"
  Assert-Contains "tools/build-demo-webm.mjs" "solstice-cipher-demo.webm"
  Assert-Contains "tools/build-demo-webm.mjs" "demo-frames-v3"
  Assert-Contains ".gitignore" "solstice-cipher-dev-package.zip"
  Assert-Contains "judge.html" "Run Smoke Test"
  Assert-Contains "judge.html" "Watch Video"
  Assert-Contains "judge.html" "solstice-cipher-demo.gif"
  Assert-Contains "judge.html" "solstice-cipher-demo.webm"
  Assert-Contains "judge.html" "Run Receipt"
  Assert-NotContains "judge.html" "DEV Console"
  Assert-NotContains "judge.html" "Publish Assistant"
  Assert-Contains "index.html" "nodeButtons"
  Assert-Contains "index.html" "phaseTrack"
  Assert-Contains "index.html" "shiftLabel"
  Assert-Contains "index.html" "demoButton"
  Assert-Contains "index.html" "quick-controls"
  Assert-Contains "index.html" "judge-links"
  Assert-Contains "index.html" "proofSummary"
  Assert-Contains "index.html" "Match each numbered ring node"
  Assert-Contains "index.html" "https://ooyxloo.github.io/solstice-cipher/cover.png"
  Assert-Contains "index.html" "twitter:image"
  Assert-Contains "index.html" "aria-keyshortcuts=""D"""
  Assert-Contains "index.html" "aria-keyshortcuts=""1 2 3 4 5 6 7 8 9"""
  Assert-Contains "smoke.html" "first-phase node buttons are present"
  Assert-Contains "smoke.html" "demo solve button is present"
  Assert-Contains "smoke.html" "demo shortcut reaches a deterministic judge proof"
  Assert-Contains "smoke.html" "reset shortcut returns to idle"
  Assert-Contains "smoke.html" "judge shortcut links are present"
  Assert-Contains "smoke.html" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "smoke.html" "demo solve releases manual controls"
  Assert-Contains "smoke.html" "four-phase progress track is present"
  Assert-Contains "smoke.html" "shift counter records the completed run"
  Assert-Contains "proof-verifier.html" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "proof-verifier.html" "proofFacts"
  Assert-Contains "proof-verifier.html" "Parsed proof facts"
  Assert-Contains "proof-verifier.html" "Checksum"
  Assert-Contains "proof-verifier.html" "Valid run receipt"
  Assert-Contains "proof-verifier.html" "not anti-cheat or identity proof"
  Assert-Contains "verification-report.md" "PASS - Longest day held"
  Assert-Contains "verification-report.md" "parsed proof facts"
  Assert-Contains "verification-report.md" "Score variance is expected"
  Assert-Contains "verification.html" "Score variance is expected"
  Assert-Contains "verification.html" "solstice-cipher-demo.webm"

  $scanFiles = Get-ChildItem -File -Include *.html,*.js,*.md -Recurse |
    Where-Object { $_.FullName -notmatch "\\.git\\" }
  $secretHits = $scanFiles | Select-String -Pattern "sk-[A-Za-z0-9._-]{12,}|AKIA[0-9A-Z]{16}|BEGIN PRIVATE KEY|安全码|银行卡|password:" -ErrorAction SilentlyContinue
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
      "https://ooyxloo.github.io/solstice-cipher/dev-submit-console.html",
      "https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.webm",
      "https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif",
      "https://github.com/OOYXLOO/solstice-cipher"
    )
    foreach ($url in $urls) {
      Assert-Http200 $url
    }
  }

  Write-Output "PASS Solstice Cipher preflight"
} finally {
  Pop-Location
}
