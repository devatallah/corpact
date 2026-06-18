<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->timestamp('budget_deducted_at')->nullable()->after('status');
            $table->timestamp('payment_deadline')->nullable()->after('budget_deducted_at');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['budget_deducted_at', 'payment_deadline']);
        });
    }
};
