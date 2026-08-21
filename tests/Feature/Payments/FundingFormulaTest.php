<?php

use App\Models\Company;
use App\Models\Event;
use App\Models\Notification;
use App\Models\PaymentIntent;
use App\Models\Wallet;
use App\Models\WalletTransaction;

// A10 بند 3 — معادلة التمويل في الكود (H §12.2): الدعم عند الإغلاق =
// min(المحدد، رصيد المحفظة، الإجمالي)؛ الحصة القصوى = المتبقي ÷ الحد الأدنى
// تُعرض عند الانضمام وهي **سقف ملزم**؛ الحصة الفعلية = المتبقي ÷ العدد
// النهائي وتُقفل عند الإغلاق؛ والتنبيه الاستباقي عند بلوغ الحد إلزامي.

test('the max share ceiling is (total − planned subsidy) ÷ minimum, floored, and shown data is on the event', function () {
    ['event' => $event] = a10Event(['total' => 300.0, 'subsidy' => 100.0, 'min' => 4, 'capacity' => 8, 'joiners' => 0]);

    expect($event->max_share_halalas)->toBe(5_000)
        ->and((string) $event->max_share)->toBe('50.00');

    // percentage: المسار أ (100%) يجعل السقف صفراً — مغطى كلياً.
    ['event' => $pathA] = a10Event(['total' => 300.0, 'subsidy' => 100, 'subsidy_type' => 'percentage', 'min' => 4, 'joiners' => 0]);
    expect($pathA->max_share_halalas)->toBe(0);
});

test('the actual share is locked at close from the FINAL count and never changes afterwards', function () {
    fakeMessages();

    ['event' => $event] = a10Event([
        'total' => 300.0, 'subsidy' => 100.0, 'min' => 2, 'capacity' => 8,
        'joiners' => 5, 'wallet' => 10_000, 'close' => true,
    ]);

    // (30000 − 10000) ÷ 5 = 4000 والباقي 0.
    expect($event->final_share_halalas)->toBe(4_000)
        ->and($event->rounding_remainder_halalas)->toBe(0)
        ->and($event->subsidy_halalas)->toBe(10_000);

    // كل مطالبة بمبلغ الحصة المقفلة — والمبلغ لا يزيد بعدها أبداً.
    expect(PaymentIntent::where('event_id', $event->id)->pluck('amount_halalas')->unique()->all())->toBe([4_000]);
});

test('wallet shortfall at close recomputes shares within the announced ceiling — the binding promise', function () {
    fakeMessages();

    // دعم موعود 100 (سقف 50.00)؛ الرصيد 60 ⇒ حصة (300−60)÷6 = 40.00 ≤ السقف.
    ['event' => $event] = a10Event([
        'total' => 300.0, 'subsidy' => 100.0, 'min' => 4, 'capacity' => 8,
        'joiners' => 6, 'wallet' => 6_000, 'close' => true,
    ]);

    expect($event->status)->toBe('awaiting_payment')
        ->and($event->subsidy_halalas)->toBe(6_000)
        ->and($event->final_share_halalas)->toBe(4_000)
        ->and($event->final_share_halalas)->toBeLessThanOrEqual($event->max_share_halalas);
});

test('exceeding the ceiling cancels with ZERO deductions (H §12.3 exception 3)', function () {
    fakeMessages();

    // دعم موعود 200 (سقف (300−200)÷4 = 25.00)؛ الرصيد صفر ⇒ الحصة المعادة
    // 300÷4 = 75.00 > السقف ⇒ إلغاء بلا أي استقطاع من أحد.
    ['event' => $event, 'community' => $community] = a10Event([
        'total' => 300.0, 'subsidy' => 200.0, 'min' => 4, 'capacity' => 8,
        'joiners' => 4, 'wallet' => 0, 'close' => true,
    ]);

    expect($event->status)->toBe('cancelled_payment_failed')
        ->and(PaymentIntent::where('event_id', $event->id)->count())->toBe(0)
        ->and(WalletTransaction::where('reference_id', $event->id)->where('reference_type', Event::class)->exists())->toBeFalse()
        ->and(Wallet::subFor($community)->fresh()->balance_halalas)->toBe(0);
});

test('MANDATORY proactive alert at minimum-reached when the wallet cannot cover the expected subsidy', function () {
    // الرصيد 30 والدعم الموعود 100 — التنبيه للقائد ولمسؤول الحساب لحظة بلوغ
    // الحد، لا عند التحصيل (H §12.3).
    ['event' => $event, 'company' => $company] = a10Event([
        'total' => 300.0, 'subsidy' => 100.0, 'min' => 2, 'capacity' => 8,
        'joiners' => 2, 'wallet' => 3_000,
    ]);

    expect($event->status)->toBe('booked'); // بلغ الحد وقَبِل المزوّد

    expect(Notification::where('notifiable_type', Company::class)
        ->where('notifiable_id', $company->id)
        ->where('title', 'رصيد محفظة مجتمع لا يغطي دعم فعالية')
        ->exists())->toBeTrue();
});

test('no alert when the wallet covers the expected subsidy', function () {
    ['company' => $company] = a10Event([
        'total' => 300.0, 'subsidy' => 100.0, 'min' => 2, 'capacity' => 8,
        'joiners' => 2, 'wallet' => 50_000,
    ]);

    expect(Notification::where('notifiable_type', Company::class)
        ->where('notifiable_id', $company->id)
        ->where('title', 'رصيد محفظة مجتمع لا يغطي دعم فعالية')
        ->exists())->toBeFalse();
});
