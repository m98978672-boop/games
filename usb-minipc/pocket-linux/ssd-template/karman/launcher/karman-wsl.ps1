#Requires -Version 5.1
<#
.SYNOPSIS
    «Карман» (KARMAN): движок WSL2 — второй способ запустить Linux-среду с USB SSD.

.DESCRIPTION
    Это отдельная программа-помощник рядом с основным лаунчером. Она нужна там,
    где WSL2 уже включён: скорость почти нативная, а файлы накопителя видны
    из Linux напрямую через /mnt/<буква>/data — без FAT-прослойки.

    Важно, чем этот режим отличается от QEMU:
      * WSL2 — компонент Windows. Его включает пользователь, один раз и с правами
        администратора; здесь ничего не устанавливается автоматически;
      * дистрибутив импортируется из karman/system/rootfs.tar в каталог на SSD,
        и живёт как ext4.vhdx. Каталог лучше держать на NTFS: exFAT не подходит;
      * контрольная точка = экспорт дистрибутива (долго и много места);
      * всё остальное так же: один кликабельный файл, журнал, блокировка сессии.

.PARAMETER Action
    verify | start | checkpoint | restore | reset | menu

.PARAMETER Force
    Подтверждение разрушительных действий: reset (удалить дистрибутив) и
    restore (пересоздать его из контрольной точки).

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File karman-wsl.ps1 -Action verify
#>
[CmdletBinding()]
param(
    [ValidateSet('menu', 'verify', 'start', 'checkpoint', 'restore', 'reset')]
    [string] $Action = 'menu',
    [string] $Root = '',
    [string] $Distro = '',
    [string] $RestorePoint = '',
    [switch] $DryRun,
    [switch] $Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:Version = '1.0.0'
$script:LauncherDir = $PSScriptRoot
$script:KarmanDir = Split-Path -Parent $script:LauncherDir
$script:Root = if ($Root) { $Root } else { Split-Path -Parent $script:KarmanDir }
$script:ManifestPath = Join-Path $script:KarmanDir 'manifest.json'
$script:LogFile = $null
$script:ExitCode = 0

function Get-Prop {
    param($Object, [string] $Name, $Default = $null)
    if ($null -eq $Object) { return $Default }
    $property = $Object.PSObject.Properties[$Name]
    if ($null -eq $property -or $null -eq $property.Value) { return $Default }
    return $property.Value
}

function Write-Log {
    param(
        [Parameter(Mandatory)][string] $Message,
        [ValidateSet('INFO', 'OK', 'WARN', 'ERROR')][string] $Level = 'INFO'
    )
    $color = switch ($Level) {
        'OK' { 'Green' }
        'WARN' { 'Yellow' }
        'ERROR' { 'Red' }
        default { 'Gray' }
    }
    Write-Host ("  [{0,-5}] {1}" -f $Level, $Message) -ForegroundColor $color
    if ($script:LogFile) {
        try {
            Add-Content -LiteralPath $script:LogFile -Encoding UTF8 `
                -Value ("{0} {1,-5} {2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message)
        } catch { }
    }
}

function Initialize-Log {
    $logs = Join-Path $script:KarmanDir 'logs'
    try {
        if (-not (Test-Path -LiteralPath $logs)) { New-Item -ItemType Directory -Path $logs -Force | Out-Null }
        $script:LogFile = Join-Path $logs ("session-wsl-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
    } catch { $script:LogFile = $null }
}

function Read-Manifest {
    if (-not [System.IO.File]::Exists($script:ManifestPath)) {
        throw 'не найден karman\manifest.json — накопитель не подготовлен'
    }
    $raw = [System.IO.File]::ReadAllText($script:ManifestPath, [System.Text.Encoding]::UTF8)
    $manifest = $raw | ConvertFrom-Json
    if ([int](Get-Prop $manifest 'layout' 0) -ne 1) {
        throw 'версия раскладки не поддерживается этим лаунчером (ожидается 1)'
    }
    return $manifest
}

function Resolve-InsideRoot {
    param([Parameter(Mandatory)][string] $Relative)
    $rootFull = [System.IO.Path]::GetFullPath($script:Root)
    if (-not $rootFull.EndsWith('\')) { $rootFull += '\' }
    $target = [System.IO.Path]::GetFullPath((Join-Path $rootFull $Relative))
    if (-not $target.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw ('путь «{0}» выходит за пределы накопителя' -f $Relative)
    }
    return $target
}

function Test-WslAvailable {
    return [bool](Get-Command -Name 'wsl.exe' -ErrorAction SilentlyContinue)
}

function Test-WslDistro {
    param([string] $Name)
    if (-not (Test-WslAvailable)) { return $false }
    try {
        $output = (& wsl.exe --list --quiet 2>$null) -join "`n"
        $output = $output -replace "`0", ''
        return [bool]($output -match ('(?m)^\s*' + [regex]::Escape($Name) + '\s*$'))
    } catch {
        return $false
    }
}

function Get-SystemConfig {
    param($Manifest, [string] $DistroOverride)
    $engine = Get-Prop $Manifest 'engine'
    $wsl = Get-Prop $engine 'wsl'
    $rootfsRel = [string](Get-Prop $wsl 'rootfs' (Get-Prop (Get-Prop $Manifest 'system') 'rootfs' 'karman/system/rootfs.tar'))
    return [pscustomobject]@{
        Distro     = if ($DistroOverride) { $DistroOverride } else { [string](Get-Prop $wsl 'distro' 'Karman') }
        InstallDir = Resolve-InsideRoot ([string](Get-Prop $wsl 'install_dir' 'karman/wsl'))
        Rootfs     = Resolve-InsideRoot $rootfsRel
        Lock       = Join-Path $script:KarmanDir 'state\session.lock'
        Checkpoints = Resolve-InsideRoot ([string](Get-Prop (Get-Prop $Manifest 'checkpoints') 'dir' 'karman/checkpoints'))
        DataDir    = Resolve-InsideRoot ([string](Get-Prop (Get-Prop $Manifest 'data') 'dir' 'data'))
        ExpectedSha = [string](Get-Prop (Get-Prop $Manifest 'system') 'rootfs_sha256' '')
        Verify     = [string](Get-Prop $Manifest 'verify' 'sha256')
    }
}

function Get-FreeGb {
    try {
        $drive = New-Object System.IO.DriveInfo([System.IO.Path]::GetPathRoot($script:Root))
        return [math]::Round($drive.AvailableFreeSpace / 1GB, 2)
    } catch { return -1 }
}

function Test-Preflight {
    param($Config)

    $issues = New-Object System.Collections.Generic.List[string]
    $warnings = New-Object System.Collections.Generic.List[string]

    if (-not (Test-WslAvailable)) {
        $issues.Add('не найден wsl.exe: нужна Windows 10 2004+ / Windows 11 с компонентом WSL. Его включает пользователь вручную (права администратора + перезагрузка), автоматически ничего не устанавливается.')
    }

    $registered = Test-WslDistro -Name $Config.Distro
    if ($registered) {
        Write-Log -Level OK -Message ("дистрибутив WSL уже зарегистрирован: {0}" -f $Config.Distro)
    } else {
        Write-Log -Level INFO -Message ("дистрибутив {0} ещё не импортирован — будет создан из rootfs.tar" -f $Config.Distro)
        if (-not [System.IO.File]::Exists($Config.Rootfs)) {
            $issues.Add(("нет rootfs.tar для первого импорта: {0}. Положи архив rootfs и запусти prepare_ssd.py --rehash." -f $Config.Rootfs))
        } elseif ($Config.Verify -eq 'sha256' -and $Config.ExpectedSha) {
            $hash = (Get-FileHash -LiteralPath $Config.Rootfs -Algorithm SHA256).Hash.ToLowerInvariant()
            if ($hash -ne $Config.ExpectedSha) {
                $issues.Add(("sha256 rootfs.tar не совпадает с манифестом (получен {0}…). Импорт отменён." -f $hash.Substring(0, 12)))
            }
        }
    }

    try {
        $letter = [System.IO.Path]::GetPathRoot($script:Root).TrimEnd('\')
        $volume = Get-CimInstance Win32_LogicalDisk -Filter ("DeviceID='{0}'" -f $letter) -ErrorAction Stop
        if ($volume.FileSystem -and $volume.FileSystem -ne 'NTFS') {
            $warnings.Add(("файловая система {0}:{1} — WSL2 хранит дистрибутив в ext4.vhdx и на exFAT это не поддерживается. Для WSL-режима лучше NTFS; иначе используй движок QEMU." -f $letter, $volume.FileSystem))
        }
    } catch { }

    $freeGb = Get-FreeGb
    if ($freeGb -ge 0 -and $freeGb -lt 8) {
        $issues.Add(("свободно {0} ГБ: дистрибутиву и контрольной точке нужно больше места." -f $freeGb))
    }

    if ([System.IO.File]::Exists($Config.Lock)) {
        $warnings.Add('есть session.lock: прошлая сессия завершилась нештатно. Изменения после последней контрольной точки могли потеряться.')
    }

    return [pscustomobject]@{
        Ok         = ($issues.Count -eq 0)
        Issues     = $issues
        Warnings   = $warnings
        Registered = $registered
        FreeGb     = $freeGb
    }
}

function Show-Preflight {
    param($Report)
    foreach ($issue in $Report.Issues) { Write-Log -Level ERROR -Message $issue }
    foreach ($warning in $Report.Warnings) { Write-Log -Level WARN -Message $warning }
    if ($Report.Ok) { Write-Log -Level OK -Message ("проверки пройдены, свободно {0} ГБ" -f $Report.FreeGb) }
    Write-Log -Level WARN -Message 'напоминание: шифрования нет — любой, кто подключит накопитель, прочитает его содержимое.'
}

function Import-Distro {
    param($Config, [string] $From = '')
    $source = if ($From) { $From } else { $Config.Rootfs }
    if ($DryRun) {
        Write-Log -Level INFO -Message ("DRY-RUN: wsl --import {0} {1} {2} --version 2" -f $Config.Distro, $Config.InstallDir, $source)
        return
    }
    if (-not (Test-Path -LiteralPath $Config.InstallDir)) {
        New-Item -ItemType Directory -Path $Config.InstallDir -Force | Out-Null
    }
    Write-Log -Level INFO -Message ("импорт дистрибутива {0} → {1} (может занять несколько минут)" -f $Config.Distro, $Config.InstallDir)
    & wsl.exe --import $Config.Distro $Config.InstallDir $source --version 2
    if ($LASTEXITCODE -ne 0) {
        throw ("wsl --import завершился с кодом {0}. Частые причины: exFAT, нет места, WSL не включён." -f $LASTEXITCODE)
    }
    Write-Log -Level OK -Message 'дистрибутив импортирован'
}

function Start-Session {
    param($Config, $Report)

    if (-not $Report.Registered) { Import-Distro -Config $Config }
    if ($DryRun) {
        Write-Log -Level INFO -Message ("DRY-RUN: wsl.exe -d {0} (интерактивная сессия)" -f $Config.Distro)
        return $true
    }

    $lock = [pscustomobject]@{
        started  = (Get-Date).ToString('o')
        host     = $env:COMPUTERNAME
        user     = $env:USERNAME
        engine   = 'wsl'
        distro   = $Config.Distro
        launcher = $script:Version
    }
    $lockDir = Split-Path -Parent $Config.Lock
    if (-not (Test-Path -LiteralPath $lockDir)) { New-Item -ItemType Directory -Path $lockDir -Force | Out-Null }
    $lock | ConvertTo-Json | Set-Content -LiteralPath $Config.Lock -Encoding UTF8

    $letter = [System.IO.Path]::GetPathRoot($script:Root).TrimEnd('\').TrimEnd(':').ToLowerInvariant()
    Write-Log -Level INFO -Message 'сессия начата (движок WSL2)'
    Write-Log -Level INFO -Message ("файлы накопителя внутри Linux: /mnt/{0}/data" -f $letter)
    Write-Log -Level INFO -Message 'выход из Linux — командой exit; не закрывай окно крестиком'

    & wsl.exe -d $Config.Distro
    $exit = $LASTEXITCODE

    if ($exit -eq 0) {
        Remove-Item -LiteralPath $Config.Lock -Force -ErrorAction SilentlyContinue
        Write-Log -Level OK -Message 'сессия закрыта корректно, блокировка снята'
    } else {
        Write-Log -Level ERROR -Message ("WSL завершился с кодом {0}. Блокировка оставлена до следующего запуска." -f $exit)
        $script:ExitCode = 1
    }

    # страховка: освободить VHDX, чтобы накопитель можно было извлечь
    try { & wsl.exe --terminate $Config.Distro | Out-Null } catch { }
    return ($exit -eq 0)
}

function New-Checkpoint {
    param($Config, [string] $Reason = 'manual')
    $name = Get-Date -Format 'yyyyMMdd-HHmmss'
    $target = Join-Path $Config.Checkpoints $name
    if ($DryRun) {
        Write-Log -Level INFO -Message ("DRY-RUN: wsl --export {0} {1}" -f $Config.Distro, (Join-Path $target 'rootfs.tar'))
        return
    }
    if (-not (Test-WslDistro -Name $Config.Distro)) {
        Write-Log -Level WARN -Message 'контрольная точка не создана: дистрибутив ещё не создан'
        return
    }
    Write-Log -Level WARN -Message 'экспорт дистрибутива занимает время и место (до размера системы). Это особенность WSL-режима.'
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    $tar = Join-Path $target 'rootfs.tar'
    & wsl.exe --export $Config.Distro $tar
    if ($LASTEXITCODE -ne 0) {
        Write-Log -Level ERROR -Message ("экспорт не удался (код {0})" -f $LASTEXITCODE)
        $script:ExitCode = 1
        return
    }
    $meta = [pscustomobject]@{
        name    = $name
        created = (Get-Date).ToString('o')
        reason  = $Reason
        engine  = 'wsl'
        distro  = $Config.Distro
        size    = (New-Object System.IO.FileInfo($tar)).Length
        note    = 'Экспорт WSL. Общие файлы data/ в точку не входят.'
    }
    $meta | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $target 'meta.json') -Encoding UTF8
    Write-Log -Level OK -Message ("контрольная точка создана: karman\checkpoints\{0}" -f $name)
}

function Restore-Checkpoint {
    param($Config, [string] $Name)
    $points = @(Get-ChildItem -LiteralPath $Config.Checkpoints -Directory -ErrorAction SilentlyContinue |
                Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'rootfs.tar') } |
                Sort-Object Name -Descending)
    if ($points.Count -eq 0) { throw 'контрольных точек WSL нет — восстанавливать нечего' }
    $point = if ($Name) { $points | Where-Object { $_.Name -eq $Name } | Select-Object -First 1 } else { $points[0] }
    if ($null -eq $point) { throw ("контрольная точка «{0}» не найдена" -f $Name) }

    if (-not $Force) {
        Write-Log -Level WARN -Message ("восстановление ПЕРЕСОЗДАСТ дистрибутив {0}; текущее состояние будет потеряно." -f $Config.Distro)
        Write-Log -Level INFO -Message 'запусти с -Force, если это действительно нужно (или сначала сделай checkpoint)'
        return
    }
    if ($DryRun) {
        Write-Log -Level INFO -Message ("DRY-RUN: wsl --unregister {0}; затем импорт из {1}" -f $Config.Distro, $point.Name)
        return
    }
    if (Test-WslDistro -Name $Config.Distro) {
        & wsl.exe --unregister $Config.Distro | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'не удалось удалить текущий дистрибутив WSL' }
    }
    Import-Distro -Config $Config -From (Join-Path $point.FullName 'rootfs.tar')
    Write-Log -Level OK -Message ("восстановлено из точки {0}; общие файлы data/ не изменялись" -f $point.Name)
}

