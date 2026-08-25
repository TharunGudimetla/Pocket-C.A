@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "BACKEND_LOG=%ROOT%backend-server.log"
set "FRONTEND_LOG=%ROOT%frontend-server.log"
set "BACKEND_URL=http://localhost:5000/api/health"
set "WEBSITE_URL=http://localhost:5174"
set "FRONTEND_CHECK_URL=http://127.0.0.1:5174"
set "NODE="
set "NPM="

for /f "delims=" %%I in ('where node 2^>nul') do if not defined NODE set "NODE=%%I"
for /f "delims=" %%I in ('where npm 2^>nul') do if not defined NPM set "NPM=%%I"

if not defined NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

echo Starting Pocket C.A. from:
echo %ROOT%
echo.

if not defined NODE (
  echo Node.js was not found.
  echo Please install Node.js 18 or newer, then run this file again.
  pause
  exit /b 1
)

if not exist "%BACKEND%\package.json" (
  echo Backend folder was not found: %BACKEND%
  pause
  exit /b 1
)

if not exist "%FRONTEND%\package.json" (
  echo Frontend folder was not found: %FRONTEND%
  pause
  exit /b 1
)

if not exist "%BACKEND%\node_modules" (
  if not defined NPM (
    echo Backend dependencies are missing and npm was not found.
    echo Install Node.js with npm, then run this file again.
    pause
    exit /b 1
  )
  echo Installing backend dependencies...
  pushd "%BACKEND%"
  call "%NPM%" install
  if errorlevel 1 (
    echo Backend dependency install failed.
    popd
    pause
    exit /b 1
  )
  popd
)

if not exist "%FRONTEND%\node_modules" (
  if not defined NPM (
    echo Frontend dependencies are missing and npm was not found.
    echo Install Node.js with npm, then run this file again.
    pause
    exit /b 1
  )
  echo Installing frontend dependencies...
  pushd "%FRONTEND%"
  call "%NPM%" install
  if errorlevel 1 (
    echo Frontend dependency install failed.
    popd
    pause
    exit /b 1
  )
  popd
)

echo Stopping old local servers on ports 5000 and 5174...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports=@(5000,5174); $ids=@(); foreach($port in $ports){ $ids += (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess) }; $ids | Where-Object { $_ -and $_ -ne 0 } | Select-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"

echo Building backend...
pushd "%BACKEND%"
"%NODE%" "%BACKEND%\node_modules\typescript\bin\tsc" -p "%BACKEND%\tsconfig.json"
if errorlevel 1 (
  echo Backend build failed. Check the errors above.
  popd
  pause
  exit /b 1
)
popd

echo Preparing logs...
break > "%BACKEND_LOG%"
break > "%FRONTEND_LOG%"

echo Starting backend on http://localhost:5000 ...
start "Pocket C.A. Backend" cmd /k "cd /d "%BACKEND%" && set STORAGE_DRIVER=memory&& set PORT=5000&& set CLIENT_URL=http://localhost:5174&& set AI_PROVIDER=gemini&& "%NODE%" dist/server.js >> "%BACKEND_LOG%" 2>&1"

echo Waiting for backend...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($i=1; $i -le 45; $i++){ try { $r=Invoke-WebRequest -UseBasicParsing '%BACKEND_URL%' -TimeoutSec 2; if($r.StatusCode -eq 200){ $ok=$true; break } } catch {}; Start-Sleep -Seconds 1 }; if(-not $ok){ exit 1 }"
if errorlevel 1 (
  echo Backend did not start. See:
  echo %BACKEND_LOG%
  pause
  exit /b 1
)

echo Starting frontend on http://localhost:5174 ...
start "Pocket C.A. Frontend" cmd /k "cd /d "%FRONTEND%" && set VITE_API_BASE_URL=http://localhost:5000/api&& "%NODE%" "%FRONTEND%\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5174 --strictPort >> "%FRONTEND_LOG%" 2>&1"

echo Waiting for frontend...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($i=1; $i -le 60; $i++){ try { $r=Invoke-WebRequest -UseBasicParsing '%FRONTEND_CHECK_URL%' -TimeoutSec 2; if($r.StatusCode -eq 200){ $ok=$true; break } } catch {}; Start-Sleep -Seconds 1 }; if(-not $ok){ exit 1 }"
if errorlevel 1 (
  echo Frontend did not start. See:
  echo %FRONTEND_LOG%
  pause
  exit /b 1
)

echo.
echo Website is ready:
echo %WEBSITE_URL%
echo.
echo Backend health:
echo %BACKEND_URL%
echo.
echo Logs:
echo %BACKEND_LOG%
echo %FRONTEND_LOG%
echo.
echo Opening the website...
start "" "%WEBSITE_URL%"
echo Keep the Backend and Frontend windows open while using the website.
pause
