<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A11 — العمولة والتسويات ورسوم النظام والفوترة (H §12.7–§12.10).
 *
 * ما يبنيه هذا الترحيل:
 *
 * 1) **أرشفة النموذج القديم** — `settlements` و`platform_revenue` كانا تسويات
 *    شهرية بعملة عشرية لكل (مزوّد + شركة) بلا اعتماد ولا لقطة ولا صرف. لا
 *    يُحذف سجل مالي أبداً (نمط أرشفة A6/A10): يُعاد تسميتهما
 *    `legacy_settlements` / `legacy_platform_revenue` بختم `archived_at`،
 *    ويحل محلهما كشف/بند بالهللة الصحيحة.
 * 2) **`settlement_items`** — بند لكل فعالية مكتملة (H §12.7 «جدول إلزامي»)
 *    بحقول الإجمالي/العمولة/الضريبة/الصافي و`snapshot_json` المجمّدة، وحالات
 *    `disputed`/`adjusted` **من اليوم الأول** وإن تأجلت واجهة النزاع.
 * 3) **`settlement_statements`** — كشف كل 15 يوماً لكل مزوّد: draft → approved
 *    → paid، منشئه ومعتمده وصارفه مستخدمون مختلفون (حارس منع الاعتماد الذاتي).
 * 4) **`platform_fee_invoices` + `invoice_items`** — الفوترة الشهرية الميلادية
 *    بالهللة مع حقول فاتورة إلكترونية (رقم متسلسل، UUID، QR، أرقام ضريبية)
 *    و`tax_treatment`/`invoice_issuer` لكل بند (H §12.9 — جدول مؤقت بانتظار
 *    المحاسب القانوني).
 * 5) **جدولا `effective_from`** — تغيير نسبة عمولة مزوّد أو رسوم عقد شركة يسري
 *    من تاريخ مستقبلي فقط ولا يُطبَّق بأثر رجعي (H §12.10).
 * 6) **علم حجب إنشاء الفعاليات** على الشركة (تأخر السداد 30 يوماً — H §12.8).
 *    الحجب على الإنشاء وحده: لا حجب دخول ولا مساس بفعالية مؤكدة.
 * 7) **`wallets.company_id` صار nullable** — محفظة مستحقات المزوّد
 *    (owner = Partner) ليست ملك شركة؛ قيود العمولة والتسوية تمر بدفتر A6 نفسه.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // ── 1) محفظة مستحقات المزوّد: مالك بلا شركة ────────────────────────
        Schema::table('wallets', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->change();
        });

        // ── 2) الأرقام الضريبية للطرفين (فاتورة — H §12.9) ─────────────────
        Schema::table('companies', function (Blueprint $table) {
            $table->string('vat_number', 20)->nullable()->after('commercial_registration');
            // H §12.8: تأخر السداد 30 يوماً ⇒ إيقاف إنشاء فعاليات جديدة فقط.
            $table->timestamp('event_creation_blocked_at')->nullable()->after('contract_coordinator_service');
            $table->string('event_creation_block_reason')->nullable()->after('event_creation_blocked_at');
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->string('vat_number', 20)->nullable()->after('cr_number');
            // «العمولة نسبة … تُحدَّد في عقد كل مزوّد» (H §12.7) وأرقام العقود
            // من المالك: **لا افتراضات**. العمود كان `default(10.00)` غير قابل
            // للإفراغ فيخترع نسبة لمزوّد بلا عقد؛ صار nullable بلا افتراضي،
            // ومزوّد بلا نسبة سارية لا يُحتسب له بند وينبَّه عليه الأدمن.
            $table->decimal('commission_rate', 5, 2)->nullable()->default(null)->change();
        });

        // ── 3) أرشفة النموذج القديم — لا حذف لسجل مالي ─────────────────────
        Schema::rename('platform_revenue', 'legacy_platform_revenue');
        Schema::table('legacy_platform_revenue', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable();
        });
        DB::table('legacy_platform_revenue')->update(['archived_at' => $now]);

        Schema::rename('settlements', 'legacy_settlements');
        Schema::table('legacy_settlements', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable();
        });
        DB::table('legacy_settlements')->update(['archived_at' => $now]);

        // ── 4) تجميد الشروط المالية بتاريخ مستقبلي (H §12.10) ──────────────
        Schema::create('provider_commission_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->restrictOnDelete();
            $table->decimal('rate_percent', 5, 2);
            // لا سريان بأثر رجعي: التاريخ مستقبلي عند الإنشاء (يفرضه الطلب).
            $table->date('effective_from');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->unique(['partner_id', 'effective_from']);
        });

        Schema::create('company_contract_terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->restrictOnDelete();
            // بالهللة — قيم العقد من المالك، فلا افتراضات (nullable).
            $table->unsignedInteger('fee_per_activated_employee_halalas')->nullable();
            $table->unsignedInteger('monthly_minimum_halalas')->nullable();
            $table->date('effective_from');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'effective_from']);
        });

        // ── 5) كشوف التسوية (H §12.7) ──────────────────────────────────────
        Schema::create('settlement_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->restrictOnDelete();
            // مفتاح الفترة: 2026-08-P1 (1–15) و 2026-08-P2 (16–آخر الشهر).
            $table->string('period_key');
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['draft', 'approved', 'paid'])->default('draft');
            $table->unsignedInteger('items_count')->default(0);
            $table->bigInteger('gross_amount_halalas')->default(0);
            $table->bigInteger('commission_amount_halalas')->default(0);
            $table->bigInteger('vat_amount_halalas')->default(0);
            $table->bigInteger('net_amount_halalas')->default(0);
            // المنشئ ≠ المعتمد ≠ الصارف (SelfApprovalGuard). null = النظام.
            $table->foreignId('generated_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('paid_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamp('paid_at')->nullable();
            // وقت التحويل البنكي الفعلي — الصرف يُسجَّل بعده لا قبله.
            $table->timestamp('transferred_at')->nullable();
            $table->string('payout_reference')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->unique(['partner_id', 'period_key']);
            $table->index('status');
        });

        // ── 6) بنود التسوية (H §12.7 — «جدول إلزامي») ──────────────────────
        Schema::create('settlement_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('settlement_statement_id')->nullable()->constrained()->restrictOnDelete();
            // بند فعالية أو بند تصحيحي (فرق موقّع) في الكشف التالي.
            $table->enum('type', ['event', 'correction'])->default('event');
            $table->foreignId('corrects_item_id')->nullable()->constrained('settlement_items')->restrictOnDelete();
            // موقّعة عمداً: بنود التصحيح قد تكون سالبة.
            $table->bigInteger('gross_amount_halalas');
            $table->bigInteger('commission_amount_halalas');
            $table->bigInteger('vat_amount_halalas');
            $table->bigInteger('net_amount_halalas');
            // ضريبة قيمة النشاط نفسها (تيمات وكيل فيها — تُحفظ ولا تُخصم).
            $table->bigInteger('activity_vat_amount_halalas')->default(0);
            // فرق كسور القسمة المحمَّل على جانب العمولة (A10 — H §24).
            $table->bigInteger('rounding_remainder_halalas')->default(0);
            $table->decimal('commission_rate_percent', 5, 2)->nullable();
            // disputed/adjusted موجودتان من اليوم الأول وإن تأجلت واجهة النزاع.
            $table->enum('status', ['pending', 'included', 'paid', 'disputed', 'adjusted'])->default('pending');
            $table->enum('tax_treatment', ['agent', 'principal'])->default('principal');
            $table->string('invoice_issuer', 20)->default('teamat');
            // النسخة المجمّدة: اسم المزوّد والسعر ونسبة العمولة وقت الاحتساب.
            $table->json('snapshot_json');
            $table->string('reason')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('idempotency_key')->unique();
            $table->timestamp('computed_at');
            $table->timestamps();

            $table->index(['partner_id', 'status']);
        });

        // ── 7) فواتير رسوم النظام الشهرية (H §12.8/§12.9) ──────────────────
        Schema::create('platform_fee_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->restrictOnDelete();
            // فاتورة: رقم متسلسل + UUID + QR (حقول قابلة للتوسعة قبل الربط).
            $table->unsignedBigInteger('serial_sequence')->unique();
            $table->string('serial')->unique();
            $table->uuid('invoice_uuid');
            $table->string('period_key');   // 2026-08 — دورة ميلادية كاملة
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['draft', 'issued', 'paid', 'void'])->default('issued');
            // real ممنوعة حتى اعتماد المحاسب القانوني (config billing.real_invoices_enabled).
            $table->enum('issuance_mode', ['provisional', 'real'])->default('provisional');
            $table->unsignedInteger('activated_employees_count')->default(0);
            $table->unsignedInteger('departed_activated_count')->default(0);
            $table->unsignedInteger('fee_per_activated_employee_halalas')->default(0);
            $table->bigInteger('fees_subtotal_halalas')->default(0);
            $table->unsignedInteger('monthly_minimum_halalas')->nullable();
            $table->bigInteger('minimum_adjustment_halalas')->default(0);
            $table->bigInteger('subtotal_halalas')->default(0);
            $table->bigInteger('vat_amount_halalas')->default(0);
            $table->bigInteger('total_amount_halalas')->default(0);
            $table->unsignedTinyInteger('vat_rate_percent')->default(15);
            $table->enum('tax_treatment', ['agent', 'principal'])->default('principal');
            $table->string('invoice_issuer', 20)->default('teamat');
            $table->string('seller_name')->nullable();
            $table->string('seller_vat_number')->nullable();
            $table->string('buyer_name')->nullable();
            $table->string('buyer_vat_number')->nullable();
            $table->text('qr_payload')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('paid_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('payment_reference')->nullable();
            // سلّم التأخر: تنبيه 7 ثم 15 ثم حجب الإنشاء بعد 30 يوماً.
            $table->timestamp('reminder_7_sent_at')->nullable();
            $table->timestamp('reminder_15_sent_at')->nullable();
            $table->timestamp('blocked_at')->nullable();
            $table->foreignId('generated_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'period_key']);
            $table->index('status');
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('platform_fee_invoice_id')->constrained()->restrictOnDelete();
            // activation_fee | monthly_minimum | coordinator_service | correction
            $table->string('type');
            $table->string('description');
            $table->unsignedInteger('quantity')->default(1);
            $table->bigInteger('unit_amount_halalas')->default(0);
            $table->bigInteger('amount_halalas')->default(0);
            $table->bigInteger('vat_amount_halalas')->default(0);
            $table->bigInteger('total_amount_halalas')->default(0);
            $table->enum('tax_treatment', ['agent', 'principal'])->default('principal');
            $table->string('invoice_issuer', 20)->default('teamat');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('platform_fee_invoices');
        Schema::dropIfExists('settlement_items');
        Schema::dropIfExists('settlement_statements');
        Schema::dropIfExists('company_contract_terms');
        Schema::dropIfExists('provider_commission_rates');

        Schema::table('legacy_settlements', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
        Schema::rename('legacy_settlements', 'settlements');

        Schema::table('legacy_platform_revenue', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
        Schema::rename('legacy_platform_revenue', 'platform_revenue');

        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn('vat_number');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['vat_number', 'event_creation_blocked_at', 'event_creation_block_reason']);
        });
    }
};
