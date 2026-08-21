<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Services\Events\EventStateMachine;
use App\Services\Events\IllegalEventTransition;
use App\Services\Events\ParticipationService;
use App\Services\Provider\ProviderRequestService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Throwable;

class ExpireProviderDeadlines extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:expire-provider-deadlines';

    protected $description = 'انتهاء مهلة رد المزوّد ومهلة رد المنشئ ومهلة قائمة الانتظار (H §20 — كل 5 دقائق)';

    // A9 (منفَّذ): مهلة رد المزوّد — 12 ساعة أو حتى 6 ساعات قبل الموعد أيهما
    //   أقرب. طلب pending تجاوز مهلته → expired + أثر −3 على مؤشر الموثوقية
    //   + إشعار الشركة والمنشئ والمزوّد. idempotency عبر JobRun::runOnce.
    // A7 (منفَّذ): تصعيد حالة الفعالية — pending_provider بلا رد بعد المهلة
    //   ← cancelled_provider، و provider_alternative بلا رد منشئ خلال 12 ساعة
    //   ← cancelled_provider، ومهل عروض قائمة الانتظار (120/30/فوري — H §10).
    public function handle(ProviderRequestService $requests, EventStateMachine $machine, ParticipationService $participation): int
    {
        $this->recordHeartbeat();

        $expired = $requests->expireOverdue();

        $cancelledPending = $this->cancelUnansweredProviderEvents($machine);
        $cancelledAlternatives = $this->cancelUnansweredAlternatives($machine);
        $lapsedOffers = $participation->expireLapsedOffers();

        $this->info("أُسقطت {$expired} من طلبات المزوّدين منتهية المهلة · أُلغيت {$cancelledPending} فعالية بلا رد مزوّد · {$cancelledAlternatives} بلا رد منشئ · انقضت {$lapsedOffers} من عروض قائمة الانتظار.");

        return self::SUCCESS;
    }

    /**
     * H §9: pending_provider بلا قرار بعد المهلة (12 ساعة أو 6 ساعات قبل
     * الموعد أيهما أقرب) ← cancelled_provider. طلب A9 ما زال pending = المهلة
     * عنده لم تنقضِ — نتركه له.
     */
    private function cancelUnansweredProviderEvents(EventStateMachine $machine): int
    {
        $cancelled = 0;

        $events = Event::where('status', 'pending_provider')->get();

        foreach ($events as $event) {
            try {
                $hasPendingRequest = EventProviderRequest::query()
                    ->where('event_id', $event->id)
                    ->pending()
                    ->exists();

                if ($hasPendingRequest) {
                    continue;
                }

                $hasDecidedRequest = EventProviderRequest::query()
                    ->where('event_id', $event->id)
                    ->whereIn('status', [EventProviderRequest::STATUS_ACCEPTED, EventProviderRequest::STATUS_ALTERNATIVE])
                    ->exists();

                if ($hasDecidedRequest) {
                    // قرار قائم لم ينعكس بعد على الحالة — ليس شأن هذه المهمة.
                    continue;
                }

                $deadline = $this->providerDeadlineFor($event);

                if ($deadline === null || now()->lte($deadline)) {
                    continue;
                }

                $machine->providerRejected($event, null, 'انتهت مهلة رد المزوّد دون قرار (12 ساعة أو 6 ساعات قبل الموعد) — أُلغيت الفعالية');
                $cancelled++;
            } catch (IllegalEventTransition) {
                // سباق مع انتقال آخر — تجاهل.
            } catch (Throwable $e) {
                Log::error("فشل تصعيد مهلة المزوّد للفعالية #{$event->id}.", ['exception' => $e->getMessage()]);
            }
        }

        return $cancelled;
    }

    /**
     * H §9: provider_alternative بلا رد من المنشئ خلال 12 ساعة ← cancelled_provider.
     */
    private function cancelUnansweredAlternatives(EventStateMachine $machine): int
    {
        $cancelled = 0;
        $hours = (int) config('events.alternative_response_hours', 12);

        $events = Event::where('status', 'provider_alternative')->get();

        foreach ($events as $event) {
            try {
                $enteredAt = $this->enteredCurrentStateAt($event);

                if ($enteredAt === null || now()->lte($enteredAt->copy()->addHours($hours))) {
                    continue;
                }

                $machine->creatorRejectedAlternative($event, null, "انتهت مهلة رد منشئ الفعالية على الوقت البديل ({$hours} ساعة) — أُلغيت");
                $cancelled++;
            } catch (IllegalEventTransition) {
                // سباق — تجاهل.
            } catch (Throwable $e) {
                Log::error("فشل تصعيد مهلة البديل للفعالية #{$event->id}.", ['exception' => $e->getMessage()]);
            }
        }

        return $cancelled;
    }

    /**
     * مهلة رد المزوّد للفعالية: entered_at + 12 ساعة أو starts_at − 6 ساعات
     * أيهما أقرب (H §9).
     */
    private function providerDeadlineFor(Event $event): ?Carbon
    {
        $enteredAt = $this->enteredCurrentStateAt($event);

        if ($enteredAt === null) {
            return null;
        }

        $deadline = $enteredAt->copy()->addHours((int) config('events.provider_response_hours', 12));

        $latestAllowed = $event->startsAt()->subHours((int) config('events.provider_response_min_hours_before_start', 6));

        return $deadline->min($latestAllowed);
    }

    private function enteredCurrentStateAt(Event $event): ?Carbon
    {
        $at = $event->statusHistory()
            ->where('to_status', (string) $event->status)
            ->max('created_at');

        return $at !== null ? Carbon::parse($at) : null;
    }
}
