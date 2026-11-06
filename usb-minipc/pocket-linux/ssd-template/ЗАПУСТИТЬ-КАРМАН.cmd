@echo off
chcp 65001 >nul
setlocal EnableExtensions
title KARMAN — карманная Linux-среда (запуск с USB SSD)

rem ===========================================================================
rem  ЭТО ЕДИНСТВЕННЫЙ ФАЙЛ, КОТОРЫЙ НУЖНО ЗАПУСКАТЬ НА ЭТОМ НАКОПИТЕЛЕ.
rem
rem  Он ничего не устанавливает в Windows: только вызывает лаунчер
rem  karman\launcher\karman-launcher.ps1, который проверит накопитель
rem  и запустит Linux-среду в виртуальной машине QEMU.
rem
rem  Параметры (необязательно):  -Action verify|start|checkpoint|eject|restore|reset
rem  Права администратора не нужны. Автозапуск не настраивается.
rem ===========================================================================

set "KARMAN_ROOT=%~dp0"
set "LAUNCHER=%KARMAN_ROOT%karman\launcher\karman-launcher.ps1"

echo.
echo   KARMAN · карманная Linux-среда
echo   накопитель: %KARMAN_ROOT%
echo   ------------------------------------------------

if not exist "%LAUNCHER%" goto missing_launcher

where powershell >nul 2>nul
if errorlevel 1 goto missing_powershell

powershell -NoProfile -ExecutionPolicy Bypass -File "%LAUNCHER%" %*
set "RC=%ERRORLEVEL%"

if not "%RC%"=="0" (
    echo.
    echo   Лаунчер завершился с кодом %RC%.
    echo   Подробности — в karman\logs и в README раздела pocket-linux.
    pause
)

endlocal & exit /b %RC%

:missing_launcher
echo.
echo   ОШИБКА: не найден лаунчер
echo   %LAUNCHER%
echo.
echo   Скорее всего накопитель подготовлен не полностью.
echo   Разложи шаблон заново: tools/prepare_ssd.py ^<буква диска^>:
pause
endlocal & exit /b 2

:missing_powershell
echo.
echo   ОШИБКА: в системе нет powershell.exe
echo   Нужна Windows 10/11. На Linux запускай ЗАПУСТИТЬ-КАРМАН.sh
pause
endlocal & exit /b 3
