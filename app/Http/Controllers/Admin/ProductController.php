<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Option;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['categories', 'options'])->get();
        // eager-load options by category so the frontend can filter options per category
        $categories = Category::with('options')->get();

        return Inertia::render('admin/Products/Index', compact('products', 'categories'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_fr' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'options' => 'nullable|array',
            'categories' => 'nullable|array',
        ]);

        $product = Product::create($data);

        if (!empty($data['options'])) {
            $optionIds = array_filter($data['options'], fn($v) => is_numeric($v));
            if (!empty($optionIds)) $product->options()->attach($optionIds);
        }

        if (!empty($data['categories'])) {
            $categoryIds = array_filter($data['categories'], fn($v) => is_numeric($v));
            if (!empty($categoryIds)) $product->categories()->attach($categoryIds);
        }

        return redirect()->route('admin.products.index')->with('success', 'Product created');
    }

    // helpers to create new option/category and attach to a product (optional)
    public function storeOption(Request $request, Product $product)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_fr' => 'nullable|string|max:255',
            'extra_price' => 'nullable|numeric',
        ]);

        $option = Option::create([
            'name_en' => $data['name_en'],
            'name_fr' => $data['name_fr'] ?? null,
        ]);

        $product->options()->attach($option->id, ['extra_price' => $data['extra_price'] ?? 0]);

        return redirect()->route('admin.products.index');
    }

    public function storeCategory(Request $request, Product $product)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_fr' => 'nullable|string|max:255',
        ]);

        $category = Category::create([
            'name_en' => $data['name_en'],
            'name_fr' => $data['name_fr'] ?? null,
        ]);

        $product->categories()->attach($category->id);

        return redirect()->route('admin.products.index');
    }
}
