@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call VERIFY_FINAL_V23_WINDOWS.bat
if errorlevel 1 goto :fail
where node >nul 2>nul || goto :fail
where npm >nul 2>nul || goto :fail
if not exist "node_modules" (
  call npm install
  if errorlevel 1 goto :fail
)
if exist ".next" rmdir /s /q ".next"
call npm run build
if errorlevel 1 goto :fail
echo BUILD CHECK PASSED - FINAL v23
pause
exit /b 0
:fail
echo BUILD CHECK FAILED - FINAL v23
pause
exit /b 1
