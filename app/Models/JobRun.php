<?php

namespace App\Models;

use App\Services\Notifications\CriticalAlertService;
use Closure;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * سجل تشغيل المهام المجدولة (H §20).
 *
 * صفّان مختلفان في هذا الجدول:
 * - مفتاح idempotency لكيان محدد: (job + entity_type + entity_id + period) —
 *   تشغيل نفس المفتاح مرتين لا ينتج أثراً مزدوجاً.
 * - نبضة (heartbeat) بلا كيان (entity_type = null) — تسجلها كل مهمة مجدولة عند
 *   كل تشغيل، ويقرأها الـ watchdog: الصمت ليس دليل نجاح.
 */
#[Fillable([
    'job',
    'entity_type',
    'entity_id',
    'period',
    'status',
    'attempts',
    'started_at',
    'finished_at',
    'error',
])]
class JobRun extends Model
{
    /**
     * H §20: إعادة المحاولة 3 مرات بتباعد أسي ثم قائمة فشل مرئية مع تنبيه.
     */
    public const MAX_ATTEMPTS = 3;

    /**
     * تشغيل أقدم من هذه المدة وما زال running يُعتبر متعطلاً ويُعاد الاستيلاء عليه.
     */
    public const STALE_RUNNING_MINUTES = 30;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'entity_id' => 'integer',
            'attempts' => 'integer',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    /**
     * تنفيذ عمل مرة واحدة فقط لمفتاح (المهمة + الكيان + الفترة).
     *
     * يعيد true إذا نُفِّذ العمل فعلاً، وfalse إذا تُخُطِّي (سبق اكتماله، أو تشغيل
     * متزامن يحمل المفتاح، أو فشل ينتظر تباعده الأسي، أو استُنفدت محاولاته).
     * الاستثناءات تُسجَّل على السجل ثم تُعاد إثارتها ليتعامل معها المستدعي.
     */
    public static function runOnce(string $job, string $entityType, int $entityId, string $period, Closure $callback): bool
    {
        $key = [
            'job' => $job,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'period' => $period,
        ];

        $run = static::query()->where($key)->first();

        if ($run !== null && ! $run->isRetryable()) {
            return false;
        }

        if ($run === null) {
            try {
                $run = static::create([
                    ...$key,
                    'status' => 'running',
                    'attempts' => 1,
                    'started_at' => now(),
                ]);
            } catch (UniqueConstraintViolationException) {
                // تشغيل متزامن سبقنا إلى المفتاح.
                return false;
            }
        } else {
            // استيلاء متفائل: لا ننجح إلا إذا لم يسبقنا تشغيل متزامن.
            $claimed = static::query()
                ->whereKey($run->id)
                ->where('status', $run->status)
                ->where('attempts', $run->attempts)
                ->update([
                    'status' => 'running',
                    'attempts' => $run->attempts + 1,
                    'started_at' => now(),
                    'finished_at' => null,
                ]);

            if ($claimed === 0) {
                return false;
            }

            $run->refresh();
        }

        try {
            $callback();

            $run->update(['status' => 'completed', 'finished_at' => now(), 'error' => null]);

            return true;
        } catch (Throwable $e) {
            $run->update([
                'status' => 'failed',
                'finished_at' => now(),
                'error' => Str::limit($e->getMessage(), 1000),
            ]);

            if ($run->attempts >= self::MAX_ATTEMPTS) {
                // A14 — H §20: التنبيه لا يبقى في السجل وحده؛ يدخل صندوق
                // أدمن تيمات (CriticalAlertService يكتب Log::critical أيضاً).
                app(CriticalAlertService::class)->raise(
                    key: 'jobs.exhausted',
                    title: "المهمة [{$job}] استنفدت محاولاتها",
                    body: "الكيان {$entityType}#{$entityId} عن الفترة {$period} — {$e->getMessage()}",
                    context: [
                        'job' => $job,
                        'entity_type' => $entityType,
                        'entity_id' => $entityId,
                        'period' => $period,
                        'attempts' => $run->attempts,
                        'error' => $e->getMessage(),
                    ],
                );
            }

            throw $e;
        }
    }

    /**
     * هل يجوز إعادة محاولة هذا التشغيل الآن؟
     */
    public function isRetryable(): bool
    {
        if ($this->status === 'completed') {
            return false;
        }

        if ($this->status === 'running') {
            // متزامن ما زال يعمل — إلا إذا تعطل منذ مدة طويلة.
            return $this->started_at !== null
                && $this->started_at->lt(now()->subMinutes(self::STALE_RUNNING_MINUTES));
        }

        // failed: تباعد أسي — 5 ثم 10 ثم 20 دقيقة، وبعد استنفاد المحاولات لا إعادة.
        if ($this->attempts >= self::MAX_ATTEMPTS) {
            return false;
        }

        $backoffMinutes = 5 * (2 ** max(0, $this->attempts - 1));

        return $this->finished_at === null
            || $this->finished_at->lte(now()->subMinutes($backoffMinutes));
    }

    /**
     * تسجيل نبضة تشغيل لمهمة مجدولة — يقرأها الـ watchdog.
     */
    public static function heartbeat(string $job): void
    {
        static::create([
            'job' => $job,
            'entity_type' => null,
            'entity_id' => null,
            'period' => now()->format('Y-m-d H:i:s.u'),
            'status' => 'completed',
            'attempts' => 1,
            'started_at' => now(),
            'finished_at' => now(),
        ]);
    }

    /**
     * وقت آخر نبضة مسجلة لمهمة مجدولة.
     */
    public static function lastHeartbeatAt(string $job): ?Carbon
    {
        $latest = static::query()
            ->where('job', $job)
            ->whereNull('entity_type')
            ->max('started_at');

        return $latest !== null ? Carbon::parse($latest) : null;
    }
}
