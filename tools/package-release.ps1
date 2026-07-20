param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string]$Version
)

$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath((Get-Location).Path)
$tempRoot = [IO.Path]::GetFullPath($env:TEMP)
$stage = [IO.Path]::GetFullPath((Join-Path $tempRoot "darkis-godforge-v$Version-stage"))
$packageRoot = Join-Path $stage 'darkis-godforge'
$dist = Join-Path $workspace 'dist'
$archive = Join-Path $dist "darkis-godforge-v$Version.zip"

if (-not $stage.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Unsafe staging path: $stage"
}

if (Test-Path -LiteralPath $stage) {
    Remove-Item -LiteralPath $stage -Recurse -Force
}

New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null
New-Item -ItemType Directory -Path $dist -Force | Out-Null
Copy-Item -LiteralPath 'module.json', 'README.md' -Destination $packageRoot

foreach ($folder in @('assets', 'lang', 'styles', 'templates')) {
    Copy-Item -LiteralPath $folder -Destination $packageRoot -Recurse
}

$scriptTarget = Join-Path $packageRoot 'scripts'
New-Item -ItemType Directory -Path $scriptTarget -Force | Out-Null
Copy-Item -LiteralPath 'scripts\main.js' -Destination $scriptTarget

if (Test-Path -LiteralPath $archive) {
    Remove-Item -LiteralPath $archive -Force
}

Compress-Archive -Path (Join-Path $packageRoot '*') -DestinationPath $archive -CompressionLevel Optimal

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($archive)
try {
    $entries = @($zip.Entries | ForEach-Object { $_.FullName.Replace('\', '/') })
    $forbidden = @($entries | Where-Object {
        ($_ -match '(^|/)(KI|tests|node_modules)/') -or
        ($_ -match '\.ts$') -or
        (($_ -match '\.md$') -and ($_ -ne 'README.md'))
    })
    if ($forbidden.Count -gt 0) {
        throw "Forbidden release entries: $($forbidden -join ', ')"
    }
    foreach ($required in @('module.json', 'scripts/main.js', 'assets/banner.png', 'assets/logo.png')) {
        if ($entries -notcontains $required) {
            throw "Required runtime file is missing: $required"
        }
    }
}
finally {
    $zip.Dispose()
}

$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $archive
[pscustomobject]@{
    Archive = $archive
    Size = (Get-Item -LiteralPath $archive).Length
    SHA256 = $hash.Hash
}
