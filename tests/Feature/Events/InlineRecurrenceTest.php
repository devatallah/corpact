<?php

use App\Models\ActivityUnit;
use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventTemplate;
use App\Models\Partner;
use App\Models\ProviderBranch;
use App\Models\Slot;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Services\Community\LeadershipService;
use App\Services\Payments\FundingService;
use App\Services\Provider\AvailabilityService;
use Carbon\Carbon;

/*
 * A17 — «التكرار» عاد إلى شاشة إنشاء الفعالية **مدخلاً** لا تخزيناً.
 *
 * A8 يبقى قائماً: القالب هو المصدر الوحيد للتكرار. ما تحرسه هذه الاختبارات
 * أن اختيار التكرار لا يُنشئ فعالية مفردة **إضافةً** إلى القالب — وإلا ازدوج
 * موعد اليوم الأول: واحد من النموذج وواحد من المولّد.
 */
function recurrenceSetup(): array
{
    test()->travelTo(Carbon::parse('2026-09-06 03:00'));

    $company = Company::factory()->create();
    $category = Category::factory()->create();
    $community = Community::factory()->create([
        'company_id' => $company->id,
        'status' => 'active',
        'category_id' => $category->id,
    ]);

    $leader = Employee::factory()->create(['company_id' => $company->id]);
    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);
    $community->members()->syncWithoutDetaching([$leader->id]);

    $partner = Partner::factory()->create(['status' => 'active']);
    $venue = Venue::factory()->create([
        'partner_id' => $partner->id,
        'category_id' => $category->id,
        'status' => 'active',
    ]);
    $pricing = VenuePricing::query()->create([
        'venue_id' => $venue->id, 'duration_minutes' => 60,
        'price_halalas' => 30000, 'is_peak' => false, 'status' => 'active',
    ]);

    return [$community, $leader->fresh(), $partner, $category, $venue, $pricing];
}

test('picking a repeat creates a template, and no standalone event beside it', function () {
    [$community, $leader, $partner, $category, $venue, $pricing] = recurrenceSetup();

    $response = $this->actingAs($leader, 'employee')->post('/employee/create', [
        'community_id' => $community->id,
        'partner_id' => $partner->id,
        'category_id' => $category->id,
        'venue_pricing_id' => $pricing->id,
        'venue_pricing_ids' => [$pricing->id],
        'venue_ids' => [$venue->id],
        'date' => '2026-09-20',
        'time' => '20:00',
        'capacity' => 10,
        'min_participants' => 4,
        'recurrence' => 'weekly',
    ]);

    $response->assertRedirect("/employee/community/{$community->id}/templates");

    $template = EventTemplate::query()->where('community_id', $community->id)->first();

    expect($template)->not->toBeNull()
        ->and($template->recurrence_pattern)->toBe('weekly')
        // 2026-09-20 أحد ⇒ day_of_week = 0، مشتقٌّ من التاريخ لا مسؤولاً عنه.
        ->and((int) $template->day_of_week)->toBe(0)
        ->and($template->start_time)->toStartWith('20:00')
        ->and((int) $template->capacity)->toBe(10);

    // كل فعالية موجودة تعود للقالب — لا فعالية مفردة أُنشئت بجانبه.
    Event::query()->where('community_id', $community->id)->get()
        ->each(fn (Event $event) => expect($event->template_id)->toBe($template->id));
});

test('monthly takes its day from the chosen date', function () {
    [$community, $leader, $partner, $category, $venue, $pricing] = recurrenceSetup();

    $this->actingAs($leader, 'employee')->post('/employee/create', [
        'community_id' => $community->id,
        'partner_id' => $partner->id,
        'category_id' => $category->id,
        'venue_pricing_id' => $pricing->id,
        'venue_pricing_ids' => [$pricing->id],
        'venue_ids' => [$venue->id],
        'date' => '2026-09-23',
        'time' => '19:30',
        'capacity' => 8,
        'min_participants' => 4,
        'recurrence' => 'monthly',
    ]);

    $template = EventTemplate::query()->where('community_id', $community->id)->firstOrFail();

    expect($template->recurrence_pattern)->toBe('monthly')
        ->and((int) $template->day_of_month)->toBe(23)
        ->and($template->day_of_week)->toBeNull();
});

