<?php

use App\Support\Database\AppendOnlyTable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A15 — H §19 «سجل التدقيق» + «سجل أحداث أمنية منفصل».
 *
 * `audit_logs`: للكتابة فقط، بالحقول المنصوصة حرفياً — الفاعل، دوره، النطاق،
 * الإجراء، الكيان، القيمة قبل وبعد، IP، المتصفح، الوقت.
 *
 * `security_events`: سجل منفصل للدخول الفاشل وتغيير الصلاحيات وتغيير البيانات
 * البنكية وما يمسّ الأسرار.
 *
 * ملاحظة على المفاتيح الأجنبية: كلاهما `restrictOnDelete` وليس
 * `cascadeOnDelete`/`nullOnDelete` (على خلاف `activity_logs`) — لسببين:
 * حذف شركة يجب ألا يمحو سجل تدقيقها، و`SET NULL` نفسه عملية UPDATE يرفضها
 * الـ trigger فتفشل العملية كلها.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // الفاعل ودوره — «من فعلها» (عيب gap-analysis الأصلي).
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('actor_name')->nullable();
            $table->string('actor_role')->nullable();
            $table->string('actor_guard', 32)->nullable();

            // النطاق — الصلاحية تُقرأ دائماً مقرونة بالنطاق (H §4).
            $table->string('scope_type', 32)->default('platform');
            $table->unsignedBigInteger('scope_id')->nullable();

            // نطاق الشركة لعرض «الملخص المحدود» لمسؤول الحساب (H §19).
            $table->foreignId('company_id')->nullable()->constrained('companies')->restrictOnDelete();

            $table->string('action');
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();

            $table->json('before_values')->nullable();
            $table->json('after_values')->nullable();
            $table->text('reason')->nullable();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            // الجزء المالي من السجل يُحتفظ به 10 سنوات لا 24 شهراً (H §19).
            $table->boolean('is_financial')->default(false);

            $table->timestamp('created_at')->nullable();

            $table->index(['company_id', 'created_at']);
            $table->index(['action', 'created_at']);
            $table->index(['entity_type', 'entity_id']);
            $table->index(['actor_user_id', 'created_at']);
            $table->index(['is_financial', 'created_at']);
        });

        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            $table->string('event');
            $table->string('severity', 16)->default('info');

            $table->foreignId('actor_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('actor_name')->nullable();
            // المعرّف الذي حاول الدخول (بريد/جوال) حين لا يوجد مستخدم مطابق.
            $table->string('actor_identifier')->nullable();
            $table->string('guard', 32)->nullable();

            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->foreignId('company_id')->nullable()->constrained('companies')->restrictOnDelete();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('context')->nullable();

            $table->timestamp('created_at')->nullable();

            $table->index(['event', 'created_at']);
            $table->index(['severity', 'created_at']);
            $table->index(['actor_user_id', 'created_at']);
            $table->index(['ip_address', 'created_at']);
        });

        AppendOnlyTable::protect('audit_logs', 'audit_logs is append-only (H 19)');
        AppendOnlyTable::protect('security_events', 'security_events is append-only (H 19)');
    }

    public function down(): void
    {
        AppendOnlyTable::unprotect('audit_logs');
        AppendOnlyTable::unprotect('security_events');

        Schema::dropIfExists('security_events');
        Schema::dropIfExists('audit_logs');
    }
};
