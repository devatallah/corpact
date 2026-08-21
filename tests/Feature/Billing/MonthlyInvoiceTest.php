<?php

use App\Models\AdminAlert;
use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\InvoiceItem;
use App\Models\Partner;
use App\Models\PlatformFeeInvoice;
use App\Services\Billing\InvoiceService;
use Illuminate\Support\Carbon;

// H §12.8 + G/الأدمن المالي §4: دورة ميلادية · الموظف المفعّل = شارك في
// فعالية اكتملت في الدورة ولم يُسجَّل غائباً، مرة واحدة · إصدار اليوم 3 ·
// استحقاق 15 يوماً · 15% ضريبة تُضاف · الحد الأدنى من العقد · ومن غادر
// خلال الدورة يُحتسب إن كان قد فُعّل قبل مغادرته.

// سيناريو القبول 10 نفسه في
// tests/Feature/Acceptance/Scenario10MonthlyInvoiceTest.php — هذا انحدار A11.
test('the cycle invoice counts activated, non-activated, absent and mid-cycle departed employees', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create(['contract_fee_per_activated_employee' => 30_000]); // 300.00
    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);

    // ثلاثة حضروا (منهم واحد حضر فعاليتين — يُحتسب مرة واحدة) وواحد غائب.
    ['event' => $event, 'attendees' => $attendees, 'absentees' => $absentees, 'community' => $community] = a11CompletedEvent([
        'company' => $company,
        'partner' => $partner,
        'attendees' => 3,
        'absent' => 1,
        'completed_at' => Carbon::parse('2026-08-10 20:00'),
    ]);

    // نفس الموظف في فعالية ثانية داخل الدورة — لا يُحتسب مرتين.
    a11CompletedEvent([
        'company' => $company,
        'community' => $community,
        'partner' => $partner,
        'attendees' => 0,
        'completed_at' => Carbon::parse('2026-08-18 20:00'),
    ]);

    EventParticipant::create([
        'event_id' => Event::where('company_id', $company->id)->orderByDesc('id')->value('id'),
        'employee_id' => $attendees[0]->id,
        'seat_status' => 'reserved',
        'payment_status' => 'paid',
        'attendance_status' => 'attended',
        'joined_at' => Carbon::parse('2026-08-17'),
    ]);

    // موظف لم يشارك في شيء — لا يُفوتر.
    Employee::factory()->create(['company_id' => $company->id]);

    // موظف فُعّل ثم غادر خلال الدورة — يُحتسب.
    $departed = $attendees[2];
    CompanyMembership::where('employee_id', $departed->id)
        ->update(['left_at' => Carbon::parse('2026-08-15 10:00'), 'status' => 'inactive']);

    // الدورة تُفوتر اليوم 3 من الشهر التالي.
    Carbon::setTestNow(Carbon::parse('2026-09-03 03:00'));
    test()->artisan('app:generate-monthly-invoices')->assertSuccessful();

    $invoice = PlatformFeeInvoice::where('company_id', $company->id)->firstOrFail();

    expect($invoice->period_key)->toBe('2026-08')
        // ثلاثة مفعّلين فقط: الغائب لا يُحتسب، ومن لم يشارك لا يُحتسب،
        // ومن حضر فعاليتين يُحتسب مرة واحدة، والمغادر يُحتسب.
        ->and($invoice->activated_employees_count)->toBe(3)
        ->and($invoice->departed_activated_count)->toBe(1)
        ->and($invoice->fees_subtotal_halalas)->toBe(90_000)
        ->and($invoice->subtotal_halalas)->toBe(90_000)
        // 15% تُضاف على الرسوم: 90000 × 15 ÷ 100 = 13500.
        ->and($invoice->vat_amount_halalas)->toBe(13_500)
        ->and($invoice->total_amount_halalas)->toBe(103_500)
        ->and($invoice->status)->toBe(PlatformFeeInvoice::STATUS_ISSUED)
        // الاستحقاق خلال 15 يوماً من الإصدار.
        ->and($invoice->due_at->toDateString())->toBe('2026-09-18')
        // الصفة الضريبية: تيمات أصيل في رسوم النظام وتصدر الفاتورة للشركة.
        ->and($invoice->tax_treatment)->toBe('principal')
        ->and($invoice->invoice_issuer)->toBe('teamat');

    // الغائب والموظف غير المشارك ليسا في قائمة المفعّلين.
    $activated = $invoice->metadata['activated_employee_ids'];
    expect($activated)->toContain($attendees[0]->id, $attendees[1]->id, $departed->id)
        ->and($activated)->not->toContain($absentees[0]->id);

    // إعادة التشغيل لا تنتج فاتورة ثانية.
    test()->artisan('app:generate-monthly-invoices')->assertSuccessful();
    expect(PlatformFeeInvoice::where('company_id', $company->id)->count())->toBe(1);

    Carbon::setTestNow();
});

