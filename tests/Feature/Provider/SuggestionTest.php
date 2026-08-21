<?php

use App\Models\ActivityUnit;
use App\Models\Category;
use App\Models\Community;
use App\Models\CommunityPreferredProvider;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Partner;
use App\Models\ProviderBranch;
use App\Models\ProviderSelectionLog;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Services\Community\LeadershipService;
use App\Services\Provider\AvailabilityService;
use App\Services\Provider\ProviderSuggestionService;

// A9 — خوارزمية الاقتراح (H §11): المفضّلون أولاً ← إقصاء (غير متاح / لا يقدّم
// النشاط / خارج الميزانية / معطّل) ← ترتيب بالسعر فالموثوقية فعدم التكرار
// فالقرب ← صفر نتائج مع السبب ← تجاوز بسبب مسجَّل إلزامياً.

function suggestionWorld(): array
{
    $category = Category::factory()->create();
    $company = Company::factory()->create(['city' => 'الرياض']);
    $community = Community::factory()->create(['company_id' => $company->id, 'category_id' => $category->id]);

    return [$category, $company, $community];
}

function makeProvider(Category $category, array $partnerAttrs = [], array $unitAttrs = []): Partner
{
    $partner = Partner::factory()->create($partnerAttrs);
    $branch = ProviderBranch::factory()->create(['partner_id' => $partner->id, 'city' => $partner->city]);
    ActivityUnit::factory()->create(array_merge([
        'provider_branch_id' => $branch->id,
        'category_id' => $category->id,
    ], $unitAttrs));

    return $partner;
}

function suggestParams(Community $community, Category $category, array $overrides = []): array
{
    return array_merge([
        'community_id' => $community->id,
        'category_id' => $category->id,
        'date' => now()->addDays(3)->toDateString(),
        'time' => '18:00',
        'duration_minutes' => 90,
        'participants_count' => 8,
    ], $overrides);
}

test('community preferred providers always rank first, then price orders the rest', function () {
    [$category, , $community] = suggestionWorld();

    $cheap = makeProvider($category, ['name' => 'الأرخص'], ['price' => 200]);
    $expensive = makeProvider($category, ['name' => 'الأغلى'], ['price' => 500]);
    $preferred = makeProvider($category, ['name' => 'المفضل'], ['price' => 400]);

    CommunityPreferredProvider::create(['community_id' => $community->id, 'partner_id' => $preferred->id, 'position' => 1]);

    $result = app(ProviderSuggestionService::class)->suggest(suggestParams($community, $category));
    $ids = array_column($result['candidates'], 'partner_id');

    expect($ids[0])->toBe($preferred->id)
        ->and($ids[1])->toBe($cheap->id)
        ->and($ids[2])->toBe($expensive->id);
});

test('exclusions carry reasons: disabled, wrong activity, over budget, unavailable', function () {
    [$category, , $community] = suggestionWorld();

    makeProvider($category, ['name' => 'متاح'], ['price' => 300]);
    $disabled = makeProvider($category, ['name' => 'معطل', 'status' => 'suspended']);
    $wrongActivity = makeProvider(Category::factory()->create(), ['name' => 'نشاط آخر']);
    $tooExpensive = makeProvider($category, ['name' => 'فوق الميزانية'], ['price' => 900]);
    $busy = makeProvider($category, ['name' => 'مشغول'], ['price' => 300]);
    $busyUnit = ActivityUnit::whereHas('branch', fn ($q) => $q->where('partner_id', $busy->id))->first();
    app(AvailabilityService::class)->markExternal($busyUnit, now()->addDays(3)->toDateString(), '17:00', '20:00');

    $result = app(ProviderSuggestionService::class)->suggest(suggestParams($community, $category, ['budget' => 500]));

    expect(array_column($result['candidates'], 'partner_id'))->toHaveCount(1);

    $reasons = collect($result['excluded'])->pluck('reason', 'partner_id');
    expect($reasons[$disabled->id])->toContain('معطّل')
        ->and($reasons[$tooExpensive->id])->toContain('الميزانية')
        ->and($reasons[$busy->id])->toContain('غير متاح')
        ->and($reasons->has($wrongActivity->id))->toBeFalse(); // لا يظهر أصلاً — نشاط مختلف
});

