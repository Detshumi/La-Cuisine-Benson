Upload storage configuration

This project supports two upload targets controlled by the `UPLOAD_TO_PUBLIC` environment flag.

- `UPLOAD_TO_PUBLIC=true` (recommended for local development)
  - Files are written directly to `public/images` and thumbnails to `public/images/thumbs`.
  - Useful when you want to inspect uploaded images quickly without creating storage symlinks.

- `UPLOAD_TO_PUBLIC=false` (recommended for production)
  - Files are written to `storage/app/public/images` and thumbnails to `storage/app/public/images/thumbs`.
  - The app exposes those files via the `public/storage` symlink. Run `php artisan storage:link` on the server to create it.

How to switch

1. Edit `.env` and set `UPLOAD_TO_PUBLIC=true` or `UPLOAD_TO_PUBLIC=false` in the appropriate environment block.
2. Run the following to refresh Laravel configuration and cache:

```powershell
php artisan config:clear
php artisan cache:clear
```

Notes

- Avoid committing uploaded files to git. If you use `public/images` locally, consider adding that folder to `.gitignore`.
- In production, prefer `UPLOAD_TO_PUBLIC=false` and rely on `php artisan storage:link` to avoid duplicating files in `public/`.
