<?php

namespace App\Observers;

use App\Models\Event;
use App\Services\Provider\ProviderRequestService;

/**
 * A9 — جسر قناة قرار المزوّد: حين تدخل الفعالية حالة انتظار المزوّد
 * (waiting_partner اليوم؛ pending_provider لدى اكتمال آلة حالات A7) يُنشأ
 * طلب مزوّد بكمية محددة نهائياً ويُرسل الإشعار بالرابط الموقّع (H §11).
 *
 * observer مقصود حتى لا نلمس منطق حالات الفعالية نفسه — ملك A7.
 */
class EventObserver
{
    /**
     * الحالات التي تعني «الفعالية تحتاج قرار مزوّد الآن».
     */
    private const AWAITING_PROVIDER_STATUSES = ['waiting_partner', 'pending_provider'];

    public function updated(Event $event): void
    {
        if (! $event->wasChanged('status')) {
            return;
        }

        if (! in_array($event->status, self::AWAITING_PROVIDER_STATUSES, true)) {
            return;
        }

        app(ProviderRequestService::class)->createForEvent($event);
    }

    public function created(Event $event): void
    {
        if (in_array($event->status, self::AWAITING_PROVIDER_STATUSES, true)) {
            app(ProviderRequestService::class)->createForEvent($event);
        }
    }
}
