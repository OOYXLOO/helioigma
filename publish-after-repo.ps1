param(
  [switch]$Push,
  [switch]$ConfigurePages,
  [switch]$WaitForPages,
  [int]$PagesTimeoutSec = 240,
  [int]$PagesPollSec = 15
)

$ErrorActionPreference = "Stop"
$repoUrl = "https://github.com/OOYXLOO/helioigma.git"
$repoPage = "https://github.com/OOYXLOO/helioigma"
$repoCreateUrl = "https://github.com/new?owner=OOYXLOO&name=helioigma&visibility=public"
$repoCreateCommand = 'gh repo create OOYXLOO/helioigma --public --description "Helioigma: a Turing-wheel puzzle for the DEV June Solstice Game Jam" --homepage "https://ooyxloo.github.io/helioigma/"'
$pagesUrl = "https://ooyxloo.github.io/helioigma/"
$pagesSettingsUrl = "$repoPage/settings/pages"
$pagesCreateArgs = @("api", "--method", "POST", "repos/OOYXLOO/helioigma/pages", "-f", "source[branch]=main", "-f", "source[path]=/")
$pagesUpdateArgs = @("api", "--method", "PUT", "repos/OOYXLOO/helioigma/pages", "-f", "source[branch]=main", "-f", "source[path]=/")

function Run {
  param([string]$Command)
  Write-Output "> $Command"
  if ($Push) {
    Invoke-Expression $Command
  }
}

function Invoke-GitCapture {
  param([string[]]$Arguments)

  $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
  $startInfo.FileName = "git"
  $startInfo.Arguments = ($Arguments | ForEach-Object {
    if ($_ -match '\s') {
      '"' + ($_ -replace '"', '\"') + '"'
    } else {
      $_
    }
  }) -join " "
  $startInfo.RedirectStandardOutput = $true
  $startInfo.RedirectStandardError = $true
  $startInfo.UseShellExecute = $false

  $process = [System.Diagnostics.Process]::Start($startInfo)
  $stdout = $process.StandardOutput.ReadToEnd()
  $stderr = $process.StandardError.ReadToEnd()
  $process.WaitForExit()

  [pscustomobject]@{
    ExitCode = $process.ExitCode
    Output = (($stdout + $stderr).Trim())
  }
}

function Invoke-GhCapture {
  param([string[]]$Arguments)

  $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
  $startInfo.FileName = "gh"
  $startInfo.Arguments = ($Arguments | ForEach-Object {
    if ($_ -match '\s') {
      '"' + ($_ -replace '"', '\"') + '"'
    } else {
      $_
    }
  }) -join " "
  $startInfo.RedirectStandardOutput = $true
  $startInfo.RedirectStandardError = $true
  $startInfo.UseShellExecute = $false

  $process = [System.Diagnostics.Process]::Start($startInfo)
  $stdout = $process.StandardOutput.ReadToEnd()
  $stderr = $process.StandardError.ReadToEnd()
  $process.WaitForExit()

  [pscustomobject]@{
    ExitCode = $process.ExitCode
    Output = (($stdout + $stderr).Trim())
  }
}

function Format-CommandLine {
  param([string]$Program, [string[]]$Arguments)
  $rendered = $Arguments | ForEach-Object {
    if ($_ -match '[\s\[\]]') {
      '"' + ($_ -replace '"', '\"') + '"'
    } else {
      $_
    }
  }
  "$Program $($rendered -join ' ')"
}

function Write-PagesDryRun {
  Write-Output "Optional Pages API command, only if the account owner is present and gh is already authenticated:"
  Write-Output (Format-CommandLine "gh" $pagesCreateArgs)
  Write-Output "If GitHub says Pages already exists, use:"
  Write-Output (Format-CommandLine "gh" $pagesUpdateArgs)
  Write-Output "Or re-run this helper after push with:"
  Write-Output "powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push -ConfigurePages"
  Write-Output "To wait for Pages and run the public preflight after push, add:"
  Write-Output "powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push -ConfigurePages -WaitForPages"
}

function Configure-GitHubPages {
  if (-not $ConfigurePages) {
    Write-Output "GitHub Pages API configuration was not requested."
    Write-PagesDryRun
    return
  }

  if (-not $Push) {
    Write-Output "Dry run: -ConfigurePages was provided without -Push, so no GitHub Pages API call will be made."
    Write-PagesDryRun
    return
  }

  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Output "BLOCKED: GitHub CLI 'gh' is not available. Enable Pages manually at $pagesSettingsUrl."
    exit 1
  }

  Write-Output "Configuring GitHub Pages from branch main / root with GitHub CLI..."
  Write-Output "> $(Format-CommandLine "gh" $pagesCreateArgs)"
  $createResult = Invoke-GhCapture $pagesCreateArgs
  if ($createResult.ExitCode -eq 0) {
    if ($createResult.Output) { Write-Output $createResult.Output }
    Write-Output "GitHub Pages create request accepted."
    return
  }

  Write-Output $createResult.Output
  Write-Output "Create request did not complete. Trying the update endpoint in case Pages already exists..."
  Write-Output "> $(Format-CommandLine "gh" $pagesUpdateArgs)"
  $updateResult = Invoke-GhCapture $pagesUpdateArgs
  if ($updateResult.ExitCode -ne 0) {
    Write-Output $updateResult.Output
    Write-Output "BLOCKED: Could not configure GitHub Pages through gh. Enable Pages manually at $pagesSettingsUrl."
    exit 1
  }

  if ($updateResult.Output) { Write-Output $updateResult.Output }
  Write-Output "GitHub Pages update request accepted."
}

