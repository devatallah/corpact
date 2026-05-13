<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leagues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('employees')->cascadeOnDelete();
            $table->string('name');
            $table->enum('format', ['single_round_robin', 'double_round_robin', 'knockout']);
            $table->enum('status', ['active', 'completed'])->default('active');
            $table->timestamps();
        });

        Schema::create('league_departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('seed_order')->default(0);
            $table->unique(['league_id', 'department_id']);
        });

        Schema::create('league_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_a_id')->nullable()->constrained('departments');
            $table->foreignId('department_b_id')->nullable()->constrained('departments');
            $table->unsignedSmallInteger('score_a')->nullable();
            $table->unsignedSmallInteger('score_b')->nullable();
            $table->unsignedSmallInteger('round')->default(1);
            $table->unsignedSmallInteger('match_number')->default(1);
            $table->string('round_label')->nullable();
            $table->boolean('is_third_place')->default(false);
            $table->enum('status', ['pending', 'played'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('league_matches');
        Schema::dropIfExists('league_departments');
        Schema::dropIfExists('leagues');
    }
};
