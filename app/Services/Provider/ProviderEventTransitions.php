<?php

namespace App\Services\Provider;

use App\Models\Company;
use App\Models\Event;
use App\Models\EventAlternative;
use App\Models\Partner;
use App\Services\ActivityLogService;
use App\Services\Events\EventStateMachine;
use App\Services\Partner\BookingService;
use App\Services\Payments\EventRefundService;
use App\Support\Notify;
use Illuminate\Support\Facades\DB;

/**
 * جسر رقيق بين قناة قرار المزوّد (A9) وآلة حالات الفعالية (A7).
 *
 * حدود A7: قناة القرار تستدعي الانتقالات المسماة providerAccepted /
 * providerRejected / providerProposedAlternative / providerCancelled ولا
 * تكتب حالة الفعالية مباشرة. القبول/الرفض/البديل تمر عبر BookingService
 * (الذي يستدعي الانتقال المسمى داخلياً ويتولى إشعاراته)؛ الإلغاء بعد
 * القبول يستدعي الانتقال المسمى على آلة الحالات مباشرة لعدم وجود غلاف له.
 */
class ProviderEventTransitions
{
    public function __construct(
        private BookingService $bookings,
        private EventStateMachine $stateMachine,
    ) {}

    public function providerAccepted(Partner $provider, Event $event): Event
    {
        return $this->bookings->approve($provider, $event);
    }

    public function providerRejected(Partner $provider, Event $event, string $reason): Event
    {
        return $this->bookings->reject($provider, $event, $reason);
    }

    /**
     * @param  array{proposed_date: string, proposed_start_time: string, proposed_venues_count?: int|null, proposed_amount?: float|null, notes?: string|null}  $data
     */
    public function providerProposedAlternative(Partner $provider, Event $event, array $data): EventAlternative
    {
        return $this->bookings->proposeAlternative($provider, $event, $data);
    }

    /**
     * إلغاء المزوّد بعد القبول → cancelled_provider (انتقال A7 المسمى) مع
     * **استرداد كامل** بمصفوفة A10 (H §12.4): فك حجوزات الدعم، عكس أي
     * استقطاع (بما فيه مفتاح budget-capture القديم للمرحَّل)، ورد كل حصة
     * مدفوعة إلى وسيلة الدفع الأصلية عبر البوابة — لا نسب متدرجة أبداً.
     */
    public function providerCancelled(Partner $provider, Event $event, string $reason): Event
    {
        return DB::transaction(function () use ($provider, $event, $reason) {
            $this->stateMachine->providerCancelled($event, $provider, $reason);

            app(EventRefundService::class)->refundEventCollections(
                $event,
                'إلغاء المزوّد بعد القبول — استرداد كامل',
            );

            ActivityLogService::log(
                $event->company_id,
                $event,
                'event_cancelled_by_provider',
                "ألغى المزوّد الفعالية #{$event->id} بعد قبولها",
                ['reason' => $reason],
            );

            Notify::sendToId(
                'provider.cancelled.company',
                Company::class,
                (int) $event->company_id,
                ['event_id' => $event->id, 'reason' => $reason],
                ['data' => ['event_id' => $event->id]],
            );

            return $event->refresh();
        });
    }
}
