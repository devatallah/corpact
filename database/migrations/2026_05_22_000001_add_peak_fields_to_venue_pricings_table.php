<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('venue_pricings', function (Blueprint $table) {
            $table->boolean('is_peak')->default(false)->after('price');
            $table->string('label')->nullable()->after('is_peak');
            $table->time('start_time')->nullable()->after('label');
            $table->time('end_time')->nullable()->after('start_time');
            $table->json('days')->nullable()->after('end_time');
        });
    }

    public function down(): void
    {
        Schema::table('venue_pricings', function (Blueprint $table) {
            $table->dropColumn(['is_peak', 'label', 'start_time', 'end_time', 'days']);
        });
    }
};
