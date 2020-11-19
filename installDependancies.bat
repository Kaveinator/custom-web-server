@echo off
cls
echo Install Dependancies?
pause
start /b cmd /c npm install colors
start /b cmd /c npm install fs
start /b cmd /c npm install glob
start /b cmd /c npm install node-html-parser
start /b cmd /c npm install body-parser