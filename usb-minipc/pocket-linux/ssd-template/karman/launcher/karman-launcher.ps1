#Requires -Version 5.1
<#
.SYNOPSIS
    «Карман» (KARMAN) — лаунчер Linux-среды с внешнего USB SSD (движок запуска, Windows).

.DESCRIPTION
    Программа-помощник, которая лежит НА ФЛЕШКЕ и ничего не устанавливает в систему.
    Её вызывает единственный кликабельный файл в корне накопителя:
    «ЗАПУСТИТЬ-КАРМАН.cmd».

    Что делает:
      * читает karman/manifest.json и проверяет раскладку;
      * проверяет целостность образа системы (sha256 или размер);
      * проверяет свободное место и следы аварийной сессии;
      * создаёт/восстанавливает контрольные точки (копии оверлея);
      * запускает QEMU с портативным движком из karman/engine/qemu;
      * дожидается штатного выключения Linux, пишет журнал в karman/logs;
      * умеет безопасно извлекать накопитель.

    Чего НЕ делает: не ставит службы, не создаёт задачи планировщика, не настраивает
    автозапуск, не читает внутренний диск компьютера, не скрывает процессы,
    не удаляет журналы, не требует прав администратора.

.PARAMETER Action
    menu | start | checkpoint | verify | eject | restore | reset

.PARAMETER RestorePoint
    Имя каталога контрольной точки в karman\checkpoints (по умолчанию — последняя).

.PARAMETER DryRun
    Только показать, что было бы сделано (командная строка QEMU, копирования).

.PARAMETER AllowWritableData
    Подключить общие файлы data/ к Linux с записью. По умолчанию — только чтение.
    Запись через FAT-прослойку QEMU экспериментальна: возможна порча файлов.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File karman-launcher.ps1 -Action verify
