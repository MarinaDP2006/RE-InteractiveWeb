@echo off
REM ===========================================================================
REM  arrancar-web.bat — Arranca UMBRELLA ARCHIVES en tu PC
REM  Requisito: Java JDK 21 o superior (compruébalo con: java -version)
REM
REM  Uso:  doble clic          → http://localhost:8080
REM        arrancar-web.bat 9090 → en otro puerto
REM
REM  Para «Únete para ver lo oculto», pon tu id de cliente de Google en la
REM  línea GOOGLE_CLIENT_ID de abajo (lo explica el paso 10 del tutorial).
REM ===========================================================================
chcp 65001 >nul
cd /d "%~dp0"
title Umbrella Archives

set PORT=%1
if "%PORT%"=="" set PORT=8080
set GOOGLE_CLIENT_ID=

where javac >nul 2>nul
if errorlevel 1 (
  echo ERROR: no se encuentra Java. Instala el JDK 21:
  echo    winget install EclipseAdoptium.Temurin.21.JDK
  pause
  exit /b 1
)

echo Compilando el servidor...
if exist build rmdir /s /q build
javac -encoding UTF-8 -d build servidor\src\main\java\es\umbrella\*.java
if errorlevel 1 (
  echo ERROR: no se pudo compilar el servidor.
  pause
  exit /b 1
)

start "" http://localhost:%PORT%
java -cp build es.umbrella.Servidor .
pause
