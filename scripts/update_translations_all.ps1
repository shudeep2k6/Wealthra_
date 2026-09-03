$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$transDir = Join-Path (Split-Path -Parent $scriptPath) "src\data\translations"

# Read the translations from update_translations_all.js by extracting the JSON
# Or perform it directly with PowerShell
$enJson = Get-Content (Join-Path $transDir "en.json") -Raw | ConvertFrom-Json
$hiJson = Get-Content (Join-Path $transDir "hi.json") -Raw | ConvertFrom-Json
$bnJson = Get-Content (Join-Path $transDir "bn.json") -Raw | ConvertFrom-Json
$teJson = Get-Content (Join-Path $transDir "te.json") -Raw | ConvertFrom-Json
$taJson = Get-Content (Join-Path $transDir "ta.json") -Raw | ConvertFrom-Json

Write-Output "Successfully loaded all 5 JSON datasets into memory."
