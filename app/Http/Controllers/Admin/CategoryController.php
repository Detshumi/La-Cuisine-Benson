<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::with('options')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string',
            'name_fr' => 'required|string',
        ]);

        // If a category exists with the same name in either language (case-insensitive), update it instead of creating a duplicate
        $category = Category::whereRaw('LOWER(name_en) = ?', [strtolower($data['name_en'])])
            ->orWhereRaw('LOWER(name_fr) = ?', [strtolower($data['name_fr'])])
            ->first();
        if ($category) {
            $category->update($data);
            if ($request->expectsJson()) {
                return response()->json($category->load('options'));
            }
            return redirect()->route('admin.lookups.index')->with('success', 'Category updated');
        }

        try {
            $category = Category::create($data);
            if ($request->expectsJson()) {
                return response()->json($category->load('options'), 201);
            }
            return redirect()->route('admin.lookups.index')->with('success', 'Category created');
        } catch (\Illuminate\Database\QueryException $e) {
            // likely a unique constraint violation
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Category could not be created (possible duplicate)'], 422);
            }
            return redirect()->route('admin.lookups.index')->with('error', 'Category could not be created (possible duplicate)');
        }
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        // detach relations first (if any)
        if (method_exists($category, 'options')) {
            $category->options()->detach();
        }
        $category->delete();

        return response()->json(['message' => 'Category deleted'], 200);
    }

    /**
     * Detach an option from this category without deleting the option entity.
     */
    public function removeOption($categoryId, $optionId)
    {
        $category = Category::findOrFail($categoryId);
        // detach the option
        $category->options()->detach((int) $optionId);
        return response()->json(['message' => 'Option detached from category'], 200);
    }
}
