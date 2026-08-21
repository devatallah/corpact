<?php

namespace App\Services\Events;

use App\Models\ActivityUnit;
use App\Models\Community;
use App\Models\Employee;
use App\Models\EventTemplate;
use App\Services\ActivityLogService;
use App\Support\Money;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * إدارة قوالب التكرار (H §8) — ينشئها قائد المجتمع أو المنسّق أو مسؤول الحساب:
 *
 * - الإيقاف يوقف **التوليد المستقبلي فقط** ولا يمس أي فعالية مولّدة سابقاً.
 * - التعديل يسري على ما سيُولَّد لاحقاً فقط (القيم تُنسخ لحظة التوليد).
 * - الحقول المالية قيم تمريرية تُنسخ للفعاليات كما هي — دلالاتها لـ A10.
 */
class TemplateService
{
    public function __construct(
        private TemplateScheduleService $schedule,
        private TemplateGenerationService $generation,
    ) {}

    /**
     * @param  array<string, mixed>  $data  بيانات مُتحقَّق منها من المتحكم
     */
    public function create(Community $community, array $data, ?Employee $creator): EventTemplate
    {
        if ($community->status === Community::STATUS_DORMANT) {
            throw ValidationException::withMessages([
                'community_id' => ['هذا المجتمع خامل — لا قوالب ولا فعاليات حتى يُعيَّن له قائد.'],
            ]);
        }

        $attributes = $this->attributesFrom($data);
        $this->guardUnitBelongsToPartner($attributes);

        $template = EventTemplate::create([
            ...$attributes,
            'company_id' => $community->company_id,
            'community_id' => $community->id,
            'created_by' => $creator?->id,
            'status' => EventTemplate::STATUS_ACTIVE,
        ]);

        ActivityLogService::log(
            $community->company_id,
            $template,
            'event_template_created',
            "أُنشئ قالب التكرار #{$template->id} ({$template->recurrence_pattern}) لمجتمع {$community->name}",
        );

        // توليد فوري لما هو مستحق داخل أفق الـ 14 يوماً — لا انتظار لتشغيل 02:00.
        $this->generation->generateForTemplate($template->fresh(['community', 'activityUnit.branch', 'creator']));

        return $template;
    }

    /**
     * تعديل القالب — يسري على الفعاليات التي ستُولَّد لاحقاً فقط (H §8):
     * الفعاليات المولّدة نسخت قيمها لحظة التوليد ولا تُمس هنا.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(EventTemplate $template, array $data): EventTemplate
    {
        $attributes = $this->attributesFrom($data, $template);
        $this->guardUnitBelongsToPartner($attributes);

        $template->fill($attributes)->save();

        ActivityLogService::log(
            $template->company_id,
            $template,
            'event_template_updated',
            "عُدّل قالب التكرار #{$template->id} — يسري على ما سيُولَّد لاحقاً فقط",
        );

        return $template;
    }

    /**
     * إيقاف القالب: يوقف التوليد المستقبلي فقط ولا يمس أي فعالية مولّدة (H §8).
     */
    public function pause(EventTemplate $template): EventTemplate
    {
        if ($template->status !== EventTemplate::STATUS_PAUSED) {
            $template->forceFill([
                'status' => EventTemplate::STATUS_PAUSED,
                'paused_at' => now(),
            ])->save();

            ActivityLogService::log(
                $template->company_id,
                $template,
                'event_template_paused',
                "أُوقف قالب التكرار #{$template->id} — توقف التوليد المستقبلي فقط، الفعاليات المولّدة لم تُمس",
            );
        }

        return $template;
    }

    public function resume(EventTemplate $template): EventTemplate
    {
        if ($template->status !== EventTemplate::STATUS_ACTIVE) {
            $template->forceFill([
                'status' => EventTemplate::STATUS_ACTIVE,
                'paused_at' => null,
            ])->save();

            ActivityLogService::log(
                $template->company_id,
                $template,
                'event_template_resumed',
                "أُعيد تفعيل قالب التكرار #{$template->id}",
            );

            $this->generation->generateForTemplate($template->fresh(['community', 'activityUnit.branch', 'creator']));
        }

        return $template;
    }

