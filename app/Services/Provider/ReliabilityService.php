<?php

namespace App\Services\Provider;

use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Partner;
use App\Models\ProviderReliabilityLog;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * مؤشر موثوقية المزوّد (H §11): من 0 إلى 100 يبدأ من 80، ويُحدَّث بعد كل طلب.
 * +2 قبول خلال المهلة · −3 رد متأخر · −1 رفض · −15 إلغاء بعد القبول ·
 * +3 فعالية اكتملت بلا مشاكل. لا يُعرض قبل 10 عينات، ولا يُعرض الرقم للمزوّد
 * في الإصدار الأول — تُعرض سلوكياته فقط. التعديل اليدوي لأدمن تيمات وحده
 * بسبب موثَّق.
 */
class ReliabilityService
{
    /** @var array<string, int> */
    public const DELTAS = [
        ProviderReliabilityLog::REASON_ACCEPT_WITHIN_DEADLINE => 2,
        ProviderReliabilityLog::REASON_LATE_RESPONSE => -3,
        ProviderReliabilityLog::REASON_REJECT => -1,
        ProviderReliabilityLog::REASON_CANCEL_AFTER_ACCEPT => -15,
        ProviderReliabilityLog::REASON_STALE_AVAILABILITY => -15,
        ProviderReliabilityLog::REASON_COMPLETED_CLEAN => 3,
    ];

    /**
     * تطبيق تغيّر ناتج عن حدث طلب/فعالية. يقفل صف المزوّد ويقصّ الناتج
     * إلى [0, 100] ويسجّل صفاً في provider_reliability_log.
     */
    public function apply(
        Partner $provider,
        string $reason,
        ?EventProviderRequest $request = null,
        ?Event $event = null,
        ?string $note = null,
    ): ProviderReliabilityLog {
        $delta = self::DELTAS[$reason] ?? null;

        if ($delta === null) {
            throw new \InvalidArgumentException("Unknown reliability reason [{$reason}].");
        }

        return $this->record($provider, $delta, $reason, $request, $event, $note, countsAsSample: true);
    }

    /**
     * تعديل يدوي — أدمن تيمات وحده، بسبب موثَّق إلزامي، مسجَّل في سجل التدقيق.
     * لا يُحتسب عينة.
     */
    public function adjustManually(Partner $provider, int $delta, string $reason, int $actorUserId): ProviderReliabilityLog
    {
        if (trim($reason) === '') {
            throw ValidationException::withMessages([
                'reason' => ['سبب التعديل اليدوي إلزامي — لا تعديل بلا توثيق.'],
            ]);
        }

        $log = $this->record(
            $provider,
            $delta,
            ProviderReliabilityLog::REASON_MANUAL,
            note: $reason,
            actorUserId: $actorUserId,
            countsAsSample: false,
        );

        ActivityLogService::log(
            null,
            $provider,
            'provider_reliability_adjusted',
            "تعديل يدوي لمؤشر موثوقية المزوّد #{$provider->id}: {$log->score_before} ← {$log->score_after}",
            ['delta' => $delta, 'reason' => $reason],
        );

        return $log;
    }

    /**
     * سلوكيات المزوّد المعروضة له في الإصدار الأول (بدل الرقم): معدل القبول
     * ومتوسط زمن الرد.
     *
     * @return array{acceptance_rate: float|null, avg_response_minutes: int|null, total_requests: int, accepted: int, rejected: int, expired: int}
     */
    public function behaviors(Partner $provider): array
    {
        $requests = EventProviderRequest::query()
            ->where('partner_id', $provider->id)
            ->whereIn('status', [
                EventProviderRequest::STATUS_ACCEPTED,
                EventProviderRequest::STATUS_REJECTED,
                EventProviderRequest::STATUS_ALTERNATIVE,
                EventProviderRequest::STATUS_EXPIRED,
                EventProviderRequest::STATUS_CANCELLED,
            ])
            ->get(['id', 'status', 'sent_at', 'responded_at']);

        $total = $requests->count();
        $accepted = $requests->whereIn('status', [
            EventProviderRequest::STATUS_ACCEPTED,
            EventProviderRequest::STATUS_CANCELLED, // كان قبولاً ثم أُلغي
        ])->count();
        $rejected = $requests->where('status', EventProviderRequest::STATUS_REJECTED)->count();
        $expired = $requests->where('status', EventProviderRequest::STATUS_EXPIRED)->count();

        $responded = $requests->filter(fn ($r) => $r->responded_at !== null);
        $avgMinutes = $responded->isEmpty()
            ? null
            : (int) round($responded->avg(fn ($r) => $r->sent_at->diffInMinutes($r->responded_at)));

        return [
            'acceptance_rate' => $total > 0 ? round($accepted / $total * 100, 1) : null,
            'avg_response_minutes' => $avgMinutes,
            'total_requests' => $total,
            'accepted' => $accepted,
            'rejected' => $rejected,
            'expired' => $expired,
        ];
    }

    private function record(
        Partner $provider,
        int $delta,
        string $reason,
        ?EventProviderRequest $request = null,
        ?Event $event = null,
        ?string $note = null,
        ?int $actorUserId = null,
        bool $countsAsSample = true,
    ): ProviderReliabilityLog {
        return DB::transaction(function () use ($provider, $delta, $reason, $request, $event, $note, $actorUserId, $countsAsSample) {
            /** @var Partner $locked */
            $locked = Partner::query()->whereKey($provider->id)->lockForUpdate()->firstOrFail();

            $before = (int) $locked->reliability_score;
            $after = max(0, min(100, $before + $delta));

            $locked->reliability_score = $after;
            if ($countsAsSample) {
                $locked->reliability_samples = $locked->reliability_samples + 1;
            }
            $locked->save();

            $provider->reliability_score = $after;
            $provider->reliability_samples = $locked->reliability_samples;

            return ProviderReliabilityLog::create([
                'partner_id' => $locked->id,
                'event_provider_request_id' => $request?->id,
                'event_id' => $event?->id ?? $request?->event_id,
                'delta' => $delta,
                'score_before' => $before,
                'score_after' => $after,
                'reason' => $reason,
                'note' => $note,
                'actor_user_id' => $actorUserId,
                'counts_as_sample' => $countsAsSample,
            ]);
        });
    }
}
