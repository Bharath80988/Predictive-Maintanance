@echo off
title Predictive Maintenance — Server Launcher
color 0A

echo.
echo  ============================================================
echo   PREDICTIVE MAINTENANCE SYSTEM — Starting All Servers...
echo  ============================================================
echo.

:: 1. Python ML Service
echo  [1/3] Starting Python ML Service (port 5000)...
start "ML Service" cmd /k "cd /d D:\predicitive\python-ml && venv\Scripts\activate && python -m uvicorn app:app --reload"
timeout /t 3 /nobreak >nul

:: 2. Spring Boot Backend
echo  [2/3] Starting Java Spring Boot Backend (port 8081)...
start "Java Backend" cmd /k "cd /d D:\predicitive\backend && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak >nul

:: 3. React Frontend
echo  [3/3] Starting React Frontend (port 5173)...
start "React Frontend" cmd /k "cd /d D:\predicitive\frontend && npm run dev"
timeout /t 4 /nobreak >nul

:: Open browser
start "" "http://localhost:5173"

echo.
echo  ============================================================
echo   All servers launched! Check the opened terminal windows.
echo.
echo   ML Service   -> http://localhost:5000
echo   Java Backend -> http://localhost:8081
echo   Dashboard    -> http://localhost:5173
echo  ============================================================
echo.
echo  Press any key to close this launcher window...
pause >nul
