<?php

use App\Models\BlackoutDate;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventTemplate;
use App\Models\JobRun;
use App\Models\Notification;
use App\Models\User;
use App\Services\Community\LeadershipService;
use Carbon\Carbon;

// H §8: جدول blackout_dates يديره أدمن تيمات؛ الفعالية الواقعة فيه تُتخطى
// افتراضياً أو تُزاح أسبوعاً حسب إعداد القالب. يسري لحظة التوليد فقط.

function blackoutSetup(array $templateAttributes = []): array
{
    test()->travelTo(Carbon::parse('2026-09-06 03:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id, 'status' => 'active']);
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

    $template = EventTemplate::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'created_by' => $leader->id,
        'day_of_week' => 0,
        'anchor_date' => '2026-09-06',
        ...$templateAttributes,
    ]);

    return [$community, $leader->fresh(), $template];
}

it('skips occurrences inside a blackout by default and records the decision once', function () {
    [, $leader, $template] = blackoutSetup(['blackout_behavior' => EventTemplate::BLACKOUT_SKIP]);

    BlackoutDate::factory()->create(['name' => 'عيد الفطر', 'starts_on' => '2026-09-12', 'ends_on' => '2026-09-14']);

    $this->artisan('app:generate-template-events')->assertSuccessful();

    $dates = Event::withoutGlobalScopes()->where('template_id', $template->id)
        ->pluck('event_date')->map(fn ($d) => $d->format('Y-m-d'))->all();

    // الأحد 13 داخل الحظر ← تُخطي؛ الأحد 20 وُلّد
    expect($dates)->toBe(['2026-09-20']);

    // القائد أُبلغ بالسبب
    expect(Notification::where('notifiable_id', $leader->id)
        ->where('title', 'تُخطيت فعالية قالب — فترة حظر')
        ->where('body', 'like', '%عيد الفطر%')
        ->count())->toBe(1);

    // القرار مسجل مرة واحدة — تشغيل ثانٍ لا يكرر الإشعار
    $this->artisan('app:generate-template-events')->assertSuccessful();
    expect(Notification::where('notifiable_id', $leader->id)
        ->where('title', 'تُخطيت فعالية قالب — فترة حظر')->count())->toBe(1)
        ->and(JobRun::where('job', 'template:generate-event')
            ->where('entity_id', $template->id)->where('period', '2026-09-13')->count())->toBe(1);
});

it('shifts the occurrence one week when the template says shift_week', function () {
    // كل أسبوعين حتى لا يتصادم المزاح مع تكرار الأسبوع التالي
    [, $leader, $template] = blackoutSetup([
        'recurrence_pattern' => EventTemplate::PATTERN_BIWEEKLY,
        'blackout_behavior' => EventTemplate::BLACKOUT_SHIFT_WEEK,
    ]);

    BlackoutDate::factory()->create(['name' => 'اليوم الوطني', 'starts_on' => '2026-09-20', 'ends_on' => '2026-09-21']);

    // اليوم 9-06: الموعد الفعلي بعد الإزاحة (9-27) خارج أفق الـ 14 يوماً — لا يولَّد بعد
    $this->artisan('app:generate-template-events')->assertSuccessful();
    expect(Event::withoutGlobalScopes()->where('template_id', $template->id)->count())->toBe(0);

    // 9-13: صار 9-27 داخل الأفق (قبل 14 يوماً من موعده الفعلي) — يولَّد مزاحاً
    $this->travelTo(Carbon::parse('2026-09-13 03:00'));
    $this->artisan('app:generate-template-events')->assertSuccessful();

    $dates = Event::withoutGlobalScopes()->where('template_id', $template->id)
        ->pluck('event_date')->map(fn ($d) => $d->format('Y-m-d'))->all();

    // التكرار المستحق 2026-09-20 محظور ← أُزيح إلى 2026-09-27
    expect($dates)->toBe(['2026-09-27']);

    expect(Notification::where('notifiable_id', $leader->id)
        ->where('title', 'أُزيح موعد فعالية القالب أسبوعاً')
        ->where('body', 'like', '%اليوم الوطني%')
        ->exists())->toBeTrue();
});

