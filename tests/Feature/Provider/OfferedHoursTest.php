<?php

use App\Models\ActivityUnit;
use App\Models\Partner;
use App\Models\ProviderBranch;
use App\Models\Slot;
use App\Models\Venue;
use App\Services\Provider\AvailabilityService;
use Illuminate\Support\Carbon;

/**
 * الساعات المعروضة على الملعب — وهل يحترمها الحجز فعلاً.
 *
 * كان جدول `slots` معزولاً: يُكتب بمسارات لا تستدعيها شاشة، ولا يقرؤه محرك
 * الحجز. بناء واجهة له بلا ربطه بالحجز كان سيُنتج الأسوأ: مزوّد يغلق وقتاً
 * ويُحجز فيه. هذه الاختبارات تحرس الربط.
 */
function offeredHoursWorld(): array
{
    $partner = Partner::factory()->create(['status' => 'active']);
    $venue = Venue::factory()->create(['partner_id' => $partner->id, 'status' => 'active']);
    $branch = ProviderBranch::factory()->create([
        'partner_id' => $partner->id,
        'status' => 'active',
        'working_hours' => collect(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])
            ->mapWithKeys(fn (string $day) => [$day => [['from' => '06:00', 'to' => '23:59']]])
            ->all(),
    ]);
    $unit = ActivityUnit::factory()->create([
        'provider_branch_id' => $branch->id,
        'venue_id' => $venue->id,
        'category_id' => $venue->category_id,
        'status' => 'active',
    ]);

    return [$partner, $venue, $unit->fresh()];
}

test('a venue with no offered hours stays bookable — silence is not a closure', function () {
    [, , $unit] = offeredHoursWorld();

    $available = app(AvailabilityService::class)
        ->isAvailable($unit, Carbon::tomorrow()->setTime(20, 0), 60);

    expect($available)->toBeTrue();
});

test('once hours are offered, a time outside them is not bookable', function () {
    [, $venue, $unit] = offeredHoursWorld();
    $day = Carbon::tomorrow();

    Slot::query()->create([
        'venue_id' => $venue->id,
        'date' => $day->toDateString(),
        'start_time' => '18:00',
        'end_time' => '20:00',
        'status' => Slot::STATUS_AVAILABLE,
    ]);

    $service = app(AvailabilityService::class);

    expect($service->isAvailable($unit, $day->copy()->setTime(18, 0), 60))->toBeTrue()
        // 21:00 خارج النافذة المعروضة — وهذا بالضبط ما كان يُحجز رغم إغلاقه.
        ->and($service->isAvailable($unit, $day->copy()->setTime(21, 0), 60))->toBeFalse()
        // يبدأ داخلها وينتهي خارجها — النافذة تُقاس بطرفيها لا ببدايتها.
        ->and($service->isAvailable($unit, $day->copy()->setTime(19, 30), 60))->toBeFalse();
});

test('a closed hour does not make the time bookable', function () {
    [, $venue, $unit] = offeredHoursWorld();
    $day = Carbon::tomorrow();

    Slot::query()->create([
        'venue_id' => $venue->id,
        'date' => $day->toDateString(),
        'start_time' => '18:00',
        'end_time' => '20:00',
        'status' => Slot::STATUS_BOOKED,
    ]);

    expect(app(AvailabilityService::class)->isAvailable($unit, $day->copy()->setTime(18, 0), 60))->toBeFalse();
});

test('a provider cannot write offered hours onto another provider’s venue', function () {
    [$mine] = offeredHoursWorld();
    [, $theirVenue] = offeredHoursWorld();

    // `exists:venues,id` وحده كان يقبل هذا. ومنذ صار الحجز يحترم الساعات،
    // صار قبولُه تحكّماً في توفّر منافس.
    $this->actingAs($mine, 'partner')
        ->post('/partner/schedule', [
            'venue_id' => $theirVenue->id,
            'date' => Carbon::tomorrow()->toDateString(),
            'start_time' => '18:00',
            'end_time' => '20:00',
        ])
        ->assertSessionHasErrors('venue_id');

    expect(Slot::query()->where('venue_id', $theirVenue->id)->exists())->toBeFalse();
});

test('a provider cannot delete another provider’s offered hour', function () {
    [$mine] = offeredHoursWorld();
    [, $theirVenue] = offeredHoursWorld();

    $theirs = Slot::query()->create([
        'venue_id' => $theirVenue->id,
        'date' => Carbon::tomorrow()->toDateString(),
        'start_time' => '18:00',
        'end_time' => '20:00',
        'status' => Slot::STATUS_AVAILABLE,
    ]);

    // 404 لا 403 (H §4) — لا نؤكد وجود ما ليس له.
    $this->actingAs($mine, 'partner')
        ->delete("/partner/schedule/{$theirs->id}")
        ->assertNotFound();

    expect(Slot::query()->whereKey($theirs->id)->exists())->toBeTrue();
});

test('a provider manages the hours of its own venue', function () {
    [$mine, $venue] = offeredHoursWorld();

    $this->actingAs($mine, 'partner')
        ->post('/partner/schedule', [
            'venue_id' => $venue->id,
            'date' => Carbon::tomorrow()->toDateString(),
            'start_time' => '18:00',
            'end_time' => '20:00',
        ])
        ->assertSessionHasNoErrors();

    $slot = Slot::query()->where('venue_id', $venue->id)->sole();

    $this->actingAs($mine, 'partner')
        ->delete("/partner/schedule/{$slot->id}")
        ->assertSessionHasNoErrors();

    expect(Slot::query()->whereKey($slot->id)->exists())->toBeFalse();
});