#>
[CmdletBinding()]
param(
    [ValidateSet('menu', 'start', 'checkpoint', 'verify', 'eject', 'restore', 'reset')]
    [string] $Action = 'menu',
    [string] $RestorePoint = '',
    [switch] $DryRun,
    [switch] $AllowWritableData,
    [switch] $Force,
    [ValidateSet('auto', 'qemu', 'wsl')]
    [string] $Engine = 'auto',
    [int] $MemoryMb = 0,
    [int] $Cpus = 0
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:LauncherVersion = '1.0.0'
$script:LauncherDir = $PSScriptRoot
$script:KarmanDir = Split-Path -Parent $script:LauncherDir
$script:Root = Split-Path -Parent $script:KarmanDir
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

function Write-Banner {
    Write-Host ''
    Write-Host '  KARMAN · Карман · Linux-среда с внешнего SSD' -ForegroundColor Cyan
    Write-Host ("  накопитель: {0}" -f $script:Root) -ForegroundColor DarkGray
    Write-Host '  ────────────────────────────────────────────────────────' -ForegroundColor DarkGray
}

function Write-Log {
    param(
        [Parameter(Mandatory)][string] $Message,
        [ValidateSet('INFO', 'OK', 'WARN', 'ERROR')][string] $Level = 'INFO',
        [switch] $NoConsole
    )
    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $color = switch ($Level) {
        'OK' { 'Green' }
        'WARN' { 'Yellow' }
        'ERROR' { 'Red' }
        default { 'Gray' }
    }
    if (-not $NoConsole) {
        Write-Host ("  [{0,-5}] {1}" -f $Level, $Message) -ForegroundColor $color
    } else {
        Write-Host ("  [{0,-5}] {1}" -f $Level, $Message)
    }
    if ($script:LogFile) {
        try {
            Add-Content -LiteralPath $script:LogFile -Value ("{0} {1,-5} {2}" -f $stamp, $Level, $Message) -Encoding UTF8
        } catch { }
    }
}

function Initialize-Log {
    $logs = Join-Path $script:KarmanDir 'logs'
    try {
        if (-not (Test-Path -LiteralPath $logs)) { New-Item -ItemType Directory -Path $logs -Force | Out-Null }
        $script:LogFile = Join-Path $logs ("session-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
    } catch {
        $script:LogFile = $null
    }
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

function Read-Manifest {
    if (-not [System.IO.File]::Exists($script:ManifestPath)) {
        throw ("не найден karman\manifest.json — накопитель не подготовлен. " +
               'Запусти tools/prepare_ssd.py или скопируй ssd-template заново.')
    }
    $raw = [System.IO.File]::ReadAllText($script:ManifestPath, [System.Text.Encoding]::UTF8)
    $manifest = $raw | ConvertFrom-Json
    $layout = [int](Get-Prop $manifest 'layout' 0)
    if ($layout -ne 1) {
        throw ("версия раскладки {0} не поддерживается этим лаунчером (ожидается 1)." -f $layout)
    }
    return $manifest
}

function Get-Paths {
    param($Manifest)
    $baseRel = [string](Get-Prop (Get-Prop $Manifest 'system') 'base' 'karman/system/base.qcow2')
    $overlayRel = [string](Get-Prop (Get-Prop $Manifest 'state') 'overlay' 'karman/state/overlay.qcow2')
    $dataRel = [string](Get-Prop (Get-Prop $Manifest 'data') 'dir' 'data')
    $checkpointsRel = [string](Get-Prop (Get-Prop $Manifest 'checkpoints') 'dir' 'karman/checkpoints')

    return [pscustomobject]@{
        Base        = Resolve-InsideRoot $baseRel
        Overlay     = Resolve-InsideRoot $overlayRel
        Data        = Resolve-InsideRoot $dataRel
        Checkpoints = Resolve-InsideRoot $checkpointsRel
        Lock        = Join-Path $script:KarmanDir 'state\session.lock'
        Qemu        = Resolve-InsideRoot ([string](Get-Prop (Get-Prop (Get-Prop $Manifest 'engine') 'qemu') 'path' 'karman/engine/qemu/qemu-system-x86_64.exe'))
        QemuImg     = Resolve-InsideRoot ([string](Get-Prop (Get-Prop (Get-Prop $Manifest 'engine') 'qemu') 'qemu_img' 'karman/engine/qemu/qemu-img.exe'))
    }
}

function Get-FreeSpaceGb {
    param([string] $Path)
    try {
        $rootPath = [System.IO.Path]::GetPathRoot($Path)
        $drive = New-Object System.IO.DriveInfo($rootPath)
        return [math]::Round($drive.AvailableFreeSpace / 1GB, 2)
    } catch {
        return -1
    }
}

function Get-ImageFingerprint {
    param([string] $Path)
    if (-not [System.IO.File]::Exists($Path)) { return $null }
    $info = New-Object System.IO.FileInfo($Path)
    return [pscustomobject]@{ Size = $info.Length; Sha256 = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant() }
}

function Test-Preflight {
    param($Manifest)

    $paths = Get-Paths -Manifest $Manifest
    $issues = New-Object System.Collections.Generic.List[string]
    $warnings = New-Object System.Collections.Generic.List[string]

    # 1. движок
    if (-not [System.IO.File]::Exists($paths.Qemu)) {
        $issues.Add(("нет движка QEMU: {0}. Положи портативную сборку QEMU для Windows в karman\engine\qemu\ (см. README раздела)." -f $paths.Qemu))
    }

    # 2. образ системы
    if (-not [System.IO.File]::Exists($paths.Base)) {
        $issues.Add(("нет образа системы: {0}. Нужен base.qcow2 (см. README раздела)." -f $paths.Base))
    } else {
        $verifyMode = [string](Get-Prop $Manifest 'verify' 'sha256')
        $expectedHash = [string](Get-Prop (Get-Prop $Manifest 'system') 'sha256' '')
        $expectedSize = [long](Get-Prop (Get-Prop $Manifest 'system') 'size' 0)
        if ($verifyMode -ne 'none') {
            $actual = Get-ImageFingerprint -Path $paths.Base
            if ($expectedSize -gt 0 -and $actual.Size -ne $expectedSize) {
                $issues.Add(("размер образа не совпадает с манифестом: {0} вместо {1} байт — образ изменён или повреждён." -f $actual.Size, $expectedSize))
            }
            if ($verifyMode -eq 'sha256' -and $expectedHash) {
                if ($actual.Sha256 -ne $expectedHash) {
                    $issues.Add(("sha256 образа не совпадает с манифестом (получен {0}…). Запуск отменён." -f $actual.Sha256.Substring(0, 12)))
                }
            }
            if ($verifyMode -eq 'sha256' -and -not $expectedHash) {
                $warnings.Add('в манифесте не задан sha256 образа — проверка целостности не выполняется.')
            }
        }
    }

    # 3. свободное место
    $minFree = [double](Get-Prop (Get-Prop $Manifest 'checkpoints') 'min_free_gb' 8)
    $freeGb = Get-FreeSpaceGb -Path $script:Root
    if ($freeGb -ge 0 -and $freeGb -lt $minFree) {
        $issues.Add(("свободно {0} ГБ, нужно минимум {1} ГБ для оверлея и контрольной точки." -f $freeGb, $minFree))
    }

    # 4. общие файлы
    if (-not [System.IO.Directory]::Exists($paths.Data)) {
        $warnings.Add(("нет каталога общих файлов {0} — Linux запустится без него." -f $paths.Data))
    }

    # 5. следы аварийной сессии
    if ([System.IO.File]::Exists($paths.Lock)) {
        $warnings.Add('обнаружен session.lock: прошлая сессия завершилась нештатно. Изменения после последней контрольной точки могли быть потеряны.')
    }

    # 6. состояние оверлея
    if (-not [System.IO.File]::Exists($paths.Overlay)) {
        $warnings.Add('оверлей не найден — будет создан при первом запуске.')
    }

    return [pscustomobject]@{
        Ok       = ($issues.Count -eq 0)
        Issues   = $issues
        Warnings = $warnings
        Paths    = $paths
        FreeGb   = $freeGb
    }
}

function Show-Preflight {
    param($Report)
    foreach ($issue in $Report.Issues) { Write-Log -Level ERROR -Message $issue }
    foreach ($warning in $Report.Warnings) { Write-Log -Level WARN -Message $warning }
    if ($Report.Ok) {
        Write-Log -Level OK -Message ("проверки пройдены, свободно {0} ГБ" -f $Report.FreeGb)
    }
    Write-Log -Level WARN -Message 'напоминание: шифрования нет — любой, кто подключит этот накопитель, прочитает его содержимое.'
}

function New-Overlay {
    param($Report, $Manifest)
    $paths = $Report.Paths
    if ([System.IO.File]::Exists($paths.Overlay)) { return }
    if (-not [System.IO.File]::Exists($paths.QemuImg)) {
        throw ("оверлей отсутствует, а qemu-img не найден: {0}. Первый запуск требует qemu-img из портативной сборки QEMU." -f $paths.QemuImg)
    }
    if ($DryRun) {
        Write-Log -Level INFO -Message ('DRY-RUN: создал бы оверлей {0} на базе {1}' -f $paths.Overlay, $paths.Base)
        return
    }
    $stateDir = Split-Path -Parent $paths.Overlay
    if (-not (Test-Path -LiteralPath $stateDir)) { New-Item -ItemType Directory -Path $stateDir -Force | Out-Null }
    & $paths.QemuImg create -f qcow2 -F qcow2 -b '../system/base.qcow2' $paths.Overlay | Out-Null
    if ($LASTEXITCODE -ne 0) { throw ("qemu-img не смог создать оверлей (код {0})." -f $LASTEXITCODE) }
    Write-Log -Level OK -Message 'создан оверлей (изменения будут храниться отдельно от образа системы)'
}

function New-Checkpoint {
    param($Report, $Manifest, [string] $Reason = 'manual')
    $paths = $Report.Paths
    if (-not [System.IO.File]::Exists($paths.Overlay)) {
        Write-Log -Level WARN -Message 'контрольная точка не создана: оверлея ещё нет (система не запускалась).'
        return $null
    }
    $name = Get-Date -Format 'yyyyMMdd-HHmmss'
    $target = Join-Path $paths.Checkpoints $name
    if ($DryRun) {
        Write-Log -Level INFO -Message ('DRY-RUN: контрольная точка {0} → {1}' -f $name, $target)
        return $name
    }
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    Copy-Item -LiteralPath $paths.Overlay -Destination (Join-Path $target 'overlay.qcow2') -Force
    $meta = [pscustomobject]@{
        name    = $name
        created = (Get-Date).ToString('o')
        reason  = $Reason
        host    = $env:COMPUTERNAME
        size    = (New-Object System.IO.FileInfo((Join-Path $target 'overlay.qcow2'))).Length
        note    = 'Точка содержит только систему/настройки с SSD. Общие файлы data/ в неё не входят.'
    }
    $meta | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $target 'meta.json') -Encoding UTF8

    $max = [int](Get-Prop (Get-Prop $Manifest 'checkpoints') 'max' 5)
    $all = @(Get-ChildItem -LiteralPath $paths.Checkpoints -Directory | Sort-Object Name)
    if ($all.Count -gt $max) {
        $remove = $all | Select-Object -First ($all.Count - $max)
        foreach ($old in $remove) {
            if ($old.Name -like 'pre-restore-*') { continue }
            Remove-Item -LiteralPath $old.FullName -Recurse -Force
            Write-Log -Level INFO -Message ('удалена старая контрольная точка {0} (лимит {1})' -f $old.Name, $max)
        }
    }
    Write-Log -Level OK -Message ("контрольная точка создана: karman\checkpoints\{0}" -f $name)
    return $name
}

function Get-Checkpoints {
    param($Report)
    if (-not (Test-Path -LiteralPath $Report.Paths.Checkpoints)) { return @() }
    return @(Get-ChildItem -LiteralPath $Report.Paths.Checkpoints -Directory | Sort-Object Name -Descending)
}

function Restore-Checkpoint {
    param($Report, [string] $Name)
    $points = Get-Checkpoints -Report $Report
    if ($points.Count -eq 0) {
        throw 'контрольных точек нет — восстанавливать нечего.'
    }
    $point = if ($Name) { $points | Where-Object { $_.Name -eq $Name } | Select-Object -First 1 } else { $points | Select-Object -First 1 }
    if ($null -eq $point) { throw ("контрольная точка «{0}» не найдена." -f $Name) }

    $source = Join-Path $point.FullName 'overlay.qcow2'
    if (-not [System.IO.File]::Exists($source)) { throw ("в точке {0} нет overlay.qcow2" -f $point.Name) }

    $backupName = 'pre-restore-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
    $backupDir = Join-Path $Report.Paths.Checkpoints $backupName
    if ($DryRun) {
        Write-Log -Level INFO -Message ('DRY-RUN: сохранил бы текущее состояние в {0} и восстановил {1}' -f $backupName, $point.Name)
        return
    }
    if ([System.IO.File]::Exists($Report.Paths.Overlay)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        Copy-Item -LiteralPath $Report.Paths.Overlay -Destination (Join-Path $backupDir 'overlay.qcow2') -Force
        Write-Log -Level INFO -Message ("текущее состояние сохранено в checkpoints\{0} — восстановление обратимо" -f $backupName)
    }
    Copy-Item -LiteralPath $source -Destination $Report.Paths.Overlay -Force
    Write-Log -Level OK -Message ("восстановлено из точки {0}. Общие файлы data/ не изменялись." -f $point.Name)
    Write-Log -Level WARN -Message 'восстановление не гарантирует целостность файлов, не дописанных в момент сбоя.'
}

function Reset-SystemState {
    param($Report)
    if ([System.IO.File]::Exists($Report.Paths.Overlay)) {
        if ($DryRun) {
            Write-Log -Level INFO -Message 'DRY-RUN: удалил бы оверлей (система вернётся к base)'
        } else {
            [void](New-Checkpoint -Report $Report -Manifest $script:Manifest -Reason 'before-reset')
            Remove-Item -LiteralPath $Report.Paths.Overlay -Force
            Write-Log -Level OK -Message 'оверлей удалён: система вернётся к заводскому состоянию, data/ не тронуты'
        }
    } else {
        Write-Log -Level INFO -Message 'сбрасывать нечего: оверлея нет.'
    }
}

function Test-Acceleration {
    param($Manifest)
    $requested = [string](Get-Prop (Get-Prop $Manifest 'vm') 'accel' 'auto')
    if ($requested -ne 'auto') { return $requested }
    try {
        $cpu = Get-CimInstance Win32_Processor -ErrorAction Stop | Select-Object -First 1
        if ([bool]$cpu.VirtualizationFirmwareEnabled) { return 'whpx' }
    } catch { }
    return 'tcg'
}

function Resolve-Engine {
    param($Manifest, [string] $Requested)

    $preferred = if ($Requested -and $Requested -ne 'auto') {
        $Requested
    } else {
        [string](Get-Prop (Get-Prop $Manifest 'engine') 'preferred' 'auto')
    }

    $wslConfig = Get-Prop (Get-Prop $Manifest 'engine') 'wsl'
    $distro = [string](Get-Prop $wslConfig 'distro' 'Karman')

    $wslAvailable = [bool](Get-Command -Name 'wsl.exe' -ErrorAction SilentlyContinue)
    if ($preferred -eq 'wsl') {
        if (-not $wslAvailable) {
            throw 'выбран движок WSL, но wsl.exe не найден: нужна Windows 10 2004+/11 с включённым компонентом WSL (его устанавливает пользователь, с правами администратора)'
        }
        return 'wsl'
    }

    if ($preferred -eq 'auto' -and $wslAvailable) {
        try {
            $list = ((& wsl.exe --list --quiet 2>$null) -join "`n") -replace "`0", ''
            if ($list -match ('(?m)^\s*' + [regex]::Escape($distro) + '\s*$')) {
                Write-Log -Level INFO -Message ("найден готовый дистрибутив WSL «{0}» — использую WSL2 (быстрее)" -f $distro)
                return 'wsl'
            }
        } catch { }
    }

    if ($preferred -eq 'auto') {
        Write-Log -Level INFO -Message 'WSL2 не задействован — запускаю через портативный QEMU'
    }
    return 'qemu'
}

function Start-Session {
    param($Report, $Manifest)

    $paths = $Report.Paths
    $memory = if ($MemoryMb -gt 0) { $MemoryMb } else { [int](Get-Prop (Get-Prop $Manifest 'vm') 'memory_mb' 4096) }
    $cpus = if ($Cpus -gt 0) { $Cpus } else { [int](Get-Prop (Get-Prop $Manifest 'vm') 'cpus' 4) }
    $accel = Test-Acceleration -Manifest $Manifest

    $dataArg = $null
    $dataRel = '../../data'
    if ([System.IO.Directory]::Exists($paths.Data) -and [string](Get-Prop (Get-Prop $Manifest 'vm') 'share_data' 'ro') -ne 'none') {
        if ($AllowWritableData -or [string](Get-Prop (Get-Prop $Manifest 'vm') 'share_data' 'ro') -eq 'rw') {
            Write-Log -Level WARN -Message 'общие файлы подключаются с ЗАПИСЬЮ: FAT-мост QEMU экспериментален, возможна порча файлов в data/.'
            $dataArg = ('file=fat:rw:{0},format=raw' -f $dataRel)
        } else {
            Write-Log -Level INFO -Message 'общие файлы подключаются только для чтения (по умолчанию).'
            $dataArg = ('file=fat:{0},format=raw,readonly=on' -f $dataRel)
        }
    }

    $qemuArgs = @(
        '-name', 'KARMAN'
        '-machine', 'q35'
        '-m', "$memory"
        '-smp', "$cpus"
        '-accel', $accel
        '-drive', ("file={0},if=virtio,format=qcow2" -f $paths.Overlay)
    )
    if ($dataArg) { $qemuArgs += @('-drive', $dataArg) }
    $qemuArgs += @(
        '-netdev', 'user,id=net0'
        '-device', 'virtio-net-pci,netdev=net0'
        '-device', 'virtio-vga'
        '-device', 'qemu-xhci,id=xhci'
        '-device', 'usb-tablet,bus=xhci.0'
        '-display', 'gtk'
        '-boot', 'order=c'
    )

    Write-Log -Level INFO -Message ("движок: QEMU, ускорение {0}, {1} МБ RAM, {2} vCPU" -f $accel, $memory, $cpus)

    if ($DryRun) {
        Write-Log -Level INFO -Message ('DRY-RUN: {0} {1}' -f $paths.Qemu, ($qemuArgs -join ' '))
        return $true
    }

    if ($accel -eq 'whpx' -and $Force) { Write-Log -Level WARN -Message 'запрошено принудительное ускорение whpx' }

    $lock = [pscustomobject]@{
        started  = (Get-Date).ToString('o')
        host     = $env:COMPUTERNAME
        user     = $env:USERNAME
        launcher = $script:LauncherVersion
        accel    = $accel
    }
    $lock | ConvertTo-Json | Set-Content -LiteralPath $paths.Lock -Encoding UTF8
    Write-Log -Level INFO -Message 'сессия начата, блокировка записана в karman\state\session.lock'
    Write-Log -Level INFO -Message 'выключай Linux ИЗНУТРИ системы — так файловая система закроется корректно'

    $exit = $null
    $attempt = 0
    while ($attempt -lt 2) {
        $attempt++
        try {
            $process = Start-Process -FilePath $paths.Qemu -ArgumentList $qemuArgs -WorkingDirectory $script:KarmanDir -PassThru -Wait
        } catch {
            Remove-Item -LiteralPath $paths.Lock -Force -ErrorAction SilentlyContinue
            throw ("не удалось запустить QEMU: {0}" -f $_.Exception.Message)
        }
        $exit = $process.ExitCode
        if ($exit -eq 0) { break }
        if ($accel -eq 'whpx' -and $attempt -eq 1) {
            Write-Log -Level WARN -Message ("QEMU завершился с кодом {0}. Похоже, ускорение WHPX недоступно — повторяю в режиме tcg (медленнее)." -f $exit)
            $idx = [array]::IndexOf($qemuArgs, '-accel')
            $qemuArgs[$idx + 1] = 'tcg,thread=multi'
            $accel = 'tcg'
            continue
        }
        break
    }

    if ($exit -eq 0) {
        Remove-Item -LiteralPath $paths.Lock -Force -ErrorAction SilentlyContinue
        Write-Log -Level OK -Message 'Linux выключен корректно, блокировка снята'
    } else {
        Write-Log -Level ERROR -Message ("Linux завершился с кодом {0}. Блокировка оставлена: в следующий раз лаунчер предупредит об аварийной сессии." -f $exit)
        $script:ExitCode = 1
    }
    return ($exit -eq 0)
}

function Invoke-Eject {
    param($Report)
    $drive = [System.IO.Path]::GetPathRoot($script:Root)
    $letter = $drive.TrimEnd('\')
    if ($DryRun) {
        Write-Log -Level INFO -Message ("DRY-RUN: безопасно извлёк бы {0}" -f $letter)
        return
    }
    if ([System.IO.File]::Exists($Report.Paths.Lock)) {
        Write-Log -Level ERROR -Message 'сессия не закрыта: сначала выключи Linux, извлечение отменено.'
        $script:ExitCode = 1
        return
    }
    try {
        $shell = New-Object -ComObject Shell.Application
        $volume = $shell.Namespace(17).ParseName($letter)
        if ($null -eq $volume) { throw 'том не найден в «Моём компьютере»' }
        $volume.InvokeVerb('Eject')
        Write-Log -Level OK -Message ("команда «извлечь» отправлена для {0}. Дождись сообщения системы и вынь накопитель." -f $letter)
    } catch {
        Write-Log -Level ERROR -Message ("не удалось извлечь автоматически: {0}. Закрой программы, использующие накопитель, и используй «Безопасное извлечение устройства» в трее." -f $_.Exception.Message)
        $script:ExitCode = 1
    }
}

function Show-Summary {
    param($Report)
    $points = Get-Checkpoints -Report $Report
    Write-Host ''
    Write-Host ("  Контрольных точек: {0}" -f $points.Count) -ForegroundColor DarkGray
    foreach ($point in ($points | Select-Object -First 5)) {
        $meta = Join-Path $point.FullName 'meta.json'
        $when = $point.Name
        if ([System.IO.File]::Exists($meta)) {
            try { $when = ([string](Get-Prop ((Get-Content -LiteralPath $meta -Raw | ConvertFrom-Json)) 'created' $point.Name)) } catch { }
        }
        Write-Host ("    · {0}  ({1})" -f $point.Name, $when) -ForegroundColor DarkGray
    }
    Write-Host ''
}

function Show-Menu {
    Write-Banner
    Write-Host '   [1] Запустить Linux    [2] Контрольная точка'
    Write-Host '   [3] Проверить          [4] Безопасно извлечь'
    Write-Host '   [5] Восстановить       [6] Сбросить систему'
    Write-Host '   [0] Выход'
    Write-Host ''
    Write-Host '   Linux-среда работает в виртуальной машине; данные — на этой флешке.' -ForegroundColor DarkGray
    Write-Host '   Шифрования нет: содержимое прочитает любой, кто подключит накопитель.' -ForegroundColor Yellow
    Write-Host ''
    $choice = Read-Host '  Выбор'
    switch ($choice) {
        '1' { return 'start' }
        '2' { return 'checkpoint' }
        '3' { return 'verify' }
        '4' { return 'eject' }
        '5' { return 'restore' }
        '6' { return 'reset' }
        default { return $null }
    }
}

# ---------------------------------------------------------------------------
# точка входа
# ---------------------------------------------------------------------------

if ($env:OS -ne 'Windows_NT') {
    Write-Host 'Этот лаунчер — для Windows. На Linux запусти ЗАПУСТИТЬ-КАРМАН.sh' -ForegroundColor Red
    exit 2
}

Initialize-Log
Write-Banner
Write-Log -Level INFO -Message ("KARMAN launcher {0}, накопитель {1}" -f $script:LauncherVersion, $script:Root)

try {
    $script:Manifest = Read-Manifest
} catch {
    Write-Log -Level ERROR -Message $_.Exception.Message
    exit 3
}

if ($Action -eq 'menu') {
    $Action = Show-Menu
    if ($null -eq $Action) { Write-Log -Level INFO -Message 'выход без действий'; exit 0 }
}

$resolvedEngine = 'qemu'
try {
    $resolvedEngine = Resolve-Engine -Manifest $script:Manifest -Requested $Engine
} catch {
    Write-Log -Level ERROR -Message $_.Exception.Message
    exit 4
}
Write-Log -Level INFO -Message ("движок: {0}" -f $resolvedEngine)

if ($resolvedEngine -eq 'wsl' -and $Action -ne 'eject') {
    $wslLauncher = Join-Path $script:LauncherDir 'karman-wsl.ps1'
    if (-not (Test-Path -LiteralPath $wslLauncher)) {
        Write-Log -Level ERROR -Message 'выбран движок WSL, но файл karman-wsl.ps1 рядом с лаунчером не найден'
        exit 4
    }
    $childArgs = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $wslLauncher,
                   '-Action', $Action, '-Root', $script:Root)
    if ($DryRun) { $childArgs += '-DryRun' }
    if ($Force) { $childArgs += '-Force' }
    if ($RestorePoint) { $childArgs += @('-RestorePoint', $RestorePoint) }
    & powershell.exe @childArgs
    exit $LASTEXITCODE
}

$report = Test-Preflight -Manifest $script:Manifest

if ($Action -in @('start', 'checkpoint', 'restore', 'reset')) {
    Show-Preflight -Report $report
}

try {
switch ($Action) {
    'verify' {
        $report = Test-Preflight -Manifest $script:Manifest
        Show-Preflight -Report $report
        Show-Summary -Report $report
        if ($report.Ok) { Write-Log -Level OK -Message 'накопитель готов к запуску' } else { $script:ExitCode = 1 }
    }
    'start' {
        if (-not $report.Ok) {
            Write-Log -Level ERROR -Message 'запуск отменён: сначала устрани ошибки выше (подробности — в README раздела).'
            $script:ExitCode = 1
            break
        }
        New-Overlay -Report $report -Manifest $script:Manifest
        if (-not (Start-Session -Report $report -Manifest $script:Manifest)) { break }
        if (-not $DryRun) {
            Write-Host ''
            $answer = Read-Host '  Создать контрольную точку перед извлечением? [д/Н]'
            if ($answer -match '^(д|y|да|yes)$') {
                [void](New-Checkpoint -Report $report -Manifest $script:Manifest -Reason 'after-session')
            }
            $eject = Read-Host '  Безопасно извлечь накопитель сейчас? [д/Н]'
            if ($eject -match '^(д|y|да|yes)$') { Invoke-Eject -Report $report }
        }
    }
    'checkpoint' {
        [void](New-Checkpoint -Report $report -Manifest $script:Manifest -Reason 'manual')
    }
    'restore' {
        Restore-Checkpoint -Report $report -Name $RestorePoint
    }
    'reset' {
        $confirm = Read-Host '  Сбросить систему к заводскому состоянию? Общие файлы data/ не пострадают. [д/Н]'
        if ($confirm -match '^(д|y|да|yes)$') { Reset-SystemState -Report $report }
        else { Write-Log -Level INFO -Message 'сброс отменён' }
    }
    'eject' {
        Invoke-Eject -Report $report
    }
}
} catch {
    Write-Log -Level ERROR -Message ('ошибка: {0}' -f $_.Exception.Message)
    $script:ExitCode = 1
}

Write-Host ''
if ($script:LogFile) { Write-Host ("  Журнал: {0}" -f $script:LogFile) -ForegroundColor DarkGray }
exit $script:ExitCode
