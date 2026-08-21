<?php

use App\Models\ActivityUnit;
use App\Models\Category;
use App\Models\Partner;
use App\Models\ProviderBranch;
use App\Models\Venue;
use App\Models\VenuePricing;

// A9 — التسلسل (H §11): مزوّد ← فروع ← وحدات نشاط، مع ترحيل بيانات الشركاء
// القائمة: كل شريك → مزوّد بفرع افتراضي ووحدات من ملاعبه وتوفر من أوقات عمله.

function providerWithHierarchy(array $partnerOverrides = []): array
{
    $partner = Partner::factory()->create($partnerOverrides);
    $branch = ProviderBranch::factory()->create(['partner_id' => $partner->id]);
    $unit = ActivityUnit::factory()->create(['provider_branch_id' => $branch->id]);

    return [$partner, $branch, $unit];
}

test('partner backfill migration creates a default branch with units from venues and hours from working_hours', function () {
    $partner = Partner::factory()->create(['working_hours' => '06:00 - 00:00']);
    $venue = Venue::factory()->create(['partner_id' => $partner->id, 'status' => 'active']);
    VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 350]);

    $migration = require database_path('migrations/2026_08_20_900002_backfill_provider_hierarchy_from_partners.php');
    $migration->up();

    $branch = ProviderBranch::where('partner_id', $partner->id)->first();
    expect($branch)->not->toBeNull()
        ->and($branch->name)->toBe('الفرع الرئيسي')
        ->and($branch->working_hours['sun'][0])->toBe(['from' => '06:00', 'to' => '23:59']);

    $unit = ActivityUnit::where('provider_branch_id', $branch->id)->first();
    expect($unit)->not->toBeNull()
        ->and($unit->venue_id)->toBe($venue->id)
        ->and($unit->category_id)->toBe($venue->category_id)
        ->and((float) $unit->price)->toBe(350.0)
        ->and($unit->default_duration_minutes)->toBe(90)
        ->and($unit->pricing_type)->toBe('unit_hour');

    // idempotent — إعادة التشغيل لا تضاعف الفروع
    $migration->up();
    expect(ProviderBranch::where('partner_id', $partner->id)->count())->toBe(1);
});

test('a provider owner manages branches and units from the panel', function () {
    $partner = Partner::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($partner, 'partner')
        ->post(route('partner.branches.store'), [
            'name' => 'فرع العليا',
            'city' => 'الرياض',
            'district' => 'العليا',
            'contact_phone' => '0551112222',
        ])->assertRedirect();

    $branch = ProviderBranch::where('partner_id', $partner->id)->first();
    expect($branch)->not->toBeNull();

    $this->actingAs($partner, 'partner')
        ->post(route('partner.branches.units.store', $branch), [
            'category_id' => $category->id,
            'name' => 'ملعب 1',
            'min_capacity' => 4,
            'max_capacity' => 12,
            'pricing_type' => 'unit_hour',
            'price' => 300,
            'default_duration_minutes' => 90,
        ])->assertRedirect();

    $unit = ActivityUnit::where('provider_branch_id', $branch->id)->first();
    expect($unit)->not->toBeNull()
        ->and($unit->min_capacity)->toBe(4)
        ->and($unit->max_capacity)->toBe(12);
});

test('a provider cannot touch a foreign branch — 404 not 403', function () {
    [$partnerA] = providerWithHierarchy();
    [, $branchB] = providerWithHierarchy();

    $this->actingAs($partnerA, 'partner')
        ->put(route('partner.branches.update', $branchB), ['name' => 'اختراق'])
        ->assertNotFound();
});

test('a receptionist cannot manage branches but an owner can', function () {
    [$owner, $branch] = providerWithHierarchy();
    $receptionist = Partner::factory()->create(['role' => 'receptionist', 'parent_id' => $owner->id]);

    $this->actingAs($receptionist, 'partner')
        ->post(route('partner.branches.store'), ['name' => 'فرع'])
        ->assertForbidden();

    $this->actingAs($receptionist, 'partner')
        ->get(route('partner.branches.index'))
        ->assertOk();
});

test('price edits under a price contract wait for admin approval; without a contract they apply directly', function () {
    [$partner, , $unit] = providerWithHierarchy(['has_price_contract' => true]);

    $this->actingAs($partner, 'partner')
        ->put(route('partner.units.update', $unit), [
            'category_id' => $unit->category_id,
            'name' => $unit->name,
            'min_capacity' => $unit->min_capacity,
            'max_capacity' => $unit->max_capacity,
            'pricing_type' => $unit->pricing_type,
            'price' => 999,
            'default_duration_minutes' => $unit->default_duration_minutes,
        ])->assertRedirect();

    // السعر لم يتغير — التعديل معلّق بانتظار اعتماد أدمن تيمات
    expect((float) $unit->fresh()->price)->not->toBe(999.0)
        ->and($unit->priceChanges()->where('status', 'pending')->count())->toBe(1);

    [$free, , $freeUnit] = providerWithHierarchy(['has_price_contract' => false]);

    $this->actingAs($free, 'partner')
        ->put(route('partner.units.update', $freeUnit), [
            'category_id' => $freeUnit->category_id,
            'name' => $freeUnit->name,
            'min_capacity' => $freeUnit->min_capacity,
            'max_capacity' => $freeUnit->max_capacity,
            'pricing_type' => $freeUnit->pricing_type,
            'price' => 777,
            'default_duration_minutes' => $freeUnit->default_duration_minutes,
        ])->assertRedirect();

    expect((float) $freeUnit->fresh()->price)->toBe(777.0);
});
