<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\InvoiceItem;
use App\Models\Partner;
use App\Models\PlatformFeeInvoice;
use Illuminate\Support\Carbon;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 10 (H §23)
| «توليد فاتورة شهرية لشركة بها موظفون فُعّلوا وآخرون لم يُفعّلوا وثالث غادر خلال الدورة»
|--------------------------------------------------------------------------
|
| تعريف «الموظف المفعّل» (H §12.8) حرفياً: **شارك في فعالية واحدة على الأقل
| انتقلت إلى `completed` خلال الدورة، ولم يُسجَّل غائباً — ويُحتسب مرة واحدة
| مهما تعددت فعالياته**، و«موظف غادر خلال الدورة يُحتسب إن كان قد فُعّل قبل
| مغادرته».
|
| الخليط المفحوص هنا ستة موظفين:
|
| | الموظف | الحالة                                   | يُفوتر؟ |
| |--------|------------------------------------------|---------|
| | أ      | حضر فعالية واحدة                          | نعم     |
| | ب      | حضر فعاليتين في الدورة                    | نعم — مرة واحدة |
| | ج      | حجز مقعده وسُجِّل **غائباً**               | لا      |
| | د      | لم يشارك في شيء                           | لا      |
| | هـ     | حضر ثم **غادر الشركة** يوم 15             | نعم     |
| | و      | حضر فعالية اكتملت في **الشهر السابق**     | لا      |
|
| فالوعاء = 3 × 300.00 = 900.00، والضريبة 15% **تُضاف** = 135.00،
| والإجمالي 1,035.00، والاستحقاق خلال 15 يوماً من الإصدار (18 سبتمبر).
*/

test('سيناريو 10 — فاتورة شهرية بخليط: مفعّل ومكرر وغائب وغير مشارك ومغادر وسابق للدورة', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create([
        'contract_fee_per_activated_employee' => 30_000,   // 300.00 من العقد
        'contract_monthly_minimum' => null,                // بلا حد أدنى في هذا العقد
    ]);
    $community = Community::factory()->create(['company_id' => $company->id]);
    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);

    // ── فعالية الدورة الأولى: ثلاثة حضروا وواحد سُجِّل غائباً ──────────────
    ['attendees' => $attendees, 'absentees' => $absentees] = a11CompletedEvent([
        'company' => $company,
        'community' => $community,
        'partner' => $partner,
        'attendees' => 3,
        'absent' => 1,
        'completed_at' => Carbon::parse('2026-08-10 20:00'),
    ]);

    [$alpha, $beta, $epsilon] = $attendees;
    $gamma = $absentees[0];                                 // غائب

    // ── فعالية ثانية داخل الدورة يحضرها «ب» — لا يُحتسب مرتين ──────────────
    a11CompletedEvent([
        'company' => $company,
        'community' => $community,
        'partner' => $partner,
        'attendees' => 0,
        'completed_at' => Carbon::parse('2026-08-18 20:00'),
    ]);

    EventParticipant::create([
        'event_id' => Event::where('company_id', $company->id)->orderByDesc('id')->value('id'),
        'employee_id' => $beta->id,
        'seat_status' => 'reserved',
        'payment_status' => 'paid',
        'attendance_status' => 'attended',
        'joined_at' => Carbon::parse('2026-08-17'),
    ]);

    // ── «د»: موظف لم يشارك في شيء ─────────────────────────────────────────
    $delta = Employee::factory()->create(['company_id' => $company->id]);

    // ── «و»: حضر فعالية اكتملت في الشهر السابق للدورة ─────────────────────
    ['attendees' => $previousCycle] = a11CompletedEvent([
        'company' => $company,
        'community' => $community,
        'partner' => $partner,
        'attendees' => 1,
        'completed_at' => Carbon::parse('2026-07-20 20:00'),
    ]);
    $waw = $previousCycle[0];

    // ── «هـ»: فُعّل ثم غادر الشركة يوم 15 من الدورة ───────────────────────
    CompanyMembership::where('employee_id', $epsilon->id)
        ->update(['left_at' => Carbon::parse('2026-08-15 10:00'), 'status' => 'inactive']);

    // ── الإصدار: اليوم الثالث من الشهر التالي (H §12.8) ───────────────────
    $this->travelTo(Carbon::parse('2026-09-03 03:00'));
    $this->artisan('app:generate-monthly-invoices')->assertSuccessful();

    $invoice = PlatformFeeInvoice::where('company_id', $company->id)->firstOrFail();
    $activated = $invoice->metadata['activated_employee_ids'];

    expect($invoice->period_key)->toBe('2026-08')
        ->and($invoice->status)->toBe(PlatformFeeInvoice::STATUS_ISSUED)
        // ثلاثة مفعّلين: أ · ب (مرة واحدة رغم فعاليتين) · هـ (المغادر).
        ->and($invoice->activated_employees_count)->toBe(3)
        ->and($activated)->toContain($alpha->id, $beta->id, $epsilon->id)
        // ولا الغائب، ولا غير المشارك، ولا صاحب الشهر السابق.
        ->and($activated)->not->toContain($gamma->id)
        ->and($activated)->not->toContain($delta->id)
        ->and($activated)->not->toContain($waw->id)
        // المغادر محتسَب وموثَّق عدده على الفاتورة.
        ->and($invoice->departed_activated_count)->toBe(1)
        // الأرقام: 3 × 300.00 = 900.00 · ضريبة 15% تُضاف = 135.00 · 1,035.00.
        ->and($invoice->fees_subtotal_halalas)->toBe(90_000)
        ->and($invoice->minimum_adjustment_halalas)->toBe(0)
        ->and($invoice->subtotal_halalas)->toBe(90_000)
        ->and($invoice->vat_amount_halalas)->toBe(13_500)
        ->and($invoice->total_amount_halalas)->toBe(103_500)
        // الاستحقاق خلال 15 يوماً من الإصدار.
        ->and($invoice->issued_at->toDateString())->toBe('2026-09-03')
        ->and($invoice->due_at->toDateString())->toBe('2026-09-18')
        // الصفة الضريبية: تيمات **أصيل** في رسوم النظام وهي المُصدِرة (H §12.9).
        ->and($invoice->tax_treatment)->toBe('principal')
        ->and($invoice->invoice_issuer)->toBe('teamat')
        // ⚠️ حاجز مقصود: لا فاتورة حقيقية قبل اعتماد المحاسب القانوني.
        ->and($invoice->issuance_mode)->toBe(PlatformFeeInvoice::MODE_PROVISIONAL)
        ->and(config('billing.real_invoices_enabled'))->toBeFalse();

    // بند واحد فقط (رسوم التفعيل) — لا بند حد أدنى في عقد بلا حد أدنى.
    $lines = InvoiceItem::where('platform_fee_invoice_id', $invoice->id)->get();

    expect($lines)->toHaveCount(1)
        ->and($lines->first()->type)->toBe(InvoiceItem::TYPE_ACTIVATION_FEE)
        ->and($lines->first()->quantity)->toBe(3)
        ->and($lines->first()->unit_amount_halalas)->toBe(30_000)
        ->and($lines->first()->total_amount_halalas)->toBe(103_500);

    // إعادة تشغيل المولّد لا تُصدر فاتورة ثانية للدورة نفسها.
    $this->artisan('app:generate-monthly-invoices')->assertSuccessful();
    expect(PlatformFeeInvoice::where('company_id', $company->id)->count())->toBe(1);
});
