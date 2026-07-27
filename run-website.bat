@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "URL=http://localhost:5174"

echo Starting Pocket C.A. website...
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js 18 or newer, then run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please reinstall Node.js, then run this file again.
  pause
  exit /b 1
)

if not exist "%BACKEND%\node_modules" (
  echo Installing backend dependencies...
  pushd "%BACKEND%"
  call npm install
  if errorlevel 1 (
    echo Backend dependency install failed.
    popd
    pause
    exit /b 1
  )
  popd
)

if not exist "%FRONTEND%\node_modules" (
  echo Installing frontend dependencies...
  pushd "%FRONTEND%"
  call npm install
  if errorlevel 1 (
    echo Frontend dependency install failed.
    popd
    pause
    exit /b 1
  )
  popd
)

start "Pocket C.A. Backend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%BACKEND%'; $env:STORAGE_DRIVER='memory'; $env:PORT='5000'; $env:CLIENT_URL='http://localhost:5174'; if (-not $env:AI_PROVIDER) { $env:AI_PROVIDER='gemini' }; npm run dev"
start "Pocket C.A. Frontend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%FRONTEND%'; $env:VITE_API_BASE_URL='http://localhost:5000/api'; npm run dev -- --host 127.0.0.1 --port 5174 --strictPort"

echo.
echo Backend:  http://localhost:5000
echo Website:  %URL%
echo.
echo Opening the website in your browser...
timeout /t 5 /nobreak >nul
start "" "%URL%"

echo.
echo Done. Keep the two server windows open while using the website.
pause