function Reset-Distro {
    param($Config)
    if (-not (Test-WslDistro -Name $Config.Distro)) {
        Write-Log -Level INFO -Message 'дистрибутива нет — сбрасывать нечего'
        return
    }
    if (-not $Force) {
        Write-Log -Level WARN -Message 'сброс удалит дистрибутив WSL вместе с настройками. Запусти с -Force для подтверждения.'
        return
    }
    if ($DryRun) {
        Write-Log -Level INFO -Message ("DRY-RUN: wsl --unregister {0}" -f $Config.Distro)
        return
    }
    & wsl.exe --unregister $Config.Distro | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'не удалось удалить дистрибутив' }
    Write-Log -Level OK -Message 'дистрибутив WSL удалён: следующий запуск создаст его заново из rootfs.tar; data/ не тронуты'
}

# ---------------------------------------------------------------------------

Initialize-Log

Write-Host ''
Write-Host '  KARMAN · WSL2-движок' -ForegroundColor Cyan
Write-Host ("  накопитель: {0}" -f $script:Root) -ForegroundColor DarkGray
Write-Host '  ────────────────────────────────────────────────────────' -ForegroundColor DarkGray

if ($env:OS -ne 'Windows_NT') {
    Write-Host '  Этот движок — только для Windows. На Linux используй ЗАПУСТИТЬ-КАРМАН.sh' -ForegroundColor Red
    exit 2
}

