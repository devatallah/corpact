<?php

use App\Enums\WalletTransactionType;
use App\Models\GatewayTransaction;
use App\Models\PaymentIntent;
use App\Models\Wallet;
use App\Services\Payments\CollectionService;
use App\Services\Wallet\LedgerService;
use Inertia\Testing\AssertableInertia as Assert;

// A10 بند 9 — تجربة الدفع: صفحة الدفع (المبلغ مفكَّكاً، الوسائل، المهلة)،
// سجل المدفوعات، عرض الحصة في صفحة الفعالية بصياغة السقف الملزم
// («حصتك بحد أقصى … وتقل كلما انضم زملاؤك» — H §12.2)، وعزل الملكية.

test('the event page carries the binding-ceiling share wording before close and the locked share after', function () {
    fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event([
        'total' => 300.0, 'subsidy' => 100.0, 'min' => 4, 'capacity' => 8, 'joiners' => 4,
    ]);

    $this->actingAs($employees[0], 'employee')
        ->get("/employee/detail/{$event->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employee/events/show')
            ->where('payment.max_share', '50.00')
            ->where('payment.share_locked', false)
            ->where('payment.final_share', null)
        );

    // بعد الإغلاق: الحصة النهائية مقفلة ومطالبة الموظف معروضة برابط استئناف.
    app(LedgerService::class)->credit(
        Wallet::subFor($event->community),
        WalletTransactionType::TopUp,
        10_000,
        'ux:fund',
    );
    $event->forceFill(['registration_closes_at' => now()->subMinute()])->save();
    $this->artisan('app:close-registration')->assertSuccessful();

    $this->actingAs($employees[0], 'employee')
        ->get("/employee/detail/{$event->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('payment.share_locked', true)
            ->where('payment.final_share', '50.00') // (300−100)÷4
            ->where('myIntent.status', 'pending')
            ->where('myIntent.amount', '50.00')
        );
});

test('the payment page shows the amount with VAT decomposition, methods, deadline, and statement descriptor data', function () {
    fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);

    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $employee = collect($employees)->firstWhere('id', $intent->employee_id);

    $this->actingAs($employee, 'employee')
        ->get("/employee/payments/{$intent->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            // ورقة السداد صارت نافذةً فوق القائمة: نفس المسار، ونفس البيانات،
            // ومكوّن القائمة هو ما يُصيَّر.
            ->component('employee/payments/index')
            ->where('active.amount', '150.00')
            ->where('active.base_amount', '130.43')
            ->where('active.vat_amount', '19.57')
            ->where('statementDescriptor', 'تيمات')
            ->where('methods', ['mada', 'card', 'apple_pay'])
        );
});

test('an employee can never open another employee\'s payment intent — 404', function () {
    fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);

    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $other = collect($employees)->first(fn ($e) => $e->id !== $intent->employee_id);

    $this->actingAs($other, 'employee')->get("/employee/payments/{$intent->id}")->assertNotFound();
    $this->actingAs($other, 'employee')->post("/employee/payments/{$intent->id}/pay")->assertNotFound();
});

test('the payments history lists the employee\'s intents with their states', function () {
    fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);

    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $employee = collect($employees)->firstWhere('id', $intent->employee_id);
    app(CollectionService::class)->markIntentPaid($intent, 'local_hist');

    $this->actingAs($employee, 'employee')
        ->get('/employee/payments')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employee/payments/index')
            // H §18: القائمة صارت مرقّمة (20 عنصراً) فالصفوف تحت `data`.
            ->has('intents.data', 1)
            ->where('intents.data.0.status', 'paid')
        );
});

test('paying an already-paid intent is refused — the money rules forbid a second charge', function () {
    fakeMessages();

    ['event' => $event, 'employees' => $employees] = a10Event(['total' => 300.0, 'min' => 2, 'joiners' => 2, 'close' => true]);

    $intent = PaymentIntent::where('event_id', $event->id)->firstOrFail();
    $employee = collect($employees)->firstWhere('id', $intent->employee_id);
    app(CollectionService::class)->markIntentPaid($intent, 'local_once');

    $this->actingAs($employee, 'employee')
        ->post("/employee/payments/{$intent->id}/pay")
        ->assertRedirect(route('employee.payments.show', ['intent' => $intent->id]));

    expect(GatewayTransaction::where('payment_intent_id', $intent->id)->count())->toBe(1);
});
