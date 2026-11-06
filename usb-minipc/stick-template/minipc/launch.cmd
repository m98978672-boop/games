@echo off
chcp 65001 >nul
setlocal EnableExtensions
if "%MINIPC_NAME%"=="" set "MINIPC_NAME=USB Mini-PC"
if "%MINIPC_ROOT%"=="" set "MINIPC_ROOT=%~dp0.."
title %MINIPC_NAME% — мини-ПК на флешке

:menu
cls
echo ============================================================
echo   %MINIPC_NAME%
echo   корень: %MINIPC_ROOT%
echo   агент:  %MINIPC_AGENT%
echo ------------------------------------------------------------
echo   Этот текст печатает не «компьютер внутри флешки»,
echo   а маленький лаунчер, который агент на ПК запустил
echo   в момент подключения накопителя.
echo ============================================================
echo.
echo   [1] Сведения об устройстве и о хосте
echo   [2] Открыть папку флешки в проводнике
echo   [3] Открыть папку приложений
echo   [0] Выход
echo.
choice /c 1230 /n /m "  Выбор: "
if errorlevel 4 goto end
if errorlevel 3 goto apps
if errorlevel 2 goto explorer
if errorlevel 1 goto info
goto menu

:info
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apps\boot-info.ps1"
echo.
pause
goto menu

:explorer
start "" explorer "%MINIPC_ROOT%"
goto menu

:apps
start "" explorer "%~dp0apps"
goto menu

:end
endlocal
exit /b 0
