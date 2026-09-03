<?php

use App\Models\Employee;
use App\Models\Event;
use App\Models\PaymentIntent;
use Inertia\Testing\AssertableInertia;

function makeIntent(Event $event, Employee $employee, string $status, $expiresAt): PaymentIntent
{
    $total = 5000;
    $base = intdiv($total * 100, 115);

    return PaymentIntent::create([
        'event_id' => $event->id,
        'employee_id' => $employee->id,
        'company_id' => $employee->company_id,
        'amount_halalas' => $total,
        'base_amount_halalas' => $base,
        'vat_amount_halalas' => $total - $base,
        'currency' => 'SAR',
        'status' => $status,
        'gateway' => 'local_test',
        'idempotency_key' => 'test-'.uniqid(),
        'expires_at' => $expiresAt,
    ]);
}

/**
 * H §12.3 — المطالبة المفتوحة تتصدّر الشاشة، وتختفي متى ما فقدت شرطها.
 */
test('an open payment claim reaches the home screen', function () {
    $event = Event::factory()->create(['status' => 'confirmed']);
    $employee = Employee::factory()->create(['company_id' => $event->company_id]);

    $intent = makeIntent($event, $employee, PaymentIntent::STATUS_PENDING, now()->addHours(3));

    $this->actingAs($employee, 'employee')
        ->get('/employee/home')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('pendingPayment.id', $intent->id)
            ->where('pendingPayment.event.id', $event->id)
            ->where('pendingPayment.amount', $intent->amount_halalas / 100)
        );
});

test('an expired or paid claim is not shown', function () {
    $event = Event::factory()->create(['status' => 'confirmed']);
    $employee = Employee::factory()->create(['company_id' => $event->company_id]);

    // payment_intents is unique on (event_id, employee_id) — one claim per seat,
    // so the two rejected states need an event each.
    $other = Event::factory()->create(['company_id' => $event->company_id, 'status' => 'confirmed']);

    makeIntent($event, $employee, PaymentIntent::STATUS_PENDING, now()->subMinute());
    makeIntent($other, $employee, PaymentIntent::STATUS_PAID, now()->addHours(3));

    $this->actingAs($employee, 'employee')
        ->get('/employee/home')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('pendingPayment', null));
});
