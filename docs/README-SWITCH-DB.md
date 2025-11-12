# switch-db.ps1 — quick helper

What it does
- Updates `DB_ACTIVE` in the repository `.env` to `dev` or `prod` (or `toggle`).
- Prints a short summary of the resolved DB host / database / user.
- By default runs `php artisan config:clear` and `php artisan cache:clear` if `php` is on PATH.
- The script searches up the directory tree (from the script location) to find the repo `.env`.

Files
- Script: `scripts/switch-db.ps1`

One-line commands (examples)
- From the repository root (PowerShell):
  ```powershell
  pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\switch-db.ps1 dev
  ```

- From anywhere (PowerShell) using an environment variable:
  ```powershell
  $env:SWITCH_DB_MODE='prod'; pwsh -NoProfile -ExecutionPolicy Bypass -File C:\full\path\to\repo\scripts\switch-db.ps1
  ```

- Toggle the current value:
  ```powershell
  pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\switch-db.ps1 toggle
  ```

- Skip artisan cache/config clears:
  ```powershell
  pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\switch-db.ps1 dev -NoClear
  ```

Notes
- The script will fail with a non‑zero exit code on error so it can be used safely in CI steps.
- If you need to run this from a non-Windows shell, call PowerShell Core (`pwsh`) with the full script path.
- The script uses a helper to read values from `.env` so it can display resolved DB_* values.