    /**
     * تحويل مدخلات النموذج إلى صفات القالب مع تطبيع المرساة.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributesFrom(array $data, ?EventTemplate $existing = null): array
    {
        $pattern = (string) ($data['recurrence_pattern'] ?? $existing?->recurrence_pattern);
        $dayOfWeek = array_key_exists('day_of_week', $data) ? $data['day_of_week'] : $existing?->day_of_week;
        $dayOfMonth = array_key_exists('day_of_month', $data) ? $data['day_of_month'] : $existing?->day_of_month;

        $isWeekly = in_array($pattern, [EventTemplate::PATTERN_WEEKLY, EventTemplate::PATTERN_BIWEEKLY], true);

        if ($isWeekly && $dayOfWeek === null) {
            throw ValidationException::withMessages(['day_of_week' => ['يوم الأسبوع مطلوب للنمط الأسبوعي.']]);
        }

        if ($pattern === EventTemplate::PATTERN_MONTHLY && $dayOfMonth === null) {
            throw ValidationException::withMessages(['day_of_month' => ['يوم الشهر مطلوب للنمط الشهري.']]);
        }

        $startsFrom = ! empty($data['starts_from'])
            ? Carbon::parse((string) $data['starts_from'])
            : ($existing?->anchor_date !== null ? Carbon::parse($existing->anchor_date->toDateString()) : Carbon::today());

        $anchor = $this->schedule->normalizeAnchor(
            $pattern,
            $isWeekly ? (int) $dayOfWeek : null,
            $pattern === EventTemplate::PATTERN_MONTHLY ? (int) $dayOfMonth : null,
            $startsFrom,
        );

        // الفعالية تتطلب نشاطاً (category_id إلزامي على events) — من المدخل
        // مباشرة أو من وحدة النشاط المختارة.
        $categoryId = $data['category_id'] ?? $existing?->category_id;
        $unitId = array_key_exists('activity_unit_id', $data) ? $data['activity_unit_id'] : $existing?->activity_unit_id;

        if ($categoryId === null && $unitId !== null) {
            $categoryId = ActivityUnit::query()->whereKey($unitId)->value('category_id');
        }

        if ($categoryId === null) {
            throw ValidationException::withMessages([
                'category_id' => ['النشاط مطلوب — اختر نشاطاً أو وحدة نشاط تحدده.'],
            ]);
        }

        $capacity = (int) ($data['capacity'] ?? $existing?->capacity ?? 2);

        // A10 — H §12.2: المال هللات صحيحة على القالب: الإجمالي +
        // subsidy_type (fixed | percentage) + subsidy_value.
        $totalHalalas = array_key_exists('total_amount', $data)
            ? Money::toHalalas($data['total_amount'] ?? 0)
            : (int) ($existing?->total_amount_halalas ?? 0);
        $subsidyType = $data['subsidy_type'] ?? $existing?->subsidy_type ?? 'fixed';
        $subsidyValue = array_key_exists('company_subsidy', $data)
            ? Money::toHalalas($data['company_subsidy'] ?? 0)
            : (array_key_exists('subsidy_value', $data)
                ? (int) $data['subsidy_value']
                : (int) ($existing?->subsidy_value ?? 0));

        if ($subsidyType === 'percentage') {
            $subsidyValue = min(100, $subsidyValue);
        } else {
            $subsidyValue = min($subsidyValue, $totalHalalas);
        }

        return [
            'partner_id' => $data['partner_id'] ?? $existing?->partner_id,
            'activity_unit_id' => $unitId,
            'category_id' => $categoryId,
            'venue_pricing_id' => array_key_exists('venue_pricing_id', $data) ? $data['venue_pricing_id'] : $existing?->venue_pricing_id,
            'venue_ids' => array_key_exists('venue_ids', $data) ? array_values((array) $data['venue_ids']) : ($existing?->venue_ids ?? []),
            'title' => array_key_exists('title', $data) ? $data['title'] : $existing?->title,
            'notes' => array_key_exists('notes', $data) ? $data['notes'] : $existing?->notes,
            'recurrence_pattern' => $pattern,
            'day_of_week' => $isWeekly ? (int) $dayOfWeek : null,
            'day_of_month' => $pattern === EventTemplate::PATTERN_MONTHLY ? (int) $dayOfMonth : null,
            'anchor_date' => $anchor->toDateString(),
            'start_time' => substr((string) ($data['start_time'] ?? $existing?->start_time ?? '20:00'), 0, 5),
            'duration_minutes' => (int) ($data['duration_minutes'] ?? $existing?->duration_minutes ?? 60),
            'capacity' => $capacity,
            'min_participants' => min((int) ($data['min_participants'] ?? $existing?->min_participants ?? 2), $capacity),
            'venues_count' => (int) ($data['venues_count'] ?? $existing?->venues_count ?? 1),
            // A10 — H §12.2: هللات صحيحة + نوع الدعم وقيمته
            'total_amount_halalas' => $totalHalalas,
            'subsidy_type' => $subsidyType,
            'subsidy_value' => $subsidyValue,
            'blackout_behavior' => $data['blackout_behavior'] ?? $existing?->blackout_behavior ?? EventTemplate::BLACKOUT_SKIP,
            'reschedule_interval_days' => (int) ($data['reschedule_interval_days'] ?? $existing?->reschedule_interval_days ?? 7),
        ];
    }

    /**
     * وحدة النشاط (إن حُددت) يجب أن تتبع المزوّد المختار.
     *
     * @param  array<string, mixed>  $attributes
     */
    private function guardUnitBelongsToPartner(array $attributes): void
    {
        if (empty($attributes['activity_unit_id'])) {
            return;
        }

        $belongs = ActivityUnit::query()
            ->whereKey($attributes['activity_unit_id'])
            ->whereHas('branch', fn ($q) => $q->where('partner_id', $attributes['partner_id']))
            ->exists();

        if (! $belongs) {
            throw ValidationException::withMessages([
                'activity_unit_id' => ['وحدة النشاط المختارة لا تتبع المزوّد المحدد.'],
            ]);
        }
    }
}
