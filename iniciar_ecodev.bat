@echo off
title Lanzador EcoDev Platform
echo ===================================================
echo    Iniciando EcoDev Platform (Backend y Frontend)
echo ===================================================
echo.

echo [1/3] Iniciando el Backend (FastAPI + MySQL)...
cd /d C:\TFG\backend
start "EcoDev Backend" cmd /c "call venv\Scripts\activate && uvicorn main:app --reload"

echo [2/3] Iniciando el Frontend (React/Vite)...
cd /d C:\TFG\frontend
start "EcoDev Frontend" cmd /c "npm run dev"

echo [3/3] Abriendo el navegador...
:: Esperamos 3 segundos para que los servidores terminen de levantar
timeout /t 3 /nobreak > nul
start http://localhost:5173

echo.
echo ===================================================
echo  ¡Sistemas iniciados con exito! 
echo  - El Backend corre en: http://127.0.0.1:8000
echo  - El Frontend corre en: http://localhost:5173
echo ===================================================
echo.
echo Presiona cualquier tecla para cerrar este lanzador...
pause > nul