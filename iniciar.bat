@echo off
REM ===========================================================================
REM  iniciar.bat — Arranca la web (portal, wiki y juego) en tu PC
REM  Requisito: Java JDK 21 o superior  (compruébalo con: java -version)
REM
REM  Uso:  doble clic   → http://localhost:8080
REM        iniciar.bat 9090  → en otro puerto
REM ===========================================================================
chcp 65001 >nul
cd /d "%~dp0"
title Umbrella Archives - servidor

set PORT=%1
if "%PORT%"=="" set PORT=8080

REM Si el puerto ya está ocupado (otro servidor abierto), se usa el de reserva (+10).
netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul
if not errorlevel 1 (
  echo El puerto %PORT% está ocupado: se usa el servidor de reserva.
  set /a PORT=%PORT%+10
)

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

echo.
echo  Abriendo http://localhost:%PORT% en el navegador...
echo  La primera vez se crea el administrador: el usuario y la contrasena
echo  aparecen abajo y se guardan en data\ADMIN_INICIAL.txt
echo  Para parar el servidor, cierra esta ventana.
echo.
start "" http://localhost:%PORT%
java -cp build es.umbrella.Servidor .
pause
