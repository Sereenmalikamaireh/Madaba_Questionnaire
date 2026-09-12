@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
set NEXT_TELEMETRY_DISABLED=1
set FINAL_PORT=4222
set FINAL_URL=http://127.0.0.1:%FINAL_PORT%/thesis-v24?build=24

echo ============================================================
echo   MPA-Index THESIS QUESTIONNAIRE - FINAL v24
echo   Grouped compact scales + 3-point route-image task
echo   Research analysis dashboard with annotated image downloads
echo   URL: %FINAL_URL%
echo ============================================================
echo.

echo [1/8] Verifying FINAL v24 source...
call VERIFY_FINAL_V24_WINDOWS.bat
if errorlevel 1 goto :badsource

echo [2/8] Checking Node.js/npm...
where node >nul 2>nul || goto :nonode
where npm >nul 2>nul || goto :nonpm

echo [3/8] Installing dependencies if needed...
if not exist ".env.local" if exist ".env.example" copy /y ".env.example" ".env.local" >nul
if not exist "node_modules" (
  call npm install
  if errorlevel 1 goto :npmfail
)

echo [4/8] Stopping anything already using port %FINAL_PORT%...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%FINAL_PORT%" ^| findstr "LISTENING"') do taskkill /PID %%P /F >nul 2>nul

echo [5/8] Removing old Next.js cache...
if exist ".next" rmdir /s /q ".next"

echo [6/8] Production build...
call npm run build
if errorlevel 1 goto :buildfail

echo [7/8] Starting FINAL v24 production server...
start "MPA-Index FINAL v24 Server" /D "%CD%" cmd /k "npm run start:final"
set /a tries=0
:waitserver
set /a tries+=1
if !tries! GTR 35 goto :serverfail
timeout /t 1 /nobreak >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-WebRequest -UseBasicParsing -Uri '%FINAL_URL%' -TimeoutSec 3; if($r.StatusCode -eq 200){ exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if errorlevel 1 goto :waitserver

echo [8/8] Verifying served FINAL v24 page...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$r=Invoke-WebRequest -UseBasicParsing -Uri '%FINAL_URL%' -TimeoutSec 5; if($r.Content -match 'THESIS QUESTIONNAIRE'){ exit 0 } else { exit 1 }" >nul 2>nul
if errorlevel 1 goto :wrongserved

echo PASS: served page is FINAL v24.
start "" "%FINAL_URL%"
echo.
echo Research dashboard: http://127.0.0.1:%FINAL_PORT%/research
echo.
pause
exit /b 0

:badsource
echo ERROR: FINAL v24 source verification failed.
goto :fail
:nonode
echo ERROR: Node.js was not found.
goto :fail
:nonpm
echo ERROR: npm was not found.
goto :fail
:npmfail
echo ERROR: npm install failed.
goto :fail
:buildfail
echo ERROR: Production build failed.
goto :fail
:serverfail
echo ERROR: FINAL v24 server did not become ready on port %FINAL_PORT%.
goto :fail
:wrongserved
echo ERROR: The served page did not pass verification.
goto :fail
:fail
echo.
echo FINAL v24 did not launch.
pause
exit /b 1
