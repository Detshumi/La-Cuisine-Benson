<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->increments('id');
            $table->text('name_en')->nullable();
            $table->text('name_fr')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->text('description_en')->nullable();
            $table->text('description_fr')->nullable();
            $table->text('thumbnail')->nullable();
            $table->integer('stock')->default(0);
            $table->timestamp('create_date')->useCurrent();
            $table->timestamp('delete_date')->nullable();
        });

        Schema::create('options', function (Blueprint $table) {
            $table->increments('id');
            $table->text('name_en')->nullable();
            $table->text('name_fr')->nullable();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->increments('id');
            $table->text('name_en')->nullable();
            $table->text('name_fr')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_fr')->nullable();
            $table->text('thumbnail')->nullable();
        });

        Schema::create('product_options', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('product_id');
            $table->unsignedInteger('option_id');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('option_id')->references('id')->on('options')->onDelete('cascade');
            $table->unique(['product_id', 'option_id']);
        });

        Schema::create('product_categories', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('product_id');
            $table->unsignedInteger('category_id');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->unique(['product_id', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_categories');
        Schema::dropIfExists('product_options');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('options');
        Schema::dropIfExists('products');
    }
};
