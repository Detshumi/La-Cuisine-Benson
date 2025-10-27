<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('customer_id')->nullable()->index();
            $table->decimal('total', 12, 2)->default(0);
            $table->string('status')->default('pending');
            $table->timestamp('placed_at')->nullable();
            $table->timestamp('create_date')->useCurrent();
            $table->timestamp('delete_date')->nullable();

            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
