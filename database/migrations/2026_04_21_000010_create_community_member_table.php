<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_member', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['member', 'captain'])->default('member');
            $table->timestamp('joined_at')->useCurrent();
            $table->unique(['community_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_member');
    }
};
