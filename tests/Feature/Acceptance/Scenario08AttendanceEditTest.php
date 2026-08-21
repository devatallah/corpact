<?php

use App\Models\ActivityLog;
use App\Models\EventParticipant;
use App\Models\ParticipantEvent;
use App\Models\PlatformFeeInvoice;
use App\Models\WalletTransaction;
use App\Services\Attendance\ActivationService;
use App\Services\Attendance\AttendanceService;
use App\Services\Competition\BoardService;
use App\Services\Competition\SeasonService;
use Illuminate\Support\Carbon;
use Tests\Support\AcceptanceWorld;
use Tests\Support\FinancialInvariants;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 8 (H §23) — «تعديل الحضور خلال 24 ساعة وأثره على اللوحة والفوترة»
|--------------------------------------------------------------------------
|
| الحضور تلقائي بالكامل عند الاكتمال (H §13)، وللقائد نافذة 24 ساعة يقلب فيها
| «حاضر ⇄ غائب». التعديل الواحد يجب أن يظهر في **مكانين معاً**:
|
| - **لوحة المواظبة**: الغائب يخرج منها (النقاط من الحضور لا من التسجيل).
| - **عدّاد الموظف المفعّل**: «شارك في فعالية مكتملة ولم يُسجَّل غائباً»
|   (H §12.8) — فينقص وعاء الفاتورة الشهرية بمقدار رسوم موظف واحد.
|
| الفارق عن اختبار A12 المكافئ: نصف «الفوترة» هنا **فاتورة حقيقية بأرقامها**
| لا عدّاد فقط — 3 مفعّلين × 300.00 + ضريبة 15% = 1,035.00.
*/

