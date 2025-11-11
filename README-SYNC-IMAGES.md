# Syncing uploaded images from Production to Local

This short README explains how to pull uploaded images from your production server into your local development copy so you can work with real assets without committing binary files to Git.

Recommended approach
- Use rsync over SSH (incremental, fast) when possible.
- If rsync is not available, use scp (OpenSSH) or a GUI like WinSCP.
- Do not commit uploaded images to regular Git. If you must version binaries, use Git LFS.

Files in this repo
- `scripts/sync-images-from-prod.ps1` — PowerShell helper. It supports rsync (preferred) or falls back to scp. It accepts host, user, remote/local paths, SSH key and port.

Quick checklist before syncing
- Confirm you have SSH access to the production server (host, user, optional key).
- Know the remote path to the images. Example in this project:
  - Site webroot: `/var/www/html/La-Cuisine-Benson`
  - Images: `/var/www/html/La-Cuisine-Benson/public/images`
  - Thumbs: `/var/www/html/La-Cuisine-Benson/public/images/thumbs`
- Ensure you have rsync or scp installed on your local machine. On Windows, install OpenSSH, or run in WSL where rsync is available.

1) Using the repo PowerShell script (recommended for convenience)

PowerShell examples (run from repo root):

Sync all images with rsync (recommended):

```powershell
.\scripts\sync-images-from-prod.ps1 -RemoteHost 72.60.173.191 -User deploy -UseRsync
```

Sync only thumbs folder:

```powershell
.\scripts\sync-images-from-prod.ps1 -RemoteHost 72.60.173.191 -User deploy -RemotePath /var/www/html/La-Cuisine-Benson/public/images/thumbs -LocalPath .\public\images\thumbs -UseRsync
```

With an SSH key and non-default port:

```powershell
.\scripts\sync-images-from-prod.ps1 -RemoteHost 72.60.173.191 -User deploy -SshKey C:\Users\YOU\.ssh\id_rsa -Port 2222 -UseRsync
```

Single copy-paste command (DryRun) for PowerShell

Copy-paste this exact line into PowerShell (from repo root) to do a safe DryRun that prints the commands without transferring files:

```powershell
$SshKey = "$env:USERPROFILE\.ssh\id_ed25519"; & .\scripts\sync-images-from-prod.ps1 -RemoteHost '72.60.173.191' -User 'root' -UseRsync -SshKey $SshKey -DryRun
```

If it looks correct, re-run without `-DryRun` to perform the actual sync:

```powershell
$SshKey = "$env:USERPROFILE\.ssh\id_ed25519"; & .\scripts\sync-images-from-prod.ps1 -RemoteHost '72.60.173.191' -User 'root' -UseRsync -SshKey $SshKey
```

Notes about the script
- `-UseRsync` tells the script to use `rsync` if it exists on your machine.
- `-OnlyMissing` instructs rsync to skip files that already exist locally (rsync always avoids copying unchanged files by default; `--ignore-existing` further avoids overwriting).
- If rsync is not available the script will try to use `scp` as a fallback. `scp` will overwrite existing files.

2) Manual rsync (WSL or Linux/macOS)

If you have WSL installed on Windows or run macOS/Linux, rsync is the fastest option. Run this from a WSL shell or Linux host:

```bash
# from repo root (WSL)
rsync -avz --progress --ignore-existing -e 'ssh -p 22 -i ~/.ssh/id_rsa' deploy@72.60.173.191:/var/www/html/La-Cuisine-Benson/public/images/ ./public/images/
```

3) Manual scp (Windows PowerShell with OpenSSH)

```powershell
# copy everything (may overwrite)
scp -r -P 22 deploy@72.60.173.191:/var/www/html/La-Cuisine-Benson/public/images/* .\public\images\
```

4) Using WinSCP (GUI)
- Connect with SFTP/SSH to the server and download the `/var/www/html/La-Cuisine-Benson/public/images` folder into `public/images` locally.

5) After syncing
- You can browse and use the images locally. Do not `git add` or commit these files to your repo unless you intentionally want them in version control — prefer Git LFS only if necessary.
- If your app expects storage symlink (`storage/app/public` → `public/storage`), run:

```powershell
php artisan storage:link
```

6) Troubleshooting
- Permission errors: ensure your local filesystem user can read files. On Windows it's usually fine; on Linux/Docker you may need to chown or chmod.
- `rsync` not found: install it in WSL or use a native rsync build for Windows.
- SSH authentication: confirm the user and key work with `ssh user@host` before running rsync/scp.
- If you sync but images don't show in browser, clear your browser cache or any app caches.

7) Want automation?
- I can add `-ThumbsOnly`, `--dry-run`, or a selective scp mode to `scripts/sync-images-from-prod.ps1`.
- I can also add a CI target or Makefile entry to download images on demand.

Security & safety
- Always keep prod credentials and SSH keys secure. Do not store private keys in the repo.
- Avoid committing uploads to Git. If you must version some images, use Git LFS and a careful policy.

If you'd like, tell me which command you'd like me to run for you with your specific host/user/key and I can produce the exact command line to copy the files safely.
