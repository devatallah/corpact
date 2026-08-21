<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A15:
 *
 * - `platform_settings` (H §21 «settings»): العتبات والمهل على مستوى المنصة —
 *   ومنها مهلة قائمة الانتظار التي وضعها A7 في `config/events.php` بانتظار
 *   واجهة إدارتها (H §16 «الإعدادات»، G أدمن تيمات §4).
 * - `permission_reviews` (H §19): «مراجعة صلاحيات ربع سنوية **موثَّقة**».
 * - `attendance_aggregates` (H §19): «سجلات الحضور والنتائج: 24 شهراً ثم
 *   تجميع إحصائي وإخفاء هوية» — اللقطة الإحصائية التي تبقى بعد إخفاء الهوية.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('permission_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('period', 16);                 // 2026-Q3
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reviewed_by_name')->nullable();
            $table->unsignedInteger('assignments_reviewed')->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('reviewed_at');
            $table->timestamps();

            $table->unique('period');
        });

        Schema::create('attendance_aggregates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('community_id')->nullable()->constrained('communities')->nullOnDelete();
            $table->string('period', 7);                  // YYYY-MM
            $table->unsignedInteger('events_count')->default(0);
            $table->unsignedInteger('attended_count')->default(0);
            $table->unsignedInteger('absent_count')->default(0);
            $table->unsignedInteger('distinct_participants')->default(0);
            $table->unsignedInteger('results_count')->default(0);
            $table->timestamp('anonymized_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'community_id', 'period'], 'attendance_aggregates_scope_period');
        });

        // H §19: «الحذف يتم بإخفاء الهوية لا بحذف السجل المالي» — الطابع الذي
        // يمنع إعادة معالجة صف مُخفى الهوية ويجعل المسار قابلاً للتدقيق.
        Schema::table('employees', function (Blueprint $table) {
            $table->timestamp('anonymized_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('anonymized_at');
        });

        Schema::dropIfExists('attendance_aggregates');
        Schema::dropIfExists('permission_reviews');
        Schema::dropIfExists('platform_settings');
    }
};
