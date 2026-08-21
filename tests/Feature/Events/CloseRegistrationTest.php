<?php

use App\Enums\WalletTransactionType;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventStatusHistory;
use App\Models\JobRun;
use App\Models\Notification;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use App\Services\Wallet\LedgerService;

// H §9/§10 + A10 (H §12.3): عند registration_closes_at — تثبيت العدد؛ booked
// والعدد كافٍ ← awaiting_payment ← خط التحصيل: دعم مغطٍّ كلياً (المسار أ) ←
// حجز + استقطاع + confirmed فوراً؛ حصص مستحقة ← مطالبات دفع وتبقى
// awaiting_payment حتى يدفع الجميع؛ والعدد ناقص ← cancelled_min_not_met بلا
// استقطاع على أي طرف.

function closableEvent(int $reserved, int $min, float $subsidy = 0, int $walletHalalas = 0): array
{
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'capacity' => 10,
        'min_participants' => $min,
        'participants_count' => 0,
        'status' => 'open',
        // يومان لا يوم واحد: `registration_closes_at` يُشتق بـ24 ساعة قبل البدء،
        // فـ«غداً 20:00» يجعل التسجيل مغلقاً كلما شُغّلت الحزمة بعد 20:00 (هشاشة زمنية).
        'event_date' => now()->addDays(2)->toDateString(),
        'start_time' => '20:00',
        'total_amount' => 300.0,
        'company_subsidy' => $subsidy, // subsidy_type=fixed + subsidy_value هللات
        'cost_per_person' => $min > 0 ? (300.0 - min($subsidy, 300.0)) / $min : 300.0, // السقف الملزم
        'budget_deducted_at' => null,
    ]);

    if ($walletHalalas > 0) {
        app(LedgerService::class)->credit(
            Wallet::subFor($community),
            WalletTransactionType::TopUp,
            $walletHalalas,
            'test:fund:'.$community->id,
        );
    }

    $service = app(ParticipationService::class);
    for ($i = 0; $i < $reserved; $i++) {
        $employee = Employee::factory()->create(['company_id' => $company->id]);
        $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);
        $service->join($event->fresh(), $employee);
    }

    // قبول المزوّد (يمر عبر pending_provider إذا بُلغ الحد) ثم إغلاق التسجيل.
    $event = $event->fresh();
    if ($event->status === 'pending_provider') {
        app(EventStateMachine::class)->providerAccepted($event);
    }

    $event->forceFill(['registration_closes_at' => now()->subMinutes(2)])->save();

    return [$event->fresh(), $community];
}

it('closes registration: fully subsidised (Path A) goes awaiting_payment then confirmed with a filled snapshot', function () {
    // الدعم = الإجمالي (المسار أ) والرصيد يغطيه ⇒ لا حصص ⇒ تأكيد فوري.
    [$event] = closableEvent(reserved: 4, min: 3, subsidy: 300.0, walletHalalas: 30000);
    expect($event->status)->toBe('booked');

    $this->artisan('app:close-registration')->assertSuccessful();

    $fresh = $event->fresh();

    expect($fresh->status)->toBe('confirmed')
        ->and($fresh->event_snapshot)->not->toBeNull()
        ->and($fresh->event_snapshot['event']['participants_count'])->toBe(4)
        // A10 — H §12.10: الحقول المالية بالهللة مملوءة في اللقطة.
        ->and($fresh->event_snapshot['financial']['subsidy_halalas'])->toBe(30000)
        ->and($fresh->event_snapshot['financial']['share_per_participant_halalas'])->toBe(0);

    // المسار كاملاً في السجل: booked ← awaiting_payment ← confirmed.
    $trail = EventStatusHistory::where('event_id', $event->id)->orderBy('id')->pluck('to_status')->all();
    expect(array_slice($trail, -2))->toBe(['awaiting_payment', 'confirmed']);
});

it('holds then captures the community subsidy at close (A10), not at provider acceptance', function () {
    // دعم كامل (٣٠٠) — hold عند الإغلاق ثم capture عند اكتمال التحصيل.
    [$event] = closableEvent(reserved: 3, min: 2, subsidy: 300.0, walletHalalas: 40000);

    // قبل الإغلاق: قبول المزوّد لم يستقطع شيئاً (H §9: booked بلا أثر مالي).
    expect(WalletTransaction::where('reference_id', $event->id)->where('reference_type', Event::class)->exists())->toBeFalse()
        ->and($event->budget_deducted_at)->toBeNull();

    $this->artisan('app:close-registration')->assertSuccessful();

    $hold = WalletTransaction::where('idempotency_key', "hold:event:{$event->id}:subsidy-hold")->first();
    $capture = WalletTransaction::where('idempotency_key', "capture:event:{$event->id}:subsidy-hold")->first();

    expect($hold)->not->toBeNull()
        ->and($hold->amount_halalas)->toBe(30000)
        ->and($capture)->not->toBeNull()
        ->and($capture->amount_halalas)->toBe(30000)
        ->and($event->fresh()->budget_deducted_at)->not->toBeNull()
        ->and($event->fresh()->status)->toBe('confirmed');
});

