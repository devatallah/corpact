<?php

use App\Models\Employee;
use App\Models\EmployeePaymentInvoice;
use App\Models\Event;
use App\Models\Partner;
use App\Models\PaymentIntent;
use App\Services\Billing\EmployeeInvoiceService;
use App\Services\Payments\CollectionService;

/**
 * مستند حصة الموظف — ومن هو بائعه.
 *
 * المصفوفة الضريبية (H §12.9) تصنّف قيمة النشاط **وكالة** ومُصدِرها المزوّد،
 * فالمستند يصدر باسمه لا باسم تيمات: تيمات تحصّل بصفتها التاجر المسجَّل لا
 * بصفتها المورّد. نسبة التوريد إلى غير مورّده خطأ ضريبي لا خطأ عرض.
 */
function paidIntent(array $partnerAttributes = []): PaymentIntent
{
    $partner = Partner::factory()->create($partnerAttributes + ['vat_number' => '300000000000003']);
    $event = Event::factory()->create([
        'status' => 'awaiting_payment',
        'partner_id' => $partner->id,
        // نصاب مكتمل بمشارك واحد: بدونه يقرر التقييم بعد السداد أن التحصيل
        // فشل فيُسترد المبلغ، فيُختبر مسار غير الذي نقصده.
        'min_participants' => 1,
        'capacity' => 4,
        'participants_count' => 1,
    ]);
    $employee = Employee::factory()->create(['company_id' => $event->company_id, 'name' => 'أحمد السالم']);

    $event->participants()->attach($employee->id, [
        'seat_status' => 'reserved',
        'payment_status' => 'due',
        'joined_at' => now(),
    ]);

    $intent = PaymentIntent::query()->create([
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

    app(CollectionService::class)->markIntentPaid($intent);

    return $intent->fresh();
}

test('paying a share issues exactly one document, numbered and stamped', function () {
    $intent = paidIntent();
    $invoice = EmployeePaymentInvoice::query()->sole();

    expect($invoice->payment_intent_id)->toBe($intent->id)
        ->and($invoice->serial)->toStartWith('TMT-EMP-')
        ->and($invoice->total_amount_halalas)->toBe(8750)
        ->and($invoice->vat_amount_halalas)->toBe(1142)
        ->and($invoice->buyer_name)->toBe('أحمد السالم');
});

test('the seller is the provider, because the matrix calls this an agency', function () {
    $intent = paidIntent(['name' => 'مرافق الرياض للبادل']);
    $invoice = EmployeePaymentInvoice::query()->sole();

    // تيمات ليست المورّد هنا مهما كانت هي من حصّلت المبلغ.
    expect($invoice->invoice_issuer)->toBe('provider')
        ->and($invoice->tax_treatment)->toBe('agent')
        ->and($invoice->seller_name)->toBe('مرافق الرياض للبادل')
        ->and($invoice->seller_name)->not->toBe(config('billing.invoice.seller_name'))
        ->and($intent->status)->toBe(PaymentIntent::STATUS_PAID);
});

test('flipping the matrix to principal moves the seller to Teamat, with no code change', function () {
    config()->set('billing.tax.activity_value', ['treatment' => 'principal', 'issuer' => 'teamat']);
    config()->set('billing.invoice.seller_name', 'تيمات');
    config()->set('billing.invoice.seller_vat_number', '310000000000003');

    paidIntent();

    expect(EmployeePaymentInvoice::query()->sole()->seller_name)->toBe('تيمات');
});

test('it stays provisional while real invoicing is off', function () {
    config()->set('billing.real_invoices_enabled', false);

    paidIntent();

    expect(EmployeePaymentInvoice::query()->sole()->isProvisional())->toBeTrue();
});

test('a provider without a VAT number gets no QR — an unreadable code is worse than none', function () {
    paidIntent(['vat_number' => null]);
    $invoice = EmployeePaymentInvoice::query()->sole();

    expect($invoice->qr_payload)->toBeNull()
        ->and($invoice->serial)->not->toBeEmpty();
});

test('a QR is emitted when the seller is fully identified, carrying the ZATCA fields', function () {
    paidIntent();
    $invoice = EmployeePaymentInvoice::query()->sole();

    expect($invoice->qr_payload)->not->toBeNull();

    $decoded = base64_decode((string) $invoice->qr_payload);

    expect($decoded)->toContain('300000000000003')
        // الإجمالي والضريبة بالريال كما يقرأهما الماسح.
        ->and($decoded)->toContain('87.50')
        ->and($decoded)->toContain('11.42');
});

test('a second issuance attempt returns the same document, never a second serial', function () {
    $intent = paidIntent();
    $first = EmployeePaymentInvoice::query()->sole();

    // إعادة المحاولة (ويبهوك مكرر، تشغيل يدوي) لا تُنتج رقماً ثانياً: سلسلة
    // ضريبية بترقيم مكرر لمطالبة واحدة عيب لا يُصلَح لاحقاً.
    $again = app(EmployeeInvoiceService::class)->issueFor($intent->fresh());

    expect($again->id)->toBe($first->id)
        ->and(EmployeePaymentInvoice::query()->count())->toBe(1);
});

test('the employee sees the document on the payment screen', function () {
    $intent = paidIntent();

    $this->actingAs(Employee::findOrFail($intent->employee_id), 'employee')
        ->get("/employee/payments/{$intent->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('activeInvoice.serial', EmployeePaymentInvoice::query()->sole()->serial)
            ->where('activeInvoice.provisional', true)
        );
});
