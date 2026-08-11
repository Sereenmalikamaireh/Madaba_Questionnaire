@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Checking FINAL v22 thesis questionnaire source...

if not exist "app\page.tsx" goto :fail
if not exist "app\thesis-v22\page.tsx" goto :fail
if not exist "components\ExperientialScale.tsx" goto :fail
if not exist "config\study.ts" goto :fail

findstr /C:"FINAL_V22_RUNTIME_MARKER" "app\page.tsx" >nul || goto :fail
findstr /C:"SEGMENTED_SCALE_SYSTEM_V21" "components\ExperientialScale.tsx" >nul || goto :fail
findstr /C:"OPEN1" "app\page.tsx" >nul || goto :fail
findstr /C:"participant_feedback" "lib\payload.ts" >nul || goto :fail
findstr /C:"mpa_index_questionnaire_final_v22" "config\study.ts" >nul || goto :fail
findstr /C:"thesis-v22" "RUN_FINAL_V22_WINDOWS.bat" >nul || goto :fail
findstr /C:"pagehide" "app\page.tsx" >nul || goto :fail
findstr /C:"reset-session-button" "app\page.tsx" >nul || goto :fail

echo PASS: FINAL v22 source markers verified.
exit /b 0

:fail
echo FAIL: FINAL v22 source verification failed.
exit /b 1
