<?php

use App\Support\Money;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A10 — تحويل نطاق مال الفعاليات إلى هللات صحيحة (H §12.1 + قاعدة المخطط 7):
 *
 * - كل أعمدة المال على events / event_templates / venue_pricings /
 *   activity_units / event_provider_requests / unit_price_changes تصبح
 *   `*_halalas` (integer) — الأعمدة العشرية القديمة تُرحَّل بقيمها ثم تُحذف،
 *   والأسماء القديمة تبقى accessors عرضٍ على النماذج (لا حساب عليها).
 * - الإجمالي شامل ضريبة 15% ويُفكَّك إلى base_amount_halalas +
 *   vat_amount_halalas (H §12.1).
 * - معادلة التمويل (H §12.2): subsidy_type (fixed | percentage) +
 *   subsidy_value (هللات للثابت، نسبة 0–100 للمئوية)، الحصة القصوى
 *   max_share_halalas «سقف ملزم» يُحسب عند الإنشاء، الدعم الفعلي
 *   subsidy_halalas والحصة النهائية final_share_halalas يُقفلان عند إغلاق
 *   التسجيل، وفرق الكسور rounding_remainder_halalas يُحمَّل على جانب عمولة
 *   تيمات (بند معلّق H §24 — موثَّق في divergences.md).
 *
 * ترحيل البيانات القائمة (موثَّق):
 * - total/base/vat من total_amount القديم؛ subsidy_value من company_subsidy
 *   القديم بنوع fixed؛ الحد الأقصى يُشتق بمعادلة §12.2 من الحد الأدنى القائم.
 * - فعالية استُقطعت ميزانيتها قديماً (budget_deducted_at) تحفظ
 *   subsidy_halalas من community_contribution القديمة — حصص الأفراد القديمة
 *   لم تُحصَّل قط (لا تحصيل قبل A10) فلا final_share لها.
 */
