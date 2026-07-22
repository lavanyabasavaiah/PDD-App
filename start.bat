@echo off
title VitalTrack Starter
echo ===================================================
echo   VitalTrack - AI Smart Health Tracker Starter
echo ===================================================
echo.
echo Starting MongoDB local check...
echo (Ensure MongoDB is running on port 27017)
echo.
echo Starting Backend Express API Server...
start "VitalTrack Backend" cmd /k "cd server && node server.js"
echo.
echo Starting Frontend Vite React Dev Server...
start "VitalTrack Frontend" cmd /k "cd client && npm run dev"
echo.
echo ===================================================
echo   Running! Open your browser to http://localhost:5173
echo ===================================================
pause
