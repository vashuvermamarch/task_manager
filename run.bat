@echo off
title TaskFlow Bootstrapper
echo ====================================================
echo             Starting TaskFlow Application            
echo ====================================================
echo.

echo [1/2] Launching Backend Server (port 5000)...
start "TaskFlow Backend API" cmd /k "cd server && npm run dev"

echo [2/2] Launching Frontend Client (port 5173)...
start "TaskFlow Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ====================================================
echo Both servers have been launched in separate terminals!
echo.
echo - Backend API: http://localhost:5000/health
echo - Frontend Application: http://localhost:5173
echo ====================================================
pause
