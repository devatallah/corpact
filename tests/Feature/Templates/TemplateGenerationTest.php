<?php

use App\Models\ActivityUnit;
use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventStatusHistory;
use App\Models\EventTemplate;
use App\Models\JobRun;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\ProviderBranch;
use App\Models\UnitSlot;
use App\Services\Community\LeadershipService;
use App\Services\Events\TemplateService;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

// H §8: التوليد قبل 14 يوماً عبر machine->initialize؛ idempotent لكل
// (قالب + تاريخ)؛ يتخطى الموقوف والمجتمع الخامل والوحدة غير المتاحة (بسبب
// مبلَّغ للقائد)؛ الإيقاف يوقف المستقبل فقط؛ التعديل يسري على اللاحق فقط.

function generationSetup(array $templateAttributes = []): array
{
    // اليوم أحد ثابت حتى تكون النافذة حتمية
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
        'start_time' => '20:00',
        ...$templateAttributes,
    ]);

    return [$company, $community, $leader->fresh(), $template];
}

it('generates events 14 days ahead through the state machine with the template values copied', function () {
    [, $community, , $template] = generationSetup([
        'total_amount' => 600,
        'company_subsidy' => 150,
        'community_contribution' => 150,
        'player_payment' => 450,
        'cost_per_person' => 45,
        'capacity' => 10,
        'min_participants' => 4,
    ]);

    $this->artisan('app:generate-template-events')->assertSuccessful();

    $events = Event::withoutGlobalScopes()->where('template_id', $template->id)->orderBy('event_date')->get();

    // الأحدان القادمان داخل (اليوم .. اليوم + 14]
    expect($events->pluck('event_date')->map(fn ($d) => $d->format('Y-m-d'))->all())
        ->toBe(['2026-09-13', '2026-09-20']);

    $event = $events->first();

    expect($event->status)->toBe('open')
        ->and($event->community_id)->toBe($community->id)
        ->and($event->participants_count)->toBe(0)
        ->and((float) $event->total_amount)->toBe(600.0)
        ->and((float) $event->company_subsidy)->toBe(150.0)
        ->and((float) $event->player_payment)->toBe(450.0)
        ->and($event->min_participants)->toBe(4)
        ->and($event->registration_closes_at)->not->toBeNull();

    // شرط A7: سطر التاريخ الافتتاحي عبر machine->initialize
    $history = EventStatusHistory::where('event_id', $event->id)->first();
    expect($history)->not->toBeNull()
        ->and($history->from_status)->toBeNull()
        ->and($history->to_status)->toBe('open')
        ->and($history->reason)->toContain('قالب');
});

it('is idempotent per template and pattern date — a second run creates nothing new', function () {
    [, , , $template] = generationSetup();

    $this->artisan('app:generate-template-events')->assertSuccessful();
    $this->artisan('app:generate-template-events')->assertSuccessful();

    expect(Event::withoutGlobalScopes()->where('template_id', $template->id)->count())->toBe(2)
        ->and(JobRun::where('job', 'template:generate-event')->where('entity_id', $template->id)->count())->toBe(2);
});

it('skips dormant communities entirely (A5)', function () {
    [, $community, , $template] = generationSetup();
    $community->forceFill(['status' => Community::STATUS_DORMANT])->save();

    $this->artisan('app:generate-template-events')->assertSuccessful();

    expect(Event::withoutGlobalScopes()->where('template_id', $template->id)->count())->toBe(0);
});

it('pausing stops future generation only and never touches generated events', function () {
    [, , , $template] = generationSetup();

    $this->artisan('app:generate-template-events')->assertSuccessful();
    $generated = Event::withoutGlobalScopes()->where('template_id', $template->id)->pluck('status', 'id');
    expect($generated)->toHaveCount(2);

    app(TemplateService::class)->pause($template);

    // أسبوع لاحقاً: لا توليد جديد، والفعاليات المولّدة كما هي
    $this->travelTo(Carbon::parse('2026-09-13 03:00'));
    $this->artisan('app:generate-template-events')->assertSuccessful();

    $after = Event::withoutGlobalScopes()->where('template_id', $template->id)->pluck('status', 'id');
    expect($after->count())->toBe(2)
        ->and($after->all())->toBe($generated->all()); // لم تُمس ولم تُلغ

    // إعادة التفعيل تستأنف التوليد
    app(TemplateService::class)->resume($template->fresh());
    expect(Event::withoutGlobalScopes()->where('template_id', $template->id)->count())->toBeGreaterThan(2);
});

