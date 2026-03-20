@echo off
echo ==========================================
echo       Starting ESP System Services
echo ==========================================

echo [1/3] Starting Python Backend...
start /B backend\venv\Scripts\python.exe start_backend_detached.py
echo Backend starting in background (logs in backend/backend_log.txt)...

echo [2/3] Starting Node.js Auth Server...
start "ESP Auth Server" /MIN cmd /k "node server.js"
echo Auth Server started on port 3001...

echo [3/3] Starting Vite Frontend...
start "ESP Frontend" cmd /k "npm run dev"
echo Frontend starting on port 5173...

echo ==========================================
echo All services launched!
echo ==========================================
timeout /t 5
