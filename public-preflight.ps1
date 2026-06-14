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
    "package.json",
    "JUDGE_REVIEW_CARD.md",
    "CHALLENGE_COMPLIANCE.md",
    "judge.html",
    "judge-manifest.json",
    "smoke.html",
    "proof-verifier.html",
    "dev-submit-console.html",
    "dev-article-final.md",
    "dev-launch-brief.md",
    "dev-post-draft.md",
    "publish-assistant.html",
    "publish-after-repo.ps1",
    "tools/build-package.ps1",
    "tools/build-demo-video.mjs",
    "tools/build-demo-webm.mjs",
    "tools/browser-smoke-check.mjs",
    "verification.html",
    "verification-report.md",
    "cover.png",
    "helioigma-demo.mp4",
    "helioigma-demo.webm",
    "helioigma-demo.gif",
    "desktop-check-v5.png",
    "mobile-check-v6.png",
    "desktop-complete-v4.png",
    "mobile-complete-v1.png",
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
    "desktop-complete-v4.png",
    "mobile-complete-v1.png"
  )) {
    Assert-PngSignature $png
  }
  Assert-WebmSignature "helioigma-demo.webm"

  $package = Get-Content -Raw -LiteralPath "package.json" | ConvertFrom-Json
  if ($package.name -ne "helioigma") { throw "package name mismatch" }
  if ($package.scripts.smoke -ne "node tools/browser-smoke-check.mjs") { throw "package smoke script mismatch" }
  if (-not ($package.devDependencies.playwright -like "^1.*")) { throw "package Playwright devDependency mismatch" }
  if ($package.scripts.'build:package' -ne "powershell -ExecutionPolicy Bypass -File ./tools/build-package.ps1") { throw "package build:package script mismatch" }

  if (Test-Path -LiteralPath "helioigma-dev-package.zip") {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath "helioigma-dev-package.zip"))
    try {
      $zipEntries = @($zip.Entries | ForEach-Object { $_.FullName } | Sort-Object)
    } finally {
      $zip.Dispose()
    }
    $trackedEntries = @(git ls-files | Where-Object { $_ -ne "helioigma-dev-package.zip" } | ForEach-Object { $_ -replace "\\", "/" } | Sort-Object)
    if ($zipEntries.Count -ne $trackedEntries.Count) {
      throw "Package ZIP entry count mismatch: zip=$($zipEntries.Count) tracked=$($trackedEntries.Count)"
    }
    $diff = @(Compare-Object -ReferenceObject $trackedEntries -DifferenceObject $zipEntries)
    if ($diff.Count -gt 0) {
      $diff | Select-Object -First 12 | ForEach-Object {
        Write-Output "Package ZIP path mismatch: $($_.SideIndicator) $($_.InputObject)"
      }
      throw "Package ZIP does not preserve the tracked relative file set"
    }
    foreach ($entry in @(
      ".github/workflows/verify.yml",
      "demo-frames-v3/00-ready.png",
      "tools/browser-smoke-check.mjs",
      "tools/build-package.ps1",
      "mobile-complete-v1.png"
    )) {
      if ($zipEntries -notcontains $entry) {
        throw "Package ZIP missing required relative entry: $entry"
      }
    }
  }

  $manifest = Get-Content -Raw -LiteralPath "judge-manifest.json" | ConvertFrom-Json
  if ($manifest.project -ne "Helioigma") { throw "judge-manifest project mismatch" }
  if ($manifest.challenge.name -ne "DEV June Solstice Game Jam") { throw "judge-manifest challenge mismatch" }
  if ($manifest.challenge.target_prize_usd -ne 200) { throw "judge-manifest prize mismatch" }
  if ($manifest.challenge.target_category -ne "Best Ode to Alan Turing") { throw "judge-manifest category mismatch" }
  if ($manifest.challenge.official_route_snapshot.prize_route -ne "Best Ode to Alan Turing, one of five USD 200 winner slots.") { throw "judge-manifest official route prize mismatch" }
  if ($manifest.challenge.official_route_snapshot.submit_by -ne "June 21, 2026 at 11:59 PM PDT.") { throw "judge-manifest official route deadline mismatch" }
  if (-not ($manifest.challenge.official_route_snapshot.judge_proof -like "Play, Auto Demo, receipt verifier*")) { throw "judge-manifest official route proof mismatch" }
  if (-not ($manifest.challenge.official_route_snapshot.boundary -like "No Google AI claim*")) { throw "judge-manifest official route boundary mismatch" }
  if (-not ($manifest.challenge.award_thesis -like "Helioigma is a playable ode*")) { throw "judge-manifest award thesis mismatch" }
  if ($manifest.challenge.rubric_snapshot.Count -ne 5) { throw "judge-manifest rubric snapshot mismatch" }
  if ($manifest.challenge.rubric_snapshot[0].criterion -ne "Theme relevance") { throw "judge-manifest rubric first criterion mismatch" }
  if ($manifest.proof.stable_receipt -ne "SC-4P-2907-62-Y5VFX1") { throw "judge-manifest proof mismatch" }
  if ($manifest.public_urls.auto_demo -ne "https://ooyxloo.github.io/helioigma/?demo=1") { throw "judge-manifest auto demo mismatch" }
  if ($manifest.verification.expected_smoke_checks -ne 69) { throw "judge-manifest smoke count mismatch" }
  if (-not ($manifest.proof.score_basis -like "Score rewards held daylight*")) { throw "judge-manifest score basis mismatch" }
  if (-not ($manifest.proof.phase_proof_line -like "Each phase exposes a compact proof cue*")) { throw "judge-manifest phase proof mismatch" }
  if (-not ($manifest.proof.judge_run_summary -like "*award signals*")) { throw "judge-manifest judge run summary mismatch" }
  if (-not ($manifest.proof.mobile_completion_proof -like "mobile-complete-v1.png captures*")) { throw "judge-manifest mobile completion proof mismatch" }
  if (-not ($manifest.proof.nightfall_recovery -like "Failed manual runs show a Nightfall report*")) { throw "judge-manifest nightfall recovery mismatch" }
  if ($manifest.status.no_secrets -ne $true) { throw "judge-manifest no-secret boundary mismatch" }
  if (-not ($manifest.status.public_review_surface -like "Public review uses*")) { throw "judge-manifest public review surface mismatch" }
  if (-not ($manifest.status.owner_publication_note -like "Public hosting and DEV article publication are external publication actions*")) { throw "judge-manifest owner publication note mismatch" }
  if ($manifest.accessibility_and_fair_play.input_paths.Count -lt 4) { throw "judge-manifest accessibility input-path mismatch" }
  if (-not ($manifest.accessibility_and_fair_play.assistive_technology -contains "aria-live phase announcer")) { throw "judge-manifest accessibility assistive-tech mismatch" }
  if (-not ($manifest.accessibility_and_fair_play.privacy -like "No telemetry*")) { throw "judge-manifest accessibility privacy mismatch" }
  if (-not ($manifest.accessibility_and_fair_play.receipt_boundary -like "The receipt is transparent review proof*")) { throw "judge-manifest accessibility receipt-boundary mismatch" }
  if ($manifest.originality.build_window -ne "New static game package for the DEV June Solstice Game Jam period.") { throw "judge-manifest originality build-window mismatch" }
  if (-not ($manifest.originality.template_boundary -like "Not a wrapper around*")) { throw "judge-manifest originality template-boundary mismatch" }
  if (-not ($manifest.originality.asset_boundary -like "Public media is generated from this build*")) { throw "judge-manifest originality asset-boundary mismatch" }
  if ($manifest.originality.review_surface.Count -lt 8) { throw "judge-manifest originality review-surface mismatch" }
  if ($manifest.challenge_compliance.file -ne "CHALLENGE_COMPLIANCE.md") { throw "judge-manifest challenge-compliance file mismatch" }
  if ($manifest.challenge_compliance.cash_per_winner_usd -ne 200) { throw "judge-manifest challenge-compliance prize mismatch" }
  if ($manifest.challenge_compliance.winner_slots -ne 5) { throw "judge-manifest challenge-compliance winner-slot mismatch" }
  if (-not ($manifest.challenge_compliance.submission_checks -contains "demo video and fallback media")) { throw "judge-manifest challenge-compliance submission-check mismatch" }
  if (-not ($manifest.challenge_compliance.public_launch_gate -contains "GitHub Pages returns HTTP 200")) { throw "judge-manifest challenge-compliance launch-gate mismatch" }
  if ($manifest.public_urls.play -ne "https://ooyxloo.github.io/helioigma/") { throw "judge-manifest public play URL mismatch" }
  foreach ($artifact in $manifest.local_artifacts) {
    Assert-File $artifact
  }

  Assert-Contains "dev-article-final.md" "tags: devchallenge, gamechallenge, gamedev, javascript"
  Assert-Contains "dev-article-final.md" "Reviewer Fast Path"
  Assert-Contains "dev-article-final.md" "If you are judging quickly, start here"
  Assert-Contains "dev-article-final.md" "The shortest evaluation path is: play one phase, run Auto Demo, verify receipt"
  Assert-Contains "dev-article-final.md" "No account, backend, Google AI claim, API key, private data, or hidden judge dashboard is needed"
  Assert-Contains "dev-article-final.md" "What I Built"
  Assert-Contains "dev-article-final.md" "You get 45 seconds of daylight"
  Assert-Contains "dev-article-final.md" "little daylight machine"
  Assert-Contains "dev-article-final.md" "live objective strip tells you what the rotor wants next"
  Assert-Contains "dev-article-final.md" "phase-proof line explains how the current phase maps"
  Assert-Contains "dev-article-final.md" "compact proof that the solve path can be inspected"
  Assert-Contains "dev-article-final.md" "I am aiming this at Best Ode to Alan Turing by making the tribute playable"
  Assert-Contains "dev-article-final.md" "My award thesis is simple"
  Assert-Contains "dev-article-final.md" "playable ode, a judge-verifiable loop, and a finished static package"
  Assert-Contains "dev-article-final.md" "small pressure loop"
  Assert-Contains "dev-article-final.md" "Video Demo"
  Assert-Contains "dev-article-final.md" "Code"
  Assert-Contains "dev-article-final.md" "How I Built It"
  Assert-Contains "dev-article-final.md" "Prize Category"
  Assert-Contains "dev-article-final.md" "Judge in 60 Seconds"
  Assert-Contains "dev-article-final.md" "Official route snapshot: Best Ode to Alan Turing, one of five USD 200 winner slots"
  Assert-Contains "dev-article-final.md" '{% embed https://github.com/OOYXLOO/helioigma %}'
  Assert-Contains "dev-article-final.md" "Plain source URL: https://github.com/OOYXLOO/helioigma"
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
  Assert-NotContains "dev-article-final.md" "positive reactions as a tie-breaker"
  Assert-Contains "dev-article-final.md" "Originality and Build Window"
  Assert-Contains "dev-article-final.md" "Challenge Compliance"
  Assert-Contains "dev-article-final.md" "official-route checklist"
  Assert-Contains "dev-article-final.md" "Helioigma targets Best Ode to Alan Turing and does not claim Best Google AI Usage"
  Assert-Contains "dev-article-final.md" "new creation for the official June 3 to June 21 jam window"
  Assert-Contains "dev-article-final.md" "not a wrapper around a prior game template"
  Assert-Contains "dev-article-final.md" "true demo artifacts from the current game rather than mockups"
  Assert-Contains "dev-article-final.md" "No third-party game template, stock-art pack, private dataset, backend service, API key, or account-local state"
  Assert-Contains "dev-article-final.md" "Best Ode to Alan Turing"
  Assert-Contains "dev-article-final.md" "Helioigma"
  Assert-Contains "dev-article-final.md" "solar rotor"
  Assert-Contains "dev-article-final.md" "I chose a cipher wheel"
  Assert-Contains "dev-article-final.md" "biggest tradeoff"
  Assert-Contains "dev-article-final.md" "only browser storage is a local numeric best-score key"
  Assert-Contains "dev-article-final.md" "public-preflight.ps1 -Public"
  Assert-Contains "dev-article-final.md" "cover_image: https://ooyxloo.github.io/helioigma/cover.png"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/helioigma/?demo=1"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/helioigma/helioigma-demo.gif"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/helioigma/helioigma-demo.webm"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/helioigma/helioigma-demo.mp4"
  Assert-Contains "dev-article-final.md" "Optional legacy MP4 fallback"
  Assert-Contains "dev-article-final.md" "Completion screenshot with receipt ledger"
  Assert-Contains "dev-article-final.md" "Mobile completion screenshot"
  Assert-Contains "dev-article-final.md" "![Helioigma four-phase demo solve]"
  Assert-Contains "dev-article-final.md" "phase banner"
  Assert-Contains "dev-article-final.md" "Optional default-off Web Audio cues"
  Assert-Contains "dev-article-final.md" "Nightfall report for failed manual runs"
  Assert-Contains "dev-article-final.md" "the losing state is inspectable"
  Assert-Contains "dev-article-final.md" 'Press `Audio` or `S`'
  Assert-Contains "dev-article-final.md" "default-off Audio control"
  Assert-Contains "dev-article-final.md" "Score rewards held daylight, streaks, and fewer wasted shifts"
  Assert-Contains "dev-article-final.md" "Accessibility, Fair Play, and Privacy"
  Assert-Contains "dev-article-final.md" "hidden helper text plus a phase announcer"
  Assert-Contains "dev-article-final.md" "no analytics call"
  Assert-Contains "dev-article-final.md" "not anti-cheat, identity, payout, or eligibility proof"
  Assert-Contains "dev-article-final.md" "On mobile the cards collapse to compact labels"
  Assert-NotContains "dev-article-final.md" "moved after the playfield on mobile"
  Assert-Contains "dev-article-final.md" "MIT license for the game package"
  Assert-Contains "dev-article-final.md" "does not claim the Best Google AI Usage category"
  Assert-Contains "dev-launch-brief.md" "Helioigma DEV Launch Brief"
  Assert-Contains "dev-launch-brief.md" "Helioigma: a Turing-wheel puzzle for holding the longest day"
  Assert-Contains "dev-launch-brief.md" "devchallenge"
  Assert-Contains "dev-launch-brief.md" "gamechallenge"
  Assert-Contains "dev-launch-brief.md" "gamedev"
  Assert-Contains "dev-launch-brief.md" "javascript"
  Assert-Contains "dev-launch-brief.md" "https://ooyxloo.github.io/helioigma/"
  Assert-Contains "dev-launch-brief.md" "https://github.com/OOYXLOO/helioigma"
  Assert-Contains "dev-launch-brief.md" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "dev-launch-brief.md" "PASS browser smoke"
  Assert-Contains "dev-launch-brief.md" "DEV No-Go Gate"
  Assert-Contains "dev-launch-brief.md" "Post-Publish Receipt"
  Assert-Contains "dev-launch-brief.md" "Honest Share Note"
  Assert-Contains "dev-launch-brief.md" "Do not publish the DEV article if"
  Assert-Contains "dev-launch-brief.md" "fake engagement"
  Assert-Contains "dev-launch-brief.md" "Any password, OTP, API key, payment detail, bank data, tax/KYC data, cookie, localStorage, or private email content"
  Assert-Contains "dev-article-final.md" 'Press `Demo Solve` or `D`'
  Assert-Contains "README.md" 'Use `Demo Solve` or press `D`'
  Assert-Contains "README.md" "CHALLENGE_COMPLIANCE.md"
  Assert-Contains "README.md" "package.json"
  Assert-Contains "README.md" "npm run smoke"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Prize target: Best Ode to Alan Turing"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Official Review Snapshot"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Judge proof: Play, Auto Demo, receipt verifier, manifest, and optional smoke test inspect the same loop"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Deadline: June 21, 2026 at 11:59 PM PDT"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Accessibility and privacy"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "receipt is review proof, not anti-cheat"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Do not publish the DEV article until all of these are true"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "No password, OTP, API key, payment detail, bank data, tax/KYC data, cookie, localStorage dump, or private email content"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "CHALLENGE_COMPLIANCE.md"
  Assert-Contains "dev-submit-console.html" 'plus a `D` shortcut'
  Assert-Contains "dev-submit-console.html" 'Optional `?demo=1` route'
  Assert-Contains "dev-submit-console.html" "Helioigma"
  Assert-Contains "dev-submit-console.html" "Reviewer fast path"
  Assert-Contains "dev-submit-console.html" "The shortest evaluation path is: play one phase, run Auto Demo, verify receipt"
  Assert-Contains "dev-submit-console.html" "No-Go Gate"
  Assert-Contains "dev-submit-console.html" "Judge in 60 Seconds"
  Assert-Contains "dev-submit-console.html" "mobile-complete-v1.png"
  Assert-Contains "dev-submit-console.html" "You get 45 seconds of daylight"
  Assert-Contains "dev-submit-console.html" "little daylight machine"
  Assert-Contains "dev-submit-console.html" "live objective strip tells you what the rotor wants next"
  Assert-Contains "dev-submit-console.html" "phase-proof line explains how the current phase maps"
  Assert-Contains "dev-submit-console.html" "My award thesis is simple"
  Assert-Contains "dev-submit-console.html" "playable ode, a judge-verifiable loop, and a finished static package"
  Assert-Contains "dev-submit-console.html" "first-move coach on Start"
  Assert-Contains "dev-submit-console.html" "tactile pulse feedback after hints or shifts"
  Assert-Contains "dev-submit-console.html" "judge-manifest.json"
  Assert-Contains "dev-submit-console.html" "CHALLENGE_COMPLIANCE.md"
  Assert-Contains "dev-submit-console.html" "Official route snapshot: Best Ode to Alan Turing, one of five USD 200 winner slots"
  Assert-Contains "dev-submit-console.html" "Challenge Compliance"
  Assert-Contains "dev-submit-console.html" "Public launch gate"
  Assert-Contains "dev-submit-console.html" "Sample receipt verifier"
  Assert-Contains "dev-submit-console.html" "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"
  Assert-Contains "dev-submit-console.html" "Rubric Fit"
  Assert-Contains "dev-submit-console.html" "live Rotor Trace, deterministic Demo Solve, and a verifiable run receipt"
  Assert-Contains "dev-submit-console.html" "phase banner"
  Assert-Contains "dev-submit-console.html" "Ode With Restraint"
  Assert-Contains "dev-submit-console.html" "Rotor Trace"
  Assert-Contains "dev-submit-console.html" "Post-Publish Share Note"
  Assert-Contains "dev-submit-console.html" "No pressure, no spam, and no fake engagement"
  Assert-NotContains "dev-submit-console.html" "positive reactions can matter"
  Assert-NotContains "dev-submit-console.html" "tie-breaker help"
  Assert-Contains "dev-submit-console.html" "Originality Note"
  Assert-Contains "dev-submit-console.html" '{% embed https://github.com/OOYXLOO/helioigma %}'
  Assert-Contains "dev-submit-console.html" "new creation for the official June 3 to June 21 jam window"
  Assert-Contains "dev-submit-console.html" "true demo artifacts from the current game rather than mockups"
  Assert-Contains "dev-submit-console.html" "not a wrapper around a prior game template"
  Assert-Contains "dev-submit-console.html" "No third-party game template, stock-art pack, private dataset, backend service, API key, or account-local state"
  Assert-Contains "dev-submit-console.html" "static solved cipher"
  Assert-Contains "dev-submit-console.html" "How I Built It"
  Assert-Contains "dev-submit-console.html" "Source: https://github.com/OOYXLOO/helioigma"
  Assert-Contains "dev-submit-console.html" "WebM video"
  Assert-Contains "dev-submit-console.html" "optional legacy MP4 fallback"
  Assert-Contains "dev-submit-console.html" "Completion screenshot with receipt ledger"
  Assert-Contains "dev-submit-console.html" "public-preflight.ps1 -Public"
  Assert-Contains "README.md" "only browser storage is the local numeric best score key"
  Assert-Contains "README.md" "phase objective strip with a compact phase-proof line"
  Assert-Contains "README.md" "phase-proof line keeps the solstice/Turing/verification connection visible"
  Assert-Contains "README.md" "GitHub Pages-ready static game package"
  Assert-Contains "README.md" "Owner-only publishing helpers are included"
  Assert-Contains "README.md" "Owner Launch Helpers"
  Assert-NotContains "README.md" "Public repository, GitHub Pages, and DEV submission are account-owner launch gates"
  Assert-NotContains "README.md" "if the user authorizes public publishing"
  Assert-NotContains "README.md" "backup route"
  Assert-Contains "README.md" "The Turing ode is intentionally restrained"
  Assert-Contains "README.md" "Award thesis: Helioigma is a playable ode"
  Assert-Contains "README.md" "JUDGE_REVIEW_CARD.md"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Helioigma Judge Review Card"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "60-Second Path"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Award Thesis"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Official Route Snapshot"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Rubric Evidence"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Nightfall recovery"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Boundaries"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Best Ode to Alan Turing"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "phase-proof cues"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "does not claim the Best Google AI Usage category"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "No backend, API key, private dataset, account login, payment data, tax/KYC data, cookie, or private email content"
  Assert-Contains "README.md" "first-move coach on Start"
  Assert-Contains "README.md" "tactile node pulse feedback"
  Assert-Contains "README.md" "optional default-off Web Audio cues"
  Assert-Contains "README.md" 'Use `Audio` or press `S`'
  Assert-Contains "README.md" "generated Web Audio tones"
  Assert-Contains "README.md" "Score rewards held daylight, streaks, and fewer wasted shifts"
  Assert-Contains "README.md" "Originality and Review Transparency"
  Assert-Contains "README.md" "not a wrapper around a prior game template"
  Assert-Contains "README.md" "No third-party game template, stock-art pack, private dataset, backend service, API key, or account-local state"
  Assert-Contains "README.md" "Rotor Trace"
  Assert-Contains "README.md" "Nightfall report"
  Assert-Contains "README.md" "Retry run"
  Assert-Contains "README.md" "scrolls the completed receipt panel into view"
  Assert-Contains "README.md" "final run receipt ledger"
  Assert-Contains "README.md" "phase banner"
  Assert-Contains "README.md" "?demo=1"
  Assert-Contains "README.md" "MIT license"
  Assert-Contains "LICENSE" "MIT License"
  Assert-Contains "publish-assistant.html" "No-go gate"
  Assert-Contains "publish-assistant.html" "OOYXLOO/helioigma"
  Assert-Contains "publish-assistant.html" "github.com/new?owner=OOYXLOO&name=helioigma&visibility=public"
  Assert-Contains "publish-assistant.html" "Optional GitHub CLI"
  Assert-Contains "publish-assistant.html" "https://ooyxloo.github.io/helioigma/?demo=1"
  Assert-Contains "publish-assistant.html" "69 smoke checks"
  Assert-Contains "submission-checklist.md" "judge-manifest.json"
  Assert-Contains "submission-checklist.md" "account-owner launch gates"
  Assert-Contains "submission-checklist.md" "share the DEV post only with honest feedback requests"
  Assert-Contains "submission-checklist.md" "Optional GitHub CLI path"
  Assert-Contains "submission-checklist.md" "Optional auto-demo route"
  Assert-Contains "submission-checklist.md" "Optional default-off Audio cue toggle"
  Assert-Contains "submission-checklist.md" '`devchallenge`, `gamechallenge`, `gamedev`, `javascript`'
  Assert-Contains "submission-checklist.md" "Optional legacy MP4 fallback"
  Assert-Contains "submission-checklist.md" "sample receipt verifier URL"
  Assert-Contains "submission-checklist.md" "69 expected smoke checks"
  Assert-Contains "submission-checklist.md" "no spam, no bought reactions, no pressure, and no fake engagement"
  Assert-Contains "PUBLISHING.md" "judge-manifest.json"
  Assert-Contains "PUBLISHING.md" "Public repository, GitHub Pages, and DEV submission are account-owner launch gates"
  Assert-Contains "PUBLISHING.md" "gh repo create OOYXLOO/helioigma"
  Assert-Contains "PUBLISHING.md" "Do not spam, buy reactions, pressure people, or ask for fake engagement"
  Assert-Contains "publish-after-repo.ps1" "publish-after-repo helper"
  Assert-Contains "publish-after-repo.ps1" "-Push"
  Assert-Contains "publish-after-repo.ps1" "github.com/new?owner=OOYXLOO&name=helioigma&visibility=public"
  Assert-Contains "publish-after-repo.ps1" "Optional GitHub CLI command"
  Assert-Contains "publish-after-repo.ps1" "leave README, license, and .gitignore unchecked"
  Assert-Contains "publish-after-repo.ps1" "Assert-CleanWorktreeForPush"
  Assert-Contains "publish-after-repo.ps1" "Commit the verified Helioigma package before pushing"
  Assert-Contains "tools/browser-smoke-check.mjs" "PASS browser smoke"
  Assert-Contains "tools/browser-smoke-check.mjs" "?demo=1"
  Assert-Contains "tools/browser-smoke-check.mjs" "auto demo route did not reach the stable receipt"
  Assert-Contains "tools/browser-smoke-check.mjs" "auto demo route did not build a verifier link"
  Assert-Contains "tools/browser-smoke-check.mjs" "auto demo route did not scroll the receipt into view"
  Assert-Contains "tools/browser-smoke-check.mjs" "first screen sample verifier link is not prefilled"
  Assert-Contains "tools/browser-smoke-check.mjs" "judge page verifier action is not prefilled"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile game canvas starts too low for game-first review"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile first viewport shows too little gameplay canvas"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile visible control buttons are too short"
  Assert-Contains "tools/browser-smoke-check.mjs" "Stable Demo Solve receipt"
  Assert-Contains "tools/browser-smoke-check.mjs" "non-stable formula-valid receipt should be neutral"
  Assert-Contains "tools/browser-smoke-check.mjs" "expected 69 smoke checks"
  Assert-Contains "tools/browser-smoke-check.mjs" "play rule no longer gives the rushed-judge goal"
  Assert-Contains "tools/browser-smoke-check.mjs" "phase proof initial copy changed"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile phase proof initial copy changed"
  Assert-Contains "tools/browser-smoke-check.mjs" "audio cues should default off"
  Assert-Contains "tools/browser-smoke-check.mjs" "video/webm"
  Assert-Contains "tools/build-demo-video.mjs" "live browser recording"
  Assert-Contains "tools/build-demo-video.mjs" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "tools/build-demo-video.mjs" "Stable Demo Solve receipt"
  Assert-Contains "tools/build-demo-video.mjs" "HELIOIGMA_VIDEO_WORK_DIR"
  Assert-Contains "tools/build-demo-video.mjs" "tmpdir()"
  Assert-Contains "tools/build-demo-webm.mjs" "helioigma-demo.webm"
  Assert-Contains "tools/build-demo-webm.mjs" "demo-frames-v3"
  Assert-Contains ".github/workflows/verify.yml" "helioigma-demo.webm"
  Assert-Contains ".github/workflows/verify.yml" "Run browser smoke on committed package"
  Assert-Contains ".github/workflows/verify.yml" "npm run smoke"
  Assert-Contains ".github/workflows/verify.yml" "Verify rebuilt demo video output"
  Assert-Contains ".github/workflows/verify.yml" "https://ooyxloo.github.io/helioigma/"
  Assert-Contains ".github/workflows/verify.yml" "helioigma-dev-package.zip"
  Assert-NotContains ".github/workflows/verify.yml" "solstice-cipher"
  Assert-Contains ".gitignore" "helioigma-dev-package.zip"
  Assert-Contains ".gitignore" "node_modules/"
  Assert-Contains "judge.html" "Run Smoke Test"
  Assert-Contains "judge.html" "Helioigma is a playable Turing ode for holding the longest day."
  Assert-Contains "judge.html" "A small static 45-second, four-phase game"
  Assert-Contains "judge.html" "receipt verifier, theme fit, run receipt, and source path"
  Assert-Contains "judge.html" "60-second review path"
  Assert-Contains "judge.html" "Official route snapshot"
  Assert-Contains "judge.html" "Best Ode to Alan Turing, one of five USD 200 winner slots"
  Assert-Contains "judge.html" "Award thesis"
  Assert-Contains "judge.html" "Playable ode"
  Assert-Contains "judge.html" "Judge-verifiable"
  Assert-Contains "judge.html" "Finished surface"
  Assert-Contains "judge.html" "Primary judge actions"
  Assert-Contains "judge.html" "Play First."
  Assert-Contains "judge.html" "tactile node pulse"
  Assert-Contains "judge.html" "Evidence links"
  Assert-Contains "judge.html" "Watch the playable page complete all four phases"
  Assert-Contains "judge.html" "Optional Smoke."
  Assert-Contains "judge.html" "Run the 69-check browser smoke test"
  Assert-Contains "judge.html" "nightfall report"
  Assert-Contains "judge.html" "Open Manifest"
  Assert-Contains "judge.html" "judge-manifest.json"
  Assert-Contains "judge.html" "Watch Video"
  Assert-Contains "judge.html" "Auto Demo"
  Assert-Contains "judge.html" "Helioigma"
  Assert-Contains "judge.html" "Verify Receipt"
  Assert-Contains "judge.html" '<video src="helioigma-demo.webm"'
  Assert-Contains "judge.html" 'poster="desktop-check-v5.png"'
  Assert-Contains "judge.html" "helioigma-demo.gif"
  Assert-Contains "judge.html" "timed node-rotation loop"
  Assert-Contains "judge.html" "Animated Helioigma demo preview"
  Assert-Contains "judge.html" "visual-judge-hero"
  Assert-Contains "judge.html" "helioigma-demo.webm"
  Assert-Contains "judge.html" "recorded from the real browser judge path"
  Assert-Contains "judge.html" "Ode With Restraint"
  Assert-Contains "judge.html" "Nightfall Recovery"
  Assert-Contains "judge.html" "the Nightfall report summarizes aligned nodes"
  Assert-Contains "judge.html" "Rubric snapshot"
  Assert-Contains "judge.html" "Theme relevance"
  Assert-Contains "judge.html" "Technical execution"
  Assert-Contains "judge.html" "Writing quality"
  Assert-Contains "judge.html" "Turing category"
  Assert-Contains "judge.html" "Judge-Verifiable Loop"
  Assert-Contains "judge.html" "not only a solstice skin over a puzzle"
  Assert-Contains "judge.html" "Rotor Trace"
  Assert-Contains "judge.html" "state, logic, verification"
  Assert-Contains "judge.html" "Run Receipt"
  Assert-Contains "judge.html" "run receipt"
  Assert-Contains "judge.html" "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"
  Assert-Contains "judge.html" "prefilled sample verifier"
  Assert-Contains "proof-verifier.html" "Source note:"
  Assert-Contains "proof-verifier.html" "generated in <code>game.js</code> by <code>buildRunProof</code>"
  Assert-NotContains "judge.html" "Watch the public page complete all four phases"
  Assert-NotContains "judge.html" "radial-gradient"
  Assert-NotContains "judge.html" "DEV Console"
  Assert-NotContains "judge.html" "Publish Assistant"
  Assert-Contains "styles.css" "linear-gradient(105deg"
  Assert-Contains "styles.css" "#demoButton"
  Assert-Contains "styles.css" "box-shadow: 0 10px 28px rgba(247, 201, 72, 0.16)"
  Assert-Contains "styles.css" ".node-button.recent"
  Assert-Contains "styles.css" ".judge-path span"
  Assert-Contains "tools/browser-smoke-check.mjs" "canvasVisibleHeight"
  Assert-Contains "game.js" "recentIndex"
  Assert-Contains "game.js" "AudioContext"
  Assert-Contains "game.js" "playCue"
  Assert-Contains "game.js" "cueFirstMove"
  Assert-Contains "game.js" "Next mismatch: node"
  Assert-Contains "tools/browser-smoke-check.mjs" "tactile node pulse"
  Assert-Contains "tools/browser-smoke-check.mjs" "first-move coach"
  Assert-Contains "tools/browser-smoke-check.mjs" "desktop game canvas starts too low"
  Assert-NotContains "styles.css" "radial-gradient"
  Assert-Contains "game.js" "Run receipt copied."
  Assert-Contains "game.js" "Judge run summary copied."
  Assert-Contains "index.html" "Judge run summary"
  Assert-Contains "index.html" "Copy judge summary"
  Assert-Contains "styles.css" ".judge-run-summary"
  Assert-Contains "styles.css" ".award-signals"
  Assert-Contains "index.html" "awardSignals"
  Assert-Contains "index.html" "Award signals"
  Assert-Contains "game.js" "Award signals: solstice loop, Turing ode, judge proof"
  Assert-Contains "smoke.html" "award signals are present"
  Assert-Contains "smoke.html" "demo award signals name solstice, Turing, and judge proof"
  Assert-Contains "game.js" "proof-verifier.html?receipt="
  Assert-Contains "game.js" 'get("demo") === "1"'
  Assert-NotContains "game.js" "Run proof"
  Assert-Contains "index.html" "nodeButtons"
  Assert-Contains "index.html" "phaseTrack"
  Assert-Contains "index.html" "shiftLabel"
  Assert-Contains "index.html" "hintButton"
  Assert-Contains "index.html" "soundButton"
  Assert-Contains "index.html" 'aria-keyshortcuts="S"'
  Assert-Contains "index.html" "tracePanel"
  Assert-Contains "index.html" "traceNext"
  Assert-Contains "index.html" "phaseAnnouncer"
  Assert-Contains "index.html" "demoButton"
  Assert-Contains "index.html" "Demo Solve full judge route"
  Assert-Contains "index.html" "quick-controls"
  Assert-Contains "index.html" "judge-path"
  Assert-Contains "index.html" "1. Play"
  Assert-Contains "index.html" "2. Demo Solve + Rotor Trace"
  Assert-Contains "index.html" "Demo Solve traces all four phases."
  Assert-Contains "index.html" "3. Receipt"
  Assert-Contains "index.html" "Verify sample"
  Assert-Contains "index.html" "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"
  Assert-Contains "index.html" "judge-links"
  Assert-Contains "index.html" "dayMeter"
  Assert-Contains "index.html" "dayMeterFill"
  Assert-Contains "styles.css" "min-height: 40px"
  Assert-Contains "styles.css" "#resetButton"
  Assert-Contains "index.html" "objective-strip"
  Assert-Contains "index.html" "phaseObjective"
  Assert-Contains "index.html" "phaseTargetLine"
  Assert-Contains "index.html" "phaseAlignment"
  Assert-Contains "index.html" "phaseProof"
  Assert-Contains "index.html" "Phase proof"
  Assert-Contains "index.html" "Solstice crib starts target checking."
  Assert-Contains "game.js" "phaseProofs"
  Assert-Contains "game.js" "Checksum night seals the receipt."
  Assert-Contains "index.html" "proofSummary"
  Assert-Contains "index.html" "phaseLedger"
  Assert-Contains "index.html" "verifyProofLink"
  Assert-Contains "index.html" "nightfallPanel"
  Assert-Contains "index.html" "Nightfall report"
  Assert-Contains "index.html" "retryButton"
  Assert-Contains "game.js" "Nightfall sealed the rotor. Retry or watch Demo Solve."
  Assert-Contains "game.js" "syncNightfallPanel"
  Assert-Contains "index.html" "Helioigma"
  Assert-Contains "index.html" "In each 45s phase, rotate every numbered node until it matches the target glyphs"
  Assert-Contains "index.html" "full receipt path"
  Assert-Contains "index.html" "20260614-nightfall-report"
  Assert-Contains "index.html" "https://ooyxloo.github.io/helioigma/cover.png"
  Assert-Contains "index.html" "twitter:image"
  Assert-Contains "index.html" "aria-keyshortcuts=""H"""
  Assert-Contains "index.html" "aria-keyshortcuts=""D"""
  Assert-Contains "index.html" "aria-keyshortcuts=""1 2 3 4 5 6 7 8 9"""
  Assert-Contains "smoke.html" "first-phase node buttons are present"
  Assert-Contains "smoke.html" "20260614-nightfall-report"
  Assert-Contains "smoke.html" "hint button is present"
  Assert-Contains "smoke.html" "audio cue button is present"
  Assert-Contains "smoke.html" "audio cues default off"
  Assert-Contains "smoke.html" "play rule gives 45s target-glyph receipt path"
  Assert-Contains "smoke.html" "hint shortcut is exposed"
  Assert-Contains "smoke.html" "start button shows the first-move coach"
  Assert-Contains "smoke.html" "hint shortcut names the next mismatched node"
  Assert-Contains "smoke.html" "hint highlights a node button"
  Assert-Contains "smoke.html" "rotor trace panel is present"
  Assert-Contains "smoke.html" "phase announcer is present"
  Assert-Contains "smoke.html" "phase announcer names the active phase"
  Assert-Contains "smoke.html" "phase scoring ledger is present"
  Assert-Contains "smoke.html" "judge run summary is present"
  Assert-Contains "smoke.html" "four phase ledger entries"
  Assert-Contains "smoke.html" "rotor trace records hint action"
  Assert-Contains "smoke.html" "first-screen judge path is present"
  Assert-Contains "smoke.html" "demo solve button is present"
  Assert-Contains "smoke.html" "daylight meter is present"
  Assert-Contains "smoke.html" "phase objective strip is present"
  Assert-Contains "smoke.html" "nightfall report appears after timeout"
  Assert-Contains "smoke.html" "nightfall retry starts a new manual run"
  Assert-Contains "smoke.html" "phase objective names the first phase"
  Assert-Contains "smoke.html" "phase objective shows target glyphs and alignment"
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
  Assert-Contains "proof-verifier.html" "Stable Demo Solve receipt"
  Assert-Contains "proof-verifier.html" "Stable demo boundary"
  Assert-Contains "proof-verifier.html" "Other formula-valid receipts are shown as neutral checksum-form matches"
  Assert-Contains "proof-verifier.html" "Checksum-form valid, but not the published stable Demo Solve receipt"
  Assert-Contains "proof-verifier.html" 'get("receipt")'
  Assert-Contains "proof-verifier.html" "What this checks"
  Assert-Contains "proof-verifier.html" "What this does not check"
  Assert-Contains "proof-verifier.html" "solstice|4|2907|62|4"
  Assert-Contains "proof-verifier.html" "not anti-cheat, identity, payout, or eligibility proof"
  Assert-Contains "proof-verifier.html" "linear-gradient(105deg"
  Assert-NotContains "proof-verifier.html" "radial-gradient"
  Assert-Contains "verification-report.md" "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"
  Assert-Contains "verification-report.md" "PASS - Longest day held"
  Assert-Contains "verification-report.md" "completion screenshot with final receipt, phase scoring ledger, and Judge run summary"
  Assert-Contains "verification-report.md" "mobile completion screenshot with stable receipt"
  Assert-Contains "verification-report.md" "GIF preview ending on the receipt ledger and Judge run summary"
  Assert-Contains "verification-report.md" "parsed receipt facts"
  Assert-Contains "verification-report.md" "Score variance is expected"
  Assert-Contains "verification-report.md" "Rubric Snapshot"
  Assert-Contains "verification-report.md" "Theme relevance"
  Assert-Contains "verification-report.md" "Technical execution"
  Assert-Contains "verification-report.md" "Turing category"
  Assert-Contains "verification.html" "Score variance is expected"
  Assert-Contains "verification.html" "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"
  Assert-Contains "verification.html" "helioigma-demo.webm"
  Assert-Contains "verification.html" "mobile-complete-v1.png"
  Assert-Contains "verification.html" "Rubric Snapshot"
  Assert-Contains "verification.html" "Theme relevance"
  Assert-Contains "verification.html" "Technical execution"
  Assert-Contains "verification.html" "Turing category"
  Assert-Contains "judge-manifest.json" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "judge-manifest.json" "public_review_surface"
  Assert-Contains "judge-manifest.json" "judge review card"
  Assert-Contains "judge-manifest.json" "JUDGE_REVIEW_CARD.md"
  Assert-Contains "judge-manifest.json" "owner_publication_note"
  Assert-Contains "judge-manifest.json" "owner_actions_not_automated"
  Assert-Contains "judge-manifest.json" "originality"
  Assert-Contains "judge-manifest.json" "template_boundary"
  Assert-Contains "judge-manifest.json" "asset_boundary"
  Assert-Contains "judge-manifest.json" "Best Ode to Alan Turing"
  Assert-Contains "judge-manifest.json" "award_thesis"
  Assert-Contains "judge-manifest.json" "score_basis"
  Assert-Contains "judge-manifest.json" "nightfall_recovery"
  Assert-Contains "judge-manifest.json" "mobile_completion_proof"
  Assert-Contains "judge-manifest.json" "mobile-complete-v1.png"
  Assert-Contains "judge-manifest.json" "phase_proof_line"
  Assert-Contains "judge-manifest.json" "phase-proof line"
  Assert-Contains "judge-manifest.json" "ode_note"
  Assert-Contains "judge-manifest.json" "https://ooyxloo.github.io/helioigma/"
  Assert-Contains "judge-manifest.json" "sample_receipt_verifier"
  Assert-Contains "judge-manifest.json" "https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"

  $scanFiles = Get-ChildItem -File -Include *.html,*.js,*.md,*.json -Recurse |
    Where-Object { $_.FullName -notmatch "\\.git\\" }
  $secretHits = $scanFiles | Select-String -Pattern "sk-[A-Za-z0-9._-]{12,}|AKIA[0-9A-Z]{16}|BEGIN PRIVATE KEY|password:|secret:|bank account|card number" -ErrorAction SilentlyContinue
  if ($secretHits) {
    $secretHits | ForEach-Object { Write-Output "Potential secret hit: $($_.Path):$($_.LineNumber)" }
    throw "Potential secret-like content found"
  }

  if ($Public) {
    $urls = @(
      "https://ooyxloo.github.io/helioigma/",
      "https://ooyxloo.github.io/helioigma/judge.html",
      "https://ooyxloo.github.io/helioigma/smoke.html",
      "https://ooyxloo.github.io/helioigma/proof-verifier.html",
      "https://ooyxloo.github.io/helioigma/judge-manifest.json",
      "https://ooyxloo.github.io/helioigma/dev-submit-console.html",
      "https://ooyxloo.github.io/helioigma/helioigma-demo.webm",
      "https://ooyxloo.github.io/helioigma/helioigma-demo.gif",
      "https://ooyxloo.github.io/helioigma/mobile-complete-v1.png",
      "https://github.com/OOYXLOO/helioigma"
    )
    foreach ($url in $urls) {
      Assert-Http200 $url
    }
  }

  Write-Output "PASS Helioigma preflight"
} finally {
  Pop-Location
}
