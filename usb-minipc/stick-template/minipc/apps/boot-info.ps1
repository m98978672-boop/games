# Сведения о «мини-ПК» на флешке.
# Скрипт выполняется на хосте, но считает себя устройством с флешки:
# всё, что он знает о себе, приходит из переменных окружения агента.

$ErrorActionPreference = 'Stop'
$root = if ($env:MINIPC_ROOT) { $env:MINIPC_ROOT } else { Split-Path -Parent (Split-Path -Parent $PSScriptRoot) }
$name = if ($env:MINIPC_NAME) { $env:MINIPC_NAME } else { 'USB Mini-PC' }

Write-Host ''
Write-Host "Устройство : $name"
Write-Host "Корень     : $root"
Write-Host "Агент      : $($env:MINIPC_AGENT)"

try {
    $drive = New-Object System.IO.DriveInfo(([System.IO.Path]::GetPathRoot($root)))
    $freeGb = [math]::Round($drive.AvailableFreeSpace / 1GB, 2)
    $totalGb = [math]::Round($drive.TotalSize / 1GB, 2)
    Write-Host ("Носитель   : {0} ({1} свободно из {2} ГБ)" -f $drive.Name, $freeGb, $totalGb)
} catch {
    Write-Host "Носитель   : сведения недоступны"
}

try {
    $os = Get-CimInstance Win32_OperatingSystem
    Write-Host ("Хост       : {0} / {1}" -f $env:COMPUTERNAME, $os.Caption)
    Write-Host ("Память     : {0} ГБ" -f [math]::Round($os.TotalVisibleMemorySize / 1MB, 1))
} catch {
    Write-Host "Хост       : сведения недоступны"
}

$apps = Join-Path $root 'minipc\apps'
if (Test-Path -LiteralPath $apps) {
    Write-Host ''
    Write-Host 'Приложения на флешке:'
    Get-ChildItem -LiteralPath $apps -File | ForEach-Object { Write-Host ("  - {0}" -f $_.Name) }
}

$logLine = '{0}	{1}	{2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $name, $env:COMPUTERNAME
try { Add-Content -LiteralPath (Join-Path $root 'minipc\usage.log') -Value $logLine -Encoding UTF8 } catch { }
