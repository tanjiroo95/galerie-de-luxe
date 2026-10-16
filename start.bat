@echo off
cd /d "%~dp0"
title Galerie de Luxe - serveur
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3000/admin.html"
node server.js
pause
