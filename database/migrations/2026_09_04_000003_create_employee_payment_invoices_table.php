<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * المستند الضريبي لحصة الموظف (H §12.6 + §12.9).
 *
 * جدول مستقل عن `platform_fee_invoices`: ذاك رسوم النظام على الشركة وتيمات
 * فيه أصيل، وهذا قيمة النشاط والمصفوفة الضريبية تصنّفها **وكالة** والمُصدِر
 * فيها المزوّد. خلطهما في سلسلة واحدة يخلط بائعَين ومعالجتين ضريبيتين في
 * ترقيم واحد.
 *
 * البائع لا يُكتب هنا ثابتاً: يُشتق من `billing.tax.activity_value.issuer`
 * لحظة الإصدار ويُجمَّد على الصف. فإن غُيّر التصنيف لاحقاً لم تُعَد كتابة
 * مستند صدر سلفاً.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_payment_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_intent_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('partner_id')->nullable()->constrained()->nullOnDelete();

            // الترقيم متسلسل ومتفرّد — لا فجوة ولا تكرار في سلسلة ضريبية.
            $table->unsignedBigInteger('serial_sequence')->unique();
            $table->string('serial')->unique();
            $table->uuid('invoice_uuid')->unique();

            // `provisional` ما دام `real_invoices_enabled` مطفأً: يُحسب ويُعرض
            // ولا يُقدَّم مستنداً ضريبياً نهائياً.
            $table->string('issuance_mode', 20)->default('provisional');
            $table->string('tax_treatment', 20);
            $table->string('invoice_issuer', 20);

            $table->string('seller_name')->nullable();
            $table->string('seller_vat_number')->nullable();
            $table->string('buyer_name')->nullable();

            $table->unsignedBigInteger('subtotal_halalas');
            $table->unsignedBigInteger('vat_amount_halalas');
            $table->unsignedBigInteger('total_amount_halalas');
            $table->unsignedTinyInteger('vat_rate_percent');

            $table->text('qr_payload')->nullable();
            $table->timestamp('issued_at');
            $table->timestamps();

            $table->index(['employee_id', 'issued_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_payment_invoices');
    }
};
