<?php

use App\Models\PaymentIntent;
use App\Models\SettlementItem;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Payments\CollectionService;
use App\Support\Money;
use Illuminate\Support\Carbon;
use Tests\Support\AcceptanceWorld;
use Tests\Support\FinancialInvariants;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 3 (H §23)
| «دورة فعالية بتمويل مختلط تُنتج الأرقام المذكورة في مثال القسم 12.2 بالهللة»
|--------------------------------------------------------------------------
|
| جدول المواصفة حرفياً — كل صف فيه أدناه سطرُ تأكيد:
|
| | البند                          | القيمة        |
| |--------------------------------|---------------|
| | الإجمالي (شامل الضريبة)         | 300.00        |
| | الحد الأدنى / السعة             | 4 / 8         |
| | دعم المجتمع                     | fixed 100.00  |
| | الحصة القصوى عند الانضمام       | 50.00         |
| | العدد الفعلي عند الإغلاق        | 6             |
| | حصة الفرد الفعلية               | 33.33         |
| | المحصَّل من الموظفين             | 199.98        |
| | المحجوز من محفظة المجتمع        | 100.00        |
| | فرق الكسور                      | 0.02          |
| | مستحق المزوّد قبل العمولة       | 300.00        |
| | عمولة تيمات (12%)               | 36.00         |
| | صافي التحويل للمزوّد            | 264.00        |
|
| الفارق عن اختبار A10 المكافئ: الأرقام الثلاثة الأخيرة تُقرأ هنا من **بند
| تسوية حقيقي** أنشأه مسار الاكتمال، لا تُشتق حسابياً.
*/