test('reliability breaks price ties and a twice-consecutive provider is demoted', function () {
    [$category, , $community] = suggestionWorld();

    $reliable = makeProvider($category, ['name' => 'موثوق', 'reliability_score' => 95], ['price' => 300]);
    $lessReliable = makeProvider($category, ['name' => 'أقل ثقة', 'reliability_score' => 60], ['price' => 300]);

    $result = app(ProviderSuggestionService::class)->suggest(suggestParams($community, $category));
    expect(array_column($result['candidates'], 'partner_id')[0])->toBe($reliable->id);

    // نفس المزوّد الموثوق أخذ آخر فعاليتين متتاليتين → يتراجع رغم موثوقيته
    Event::factory()->count(2)->create([
        'community_id' => $community->id,
        'company_id' => $community->company_id,
        'partner_id' => $reliable->id,
        'status' => 'completed',
        'event_date' => now()->subDays(2)->toDateString(),
    ]);
    // اجعل السعر متساوياً والموثوقية متساوية حتى تحسم قاعدة عدم التكرار
    Partner::whereKey($lessReliable->id)->update(['reliability_score' => 95]);

    $result = app(ProviderSuggestionService::class)->suggest(suggestParams($community, $category));
    expect(array_column($result['candidates'], 'partner_id')[0])->toBe($lessReliable->id);
});

test('zero results come back with an explicit reason — the event is never created with an unavailable provider', function () {
    [$category, , $community] = suggestionWorld();

    $busy = makeProvider($category, ['name' => 'الوحيد'], ['price' => 300]);
    $unit = ActivityUnit::whereHas('branch', fn ($q) => $q->where('partner_id', $busy->id))->first();
    app(AvailabilityService::class)->markExternal($unit, now()->addDays(3)->toDateString(), '17:00', '20:00');

    $result = app(ProviderSuggestionService::class)->suggest(suggestParams($community, $category));

    expect($result['candidates'])->toBeEmpty()
        ->and($result['reason'])->toContain('غير متاح');
});

test('the reliability number is hidden in suggestion payloads below 10 samples', function () {
    [$category, , $community] = suggestionWorld();

    makeProvider($category, ['reliability_score' => 95, 'reliability_samples' => 3], ['price' => 300]);
    $seasoned = makeProvider($category, ['reliability_score' => 90, 'reliability_samples' => 15], ['price' => 400]);

    $result = app(ProviderSuggestionService::class)->suggest(suggestParams($community, $category));

    $byId = collect($result['candidates'])->keyBy('partner_id');
    expect($byId->first(fn ($c, $id) => $id !== $seasoned->id)['reliability_score'])->toBeNull()
        ->and($byId[$seasoned->id]['reliability_score'])->toBe(90);
});

test('creating an event with a non-top provider requires a logged override reason', function () {
    [$category, $company, $community] = suggestionWorld();

    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);

    $top = makeProvider($category, ['name' => 'الاقتراح الأول'], ['price' => 200]);
    $chosen = makeProvider($category, ['name' => 'المُتجاوَز إليه'], ['price' => 400]);

    // مسار الإنشاء القديم يمر بالملاعب — جهّز ملعباً وتسعيرة للمزوّد المختار
    $venue = Venue::factory()->create(['partner_id' => $chosen->id, 'category_id' => $category->id, 'status' => 'active']);
    $pricing = VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 400]);
    ActivityUnit::whereHas('branch', fn ($q) => $q->where('partner_id', $chosen->id))->update(['venue_id' => $venue->id]);

    $payload = [
        'community_id' => $community->id,
        'partner_id' => $chosen->id,
        'category_id' => $category->id,
        'venue_pricing_id' => $pricing->id,
        'venue_ids' => [$venue->id],
        'date' => now()->addDays(3)->toDateString(),
        'time' => '18:00',
        'capacity' => 8,
        'min_participants' => 4,
        'company_subsidy' => 0,
    ];

    // بلا سبب تجاوز → مرفوض
    $this->actingAs($employee, 'employee')
        ->post(route('employee.events.store'), $payload)
        ->assertSessionHasErrors('override_reason');

    expect(Event::count())->toBe(0);

    // بسبب موثَّق → يُنشأ ويُسجَّل التجاوز مع لقطة الاقتراحات
    $this->actingAs($employee, 'employee')
        ->post(route('employee.events.store'), $payload + ['override_reason' => 'المفضل لدى الفريق لقربه من المكتب'])
        ->assertSessionHasNoErrors();

    $log = ProviderSelectionLog::firstOrFail();
    expect($log->was_override)->toBeTrue()
        ->and($log->chosen_partner_id)->toBe($chosen->id)
        ->and($log->suggested_partner_id)->toBe($top->id)
        ->and($log->override_reason)->toContain('لقربه')
        ->and($log->suggestions_json)->not->toBeEmpty()
        ->and($log->event_id)->not->toBeNull();
});

