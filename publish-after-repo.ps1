param(
  [switch]$Push
)

$ErrorActionPreference = "Stop"
$repoUrl = "https://github.com/OOYXLOO/solstice-cipher.git"
$repoPage = "https://github.com/OOYXLOO/solstice-cipher"
$repoCreateUrl = "https://github.com/new?owner=OOYXLOO&name=solstice-cipher&visibility=public"
$repoCreateCommand = 'gh repo create OOYXLOO/solstice-cipher --public --description "Helioigma: a Turing-wheel puzzle for the DEV June Solstice Game Jam" --homepage "https://ooyxloo.github.io/solstice-cipher/"'

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

Push-Location $PSScriptRoot
try {
Write-Output "Helioigma publish-after-repo helper"
  Write-Output "Repository: $repoUrl"
  Write-Output "Mode: $(if ($Push) { 'PUSH ENABLED' } else { 'dry run' })"

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

  Run "git push -u origin main"

  if (-not $Push) {
    Write-Output ""
    Write-Output "Dry run complete. Re-run with -Push after confirming the public repo exists:"
    Write-Output "powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push"
  } else {
    Write-Output ""
    Write-Output "Push complete. Next human/browser gate:"
    Write-Output "1. Open $repoPage/settings/pages"
    Write-Output "2. Set Pages source to Deploy from a branch -> main -> /root"
    Write-Output "3. Wait for https://ooyxloo.github.io/solstice-cipher/"
    Write-Output "4. Run: powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public"
    Write-Output "5. Publish DEV article only after public preflight passes."
  }
} finally {
  Pop-Location
}
