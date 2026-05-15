<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('store_name')->default('Nelysah');
            $table->string('store_email')->nullable();
            $table->string('store_phone')->nullable();
            $table->text('store_address')->nullable();
            $table->string('logo_url')->nullable();
            $table->boolean('newsletter_enabled')->default(true);
            $table->string('newsletter_title')->nullable();
            $table->text('newsletter_description')->nullable();
            $table->string('currency')->default('GHS');
            $table->decimal('shipping_fee', 10, 2)->default(0);
            $table->timestamps();
        });

        // Insert default settings
        DB::table('store_settings')->insert([
            'store_name' => 'Nelysah Royal Care',
            'store_email' => 'info@nelysah.com',
            'store_phone' => '+233 55 724 6424',
            'newsletter_title' => 'Join Our Newsletter',
            'newsletter_description' => 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
