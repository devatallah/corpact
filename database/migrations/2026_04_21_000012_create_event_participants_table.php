<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['joined', 'waitlisted', 'cancelled'])->default('joined');
            $table->timestamp('joined_at')->useCurrent();
            $table->unique(['event_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_participants');
    }
};
