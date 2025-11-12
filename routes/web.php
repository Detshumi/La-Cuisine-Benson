<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

// Small JSON-only endpoint to return a fresh CSRF token.
// Used by frontend uploaders to refresh token on 419 responses.
Route::get('/csrf-token', function (Request $request) {
    return response()->json(['token' => csrf_token()]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Admin lookup routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('lookups', [App\Http\Controllers\Admin\LookupController::class, 'index'])->name('lookups.index');
        Route::get('products', [App\Http\Controllers\Admin\ProductController::class, 'index'])->name('products.index');
        Route::post('products', [App\Http\Controllers\Admin\ProductController::class, 'store'])->name('products.store');

        // CRUD endpoints used by lookups page
        Route::post('options', [App\Http\Controllers\Admin\OptionController::class, 'store'])->name('options.store');
        Route::get('options', [App\Http\Controllers\Admin\OptionController::class, 'index'])->name('options.index');
    Route::delete('options/{id}', [App\Http\Controllers\Admin\OptionController::class, 'destroy'])->name('options.destroy');
        // Image upload endpoint used by admin UIs
        Route::post('uploads/image', [App\Http\Controllers\Admin\UploadController::class, 'image'])->name('uploads.image');
    // Remove thumbnail for an option (delete files and clear DB value)
    Route::delete('options/{id}/thumbnail', [App\Http\Controllers\Admin\OptionController::class, 'removeThumbnail'])->name('options.thumbnail.remove');
        Route::post('categories', [App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('categories.store');
        Route::get('categories', [App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('categories.index');
    Route::delete('categories/{id}', [App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('categories.destroy');
        // Detach an option from a category without deleting the option
        Route::delete('categories/{category}/options/{option}', [App\Http\Controllers\Admin\CategoryController::class, 'removeOption'])->name('categories.options.remove');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
