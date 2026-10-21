@echo off
REM ===========================================================================
REM  construir-admin.bat — Crea Umbrella Admin como programa de Windows (.exe)
REM ===========================================================================
REM  Resultado:
REM    dist\UmbrellaAdmin\UmbrellaAdmin.exe   (lleva Java dentro: no hace falta
REM                                           instalar nada para usarlo)
REM    dist\UmbrellaAdmin-windows.zip         (para copiarlo a otro PC)
REM  Requisito SOLO para construirlo: Java JDK 21 (trae jpackage).
REM  Normalmente no hace falta: GitHub lo construye solo y lo publica en
REM  "Releases" cada vez que subes cambios (ver .github/workflows).
REM ===========================================================================
chcp 65001 >nul
cd /d "%~dp0"
setlocal

set VERSION=1.0.0
set MODULOS=java.base,java.desktop,java.management,java.net.http,java.sql,java.naming,jdk.httpserver,jdk.crypto.ec,jdk.charsets,jdk.localedata,jdk.unsupported,jdk.accessibility

where jpackage >nul 2>nul
if errorlevel 1 (
  echo ERROR: no se encuentra jpackage. Instala el JDK 21:
  echo    winget install EclipseAdoptium.Temurin.21.JDK
  pause
  exit /b 1
)

echo [1/5] Compilando...
if exist build-admin rmdir /s /q build-admin
javac -encoding UTF-8 -d build-admin servidor\src\main\java\es\umbrella\*.java admin\src\main\java\es\umbrella\admin\*.java
if errorlevel 1 goto error

echo [2/5] Creando el icono...
java -cp build-admin es.umbrella.admin.GenerarIcono admin\umbrella.ico
if errorlevel 1 goto error

echo [3/5] Empaquetando el .jar con la web y la semilla...
if exist dist rmdir /s /q dist
mkdir dist\entrada
jar --create --file dist\entrada\UmbrellaAdmin.jar --main-class es.umbrella.admin.App -C build-admin .
if errorlevel 1 goto error
xcopy /e /i /q web dist\entrada\web >nul
xcopy /e /i /q semilla dist\entrada\semilla >nul

echo [4/5] Creando UmbrellaAdmin.exe con Java incluido (tarda un minuto)...
jpackage --type app-image --name UmbrellaAdmin --app-version %VERSION% --vendor "Umbrella Archives" ^
  --description "Administración de la Wiki de Umbrella Archives" ^
  --input dist\entrada --main-jar UmbrellaAdmin.jar --main-class es.umbrella.admin.App ^
  --icon admin\umbrella.ico --add-modules %MODULOS% --java-options "-Dfile.encoding=UTF-8" ^
  --dest dist
if errorlevel 1 goto error

echo [5/5] Comprimiendo en dist\UmbrellaAdmin-windows.zip...
powershell -NoProfile -Command "Compress-Archive -Path 'dist\UmbrellaAdmin' -DestinationPath 'dist\UmbrellaAdmin-windows.zip' -Force"
rmdir /s /q dist\entrada

echo.
echo  LISTO: dist\UmbrellaAdmin\UmbrellaAdmin.exe
echo         dist\UmbrellaAdmin-windows.zip
echo.
pause
exit /b 0

:error
echo.
echo ERROR: no se pudo construir la app.
pause
exit /b 1
