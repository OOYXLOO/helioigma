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

  Assert-Contains "dev-article-final.md" "tags: devchallenge, gamechallenge, gamedev"
  Assert-Contains "dev-article-final.md" "Judge in 60 Seconds"
  Assert-Contains "dev-article-final.md" "Rubric Fit"
  Assert-Contains "dev-article-final.md" "Best Ode to Alan Turing"
  Assert-Contains "dev-article-final.md" "does not claim the Best Google AI Usage category"
  Assert-Contains "dev-submit-console.html" "No-Go Gate"
  Assert-Contains "dev-submit-console.html" "Judge in 60 Seconds"
  Assert-Contains "dev-submit-console.html" "Rubric Fit"
  Assert-Contains "publish-assistant.html" "No-go gate"
  Assert-Contains "publish-assistant.html" "OOYXLOO/solstice-cipher"
  Assert-Contains "publish-after-repo.ps1" "publish-after-repo helper"
  Assert-Contains "publish-after-repo.ps1" "-Push"
  Assert-Contains "judge.html" "Run Smoke Test"
  Assert-Contains "index.html" "nodeButtons"
  Assert-Contains "index.html" "phaseTrack"
  Assert-Contains "index.html" "shiftLabel"
  Assert-Contains "index.html" "demoButton"
  Assert-Contains "index.html" "judge-links"
  Assert-Contains "index.html" "proofSummary"
  Assert-Contains "smoke.html" "first-phase node buttons are present"
  Assert-Contains "smoke.html" "demo solve button is present"
  Assert-Contains "smoke.html" "judge shortcut links are present"
  Assert-Contains "smoke.html" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "smoke.html" "demo solve releases manual controls"
  Assert-Contains "smoke.html" "four-phase progress track is present"
  Assert-Contains "smoke.html" "shift counter records the completed run"
  Assert-Contains "proof-verifier.html" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "proof-verifier.html" "proofFacts"
  Assert-Contains "proof-verifier.html" "Parsed proof facts"
  Assert-Contains "proof-verifier.html" "Checksum"
  Assert-Contains "verification-report.md" "PASS - Longest day held"
  Assert-Contains "verification-report.md" "parsed proof facts"

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
      "https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.mp4",
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
