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
        Schema::dropIfExists('quick_match_interests');

        Schema::table('quick_matches', function (Blueprint $table) {
            $table->dropColumn(['preferred_date', 'preferred_time']);
        });

        Schema::create('quick_match_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quick_match_id')->constrained('quick_matches')->cascadeOnDelete();
            $table->date('date');
            $table->time('time');
            $table->unsignedInteger('votes_count')->default(0);
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('quick_match_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quick_match_id')->constrained('quick_matches')->cascadeOnDelete();
            $table->foreignId('option_id')->constrained('quick_match_options')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['quick_match_id', 'employee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quick_match_votes');
        Schema::dropIfExists('quick_match_options');

        Schema::table('quick_matches', function (Blueprint $table) {
            $table->date('preferred_date')->nullable()->after('created_by');
            $table->time('preferred_time')->nullable()->after('preferred_date');
        });

        Schema::create('quick_match_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quick_match_id')->constrained('quick_matches')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['quick_match_id', 'employee_id']);
        });
    }
};
