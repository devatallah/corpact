<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A10 — جداول التحصيل وبوابة الدفع (H §12.3 / §12.6):
 *
 * - `payment_intents`: مطالبة دفع واحدة لكل مشارك محجوز عند إغلاق التسجيل —
 *   المبلغ حصة مقفلة بالهللة (شاملة الضريبة ومفكَّكة أساساً وضريبةً)، مفتاح
 *   تفرّد لكل مطالبة (القاعدة 5: لا تحصيل مرتين)، ونافذة دفع. لا محفظة
 *   نقدية للموظف — الاسترداد لوسيلة الدفع الأصلية حصراً، وطابور فشل
 *   الاسترداد بأعمدته هنا (مرئي للأدمن المالي + إعادة محاولة آلية).
 * - `gateway_transactions`: أثر كل نداء بوابة (دفعة/استرداد) — سجل مال
 *   الموظفين المقابل لدفتر المحافظ، append-only بالعرف، والاسترداد صف
 *   مرتبط بصف الدفعة (تصحيح بحركة عكسية لا بالحذف).
 * - `payment_webhooks`: كل ويبهوك يُخزَّن خاماً (الحمولة + التوقيع + مفتاح
 *   التفرّد + حالة المعالجة) **قبل** معالجته (H §12.6)؛ المكرر يُتجاهل
 *   بالمفتاح ولا يُنشئ قيداً ثانياً.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_intents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->restrictOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->restrictOnDelete();
            $table->foreignId('company_id')->nullable()->constrained('companies')->restrictOnDelete();

            $table->unsignedBigInteger('amount_halalas');
            $table->unsignedBigInteger('base_amount_halalas');
            $table->unsignedBigInteger('vat_amount_halalas');
            $table->char('currency', 3)->default('SAR');

            // pending | paid | expired | cancelled | refunded
            $table->string('status', 20)->default('pending');

            $table->string('gateway', 40)->nullable();
            $table->string('gateway_reference')->nullable()->index();
            $table->string('idempotency_key')->unique();

            $table->dateTime('expires_at');
            $table->dateTime('paid_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();

            // طابور فشل الاسترداد (H §12.4): none | pending | failed | refunded
            $table->string('refund_status', 20)->default('none');
            $table->string('refund_reason')->nullable();
            $table->string('refund_idempotency_key')->nullable();
            $table->unsignedInteger('refund_attempts')->default(0);
            $table->text('refund_last_error')->nullable();
            $table->dateTime('refunded_at')->nullable();

            $table->timestamps();

            // مطالبة واحدة لكل مشارك في الفعالية — حارس «لا تحصيل مرتين» على
            // مستوى المخطط فوق مفتاح التفرّد.
            $table->unique(['event_id', 'employee_id']);
            $table->index(['status', 'expires_at']);
            $table->index(['refund_status']);
        });

        Schema::create('gateway_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_intent_id')->constrained('payment_intents')->restrictOnDelete();
            $table->string('type', 20); // payment | refund
            $table->string('gateway', 40);
            $table->string('gateway_reference')->nullable()->index();
            $table->unsignedBigInteger('amount_halalas');
            $table->string('status', 20)->default('initiated'); // initiated | succeeded | failed
            $table->string('idempotency_key')->unique();
            // الاسترداد صف مرتبط بصف الدفعة الأصلي — التصحيح بحركة عكسية
            $table->foreignId('related_transaction_id')->nullable()->constrained('gateway_transactions')->restrictOnDelete();
            $table->json('payload')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();

            $table->index(['type', 'status']);
        });

        Schema::create('payment_webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('gateway', 40);
            $table->string('event_type', 40)->nullable();
            $table->string('gateway_reference')->nullable()->index();
            $table->string('idempotency_key')->nullable()->index();
            $table->longText('payload');          // الحمولة الخام كما وصلت
            $table->text('signature')->nullable(); // التوقيع كما وصل
            // received | processed | duplicate | invalid | failed
            $table->string('processing_status', 20)->default('received');
            $table->foreignId('payment_intent_id')->nullable()->constrained('payment_intents')->nullOnDelete();
            $table->dateTime('processed_at')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();

            $table->index(['gateway', 'processing_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_webhooks');
        Schema::dropIfExists('gateway_transactions');
        Schema::dropIfExists('payment_intents');
    }
};