try {
    $manifest = Read-Manifest
    $config = Get-SystemConfig -Manifest $manifest -DistroOverride $Distro
} catch {
    Write-Log -Level ERROR -Message $_.Exception.Message
    exit 3
}

Write-Log -Level INFO -Message ("KARMAN WSL launcher {0}, дистрибутив {1}" -f $script:Version, $config.Distro)

if ($Action -eq 'menu') {
    Write-Host '   [1] Запустить Linux   [2] Проверить   [3] Контрольная точка'
    Write-Host '   [4] Восстановить      [5] Сбросить    [0] Выход'
    $choice = Read-Host '  Выбор'
    $Action = switch ($choice) {
        '1' { 'start' }
        '2' { 'verify' }
        '3' { 'checkpoint' }
        '4' { 'restore' }
        '5' { 'reset' }
        default { 'exit' }
    }
    if ($Action -eq 'exit') { Write-Log -Level INFO -Message 'выход без действий'; exit 0 }
}

try {
    $report = Test-Preflight -Config $config

    switch ($Action) {
        'verify' {
            Show-Preflight -Report $report
            Write-Log -Level INFO -Message ("данные в Linux: /mnt/{0}/data" -f [System.IO.Path]::GetPathRoot($script:Root).TrimEnd('\').TrimEnd(':').ToLowerInvariant())
            if (-not $report.Ok) { $script:ExitCode = 1 }
        }
        'start' {
            Show-Preflight -Report $report
            if (-not $report.Ok) {
                Write-Log -Level ERROR -Message 'запуск отменён: сначала устрани ошибки выше'
                $script:ExitCode = 1
                break
            }
            if (Start-Session -Config $config -Report $report) {
                if (-not $DryRun) {
                    $answer = Read-Host '  Создать контрольную точку (экспорт, долго)? [д/Н]'
                    if ($answer -match '^(д|y|да|yes)$') { New-Checkpoint -Config $config -Reason 'after-session' }
                }
            }
        }
        'checkpoint' { New-Checkpoint -Config $config -Reason 'manual' }
        'restore' { Restore-Checkpoint -Config $config -Name $RestorePoint }
        'reset' {
            $answer = Read-Host '  Удалить дистрибутив WSL? Настройки системы пропадут, data/ останутся. [д/Н]'
            if ($answer -match '^(д|y|да|yes)$') { Reset-Distro -Config $config }
            else { Write-Log -Level INFO -Message 'сброс отменён' }
        }
    }
} catch {
    Write-Log -Level ERROR -Message ('ошибка: {0}' -f $_.Exception.Message)
    $script:ExitCode = 1
}

Write-Host ''
if ($script:LogFile) { Write-Host ("  Журнал: {0}" -f $script:LogFile) -ForegroundColor DarkGray }
exit $script:ExitCode