test('سيناريو 3 — مثال §12.2 المحسوب يتكرر إلى الهللة، حتى صافي المزوّد 264.00', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    $world = AcceptanceWorld::build([
        'funding_mode' => 'mixed',
        'subsidy_type' => 'fixed',
        'subsidy_value' => 10_000,   // دعم ثابت 100.00 ريال
        'price' => 300.0,            // بادل — ملعب واحد 90 دقيقة، شامل الضريبة
        'wallet' => 10_000,          // رصيد المجتمع يغطي الدعم بالضبط
        'commission_rate' => 12.00,
    ]);

    $communityWallet = $world->communityWallet();

    // ── الإجمالي والحدّان والدعم ───────────────────────────────────────────
    $event = $world->createEvent(min: 4, capacity: 8, title: 'بادل — ملعب واحد 90 دقيقة');

    expect($event->total_amount_halalas)->toBe(30_000)
        ->and((string) $event->total_amount)->toBe('300.00')
        ->and($event->min_participants)->toBe(4)
        ->and($event->capacity)->toBe(8)
        ->and($event->subsidy_type)->toBe('fixed')
        ->and($event->subsidy_value)->toBe(10_000)
        // الحصة القصوى المعروضة عند الانضمام: (300 − 100) ÷ 4 = 50.00.
        ->and($event->max_share_halalas)->toBe(5_000)
        ->and(Money::format($event->max_share_halalas))->toBe('50.00');

    // ── ستة مشاركين (المنشئ + خمسة) ───────────────────────────────────────
    for ($i = 0; $i < 5; $i++) {
        $world->joinNewMember($event);
    }

    $event = $event->fresh();
    expect($event->participants_count)->toBe(6)->and($event->status)->toBe('pending_provider');

    $world->providerAccepts($event);

    // ── إغلاق التسجيل: تثبيت العدد، حجز الدعم، قفل الحصة ───────────────────
    $world->closeRegistration($event->fresh());
    $event = $event->fresh();

    $hold = WalletHold::where('idempotency_key', "event:{$event->id}:subsidy-hold")->firstOrFail();

    expect($event->status)->toBe('awaiting_payment')
        ->and($event->participants_count)->toBe(6)
        // الدعم الفعلي = min(100.00 المحدد، 100.00 الرصيد، 300.00 الإجمالي).
        ->and($event->subsidy_halalas)->toBe(10_000)
        ->and(Money::format($event->subsidy_halalas))->toBe('100.00')
        // حصة الفرد الفعلية: (300 − 100) ÷ 6 = 33.33 — بلا تقريب لأعلى.
        ->and($event->final_share_halalas)->toBe(3_333)
        ->and(Money::format($event->final_share_halalas))->toBe('33.33')
        // فرق الكسور: 200.00 − (33.33 × 6) = 0.02.
        ->and($event->rounding_remainder_halalas)->toBe(2)
        ->and(Money::format($event->rounding_remainder_halalas))->toBe('0.02')
        // الدعم محجوز لا مستقطعاً بعد.
        ->and($hold->status)->toBe(WalletHold::STATUS_ACTIVE)
        ->and($hold->amount_halalas)->toBe(10_000)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(0);

    $intents = PaymentIntent::where('event_id', $event->id)->get();

    expect($intents)->toHaveCount(6)
        ->and($intents->pluck('amount_halalas')->unique()->all())->toBe([3_333]);

    // ── الستة يدفعون: المحصَّل 199.98 والحجز يُستقطع 100.00 ────────────────
    $collection = app(CollectionService::class);
    foreach ($intents as $index => $intent) {
        $collection->markIntentPaid($intent, "local_worked_{$index}");
    }

    $event = $event->fresh();

    expect($event->status)->toBe('confirmed')
        ->and((int) PaymentIntent::where('event_id', $event->id)->where('status', 'paid')->sum('amount_halalas'))->toBe(19_998)
        ->and(Money::format(19_998))->toBe('199.98')
        ->and($hold->fresh()->status)->toBe(WalletHold::STATUS_CAPTURED)
        ->and(WalletTransaction::where('idempotency_key', "capture:event:{$event->id}:subsidy-hold")->value('amount_halalas'))->toBe(10_000)
        ->and(FinancialInvariants::ledgerBalance($communityWallet))->toBe(0);

    // اللقطة المجمّدة: الأساس/الضريبة 260.86 / 39.14 وفرق الكسور على العمولة.
    $financial = $event->event_snapshot['financial'];
    expect($financial['total_amount_halalas'])->toBe(30_000)
        ->and($financial['base_amount_halalas'])->toBe(26_086)
        ->and($financial['vat_amount_halalas'])->toBe(3_914)
        ->and($financial['subsidy_halalas'])->toBe(10_000)
        ->and($financial['max_share_halalas'])->toBe(5_000)
        ->and($financial['share_per_participant_halalas'])->toBe(3_333)
        ->and($financial['collected_from_participants_halalas'])->toBe(19_998)
        ->and($financial['rounding_remainder_halalas'])->toBe(2)
        ->and($financial['rounding_remainder_charged_to'])->toBe('teamat_commission');

    // ── الاكتمال: بند التسوية الحقيقي — 300.00 / 36.00 / 264.00 ────────────
    $this->travelTo($event->endsAt()->copy()->addMinutes(30));
    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    $item = SettlementItem::where('event_id', $event->id)->firstOrFail();

    expect($item->commission_rate_percent)->toEqual(12.0)
        ->and($item->gross_amount_halalas)->toBe(30_000)
        ->and(Money::format($item->gross_amount_halalas))->toBe('300.00')
        ->and($item->commission_amount_halalas)->toBe(3_600)
        ->and(Money::format($item->commission_amount_halalas))->toBe('36.00')
        ->and($item->net_amount_halalas)->toBe(26_400)
        ->and(Money::format($item->net_amount_halalas))->toBe('264.00')
        // فرق الكسور يركب على جانب العمولة ولا يمس صافي المزوّد.
        ->and($item->rounding_remainder_halalas)->toBe(2)
        ->and($item->gross_amount_halalas - $item->commission_amount_halalas)->toBe($item->net_amount_halalas);

    FinancialInvariants::assertAll();
});
