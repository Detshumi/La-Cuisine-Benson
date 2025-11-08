<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OptionController extends Controller
{
    public function index()
    {
        return response()->json(Option::with('categories')->get());
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string',
            'name_fr' => 'required|string',
            'description_en' => 'required|string',
            'description_fr' => 'required|string',
            'thumbnail' => 'required|string',
            'category_id' => 'required|numeric|exists:categories,id',
        ]);

        // If an option exists with the same name in either language (case-insensitive), update it and attach the category instead of creating a duplicate
        $option = Option::whereRaw('LOWER(name_en) = ?', [strtolower($data['name_en'])])
            ->orWhereRaw('LOWER(name_fr) = ?', [strtolower($data['name_fr'])])
            ->first();
        if ($option) {
            $option->update($data);
            // attach to category if not already attached
            if (!$option->categories()->where('categories.id', (int)$data['category_id'])->exists()) {
                $option->categories()->attach((int) $data['category_id']);
            }
            return redirect()->route('admin.lookups.index')->with('success', 'Option updated');
        }

        try {
            $option = Option::create($data);
            // Attach to the provided category
            $option->categories()->attach((int) $data['category_id']);
            return redirect()->route('admin.lookups.index')->with('success', 'Option created');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->route('admin.lookups.index')->with('error', 'Option could not be created (possible duplicate)');
        }
    }

    public function destroy($id)
    {
        $option = Option::findOrFail($id);
        if (method_exists($option, 'categories')) {
            $option->categories()->detach();
        }
        $option->delete();
        return response()->json(['message' => 'Option deleted'], 200);
    }

    /**
     * Remove the thumbnail files for an option and clear DB value.
     */
    public function removeThumbnail($id)
    {
        $option = Option::findOrFail($id);
        $thumb = $option->thumbnail;
        if (!$thumb) {
            return response()->json(['message' => 'No thumbnail'], 200);
        }

        // determine storage and public paths
        // thumbnail may be stored as '/images/name.jpg' or 'images/name.jpg'
        $rel = ltrim($thumb, '/');

        // delete from storage disk public if present
        try {
            if (Storage::disk('public')->exists($rel)) {
                Storage::disk('public')->delete($rel);
            }
        } catch (\Exception $e) {
            // ignore file deletion errors
        }

        // delete from public/images working tree
        $publicPath = public_path($rel);
        if (file_exists($publicPath)) {
            @unlink($publicPath);
        }

        // also attempt to delete thumbs sibling if applicable
        $thumbPath = dirname($rel) . '/thumbs/' . pathinfo($rel, PATHINFO_FILENAME) . '_thumb.jpg';
        if (Storage::disk('public')->exists($thumbPath)) {
            Storage::disk('public')->delete($thumbPath);
        }
        $publicThumb = public_path(dirname($rel) . '/thumbs/' . pathinfo($rel, PATHINFO_FILENAME) . '_thumb.jpg');
        if (file_exists($publicThumb)) {
            @unlink($publicThumb);
        }

        // clear DB value
        $option->thumbnail = '';
        $option->save();

        return response()->json(['message' => 'Thumbnail removed'], 200);
    }
}
