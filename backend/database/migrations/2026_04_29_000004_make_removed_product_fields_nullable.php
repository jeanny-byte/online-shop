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
        Schema::table('products', function (Blueprint $table) {
            $table->string('brands')->nullable()->change();
            $table->text('how_to_use')->nullable()->change();
            $table->text('benefits')->nullable()->change();
            $table->text('ingredients')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('brands')->nullable(false)->change();
            $table->text('how_to_use')->nullable(false)->change();
        });
    }
};
