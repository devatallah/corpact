<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('league_matches', function (Blueprint $table) {
            $table->unsignedSmallInteger('penalty_a')->nullable()->after('score_b');
            $table->unsignedSmallInteger('penalty_b')->nullable()->after('penalty_a');
        });
    }

    public function down(): void
    {
        Schema::table('league_matches', function (Blueprint $table) {
            $table->dropColumn(['penalty_a', 'penalty_b']);
        });
    }
};
