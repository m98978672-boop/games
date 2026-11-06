#Requires -Version 5.1
<#
.SYNOPSIS
    Удаляет агент USB Mini-PC: задачу планировщика, ярлык и файлы.

.PARAMETER KeepLogs
    Оставить журнал agent.log.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\uninstall-agent.ps1
#>
[CmdletBinding()]
param([switch] $KeepLogs)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

$TaskName = 'USB Mini-PC Agent'
$TargetDir = Join-Path $env:LOCALAPPDATA 'usb-minipc'
$ShortcutPath = Join-Path ([Environment]::GetFolderPath('Startup')) 'USB Mini-PC Agent.lnk'

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -ne $task) {
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Задача удалена: $TaskName"
}

if (Test-Path -LiteralPath $ShortcutPath) {
    Remove-Item -LiteralPath $ShortcutPath -Force
    Write-Host "Ярлык удалён: $ShortcutPath"
}

Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*usb-minipc-agent.ps1*' } |
    ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "Остановлен процесс агента: $($_.ProcessId)"
    }

if (Test-Path -LiteralPath $TargetDir) {
    if ($KeepLogs) {
        Get-ChildItem -LiteralPath $TargetDir -File |
            Where-Object { $_.Name -ne 'agent.log' } |
            Remove-Item -Force
    } else {
        Remove-Item -LiteralPath $TargetDir -Recurse -Force
    }
    Write-Host "Файлы обработаны: $TargetDir"
}

Write-Host 'Агент удалён.'
