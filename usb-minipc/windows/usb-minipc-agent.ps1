#Requires -Version 5.1
<#
.SYNOPSIS
    Агент USB Mini-PC: замечает подключение флешки и запускает её лаунчер.

.DESCRIPTION
    Раз в несколько секунд опрашивает список съёмных дисков. Для нового тома
    ищет <корень>\minipc\config.json. Если манифест валиден, файл-лаунчер лежит
    ВНУТРИ флешки и его SHA-256 совпадает с указанным в манифесте — запускает
    его, передав переменные окружения MINIPC_ROOT / MINIPC_NAME / MINIPC_LAUNCH.

    Это не скрытый автозапуск: агент ставится владельцем ПК явно
    (install-agent.ps1), пишет журнал и запускает только подписанный хэшем
    лаунчер с флешки.

.PARAMETER IntervalSeconds
    Период опроса в секундах.

.PARAMETER LogDirectory
    Куда писать agent.log (по умолчанию %LOCALAPPDATA%\usb-minipc).

.PARAMETER Once
    Один проход и выход (удобно для отладки).

.PARAMETER DryRun
    Ничего не запускать, только писать в журнал, что было бы запущено.

.PARAMETER TriggerExisting
    Обработать флешки, которые уже вставлены на момент старта.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\usb-minipc-agent.ps1 -Once -DryRun