it('template edits apply only to events generated afterwards', function () {
    [, , , $template] = generationSetup(['start_time' => '20:00', 'capacity' => 10, 'min_participants' => 4]);

    $this->artisan('app:generate-template-events')->assertSuccessful();
    $before = Event::withoutGlobalScopes()->where('template_id', $template->id)->orderBy('event_date')->get();
    expect($before->first()->start_time)->toContain('20:00');

    app(TemplateService::class)->update($template->fresh(), [
        'start_time' => '18:30',
        'capacity' => 8,
        'min_participants' => 4,
    ]);

    // المولّدة سابقاً لم تتغير
    expect($before->first()->fresh()->start_time)->toContain('20:00')
        ->and($before->first()->fresh()->capacity)->toBe(10);

    // التوليد اللاحق بالقيم الجديدة
    $this->travelTo(Carbon::parse('2026-09-13 03:00'));
    $this->artisan('app:generate-template-events')->assertSuccessful();

    $new = Event::withoutGlobalScopes()->where('template_id', $template->id)
        ->whereDate('event_date', '2026-09-27')->first();

    expect($new)->not->toBeNull()
        ->and($new->start_time)->toContain('18:30')
        ->and($new->capacity)->toBe(8);
});

it('never generates an event on an unavailable unit and tells the leader why (A9 guard)', function () {
    [, , $leader, $template] = generationSetup();

    $partner = Partner::factory()->create();
    $branch = ProviderBranch::factory()->create(['partner_id' => $partner->id]);
    $unit = ActivityUnit::factory()->create(['provider_branch_id' => $branch->id]);
    $template->forceFill(['partner_id' => $partner->id, 'activity_unit_id' => $unit->id])->save();

    // حجز خارجي يشغل فتحة الأحد 2026-09-13 كاملة
    UnitSlot::create([
        'activity_unit_id' => $unit->id,
        'date' => '2026-09-13',
        'start_time' => '19:00',
        'end_time' => '22:00',
        'booking_type' => UnitSlot::TYPE_EXTERNAL,
        'note' => 'حجز خارجي',
    ]);

    $this->artisan('app:generate-template-events')->assertSuccessful();

    $dates = Event::withoutGlobalScopes()->where('template_id', $template->id)
        ->pluck('event_date')->map(fn ($d) => $d->format('Y-m-d'))->all();

    // 13 سبتمبر تُخطيت (الوحدة مشغولة)، و20 سبتمبر وُلّدت
    expect($dates)->toBe(['2026-09-20']);

    expect(Notification::where('notifiable_id', $leader->id)
        ->where('title', 'لم تُولَّد فعالية القالب — الوحدة غير متاحة')
        ->where('body', 'like', '%2026-09-13%')
        ->exists())->toBeTrue();

    // القرار اتُّخذ مرة واحدة — لا يعاد فتحه حتى لو خلت الفتحة لاحقاً
    expect(JobRun::where('job', 'template:generate-event')
        ->where('entity_id', $template->id)->where('period', '2026-09-13')
        ->where('status', 'completed')->exists())->toBeTrue();
});

it('creating a template through the service generates due events immediately', function () {
    test()->travelTo(Carbon::parse('2026-09-06 10:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id, 'status' => 'active']);
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

    $template = app(TemplateService::class)->create($community, [
        'partner_id' => Partner::factory()->create()->id,
        'category_id' => Category::factory()->create()->id,
        'recurrence_pattern' => 'weekly',
        'day_of_week' => 0,
        'starts_from' => '2026-09-06',
        'start_time' => '20:00',
        'duration_minutes' => 90,
        'capacity' => 10,
        'min_participants' => 4,
    ], $leader);

    expect(Event::withoutGlobalScopes()->where('template_id', $template->id)->count())->toBe(2);
});

it('refuses templates for dormant communities', function () {
    test()->travelTo(Carbon::parse('2026-09-06 10:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id, 'status' => Community::STATUS_DORMANT]);

    expect(fn () => app(TemplateService::class)->create($community, [
        'partner_id' => Partner::factory()->create()->id,
        'category_id' => Category::factory()->create()->id,
        'recurrence_pattern' => 'weekly',
        'day_of_week' => 0,
        'start_time' => '20:00',
        'duration_minutes' => 90,
        'capacity' => 10,
        'min_participants' => 4,
    ], null))->toThrow(ValidationException::class);
});