test('the contractual monthly minimum is invoiced as its own line when fees fall short', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create([
        'contract_fee_per_activated_employee' => 30_000,   // 300.00
        'contract_monthly_minimum' => 500_000,             // 5,000.00
    ]);

    a11CompletedEvent([
        'company' => $company,
        'attendees' => 2,
        'completed_at' => Carbon::parse('2026-08-10 20:00'),
    ]);

    Carbon::setTestNow(Carbon::parse('2026-09-03 03:00'));
    test()->artisan('app:generate-monthly-invoices')->assertSuccessful();

    $invoice = PlatformFeeInvoice::where('company_id', $company->id)->firstOrFail();

    // 2 × 300 = 600 < 5,000 ⇒ فرق 4,400 بنداً مستقلاً والوعاء 5,000.
    expect($invoice->fees_subtotal_halalas)->toBe(60_000)
        ->and($invoice->minimum_adjustment_halalas)->toBe(440_000)
        ->and($invoice->subtotal_halalas)->toBe(500_000)
        ->and($invoice->vat_amount_halalas)->toBe(75_000)
        ->and($invoice->total_amount_halalas)->toBe(575_000);

    $lines = InvoiceItem::where('platform_fee_invoice_id', $invoice->id)->get();

    expect($lines)->toHaveCount(2)
        ->and($lines->pluck('type')->all())->toBe([InvoiceItem::TYPE_ACTIVATION_FEE, InvoiceItem::TYPE_MONTHLY_MINIMUM])
        ->and((int) $lines->sum('vat_amount_halalas'))->toBe(75_000)
        ->and((int) $lines->sum('total_amount_halalas'))->toBe(575_000);

    Carbon::setTestNow();
});

test('a company whose fees already exceed the minimum is invoiced on the fees alone', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create([
        'contract_fee_per_activated_employee' => 30_000,
        'contract_monthly_minimum' => 50_000, // 500.00 — أقل من الرسوم
    ]);

    a11CompletedEvent([
        'company' => $company,
        'attendees' => 3,
        'completed_at' => Carbon::parse('2026-08-10 20:00'),
    ]);

    Carbon::setTestNow(Carbon::parse('2026-09-03 03:00'));
    test()->artisan('app:generate-monthly-invoices')->assertSuccessful();

    $invoice = PlatformFeeInvoice::where('company_id', $company->id)->firstOrFail();

    expect($invoice->minimum_adjustment_halalas)->toBe(0)
        ->and($invoice->subtotal_halalas)->toBe(90_000)
        ->and(InvoiceItem::where('platform_fee_invoice_id', $invoice->id)->count())->toBe(1);

    Carbon::setTestNow();
});

