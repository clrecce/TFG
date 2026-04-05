@echo off
title Lanzador EcoDev Platform
echo ===================================================
echo    Iniciando EcoDev Platform (IA, Backend y Frontend)
echo ===================================================
echo.

echo [1/4] Iniciando Motor de IA Local (Ollama)...
:: Inicia el servidor de Ollama de forma silenciosa en una nueva ventana
start "Ollama Server" cmd /c "ollama serve"
:: Le damos 3 segundos a la IA para que cargue en la memoria RAM
timeout /t 3 /nobreak > nul

echo [2/4] Iniciando el Backend (FastAPI + MySQL)...
cd /d C:\TFG\backend
start "EcoDev Backend" cmd /c "call venv\Scripts\activate && uvicorn main:app --reload"

echo [3/4] Iniciando el Frontend (React/Vite)...
cd /d C:\TFG\frontend
start "EcoDev Frontend" cmd /c "npm run dev"

echo [4/4] Abriendo el navegador...
:: Esperamos 4 segundos para que los servidores terminen de levantar
timeout /t 4 /nobreak > nul
start http://localhost:5173

echo.
echo ===================================================
echo  ¡Sistemas iniciados con exito! 
echo  - Motor IA: Ollama (Puerto 11434)
echo  - Backend: FastAPI (Puerto 8000)
echo  - Frontend: React (Puerto 5173)
echo ===================================================
echo.
echo Presiona cualquier tecla para cerrar este lanzador...
pause > nul