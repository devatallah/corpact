<?php

use App\Enums\PartnerRole;
use App\Models\Community;
use App\Models\Company;
use App\Models\Discount;
use App\Models\Event;
use App\Models\Partner;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Services\Employee\EventCreationService;
use Illuminate\Support\Facades\Schema;

/*
 * A17 — عودة ميزة التخفيضات بقرار المالك، نقضاً لإزالة A10.
 *
 * المحور الذي تحرسه هذه الاختبارات: **الترتيب**. التخفيض يسبق الدعم، فما
 * تدفعه محفظة الشركة نسبةٌ مما يُستحق فعلاً لا مما كان سيُستحق. وقلب
 * الترتيب يجعل الشركة تدفع عن مبلغ لم يُطالَب به أحد.
 */

function discountFixture(int $priceHalalas = 40000): array
{
    $venue = Venue::factory()->create(['status' => 'active']);
    $pricing = VenuePricing::query()->create([
        'venue_id' => $venue->id, 'duration_minutes' => 60,
        'price_halalas' => $priceHalalas, 'is_peak' => false, 'status' => 'active',
    ]);

    return [$venue, $pricing];
}

test('the table came back from the archive, and the archive stamp is preserved', function () {
    expect(Schema::hasTable('discounts'))->toBeTrue()
        ->and(Schema::hasColumn('discounts', 'archived_at'))->toBeTrue()
        ->and(Schema::hasColumn('discounts', 'value_halalas'))->toBeTrue()
        // تاريخ الفعاليات لم يُمس.
        ->and(Schema::hasColumn('events', 'discount_id'))->toBeTrue()
        ->and(Schema::hasColumn('events', 'discount_amount_halalas'))->toBeTrue();
});

test('a row A10 archived stays dormant — it is never live and never applies', function () {
    $archived = Discount::factory()->archived()->create();

    expect(Discount::query()->active()->whereKey($archived->id)->exists())->toBeFalse()
        ->and(Discount::query()->applicableOn('2026-10-01', '18:00')->whereKey($archived->id)->exists())->toBeFalse();
});

test('a fixed discount comes off the total before the wallet subsidy', function () {
    [$venue, $pricing] = discountFixture(40000);

    $discount = Discount::factory()->create(['value' => 50, 'value_halalas' => 5000]);

    $costs = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $pricing->id,
        'venue_pricing_ids' => [$pricing->id],
        'venue_ids' => [$venue->id],
        'min_participants' => 5,
        'subsidy_type' => 'fixed',
        'subsidy_value_halalas' => 10000,
        'discount_id' => $discount->id,
    ]);

    // 400.00 − 50.00 = 350.00 مستحق؛ − 100.00 دعم = 250.00 على 5 = 50.00
    expect($costs['gross_amount_halalas'])->toBe(40000)
        ->and($costs['discount_amount_halalas'])->toBe(5000)
        ->and($costs['total_amount_halalas'])->toBe(35000)
        ->and($costs['planned_subsidy_halalas'])->toBe(10000)
        ->and($costs['max_share_halalas'])->toBe(5000);
});

test('a percentage subsidy is taken on the discounted amount, not the original', function () {
    [$venue, $pricing] = discountFixture(40000);

    $discount = Discount::factory()->percentage(25)->create();

    $costs = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $pricing->id,
        'venue_pricing_ids' => [$pricing->id],
        'venue_ids' => [$venue->id],
        'min_participants' => 4,
        'subsidy_type' => 'percentage',
        'subsidy_value_halalas' => 50,
        'discount_id' => $discount->id,
    ]);

    // 400 − 25٪ = 300 مستحق؛ الدعم 50٪ منها = 150 (لا 200) والباقي 150 على 4.
    expect($costs['discount_amount_halalas'])->toBe(10000)
        ->and($costs['total_amount_halalas'])->toBe(30000)
        ->and($costs['planned_subsidy_halalas'])->toBe(15000)
        ->and($costs['max_share_halalas'])->toBe(3750);
});