test('سيناريو 8 — تعديل حضور واحد داخل الـ24 ساعة يحرّك لوحة المواظبة وعدّاد الفوترة معاً', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-03 09:00'));

    // المسار أ كي يكون الحضور هو المتغيّر الوحيد (لا مطالبات دفع في الطريق).
    $world = AcceptanceWorld::build([
        'funding_mode' => 'community_wallet',
        'price' => 300.0,
        'wallet' => 50_000,
        'fee_per_activated_employee' => 30_000,   // 300.00 لكل موظف مفعّل
    ]);

    $event = $world->createEvent(min: 3, capacity: 8);
    $members = [];
    for ($i = 0; $i < 3; $i++) {
        $members[] = $world->joinNewMember($event)['employee'];
    }

    $world->providerAccepts($event->fresh());
    $world->closeRegistration($event->fresh());
    $event = $event->fresh();
    expect($event->status)->toBe('confirmed');

    // ── الاكتمال: أربعة حضروا تلقائياً بلا تدخل بشري ──────────────────────
    $this->travelTo($event->endsAt()->copy()->addMinutes(30));
    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();
    $event = $event->fresh();

    $seasons = app(SeasonService::class);
    $boards = app(BoardService::class);
    $activation = app(ActivationService::class);
    $season = $seasons->seasonFor($world->community, $event->completed_at);

    $cycleFrom = Carbon::parse('2026-08-01 00:00');
    $cycleTo = Carbon::parse('2026-08-31 23:59:59');

    expect($event->status)->toBe('completed')
        ->and(EventParticipant::where('event_id', $event->id)->pluck('attendance_status')->unique()->all())->toBe(['attended'])
        ->and($boards->consistencyBoard($season, 'individual'))->toHaveCount(4)
        ->and($activation->activatedCount($world->company->id, $cycleFrom, $cycleTo))->toBe(4)
        ->and(app(AttendanceService::class)->isWindowOpen($event))->toBeTrue();

    $ledgerRows = WalletTransaction::count();
    $flipped = $members[0];

    // ── التعديل داخل النافذة: القائد يسجّل غياب مشارك واحد ────────────────
    $this->actingAs($world->leader, 'employee')
        ->post("/employee/detail/{$event->id}/attendance/{$flipped->id}", [
            'attendance_status' => 'absent',
            'reason' => 'حجز مقعده ولم يحضر',
        ])
        ->assertSessionHas('success');

    expect($boards->consistencyBoard($season, 'individual'))->toHaveCount(3)
        ->and(collect($boards->consistencyBoard($season, 'individual'))->pluck('employee_id')->all())->not->toContain($flipped->id)
        ->and($activation->activatedCount($world->company->id, $cycleFrom, $cycleTo))->toBe(3)
        ->and($activation->isActivated($flipped, $cycleFrom, $cycleTo))->toBeFalse()
        // الأثر غير مالي بالكامل: لا حركة دفتر واحدة (H §13).
        ->and(WalletTransaction::count())->toBe($ledgerRows)
        // وكل تعديل يترك أثره في سجل المشارك وسجل النشاط.
        ->and(ParticipantEvent::where('event_id', $event->id)->where('employee_id', $flipped->id)->where('field', 'attendance_status')->where('to_value', 'absent')->exists())->toBeTrue()
        ->and(EventParticipant::where('event_id', $event->id)->where('employee_id', $flipped->id)->value('attendance_reason'))->toBe('حجز مقعده ولم يحضر');

    // ── والاتجاه المعاكس داخل النافذة نفسها يعيدهما معاً ──────────────────
    $this->actingAs($world->leader, 'employee')
        ->post("/employee/detail/{$event->id}/attendance/{$flipped->id}", [
            'attendance_status' => 'attended',
            'reason' => 'تبيّن أنه حضر متأخراً',
        ])
        ->assertSessionHas('success');

    expect($boards->consistencyBoard($season, 'individual'))->toHaveCount(4)
        ->and($activation->activatedCount($world->company->id, $cycleFrom, $cycleTo))->toBe(4);

    // الحقيقة النهائية: غائب.
    $this->actingAs($world->leader, 'employee')
        ->post("/employee/detail/{$event->id}/attendance/{$flipped->id}", [
            'attendance_status' => 'absent',
            'reason' => 'مراجعة نهائية — لم يحضر',
        ])
        ->assertSessionHas('success');

    expect($activation->activatedCount($world->company->id, $cycleFrom, $cycleTo))->toBe(3);

    // ── نصف «الفوترة»: الفاتورة الشهرية تُصدَر بثلاثة مفعّلين لا أربعة ─────
    $this->travelTo(Carbon::parse('2026-09-03 03:00'));
    $this->artisan('app:generate-monthly-invoices')->assertSuccessful();

    $invoice = PlatformFeeInvoice::where('company_id', $world->company->id)->firstOrFail();

    expect($invoice->period_key)->toBe('2026-08')
        ->and($invoice->activated_employees_count)->toBe(3)
        ->and($invoice->metadata['activated_employee_ids'])->not->toContain($flipped->id)
        ->and($invoice->fees_subtotal_halalas)->toBe(90_000)    // 3 × 300.00
        ->and($invoice->vat_amount_halalas)->toBe(13_500)       // 15% تُضاف على الرسوم
        ->and($invoice->total_amount_halalas)->toBe(103_500);   // 1,035.00

    // كل تعديل مسجَّل بالفاعل والسبب — مادة مؤشر «الفعالية الشبح» (H §13).
    // (تعديل القائد داخل النافذة يُسجَّل في سجل نشاط الشركة؛ استثناء أدمن تيمات
    // بعد إقفال النافذة هو ما يُرفع إضافةً إلى سجل التدقيق — كتالوج A15.)
    expect(ActivityLog::query()->where('type', 'attendance_edited')->where('subject_id', $event->id)->count())->toBe(3)
        ->and(ActivityLog::query()->where('type', 'attendance_edited')->latest('id')->value('actor_user_id'))
        ->toBe($world->leader->fresh()->user_id);

    FinancialInvariants::assertAll();
});