it('cancels min-not-met on the SECOND failure with no money moved and alerts provider, participants, and leader', function () {
    // بلغت الحد (5) فقبل المزوّد، ثم انسحب ثلاثة قبل الإغلاق — نزل العدد
    // تحت الحد وهي booked. المحاولة الأولى استُهلكت (H §8 — A8): الإغلاق
    // الناقص التالي هو «فشل المحاولة الثانية» = الإلغاء النهائي.
    [$event, $community] = closableEvent(reserved: 5, min: 5);
    expect($event->status)->toBe('booked');

    $event->forceFill(['registration_closes_at' => now()->addHours(2)])->save();

    $service = app(ParticipationService::class);
    foreach ($event->reservedParticipants()->limit(3)->get() as $withdrawing) {
        $service->withdraw($event->fresh(), Employee::withoutGlobalScopes()->find($withdrawing->id));
    }

    $event->forceFill([
        'registration_closes_at' => now()->subMinutes(2),
        'reschedule_attempt' => 1, // أعيدت جدولتها من قبل — هذه المحاولة الثانية
        'original_starts_at' => $event->starts_at->copy()->subDays(7),
    ])->save();
    $event = $event->fresh();
    expect($event->participants_count)->toBe(2);

    $this->artisan('app:close-registration')->assertSuccessful();

    $fresh = $event->fresh();

    expect($fresh->status)->toBe('cancelled_min_not_met')
        ->and(WalletTransaction::where('reference_id', $event->id)->exists())->toBeFalse(); // لا استقطاع على أي طرف

    expect(Notification::where('notifiable_id', $event->partner_id)
        ->where('title', 'إلغاء حجز — لم يكتمل العدد')->exists())->toBeTrue();
});

it('is idempotent — running close twice processes the event once', function () {
    [$event] = closableEvent(reserved: 4, min: 3, subsidy: 300.0, walletHalalas: 30000);

    $this->artisan('app:close-registration')->assertSuccessful();
    $this->artisan('app:close-registration')->assertSuccessful();

    expect(JobRun::where('job', 'event:close-registration')
        ->where('entity_id', $event->id)->count())->toBe(1)
        ->and(EventStatusHistory::where('event_id', $event->id)->where('to_status', 'awaiting_payment')->count())->toBe(1)
        ->and(EventStatusHistory::where('event_id', $event->id)->where('to_status', 'confirmed')->count())->toBe(1);
});

it('reschedules an under-minimum open event once at close instead of leaving it to die (H §8 — A8)', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'capacity' => 10,
        'min_participants' => 5,
        'participants_count' => 1,
        'status' => 'open',
        // يومان لا يوم واحد: `registration_closes_at` يُشتق بـ24 ساعة قبل البدء،
        // فـ«غداً 20:00» يجعل التسجيل مغلقاً كلما شُغّلت الحزمة بعد 20:00 (هشاشة زمنية).
        'event_date' => now()->addDays(2)->toDateString(),
        'start_time' => '20:00',
    ]);
    $originalStartsAt = $event->fresh()->starts_at->copy();
    $event->forceFill(['registration_closes_at' => now()->subMinute()])->save();

    $this->artisan('app:close-registration')->assertSuccessful();

    $fresh = $event->fresh();
    expect($fresh->status)->toBe('open') // نفس السجل ما زال مفتوحاً بالموعد الجديد
        ->and($fresh->reschedule_attempt)->toBe(1)
        ->and($fresh->starts_at->toDateTimeString())->toBe($originalStartsAt->copy()->addDays(7)->toDateTimeString());
});

it('still expires an open event whose start passes without close processing (H §9: without reschedule)', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'capacity' => 10,
        'min_participants' => 5,
        'participants_count' => 1,
        'status' => 'open',
        // يومان لا يوم واحد: `registration_closes_at` يُشتق بـ24 ساعة قبل البدء،
        // فـ«غداً 20:00» يجعل التسجيل مغلقاً كلما شُغّلت الحزمة بعد 20:00 (هشاشة زمنية).
        'event_date' => now()->addDays(2)->toDateString(),
        'start_time' => '20:00',
    ]);
    // بلا وقت إغلاق — لم تمر بمسار الإغلاق/إعادة الجدولة إطلاقاً
    $event->forceFill(['registration_closes_at' => null])->save();

    $this->travelTo($event->fresh()->starts_at->copy()->addMinute());
    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    expect($event->fresh()->status)->toBe('expired'); // H §9: مرّ الموعد وهي open دون إعادة جدولة
});
