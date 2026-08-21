<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // H §20: كل مهمة idempotent بمفتاح (الكيان + المهمة + الفترة) — تشغيلها مرتين لا ينتج أثراً مزدوجاً.
        // الصفوف ذات entity_type = null هي «نبضات» (heartbeats) تسجلها المهام المجدولة عند كل تشغيل،
        // ويقرأها الـ watchdog — الصمت ليس دليل نجاح.
        Schema::create('job_runs', function (Blueprint $table) {
            $table->id();
            $table->string('job');
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('period');
            $table->enum('status', ['running', 'completed', 'failed'])->default('running');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();

            $table->unique(['job', 'entity_type', 'entity_id', 'period'], 'job_runs_idempotency_key');
            $table->index(['job', 'started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_runs');
    }
};
