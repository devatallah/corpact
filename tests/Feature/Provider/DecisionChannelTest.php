<?php

use App\Models\ActivityLog;
use App\Models\ActivityUnit;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Partner;
use App\Models\ProviderBranch;

// A9 — قناة القرار (H §11): الطلب يُنشأ حين تدخل الفعالية انتظار المزوّد،
// الإشعار يحمل رابطاً موقّعاً أحادي الاستخدام صالح 72 ساعة، القرار في اللوحة
// حصراً، وأول رد يثبّت الحالة — أي رد لاحق «تم اتخاذ القرار مسبقاً» ويُسجَّل.

function decisionSetup(array $eventOverrides = []): array
{
    $partner = Partner::factory()->create();
    $branch = ProviderBranch::factory()->create(['partner_id' => $partner->id]);
    $unit = ActivityUnit::factory()->create(['provider_branch_id' => $branch->id]);
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $creator = Employee::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create(array_merge([
        'partner_id' => $partner->id,
        'company_id' => $company->id,
        'community_id' => $community->id,
        'created_by' => $creator->id,
        'event_date' => now()->addDays(3)->toDateString(),
        'start_time' => '18:00',
        'duration_minutes' => 90,
        'status' => 'open',
    ], $eventOverrides));

    return [$partner, $unit, $event, $creator];
}

function sendToProvider(Event $event): EventProviderRequest
{
    $event->update(['status' => 'pending_provider']);

    return EventProviderRequest::where('event_id', $event->id)->firstOrFail();
}

test('a request is created with a 72h single-use signed link when the event needs a provider', function () {
    $messages = fakeMessages();
    [$partner, , $event] = decisionSetup();

    $request = sendToProvider($event);

    expect($request->status)->toBe('pending')
        ->and($request->quantity)->toBe(max(1, (int) $event->venues_count))
        ->and($request->link_token_hash)->not->toBeNull()
        ->and($request->sent_at->diffInHours($request->link_expires_at))->toEqualWithDelta(72, 1);

    // واتساب إشعار فقط: الرسالة تحمل الرابط وتنص على أن الرد النصي لا يُعتد به
    $message = collect($messages->sent)->firstWhere('purpose', 'provider_request');
    expect($message)->not->toBeNull()
        ->and($message['message'])->toContain('لا يُعتد به')
        ->and($message['message'])->toContain('/partner/requests-queue/link/');

    // idempotent — دخول الحالة مرة أخرى لا ينشئ طلباً ثانياً
    $event->update(['status' => 'open']);
    $event->update(['status' => 'pending_provider']);
    expect(EventProviderRequest::where('event_id', $event->id)->count())->toBe(1);
});

test('the deadline is 12h from send or 6h before the slot, whichever is sooner', function () {
    [, , $farEvent] = decisionSetup(['event_date' => now()->addDays(5)->toDateString()]);
    $farRequest = sendToProvider($farEvent);
    expect($farRequest->sent_at->diffInHours($farRequest->deadline_at))->toEqualWithDelta(12, 1);

    [, , $nearEvent] = decisionSetup([
        'event_date' => now()->addHours(10)->toDateString(),
        'start_time' => now()->addHours(10)->format('H:i'),
    ]);
    $nearRequest = sendToProvider($nearEvent);
    // 6 ساعات قبل الموعد أقرب من 12 ساعة
    expect($nearRequest->deadline_at->lte($nearRequest->sent_at->copy()->addHours(12)))->toBeTrue()
        ->and($nearRequest->deadline_at->diffInHours(now()))->toBeLessThanOrEqual(5);
});

test('the signed link opens the decision page once — the second open is refused as used', function () {
    $messages = fakeMessages();
    [$partner, , $event] = decisionSetup();
    $request = sendToProvider($event);

    $message = collect($messages->sent)->firstWhere('purpose', 'provider_request');
    preg_match('/(https?:\/\/\S+)/u', $message['message'], $m);
    $url = $m[1];

    // login required — الرابط مؤشر لا تجاوز للمصادقة
    $this->get($url)->assertRedirect();

    $this->actingAs($partner, 'partner')->get($url)
        ->assertRedirect(route('partner.provider-requests.decision', $request));

    expect($request->fresh()->link_used_at)->not->toBeNull();

    // أحادي الاستخدام: الفتح الثاني يُرفض ويُوجَّه للوحة
    $this->actingAs($partner, 'partner')->get($url)
        ->assertRedirect(route('partner.provider-requests.decision', $request))
        ->assertSessionHas('warning');
});

