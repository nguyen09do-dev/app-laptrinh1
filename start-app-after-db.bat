@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 Starting AI Content Multi App
echo ========================================
echo.

echo [1/4] Checking PostgreSQL connection...
powershell -Command "Test-NetConnection -ComputerName localhost -Port 5432" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not running on port 5432
    echo.
    echo 📋 Please start PostgreSQL first:
    echo    1. Open Services (services.msc)
    echo    2. Start PostgreSQL service
    echo    3. Or run: pg_ctl.exe start -D "C:\Program Files\PostgreSQL\XX\data"
    echo.
    echo 📖 See DATABASE_SETUP.md for detailed instructions
    echo.
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL is running
)

echo.
echo [2/4] Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/4] Checking Backend Health...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/health' -TimeoutSec 10 -ErrorAction Stop; $json = $response.Content | ConvertFrom-Json; if ($json.status -eq 'ok' -and $json.database -eq 'connected') { Write-Host '✅ Backend ready' } else { Write-Host '⚠️ Backend responding but database issues' } } catch { Write-Host '❌ Backend not ready - check logs' }" 2>nul
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Opening browser...
start http://localhost:3000

echo.
echo ✅ Setup complete!
echo.
echo 📊 Check the two server windows for any errors
echo 🌐 Frontend should open automatically in your browser
echo 🔧 Backend health check: http://localhost:3001/health
echo.
echo 💡 If you see errors, close all windows and run again
echo.
pause