return new class extends Migration
{
    private const EVENT_STATUSES = [
        'pending_approval', 'open', 'rejected', 'pending_provider',
        'provider_alternative', 'booked', 'awaiting_payment', 'confirmed',
        'in_progress', 'completed', 'settled', 'expired',
        'cancelled_min_not_met', 'cancelled_provider', 'cancelled_company',
        'cancelled_payment_failed',
    ];

    public function up(): void
    {
        // ── events ─────────────────────────────────────────────────────
        Schema::table('events', function (Blueprint $table) {
            $table->unsignedBigInteger('total_amount_halalas')->default(0)->after('venues_count');
            $table->unsignedBigInteger('base_amount_halalas')->default(0)->after('total_amount_halalas');
            $table->unsignedBigInteger('vat_amount_halalas')->default(0)->after('base_amount_halalas');
            $table->string('subsidy_type', 20)->default('fixed')->after('vat_amount_halalas'); // fixed | percentage
            // fixed: هللات · percentage: نسبة 0–100 من الإجمالي
            $table->unsignedBigInteger('subsidy_value')->default(0)->after('subsidy_type');
            // الدعم الفعلي المُقفل عند إغلاق التسجيل = min(المحدد، رصيد المحفظة، الإجمالي)
            $table->unsignedBigInteger('subsidy_halalas')->nullable()->after('subsidy_value');
            // الحصة القصوى المعروضة عند الانضمام — سقف ملزم لا يُتجاوز (H §12.2)
            $table->unsignedBigInteger('max_share_halalas')->default(0)->after('subsidy_halalas');
            // حصة الفرد الفعلية المُقفلة عند الإغلاق — لا تتغير بعدها أبداً
            $table->unsignedBigInteger('final_share_halalas')->nullable()->after('max_share_halalas');
            // فرق كسور القسمة — يُحمَّل على جانب عمولة تيمات
            $table->unsignedInteger('rounding_remainder_halalas')->default(0)->after('final_share_halalas');
            // عجز غُطي من محفظة المجتمع بعد فشل دفع بعض الحصص (العدد ≥ الحد)
            $table->unsignedBigInteger('shortfall_covered_halalas')->default(0)->after('rounding_remainder_halalas');
            // نهاية نافذة الدفع (120 دقيقة أو 6 ساعات قبل البدء أيهما أقرب)
            $table->dateTime('collection_deadline_at')->nullable()->after('shortfall_covered_halalas');
            // أرشيف ميزة التخفيضات المحذوفة + استرداد قديم — تاريخ للقراءة فقط
            $table->unsignedBigInteger('discount_amount_halalas')->nullable()->after('collection_deadline_at');
            $table->unsignedBigInteger('refund_amount_halalas')->nullable()->after('discount_amount_halalas');
        });

        DB::table('events')->orderBy('id')
            ->select(['id', 'total_amount', 'company_subsidy', 'community_contribution', 'min_participants', 'budget_deducted_at', 'discount_amount', 'refund_amount'])
            ->chunkById(200, function ($events) {
                foreach ($events as $event) {
                    $total = Money::toHalalas($event->total_amount ?? 0);
                    $vat = Money::decomposeVat($total);
                    $subsidyValue = Money::toHalalas($event->company_subsidy ?? 0);
                    $minParticipants = max(1, (int) $event->min_participants);
                    $remaining = $total - min($subsidyValue, $total);

                    DB::table('events')->where('id', $event->id)->update([
                        'total_amount_halalas' => $total,
                        'base_amount_halalas' => $vat['base'],
                        'vat_amount_halalas' => $vat['vat'],
                        'subsidy_type' => 'fixed',
                        'subsidy_value' => $subsidyValue,
                        'subsidy_halalas' => $event->budget_deducted_at !== null
                            ? Money::toHalalas($event->community_contribution ?? 0)
                            : null,
                        'max_share_halalas' => intdiv($remaining, $minParticipants),
                        'discount_amount_halalas' => $event->discount_amount !== null
                            ? Money::toHalalas($event->discount_amount)
                            : null,
                        'refund_amount_halalas' => $event->refund_amount !== null
                            ? Money::toHalalas($event->refund_amount)
                            : null,
                    ]);
                }
            });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'total_amount', 'cost_per_person', 'company_subsidy',
                'community_contribution', 'player_payment', 'discount_amount',
                'refund_amount',
            ]);
        });

        // إسقاط أعمدة في SQLite يعيد بناء الجدول فيسقط قيد CHECK على الحالة —
        // يُعاد فرض حالات §9 حصراً (قاعدة A7).
        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', self::EVENT_STATUSES)->default('open')->change();
        });

        // ── event_templates (قيم تمريرية من A8 — الدلالات هنا) ─────────
        Schema::table('event_templates', function (Blueprint $table) {
            $table->unsignedBigInteger('total_amount_halalas')->default(0)->after('venues_count');
            $table->string('subsidy_type', 20)->default('fixed')->after('total_amount_halalas');
            $table->unsignedBigInteger('subsidy_value')->default(0)->after('subsidy_type');
        });

        DB::table('event_templates')->orderBy('id')
            ->select(['id', 'total_amount', 'company_subsidy'])
            ->chunkById(200, function ($templates) {
                foreach ($templates as $template) {
                    DB::table('event_templates')->where('id', $template->id)->update([
                        'total_amount_halalas' => Money::toHalalas($template->total_amount ?? 0),
                        'subsidy_type' => 'fixed',
                        'subsidy_value' => Money::toHalalas($template->company_subsidy ?? 0),
                    ]);
                }
            });

        Schema::table('event_templates', function (Blueprint $table) {
            $table->dropColumn(['total_amount', 'company_subsidy', 'community_contribution', 'player_payment', 'cost_per_person']);
        });

        // ── venue_pricings / activity_units / unit_price_changes ──────
        Schema::table('venue_pricings', function (Blueprint $table) {
            $table->unsignedBigInteger('price_halalas')->default(0)->after('duration_minutes');
        });
        DB::table('venue_pricings')->update(['price_halalas' => DB::raw('CAST(ROUND(price * 100) AS INTEGER)')]);
        Schema::table('venue_pricings', function (Blueprint $table) {
            $table->dropColumn('price');
        });

        Schema::table('activity_units', function (Blueprint $table) {
            $table->unsignedBigInteger('price_halalas')->default(0)->after('pricing_type');
        });
        DB::table('activity_units')->update(['price_halalas' => DB::raw('CAST(ROUND(price * 100) AS INTEGER)')]);
        Schema::table('activity_units', function (Blueprint $table) {
            $table->dropColumn('price');
        });

        Schema::table('unit_price_changes', function (Blueprint $table) {
            $table->unsignedBigInteger('old_price_halalas')->default(0)->after('activity_unit_id');
            $table->unsignedBigInteger('new_price_halalas')->default(0)->after('old_price_halalas');
        });
        DB::table('unit_price_changes')->update([
            'old_price_halalas' => DB::raw('CAST(ROUND(old_price * 100) AS INTEGER)'),
            'new_price_halalas' => DB::raw('CAST(ROUND(new_price * 100) AS INTEGER)'),
        ]);
        Schema::table('unit_price_changes', function (Blueprint $table) {
            $table->dropColumn(['old_price', 'new_price']);
        });

        // ── event_provider_requests (لقطة إجمالي الطلب) ────────────────
        Schema::table('event_provider_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('total_amount_halalas')->nullable()->after('frozen_participants_count');
        });
        DB::table('event_provider_requests')->whereNotNull('total_amount')
            ->update(['total_amount_halalas' => DB::raw('CAST(ROUND(total_amount * 100) AS INTEGER)')]);
        Schema::table('event_provider_requests', function (Blueprint $table) {
            $table->dropColumn('total_amount');
        });

        // ── company_settings: نوع الدعم الافتراضي (A4 خزّن الثابت فقط) ──
        Schema::table('company_settings', function (Blueprint $table) {
            $table->string('default_subsidy_type', 20)->default('fixed')->after('default_subsidy');
        });
    }

    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn('default_subsidy_type');
        });

        Schema::table('event_provider_requests', function (Blueprint $table) {
            $table->decimal('total_amount', 10, 2)->nullable();
        });
        DB::table('event_provider_requests')->whereNotNull('total_amount_halalas')
            ->update(['total_amount' => DB::raw('total_amount_halalas / 100.0')]);
        Schema::table('event_provider_requests', function (Blueprint $table) {
            $table->dropColumn('total_amount_halalas');
        });

        Schema::table('unit_price_changes', function (Blueprint $table) {
            $table->decimal('old_price', 10, 2)->default(0);
            $table->decimal('new_price', 10, 2)->default(0);
        });
        DB::table('unit_price_changes')->update([
            'old_price' => DB::raw('old_price_halalas / 100.0'),
            'new_price' => DB::raw('new_price_halalas / 100.0'),
        ]);
        Schema::table('unit_price_changes', function (Blueprint $table) {
            $table->dropColumn(['old_price_halalas', 'new_price_halalas']);
        });

        Schema::table('activity_units', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0);
        });
        DB::table('activity_units')->update(['price' => DB::raw('price_halalas / 100.0')]);
        Schema::table('activity_units', function (Blueprint $table) {
            $table->dropColumn('price_halalas');
        });

        Schema::table('venue_pricings', function (Blueprint $table) {
            $table->decimal('price', 8, 2)->default(0);
        });
        DB::table('venue_pricings')->update(['price' => DB::raw('price_halalas / 100.0')]);
        Schema::table('venue_pricings', function (Blueprint $table) {
            $table->dropColumn('price_halalas');
        });

        Schema::table('event_templates', function (Blueprint $table) {
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('company_subsidy', 10, 2)->default(0);
            $table->decimal('community_contribution', 10, 2)->default(0);
            $table->decimal('player_payment', 10, 2)->default(0);
            $table->decimal('cost_per_person', 10, 2)->default(0);
        });
        DB::table('event_templates')->update([
            'total_amount' => DB::raw('total_amount_halalas / 100.0'),
            'company_subsidy' => DB::raw('subsidy_value / 100.0'),
        ]);
        Schema::table('event_templates', function (Blueprint $table) {
            $table->dropColumn(['total_amount_halalas', 'subsidy_type', 'subsidy_value']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('cost_per_person', 8, 2)->default(0);
            $table->decimal('company_subsidy', 8, 2)->default(0);
            $table->decimal('community_contribution', 8, 2)->default(0);
            $table->decimal('player_payment', 8, 2)->default(0);
            $table->decimal('discount_amount', 8, 2)->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
        });
        DB::table('events')->update([
            'total_amount' => DB::raw('total_amount_halalas / 100.0'),
            'company_subsidy' => DB::raw('subsidy_value / 100.0'),
            'community_contribution' => DB::raw('COALESCE(subsidy_halalas, 0) / 100.0'),
            'discount_amount' => DB::raw('discount_amount_halalas / 100.0'),
            'refund_amount' => DB::raw('refund_amount_halalas / 100.0'),
        ]);
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'total_amount_halalas', 'base_amount_halalas', 'vat_amount_halalas',
                'subsidy_type', 'subsidy_value', 'subsidy_halalas',
                'max_share_halalas', 'final_share_halalas',
                'rounding_remainder_halalas', 'shortfall_covered_halalas',
                'collection_deadline_at', 'discount_amount_halalas', 'refund_amount_halalas',
            ]);
        });
        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', self::EVENT_STATUSES)->default('open')->change();
        });
    }
};
