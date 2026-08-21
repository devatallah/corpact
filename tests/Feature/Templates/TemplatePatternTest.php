<?php

use App\Models\EventTemplate;
use App\Services\Events\LegacyRecurrenceMigrator;
use App\Services\Events\TemplateScheduleService;
use Carbon\Carbon;

// H §8: الأنماط أسبوعي/كل أسبوعين/شهري؛ بداية الأسبوع الأحد؛ «شهرياً يوم 31»
// في شهر أقصر ← آخر يوم؛ التوليد قبل 14 يوماً من الموعد.

function patternTemplate(array $attributes = []): EventTemplate
{
    return EventTemplate::factory()->create($attributes);
}

it('weekly pattern lands on the template weekday only, week starting Sunday', function () {
    // 2026-09-06 أحد (dayOfWeek = 0)
    $template = patternTemplate(['day_of_week' => 0, 'anchor_date' => '2026-09-06']);
    $service = app(TemplateScheduleService::class);

    expect($service->occursOn($template, Carbon::parse('2026-09-06')))->toBeTrue()   // أحد
        ->and($service->occursOn($template, Carbon::parse('2026-09-13')))->toBeTrue() // الأحد التالي
        ->and($service->occursOn($template, Carbon::parse('2026-09-07')))->toBeFalse() // إثنين
        ->and($service->occursOn($template, Carbon::parse('2026-08-30')))->toBeFalse(); // أحد قبل المرساة
});

it('generates exactly the dates whose start falls within (today .. today+14]', function () {
    // اليوم أحد 2026-09-06؛ قالب أحد أسبوعي — المستحق: 13 و20 (داخل 14 يوماً)، لا 27
    $template = patternTemplate(['day_of_week' => 0, 'anchor_date' => '2026-09-06']);
    $due = app(TemplateScheduleService::class)->dueOccurrences($template, Carbon::parse('2026-09-06'));

    $dates = array_map(fn ($o) => $o['effective_date']->toDateString(), $due);

    expect($dates)->toBe(['2026-09-13', '2026-09-20']);
});

it('biweekly runs on a 14-day cadence from the anchor', function () {
    $template = patternTemplate([
        'recurrence_pattern' => EventTemplate::PATTERN_BIWEEKLY,
        'day_of_week' => 0,
        'anchor_date' => '2026-09-06',
    ]);
    $service = app(TemplateScheduleService::class);

    expect($service->occursOn($template, Carbon::parse('2026-09-06')))->toBeTrue()
        ->and($service->occursOn($template, Carbon::parse('2026-09-13')))->toBeFalse() // أسبوع فردي
        ->and($service->occursOn($template, Carbon::parse('2026-09-20')))->toBeTrue()
        ->and($service->occursOn($template, Carbon::parse('2026-10-04')))->toBeTrue();

    $due = $service->dueOccurrences($template, Carbon::parse('2026-09-06'));
    expect(array_map(fn ($o) => $o['effective_date']->toDateString(), $due))->toBe(['2026-09-20']);
});

it('monthly on day 31 executes on the last day of shorter months', function () {
    $template = patternTemplate([
        'recurrence_pattern' => EventTemplate::PATTERN_MONTHLY,
        'day_of_week' => null,
        'day_of_month' => 31,
        'anchor_date' => '2026-08-31',
    ]);
    $service = app(TemplateScheduleService::class);

    expect($service->occursOn($template, Carbon::parse('2026-08-31')))->toBeTrue()
        ->and($service->occursOn($template, Carbon::parse('2026-09-30')))->toBeTrue()  // سبتمبر 30 يوماً ← آخر يوم
        ->and($service->occursOn($template, Carbon::parse('2026-09-29')))->toBeFalse()
        ->and($service->occursOn($template, Carbon::parse('2027-02-28')))->toBeTrue()  // فبراير غير كبيس
        ->and($service->occursOn($template, Carbon::parse('2026-10-31')))->toBeTrue();

    // 2026-09-30 يقع داخل نافذة (2026-09-16 .. 2026-09-30]
    $due = $service->dueOccurrences($template, Carbon::parse('2026-09-16'));
    expect(array_map(fn ($o) => $o['effective_date']->toDateString(), $due))->toBe(['2026-09-30']);
});

