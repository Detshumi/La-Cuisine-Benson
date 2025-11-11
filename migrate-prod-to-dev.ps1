<#
migrate-prod-to-dev.ps1

Usage:
    .\migrate-prod-to-dev.ps1 [-UseSsh] [-SshUser root] [-SshPort 22] [-NoBackup] [-KeepDump] [-Force]

What it does:
 - Reads DB credentials for prod and dev from the project's `.env` file.
 - Optionally runs pg_dump on the remote server over SSH and streams the dump locally.
 - Imports the dump into the dev database (overwrites data).
 - Optionally saves a backup of the dev DB before restoring.

Warnings:
 - This is a destructive operation for the development DB (it will be replaced by a copy of prod).
 - Keep your `.env` secure. The script reads plaintext passwords from `.env`.
#>

param(
    [switch]$UseSsh,
    [string]$SshUser = 'root',
    [int]$SshPort = 22,
    [switch]$NoBackup,
    [switch]$KeepDump,
    [switch]$Force
)

function Get-EnvValue($key) {
    $envPath = Join-Path $PSScriptRoot '.env'
    if (-not (Test-Path $envPath)) { throw ".env not found at $envPath" }
    $lines = Get-Content $envPath
    foreach ($line in $lines) {
        if ($line -match "^$key\s*=\s*(.*)$") {
            $val = $matches[1].Trim()
            # strip surrounding single or double quotes
            if ($val -match '^"(.*)"$' -or $val -match "^'(.*)'$") {
                $val = $matches[1]
            }
            return $val
        }
    }
    return $null
}

try {
    # Prod credentials
    $prodHost = Get-EnvValue 'DB_HOST_prod'
    $prodPort = Get-EnvValue 'DB_PORT_prod'  ; if (-not $prodPort) { $prodPort = Get-EnvValue 'DB_PORT' }
    $prodDb   = Get-EnvValue 'DB_DATABASE_prod'
    $prodUser = Get-EnvValue 'DB_USERNAME_prod'
    $prodPass = Get-EnvValue 'DB_PASSWORD_prod'

    # Dev credentials
    $devHost = Get-EnvValue 'DB_HOST_dev' ; if (-not $devHost) { $devHost = Get-EnvValue 'DB_HOST' }
    $devPort = Get-EnvValue 'DB_PORT_dev' ; if (-not $devPort) { $devPort = Get-EnvValue 'DB_PORT' }
    $devDb   = Get-EnvValue 'DB_DATABASE_dev' ; if (-not $devDb) { $devDb = Get-EnvValue 'DB_DATABASE' }
    $devUser = Get-EnvValue 'DB_USERNAME_dev' ; if (-not $devUser) { $devUser = Get-EnvValue 'DB_USERNAME' }
    $devPass = Get-EnvValue 'DB_PASSWORD_dev' ; if (-not $devPass) { $devPass = Get-EnvValue 'DB_PASSWORD' }

    if (-not $prodDb -or -not $prodUser -or -not $prodPass) {
        throw "Production DB credentials not found in .env (DB_*_prod)."
    }
    if (-not $devDb -or -not $devUser -or -not $devPass) {
        throw "Development DB credentials not found in .env (DB_*_dev)."
    }

    Write-Host "PROD -> DEV migration plan"
    Write-Host ("  Prod: {0}@{1}:{2}/{3}" -f $prodUser, $prodHost, $prodPort, $prodDb)
    Write-Host ("  Dev:  {0}@{1}:{2}/{3}" -f $devUser, $devHost, $devPort, $devDb)

    if (-not $Force) {
        $confirm = Read-Host "Proceed? This will overwrite the development database. Type 'yes' to continue"
        if ($confirm -ne 'yes') { Write-Host 'Aborted.'; exit 1 }
    }

    # Ensure required commands exist
    if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
        throw "pg_dump not found in PATH. Install PostgreSQL client tools."
    }
    if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
        throw "psql not found in PATH. Install PostgreSQL client tools."
    }

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $dumpFile = Join-Path $env:TEMP "prod_dump_$timestamp.sql"

    # Backup dev DB by default unless -NoBackup is specified
    if (-not $NoBackup) {
        $devBackupFile = Join-Path $env:TEMP "dev_backup_$timestamp.sql"
        Write-Host "Backing up dev DB to $devBackupFile"
        $env:PGPASSWORD = $devPass
        & pg_dump -h $devHost -p $devPort -U $devUser -F p -f $devBackupFile $devDb
        if ($LASTEXITCODE -ne 0) { throw "Failed to backup dev DB (pg_dump exit code $LASTEXITCODE)" }
        Remove-Variable -Name PGPASSWORD -ErrorAction SilentlyContinue
    }

    if ($UseSsh) {
        # Run pg_dump on the remote server via SSH and write to local file
        Write-Host "Running remote pg_dump via SSH ($SshUser@$prodHost)", "-> $dumpFile"
        # Build remote command (escape single quotes by closing and reopening)
    $sshTarget = "$SshUser@$prodHost"
    # Use --clean --if-exists to include DROP statements and --no-owner/--no-acl to avoid role/owner problems
    $remoteCmd = "PGPASSWORD='$prodPass' pg_dump --format=plain --clean --if-exists --no-owner --no-acl -U $prodUser -h $prodHost -p $prodPort $prodDb"
    # Use ssh to run remote command and redirect output locally
    Write-Host ("Running remote pg_dump via SSH ({0}) -> {1}" -f $sshTarget, $dumpFile)
    & ssh -p $SshPort $sshTarget $remoteCmd > $dumpFile
    if ($LASTEXITCODE -ne 0) { throw "Remote pg_dump via SSH failed (exit code $LASTEXITCODE)." }
    } else {
        # Run pg_dump locally connecting directly to prod DB host
    Write-Host ("Running pg_dump against {0}:{1} -> {2}" -f $prodHost, $prodPort, $dumpFile)
        $env:PGPASSWORD = $prodPass
        # Use --clean --if-exists so existing objects are dropped, and --no-owner/--no-acl to avoid ownership issues
        & pg_dump --format=plain --clean --if-exists --no-owner --no-acl -h $prodHost -p $prodPort -U $prodUser -f $dumpFile $prodDb
        if ($LASTEXITCODE -ne 0) { throw "pg_dump failed (exit code $LASTEXITCODE)." }
        Remove-Variable -Name PGPASSWORD -ErrorAction SilentlyContinue
    }

    # Restore into dev DB
    Write-Host "Restoring dump into development DB..."
    $env:PGPASSWORD = $devPass
    # Use ON_ERROR_STOP so psql fails fast on errors
    & psql -v ON_ERROR_STOP=1 -h $devHost -p $devPort -U $devUser -d $devDb -f $dumpFile
    if ($LASTEXITCODE -ne 0) { throw "psql restore failed (exit code $LASTEXITCODE)." }
    Remove-Variable -Name PGPASSWORD -ErrorAction SilentlyContinue

    Write-Host "Migration completed successfully."

    if (-not $KeepDump) { Remove-Item $dumpFile -ErrorAction SilentlyContinue }

} catch {
    Write-Error "Error: $_"
    exit 1
}
