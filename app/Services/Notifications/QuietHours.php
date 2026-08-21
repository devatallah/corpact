<?php

namespace App\Services\Notifications;

use Illuminate\Support\Carbon;

/**
 * سياسة عدم الإزعاج (H §14): من 22:00 إلى 08:00 بتوقيت الرياض تُؤجَّل الرسائل
 * غير الإلزامية — **ورموز الدخول والإشعارات الإلزامية مستثناة دائماً**.
 *
 * التأجيل يخص الرسائل الصادرة فقط (واتساب/SMS). الإشعار داخل المنصة يُكتب فوراً
 * لأنه قناة سحب لا تُوقظ أحداً؛ ما يُؤجَّل هو ما يرن على الجوال.
 */
class QuietHours
{
    public function enabled(): bool
    {
        return (bool) config('messaging.quiet_hours.enabled', true);
    }

    public function timezone(): string
    {
        return (string) config('messaging.quiet_hours.timezone', 'Asia/Riyadh');
    }

    /** هل اللحظة داخل نافذة الهدوء؟ */
    public function isQuietAt(?Carbon $at = null): bool
    {
        if (! $this->enabled()) {
            return false;
        }

        $local = ($at ?? now())->copy()->setTimezone($this->timezone());

        $start = $this->minutes((string) config('messaging.quiet_hours.start', '22:00'));
        $end = $this->minutes((string) config('messaging.quiet_hours.end', '08:00'));
        $now = $local->hour * 60 + $local->minute;

        // النافذة تعبر منتصف الليل (22:00 → 08:00).
        return $start > $end
            ? ($now >= $start || $now < $end)
            : ($now >= $start && $now < $end);
    }

    /**
     * وقت انتهاء نافذة الهدوء التالي (08:00 بتوقيت الرياض) بتوقيت التطبيق.
     */
    public function nextWindowEnd(?Carbon $at = null): Carbon
    {
        $local = ($at ?? now())->copy()->setTimezone($this->timezone());
        [$hour, $minute] = array_map('intval', explode(':', (string) config('messaging.quiet_hours.end', '08:00')));

        $end = $local->copy()->setTime($hour, $minute, 0);

        if ($end->lte($local)) {
            $end->addDay();
        }

        return $end->setTimezone(config('app.timezone'));
    }

    /**
     * وقت الإرسال الفعلي لرسالة: الآن إن كانت إلزامية أو خارج النافذة،
     * وإلا فجر اليوم التالي عند 08:00.
     */
    public function releaseAt(bool $mandatory, ?Carbon $at = null): ?Carbon
    {
        if ($mandatory || ! $this->isQuietAt($at)) {
            return null;
        }

        return $this->nextWindowEnd($at);
    }

    private function minutes(string $time): int
    {
        [$hour, $minute] = array_pad(array_map('intval', explode(':', $time)), 2, 0);

        return $hour * 60 + $minute;
    }
}
