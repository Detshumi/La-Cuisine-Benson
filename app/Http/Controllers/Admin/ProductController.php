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
        $categories = Category::all();
        $options = Option::all();

        return Inertia::render('admin/products', compact('products', 'categories', 'options'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_fr' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'price' => 'nullable|numeric',
        ]);

        $product = Product::create($data);

        return redirect()->route('admin.products.index');
    }

    public function storeOption(Request $request, Product $product)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_fr' => 'nullable|string|max:255',
            'price' => 'nullable|numeric',
            'extra_price' => 'nullable|numeric',
        ]);

        $option = Option::create([
            'name_en' => $data['name_en'],
            'name_fr' => $data['name_fr'] ?? null,
            'price' => $data['price'] ?? null,
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
