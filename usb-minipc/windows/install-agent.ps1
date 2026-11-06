#Requires -Version 5.1
<#
.SYNOPSIS
    Ставит агент USB Mini-PC в автозапуск текущего пользователя.

.DESCRIPTION
    Копирует usb-minipc-agent.ps1 в %LOCALAPPDATA%\usb-minipc и регистрирует
    задачу планировщика «USB Mini-PC Agent» (триггер — вход в систему).
    Если зарегистрировать задачу не удалось, создаёт ярлык в папке «Автозагрузка».

    Права администратора не нужны: всё делается в профиле текущего пользователя.

.PARAMETER StartupFolder
    Сразу использовать папку «Автозагрузка» вместо планировщика задач.

.PARAMETER IntervalSeconds
    Интервал опроса для установленного агента.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\install-agent.ps1
#>
[CmdletBinding()]
param(
    [switch] $StartupFolder,
    [double] $IntervalSeconds = 2
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$TaskName = 'USB Mini-PC Agent'
$TargetDir = Join-Path $env:LOCALAPPDATA 'usb-minipc'
$TargetScript = Join-Path $TargetDir 'usb-minipc-agent.ps1'
$SourceScript = Join-Path $PSScriptRoot 'usb-minipc-agent.ps1'
$StartupDir = [Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $StartupDir 'USB Mini-PC Agent.lnk'

if (-not (Test-Path -LiteralPath $SourceScript)) {
    throw "Не найден $SourceScript — запусти скрипт из папки windows\ репозитория."
}

New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
Copy-Item -LiteralPath $SourceScript -Destination $TargetScript -Force
Write-Host "Агент скопирован: $TargetScript"

$quoted = '"{0}"' -f $TargetScript
$arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File $quoted -IntervalSeconds $IntervalSeconds"

function New-AgentShortcut {
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($ShortcutPath)
    $shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $shortcut.Arguments = $arguments
    $shortcut.WorkingDirectory = $TargetDir
    $shortcut.WindowStyle = 7   # свёрнутое окно
    $shortcut.Description = 'Следит за подключением флешек USB Mini-PC'
    $shortcut.Save()
    Write-Host "Ярлык в автозагрузке: $ShortcutPath"
}

if ($StartupFolder) {
    New-AgentShortcut
} else {
    try {
        $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $arguments -WorkingDirectory $TargetDir
        $trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
        $settings = New-ScheduledTaskSettingsSet `
            -AllowStartIfOnBatteries `
            -DontStopIfGoingOnBatteries `
            -StartWhenAvailable `
            -MultipleInstances IgnoreNew `
            -ExecutionTimeLimit ([TimeSpan]::Zero) `
            -RestartCount 3 `
            -RestartInterval (New-TimeSpan -Minutes 1)
        Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
            -Settings $settings -Description 'USB Mini-PC: запуск лаунчера с флешки при подключении' `
            -Force | Out-Null
        Start-ScheduledTask -TaskName $TaskName
        Write-Host "Задача планировщика зарегистрирована и запущена: $TaskName"
    } catch {
        Write-Warning "Планировщик недоступен ($($_.Exception.Message)). Использую папку «Автозагрузка»."
        New-AgentShortcut
    }
}

Write-Host ''
Write-Host 'Готово. Проверка:'
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$TargetScript`" -Once -DryRun"
Write-Host "Журнал: $(Join-Path $TargetDir 'agent.log')"
Write-Host 'Удалить: .\uninstall-agent.ps1'
