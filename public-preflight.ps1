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

function Get-Sha256HexFromStream {
  param([System.IO.Stream]$Stream)
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $hash = $sha.ComputeHash($Stream)
    return -join ($hash | ForEach-Object { $_.ToString("x2") })
  } finally {
    $sha.Dispose()
  }
}

function Get-Sha256HexFromFile {
  param([string]$Path)
  $stream = [System.IO.File]::OpenRead((Resolve-Path -LiteralPath $Path))
  try {
    return Get-Sha256HexFromStream $stream
  } finally {
    $stream.Dispose()
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
    "package-lock.json",
    "FIRST_MINUTE.md",
    "JUDGE_REVIEW_CARD.md",
    "RUBRIC_SCORECARD.md",
    "CHALLENGE_COMPLIANCE.md",
    "judge.html",
    "judge-manifest.json",
    "smoke.html",
    "proof-verifier.html",
    "dev-article-final.md",
    "dev-launch-brief.md",
    "publish-after-repo.ps1",
    "tools/build-package.ps1",
    "tools/build-demo-video.mjs",
    "tools/build-demo-webm.mjs",
    "tools/build-demo-gif.py",
    "tools/browser-smoke-check.mjs",
    "tools/capture-public-media.mjs",
    "tools/launch-readiness-audit.mjs",
    "tools/verify-media-freshness.mjs",
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
  node tools/verify-media-freshness.mjs | Out-Null

  $package = Get-Content -Raw -LiteralPath "package.json" | ConvertFrom-Json
  if ($package.name -ne "helioigma") { throw "package name mismatch" }
  if ($package.scripts.smoke -ne "node tools/browser-smoke-check.mjs") { throw "package smoke script mismatch" }
  if ($package.scripts.'audit:launch' -ne "node tools/launch-readiness-audit.mjs") { throw "package audit:launch script mismatch" }
  if ($package.scripts.'audit:launch:public' -ne "node tools/launch-readiness-audit.mjs --public") { throw "package audit:launch:public script mismatch" }
  if ($package.scripts.'build:media' -ne "node tools/capture-public-media.mjs") { throw "package build:media script mismatch" }
  if ($package.scripts.'build:gif' -ne "python tools/build-demo-gif.py") { throw "package build:gif script mismatch" }
  if ($package.scripts.'verify:media' -ne "node tools/verify-media-freshness.mjs") { throw "package verify:media script mismatch" }
  if (-not ($package.scripts.check -like "*ast.parse(pathlib.Path('tools/build-demo-gif.py').read_text())*")) { throw "package check must parse GIF builder without writing pycache" }
  if ($package.devDependencies.playwright -ne "1.60.0") { throw "package Playwright devDependency mismatch" }
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
      "tools/capture-public-media.mjs",
      "tools/browser-smoke-check.mjs",
      "tools/build-demo-gif.py",
      "tools/build-package.ps1",
      "tools/verify-media-freshness.mjs",
      "mobile-complete-v1.png"
    )) {
      if ($zipEntries -notcontains $entry) {
        throw "Package ZIP missing required relative entry: $entry"
      }
    }
    $zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath "helioigma-dev-package.zip"))
    try {
      $entryByName = @{}
      foreach ($entry in $zip.Entries) {
        if (-not [string]::IsNullOrEmpty($entry.FullName)) {
          $entryByName[$entry.FullName] = $entry
        }
      }
      foreach ($relativePath in $trackedEntries) {
        $entry = $entryByName[$relativePath]
        if ($null -eq $entry) {
          throw "Package ZIP missing tracked file during content check: $relativePath"
        }
        $fileHash = Get-Sha256HexFromFile ($relativePath -replace "/", [System.IO.Path]::DirectorySeparatorChar)
        $entryStream = $entry.Open()
        try {
          $entryHash = Get-Sha256HexFromStream $entryStream
        } finally {
          $entryStream.Dispose()
        }
        if ($fileHash -ne $entryHash) {
          throw "Package ZIP content drift for $relativePath; rebuild with npm run build:package"
        }
      }
    } finally {
      $zip.Dispose()
    }
  }

  $manifest = Get-Content -Raw -LiteralPath "judge-manifest.json" | ConvertFrom-Json
  if ($manifest.project -ne "Helioigma") { throw "judge-manifest project mismatch" }
  if ($manifest.challenge.name -ne "DEV June Solstice Game Jam") { throw "judge-manifest challenge mismatch" }
  if ($manifest.challenge.target_prize_usd -ne 200) { throw "judge-manifest prize mismatch" }
  if ($manifest.challenge.target_category -ne "Best Ode to Alan Turing") { throw "judge-manifest category mismatch" }
  if ($manifest.challenge.official_route_snapshot.prize_route -ne "Best Ode to Alan Turing category route in the official challenge.") { throw "judge-manifest official route prize mismatch" }
  if ($manifest.challenge.official_route_snapshot.submit_by -ne "June 21, 2026 at 11:59 PM PDT.") { throw "judge-manifest official route deadline mismatch" }
  if (-not ($manifest.challenge.official_route_snapshot.judge_proof -like "Play, Auto Demo, receipt checker*stable summary receipt.")) { throw "judge-manifest official route proof mismatch" }
  if (-not ($manifest.challenge.official_route_snapshot.boundary -like "No Google AI claim*")) { throw "judge-manifest official route boundary mismatch" }
  if (-not ($manifest.challenge.award_thesis -like "Helioigma is a playable ode*a receipt-checkable loop*")) { throw "judge-manifest award thesis mismatch" }
  if (-not ($manifest.challenge.award_thesis -like "*game feel through target glyphs*Nightfall recovery*")) { throw "judge-manifest game-feel thesis mismatch" }
  if ($manifest.challenge.rubric_snapshot.Count -ne 5) { throw "judge-manifest rubric snapshot mismatch" }
  if ($manifest.challenge.rubric_snapshot[0].criterion -ne "Theme relevance") { throw "judge-manifest rubric first criterion mismatch" }
  if ($manifest.proof.stable_receipt -ne "SC-4P-2907-62-Y5VFX1") { throw "judge-manifest proof mismatch" }
  if ($manifest.public_urls.auto_demo -ne "https://ooyxloo.github.io/helioigma/?demo=1") { throw "judge-manifest auto demo mismatch" }
  if ($manifest.verification.expected_smoke_checks -ne 70) { throw "judge-manifest smoke count mismatch" }
  if (-not ($manifest.proof.score_basis -like "Score rewards held daylight*summary receipt checksum*")) { throw "judge-manifest score basis mismatch" }
  if (-not ($manifest.proof.phase_proof_line -like "Each phase exposes a compact Turing cue*")) { throw "judge-manifest Turing cue mismatch" }
  if (-not ($manifest.proof.phase_proof_line -like "*distinct hint scan order*")) { throw "judge-manifest phase scan-order mismatch" }
  if (-not ($manifest.proof.judge_run_summary -like "*award signals*")) { throw "judge-manifest judge run summary mismatch" }
  if (-not ($manifest.proof.mobile_completion_proof -like "mobile-complete-v1.png captures*")) { throw "judge-manifest mobile completion proof mismatch" }
  if (-not ($manifest.proof.nightfall_recovery -like "Failed manual runs show a Nightfall report*")) { throw "judge-manifest nightfall recovery mismatch" }
  if ($manifest.status.no_secrets -ne $true) { throw "judge-manifest no-secret boundary mismatch" }
  if (-not ($manifest.status.public_review_surface -like "Public review uses*")) { throw "judge-manifest public review surface mismatch" }
  if (-not ($manifest.status.owner_publication_note -like "Public hosting and DEV article publication are external publication actions*")) { throw "judge-manifest owner publication note mismatch" }
  if (-not ($manifest.status.browser_storage -like "*?nostore=1 disables best-score reads/writes*")) { throw "judge-manifest browser-storage privacy mode mismatch" }
  if ($manifest.public_urls.first_minute -ne "https://ooyxloo.github.io/helioigma/FIRST_MINUTE.md") { throw "judge-manifest first-minute URL mismatch" }
  if ($manifest.public_urls.privacy_review -ne "https://ooyxloo.github.io/helioigma/?nostore=1") { throw "judge-manifest privacy review URL mismatch" }
  if ($manifest.accessibility_and_fair_play.input_paths.Count -lt 4) { throw "judge-manifest accessibility input-path mismatch" }
  if (-not (($manifest.accessibility_and_fair_play.input_paths -join " ") -like "*SOL -> XOR -> LUX -> BIN*")) { throw "judge-manifest glyph cycle cue mismatch" }
  if (-not ($manifest.accessibility_and_fair_play.assistive_technology -contains "aria-live phase announcer")) { throw "judge-manifest accessibility assistive-tech mismatch" }
  if (-not ($manifest.accessibility_and_fair_play.privacy -like "No telemetry*?nostore=1*")) { throw "judge-manifest accessibility privacy mismatch" }
  if (-not ($manifest.accessibility_and_fair_play.receipt_boundary -like "The receipt is transparent review evidence*")) { throw "judge-manifest accessibility receipt-boundary mismatch" }
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
  if ($manifest.public_urls.rubric_scorecard -ne "https://ooyxloo.github.io/helioigma/RUBRIC_SCORECARD.md") { throw "judge-manifest rubric scorecard URL mismatch" }
  if ($manifest.public_urls.cover_image -ne "https://ooyxloo.github.io/helioigma/cover.png?v=20260615-fresh-media") { throw "judge-manifest cover image URL mismatch" }
  if ($manifest.public_urls.demo_webm -ne "https://ooyxloo.github.io/helioigma/helioigma-demo.webm?v=20260615-fresh-media") { throw "judge-manifest demo WebM URL mismatch" }
  if ($manifest.public_urls.demo_gif -ne "https://ooyxloo.github.io/helioigma/helioigma-demo.gif?v=20260615-fresh-media") { throw "judge-manifest demo GIF URL mismatch" }
  if ($manifest.public_urls.mobile_completion_image -ne "https://ooyxloo.github.io/helioigma/mobile-complete-v1.png?v=20260615-fresh-media") { throw "judge-manifest mobile completion image URL mismatch" }
  foreach ($artifact in $manifest.local_artifacts) {
    Assert-File $artifact
  }

  Assert-Contains "dev-article-final.md" "tags: devchallenge, gamechallenge, gamedev, javascript"
  Assert-Contains "dev-article-final.md" "published: true"
  Assert-NotContains "dev-article-final.md" "published: false"
  Assert-Contains "dev-article-final.md" "This is a submission for the [June Solstice Game Jam]"
  Assert-Contains "dev-article-final.md" "It targets the Best Ode to Alan Turing category"
  Assert-Contains "dev-article-final.md" "Reviewer Fast Path"
  Assert-Contains "dev-article-final.md" "If you are judging quickly, the first-minute check is"
  Assert-Contains "dev-article-final.md" "Helioigma targets Best Ode to Alan Turing because the tribute is playable"
  Assert-Contains "dev-article-final.md" "The first-minute loop in motion"
  Assert-Contains "dev-article-final.md" "No account, backend, Google AI claim, API key, private data, or hidden judge dashboard is needed"
  Assert-Contains "dev-article-final.md" "What I Built"
  Assert-Contains "dev-article-final.md" "You open with 45 seconds of daylight"
  Assert-Contains "dev-article-final.md" "little daylight machine"
  Assert-Contains "dev-article-final.md" "live objective strip tells you what the rotor wants next"
  Assert-Contains "dev-article-final.md" "For game feel, I focused on a short pressure loop"
  Assert-Contains "dev-article-final.md" "the first artifact is still the playable daylight race"
  Assert-Contains "dev-article-final.md" "a compact Turing cue names the current reasoning"
  Assert-Contains "dev-article-final.md" "The manual Hint and Rotor Trace path also changes by phase"
  Assert-Contains "dev-article-final.md" "XOR alternates mirrored rotor nodes"
  Assert-Contains "dev-article-final.md" "inspectable run summary with score, shifts, phase count, and checksum"
  Assert-Contains "dev-article-final.md" "That is my Best Ode to Alan Turing angle"
  Assert-Contains "dev-article-final.md" "rotor state and checksum reasoning carry the tribute"
  Assert-Contains "dev-article-final.md" "finished static package lets a judge inspect one stable Demo Solve"
  Assert-Contains "dev-article-final.md" "small pressure loop"
  Assert-Contains "dev-article-final.md" "Video Demo"
  Assert-Contains "dev-article-final.md" "Code"
  Assert-Contains "dev-article-final.md" "How I Built It"
  Assert-Contains "dev-article-final.md" "Prize Category"
  Assert-Contains "dev-article-final.md" "Judge in 60 Seconds"
  Assert-Contains "dev-article-final.md" "Official route snapshot: Best Ode to Alan Turing category route in the official challenge"
  Assert-Contains "dev-article-final.md" '{% embed https://github.com/OOYXLOO/helioigma %}'
  Assert-Contains "dev-article-final.md" "Plain source URL: https://github.com/OOYXLOO/helioigma"
  Assert-Contains "dev-article-final.md" "judge-manifest.json"
  Assert-Contains "dev-article-final.md" "RUBRIC_SCORECARD.md"
  Assert-Contains "dev-article-final.md" "Rubric Fit"
  Assert-Contains "dev-article-final.md" "Why It Is Not Just a Cipher Demo"
  Assert-Contains "dev-article-final.md" "an inspectable loop"
  Assert-Contains "dev-article-final.md" "not just a solstice skin over a puzzle"
  Assert-Contains "dev-article-final.md" "An Ode with Restraint"
  Assert-Contains "dev-article-final.md" "not a biography game"
  Assert-Contains "dev-article-final.md" "careful reasoning about machines and evidence"
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
  Assert-Contains "dev-article-final.md" "only default browser storage is a local numeric best-score key"
  Assert-Contains "dev-article-final.md" "?nostore=1"
  Assert-Contains "dev-article-final.md" "SOL -> XOR -> LUX -> BIN"
  Assert-Contains "dev-article-final.md" "public-preflight.ps1 -Public"
  Assert-Contains "dev-article-final.md" "cover_image: https://ooyxloo.github.io/helioigma/cover.png?v=20260615-fresh-media"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/helioigma/?demo=1"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/helioigma/RUBRIC_SCORECARD.md"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/helioigma/helioigma-demo.gif"
  Assert-Contains "dev-article-final.md" "https://ooyxloo.github.io/helioigma/helioigma-demo.webm"
  Assert-Contains "dev-article-final.md" "helioigma-demo.gif?v=20260615-fresh-media"
  Assert-Contains "dev-article-final.md" "helioigma-demo.webm?v=20260615-fresh-media"
  Assert-Contains "dev-article-final.md" "cover.png?v=20260615-fresh-media"
  Assert-Contains "dev-article-final.md" "desktop-check-v5.png?v=20260615-fresh-media"
  Assert-Contains "dev-article-final.md" "mobile-check-v6.png?v=20260615-fresh-media"
  Assert-Contains "dev-article-final.md" "desktop-complete-v4.png?v=20260615-fresh-media"
  Assert-Contains "dev-article-final.md" "mobile-complete-v1.png?v=20260615-fresh-media"
  Assert-NotContains "dev-article-final.md" "https://ooyxloo.github.io/helioigma/helioigma-demo.mp4"
  Assert-NotContains "dev-article-final.md" "Optional legacy MP4 fallback"
  Assert-Contains "dev-article-final.md" "Completion screenshot with receipt ledger"
  Assert-Contains "dev-article-final.md" "Mobile completion screenshot"
  Assert-Contains "dev-article-final.md" "![Helioigma four-phase demo solve]"
  Assert-Contains "dev-article-final.md" "phase banner"
  Assert-Contains "dev-article-final.md" "Optional default-off Web Audio cues"
  Assert-Contains "dev-article-final.md" "live Rotor Trace with run-quality feedback"
  Assert-Contains "dev-article-final.md" "Nightfall reports failed manual runs"
  Assert-Contains "dev-article-final.md" "the losing state is inspectable"
  Assert-Contains "dev-article-final.md" 'Press `Audio` or `S`'
  Assert-Contains "dev-article-final.md" "default-off Audio control"
  Assert-Contains "dev-article-final.md" "Score rewards held daylight, streaks, and fewer wasted shifts"
  Assert-Contains "dev-article-final.md" "Accessibility, Fair Play, and Privacy"
  Assert-Contains "dev-article-final.md" "hidden helper text plus a phase announcer"
  Assert-Contains "dev-article-final.md" "no analytics call"
  Assert-Contains "dev-article-final.md" "not anti-cheat, identity, payout, or eligibility proof"
  Assert-Contains "dev-article-final.md" "On mobile the Run Path moves below the playfield"
  Assert-Contains "dev-article-final.md" "MIT license for the game package"
  Assert-Contains "dev-article-final.md" "does not claim the Best Google AI Usage category"
  Assert-Contains "dev-launch-brief.md" "Helioigma DEV Launch Brief"
  Assert-Contains "dev-launch-brief.md" "Helioigma: a Turing-wheel puzzle for holding the longest day"
  Assert-Contains "dev-launch-brief.md" "race a solar cipher wheel, trace its rotor state, and verify the solved run"
  Assert-Contains "dev-launch-brief.md" "receipt-checkable loop"
  Assert-Contains "dev-launch-brief.md" "First-minute check for rushed judges"
  Assert-Contains "dev-launch-brief.md" "Rotate one node, watch Rotor Trace explain the state change"
  Assert-Contains "dev-launch-brief.md" "devchallenge"
  Assert-Contains "dev-launch-brief.md" "gamechallenge"
  Assert-Contains "dev-launch-brief.md" "gamedev"
  Assert-Contains "dev-launch-brief.md" "javascript"
  Assert-Contains "dev-launch-brief.md" "https://ooyxloo.github.io/helioigma/"
  Assert-Contains "dev-launch-brief.md" "https://github.com/OOYXLOO/helioigma"
  Assert-Contains "dev-launch-brief.md" "https://ooyxloo.github.io/helioigma/RUBRIC_SCORECARD.md"
  Assert-Contains "dev-launch-brief.md" "helioigma-demo.webm?v=20260615-fresh-media"
  Assert-Contains "dev-launch-brief.md" "helioigma-demo.gif?v=20260615-fresh-media"
  Assert-Contains "dev-launch-brief.md" "cover.png?v=20260615-fresh-media"
  Assert-Contains "dev-launch-brief.md" "Source rubric scorecard"
  Assert-Contains "dev-launch-brief.md" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "dev-launch-brief.md" "PASS browser smoke"
  Assert-Contains "dev-launch-brief.md" "DEV No-Go Gate"
  Assert-Contains "dev-launch-brief.md" "Post-Publish Receipt"
  Assert-Contains "dev-launch-brief.md" "Honest Share Note"
  Assert-Contains "dev-launch-brief.md" "Do not publish the DEV article if"
  Assert-Contains "dev-launch-brief.md" "fake engagement"
  Assert-Contains "dev-launch-brief.md" "Any password, OTP, API key, payment detail, bank data, tax/KYC data, cookie, localStorage, or private email content"
  Assert-Contains "dev-article-final.md" 'Press `Demo Solve` or `D`'
  Assert-Contains "dev-article-final.md" "tools/build-demo-gif.py"
  Assert-Contains "dev-article-final.md" "tools/verify-media-freshness.mjs"
  Assert-Contains "README.md" 'Use `Demo Solve` or press `D`'
  Assert-Contains "README.md" "first and last target glyphs do not clip"
  Assert-Contains "README.md" "Rotor Trace now includes a run-quality line"
  Assert-Contains "README.md" "CHALLENGE_COMPLIANCE.md"
  Assert-Contains "README.md" "package.json"
  Assert-Contains "README.md" "npm run smoke"
  Assert-Contains "README.md" "npm run build:gif"
  Assert-Contains "README.md" "npm run verify:media"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Prize target: Best Ode to Alan Turing category route"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Official Review Snapshot"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Judge receipt: Play, Auto Demo, receipt checker, manifest, and optional smoke test inspect the published review surface and stable summary receipt"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Deadline: June 21, 2026 at 11:59 PM PDT"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Accessibility and privacy"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "receipt is review evidence, not anti-cheat"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "Do not publish the DEV article until all of these are true"
  Assert-Contains "CHALLENGE_COMPLIANCE.md" "No password, OTP, API key, payment detail, bank data, tax/KYC data, cookie, localStorage dump, or private email content"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "CHALLENGE_COMPLIANCE.md"
  Assert-Contains "README.md" "only default browser storage is the local numeric best score key"
  Assert-Contains "README.md" "?nostore=1"
  Assert-Contains "FIRST_MINUTE.md" "Local pre-publication equivalents"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Local pre-publication path"
  Assert-Contains "README.md" "phase objective strip with a compact Turing cue line"
  Assert-Contains "README.md" 'phase-guided manual `Hint` path'
  Assert-Contains "README.md" "XOR alternates mirrored nodes"
  Assert-Contains "README.md" "Seal the daylight run."
  Assert-NotContains "README.md" "Prove the daylight run."
  Assert-Contains "README.md" "The first phase cue is"
  Assert-Contains "README.md" "Crib checks state."
  Assert-Contains "README.md" "GitHub Pages-ready static game package"
  Assert-Contains "README.md" "Owner-only launch notes are kept in Markdown"
  Assert-Contains "README.md" "Local Launch Notes"
  Assert-NotContains "README.md" "Public repository, GitHub Pages, and DEV submission are account-owner launch gates"
  Assert-NotContains "README.md" "if the user authorizes public publishing"
  Assert-NotContains "README.md" "backup route"
  Assert-Contains "README.md" "The Turing ode is intentionally restrained"
  Assert-Contains "README.md" "Award thesis: Helioigma is a playable ode, a receipt-checkable loop"
  Assert-Contains "README.md" "FIRST_MINUTE.md"
  Assert-Contains "README.md" "JUDGE_REVIEW_CARD.md"
  Assert-Contains "README.md" "RUBRIC_SCORECARD.md"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Helioigma Judge Review Card"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "FIRST_MINUTE.md"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "60-Second Path"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Rotate one numbered node and watch Rotor Trace"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Award Thesis"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Official Route Snapshot"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "RUBRIC_SCORECARD.md"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Rubric Evidence"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Nightfall recovery"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Boundaries"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Best Ode to Alan Turing"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "first-screen"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "Turing cue"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "phase-specific hint order"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "does not claim the Best Google AI Usage category"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "No backend, API key, private dataset, account login, payment data, tax/KYC data, cookie, or private email content"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "helioigma-demo.gif?v=20260615-fresh-media"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "helioigma-demo.webm?v=20260615-fresh-media"
  Assert-Contains "JUDGE_REVIEW_CARD.md" "mobile-complete-v1.png?v=20260615-fresh-media"
  Assert-Contains "FIRST_MINUTE.md" "Helioigma First Minute"
  Assert-Contains "FIRST_MINUTE.md" "rushed DEV judge"
  Assert-Contains "FIRST_MINUTE.md" "Try This In One Minute"
  Assert-Contains "FIRST_MINUTE.md" "Watch Rotor Trace name the action and next mismatch"
  Assert-Contains "FIRST_MINUTE.md" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "FIRST_MINUTE.md" "Best Ode to Alan Turing"
  Assert-Contains "FIRST_MINUTE.md" "No Best Google AI Usage claim"
  Assert-Contains "FIRST_MINUTE.md" "not anti-cheat, identity, eligibility, or payment proof"
  Assert-Contains "RUBRIC_SCORECARD.md" "Helioigma Rubric Scorecard"
  Assert-Contains "RUBRIC_SCORECARD.md" "Best Ode to Alan Turing"
  Assert-Contains "RUBRIC_SCORECARD.md" "No Google AI category claim"
  Assert-Contains "RUBRIC_SCORECARD.md" "70-check browser smoke"
  Assert-Contains "RUBRIC_SCORECARD.md" "phase-specific hint order"
  Assert-Contains "README.md" 'first-move coach on `Start Run`'
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
  Assert-Contains "submission-checklist.md" "judge-manifest.json"
  Assert-Contains "submission-checklist.md" "RUBRIC_SCORECARD.md"
  Assert-Contains "submission-checklist.md" "Rubric scorecard link"
  Assert-Contains "submission-checklist.md" "account-owner launch gates"
  Assert-Contains "submission-checklist.md" "share the DEV post only with honest feedback requests"
  Assert-Contains "submission-checklist.md" "Optional GitHub CLI path"
  Assert-Contains "submission-checklist.md" "Optional auto-demo route"
  Assert-Contains "submission-checklist.md" "Optional default-off Audio cue toggle"
  Assert-Contains "submission-checklist.md" '`devchallenge`, `gamechallenge`, `gamedev`, `javascript`'
  Assert-Contains "submission-checklist.md" "Optional legacy MP4 fallback"
  Assert-Contains "submission-checklist.md" "sample receipt verifier URL"
  Assert-Contains "submission-checklist.md" "70 expected smoke checks"
  Assert-Contains "submission-checklist.md" "no spam, no bought reactions, no pressure, and no fake engagement"
  Assert-Contains "PUBLISHING.md" "judge-manifest.json"
  Assert-Contains "PUBLISHING.md" "RUBRIC_SCORECARD.md"
  Assert-Contains "PUBLISHING.md" 'Public source includes `RUBRIC_SCORECARD.md`'
  Assert-Contains "PUBLISHING.md" "Public repository, GitHub Pages, and DEV submission are account-owner launch gates"
  Assert-Contains "PUBLISHING.md" "gh repo create OOYXLOO/helioigma"
  Assert-Contains "PUBLISHING.md" "Do not spam, buy reactions, pressure people, or ask for fake engagement"
  Assert-Contains "publish-after-repo.ps1" "publish-after-repo helper"
  Assert-Contains "publish-after-repo.ps1" "-Push"
  Assert-Contains "publish-after-repo.ps1" "-ConfigurePages"
  Assert-Contains "publish-after-repo.ps1" "-WaitForPages"
  Assert-Contains "publish-after-repo.ps1" "github.com/new?owner=OOYXLOO&name=helioigma&visibility=public"
  Assert-Contains "publish-after-repo.ps1" "Optional GitHub CLI command"
  Assert-Contains "publish-after-repo.ps1" "repos/OOYXLOO/helioigma/pages"
  Assert-Contains "publish-after-repo.ps1" "source[branch]=main"
  Assert-Contains "publish-after-repo.ps1" "Launch package HEAD"
  Assert-Contains "publish-after-repo.ps1" "Launch package ZIP SHA256"
  Assert-Contains "publish-after-repo.ps1" "public-preflight.ps1 -Public"
  Assert-Contains "PUBLISHING.md" "gh api --method POST"
  Assert-Contains "publish-after-repo.ps1" "leave README, license, and .gitignore unchecked"
  Assert-Contains "publish-after-repo.ps1" "Assert-CleanWorktreeForPush"
  Assert-Contains "publish-after-repo.ps1" "Commit the verified Helioigma package before pushing"
  Assert-Contains "PUBLISHING.md" "-Push -ConfigurePages"
  Assert-Contains "PUBLISHING.md" "-Push -ConfigurePages -WaitForPages"
  Assert-Contains "tools/browser-smoke-check.mjs" "PASS browser smoke"
  Assert-Contains "tools/browser-smoke-check.mjs" "?demo=1"
  Assert-Contains "tools/browser-smoke-check.mjs" "auto demo route did not reach the stable receipt"
  Assert-Contains "tools/browser-smoke-check.mjs" "auto demo route did not build a verifier link"
  Assert-Contains "tools/browser-smoke-check.mjs" "auto demo route did not scroll the receipt into view"
  Assert-Contains "tools/browser-smoke-check.mjs" "judge shortcut row sample verifier link is not prefilled"
  Assert-Contains "tools/browser-smoke-check.mjs" "judge shortcut row should stay focused on four routes"
  Assert-Contains "tools/browser-smoke-check.mjs" "document title no longer carries the solstice/Turing preview hook"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile run path cues changed"
  Assert-Contains "tools/browser-smoke-check.mjs" "judge page verifier action is not prefilled"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile game canvas starts too low for game-first review"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile first viewport shows too little gameplay canvas"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile visible control buttons are too short"
  Assert-Contains "tools/browser-smoke-check.mjs" "Stable Demo Solve receipt"
  Assert-Contains "tools/browser-smoke-check.mjs" "non-stable formula-valid receipt should be neutral"
  Assert-Contains "tools/browser-smoke-check.mjs" "expected 70 smoke checks"
  Assert-Contains "tools/browser-smoke-check.mjs" "play rule no longer gives the rushed-judge goal"
  Assert-Contains "tools/browser-smoke-check.mjs" "Turing cue initial copy changed"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile Turing cue initial copy changed"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile target row is too close to the left canvas edge"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile target row is too close to the right canvas edge"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile target row inset is too small for glyph labels"
  Assert-Contains "tools/browser-smoke-check.mjs" "audio cues should default off"
  Assert-Contains "tools/browser-smoke-check.mjs" "video/webm"
  Assert-Contains "tools/build-demo-video.mjs" "live browser recording"
  Assert-Contains "tools/build-demo-video.mjs" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "tools/build-demo-video.mjs" "Stable Demo Solve receipt"
  Assert-Contains "tools/build-demo-video.mjs" "HELIOIGMA_VIDEO_WORK_DIR"
  Assert-Contains "tools/build-demo-video.mjs" "tmpdir()"
  Assert-Contains "tools/build-demo-webm.mjs" "helioigma-demo.webm"
  Assert-Contains "tools/build-demo-webm.mjs" "demo-frames-v3"
  Assert-Contains "README.md" "tools/build-demo-gif.py"
  Assert-Contains "README.md" "tools/verify-media-freshness.mjs"
  Assert-Contains "tools/build-demo-gif.py" "helioigma-demo.gif"
  Assert-Contains "tools/verify-media-freshness.mjs" "PASS media freshness"
  Assert-Contains "tools/capture-public-media.mjs" "clean browser contexts"
  Assert-Contains "tools/capture-public-media.mjs" "first screen inherited best score"
  Assert-Contains "tools/capture-public-media.mjs" "mobile-complete-v1.png"
  Assert-Contains ".github/workflows/verify.yml" "helioigma-demo.webm"
  Assert-Contains ".github/workflows/verify.yml" "Run browser smoke on committed package"
  Assert-Contains ".github/workflows/verify.yml" "npm run smoke"
  Assert-Contains ".github/workflows/verify.yml" "npm ci"
  Assert-Contains ".github/workflows/verify.yml" "Verify rebuilt public media output"
  Assert-Contains ".github/workflows/verify.yml" "https://ooyxloo.github.io/helioigma/"
  Assert-Contains ".github/workflows/verify.yml" "helioigma-dev-package.zip"
  Assert-NotContains ".github/workflows/verify.yml" "solstice-cipher"
  Assert-Contains ".gitignore" "helioigma-dev-package.zip"
  Assert-Contains ".gitignore" "node_modules/"
  Assert-Contains "judge.html" "Run Smoke Test"
  Assert-Contains "judge.html" "Helioigma is a playable Turing ode for holding the longest day."
  Assert-Contains "judge.html" "A small static four-phase game"
  Assert-Contains "judge.html" "transparent receipt"
  Assert-Contains "judge.html" "receipt checker, theme fit, run receipt, and source path"
  Assert-Contains "judge.html" "60-second review path"
  Assert-Contains "judge.html" "Official route snapshot"
  Assert-Contains "judge.html" "Best Ode to Alan Turing category route in the official challenge"
  Assert-Contains "judge.html" "Award thesis"
  Assert-Contains "judge.html" "Playable ode"
  Assert-Contains "judge.html" "Inspectable run"
  Assert-Contains "judge.html" "Finished surface"
  Assert-Contains "judge.html" "Primary judge actions"
  Assert-Contains "judge.html" "Play First."
  Assert-Contains "judge.html" "tactile node pulse"
  Assert-Contains "judge.html" "Evidence links"
  Assert-Contains "judge.html" "Watch the playable page complete all four phases"
  Assert-Contains "judge.html" "Optional Smoke."
  Assert-Contains "judge.html" "Run the 70-check browser smoke test"
  Assert-Contains "judge.html" "nightfall report"
  Assert-Contains "judge.html" "Open Manifest"
  Assert-Contains "judge.html" "Open Scorecard"
  Assert-Contains "judge.html" "RUBRIC_SCORECARD.md"
  Assert-Contains "judge.html" "judge-manifest.json"
  Assert-Contains "judge.html" "Watch Video"
  Assert-Contains "judge.html" "Auto Demo"
  Assert-Contains "judge.html" "Helioigma"
  Assert-Contains "judge.html" "Verify Receipt"
  Assert-Contains "judge.html" "No Storage"
  Assert-Contains "judge.html" "./?nostore=1"
  Assert-Contains "judge.html" '<video src="helioigma-demo.webm?v=20260615-fresh-media"'
  Assert-Contains "judge.html" 'poster="desktop-check-v5.png?v=20260615-fresh-media"'
  Assert-Contains "judge.html" "helioigma-demo.webm?v=20260615-fresh-media"
  Assert-Contains "judge.html" "desktop-check-v5.png?v=20260615-fresh-media"
  Assert-Contains "judge.html" "helioigma-demo.gif?v=20260615-fresh-media"
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
  Assert-Contains "judge.html" "Inspectable Finished Loop"
  Assert-Contains "judge.html" "Game Feel"
  Assert-Contains "judge.html" "short timer pressure, node pulse reactions, phase-specific Hint scans"
  Assert-Contains "judge.html" "not only a solstice skin over a puzzle"
  Assert-Contains "judge.html" "Rotor Trace"
  Assert-Contains "judge.html" "state, logic, verification"
  Assert-Contains "judge.html" "Run Summary"
  Assert-Contains "judge.html" "run receipt"
  Assert-Contains "judge.html" "stable run summary"
  Assert-Contains "judge.html" "Why it stands out in a jam review"
  Assert-Contains "judge.html" "avoids the common prototype traps"
  Assert-Contains "judge.html" "Not a write-up wrapper"
  Assert-Contains "judge.html" "Theme in mechanics"
  Assert-Contains "judge.html" "Fast judge confidence"
  Assert-Contains "judge.html" "Publication-safe"
  Assert-Contains "judge.html" "the first click opens a timed rotor puzzle"
  Assert-Contains "judge.html" "same static route instead of separate screenshots"
  Assert-Contains "judge.html" "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"
  Assert-Contains "judge.html" "prefilled sample verifier"
  Assert-Contains "proof-verifier.html" "Source note:"
  Assert-Contains "proof-verifier.html" "generated in <code>game.js</code> by <code>buildRunProof</code>"
  Assert-Contains "proof-verifier.html" "summary payload shape"
  Assert-Contains "proof-verifier.html" "score, shift count, phase count, and checksum"
  Assert-NotContains "proof-verifier.html" "published scoring formula"
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
  Assert-Contains "game.js" "phaseScanNotes"
  Assert-Contains "game.js" "phaseOrders"
  Assert-Contains "game.js" "findGuidedMismatchIndex"
  Assert-Contains "game.js" "Next mismatch: node"
  Assert-Contains "tools/browser-smoke-check.mjs" "tactile node pulse"
  Assert-Contains "tools/browser-smoke-check.mjs" "first-move coach"
  Assert-Contains "tools/browser-smoke-check.mjs" "desktop game canvas starts too low"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile Run Path should sit after the playable canvas"
  Assert-NotContains "styles.css" "radial-gradient"
  Assert-Contains "game.js" "Run receipt copied."
  Assert-Contains "game.js" "Judge run summary copied."
  Assert-Contains "game.js" "Logic aligned. Daylight sealed."
  Assert-NotContains "game.js" "Daylight proved"
  Assert-Contains "index.html" "Judge run summary"
  Assert-Contains "index.html" "Copy judge summary"
  Assert-Contains "styles.css" ".judge-run-summary"
  Assert-Contains "styles.css" ".award-signals"
  Assert-Contains "index.html" "awardSignals"
  Assert-Contains "index.html" "Award signals"
  Assert-Contains "game.js" "Award signals: solstice loop, Turing ode, judge receipt"
  Assert-Contains "smoke.html" "award signals are present"
  Assert-Contains "smoke.html" "demo award signals name solstice, Turing, and judge receipt"
  Assert-Contains "game.js" "proof-verifier.html?receipt="
  Assert-Contains "game.js" "storageDisabled"
  Assert-Contains "game.js" 'get("nostore") === "1"'
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
  Assert-Contains "index.html" "traceQuality"
  Assert-Contains "index.html" "phaseAnnouncer"
  Assert-Contains "index.html" "demoButton"
  Assert-Contains "index.html" "Demo Solve full judge route"
  Assert-Contains "index.html" "Seal the daylight run."
  Assert-NotContains "index.html" "Prove the daylight run."
  Assert-Contains "index.html" "quick-controls"
  Assert-Contains "index.html" "judge-path"
  Assert-Contains "index.html" "Run path"
  Assert-Contains "index.html" "1. Match"
  Assert-Contains "index.html" "2. Trace"
  Assert-Contains "index.html" "3. Seal"
  Assert-Contains "index.html" "Rotate nodes before nightfall."
  Assert-Contains "index.html" "mobile-cue"
  Assert-Contains "index.html" "Receipt"
  Assert-Contains "index.html" "Verify sample"
  Assert-Contains "index.html" "proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1"
  Assert-Contains "index.html" "Watch video"
  Assert-Contains "index.html" "helioigma-demo.webm?v=20260615-fresh-media"
  Assert-Contains "index.html" "cover.png?v=20260615-fresh-media"
  Assert-Contains "index.html" "judge-links"
  Assert-Contains "index.html" "dayMeter"
  Assert-Contains "index.html" "dayMeterFill"
  Assert-Contains "styles.css" "min-height: 44px"
  Assert-Contains "styles.css" ".mobile-cue"
  Assert-Contains "styles.css" "min-height: 38px"
  Assert-Contains "styles.css" "grid-template-columns: repeat(6, minmax(0, 1fr));"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile Reset is not visible in the first viewport"
  Assert-Contains "index.html" "objective-strip"
  Assert-Contains "index.html" "phaseObjective"
  Assert-Contains "index.html" "phaseTargetLine"
  Assert-Contains "index.html" "phaseAlignment"
  Assert-Contains "index.html" "phaseProof"
  Assert-Contains "index.html" "Turing cue"
  Assert-Contains "index.html" "Crib checks state."
  Assert-Contains "game.js" "phaseProofs"
  Assert-Contains "game.js" "Checksum seals the trace."
  Assert-Contains "index.html" "proofSummary"
  Assert-Contains "index.html" "phaseLedger"
  Assert-Contains "index.html" "verifyProofLink"
  Assert-Contains "index.html" "nightfallPanel"
  Assert-Contains "index.html" "Nightfall report"
  Assert-Contains "index.html" "retryButton"
  Assert-Contains "game.js" "Nightfall sealed the rotor. Retry or watch Demo Solve."
  Assert-Contains "game.js" "syncNightfallPanel"
  Assert-Contains "game.js" "const shiftPenaltySeconds = 0.45"
  Assert-Contains "game.js" "const firstMovePulseSeconds = 1.2"
  Assert-Contains "game.js" 'Daylight -${shiftPenaltySeconds}s.'
  Assert-Contains "index.html" "Helioigma"
  Assert-Contains "index.html" "<title>Helioigma - Solstice Rotor Turing Ode</title>"
  Assert-Contains "index.html" '<link rel="canonical" href="https://ooyxloo.github.io/helioigma/">'
  Assert-Contains "index.html" '<meta property="og:title" content="Helioigma - Solstice Rotor Turing Ode">'
  Assert-Contains "index.html" '<meta property="og:url" content="https://ooyxloo.github.io/helioigma/">'
  Assert-Contains "index.html" "Start with 45s daylight"
  Assert-Contains "index.html" "Rotate numbered nodes"
  Assert-Contains "index.html" "match the target glyphs"
  Assert-Contains "index.html" "survive nightfall"
  Assert-Contains "index.html" "SOL -> XOR -> LUX -> BIN"
  Assert-Contains "index.html" "Finish all four phases"
  Assert-Contains "index.html" "20260615-canvas-priority"
  Assert-Contains "index.html" "https://ooyxloo.github.io/helioigma/cover.png"
  Assert-Contains "index.html" "twitter:image"
  Assert-Contains "index.html" "aria-keyshortcuts=""H"""
  Assert-Contains "index.html" "aria-keyshortcuts=""D"""
  Assert-Contains "index.html" "aria-keyshortcuts=""1 2 3 4 5 6 7 8 9"""
  Assert-Contains "smoke.html" "first-phase node buttons are present"
  Assert-Contains "smoke.html" "20260615-canvas-priority"
  Assert-NotContains ".github/workflows/verify.yml" "20260614-mobile-review"
  Assert-NotContains ".github/workflows/verify.yml" '          grep -q "Prove the daylight run."'
  Assert-Contains "README.md" "is intentionally wider than the other quick controls"
  Assert-Contains "README.md" "Player feel matters as much as proof"
  Assert-Contains "verification-report.md" "is wider than the other quick controls"
  Assert-Contains "verification-report.md" "Game feel is part of the review surface"
  Assert-Contains "verification-report.md" "Privacy review path"
  Assert-Contains "tools/browser-smoke-check.mjs" "mobile Demo Solve is not visually prioritized"
  Assert-Contains "styles.css" "grid-column: span 2"
  Assert-Contains "judge.html" 'href="RUBRIC_SCORECARD.md"'
  Assert-Contains "judge.html" 'href="dev-article-final.md"'
  Assert-Contains "judge.html" 'href="README.md"'
  Assert-Contains "verification.html" "github.com/OOYXLOO/helioigma/blob/main/RUBRIC_SCORECARD.md"
  Assert-Contains "smoke.html" "hint button is present"
  Assert-Contains "smoke.html" "audio cue button is present"
  Assert-Contains "smoke.html" "audio cues default off"
  Assert-Contains "smoke.html" "play rule gives opening-daylight rotate-match-survive goal"
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
  Assert-Contains "smoke.html" "judge shortcut links keep the strongest four review routes"
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
  Assert-Contains "verification.html" "current local package on 2026-06-15"
  Assert-Contains "verification.html" "Latest local run:"
  Assert-NotContains "verification.html" "2026-06-14"
  Assert-NotContains "verification.html" "Latest live-timer score 2892"
  Assert-Contains "verification.html" "Rubric Snapshot"
  Assert-Contains "verification.html" "Theme relevance"
  Assert-Contains "verification.html" "Technical execution"
  Assert-Contains "verification.html" "Turing category"
  Assert-Contains "judge-manifest.json" "SC-4P-2907-62-Y5VFX1"
  Assert-Contains "judge-manifest.json" "public_review_surface"
  Assert-Contains "judge-manifest.json" "FIRST_MINUTE.md"
  Assert-Contains "judge-manifest.json" "first_minute"
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
  Assert-Contains "judge-manifest.json" "Turing cue line"
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

  $localPathHits = $scanFiles | Select-String -Pattern "(?<![A-Za-z])[A-Za-z]:[\\/][^\s`"')]+|\.codex[\\/]|hks-yxl|money-goal-200usd" -ErrorAction SilentlyContinue
  if ($localPathHits) {
    $localPathHits | ForEach-Object { Write-Output "Local staging path hit: $($_.Path):$($_.LineNumber)" }
    throw "Local staging path found in launch text"
  }

  if ($Public) {
    $urls = @(
      "https://ooyxloo.github.io/helioigma/",
      "https://ooyxloo.github.io/helioigma/?demo=1",
      "https://ooyxloo.github.io/helioigma/judge.html",
      "https://ooyxloo.github.io/helioigma/smoke.html",
      "https://ooyxloo.github.io/helioigma/proof-verifier.html",
      "https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1",
      "https://ooyxloo.github.io/helioigma/judge-manifest.json",
      "https://ooyxloo.github.io/helioigma/FIRST_MINUTE.md",
      "https://ooyxloo.github.io/helioigma/RUBRIC_SCORECARD.md",
      "https://ooyxloo.github.io/helioigma/cover.png",
      "https://ooyxloo.github.io/helioigma/desktop-check-v5.png",
      "https://ooyxloo.github.io/helioigma/mobile-check-v6.png",
      "https://ooyxloo.github.io/helioigma/desktop-complete-v4.png",
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