test('a one-off still creates an event and no template at all', function () {
    [$community, $leader, $partner, $category, $venue, $pricing] = recurrenceSetup();

    $this->actingAs($leader, 'employee')->post('/employee/create', [
        'community_id' => $community->id,
        'partner_id' => $partner->id,
        'category_id' => $category->id,
        'venue_pricing_id' => $pricing->id,
        'venue_pricing_ids' => [$pricing->id],
        'venue_ids' => [$venue->id],
        'date' => '2026-09-20',
        'time' => '20:00',
        'capacity' => 10,
        'min_participants' => 4,
        'recurrence' => 'none',
    ]);

    expect(EventTemplate::query()->where('community_id', $community->id)->count())->toBe(0)
        ->and(Event::query()->where('community_id', $community->id)->count())->toBe(1);
});

test('«daily» is refused — H §8 does not define it and A8 removed it', function () {
    [$community, $leader, $partner, $category, $venue, $pricing] = recurrenceSetup();

    $this->actingAs($leader, 'employee')->post('/employee/create', [
        'community_id' => $community->id,
        'partner_id' => $partner->id,
        'category_id' => $category->id,
        'venue_pricing_id' => $pricing->id,
        'venue_pricing_ids' => [$pricing->id],
        'venue_ids' => [$venue->id],
        'date' => '2026-09-20',
        'time' => '20:00',
        'capacity' => 10,
        'min_participants' => 4,
        'recurrence' => 'daily',
    ])->assertSessionHasErrors('recurrence');

    expect(EventTemplate::query()->count())->toBe(0)
        ->and(Event::query()->count())->toBe(0);
});

/*
 * انحدارات ثبتها المتصفح:
 *
 * 1) «دعم الشركة» متروكاً فارغاً كان يسقط الإنشاء برسالة `numeric` — ولم يكن
 *    يمكن إنشاء فعالية دون كتابة رقم فيه إطلاقاً.
 * 2) نطاق المستأجر على نقطة التخفيضات: `community_id` من شركة أخرى ⇒ 404.
 */
test('leaving the subsidy blank falls back to the company default instead of failing', function () {
    [$community, $leader, $partner, $category, $venue, $pricing] = recurrenceSetup();

    $this->actingAs($leader, 'employee')->post('/employee/create', [
        'community_id' => $community->id,
        'partner_id' => $partner->id,
        'category_id' => $category->id,
        'venue_pricing_id' => $pricing->id,
        'venue_pricing_ids' => [$pricing->id],
        'venue_ids' => [$venue->id],
        'date' => '2026-09-20',
        'time' => '20:00',
        'capacity' => 10,
        'min_participants' => 4,
        // ما ترسله الشاشة حين لا يكتب المستعمل شيئاً.
        'company_subsidy' => '',
        'discount_id' => '',
    ])->assertSessionHasNoErrors();

    $event = Event::query()->where('community_id', $community->id)->firstOrFail();

    // افتراضي إعدادات الشركة (H §12.2) — لا دعم صفري صريح مفروضاً بالفراغ.
    $default = app(FundingService::class)->defaultSubsidyFor($community->company_id);

    expect($event->subsidy_type)->toBe($default['subsidy_type'])
        ->and((int) $event->subsidy_value)->toBe((int) $default['subsidy_value'])
        ->and($event->discount_id)->toBeNull();
});