function Wait-ForGitHubPages {
  if (-not $WaitForPages) {
    Write-Output "Pages wait was not requested."
    return
  }

  if (-not $Push) {
    Write-Output "Dry run: -WaitForPages was provided without -Push, so no public polling will be made."
    Write-Output "After push/Pages setup, run: powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push -ConfigurePages -WaitForPages"
    return
  }

  $deadline = (Get-Date).AddSeconds($PagesTimeoutSec)
  Write-Output "Waiting up to $PagesTimeoutSec seconds for $pagesUrl to return HTTP 200..."
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $pagesUrl -Method Head -MaximumRedirection 5 -TimeoutSec 20 -UseBasicParsing
      if ($response.StatusCode -eq 200) {
        Write-Output "GitHub Pages is live: $pagesUrl"
        Write-Output "> powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public"
        powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public
        return
      }
      Write-Output "Pages check returned HTTP $($response.StatusCode); waiting $PagesPollSec seconds..."
    } catch {
      Write-Output "Pages not ready yet: $($_.Exception.Message)"
      Write-Output "Waiting $PagesPollSec seconds..."
    }
    Start-Sleep -Seconds $PagesPollSec
  }

  Write-Output "BLOCKED: $pagesUrl did not return HTTP 200 within $PagesTimeoutSec seconds."
  Write-Output "Open $pagesSettingsUrl, confirm Pages source is main / root, then run:"
  Write-Output "powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public"
  exit 1
}

function Assert-CleanWorktreeForPush {
  if (-not $Push) {
    return
  }

  $statusCheck = Invoke-GitCapture @("status", "--porcelain")
  if ($statusCheck.ExitCode -ne 0) {
    Write-Output $statusCheck.Output
    Write-Output "BLOCKED: Could not read git status before push."
    exit 1
  }

  if ($statusCheck.Output) {
    Write-Output "BLOCKED: Working tree has uncommitted changes. Commit the verified Helioigma package before pushing so public Pages receives the same build that passed local checks."
    Write-Output $statusCheck.Output
    exit 1
  }
}

Push-Location $PSScriptRoot
try {
Write-Output "Helioigma publish-after-repo helper"
  Write-Output "Repository: $repoUrl"
  Write-Output "Mode: $(if ($Push) { 'PUSH ENABLED' } else { 'dry run' })"
  Write-Output "Pages API: $(if ($ConfigurePages) { 'requested' } else { 'dry-run instructions only' })"
  Write-Output "Pages wait: $(if ($WaitForPages) { "$PagesTimeoutSec sec timeout / $PagesPollSec sec interval" } else { 'not requested' })"

  powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1

  $remoteCheck = Invoke-GitCapture @("ls-remote", $repoUrl, "HEAD")
  if ($remoteCheck.ExitCode -ne 0) {
    Write-Output $remoteCheck.Output
    Write-Output "BLOCKED: Public repository is not reachable yet. Create $repoPage first, public, with no README/license/gitignore initialization."
    Write-Output "Fast create link: $repoCreateUrl"
    Write-Output "Optional GitHub CLI command, only if the account owner is present and gh is already authenticated:"
    Write-Output $repoCreateCommand
    Write-Output "Important: leave README, license, and .gitignore unchecked so this prepared main branch can push cleanly."
    exit 1
  }

  $originCheck = Invoke-GitCapture @("remote", "get-url", "origin")
  $origin = $originCheck.Output
  if ($originCheck.ExitCode -ne 0) {
    Run "git remote add origin $repoUrl"
  } elseif ($origin -ne $repoUrl) {
    Write-Output "BLOCKED: Existing origin is '$origin', expected '$repoUrl'. Fix manually before pushing."
    exit 1
  } else {
    Write-Output "origin already points to $repoUrl"
  }

  Assert-CleanWorktreeForPush
  Run "git push -u origin main"
  Configure-GitHubPages
  Wait-ForGitHubPages

  if (-not $Push) {
    Write-Output ""
    Write-Output "Dry run complete. Re-run with -Push after confirming the public repo exists:"
    Write-Output "powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push"
    Write-Output "To also try GitHub Pages setup through gh while you are present:"
    Write-Output "powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push -ConfigurePages"
    Write-Output "To wait for Pages and run public preflight after Pages setup:"
    Write-Output "powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push -ConfigurePages -WaitForPages"
  } else {
    Write-Output ""
    Write-Output "Push complete. Next gate:"
    Write-Output "1. If -ConfigurePages was not used or failed, open $pagesSettingsUrl"
    Write-Output "2. Set Pages source to Deploy from a branch -> main -> /root"
    Write-Output "3. Wait for $pagesUrl, or use -WaitForPages next time"
    Write-Output "4. Run: powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public if it was not already run by -WaitForPages"
    Write-Output "5. Publish DEV article only after public preflight passes."
  }
} finally {
  Pop-Location
}
