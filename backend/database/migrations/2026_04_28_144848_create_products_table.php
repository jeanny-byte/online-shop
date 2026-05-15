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
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->text('image')->nullable();
            $table->longText('images')->nullable();
            $table->string('category');
            $table->string('brands');
            $table->boolean('featured')->default(false);
            $table->text('benefits')->nullable();
            $table->text('ingredients')->nullable();
            $table->text('how_to_use');
            $table->integer('stock_quantity')->default(0);
            $table->timestamps();

            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
