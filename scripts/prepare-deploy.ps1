# Prepare Cosmatics ERP backend and frontend artifacts for upload to AAPanel
# Run this on Windows before uploading to the server.

param(
    [string]$ApiUrl = "https://your-api-domain.com",
    [string]$OutputDir = "../deploy"
)

$ErrorActionPreference = "Stop"
$ProjectDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$BackendDir = Join-Path $ProjectDir "packages\backend"
$FrontendDir = Join-Path $ProjectDir "packages\frontend"
$DeployDir = Join-Path $ProjectDir $OutputDir

Write-Host "==> Project directory: $ProjectDir"
Write-Host "==> Install dependencies"
Set-Location $ProjectDir
pnpm install --no-frozen-lockfile

Write-Host "==> Generate Prisma client"
pnpm --filter backend db:generate

Write-Host "==> Build backend"
pnpm --filter backend build

Write-Host "==> Build frontend (static export)"
$env:NEXT_PUBLIC_API_URL = $ApiUrl
Set-Location $FrontendDir
pnpm build:static

Write-Host "==> Prepare deploy artifacts"
if (Test-Path $DeployDir) { Remove-Item $DeployDir -Recurse -Force }
New-Item -ItemType Directory -Path $DeployDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "backend") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "frontend") | Out-Null

# Backend: copy everything needed to run on server (excluding node_modules and source)
$BackendDeploy = Join-Path $DeployDir "backend"
Copy-Item (Join-Path $BackendDir "dist") $BackendDeploy -Recurse -Force
Copy-Item (Join-Path $BackendDir "prisma") $BackendDeploy -Recurse -Force
Copy-Item (Join-Path $BackendDir ".env.example") $BackendDeploy -Force
Copy-Item (Join-Path $BackendDir "package.json") $BackendDeploy -Force

# Frontend: copy static export
$FrontendDeploy = Join-Path $DeployDir "frontend"
Copy-Item (Join-Path $FrontendDir "dist\*") $FrontendDeploy -Recurse -Force

Write-Host "==> Artifacts ready in $DeployDir"
Write-Host "Next: upload $BackendDeploy to your AAPanel backend site and $FrontendDeploy to the frontend site root."
