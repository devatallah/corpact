<?php

use App\Models\Employee;
use App\Models\Event;
use App\Models\PaymentIntent;

/**
 * اختيار وسيلة الدفع، ووصوله إلى البوابة وإلى الإيصال.
 *
 * كانت الوسائل شاراتٍ للعرض فقط: يختار الموظف بعينه ولا يصل الخادم شيء، ولا
 * يُعرف بعد السداد بأي وسيلة دُفع. وكان زرّ الدفع نفسه لا يفعل شيئاً في زيارة
 * Inertia لأن التحويل الخارجي يعود داخل XHR فيُهمَل.
 */
/** مطالبة قابلة للسداد: موظف حقيقي، فعالية حقيقية، ومهلة لم تنقضِ. */
function payableIntent(): PaymentIntent
{
    $event = Event::factory()->create(['status' => 'awaiting_payment']);
    $employee = Employee::factory()->create(['company_id' => $event->company_id]);

    return PaymentIntent::query()->create([
        'event_id' => $event->id,
        'employee_id' => $employee->id,
        'company_id' => $event->company_id,
        'amount_halalas' => 8750,
        'base_amount_halalas' => 7608,
        'vat_amount_halalas' => 1142,
        'currency' => 'SAR',
        'status' => PaymentIntent::STATUS_PENDING,
        'gateway' => 'local',
        'idempotency_key' => 'test:'.uniqid(),
        'expires_at' => now()->addHours(3),
    ]);
}

test('the chosen method is stored on the intent', function () {
    $intent = payableIntent();
    $employee = Employee::findOrFail($intent->employee_id);

    $this->actingAs($employee, 'employee')
        ->post("/employee/payments/{$intent->id}/pay", ['method' => 'apple_pay']);

    expect($intent->fresh()->payment_method)->toBe('apple_pay');
});

test('a method the platform does not offer is refused', function () {
    $intent = payableIntent();
    $employee = Employee::findOrFail($intent->employee_id);

    $this->actingAs($employee, 'employee')
        ->post("/employee/payments/{$intent->id}/pay", ['method' => 'crypto'])
        ->assertSessionHasErrors('method');

    expect($intent->fresh()->payment_method)->toBeNull();
});

test('paying answers with a location Inertia can follow, not a swallowed redirect', function () {
    $intent = payableIntent();
    $employee = Employee::findOrFail($intent->employee_id);

    // زيارة Inertia: التحويل الخارجي العادي يعود 200 ومعه صفحة البوابة داخل
    // XHR فلا يتحرك شيء. المطلوب 409 + `X-Inertia-Location`.
    $this->actingAs($employee, 'employee')
        ->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => ''])
        ->post("/employee/payments/{$intent->id}/pay")
        ->assertStatus(409)
        ->assertHeader('X-Inertia-Location');
});

// ── ورقة السداد نافذةٌ فوق القائمة ──────────────────────────────────────

test('the payment sheet opens over the list, not on a page of its own', function () {
    $intent = payableIntent();

    $this->actingAs(Employee::findOrFail($intent->employee_id), 'employee')
        ->get("/employee/payments/{$intent->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('employee/payments/index')
            // القائمة تُصيَّر خلف النافذة: إغلاقها يترك الموظف حيث كان.
            ->has('intents.data')
            ->where('active.id', $intent->id)
            ->has('methods')
        );
});

test('the list alone carries no open sheet', function () {
    $intent = payableIntent();

    $this->actingAs(Employee::findOrFail($intent->employee_id), 'employee')
        ->get('/employee/payments')
        ->assertOk()
        // القائمة وحدها لا تُرسل `active` أصلاً — لا تُرسله فارغاً.
        ->assertInertia(fn ($page) => $page->missing('active'));
});

test('another employee’s claim is not openable', function () {
    $intent = payableIntent();
    $stranger = Employee::factory()->create();

    // 404 لا 403 — لا نؤكد وجود مطالبة ليست له.
    $this->actingAs($stranger, 'employee')
        ->get("/employee/payments/{$intent->id}")
        ->assertNotFound();
});
