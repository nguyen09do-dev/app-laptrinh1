# PowerShell script to run migrations
# Usage: .\run-migrations.ps1

Write-Host "🚀 Running Database Migrations..." -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ ERROR: DATABASE_URL not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set it first:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL="postgresql://postgres:PASSWORD@monorail.proxy.rlwy.net:PORT/railway"' -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ DATABASE_URL is set" -ForegroundColor Green
Write-Host ""

# Run migrations
node run-all-migrations.js

Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