test('a discount never exceeds the total, and no discount changes nothing', function () {
    [$venue, $pricing] = discountFixture(10000);

    $huge = Discount::factory()->create(['value' => 999, 'value_halalas' => 99900]);

    $base = [
        'venue_pricing_id' => $pricing->id,
        'venue_pricing_ids' => [$pricing->id],
        'venue_ids' => [$venue->id],
        'min_participants' => 2,
        'subsidy_type' => 'fixed',
        'subsidy_value_halalas' => 0,
    ];

    $capped = app(EventCreationService::class)->calculateCosts([...$base, 'discount_id' => $huge->id]);
    $none = app(EventCreationService::class)->calculateCosts($base);

    expect($capped['discount_amount_halalas'])->toBe(10000)
        ->and($capped['total_amount_halalas'])->toBe(0)
        ->and($capped['max_share_halalas'])->toBe(0)
        ->and($none['discount_amount_halalas'])->toBe(0)
        ->and($none['total_amount_halalas'])->toBe(10000);
});

test('an expired discount is silently ignored rather than raising an error', function () {
    [$venue, $pricing] = discountFixture(20000);

    $expired = Discount::factory()->create([
        'expires_at' => '2026-01-01',
        'value' => 50,
        'value_halalas' => 5000,
    ]);

    $costs = app(EventCreationService::class)->calculateCosts([
        'venue_pricing_id' => $pricing->id,
        'venue_pricing_ids' => [$pricing->id],
        'venue_ids' => [$venue->id],
        'min_participants' => 2,
        'subsidy_type' => 'fixed',
        'subsidy_value_halalas' => 0,
        'discount_id' => $expired->id,
        'date' => '2026-12-01',
        'time' => '18:00',
    ]);

    // الشاشة عرضته لحظة الفتح وقد تغيّرت الحال — يسقط بلا خطأ.
    expect($costs['discount_amount_halalas'])->toBe(0)
        ->and($costs['discount_id'])->toBeNull()
        ->and($costs['total_amount_halalas'])->toBe(20000);
});

test('a one-time discount stops applying once an event has used it', function () {
    $discount = Discount::factory()->oneTime()->create();

    expect(Discount::query()->applicableOn('2026-10-01', '18:00')->whereKey($discount->id)->exists())->toBeTrue();

    Event::factory()->create(['discount_id' => $discount->id]);

    expect(Discount::query()->applicableOn('2026-10-01', '18:00')->whereKey($discount->id)->exists())->toBeFalse();
});

test('the hour window is honoured — a discount outside it does not apply', function () {
    $evening = Discount::factory()->create(['start_time' => '18:00', 'end_time' => '22:00']);

    $inside = Discount::query()->applicableOn('2026-10-01', '19:00')->whereKey($evening->id)->exists();
    $before = Discount::query()->applicableOn('2026-10-01', '17:00')->whereKey($evening->id)->exists();
    $atEnd = Discount::query()->applicableOn('2026-10-01', '22:00')->whereKey($evening->id)->exists();

    expect($inside)->toBeTrue()
        ->and($before)->toBeFalse()
        // النهاية غير شاملة: حجز الساعة 22:00 خارج النافذة.
        ->and($atEnd)->toBeFalse();
});

test('the owner manages discounts, the accountant only reads them', function () {
    expect(PartnerRole::Owner->can('discounts.view'))->toBeTrue()
        ->and(PartnerRole::Owner->can('discounts.manage'))->toBeTrue()
        ->and(PartnerRole::Accountant->can('discounts.view'))->toBeTrue()
        ->and(PartnerRole::Accountant->can('discounts.manage'))->toBeFalse()
        ->and(PartnerRole::Receptionist->can('discounts.view'))->toBeFalse();
});

test('a discount cannot be created for a community outside the chosen company', function () {
    $partner = Partner::factory()->create(['status' => 'active']);
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();
    $foreign = Community::factory()->create(['company_id' => $companyB->id]);

    $this->actingAs($partner, 'partner')
        ->post('/partner/discounts', [
            'company_id' => $companyA->id,
            'community_id' => $foreign->id,
            'type' => 'fixed',
            'value' => 25,
            'usage' => 'date_range',
        ])
        ->assertSessionHasErrors('community_id');

    expect(Discount::query()->count())->toBe(0);
});

test('one partner cannot touch another partner’s discount', function () {
    $mine = Partner::factory()->create(['status' => 'active']);
    $theirs = Discount::factory()->create();

    $this->actingAs($mine, 'partner')
        ->delete("/partner/discounts/{$theirs->id}")
        ->assertForbidden();

    expect(Discount::query()->whereKey($theirs->id)->exists())->toBeTrue();
});