test('choosing the top suggestion needs no reason and is logged as a non-override', function () {
    [$category, $company, $community] = suggestionWorld();

    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);

    $top = makeProvider($category, ['name' => 'الاقتراح الأول'], ['price' => 200]);
    $venue = Venue::factory()->create(['partner_id' => $top->id, 'category_id' => $category->id, 'status' => 'active']);
    $pricing = VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 200]);

    $this->actingAs($employee, 'employee')
        ->post(route('employee.events.store'), [
            'community_id' => $community->id,
            'partner_id' => $top->id,
            'category_id' => $category->id,
            'venue_pricing_id' => $pricing->id,
            'venue_ids' => [$venue->id],
            'date' => now()->addDays(3)->toDateString(),
            'time' => '18:00',
            'capacity' => 8,
            'min_participants' => 4,
            'company_subsidy' => 0,
        ])->assertSessionHasNoErrors();

    $log = ProviderSelectionLog::firstOrFail();
    expect($log->was_override)->toBeFalse()
        ->and($log->override_reason)->toBeNull();
});

test('an event cannot be created with a provider whose units are all busy at that slot', function () {
    [$category, $company, $community] = suggestionWorld();

    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);

    $provider = makeProvider($category, ['name' => 'مشغول'], ['price' => 300]);
    $venue = Venue::factory()->create(['partner_id' => $provider->id, 'category_id' => $category->id, 'status' => 'active']);
    $pricing = VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 90, 'price' => 300]);

    $unit = ActivityUnit::whereHas('branch', fn ($q) => $q->where('partner_id', $provider->id))->first();
    app(AvailabilityService::class)->markExternal($unit, now()->addDays(3)->toDateString(), '17:00', '20:00');

    $this->actingAs($employee, 'employee')
        ->post(route('employee.events.store'), [
            'community_id' => $community->id,
            'partner_id' => $provider->id,
            'category_id' => $category->id,
            'venue_pricing_id' => $pricing->id,
            'venue_ids' => [$venue->id],
            'date' => now()->addDays(3)->toDateString(),
            'time' => '18:00',
            'capacity' => 8,
            'min_participants' => 4,
            'company_subsidy' => 0,
        ])->assertSessionHasErrors('partner_id');

    expect(Event::count())->toBe(0);
});

test('a community leader manages preferred providers; a plain member cannot', function () {
    [, $company, $community] = suggestionWorld();

    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $member = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($leader->id, ['status' => 'active', 'joined_at' => now()]);
    $community->members()->attach($member->id, ['status' => 'active', 'joined_at' => now()]);
    app(LeadershipService::class)->assignLeader($community, $leader, asPrimary: true);

    $provider = Partner::factory()->create();

    $this->actingAs($member, 'employee')
        ->post(route('employee.communities.preferred-providers.store', $community), ['partner_id' => $provider->id])
        ->assertForbidden();

    $this->actingAs($leader, 'employee')
        ->post(route('employee.communities.preferred-providers.store', $community), ['partner_id' => $provider->id])
        ->assertRedirect()->assertSessionHasNoErrors();

    expect(CommunityPreferredProvider::where('community_id', $community->id)->where('partner_id', $provider->id)->exists())->toBeTrue();

    $this->actingAs($leader, 'employee')
        ->delete(route('employee.communities.preferred-providers.destroy', [$community, $provider]))
        ->assertRedirect();

    expect(CommunityPreferredProvider::count())->toBe(0);
});
