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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_reference')->nullable()->after('payment_method');
            $table->string('payment_status')->default('unpaid')->after('payment_reference');
            $table->timestamp('paid_at')->nullable()->after('payment_status');
            $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete()->after('tracking_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['driver_id']);
            $table->dropColumn(['payment_reference', 'payment_status', 'paid_at', 'driver_id']);
        });
    }
};
