@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 Starting AI Content Multi App
echo ========================================
echo.

echo [1/3] Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Servers are starting...
echo.
echo 📝 Check the two new windows for server logs
echo 🌐 Frontend will be available at: http://localhost:3000
echo 🔧 Backend will be available at: http://localhost:3001
echo.
echo ⏳ Waiting 15 seconds for servers to fully start...
timeout /t 15 /nobreak >nul

echo.
echo 🌐 Opening browser...
start http://localhost:3000

echo.
echo ✅ Done! App should be opening in your browser now.
echo.
echo 💡 Tips:
echo    - If you see errors, check the two server windows
echo    - Backend must show: "✅ Database connected successfully"
echo    - Frontend must show: "ready started server on 0.0.0.0:3000"
echo.
pause

