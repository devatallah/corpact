<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('club_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('court_pricing_id')->nullable()->constrained('court_pricings')->nullOnDelete();
            $table->foreignId('sport_id')->constrained();
            $table->foreignId('created_by')->constrained('employees');
            $table->string('title')->nullable();
            $table->date('event_date');
            $table->time('start_time');
            $table->unsignedInteger('duration_minutes');
            $table->unsignedInteger('courts_count')->default(1);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->unsignedInteger('capacity');
            $table->unsignedInteger('participants_count')->default(0);
            $table->decimal('cost_per_person', 8, 2)->default(0);
            $table->decimal('company_subsidy', 8, 2)->default(0);
            $table->decimal('community_contribution', 8, 2)->default(0);
            $table->decimal('player_payment', 8, 2)->default(0);
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->enum('status', ['open', 'full', 'waiting_club', 'confirmed', 'rejected', 'alternative_proposed', 'completed', 'cancelled'])->default('open');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
