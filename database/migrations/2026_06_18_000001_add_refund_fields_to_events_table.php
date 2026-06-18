<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->unsignedTinyInteger('refund_percentage')->nullable()->after('rejection_reason');
            $table->decimal('refund_amount', 10, 2)->nullable()->after('refund_percentage');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['refund_percentage', 'refund_amount']);
        });
    }
};
