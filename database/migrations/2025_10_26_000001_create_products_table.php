<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('sku')->nullable()->unique();
            $table->string('name_en');
            $table->string('name_fr')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_fr')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('thumbnail')->nullable();
            $table->string('image')->nullable();
            $table->timestamp('create_date')->useCurrent();
            $table->timestamp('delete_date')->nullable();
            $table->integer('stock')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