test('a tampered signed link is rejected', function () {
    $messages = fakeMessages();
    [$partner, , $event] = decisionSetup();
    sendToProvider($event);

    $message = collect($messages->sent)->firstWhere('purpose', 'provider_request');
    preg_match('/(https?:\/\/\S+)/u', $message['message'], $m);
    $tampered = preg_replace('/signature=\w{10}/', 'signature=0000000000', $m[1]);

    $this->actingAs($partner, 'partner')->get($tampered)->assertForbidden();
});

test('an expired link no longer opens but the panel decision page stays available', function () {
    $messages = fakeMessages();
    [$partner, , $event] = decisionSetup();
    $request = sendToProvider($event);

    $message = collect($messages->sent)->firstWhere('purpose', 'provider_request');
    preg_match('/(https?:\/\/\S+)/u', $message['message'], $m);

    $this->travel(73)->hours();

    // التوقيع المؤقت نفسه انتهى → 403 من middleware signed
    $this->actingAs($partner, 'partner')->get($m[1])->assertForbidden();

    // القرار من اللوحة ما زال متاحاً
    $this->actingAs($partner, 'partner')
        ->get(route('partner.provider-requests.decision', $request))
        ->assertOk();
});

test('first response wins — the second decision gets «تم اتخاذ القرار مسبقاً» and is logged', function () {
    [$partner, $unit, $event] = decisionSetup();
    $request = sendToProvider($event);
    $request->update(['activity_unit_id' => $unit->id]);

    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.accept', $request))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($request->fresh()->status)->toBe('accepted')
        ->and($event->fresh()->status)->toBe('booked');

    // رد لاحق (رفض) يُرفض ويُسجَّل
    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.reject', $request), ['reason' => 'تراجعت'])
        ->assertSessionHasErrors();

    expect($request->fresh()->status)->toBe('accepted')
        ->and(ActivityLog::where('type', 'provider_request_duplicate_response')->count())->toBe(1);
});

test('a provider proposes an alternative through the panel — the event moves to provider_alternative', function () {
    [$partner, , $event] = decisionSetup();
    $request = sendToProvider($event);

    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.propose-alternative', $request), [
            'proposed_date' => now()->addDays(4)->toDateString(),
            'proposed_start_time' => '20:00',
        ])->assertRedirect()->assertSessionHasNoErrors();

    expect($request->fresh()->status)->toBe('alternative_proposed')
        ->and($event->fresh()->status)->toBe('provider_alternative')
        ->and($event->alternatives()->count())->toBe(1);
});

test('the provider payload exposes the count and creator contact — never participant identities', function () {
    [$partner, , $event, $creator] = decisionSetup();
    $participant = Employee::factory()->create(['company_id' => $event->company_id, 'name' => 'سري للغاية']);
    $event->participants()->attach($participant->id, ['seat_status' => 'reserved', 'joined_at' => now()]);
    $request = sendToProvider($event);

    $response = $this->actingAs($partner, 'partner')
        ->get(route('partner.provider-requests.decision', $request))
        ->assertOk();

    $payload = json_encode($response->viewData('page')['props']['request'], JSON_UNESCAPED_UNICODE);

    expect($payload)->toContain('participants_count')
        ->and($payload)->toContain($creator->name)
        ->and($payload)->not->toContain('سري للغاية');
});

test('a foreign provider cannot see or decide the request — 404', function () {
    [, $unit, $event] = decisionSetup();
    $request = sendToProvider($event);
    $stranger = Partner::factory()->create();

    $this->actingAs($stranger, 'partner')
        ->get(route('partner.provider-requests.decision', $request))
        ->assertNotFound();

    $this->actingAs($stranger, 'partner')
        ->post(route('partner.provider-requests.accept', $request))
        ->assertNotFound();
});
