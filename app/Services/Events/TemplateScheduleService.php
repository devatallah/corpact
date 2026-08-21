<?php

namespace App\Services\Events;

use App\Models\BlackoutDate;
use App\Models\EventTemplate;
use Carbon\Carbon;
use Carbon\CarbonInterface;

/**
 * حساب مواعيد قالب التكرار (H §8):
 *
 * - الأنماط: أسبوعي / كل أسبوعين (تعاقب 14 يوماً من anchor_date) / شهري.
 * - بداية الأسبوع الأحد (ترقيم الأيام: 0=الأحد .. 6=السبت — ترقيم Carbon نفسه).
 * - «شهرياً يوم 31» في شهر أقصر ← ينفَّذ في آخر يوم من الشهر.
 * - أيام الحظر: النطاق المغطي للتاريخ يُسقطه (skip) أو يزيحه أسبوعاً واحداً
 *   (shift_week) حسب إعداد القالب؛ الإزاحة إلى يوم محظور أيضاً = إسقاط
 *   (لا إزاحة متسلسلة — قرار موثق في divergences.md).
 * - التوليد قبل 14 يوماً من الموعد الفعلي: يستحق التاريخُ التوليدَ حين يدخل
 *   موعده الفعلي نافذة (اليوم .. اليوم + 14].
 */
class TemplateScheduleService
{
    public const ACTION_GENERATE = 'generate';

    public const ACTION_SKIP_BLACKOUT = 'skip_blackout';

    /**
     * هل يقع التاريخ على نمط القالب؟ (قبل تطبيق أيام الحظر)
     */
    public function occursOn(EventTemplate $template, CarbonInterface $date): bool
    {
        $date = Carbon::parse($date->toDateString());
        $anchor = Carbon::parse($template->anchor_date->toDateString());

        if ($date->lt($anchor)) {
            return false;
        }

        if ($template->ends_on !== null && $date->gt(Carbon::parse($template->ends_on->toDateString()))) {
            return false;
        }

        return match ($template->recurrence_pattern) {
            EventTemplate::PATTERN_WEEKLY => $date->dayOfWeek === (int) $template->day_of_week,
            EventTemplate::PATTERN_BIWEEKLY => $date->dayOfWeek === (int) $template->day_of_week
                && intdiv((int) $anchor->diffInDays($date), 7) % 2 === 0,
            EventTemplate::PATTERN_MONTHLY => $date->day === min((int) $template->day_of_month, $date->daysInMonth),
            default => false,
        };
    }

    /**
     * تطبيق أيام الحظر على تاريخ نمطي: التاريخ نفسه، أو المزاح أسبوعاً، أو
     * null (إسقاط). يعيد أيضاً نطاق الحظر المسبب إن وُجد.
     *
     * @return array{date: Carbon|null, blackout: BlackoutDate|null, shifted: bool}
     */
    public function applyBlackout(EventTemplate $template, CarbonInterface $patternDate): array
    {
        $patternDate = Carbon::parse($patternDate->toDateString());
        $blackout = BlackoutDate::coveringDate($patternDate);

        if ($blackout === null) {
            return ['date' => $patternDate, 'blackout' => null, 'shifted' => false];
        }

        if ($template->blackout_behavior !== EventTemplate::BLACKOUT_SHIFT_WEEK) {
            return ['date' => null, 'blackout' => $blackout, 'shifted' => false];
        }

        $shifted = $patternDate->copy()->addDays(7);

        if (BlackoutDate::coveringDate($shifted) !== null) {
            // المزاح محظور أيضاً — إسقاط (لا إزاحة متسلسلة)
            return ['date' => null, 'blackout' => $blackout, 'shifted' => false];
        }

        return ['date' => $shifted, 'blackout' => $blackout, 'shifted' => true];
    }

