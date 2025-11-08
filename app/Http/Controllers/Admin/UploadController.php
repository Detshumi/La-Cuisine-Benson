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
            $disk = Storage::disk('public');

            // store original with a unique name
            $name = time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $path = 'images/'.$name;
            // store in storage disk (public)
            $disk->putFileAs('images', $file, $name);

            // also copy into the repo's public/images folder so it can be committed/pushed
            $publicDir = public_path('images');
            if (!is_dir($publicDir)) {
                @mkdir($publicDir, 0755, true);
            }
            $publicPath = $publicDir.DIRECTORY_SEPARATOR.$name;
            // prefer copying from the storage disk file (it may have been moved from the tmp path)
            $storedFullPath = storage_path('app/public/' . $path);
            if (file_exists($storedFullPath)) {
                @copy($storedFullPath, $publicPath);
            } elseif (file_exists($file->getPathname())) {
                @copy($file->getPathname(), $publicPath);
            }

            // create thumbnail (square cover 400x400) using Intervention Image v3 API
            $manager = ImageManager::gd();
            $img = $manager->read($file->getPathname());

            // make a cover/cropped thumbnail
            $img->modify(new CoverModifier(400, 400, 'center'));

            // encode to jpeg with quality 80
            $thumbEncoded = $img->encode(new JpegEncoder(80));

            $thumbName = pathinfo($name, PATHINFO_FILENAME) . '_thumb.jpg';
            $thumbPath = 'images/thumbs/'.$thumbName;
            // ensure storage/thumbs dir exists
            $disk->put($thumbPath, (string) $thumbEncoded);

            // also save thumbnail into public/images/thumbs for repo
            $publicThumbDir = public_path('images/thumbs');
            if (!is_dir($publicThumbDir)) {
                @mkdir($publicThumbDir, 0755, true);
            }
            $publicThumbPath = $publicThumbDir.DIRECTORY_SEPARATOR.$thumbName;
            @file_put_contents($publicThumbPath, (string) $thumbEncoded);

            // build public URLs
            // Public URLs that point to files inside the repo's public/images so you can commit them
            $url = '/images/'.$name;
            $thumbUrl = '/images/thumbs/'.$thumbName;

            return response()->json([
                'url' => $url,
                'thumb' => $thumbUrl,
                'path' => $path,
                'thumb_path' => $thumbPath,
            ], 200);

        } catch (\Exception $e) {
            // log and return 500 JSON for the frontend
            logger()->error('UploadController:image error', ['exception' => $e]);
            return response()->json(['message' => 'Upload failed', 'error' => $e->getMessage()], 500);
        }
    }
}
