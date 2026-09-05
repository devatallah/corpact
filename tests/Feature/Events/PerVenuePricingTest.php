<?php

use App\Models\Venue;
use App\Models\VenuePricing;
use App\Services\Employee\EventCreationService;

/**
 * ملعبان بسعرين — المعروض هو المحتسَب.
 *
 * الشاشة تعرض سعر كل ملعب على حدة ومجموعها. الخادم كان يستنتج سعر الملاعب
 * الأخرى بقاعدته الخاصة، فيمكن أن يُحتسب غير ما عُرض. إرسال التسعيرات صراحةً
 * يُغلق هذا الفارق.
 */
function twoVenuesAtDifferentPrices(): array
{
    $cheap = Venue::factory()->create(['status' => 'active']);
    $dear = Venue::factory()->create(['status' => 'active', 'partner_id' => $cheap->partner_id]);

    $a = VenuePricing::query()->create([
        'venue_id' => $cheap->id, 'duration_minutes' => 60,
        'price_halalas' => 30000, 'is_peak' => true, 'status' => 'active',
    ]);
    $b = VenuePricing::query()->create([
        'venue_id' => $dear->id, 'duration_minutes' => 60,
        'price_halalas' => 45000, 'is_peak' => true, 'status' => 'active',
    ]);

    return [$cheap, $dear, $a, $b];
}

test('the total is the sum of each venue’s own price', function () {
    [$cheap, $dear, $a, $b] = twoVenuesAtDifferentPrices();

    $costs = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $a->id,
        'venue_pricing_ids' => [$a->id, $b->id],
        'venue_ids' => [$cheap->id, $dear->id],
        'min_participants' => 2,
        'subsidy_type' => 'fixed',
        'subsidy_value_halalas' => 0,
    ]);

    // 300.00 + 450.00 — لا ضعف سعر الأول ولا ضعف سعر الثاني.
    expect($costs['total_amount_halalas'])->toBe(75000)
        ->and($costs['max_share_halalas'])->toBe(37500);
});

test('explicit pricings beat the inference — the second venue is not priced as the first', function () {
    [$cheap, $dear, $a, $b] = twoVenuesAtDifferentPrices();

    $explicit = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $a->id,
        'venue_pricing_ids' => [$a->id, $b->id],
        'venue_ids' => [$cheap->id, $dear->id],
        'min_participants' => 2,
    ]);

    expect($explicit['total_amount_halalas'])->toBe(75000)
        // لو كان الاستنتاج يسعّر الثاني بسعر الأول لصار 600.00 — وهو الفارق
        // الذي كان يقع بين ما يُعرض وما يُحتسب.
        ->and($explicit['total_amount_halalas'])->not->toBe(60000);
});

test('a venue left without an explicit price falls back rather than undercounting', function () {
    [$cheap, $dear, $a] = twoVenuesAtDifferentPrices();

    // تسعيرة واحدة لملعبين: المجموع لا يُبنى على نصف البيانات.
    $costs = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $a->id,
        'venue_pricing_ids' => [$a->id],
        'venue_ids' => [$cheap->id, $dear->id],
        'min_participants' => 2,
    ]);

    expect($costs['total_amount_halalas'])->toBeGreaterThan(30000);
});
