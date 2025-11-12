# Database migration & PowerShell helper README

This file documents the project's PowerShell utilities for switching DB configs and migrating production -> development.

## Overview

Files:
- `switch-db.ps1` — Toggle or set `DB_ACTIVE` in the project's `.env` file (dev or prod). Optionally clears artisan cache.
- `migrate-prod-to-dev.ps1` — Dump the production database and restore into the development database. By default the script makes a backup of the dev DB first. Use `-KeepDump` to keep the dump file.

> IMPORTANT: Both scripts read raw `.env` values (including plaintext passwords). Keep `.env` secure and never commit it.

---

## Quick examples (PowerShell)

Run migration from production -> development (interactive confirm):

```powershell
.\scripts\migrate-prod-to-dev.ps1 -KeepDump
```

Force non-interactive (dangerous):

```powershell
.\scripts\migrate-prod-to-dev.ps1 -KeepDump -Force
```

If you need to run remote `pg_dump` via SSH (server must have `pg_dump` and allow SSH):

```powershell
.\scripts\migrate-prod-to-dev.ps1 -UseSsh -SshUser root -SshPort 22 -KeepDump
```

---

## What `migrate-prod-to-dev.ps1` does (summary)
1. Reads `DB_*_prod` and `DB_*_dev` values from `.env`.
2. Backs up the dev DB to `%TEMP%\dev_backup_<timestamp>.sql` unless `-NoBackup` is provided.
3. Runs `pg_dump` against the prod DB (or runs remote `pg_dump` over SSH) and writes a dump to `%TEMP%\prod_dump_<timestamp>.sql`.
4. Restores the dump into the dev DB using `psql`.
5. Removes the dump file unless `-KeepDump` was passed.

If any step fails, the script exits with an error and (usually) leaves the backup and dump files in `%TEMP%` for inspection.

---

## Troubleshooting & validation steps

1. Confirm `pg_dump` and `psql` are installed and on PATH:

```powershell
psql --version
pg_dump --version
```

2. Find the created dump/backup files (they are placed in your user TEMP):

```powershell
Get-ChildItem -Path $env:TEMP -Filter "prod_dump_*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
Get-ChildItem -Path $env:TEMP -Filter "dev_backup_*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

3. Inspect the dump header to ensure it contains SQL and table CREATE statements:

```powershell
Get-Content -Path $env:TEMP\prod_dump_YYYYMMDD_HHMMSS.sql -TotalCount 60
```

4. Check whether the restore succeeded by listing tables in the dev DB:

```powershell
$env:PGPASSWORD = "<dev_db_password>"
psql -h <dev_host> -p <dev_port> -U <dev_user> -d <dev_db> -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
```

5. If `psql` fails with "Connection refused":
- Ensure the PostgreSQL server is running and listening on the port in your `.env` (e.g., 5433).
- Start it with `pg_ctl` (example used in this repo):

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' start -D 'C:\Program Files\PostgreSQL\18\data' -w -l 'C:\ProgramData\PostgresLog.txt'
```

6. If the restore reported errors during `psql -f <dumpfile>` the script would have exited. Inspect the log files under the Postgres data `log` directory and the dump file itself.

Logs:

```powershell
Get-ChildItem 'C:\Program Files\PostgreSQL\18\data\log' | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | ForEach-Object { Get-Content $_.FullName -Tail 200 }
```

---

## Common reasons you might not see prod data in dev after running the script
- The script restored to a different database name than the one your app is using. Check the `DB_DATABASE_dev` in `.env` and the resolved values printed by `switch-db.ps1`.
- The restore failed part-way (errors in `psql`) — check the migration output, the `%TEMP%` dump file, and Postgres logs.
- The dev database was empty because `pg_dump` didn't actually produce table creation statements (rare) — inspect the dump header for CREATE TABLE blocks.

---

## Safety tips
- Always keep a copy of `dev_backup_<timestamp>.sql` before doing anything else.
- Use `-KeepDump` to keep the prod dump for inspection.
- Run with `-Force` only when you are certain.

---

If you'd like, I can:
- List the actual dump/backup filenames created in your `%TEMP%` folder (I already found them in this run).
- Create a small PowerShell wrapper that prints the dump/backup paths after a migration run.
- Re-run the migration with different flags (e.g., `-UseSsh`) if your production server requires it.

