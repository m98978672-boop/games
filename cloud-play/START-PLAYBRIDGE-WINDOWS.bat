@echo off
setlocal
cd /d "%~dp0"
if defined NODE_OPTIONS (
  set "NODE_OPTIONS=%NODE_OPTIONS% --use-system-ca"
) else (
  set "NODE_OPTIONS=--use-system-ca"
)
if exist "%~dp0runtime\node.exe" (
  set "PLAYBRIDGE_NODE=%~dp0runtime\node.exe"
) else (
  set "PLAYBRIDGE_NODE=node"
)
"%PLAYBRIDGE_NODE%" "%~dp0portable-launcher.mjs"
if errorlevel 1 (
  echo.
  echo PLAYBRIDGE failed to start. See the message above.
  pause
)
