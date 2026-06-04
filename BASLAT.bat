@echo off
echo ====================================================
echo   "KAMPUS KAYIP & BULUNAN ESYA PORTALI ATESLENIYOR"   
echo ====================================================

:: 1. Backend sunucusunu bağımsız ayrı bir pencerede başlatır
echo [1/2] Node.js Express Backend sunucusu baslatiliyor...
start "Express Backend" cmd /k "cd backend && npm install && npm start"

:: 2. Frontend katmanını ana pencerede derleyip tarayıcıyı tetikler
echo [2/2] React Frontend uygulamasi derleniyor...
cd frontend && npm install && npm start

pause