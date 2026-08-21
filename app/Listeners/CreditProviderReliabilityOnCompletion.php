<?php

namespace App\Listeners;

use App\Events\EventCompleted;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\JobRun;
use App\Models\ProviderReliabilityLog;
use App\Services\Provider\ReliabilityService;

/**
 * A9 — «فعالية اكتملت بلا مشاكل: +3» (H §11). «بلا مشاكل» في الإصدار الأول:
 * الفعالية اكتملت وطلب المزوّد ما زال مقبولاً (لم يُلغَ ولم يتعارض).
 * idempotent عبر JobRun::runOnce — إعادة إطلاق الحدث لا تضاعف الأثر.
 */
class CreditProviderReliabilityOnCompletion
{
    public function __construct(private ReliabilityService $reliability) {}

    public function handle(EventCompleted $event): void
    {
        $model = Event::find($event->eventId);

        if ($model === null || $model->status !== 'completed') {
            return;
        }

        $request = EventProviderRequest::query()
            ->where('event_id', $model->id)
            ->where('status', EventProviderRequest::STATUS_ACCEPTED)
            ->first();

        if ($request === null) {
            return;
        }

        JobRun::runOnce(
            job: 'provider-reliability:completion-credit',
            entityType: 'event',
            entityId: $model->id,
            period: 'once',
            callback: function () use ($model, $request): void {
                $this->reliability->apply(
                    $request->partner,
                    ProviderReliabilityLog::REASON_COMPLETED_CLEAN,
                    request: $request,
                    event: $model,
                );
            },
        );
    }
}
