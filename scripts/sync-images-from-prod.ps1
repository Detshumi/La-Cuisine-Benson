<#
.SYNOPSIS
Pull `public/images` from a remote host into the local repo folder.

.DESCRIPTION
This helper copies files from a remote server into your local repo `public\images` folder.
It prefers rsync (when available) and falls back to scp. It supports a dry-run mode and an
option to only copy missing files.

.PARAMETER RemoteHost
Remote host or IP (required)

.PARAMETER User
SSH username (required)

.PARAMETER RemotePath
Remote path to images. Defaults to `/var/www/html/La-Cuisine-Benson/public/images`.

.PARAMETER LocalPath
Local target path. Defaults to `.\public\images`.

.PARAMETER Port
SSH port. Default 22.

.PARAMETER SshKey
Optional path to private key file for SSH authentication.

.PARAMETER UseRsync
Switch. Try rsync first (recommended).

.PARAMETER OnlyMissing
Switch. When using rsync, pass `--ignore-existing` to avoid overwriting existing files.

.PARAMETER DryRun
Switch. Print commands but don't execute them.

#EXAMPLE
# Dry-run example (call with -RemoteHost to avoid colliding with PowerShell $Host):
.\scripts\sync-images-from-prod.ps1 -RemoteHost 72.60.173.191 -User deploy -UseRsync -SshKey "$env:USERPROFILE\\.ssh\\id_ed25519" -DryRun
#>
param(
    [Parameter(Mandatory=$true)][string]$RemoteHost,
    [Parameter(Mandatory=$true)][string]$User,
    [string]$RemotePath = "/var/www/html/La-Cuisine-Benson/public/images",
    [string]$LocalPath = ".\public\images",
    [int]$Port = 22,
    [string]$SshKey = "",
    [switch]$UseRsync,
    [switch]$OnlyMissing,
    [switch]$DryRun
)

function Test-Command([string]$cmd) {
    return $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

# If SshKey was not provided, try common default location
if (-not $SshKey -or $SshKey -eq "") {
    $defaultKey = Join-Path $env:USERPROFILE ".ssh\id_ed25519"
    if (Test-Path $defaultKey) { $SshKey = $defaultKey }
}

# Ensure local path exists
if (-not (Test-Path $LocalPath)) {
    New-Item -ItemType Directory -Force -Path $LocalPath | Out-Null
}
$resolved = Resolve-Path -LiteralPath $LocalPath -ErrorAction SilentlyContinue
if ($resolved) { $LocalPath = $resolved.Path }
if (-not $LocalPath) { $LocalPath = Join-Path (Get-Location) 'public\images' }

Write-Host "Sync settings: RemoteHost=$RemoteHost User=$User RemotePath=$RemotePath LocalPath=$LocalPath Port=$Port UseRsync=$UseRsync OnlyMissing=$OnlyMissing DryRun=$DryRun"
if ($DryRun) { Write-Host "DryRun: enabled - no files will be transferred" }

# Build SSH command string safely
$sshCmd = 'ssh -p ' + $Port
if ($SshKey -and $SshKey -ne '') {
    if (-not (Test-Path $SshKey)) {
        Write-Error "SshKey file not found: $SshKey"
        exit 2
    }
    # wrap key path in double-quotes for ssh
    $sshCmd = $sshCmd + ' -i "' + $SshKey + '"'
}

# Try rsync when requested and available
if ($UseRsync -and (Test-Command 'rsync')) {
    Write-Host 'Using rsync for incremental sync (recommended)'
    $rsyncFlags = @('--archive','--verbose','--compress','--progress')
    if ($OnlyMissing) { $rsyncFlags += '--ignore-existing' }
    if ($DryRun) { $rsyncFlags += '--dry-run' }

    $remote = $User + '@' + $RemoteHost + ':' + $RemotePath + '/'
    $rsyncArgs = @()
    $rsyncArgs += $rsyncFlags
    $rsyncArgs += @('-e', $sshCmd, $remote, (Join-Path $LocalPath '/'))

    Write-Host ('rsync ' + ($rsyncArgs -join ' '))
    if (-not $DryRun) {
        & rsync @rsyncArgs
        $exit = $LASTEXITCODE
        if ($exit -ne 0) { Write-Error "rsync exited with code $exit"; exit $exit }
        Write-Host "rsync completed. Files are in: $LocalPath"
    }
    exit 0
}

# scp fallback
if (Test-Command 'scp') {
    Write-Host 'rsync not selected or unavailable — using scp fallback'
    $scpArgs = @('-r','-P',$Port)
    if ($SshKey -and $SshKey -ne '') { $scpArgs += @('-i',$SshKey) }

    if ($OnlyMissing) {
        Write-Warning 'OnlyMissing requested but scp cannot efficiently enforce it. Use rsync --ignore-existing for that behavior.'
    }

    $remoteSpec = $User + '@' + $RemoteHost + ':' + $RemotePath + '/*'
    $scpArgs += @($remoteSpec, $LocalPath)

    Write-Host ('scp ' + ($scpArgs -join ' '))
    if (-not $DryRun) {
        & scp @scpArgs
        $exit = $LASTEXITCODE
        if ($exit -ne 0) { Write-Error "scp exited with code $exit"; exit $exit }
        Write-Host "scp completed. Files are in: $LocalPath"
    }
    exit 0
}

Write-Error 'Neither rsync nor scp were found. Install rsync (recommended) or ensure scp (OpenSSH) is available.'
exit 1
