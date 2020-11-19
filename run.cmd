@echo off
title [Port 85] HTTP Server
echo [Batch] Starting Server...
:Program
pause
node Program.js || echo [Batch] Restarting Server! && goto Program
echo [Batch] Server Stopped!
pause