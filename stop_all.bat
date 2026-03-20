@echo off
echo ==========================================
echo       Stopping ESP System Services
echo ==========================================

echo Killing processes on ports 8000 (Backend), 3001 (Auth), and 5173 (Frontend)...
powershell -Command "Get-NetTCPConnection -LocalPort 8000, 3001, 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"

echo ==========================================
echo All services stopped!
echo ==========================================
timeout /t 3
