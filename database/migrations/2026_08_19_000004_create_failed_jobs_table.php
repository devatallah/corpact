<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // H §20: بعد 3 محاولات تنتقل المهمة الفاشلة إلى قائمة فشل مرئية —
        // config/queue.php يشير أصلاً إلى failed_jobs لكن الجدول لم يكن موجوداً.
        // Guarded: 2026_08_19_000001_create_failed_jobs_and_job_batches_tables
        // (A0 ops baseline) creates the identical table earlier in the run.
        if (Schema::hasTable('failed_jobs')) {
            return;
        }

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_jobs');
    }
};