#>
[CmdletBinding()]
param(
    [double] $IntervalSeconds = 2,
    [string] $LogDirectory = (Join-Path $env:LOCALAPPDATA 'usb-minipc'),
    [switch] $Once,
    [switch] $DryRun,
    [switch] $TriggerExisting
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:LogFile = Join-Path $LogDirectory 'agent.log'
$script:AgentVersion = '1.0.0'

function Write-AgentLog {
    param(
        [Parameter(Mandatory)][string] $Message,
        [ValidateSet('INFO', 'WARN', 'ERROR')][string] $Level = 'INFO'
    )
    $line = '{0} {1,-5} {2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message
    Write-Host $line
    try {
        $dir = Split-Path -Parent $script:LogFile
        if (-not (Test-Path -LiteralPath $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        Add-Content -LiteralPath $script:LogFile -Value $line -Encoding UTF8
    } catch {
        # журнал — не повод падать
    }
}

function Get-Prop {
    param($Object, [string] $Name, $Default = $null)
    if ($null -eq $Object) { return $Default }
    $prop = $Object.PSObject.Properties[$Name]
    if ($null -eq $prop) { return $Default }
    return $prop.Value
}

function Get-RemovableRoots {
    $roots = New-Object 'System.Collections.Generic.List[string]'
    foreach ($drive in [System.IO.DriveInfo]::GetDrives()) {
        try {
            if ($drive.DriveType -ne [System.IO.DriveType]::Removable) { continue }
            if (-not $drive.IsReady) { continue }
            $roots.Add($drive.RootDirectory.FullName)
        } catch {
            # картридер без карты и подобное
        }
    }
    return $roots
}

function Read-MiniPcManifest {
    param([Parameter(Mandatory)][string] $Root)

    $path = Join-Path (Join-Path $Root 'minipc') 'config.json'
    if (-not [System.IO.File]::Exists($path)) { return $null }

    try {
        $info = New-Object System.IO.FileInfo($path)
        if ($info.Length -gt 64KB) { throw 'config.json слишком большой' }
        $raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
        $cfg = $raw | ConvertFrom-Json
    } catch {
        Write-AgentLog -Level WARN -Message ('{0}: config.json не разобран ({1})' -f $Root, $_.Exception.Message)
        return $null
    }

    $launch = [string](Get-Prop $cfg 'launch' '')
    if ([string]::IsNullOrWhiteSpace($launch)) {
        Write-AgentLog -Level WARN -Message ('{0}: в config.json нет поля launch' -f $Root)
        return $null
    }

    $name = [string](Get-Prop $cfg 'name' '')
    if ([string]::IsNullOrWhiteSpace($name)) { $name = (Split-Path -Leaf $Root.TrimEnd('\')) }

    $autoLaunch = Get-Prop $cfg 'autoLaunch' $true
    if ($autoLaunch -is [string]) { $autoLaunch = @('1', 'true', 'yes', 'on', 'да') -contains $autoLaunch.ToLowerInvariant() }

    $argList = @(Get-Prop $cfg 'args' @() | ForEach-Object { [string]$_ })
    $sha = [string](Get-Prop $cfg 'sha256' '')

    return [pscustomobject]@{
        Name       = $name
        Launch     = $launch
        Args       = $argList
        AutoLaunch = [bool]$autoLaunch
        Sha256     = $sha.Trim().ToLowerInvariant()
    }
}

function Resolve-MiniPcPayload {
    param(
        [Parameter(Mandatory)][string] $Root,
        [Parameter(Mandatory)][string] $Relative
    )

    $rootFull = [System.IO.Path]::GetFullPath($Root)
    if (-not $rootFull.EndsWith('\')) { $rootFull += '\' }
    $target = [System.IO.Path]::GetFullPath((Join-Path $rootFull $Relative))

    if (-not $target.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw ('путь «{0}» выходит за пределы флешки' -f $Relative)
    }
    if (-not [System.IO.File]::Exists($target)) {
        throw ('лаунчер не найден: {0}' -f $Relative)
    }
    return $target
}

function Invoke-MiniPcPayload {
    param(
        [Parameter(Mandatory)][string] $Root,
        [Parameter(Mandatory)] $Manifest,
        [switch] $Simulate
    )

    $payload = Resolve-MiniPcPayload -Root $Root -Relative $Manifest.Launch
    $hash = (Get-FileHash -LiteralPath $payload -Algorithm SHA256).Hash.ToLowerInvariant()

    if ($Manifest.Sha256 -and $Manifest.Sha256 -ne $hash) {
        throw ('хэш лаунчера не совпадает с манифестом (ожидался {0}…, получен {1}…)' -f
            $Manifest.Sha256.Substring(0, [Math]::Min(12, $Manifest.Sha256.Length)),
            $hash.Substring(0, 12))
    }
    if (-not $Manifest.Sha256) {
        Write-AgentLog -Level WARN -Message ('{0}: sha256 не задан, лаунчер {1}' -f $Manifest.Name, $hash)
    }

    $workDir = Split-Path -Parent $payload
    $saved = @{
        MINIPC_ROOT   = $env:MINIPC_ROOT
        MINIPC_DRIVE  = $env:MINIPC_DRIVE
        MINIPC_NAME   = $env:MINIPC_NAME
        MINIPC_LAUNCH = $env:MINIPC_LAUNCH
        MINIPC_AGENT  = $env:MINIPC_AGENT
    }

    $rootFull = [System.IO.Path]::GetFullPath($Root)
    if (-not $rootFull.EndsWith('\')) { $rootFull += '\' }

    $env:MINIPC_ROOT = $rootFull
    $env:MINIPC_DRIVE = [System.IO.Path]::GetPathRoot($rootFull).TrimEnd('\')
    $env:MINIPC_NAME = $Manifest.Name
    $env:MINIPC_LAUNCH = $payload
    $env:MINIPC_AGENT = "usb-minipc-agent/$script:AgentVersion"

    try {
        $extension = [System.IO.Path]::GetExtension($payload).ToLowerInvariant()
        $startArgs = @{
            FilePath         = $payload
            ArgumentList     = @()
            WorkingDirectory = $workDir
            PassThru         = $false
        }
        if ($extension -eq '.cmd' -or $extension -eq '.bat') {
            $startArgs.FilePath = 'cmd.exe'
            $startArgs.ArgumentList = @('/c', "`"$payload`"") + $Manifest.Args
        } elseif ($extension -eq '.ps1') {
            $startArgs.FilePath = 'powershell.exe'
            $startArgs.ArgumentList = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$payload`"") + $Manifest.Args
        } else {
            $startArgs.FilePath = $payload
            if ($Manifest.Args.Count -gt 0) { $startArgs.ArgumentList = $Manifest.Args }
        }

        if ($Simulate) {
            Write-AgentLog -Message ('{0}: DRY-RUN, запустил бы {1} {2}' -f
                $Manifest.Name, $startArgs.FilePath, ($startArgs.ArgumentList -join ' '))
            return $true
        }

        Start-Process @startArgs | Out-Null
        Write-AgentLog -Message ('{0}: запущено «{1}» → {2}' -f
            $Manifest.Name, $Manifest.Name, [System.IO.Path]::GetFileName($payload))
        return $true
    } finally {
        foreach ($key in $saved.Keys) {
            if ($null -eq $saved[$key]) {
                Remove-Item -Path ("Env:{0}" -f $key) -ErrorAction SilentlyContinue
            } else {
                Set-Item -Path ("Env:{0}" -f $key) -Value $saved[$key]
            }
        }
    }
}

function Invoke-VolumeHandled {
    param([Parameter(Mandatory)][string] $Root)

    $manifest = $null
    for ($attempt = 0; $attempt -lt 6 -and $null -eq $manifest; $attempt++) {
        $manifest = Read-MiniPcManifest -Root $Root
        if ($null -eq $manifest -and -not [System.IO.Directory]::Exists($Root)) {
            Start-Sleep -Milliseconds (300 * ($attempt + 1))
        } else {
            break
        }
    }

    if ($null -eq $manifest) {
        Write-AgentLog -Message ('{0}: minipc/config.json не найден — обычная флешка' -f $Root)
        return
    }
    if (-not $manifest.AutoLaunch) {
        Write-AgentLog -Message ('{0}: «{1}» — autoLaunch выключен, только журнал' -f $Root, $manifest.Name)
        return
    }

    try {
        Invoke-MiniPcPayload -Root $Root -Manifest $manifest -Simulate:$DryRun | Out-Null
    } catch {
        Write-AgentLog -Level ERROR -Message ('{0}: отказано — {1}' -f $manifest.Name, $_.Exception.Message)
    }
}

# ---------------------------------------------------------------------------

Write-AgentLog -Message ('USB Mini-PC agent {0}: старт, интервал {1} c' -f $script:AgentVersion, $IntervalSeconds)
if ($DryRun) { Write-AgentLog -Level WARN -Message 'режим DRY-RUN: лаунчеры не запускаются' }

$seen = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)

if (-not $TriggerExisting) {
    foreach ($root in (Get-RemovableRoots)) { [void]$seen.Add($root) }
    if ($seen.Count -gt 0) {
        Write-AgentLog -Message ('уже вставлено томов: {0} — жду новые' -f $seen.Count)
    }
}

do {
    $current = @(Get-RemovableRoots)
    foreach ($root in $current) {
        if ($seen.Add($root)) {
            Write-AgentLog -Message ('новый том: {0}' -f $root)
            Invoke-VolumeHandled -Root $root
        }
    }
    $seen.IntersectWith([string[]]$current)

    if ($Once) { break }
    Start-Sleep -Milliseconds ([int]([Math]::Max(250, $IntervalSeconds * 1000)))
} while ($true)
