@echo off
cd /d %~dp0
echo Starting backend server...
tsx watch src/index.ts
pause

