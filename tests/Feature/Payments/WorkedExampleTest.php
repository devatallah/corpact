<?php

use App\Models\PaymentIntent;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use App\Services\Payments\CollectionService;

// اختبار القبول المركزي — مثال H §12.2 المحسوب بالكامل، إلى الهللة:
// بادل 300.00 ريال شاملة الضريبة · حد أدنى 4 / سعة 8 · دعم ثابت 100.00 →
// الحصة القصوى المعروضة عند الانضمام 50.00 · انضم 6 → حصة الفرد 33.33 ·
// المحصَّل 199.98 · المحجوز المستقطع من المحفظة 100.00 · فرق الكسور 0.02
// يُحمَّل على جانب عمولة تيمات (بند معلّق H §24 — موثَّق في divergences).

test('the §12.2 padel worked example reproduces to the halala', function () {
    fakeMessages();

    ['event' => $event] = a10Event([
        'total' => 300.0,
        'subsidy' => 100.0,
        'min' => 4,
        'capacity' => 8,
        'joiners' => 6,
        'wallet' => 10_000, // 100.00 ريال
    ]);

    // الحصة القصوى المعروضة عند الانضمام: (300 − 100) ÷ 4 = 50.00 ريال.
    expect($event->max_share_halalas)->toBe(5_000)
        ->and((string) $event->max_share)->toBe('50.00');

    // إغلاق التسجيل: تثبيت العدد (6) وبدء التحصيل.
    $event->forceFill(['registration_closes_at' => now()->subMinutes(2)])->save();
    $this->artisan('app:close-registration')->assertSuccessful();
    $event = $event->fresh();

    expect($event->status)->toBe('awaiting_payment')
        ->and($event->participants_count)->toBe(6)
        // الدعم الفعلي = min(100، رصيد المحفظة، الإجمالي) = 100.00.
        ->and($event->subsidy_halalas)->toBe(10_000)
        // حصة الفرد الفعلية: (300 − 100) ÷ 6 = 33.33 بلا تقريب لأعلى.
        ->and($event->final_share_halalas)->toBe(3_333)
        // فرق الكسور: 20000 − 3333×6 = 2 هللة — على جانب عمولة تيمات.
        ->and($event->rounding_remainder_halalas)->toBe(2);

    // الدعم محجوز hold لا مستقطعاً بعد.
    $hold = WalletHold::where('idempotency_key', "event:{$event->id}:subsidy-hold")->firstOrFail();
    expect($hold->status)->toBe(WalletHold::STATUS_ACTIVE)
        ->and($hold->amount_halalas)->toBe(10_000);

    // ست مطالبات دفع بمبلغ الحصة المقفلة نفسها.
    $intents = PaymentIntent::where('event_id', $event->id)->get();
    expect($intents)->toHaveCount(6)
        ->and($intents->pluck('amount_halalas')->unique()->all())->toBe([3_333]);

    // يدفع الستة — المحصَّل من الموظفين 199.98 ريال.
    $collection = app(CollectionService::class);
    foreach ($intents as $i => $intent) {
        $collection->markIntentPaid($intent, "local_paid_{$i}");
    }

    $event = $event->fresh();

    // اكتمال التحصيل: الحجز استُقطع كاملاً (100.00) والفعالية مؤكدة.
    expect($event->status)->toBe('confirmed')
        ->and($hold->fresh()->status)->toBe(WalletHold::STATUS_CAPTURED)
        ->and(WalletTransaction::where('idempotency_key', "capture:event:{$event->id}:subsidy-hold")->value('amount_halalas'))->toBe(10_000)
        ->and((int) PaymentIntent::where('event_id', $event->id)->where('status', 'paid')->sum('amount_halalas'))->toBe(19_998);

    // اللقطة المالية (H §12.10) — مصدر التسوية والتاريخ، إلى الهللة.
    $financial = $event->event_snapshot['financial'];
    expect($financial['total_amount_halalas'])->toBe(30_000)
        ->and($financial['subsidy_halalas'])->toBe(10_000)
        ->and($financial['max_share_halalas'])->toBe(5_000)
        ->and($financial['share_per_participant_halalas'])->toBe(3_333)
        ->and($financial['collected_from_participants_halalas'])->toBe(19_998)
        ->and($financial['rounding_remainder_halalas'])->toBe(2)
        ->and($financial['rounding_remainder_charged_to'])->toBe('teamat_commission')
        // الضريبة مفكَّكة: الأساس floor(30000×100÷115) = 26086 والضريبة 3914.
        ->and($financial['base_amount_halalas'])->toBe(26_086)
        ->and($financial['vat_amount_halalas'])->toBe(3_914);

    // اشتقاق A11 من اللقطة (عمولة 12% مثال H §12.2): 300 × 12% = 36.00 →
    // صافي المزوّد 264.00 — كله قسمة أعداد صحيحة على بيانات اللقطة.
    $commission = intdiv($financial['total_amount_halalas'] * 12, 100);
    expect($commission)->toBe(3_600)
        ->and($financial['total_amount_halalas'] - $commission)->toBe(26_400);

    // القاعدة 4/5: لا مبلغ تغيّر بعد الدفع ولا حصة تجاوزت السقف.
    expect(PaymentIntent::where('event_id', $event->id)->where('amount_halalas', '>', $event->max_share_halalas)->exists())->toBeFalse();
});
