<?php

namespace App\Services\Reporting;

use DateTimeInterface;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

/**
 * A13 — الفترة الزمنية لكل مؤشر (H §15).
 *
 * نص المواصفة الحاكم: **«كل مؤشر يُحسب بتوقيت الرياض، بفترة شهرية افتراضياً،
 * ويستثني الفعاليات الملغاة»**. التطبيق الافتراضي للنظام `UTC`
 * (`config/app.php`)، فالشهر «أغسطس» بتوقيت الرياض يبدأ فعلياً
 * `2026-07-31T21:00:00Z` وينتهي `2026-08-31T20:59:59Z`. حساب الشهر على حدود
 * UTC يزيح ثلاث ساعات من كل طرف — فعالية اكتملت الساعة 22:00 من آخر يوم في
 * الشهر تسقط من تقرير الشهر وتدخل تقرير الشهر التالي.
 *
 * لذلك: **حدود الفترة تُبنى دائماً هنا** — بتوقيت الرياض ثم تُحوَّل إلى لحظات
 * UTC للاستعلام. لا صفحة ولا خدمة تحسب `startOfMonth()` بنفسها.
 */
final class ReportPeriod
{
    /** توقيت المواصفة — لا يُقرأ من الإعدادات كي لا ينزاح تعريف المؤشر بتغيير بيئة. */
    public const TIMEZONE = 'Asia/Riyadh';

    private const MONTH_NAMES = [
        1 => 'يناير', 2 => 'فبراير', 3 => 'مارس', 4 => 'أبريل',
        5 => 'مايو', 6 => 'يونيو', 7 => 'يوليو', 8 => 'أغسطس',
        9 => 'سبتمبر', 10 => 'أكتوبر', 11 => 'نوفمبر', 12 => 'ديسمبر',
    ];

    private function __construct(
        /** مفتاح الفترة: `YYYY-MM` للشهرية، `dNN@YYYY-MM-DD` للنافذة المتحركة. */
        public readonly string $key,
        /** لحظة البداية بـ UTC (شاملة). */
        public readonly Carbon $start,
        /** لحظة النهاية بـ UTC (شاملة). */
        public readonly Carbon $end,
        public readonly string $label,
        public readonly bool $isMonth,
    ) {}

    /**
     * شهر ميلادي كامل بتوقيت الرياض.
     */
    public static function month(int $year, int $month): self
    {
        if ($month < 1 || $month > 12) {
            throw new InvalidArgumentException("شهر غير صالح: {$month}");
        }

        $localStart = Carbon::create($year, $month, 1, 0, 0, 0, self::TIMEZONE);

        return new self(
            key: sprintf('%04d-%02d', $year, $month),
            start: $localStart->copy()->utc(),
            end: $localStart->copy()->endOfMonth()->utc(),
            label: self::MONTH_NAMES[$month].' '.$year,
            isMonth: true,
        );
    }

    /**
     * الفترة من مفتاح `YYYY-MM`.
     */
    public static function fromKey(string $key): self
    {
        if (preg_match('/^(\d{4})-(\d{2})$/', $key, $matches) !== 1) {
            throw new InvalidArgumentException("مفتاح فترة غير صالح: {$key}");
        }

        return self::month((int) $matches[1], (int) $matches[2]);
    }

    /**
     * الشهر الذي تقع فيه اللحظة المعطاة (أو الآن) — بتوقيت الرياض.
     */
    public static function monthOf(?DateTimeInterface $at = null): self
    {
        $local = Carbon::parse($at ?? Carbon::now())->timezone(self::TIMEZONE);

        return self::month((int) $local->year, (int) $local->month);
    }

    /**
     * الفترة الافتراضية للمؤشرات: **الشهر الجاري** (H §15).
     */
    public static function currentMonth(?DateTimeInterface $now = null): self
    {
        return self::monthOf($now);
    }

    /**
     * نافذة متحركة بعدد أيام تنتهي عند اللحظة المعطاة — أساس «المجتمعات
     * النشطة» (≥ فعالية مكتملة واحدة خلال 30 يوماً).
     */
    public static function trailingDays(int $days, ?DateTimeInterface $endingAt = null): self
    {
        if ($days < 1) {
            throw new InvalidArgumentException('عدد الأيام يجب أن يكون 1 على الأقل.');
        }

        $end = Carbon::parse($endingAt ?? Carbon::now())->utc();

        return new self(
            key: 'd'.$days.'@'.$end->copy()->timezone(self::TIMEZONE)->format('Y-m-d'),
            start: $end->copy()->subDays($days),
            end: $end,
            label: "آخر {$days} يوماً",
            isMonth: false,
        );
    }

    /**
     * الشهر السابق — أساس المقارنة الشهرية في تقرير المنسّق.
     */
    public function previous(): self
    {
        if (! $this->isMonth) {
            return self::trailingDays(
                (int) $this->start->diffInDays($this->end),
                $this->start,
            );
        }

        $local = $this->start->copy()->timezone(self::TIMEZONE)->subMonthNoOverflow();

        return self::month((int) $local->year, (int) $local->month);
    }

    /**
     * @return array{key: string, label: string, start: string, end: string}
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'start' => $this->start->toIso8601String(),
            'end' => $this->end->toIso8601String(),
        ];
    }
}
