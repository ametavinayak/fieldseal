$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$pythonExe = Join-Path $projectRoot 'backend/.venv/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $pythonExe)) {
    python -m venv backend/.venv
    if ($LASTEXITCODE -ne 0) { throw 'Python environment creation failed.' }
}
& $pythonExe -m pip install -r backend/requirements-dev.txt
if ($LASTEXITCODE -ne 0) { throw 'Backend dependency installation failed.' }
Push-Location -LiteralPath (Join-Path $projectRoot 'frontend')
try {
    npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
    npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }
} finally { Pop-Location }
Write-Host 'FieldSeal: http://127.0.0.1:8778/ | Stop with Ctrl+C'
Set-Location -LiteralPath (Join-Path $projectRoot 'backend')
& $pythonExe -m uvicorn app.main:app --host 127.0.0.1 --port 8778