    /**
     * التواريخ المستحقة الآن: كل تاريخ نمطي موعده الفعلي (بعد الحظر) داخل
     * نافذة (اليوم .. اليوم + horizon].
     *
     * مفتاح كل بند هو التاريخ النمطي (هوية التكرار الثابتة لمفتاح idempotency)
     * — الإزاحة لا تغيّر الهوية.
     *
     * @return array<int, array{pattern_date: Carbon, effective_date: Carbon|null, action: string, blackout: BlackoutDate|null, shifted: bool}>
     */
    public function dueOccurrences(EventTemplate $template, ?CarbonInterface $today = null, int $horizon = EventTemplate::GENERATION_HORIZON_DAYS): array
    {
        $today = Carbon::parse(($today ?? Carbon::today())->toDateString());
        $due = [];

        // نطاق التواريخ النمطية: المزاح أسبوعاً قد يكون نمطيّه قبل اليوم بأقل
        // من أسبوع، فيبدأ المسح من (اليوم − 6) حتى (اليوم + الأفق).
        $cursor = $today->copy()->subDays(6);
        $end = $today->copy()->addDays($horizon);

        while ($cursor->lte($end)) {
            if ($this->occursOn($template, $cursor)) {
                $result = $this->applyBlackout($template, $cursor);
                $effective = $result['date'];

                if ($effective === null) {
                    // إسقاط حظر — يُسجَّل قراره حين يكون التاريخ النمطي مستقبلاً
                    if ($cursor->gt($today)) {
                        $due[] = [
                            'pattern_date' => $cursor->copy(),
                            'effective_date' => null,
                            'action' => self::ACTION_SKIP_BLACKOUT,
                            'blackout' => $result['blackout'],
                            'shifted' => false,
                        ];
                    }
                } elseif ($effective->gt($today) && $effective->lte($end)) {
                    $due[] = [
                        'pattern_date' => $cursor->copy(),
                        'effective_date' => $effective,
                        'action' => self::ACTION_GENERATE,
                        'blackout' => $result['blackout'],
                        'shifted' => $result['shifted'],
                    ];
                }
                // موعده الفعلي بعد النافذة (إزاحة بعيدة) ← يستحق في تشغيل لاحق
            }

            $cursor->addDay();
        }

        return $due;
    }

    /**
     * معاينة المواعيد القادمة للواجهة (مع مؤشر الحظر) — لا توليد هنا.
     *
     * @return array<int, array{pattern_date: string, effective_date: string|null, action: string, blackout_name: string|null, shifted: bool}>
     */
    public function preview(EventTemplate $template, int $count = 8, ?CarbonInterface $today = null): array
    {
        $today = Carbon::parse(($today ?? Carbon::today())->toDateString());
        $rows = [];
        $cursor = $today->copy()->addDay();
        $end = $today->copy()->addDays(400);

        while ($cursor->lte($end) && count($rows) < $count) {
            if ($this->occursOn($template, $cursor)) {
                $result = $this->applyBlackout($template, $cursor);

                $rows[] = [
                    'pattern_date' => $cursor->toDateString(),
                    'effective_date' => $result['date']?->toDateString(),
                    'action' => $result['date'] === null ? self::ACTION_SKIP_BLACKOUT : self::ACTION_GENERATE,
                    'blackout_name' => $result['blackout']?->name,
                    'shifted' => $result['shifted'],
                ];
            }

            $cursor->addDay();
        }

        return $rows;
    }

    /**
     * تطبيع تاريخ المرساة عند إنشاء/تعديل قالب: أول تاريخ نمطي بدءاً من
     * التاريخ المُدخل (للأسبوعي/كل أسبوعين: أول يومٍ مطابق؛ للشهري: يوم الشهر
     * المختار مع قصّ الشهر الأقصر).
     */
    public function normalizeAnchor(string $pattern, ?int $dayOfWeek, ?int $dayOfMonth, CarbonInterface $from): Carbon
    {
        $date = Carbon::parse($from->toDateString());

        if (in_array($pattern, [EventTemplate::PATTERN_WEEKLY, EventTemplate::PATTERN_BIWEEKLY], true)) {
            while ($date->dayOfWeek !== (int) $dayOfWeek) {
                $date->addDay();
            }

            return $date;
        }

        // شهري: يوم الشهر المختار في شهر البداية إن لم يفت، وإلا الشهر التالي.
        $candidate = $date->copy()->day(min((int) $dayOfMonth, $date->daysInMonth));

        if ($candidate->lt($date)) {
            $next = $date->copy()->addMonthNoOverflow()->startOfMonth();
            $candidate = $next->day(min((int) $dayOfMonth, $next->daysInMonth));
        }

        return $candidate;
    }
}
