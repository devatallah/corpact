<?php

use App\Enums\Role;
use App\Events\EventCompleted;
use App\Jobs\CompleteEvent;
use App\Models\ActivityLog;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Partner;
use App\Models\ProviderReliabilityLog;
use App\Models\User;
use App\Services\Provider\ReliabilityService;
use Illuminate\Validation\ValidationException;

// A9 — مؤشر الموثوقية (H §11): يبدأ 80، ‎+2 قبول في المهلة، −3 رد متأخر،
// −1 رفض، −15 إلغاء بعد القبول، +3 اكتمال بلا مشاكل؛ سجل لكل تغيّر؛ مخفي
// قبل 10 عينات؛ المزوّد يرى سلوكياته فقط؛ التعديل اليدوي للأدمن بسبب موثَّق.

function reliabilityEvent(Partner $partner, string $status = 'pending_provider'): array
{
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $creator = Employee::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'partner_id' => $partner->id,
        'company_id' => $company->id,
        'community_id' => $community->id,
        'created_by' => $creator->id,
        'event_date' => now()->addDays(2)->toDateString(),
        'start_time' => '18:00',
        'duration_minutes' => 90,
        'status' => 'open',
    ]);
    $event->update(['status' => $status]);

    return [$event, EventProviderRequest::where('event_id', $event->id)->firstOrFail()];
}

test('accept within the deadline is +2, reject is −1 — each logged as a sample', function () {
    $partner = Partner::factory()->create();
    expect($partner->reliability_score)->toBe(80);

    [, $request] = reliabilityEvent($partner);
    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.accept', $request))
        ->assertSessionHasNoErrors();

    expect($partner->fresh()->reliability_score)->toBe(82)
        ->and($partner->fresh()->reliability_samples)->toBe(1);

    [, $second] = reliabilityEvent($partner);
    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.reject', $second), ['reason' => 'مشغول'])
        ->assertSessionHasNoErrors();

    expect($partner->fresh()->reliability_score)->toBe(81)
        ->and($partner->fresh()->reliability_samples)->toBe(2)
        ->and(ProviderReliabilityLog::where('partner_id', $partner->id)->count())->toBe(2);

    $rejectLog = ProviderReliabilityLog::where('reason', 'reject')->first();
    expect($rejectLog->score_before)->toBe(82)
        ->and($rejectLog->score_after)->toBe(81)
        ->and($rejectLog->delta)->toBe(-1);
});

test('a clean completion credits +3 through the completion listener, once only', function () {
    $partner = Partner::factory()->create();
    [$event, $request] = reliabilityEvent($partner);

    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.accept', $request))
        ->assertSessionHasNoErrors();
    $scoreAfterAccept = $partner->fresh()->reliability_score;

    // الفعالية تمضي: booked → … → in_progress ثم تكتمل بانتهاء وقتها
    $event->forceFill(['status' => 'in_progress'])->save();
    $this->travelTo($event->fresh()->endsAt()->addMinutes(5));

    CompleteEvent::dispatchSync($event->id);

    expect($event->fresh()->status)->toBe('completed')
        ->and($partner->fresh()->reliability_score)->toBe($scoreAfterAccept + 3);

    // إعادة الإطلاق لا تضاعف الأثر (idempotent)
    CompleteEvent::dispatchSync($event->id);
    event(new EventCompleted($event->id));

    expect($partner->fresh()->reliability_score)->toBe($scoreAfterAccept + 3)
        ->and(ProviderReliabilityLog::where('reason', 'event_completed_clean')->count())->toBe(1);
});

test('the score is clamped to [0, 100]', function () {
    $partner = Partner::factory()->create(['reliability_score' => 5]);
    $service = app(ReliabilityService::class);

    $service->apply($partner, ProviderReliabilityLog::REASON_CANCEL_AFTER_ACCEPT);
    expect($partner->fresh()->reliability_score)->toBe(0);

    $partner->update(['reliability_score' => 99]);
    $service->apply($partner, ProviderReliabilityLog::REASON_COMPLETED_CLEAN);
    expect($partner->fresh()->reliability_score)->toBe(100);
});

test('the score is hidden from suggestion payloads until 10 samples exist', function () {
    $partner = Partner::factory()->create(['reliability_samples' => 9]);
    expect($partner->reliabilityVisible())->toBeFalse();

    $partner->update(['reliability_samples' => 10]);
    expect($partner->fresh()->reliabilityVisible())->toBeTrue();
});

test('the provider sees behaviors only — acceptance rate and average response time, never the number', function () {
    $partner = Partner::factory()->create();

    [, $first] = reliabilityEvent($partner);
    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.accept', $first))
        ->assertSessionHasNoErrors();

    [, $second] = reliabilityEvent($partner);
    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.reject', $second), ['reason' => 'مشغول'])
        ->assertSessionHasNoErrors();

    $response = $this->actingAs($partner, 'partner')
        ->get(route('partner.reliability.index'))
        ->assertOk();

    $behaviors = $response->viewData('page')['props']['behaviors'];
    expect($behaviors['acceptance_rate'])->toBe(50.0)
        ->and($behaviors['total_requests'])->toBe(2)
        ->and($behaviors['avg_response_minutes'])->not->toBeNull();

    expect(json_encode($response->viewData('page')['props']))->not->toContain('reliability_score');
});

test('platform admin adjusts the score manually with a mandatory documented reason, audited', function () {
    $partner = Partner::factory()->create();
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    // بلا سبب → مرفوض
    $this->actingAs($admin, 'admin')
        ->post(route('admin.providers.reliability.adjust', $partner), ['delta' => -10, 'reason' => ''])
        ->assertSessionHasErrors('reason');

    $this->actingAs($admin, 'admin')
        ->post(route('admin.providers.reliability.adjust', $partner), [
            'delta' => -10,
            'reason' => 'شكاوى متكررة موثقة من ثلاث فعاليات',
        ])->assertRedirect()->assertSessionHasNoErrors();

    $partner->refresh();
    expect($partner->reliability_score)->toBe(70)
        // التعديل اليدوي لا يُحتسب عينة
        ->and($partner->reliability_samples)->toBe(0);

    $log = ProviderReliabilityLog::where('reason', 'manual_adjustment')->first();
    expect($log->note)->toContain('شكاوى متكررة')
        ->and($log->counts_as_sample)->toBeFalse()
        ->and($log->actor_user_id)->toBe($admin->id);

    expect(ActivityLog::where('type', 'provider_reliability_adjusted')->exists())->toBeTrue();
});

test('the manual adjustment endpoint is closed to non-admins', function () {
    $partner = Partner::factory()->create();

    $this->actingAs($partner, 'partner')
        ->post(route('admin.providers.reliability.adjust', $partner), ['delta' => 50, 'reason' => 'رفع ذاتي'])
        ->assertRedirect(); // إعادة توجيه لتسجيل دخول الأدمن

    expect($partner->fresh()->reliability_score)->toBe(80);
});

test('a manual-only adjustment throws without a reason at the service layer too', function () {
    $partner = Partner::factory()->create();
    $admin = User::factory()->create();

    expect(fn () => app(ReliabilityService::class)->adjustManually($partner, 5, '   ', $admin->id))
        ->toThrow(ValidationException::class);
});
