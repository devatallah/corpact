<?php

use App\Enums\Role;
use App\Models\GatewayTransaction;
use App\Models\PaymentIntent;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Events\ParticipationService;
use App\Services\Payments\CollectionService;
use App\Services\Payments\EventRefundService;
use App\Services\Provider\ProviderEventTransitions;
use App\Services\RefundService;

// A10 بند 7 — مصفوفة الاسترداد (H §12.4) بديل نسب 100/50/0 المحذوفة:
// استرداد كامل في: إلغاء المزوّد · إلغاء الشركة · عدم بلوغ الحد · فشل تحصيل
// جماعي · إلغاء إداري. لا استرداد: انسحاب بعد الإغلاق، وعدم الحضور.
// كل استرداد لوسيلة الدفع الأصلية (لا محفظة نقدية للموظف — قرار تنظيمي)،
// ذري بمفتاح تفرّد، وفشله يدخل قائمة الأدمن المالي بإعادة محاولة آلية.

function a10ConfirmedPaidEvent(): array
{
    fakeMessages();

    $built = a10Event([
        'total' => 300.0, 'subsidy' => 100.0, 'min' => 2, 'capacity' => 8,
        'joiners' => 4, 'wallet' => 10_000, 'close' => true,
    ]);

    $collection = app(CollectionService::class);
    foreach (PaymentIntent::where('event_id', $built['event']->id)->get() as $i => $intent) {
        $collection->markIntentPaid($intent, "local_paid_{$i}");
    }

    $built['event'] = $built['event']->fresh();
    expect($built['event']->status)->toBe('confirmed');

    return $built;
}

test('the legacy 100/50/0 tier machinery is deleted', function () {
    expect(class_exists(RefundService::class))->toBeFalse()
        ->and(config('refund.tiers'))->toBeNull();
});

test('provider cancellation after confirmation: FULL refund — captured subsidy reversed, every paid share refunded to the original method', function () {
    ['event' => $event, 'community' => $community] = a10ConfirmedPaidEvent();

    $provider = $event->partner;

    app(ProviderEventTransitions::class)->providerCancelled($provider, $event, 'ظرف طارئ لدى المزوّد');

    $event = $event->fresh();

    expect($event->status)->toBe('cancelled_provider')
        // عكس استقطاع الدعم بقيد refund مرتبط بالأصل.
        ->and(WalletTransaction::where('idempotency_key', "event:{$event->id}:subsidy-refund")->value('amount_halalas'))->toBe(10_000)
        ->and(Wallet::subFor($community)->fresh()->balance_halalas)->toBe(10_000)
        // كل الحصص المدفوعة رُدّت لوسيلة الدفع الأصلية عبر البوابة.
        ->and(PaymentIntent::where('event_id', $event->id)->pluck('status')->unique()->all())->toBe([PaymentIntent::STATUS_REFUNDED])
        ->and(GatewayTransaction::where('type', 'refund')->where('status', 'succeeded')->count())->toBe(4);
});

test('company cancellation refunds everything in full — never a percentage', function () {
    ['event' => $event, 'company' => $company] = a10ConfirmedPaidEvent();

    $this->actingAs($company, 'company')
        ->post("/company/events/{$event->id}/cancel", ['reason' => 'إلغاء من الشركة'])
        ->assertRedirect();

    $event = $event->fresh();

    expect($event->status)->toBe('cancelled_company')
        ->and($event->refund_percentage)->toBe(100)
        ->and(PaymentIntent::where('event_id', $event->id)->pluck('status')->unique()->all())->toBe([PaymentIntent::STATUS_REFUNDED])
        ->and(WalletTransaction::where('idempotency_key', "event:{$event->id}:subsidy-refund")->exists())->toBeTrue();
});

test('refunds are idempotent — running the full refund twice never doubles a ledger or gateway entry', function () {
    ['event' => $event] = a10ConfirmedPaidEvent();

    $refunds = app(EventRefundService::class);
    $refunds->refundEventCollections($event, 'إلغاء إداري');
    $refunds->refundEventCollections($event->fresh(), 'إلغاء إداري');

    expect(WalletTransaction::where('idempotency_key', "event:{$event->id}:subsidy-refund")->count())->toBe(1)
        ->and(GatewayTransaction::where('type', 'refund')->count())->toBe(4);
});

test('NO refund on post-close self-withdrawal — withdrawal itself is blocked after close', function () {
    fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event([
        'total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true,
    ]);

    expect(fn () => app(ParticipationService::class)->withdraw($event->fresh(), $employees[0]))
        ->toThrow(RuntimeException::class);

    expect(PaymentIntent::where('event_id', $event->id)->where('status', PaymentIntent::STATUS_REFUNDED)->count())->toBe(0);
});

test('a failed gateway refund lands in the finance-admin queue and auto-retry succeeds after the gateway recovers', function () {
    ['event' => $event] = a10ConfirmedPaidEvent();

    // مرجع local_fail يجعل البوابة التجريبية ترفض الاسترداد.
    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $intent->forceFill(['gateway_reference' => 'local_fail_'.$intent->id])->save();

    $refunds = app(EventRefundService::class);
    $refunds->refundEventCollections($event, 'إلغاء إداري');

    $intent = $intent->fresh();
    expect($intent->refund_status)->toBe(PaymentIntent::REFUND_FAILED)
        ->and($intent->refund_attempts)->toBe(1)
        ->and($intent->refund_last_error)->not->toBeNull();

    // القائمة مرئية للأدمن المالي.
    $finance = User::factory()->create();
    $finance->assignRole(Role::FinanceAdmin);

    $this->actingAs($finance, 'admin')
        ->get('/admin/payments/failures')
        ->assertOk();

    // أدمن المنصة (غير المالي) ممنوع.
    $platform = User::factory()->create();
    $platform->assignRole(Role::PlatformAdmin);
    $this->actingAs($platform, 'admin')->get('/admin/payments/failures')->assertForbidden();

    // «تعافت» البوابة ⇒ إعادة المحاولة الآلية تنجح بنفس مفتاح التفرّد.
    $intent->forceFill(['gateway_reference' => 'local_recovered'])->save();
    $this->artisan('app:retry-failed-refunds')->assertSuccessful();

    $intent = $intent->fresh();
    expect($intent->refund_status)->toBe(PaymentIntent::REFUND_REFUNDED)
        ->and($intent->status)->toBe(PaymentIntent::STATUS_REFUNDED)
        ->and(GatewayTransaction::where('payment_intent_id', $intent->id)->where('type', 'refund')->count())->toBe(1);
});

test('the finance admin can retry a failed refund manually from the queue', function () {
    ['event' => $event] = a10ConfirmedPaidEvent();

    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $intent->forceFill(['gateway_reference' => 'local_fail_'.$intent->id])->save();
    app(EventRefundService::class)->refundIntent($intent, 'إلغاء إداري');
    expect($intent->fresh()->refund_status)->toBe(PaymentIntent::REFUND_FAILED);

    $intent->forceFill(['gateway_reference' => 'local_recovered_manual'])->save();

    $finance = User::factory()->create();
    $finance->assignRole(Role::FinanceAdmin);

    $this->actingAs($finance, 'admin')
        ->post("/admin/payments/refunds/{$intent->id}/retry")
        ->assertRedirect();

    expect($intent->fresh()->refund_status)->toBe(PaymentIntent::REFUND_REFUNDED);
});
