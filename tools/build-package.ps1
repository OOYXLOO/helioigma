param(
  [string]$OutputPath = "helioigma-dev-package.zip"
)

$ErrorActionPreference = "Stop"

Push-Location (Join-Path $PSScriptRoot "..")
try {
  $root = (Get-Location).Path
  $destination = Join-Path $root $OutputPath
  $git = Get-Command git -ErrorAction Stop
  $trackedFiles = & $git.Source ls-files
  if ($LASTEXITCODE -ne 0) {
    throw "git ls-files failed"
  }
  if (-not $trackedFiles) {
    throw "No tracked files found for package build"
  }

  if (Test-Path -LiteralPath $destination) {
    Remove-Item -LiteralPath $destination -Force
  }

  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [System.IO.Compression.ZipFile]::Open(
    $destination,
    [System.IO.Compression.ZipArchiveMode]::Create
  )
  try {
    foreach ($relativePath in $trackedFiles) {
      if ($relativePath -eq $OutputPath) {
        continue
      }
      $source = Join-Path $root $relativePath
      if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "Tracked package file is missing: $relativePath"
      }
      $entryName = $relativePath -replace "\\", "/"
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $zip,
        $source,
        $entryName,
        [System.IO.Compression.CompressionLevel]::Optimal
      ) | Out-Null
    }
  } finally {
    $zip.Dispose()
  }

  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $destination).Hash
  $readZip = [System.IO.Compression.ZipFile]::OpenRead($destination)
  try {
    $entryCount = $readZip.Entries.Count
  } finally {
    $readZip.Dispose()
  }
  Write-Output "Built $OutputPath"
  Write-Output "Entries: $entryCount"
  Write-Output "SHA256: $hash"
} finally {
  Pop-Location
}
