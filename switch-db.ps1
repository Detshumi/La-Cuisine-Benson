<#
.\switch-db.ps1 -Mode dev|prod|toggle [-NoClear]

Sets DB_ACTIVE in the project's .env to either 'dev' or 'prod', or toggles the value.
By default the script will run `php artisan config:clear` and `php artisan cache:clear` if `php` is available.

Examples:
  .\switch-db.ps1 -Mode prod        # set to production
  .\switch-db.ps1 -Mode dev         # set to development
  .\switch-db.ps1 -Mode toggle      # switch between dev and prod
  .\switch-db.ps1 -Mode prod -NoClear  # set to prod but don't run artisan commands
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev','prod','toggle')]
    [string]$Mode,

    [switch]$NoClear
)

$envPath = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path $envPath)) {
    Write-Error "Cannot find .env at $envPath"
    exit 1
}

$content = Get-Content $envPath -Raw

$current = ''
if ($content -match '(?m)^DB_ACTIVE\s*=\s*(\w+)\s*$') {
    $current = $matches[1]
}

if ($Mode -eq 'toggle') {
    if ($current -eq 'prod') { $target = 'dev' } else { $target = 'prod' }
} else {
    $target = $Mode
}

if ($current -ne '') {
    $newContent = [regex]::Replace($content, '(?m)^DB_ACTIVE\s*=\s*\w+\s*$', "DB_ACTIVE=$target", 1)
} else {
    # Append at end
    $newContent = $content.TrimEnd() + "`r`nDB_ACTIVE=$target`r`n"
}

Set-Content -Path $envPath -Value $newContent -Encoding UTF8
Write-Host "Set DB_ACTIVE=$target in $envPath"

# Show a concise summary of which DB block is active and the resolved DB host/database/username
function Get-EnvValue([string]$key, [string]$fallback='') {
    if ($newContent -match "(?m)^$key\s*=\s*(.*)$") { return $matches[1].Trim() }
    return $fallback
}

$resolvedHost = Get-EnvValue "DB_HOST_$target"
if (-not $resolvedHost) { $resolvedHost = Get-EnvValue "DB_HOST" }
$resolvedPort = Get-EnvValue "DB_PORT_$target"
if (-not $resolvedPort) { $resolvedPort = Get-EnvValue "DB_PORT" }
$resolvedDb = Get-EnvValue "DB_DATABASE_$target"
if (-not $resolvedDb) { $resolvedDb = Get-EnvValue "DB_DATABASE" }
$resolvedUser = Get-EnvValue "DB_USERNAME_$target"
if (-not $resolvedUser) { $resolvedUser = Get-EnvValue "DB_USERNAME" }

if ($resolvedHost -or $resolvedDb -or $resolvedUser) {
    Write-Host "Now active: DB_ACTIVE=$target"
    Write-Host "Resolved DB host: $resolvedHost`:$resolvedPort"
    Write-Host "Resolved DB database: $resolvedDb"
    Write-Host "Resolved DB username: $resolvedUser"
} else {
    Write-Host "Now active: DB_ACTIVE=$target (no DB_* values detected)"
}

if (-not $NoClear) {
    if (Get-Command php -ErrorAction SilentlyContinue) {
        Write-Host "Running: php artisan config:clear && php artisan cache:clear"
        & php artisan config:clear
        & php artisan cache:clear
    } else {
        Write-Warning "php not found in PATH; skipping artisan cache clear. Run 'php artisan config:clear' manually if needed."
    }
}

Write-Host "Done."