test('a company with no contracted fee is skipped and the admin is alerted — never defaulted', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create([
        'contract_fee_per_activated_employee' => null,
        'contract_monthly_minimum' => null,
    ]);

    a11CompletedEvent([
        'company' => $company,
        'attendees' => 2,
        'completed_at' => Carbon::parse('2026-08-10 20:00'),
    ]);

    Carbon::setTestNow(Carbon::parse('2026-09-03 03:00'));
    test()->artisan('app:generate-monthly-invoices')->assertSuccessful();

    expect(PlatformFeeInvoice::where('company_id', $company->id)->count())->toBe(0)
        ->and(AdminAlert::where('key', 'billing.contract_terms_missing')->exists())->toBeTrue();

    Carbon::setTestNow();
});

test('events completed outside the cycle never enter it', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create(['contract_fee_per_activated_employee' => 30_000]);

    // فعالية في الشهر السابق للدورة.
    a11CompletedEvent([
        'company' => $company,
        'attendees' => 2,
        'completed_at' => Carbon::parse('2026-07-10 20:00'),
    ]);

    Carbon::setTestNow(Carbon::parse('2026-09-03 03:00'));
    test()->artisan('app:generate-monthly-invoices')->assertSuccessful();

    $invoice = PlatformFeeInvoice::where('company_id', $company->id)->firstOrFail();

    expect($invoice->activated_employees_count)->toBe(0)
        ->and($invoice->total_amount_halalas)->toBe(0);

    Carbon::setTestNow();
});

test('an already settled event still counts for the cycle it completed in', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create(['contract_fee_per_activated_employee' => 30_000]);
    ['event' => $event] = a11CompletedEvent([
        'company' => $company,
        'attendees' => 2,
        'completed_at' => Carbon::parse('2026-08-10 20:00'),
    ]);

    // الفعالية سُوّيت لاحقاً — الحالة صارت settled لا completed.
    $event->forceFill(['status' => 'settled'])->save();

    $cycle = app(InvoiceService::class)->cycleFor(Carbon::parse('2026-09-03'));

    expect(app(InvoiceService::class)->activationFor($company->fresh(), $cycle)['count'])->toBe(2);

    Carbon::setTestNow();
});

test('the invoice carries fatoora-ready fields', function () {
    fakeMessages();

    config(['billing.invoice.seller_vat_number' => '300000000000003']);

    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create([
        'contract_fee_per_activated_employee' => 30_000,
        'vat_number' => '311111111111113',
    ]);

    a11CompletedEvent(['company' => $company, 'attendees' => 1, 'completed_at' => Carbon::parse('2026-08-10 20:00')]);

    Carbon::setTestNow(Carbon::parse('2026-09-03 03:00'));
    test()->artisan('app:generate-monthly-invoices')->assertSuccessful();

    $invoice = PlatformFeeInvoice::where('company_id', $company->id)->firstOrFail();

    expect($invoice->serial)->toStartWith('TMT-INV-')
        ->and($invoice->invoice_uuid)->not->toBeNull()
        ->and($invoice->seller_vat_number)->toBe('300000000000003')
        ->and($invoice->buyer_vat_number)->toBe('311111111111113')
        ->and($invoice->qr_payload)->not->toBeNull()
        // ⚠️ الإصدار الحقيقي موقوف بانتظار المحاسب القانوني (H §12.9).
        ->and($invoice->issuance_mode)->toBe(PlatformFeeInvoice::MODE_PROVISIONAL)
        ->and(config('billing.real_invoices_enabled'))->toBeFalse();

    Carbon::setTestNow();
});

test('invoice serials are unique and sequential', function () {
    fakeMessages();

    Carbon::setTestNow(Carbon::parse('2026-09-03 03:00'));

    $service = app(InvoiceService::class);
    $cycle = $service->cycleFor();

    $serials = [];
    for ($i = 0; $i < 3; $i++) {
        $company = Company::factory()->create(['contract_fee_per_activated_employee' => 10_000]);
        $serials[] = $service->generateFor($company, $cycle)->serial;
    }

    expect($serials)->toHaveCount(3)
        ->and(array_unique($serials))->toHaveCount(3)
        ->and(PlatformFeeInvoice::orderBy('serial_sequence')->pluck('serial')->all())->toBe($serials);

    Carbon::setTestNow();
});
