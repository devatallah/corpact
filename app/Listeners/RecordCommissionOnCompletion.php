<?php

namespace App\Listeners;

use App\Events\EventCompleted;
use App\Models\Event;
use App\Models\JobRun;
use App\Services\Billing\CommissionService;

/**
 * A11 — «قيد العمولة يُنشأ عند انتقال الفعالية إلى `completed` حصراً — لا
 * قبله بأي حال» (H §12.7)، وبند التسوية معه في نفس اللحظة.
 *
 * الاشتراك على {@see EventCompleted} وحده هو ما يضمن القاعدة: لا مسار آخر في
 * النظام ينشئ عمولة، ولا فعالية ملغاة أو مؤكدة أو جارية تنتج قيداً.
 *
 * idempotent بطبقتين: `JobRun::runOnce` هنا، ومفتاح تفرّد على البند وعلى كل
 * قيد دفتر — فإعادة إطلاق الحدث أو إعادة تشغيل المهمة لا تضاعف شيئاً.
 */
class RecordCommissionOnCompletion
{
    public function __construct(private CommissionService $commission) {}

    public function handle(EventCompleted $event): void
    {
        $model = Event::find($event->eventId);

        if ($model === null || $model->status !== 'completed' || $model->partner_id === null) {
            return;
        }

        JobRun::runOnce(
            job: 'settlement:commission-on-completion',
            entityType: 'event',
            entityId: $model->id,
            period: 'once',
            callback: fn () => $this->commission->recordForCompletedEvent($model),
        );
    }
}