it('drops the occurrence when the shifted date is blacked out too (no chained shifting)', function () {
    [, , $template] = blackoutSetup([
        'recurrence_pattern' => EventTemplate::PATTERN_BIWEEKLY,
        'blackout_behavior' => EventTemplate::BLACKOUT_SHIFT_WEEK,
    ]);

    // رمضان يغطي الموعد والمزاح معاً
    BlackoutDate::factory()->create(['name' => 'رمضان', 'starts_on' => '2026-09-15', 'ends_on' => '2026-10-05']);

    $this->artisan('app:generate-template-events')->assertSuccessful();

    expect(Event::withoutGlobalScopes()->where('template_id', $template->id)->count())->toBe(0);
});

it('for weekly templates a shifted occurrence merges into the following week (no duplicate)', function () {
    [, , $template] = blackoutSetup(['blackout_behavior' => EventTemplate::BLACKOUT_SHIFT_WEEK]);

    BlackoutDate::factory()->create(['name' => 'إجازة', 'starts_on' => '2026-09-13', 'ends_on' => '2026-09-13']);

    $this->artisan('app:generate-template-events')->assertSuccessful();

    // 13 أُزيح إلى 20 وهو تكرار قائم أصلاً — فعالية واحدة فقط يوم 20
    $dates = Event::withoutGlobalScopes()->where('template_id', $template->id)
        ->pluck('event_date')->map(fn ($d) => $d->format('Y-m-d'))->all();

    expect($dates)->toBe(['2026-09-20']);
});

it('blackouts apply at generation time only — already-generated events are untouched', function () {
    [, , $template] = blackoutSetup();

    $this->artisan('app:generate-template-events')->assertSuccessful();
    expect(Event::withoutGlobalScopes()->where('template_id', $template->id)->count())->toBe(2);

    // حظر أُضيف بعد التوليد يغطي 2026-09-13 — الفعالية المولّدة لا تُمس
    BlackoutDate::factory()->create(['starts_on' => '2026-09-13', 'ends_on' => '2026-09-13']);
    $this->artisan('app:generate-template-events')->assertSuccessful();

    expect(Event::withoutGlobalScopes()->where('template_id', $template->id)
        ->whereDate('event_date', '2026-09-13')->exists())->toBeTrue();
});

// ── إدارة الأدمن (CRUD أدنى — يوسّعه A15) ───────────────────────────────────

it('platform admin manages blackout ranges', function () {
    $admin = User::factory()->platformAdmin()->create();

    $this->actingAs($admin, 'admin')
        ->post('/admin/blackouts', ['name' => 'رمضان', 'starts_on' => '2027-02-08', 'ends_on' => '2027-03-09'])
        ->assertRedirect();

    $blackout = BlackoutDate::query()->where('name', 'رمضان')->first();
    expect($blackout)->not->toBeNull();

    $this->actingAs($admin, 'admin')
        ->put("/admin/blackouts/{$blackout->id}", ['name' => 'رمضان 1448', 'starts_on' => '2027-02-08', 'ends_on' => '2027-03-09'])
        ->assertRedirect();

    expect($blackout->fresh()->name)->toBe('رمضان 1448');

    $this->actingAs($admin, 'admin')
        ->delete("/admin/blackouts/{$blackout->id}")
        ->assertRedirect();

    expect(BlackoutDate::query()->count())->toBe(0);
});

it('rejects an end date before the start date', function () {
    $admin = User::factory()->platformAdmin()->create();

    $this->actingAs($admin, 'admin')
        ->post('/admin/blackouts', ['name' => 'خطأ', 'starts_on' => '2027-03-09', 'ends_on' => '2027-02-08'])
        ->assertSessionHasErrors('ends_on');

    expect(BlackoutDate::query()->count())->toBe(0);
});

it('blocks non-admins from managing blackouts', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->post('/admin/blackouts', ['name' => 'تسلل', 'starts_on' => '2027-02-08', 'ends_on' => '2027-03-09'])
        ->assertRedirect(); // يُعاد توجيهه لتسجيل دخول الأدمن — لا يمر

    expect(BlackoutDate::query()->count())->toBe(0);
});
