<?php

namespace App\Services\Notifications;

use App\Models\AdminAlert;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * قناة التنبيه الحرجة لأدمن تيمات (H §20 — المراقبة).
 *
 * المواضع المطلوبة نصاً: فشل ويبهوك دفع · فشل مهمة مجدولة حرجة · رصيد محفظة
 * سالب · فشل استرداد · فشل تسليم رسالة بعد كل القنوات.
 *
 * ما يملكه الكود هو **صندوق تنبيهات داخل المنصة** يقرأه الأدمن، مع بقاء
 * `Log::critical` كما هو ليلتقطه Sentry/السجل المركزي. التنبيه الفعلي
 * (بريد/Slack/paging) بنية تحتية يملكها المالك.
 */
class CriticalAlertService
{
    /** نافذة تجميع التنبيه نفسه بدل إغراق الصندوق. */
    public const DEDUPE_MINUTES = 60;

    /**
     * @param  array<string, mixed>  $context
     * @param  bool  $alwaysLog  سجِّل عند كل نداء لا عند أول ظهور فقط — لتنبيه
     *                           يُقصد به أن «يصرخ» حتى يُعالج (الرصيد السالب
     *                           في فحص الساعة، H §12.5). الصندوق يبقى مجمَّعاً
     *                           في الحالتين حتى لا يغرق الأدمن بصفوف مكررة.
     */
    public function raise(
        string $key,
        string $title,
        ?string $body = null,
        array $context = [],
        string $level = AdminAlert::LEVEL_CRITICAL,
        bool $alwaysLog = false,
    ): AdminAlert {
        $fingerprint = $this->fingerprint($key, $context);

        $existing = AdminAlert::query()
            ->where('fingerprint', $fingerprint)
            ->whereNull('acknowledged_at')
            ->where('last_seen_at', '>=', now()->subMinutes(self::DEDUPE_MINUTES))
            ->first();

        if ($existing !== null) {
            if ($alwaysLog) {
                Log::critical($title, ['alert_key' => $key] + $context);
            }

            $existing->forceFill([
                'occurrences' => $existing->occurrences + 1,
                'last_seen_at' => now(),
                'context' => $context !== [] ? $context : $existing->context,
            ])->save();

            return $existing;
        }

        Log::critical($title, ['alert_key' => $key] + $context);

        return AdminAlert::query()->create([
            'key' => $key,
            'level' => $level,
            'title' => Str::limit($title, 250, ''),
            'body' => $body,
            'context' => $context,
            'fingerprint' => $fingerprint,
            'occurrences' => 1,
            'last_seen_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public function warn(string $key, string $title, ?string $body = null, array $context = []): AdminAlert
    {
        return $this->raise($key, $title, $body, $context, AdminAlert::LEVEL_WARNING);
    }

    /**
     * حقول سياق عالية التغيّر لا تدخل البصمة: لو دخلت لصار كل تكرار صفاً
     * جديداً وأغرق الصندوق. `notification_log_id` تحديداً فريد لكل محاولة.
     */
    private const VOLATILE_KEYS = ['notification_log_id'];

    /**
     * بصمة التجميع = المفتاح + **حقول الهوية** في السياق (كل ما ينتهي بـ
     * `_id` عدا المتغيّرة، بالإضافة إلى اسم المهمة).
     *
     * قاعدة عامة لا قائمة بيضاء: أي brief يضيف تنبيهاً بمعرّف كيان جديد يجمَّع
     * تلقائياً بالصورة الصحيحة — تنبيهان لكيانين مختلفين لا يندمجان، وتنبيهان
     * لنفس الكيان لا يتكرران.
     *
     * @param  array<string, mixed>  $context
     */
    private function fingerprint(string $key, array $context): string
    {
        $identity = [];

        foreach ($context as $name => $value) {
            if (! is_scalar($value) || in_array($name, self::VOLATILE_KEYS, true)) {
                continue;
            }

            if (str_ends_with((string) $name, '_id') || $name === 'job') {
                $identity[$name] = $value;
            }
        }

        ksort($identity);

        return sha1($key.'|'.json_encode($identity));
    }
}
