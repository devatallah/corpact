<?php

use App\Models\Category;
use App\Models\Partner;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Services\Employee\EventCreationService;

// H §12.1 — التسعير: المرفق الواحد يحمل عدة تسعيرات بنفس المدة (صباحي/مسائي/
// نهاية أسبوع)، وواجهة الاختيار تصفّيها بالتاريخ والوقت وتعرض المنطبقة.
// **التسعيرة التي اختارها المستخدم هي التي تُحتسب** — وإلا صار السعر المعروض
// على الشاشة مخالفاً للسعر المحتسَب، ثم للإجمالي المجمَّد في اللقطة، ثم لمستحق
// المزوّد في التسوية. (عيب رصده A16 وأُصلح — انظر divergences.md §17.)

function pricingVenue(Partner $partner, Category $category): Venue
{
    return Venue::factory()->create([
        'partner_id' => $partner->id,
        'category_id' => $category->id,
    ]);
}

it('charges the tier the user actually picked, not the first tier of that duration', function () {
    $partner = Partner::factory()->create();
    $category = Category::factory()->create();
    $venue = pricingVenue($partner, $category);

    // نفس المرفق ونفس المدة بتسعيرتين — الشكل المبذور حرفياً.
    VenuePricing::factory()->create([
        'venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 150,
        'is_peak' => false, 'label' => 'صباحي', 'start_time' => '06:00', 'end_time' => '16:00',
    ]);
    $evening = VenuePricing::factory()->create([
        'venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 250,
        'is_peak' => true, 'label' => 'مسائي', 'start_time' => '16:00', 'end_time' => '23:00',
    ]);

    $costs = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $evening->id,
        'venue_ids' => [$venue->id],
        'min_participants' => 2,
    ]);

    // 250.00 لا 150.00 — الذروة هي ما اختير وهي ما يُحتسب.
    expect($costs['total_amount_halalas'])->toBe(25_000)
        ->and($costs['max_share_halalas'])->toBe(12_500);
});

it('matches the same peak tier across the other venues in one request', function () {
    $partner = Partner::factory()->create();
    $category = Category::factory()->create();
    $first = pricingVenue($partner, $category);
    $second = pricingVenue($partner, $category);

    foreach ([$first, $second] as $venue) {
        VenuePricing::factory()->create([
            'venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 150, 'is_peak' => false,
        ]);
        VenuePricing::factory()->create([
            'venue_id' => $venue->id, 'duration_minutes' => 60, 'price' => 250, 'is_peak' => true,
        ]);
    }

    $peak = VenuePricing::where('venue_id', $first->id)->where('is_peak', true)->firstOrFail();

    $costs = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $peak->id,
        'venue_ids' => [$first->id, $second->id],
        'min_participants' => 2,
    ]);

    // ملعبان بتسعيرة الذروة = 500.00، لا 400.00 ولا 300.00.
    expect($costs['total_amount_halalas'])->toBe(50_000);
});

it('falls back to the same-duration price when the other venue has no matching tier', function () {
    $partner = Partner::factory()->create();
    $category = Category::factory()->create();
    $first = pricingVenue($partner, $category);
    $second = pricingVenue($partner, $category);

    $peak = VenuePricing::factory()->create([
        'venue_id' => $first->id, 'duration_minutes' => 60, 'price' => 250, 'is_peak' => true,
    ]);
    VenuePricing::factory()->create([
        'venue_id' => $second->id, 'duration_minutes' => 60, 'price' => 180, 'is_peak' => false,
    ]);

    $costs = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $peak->id,
        'venue_ids' => [$first->id, $second->id],
        'min_participants' => 2,
    ]);

    // 250.00 (المختارة لمرفقها) + 180.00 (الوحيدة بنفس المدة للآخر) = 430.00.
    expect($costs['total_amount_halalas'])->toBe(43_000);
});

it('keeps the single-tier case unchanged', function () {
    $partner = Partner::factory()->create();
    $category = Category::factory()->create();
    $venue = pricingVenue($partner, $category);

    $pricing = VenuePricing::factory()->create([
        'venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 300,
    ]);

    $costs = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $pricing->id,
        'venue_ids' => [$venue->id],
        'min_participants' => 4,
        'subsidy_type' => 'fixed',
        'subsidy_value_halalas' => 10_000,
    ]);

    expect($costs['total_amount_halalas'])->toBe(30_000)
        ->and($costs['planned_subsidy_halalas'])->toBe(10_000)
        ->and($costs['max_share_halalas'])->toBe(5_000);
});