it('a date exactly 15 days out is not yet due; 14 days out is', function () {
    $template = patternTemplate(['day_of_week' => 0, 'anchor_date' => '2026-09-20']);
    $service = app(TemplateScheduleService::class);

    // اليوم 2026-09-05: الأحد 2026-09-20 على بعد 15 يوماً — ليس مستحقاً بعد
    expect($service->dueOccurrences($template, Carbon::parse('2026-09-05')))->toBe([]);

    // اليوم 2026-09-06: على بعد 14 يوماً بالضبط — مستحق
    $due = $service->dueOccurrences($template, Carbon::parse('2026-09-06'));
    expect(array_map(fn ($o) => $o['effective_date']->toDateString(), $due))->toBe(['2026-09-20']);
});

it('stops producing dates past the template ends_on (legacy series bridge)', function () {
    $template = patternTemplate([
        'day_of_week' => 0,
        'anchor_date' => '2026-09-06',
        'ends_on' => '2026-09-13',
    ]);

    $due = app(TemplateScheduleService::class)->dueOccurrences($template, Carbon::parse('2026-09-06'));
    expect(array_map(fn ($o) => $o['effective_date']->toDateString(), $due))->toBe(['2026-09-13']);
});

it('normalizes the anchor to the first pattern date, clamping short months', function () {
    $service = app(TemplateScheduleService::class);

    // أسبوعي: أول أحد بدءاً من إثنين 2026-09-07 هو 2026-09-13
    expect($service->normalizeAnchor('weekly', 0, null, Carbon::parse('2026-09-07'))->toDateString())
        ->toBe('2026-09-13');

    // شهري يوم 31 بدءاً من 2027-02-01 ← آخر يوم فبراير
    expect($service->normalizeAnchor('monthly', null, 31, Carbon::parse('2027-02-01'))->toDateString())
        ->toBe('2027-02-28');

    // شهري يوم 10 بدءاً من 2026-09-15 (فات اليوم) ← الشهر التالي
    expect($service->normalizeAnchor('monthly', null, 10, Carbon::parse('2026-09-15'))->toDateString())
        ->toBe('2026-10-10');
});

// ── خريطة ترحيل التكرار القديم (migration 2026_08_20_800002) ─────────────────

it('maps a legacy multi-day weekly series to one template per day', function () {
    $rows = (new LegacyRecurrenceMigrator)->templateAttributesFor([
        'company_id' => 1, 'community_id' => 2,
        'recurrence_type' => 'weekly',
        'recurrence_days' => [1, 4],
        'recurrence_end_date' => '2027-01-01',
        'event_date' => '2026-09-06',
        'start_time' => '20:00:00',
        'duration_minutes' => 90,
        'capacity' => 10,
        'min_participants' => 4,
        'total_amount' => 500,
    ], Carbon::parse('2026-09-01'));

    expect($rows)->toHaveCount(2)
        ->and(array_column($rows, 'day_of_week'))->toBe([1, 4])
        ->and($rows[0]['recurrence_pattern'])->toBe('weekly')
        ->and($rows[0]['ends_on'])->toBe('2027-01-01')
        ->and($rows[0]['status'])->toBe('active')
        ->and($rows[0]['start_time'])->toBe('20:00')
        ->and($rows[0]['total_amount'])->toBe(500);
});

it('maps the legacy daily type (absent from the spec) to a weekly template on the parent weekday', function () {
    $rows = (new LegacyRecurrenceMigrator)->templateAttributesFor([
        'company_id' => 1, 'community_id' => 2,
        'recurrence_type' => 'daily',
        'recurrence_days' => [],
        'recurrence_end_date' => null,
        'event_date' => '2026-09-09', // أربعاء (dayOfWeek = 3)
        'start_time' => '18:00:00',
    ], Carbon::parse('2026-09-01'));

    expect($rows)->toHaveCount(1)
        ->and($rows[0]['recurrence_pattern'])->toBe('weekly')
        ->and($rows[0]['day_of_week'])->toBe(3)
        ->and($rows[0]['ends_on'])->toBeNull();
});

it('maps legacy monthly to a monthly template on the parent day, and expired series arrive paused', function () {
    $rows = (new LegacyRecurrenceMigrator)->templateAttributesFor([
        'company_id' => 1, 'community_id' => 2,
        'recurrence_type' => 'monthly',
        'recurrence_days' => [],
        'recurrence_end_date' => '2026-06-30',
        'event_date' => '2026-01-31',
        'start_time' => '17:30:00',
    ], Carbon::parse('2026-09-01'));

    expect($rows)->toHaveCount(1)
        ->and($rows[0]['recurrence_pattern'])->toBe('monthly')
        ->and($rows[0]['day_of_month'])->toBe(31)
        ->and($rows[0]['status'])->toBe('paused') // انتهت قبل اليوم
        ->and($rows[0]['ends_on'])->toBe('2026-06-30');
});
