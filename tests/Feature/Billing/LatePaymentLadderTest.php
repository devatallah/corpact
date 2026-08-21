<?php

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\EventTemplate;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\PlatformFeeInvoice;
use App\Services\Billing\InvoiceArrearsService;
use App\Services\Billing\InvoiceService;
use App\Services\Employee\EventCreationService;
use App\Services\Events\TemplateGenerationService;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

// H §12.8: تنبيه بعد 7 أيام، ثم 15، ثم **إيقاف إنشاء فعاليات جديدة بعد 30
// يوماً** — «دون إيقاف الدخول ودون إلغاء الفعاليات المؤكدة». الإيقاف يقتصر
// على الإنشاء لأن «الموظف لم يخطئ».

function a11OverdueInvoice(int $daysOverdue, ?Company $company = null): PlatformFeeInvoice
{
    $company ??= Company::factory()->create(['contract_fee_per_activated_employee' => 30_000]);

    $issuedAt = Carbon::now()->subDays($daysOverdue + (int) config('billing.invoice.due_days'));

    return app(InvoiceService::class)->generateFor(
        $company,
        app(InvoiceService::class)->cycleFor($issuedAt->copy()->addMonth()),
        null,
        $issuedAt,
    );
}

test('a reminder goes out at 7 days and again at 15, once each', function () {
    fakeMessages();

    $invoice = a11OverdueInvoice(7);
    $company = $invoice->company;

    app(InvoiceArrearsService::class)->process();
    $invoice = $invoice->fresh();

    expect($invoice->reminder_7_sent_at)->not->toBeNull()
        ->and($invoice->reminder_15_sent_at)->toBeNull()
        ->and($invoice->blocked_at)->toBeNull()
        ->and($company->fresh()->eventCreationBlocked())->toBeFalse();

    $remindersAfterFirst = Notification::where('notifiable_type', Company::class)
        ->where('template_key', 'invoice.reminder')
        ->count();

    // إعادة التشغيل في نفس اليوم لا تكرر التنبيه.
    app(InvoiceArrearsService::class)->process();
    expect(Notification::where('template_key', 'invoice.reminder')->count())->toBe($remindersAfterFirst);

    // بعد 15 يوماً تنبيه ثانٍ ولا حجب بعد.
    Carbon::setTestNow(Carbon::now()->addDays(8));
    app(InvoiceArrearsService::class)->process();
    $invoice = $invoice->fresh();

    expect($invoice->reminder_15_sent_at)->not->toBeNull()
        ->and($invoice->blocked_at)->toBeNull()
        ->and($company->fresh()->eventCreationBlocked())->toBeFalse();

    Carbon::setTestNow();
});

test('after 30 days only event creation is blocked — never logins, never confirmed events', function () {
    fakeMessages();

    $invoice = a11OverdueInvoice(30);
    $company = $invoice->company->fresh();

    // فعالية مؤكدة قائمة قبل الحجب.
    ['event' => $confirmed] = a11CompletedEvent(['company' => $company, 'complete' => false]);

    test()->artisan('app:process-invoice-arrears')->assertSuccessful();

    $company = $company->fresh();

    expect($invoice->fresh()->blocked_at)->not->toBeNull()
        ->and($company->eventCreationBlocked())->toBeTrue()
        ->and($company->event_creation_block_reason)->toContain($invoice->serial)
        // الفعالية المؤكدة لم تُمس.
        ->and($confirmed->fresh()->status)->toBe('confirmed')
        // ولا شيء في الشركة يمنع الدخول: الحالة كما هي.
        ->and($company->status)->toBe($invoice->company->status);

    expect(ActivityLog::where('type', 'event_creation_blocked')->exists())->toBeTrue();
});

test('a blocked company cannot create a new event but its employees still log in', function () {
    fakeMessages();

    $invoice = a11OverdueInvoice(30);
    $company = $invoice->company->fresh();

    $community = Community::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);

    app(InvoiceArrearsService::class)->process();

    // الدخول يعمل — الحجب لا يمس الجلسات إطلاقاً.
    test()->post('/employee/otp/request', ['phone' => $employee->phone])->assertSessionHasNoErrors();

    expect(fn () => app(EventCreationService::class)->create($employee->fresh(), [
        'community_id' => $community->id,
        'partner_id' => Partner::factory()->create()->id,
        'category_id' => Category::factory()->create()->id,
        'venue_pricing_id' => 1,
        'venue_ids' => [1],
        'date' => now()->addWeek()->toDateString(),
        'time' => '20:00',
        'capacity' => 8,
        'min_participants' => 2,
    ]))->toThrow(ValidationException::class);
});

test('template generation is blocked for an arrears company too', function () {
    fakeMessages();

    $invoice = a11OverdueInvoice(30);
    $company = $invoice->company->fresh();

    app(InvoiceArrearsService::class)->process();

    $community = Community::factory()->create(['company_id' => $company->id]);
    $creator = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($creator->id, ['status' => 'active', 'joined_at' => now()]);

    $template = EventTemplate::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'created_by' => $creator->id,
        'status' => EventTemplate::STATUS_ACTIVE,
    ]);

    $result = app(TemplateGenerationService::class)->generateForTemplate($template->fresh());

    expect($result['generated'])->toBe(0);
});

test('paying the arrears lifts the block', function () {
    fakeMessages();

    $invoice = a11OverdueInvoice(30);
    $company = $invoice->company->fresh();

    app(InvoiceArrearsService::class)->process();
    expect($company->fresh()->eventCreationBlocked())->toBeTrue();

    app(InvoiceService::class)->markPaid($invoice->fresh(), a11FinanceAdmin('الأدمن المالي'), 'PAY-1');

    expect($company->fresh()->eventCreationBlocked())->toBeFalse()
        ->and(ActivityLog::where('type', 'event_creation_unblocked')->exists())->toBeTrue();
});

test('a second unpaid 30-day invoice keeps the block after the first is paid', function () {
    fakeMessages();

    // وقت مثبَّت: الفاتورتان يجب أن تقعا في دورتين مختلفتين (قيد فريد على
    // الشركة + الدورة)، وهذا يعتمد على تاريخ التشغيل.
    Carbon::setTestNow(Carbon::parse('2026-09-20 09:00'));

    $company = Company::factory()->create(['contract_fee_per_activated_employee' => 30_000]);

    $first = a11OverdueInvoice(40, $company);   // دورة 2026-07
    $second = a11OverdueInvoice(31, $company);  // دورة 2026-08

    expect($first)->not->toBeNull()->and($second)->not->toBeNull();

    app(InvoiceArrearsService::class)->process();
    expect($company->fresh()->eventCreationBlocked())->toBeTrue();

    app(InvoiceService::class)->markPaid($first->fresh(), a11FinanceAdmin('المالي1'), 'PAY-1');
    expect($company->fresh()->eventCreationBlocked())->toBeTrue();

    app(InvoiceService::class)->markPaid($second->fresh(), a11FinanceAdmin('المالي2'), 'PAY-2');
    expect($company->fresh()->eventCreationBlocked())->toBeFalse();

    Carbon::setTestNow();
});
