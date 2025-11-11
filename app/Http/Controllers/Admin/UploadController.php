<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Modifiers\CoverModifier;
use Intervention\Image\Encoders\JpegEncoder;

class UploadController extends Controller
{
    public function image(Request $request)
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:10240'],
        ]);

        $file = $request->file('image');

        try {
            // store original with a unique name
            $name = time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $path = 'images/'.$name;

            // Decide where to store uploads:
            // - If UPLOAD_TO_PUBLIC=true, write directly to public/images (convenient for local dev)
            // - Otherwise, write to storage disk 'public' (preferred for production to avoid committing uploads)
            // env() returns strings from .env; use FILTER_VALIDATE_BOOLEAN (an int) to coerce truthy values
            $uploadToPublic = filter_var(env('UPLOAD_TO_PUBLIC', env('APP_ENV') === 'local' ? 'true' : 'false'), FILTER_VALIDATE_BOOLEAN);

            $tmpPath = $file->getPathname();
            if ($uploadToPublic) {
                $publicDir = public_path('images');
                if (!is_dir($publicDir)) { @mkdir($publicDir, 0755, true); }
                try {
                    $file->move($publicDir, $name);
                    $publicPath = $publicDir . DIRECTORY_SEPARATOR . $name;
                } catch (\Exception $e) {
                    // fallback to copy
                    $publicPath = $publicDir . DIRECTORY_SEPARATOR . $name;
                    @copy($tmpPath, $publicPath);
                }
                $disk = null;
            } else {
                $disk = Storage::disk('public');
                $disk->putFileAs('images', $file, $name);
            }

            // choose the correct source path for thumbnailing:
            // if we moved the uploaded file into public, read from that location;
            // otherwise read from the temp uploaded file path
            $sourcePath = $uploadToPublic ? ($publicPath ?? $tmpPath) : $tmpPath;

            // create thumbnail (square cover 400x400) using Intervention Image v3 API
            $manager = ImageManager::gd();
            // read from the temp path
            $img = $manager->read($sourcePath);

            // make a cover/cropped thumbnail
            $img->modify(new CoverModifier(400, 400, 'center'));

            // encode to jpeg with quality 80
            $thumbEncoded = $img->encode(new JpegEncoder(80));

            $thumbName = pathinfo($name, PATHINFO_FILENAME) . '_thumb.jpg';
            $thumbPath = 'images/thumbs/'.$thumbName;

            // store thumbnail according to target
            if ($uploadToPublic) {
                $publicThumbDir = public_path('images/thumbs');
                if (!is_dir($publicThumbDir)) { @mkdir($publicThumbDir, 0755, true); }
                $publicThumbPath = $publicThumbDir . DIRECTORY_SEPARATOR . $thumbName;
                @file_put_contents($publicThumbPath, (string) $thumbEncoded);
            } else {
                $disk->put($thumbPath, (string) $thumbEncoded);
            }

            // Build public-facing URLs
            if ($uploadToPublic) {
                $publicUrl = asset('images/' . $name);
                $publicThumbUrl = asset('images/thumbs/' . $thumbName);
            } else {
                // storage disk URLs (requires php artisan storage:link)
                $publicUrl = $disk->url($path);
                $publicThumbUrl = $disk->url($thumbPath);
            }

            return response()->json([
                'url' => $publicUrl,
                'thumb' => $publicThumbUrl,
                // keep internal storage paths too for debugging if needed
                'path' => $path,
                'thumb_path' => $thumbPath,
                'public_path' => $publicPath ?? null,
                'public_thumb_path' => $publicThumbPath ?? null,
            ], 200);

        } catch (\Exception $e) {
            // log and return 500 JSON for the frontend
            logger()->error('UploadController:image error', ['exception' => $e]);
            return response()->json(['message' => 'Upload failed', 'error' => $e->getMessage()], 500);
        }
    }
}
