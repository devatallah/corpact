<?php

namespace App\Services\Events;

use Carbon\Carbon;

/**
 * A8 — خريطة ترحيل التكرار القديم إلى قوالب `event_templates` (موثقة هنا
 * وتستخدمها migration 2026_08_20_800002، ومثبتة باختبار):
 *
 * - `weekly` ← قالب weekly لكل يوم في `recurrence_days` (السلسلة القديمة
 *   كانت تسمح بعدة أيام في الأسبوع؛ قالب المواصفة يوم واحد — فيتفكك الصف
 *   الواحد إلى قالب لكل يوم). قائمة فارغة ← يوم تاريخ الفعالية الأم.
 * - `monthly` ← قالب monthly بيوم شهر تاريخ الأم («يوم 31» في شهر أقصر ←
 *   آخر يوم — نفس سلوك المولد القديم).
 * - `daily` ← **النوع غير موجود في المواصفة** (H §8: أسبوعي · كل أسبوعين ·
 *   شهري فقط) — يُرحَّل قالباً `weekly` بيوم تاريخ الفعالية الأم، وتُحفظ بقية
 *   التكرارات المولدة سلفاً كما هي (كانت مولّدة دفعة واحدة أصلاً فلا يضيع
 *   شيء قائم؛ التوليد الجديد أسبوعي فقط). القرار موثق في divergences.md.
 * - `recurrence_end_date` ← `ends_on` على القالب (قوالب المواصفة بلا نهاية؛
 *   العمود جسر وفاء بحدود السلسلة القديمة). سلسلة انتهى موعدها ← قالب paused.
 * - كل فعاليات السلسلة (الأم والتكرارات) تُربط بالقالب عبر `template_id`
 *   (لقالب اليوم المطابق عند التعدد، وإلا فالقالب الأول) — فيمنع فحص الوجود
 *   في التوليد أي ازدواج مع المولد سلفاً.
 */
class LegacyRecurrenceMigrator
{
    /**
     * صف سلسلة قديمة ← صفات قالب/قوالب المواصفة.
     *
     * @param  array<string, mixed>  $series  صف الفعالية الأم: يتوقع المفاتيح
     *                                        recurrence_type/recurrence_days/recurrence_end_date/event_date
     *                                        + start_time/duration_minutes/capacity/min_participants
     *                                        + community_id/company_id/partner_id/category_id/venue_pricing_id
     *                                        + created_by/title/notes + الحقول المالية + venue_ids (اختياري)
     * @return array<int, array<string, mixed>> قائمة صفات القوالب (قد تتعدد لأسبوعي متعدد الأيام)
     */
    public function templateAttributesFor(array $series, ?Carbon $today = null): array
    {
        $today ??= Carbon::today();
        $anchor = Carbon::parse((string) $series['event_date'])->startOfDay();
        $endsOn = ! empty($series['recurrence_end_date'])
            ? Carbon::parse((string) $series['recurrence_end_date'])->startOfDay()
            : null;

        $base = [
            'company_id' => $series['company_id'],
            'community_id' => $series['community_id'],
            'partner_id' => $series['partner_id'] ?? null,
            'activity_unit_id' => $series['activity_unit_id'] ?? null,
            'category_id' => $series['category_id'] ?? null,
            'venue_pricing_id' => $series['venue_pricing_id'] ?? null,
            'venue_ids' => $series['venue_ids'] ?? null,
            'created_by' => $series['created_by'] ?? null,
            'title' => $series['title'] ?? null,
            'notes' => $series['notes'] ?? null,
            'anchor_date' => $anchor->toDateString(),
            'ends_on' => $endsOn?->toDateString(),
            'start_time' => substr((string) $series['start_time'], 0, 5),
            'duration_minutes' => (int) ($series['duration_minutes'] ?? 60),
            'capacity' => (int) ($series['capacity'] ?? 2),
            'min_participants' => (int) ($series['min_participants'] ?? 1),
            'venues_count' => (int) ($series['venues_count'] ?? 1),
            'total_amount' => $series['total_amount'] ?? 0,
            'company_subsidy' => $series['company_subsidy'] ?? 0,
            'community_contribution' => $series['community_contribution'] ?? 0,
            'player_payment' => $series['player_payment'] ?? 0,
            'cost_per_person' => $series['cost_per_person'] ?? 0,
            'blackout_behavior' => 'skip',
            'reschedule_interval_days' => 7,
            // سلسلة انتهت ← paused؛ وإلا active (ends_on يمنع تجاوز نهايتها)
            'status' => ($endsOn !== null && $endsOn->lt($today)) ? 'paused' : 'active',
        ];

        $type = (string) ($series['recurrence_type'] ?? 'none');

        if ($type === 'monthly') {
            return [array_merge($base, [
                'recurrence_pattern' => 'monthly',
                'day_of_week' => null,
                'day_of_month' => $anchor->day,
            ])];
        }

        // weekly المتعدد الأيام يتفكك قالباً لكل يوم؛ daily ← weekly بيوم الأم.
        $days = $type === 'weekly'
            ? array_values(array_unique(array_map(intval(...), (array) ($series['recurrence_days'] ?? []))))
            : [];

        if ($days === []) {
            $days = [$anchor->dayOfWeek];
        }

        return array_map(fn (int $day) => array_merge($base, [
            'recurrence_pattern' => 'weekly',
            'day_of_week' => $day,
            'day_of_month' => null,
        ]), $days);
    }
}