test('the discounts lookup refuses a community belonging to another company', function () {
    [, $leader, $partner] = recurrenceSetup();
    $outsider = Community::factory()->create(['status' => 'active']);

    $this->actingAs($leader, 'employee')->postJson('/employee/create/discounts', [
        'community_id' => $outsider->id,
        'partner_id' => $partner->id,
        'date' => '2026-09-20',
        'time' => '20:00',
    ])->assertNotFound();
});

/*
 * انحدار الملخّص: الشاشة كانت تحسب الدعم من الحقل المكتوب وحده، فتُظهر
 * «المتبقي على اللاعبين» كاملاً بينما الخادم يطبّق افتراضي الشركة ويجعله
 * صفراً — رقمٌ معروض يخالف ما يُطالَب به فعلاً. الافتراضي يصل الشاشة الآن.
 */
test('the create screen receives the company subsidy default it must display', function () {
    [, $leader] = recurrenceSetup();

    $default = app(FundingService::class)->defaultSubsidyFor($leader->company_id);

    $this->actingAs($leader, 'employee')
        ->get('/employee/create')
        ->assertInertia(fn ($page) => $page
            ->component('employee/events/create')
            ->where('subsidyDefault.type', $default['subsidy_type'])
            ->where('subsidyDefault.value', (int) $default['subsidy_value'])
        );
});

/*
 * الفتحة المعروضة يجب أن تسع المدة التي تُفحص بها الإتاحة.
 *
 * البذرة كانت تعرض ساعات مفردة بينما وحدات النشاط افتراضها 90 دقيقة، والحجز
 * لا يصحّ إلا داخل فتحة واحدة — فأُقصي كل مزوّد في كل ساعة، وظهرت «لا يوجد
 * مزوّد مناسب» وكأنها عطب في المنطق.
 */
test('a session only fits inside a single offered window, never across two', function () {
    $venue = Venue::factory()->create(['status' => 'active']);
    $branch = ProviderBranch::factory()->create([
        'partner_id' => $venue->partner_id,
        'status' => 'active',
        'working_hours' => collect(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])
            ->mapWithKeys(fn (string $day) => [$day => [['from' => '06:00', 'to' => '23:59']]])
            ->all(),
    ]);
    $unit = ActivityUnit::factory()->create([
        'provider_branch_id' => $branch->id,
        'venue_id' => $venue->id,
        'status' => 'active',
        'default_duration_minutes' => 90,
    ]);

    // ساعتان متجاورتان بدل نافذة متصلة.
    foreach ([['08:00', '09:00'], ['09:00', '10:00']] as [$from, $to]) {
        Slot::query()->create([
            'venue_id' => $venue->id,
            'date' => '2026-09-20',
            'start_time' => $from,
            'end_time' => $to,
            'status' => Slot::STATUS_AVAILABLE,
        ]);
    }

    $availability = app(AvailabilityService::class);
    $at = fn (string $time) => Carbon::parse("2026-09-20 {$time}");

    expect($availability->isAvailable($unit, $at('08:00'), 60))->toBeTrue()
        // 90 دقيقة تعبر حدّ الفتحتين — لا تصحّ ولو كانت الساعتان معروضتين.
        ->and($availability->isAvailable($unit, $at('08:00'), 90))->toBeFalse();

    // نافذة متصلة تسع المدة نفسها وأي وقت بدء داخلها.
    Slot::query()->where('venue_id', $venue->id)->delete();
    Slot::query()->create([
        'venue_id' => $venue->id,
        'date' => '2026-09-20',
        'start_time' => '08:00',
        'end_time' => '12:00',
        'status' => Slot::STATUS_AVAILABLE,
    ]);

    expect($availability->isAvailable($unit, $at('08:00'), 90))->toBeTrue()
        ->and($availability->isAvailable($unit, $at('09:30'), 90))->toBeTrue()
        // وقت بدء يخرج عن النافذة يبقى مرفوضاً.
        ->and($availability->isAvailable($unit, $at('11:00'), 90))->toBeFalse();
});
