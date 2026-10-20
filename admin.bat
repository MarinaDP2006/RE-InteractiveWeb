@echo off
REM ===========================================================================
REM  admin.bat — Abre la app de administración (Umbrella Admin)
REM  Requisito: Java JDK 21 o superior.
REM  (Para crear el .exe que funciona sin Java, usa construir-admin.bat)
REM ===========================================================================
chcp 65001 >nul
cd /d "%~dp0"

where javac >nul 2>nul
if errorlevel 1 (
  echo ERROR: no se encuentra Java. Instala el JDK 21:
  echo    winget install EclipseAdoptium.Temurin.21.JDK
  pause
  exit /b 1
)

echo Compilando Umbrella Admin...
if exist build-admin rmdir /s /q build-admin
javac -encoding UTF-8 -d build-admin servidor\src\main\java\es\umbrella\*.java admin\src\main\java\es\umbrella\admin\*.java
if errorlevel 1 (
  echo ERROR: no se pudo compilar la app.
  pause
  exit /b 1
)
start "" javaw -cp build-admin es.umbrella.admin.App
