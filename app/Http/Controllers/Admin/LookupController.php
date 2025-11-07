<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Option;
use App\Models\Category;
use Inertia\Inertia;
use Illuminate\Support\Facades\Lang;

class LookupController extends Controller
{
    public function index()
    {
        $options = Option::all();
        $categories = Category::all();

        $trans = [
            'options' => Lang::get('lookups.options'),
            'options_description' => Lang::get('lookups.options_description'),
            'categories' => Lang::get('lookups.categories'),
            'categories_description' => Lang::get('lookups.categories_description'),
            'fields' => [
                'name_en' => Lang::get('lookups.name_en'),
                'name_fr' => Lang::get('lookups.name_fr'),
                // option descriptions moved to options; categories no longer have descriptions/thumbnail
                'description_en' => Lang::get('lookups.description_en'),
                'description_fr' => Lang::get('lookups.description_fr'),
            ],
            'actions' => [
                'add_option' => Lang::get('lookups.add_option'),
                'add_category' => Lang::get('lookups.add_category'),
            ],
            'messages' => [
                'option_added' => Lang::get('lookups.option_added'),
                'category_added' => Lang::get('lookups.category_added'),
                'option_failed' => Lang::get('lookups.option_failed'),
                'category_failed' => Lang::get('lookups.category_failed'),
            ],
            'no_options' => Lang::get('lookups.no_options'),
            'no_categories' => Lang::get('lookups.no_categories'),
            'success' => Lang::get('lookups.success'),
            'error' => Lang::get('lookups.error'),
        ];

        // Pass the active application locale so the front-end can render a single language at a time
        $locale = app()->getLocale();

        return Inertia::render('admin/Lookups/Index', [
            'options' => $options,
            'categories' => $categories,
            'trans' => $trans,
            'locale' => $locale,
        ]);
    }
}
