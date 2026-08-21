<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A4 — Company settings (H §5, configurable by the account manager) with the
 * spec defaults:
 *
 * - employee_can_create_event: off — proposals need leader/coordinator approval
 * - default_funding_mode: mixed (مختلط) — inherited by new events, overridable
 *   per template/event (funding engine itself is A10)
 * - default_subsidy: 0 halalas — community-wallet share of each event
 * - registration_close_hours: 24 — hours before start when registration closes
 * - allow_absence_marking: on — leader may edit the attendance list after completion
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('employee_can_create_event')->default(false);
            // محفظة المجتمع | دفع الموظف | مختلط
            $table->enum('default_funding_mode', ['community_wallet', 'employee_paid', 'mixed'])->default('mixed');
            // بالهللة (H §21) — قيمة الدعم الافتراضية من محفظة المجتمع.
            $table->unsignedInteger('default_subsidy')->default(0);
            $table->unsignedSmallInteger('registration_close_hours')->default(24);
            $table->boolean('allow_absence_marking')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
