<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_alternatives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->date('proposed_date');
            $table->time('proposed_start_time');
            $table->time('proposed_end_time');
            $table->unsignedInteger('proposed_venues_count')->nullable();
            $table->decimal('proposed_amount', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['proposed', 'accepted', 'rejected'])->default('proposed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_alternatives');
    }
};
