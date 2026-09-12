@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Checking FINAL v24 questionnaire source...

if not exist "app\page.tsx" goto :fail
if not exist "app\research\page.tsx" goto :fail
if not exist "app\thesis-v24\page.tsx" goto :fail
if not exist "components\ExperientialScale.tsx" goto :fail
if not exist "components\ImageFeatureTask.tsx" goto :fail
if not exist "config\study.ts" goto :fail
if not exist "FINAL_V24_EXCEL_EXPORT.sql" goto :fail

findstr /C:"FINAL_V24_RUNTIME_MARKER" "app\page.tsx" >nul || goto :fail
findstr /C:"24.0.0-final-grouped-image-clicks" "config\study.ts" >nul || goto :fail
findstr /C:"mpa_index_questionnaire_final_v24" "config\study.ts" >nul || goto :fail
findstr /C:"Neutral" "config\study.ts" >nul || goto :fail
findstr /C:"grouped-question-card" "app\page.tsx" >nul || goto :fail
findstr /C:"exactly three points" "components\ImageFeatureTask.tsx" >nul || goto :fail
findstr /C:"Download annotated PNG" "app\research\page.tsx" >nul || goto :fail
findstr /C:"TRAIL_IMAGE_FEATURES" "lib\payload.ts" >nul || goto :fail
findstr /C:"point_count: 3" "lib\payload.ts" >nul || goto :fail
findstr /C:"CTX3" "config\study.ts" >nul || goto :fail
findstr /C:"SAT3" "config\study.ts" >nul || goto :fail
findstr /C:"MEM3" "config\study.ts" >nul || goto :fail
findstr /C:"SEC3" "config\study.ts" >nul || goto :fail
findstr /C:"pagehide" "app\page.tsx" >nul || goto :fail

findstr /C:"OPEN1" "app\page.tsx" >nul && goto :fail
findstr /C:"participant_feedback" "lib\payload.ts" >nul && goto :fail
findstr /C:"TRAIL_IMAGE_DOMINANT" "lib\payload.ts" >nul && goto :fail
findstr /C:"ID1" "config\study.ts" >nul && goto :fail
findstr /C:"ID2" "config\study.ts" >nul && goto :fail

echo PASS: FINAL v24 source markers verified.
exit /b 0

:fail
echo FAIL: FINAL v24 source verification failed.
exit /b 1
