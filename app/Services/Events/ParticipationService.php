<?php

namespace App\Services\Events;

use App\Enums\EventStatus;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\ParticipantEvent;
use App\Models\Partner;
use App\Services\Payments\CollectionService;
use App\Services\Payments\FundingService;
use App\Support\Notify;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * الانضمام والانسحاب وقائمة الانتظار (H §10).
 *
 * القواعد الملزمة المطبقة هنا:
 * - الانضمام لأعضاء المجتمع فقط، يحجز المقعد فوراً reserved و payment_status
 *   يبقى not_due — **لا تحصيل عند الانضمام إطلاقاً** (التحصيل بعد الإغلاق — A10).
 * - حجز المقعد وقراءة العدد عملية ذرية واحدة داخل معاملة بقفل صف الفعالية
 *   (lockForUpdate) — القراءة ثم الكتابة في خطوتين ممنوعة.
 * - قائمة الانتظار FIFO صارمة؛ عند شغور مقعد يُعرض على الأول بمهلة
 *   120 دقيقة ← 30 دقيقة (أقل من 6 ساعات على الإغلاق) ← فورية «الأسبق يفوز»
 *   (أقل من ساعة). المهلة إعداد منصة فقط (config/events.php).
 * - الانسحاب حر قبل إغلاق التسجيل (أو داخل نافذة الـ 6 ساعات بعد قبول بديل)؛
 *   بعده لا انسحاب ذاتي. **الانسحاب لا يحذف الصف أبداً** — حالة + سجل.
 * - كل تغيير حقل مشارك سطر في participant_events (الفاعل والوقت والسبب).
 */
class ParticipationService
{
    public function __construct(private EventStateMachine $machine) {}

    /**
     * انضمام ذري: reserved إن وُجد مقعد، وإلا waitlisted بترتيب زمني صارم.
     *
     * @return string 'reserved' أو 'waitlisted'
     */
    public function join(Event $event, Employee $employee, ?Model $actor = null): string
    {
        $actor ??= $employee;

        return DB::transaction(function () use ($event, $employee, $actor) {
            $locked = $this->lock($event);

            if (! in_array((string) $locked->status, EventStatus::joinableValues(), true)) {
                throw new RuntimeException('لا يمكن الانضمام لهذه الفعالية في حالتها الحالية.');
            }

            if (! $locked->isRegistrationOpen()) {
                throw new RuntimeException('أُغلق التسجيل لهذه الفعالية.');
            }

            $this->ensureCommunityMember($locked, $employee);

            $row = $this->rowFor($locked, $employee);

            if ($row !== null && $row->seat_status === 'reserved') {
                throw new RuntimeException('أنت منضم بالفعل.');
            }

            if ($row !== null && $row->seat_status === 'waitlisted') {
                throw new RuntimeException('أنت مسجل في قائمة الانتظار بالفعل.');
            }

            $reserved = $this->reservedCount($locked);

            if ($reserved < (int) $locked->capacity) {
                $this->writeSeat($locked, $employee, $row, 'reserved', $actor, 'انضمام — حجز مقعد فوري', [
                    'joined_at' => now(),
                    'position' => null,
                    'offered_at' => null,
                    'offer_expires_at' => null,
                ]);

                $this->syncCounters($locked, $reserved + 1);

                // بلوغ الحد الأدنى وهي open → إرسال الطلب الملزم للمزوّد (H §9).
                if ((string) $locked->status === EventStatus::Open->value
                    && ($reserved + 1) >= (int) $locked->min_participants) {
                    $this->machine->minimumReached($locked, $actor);
                    $this->notifyPartnerOfRequest($locked);

                    // تنبيه استباقي إلزامي (A10 — H §12.3): رصيد لا يغطي الدعم
                    // المتوقع يُنبَّه عليه القائد ومسؤول الحساب الآن لا عند التحصيل.
                    app(FundingService::class)->alertIfSubsidyUncovered($locked);
                }

                return 'reserved';
            }

            // ممتلئة — قائمة الانتظار (تفتح تلقائياً عند is_full في أي حالة).
            $position = (int) EventParticipant::where('event_id', $locked->id)
                ->where('seat_status', 'waitlisted')
                ->max('position') + 1;

            $this->writeSeat($locked, $employee, $row, 'waitlisted', $actor, 'انضمام لقائمة الانتظار', [
                'joined_at' => now(),
                'position' => $position,
                'offered_at' => null,
                'offer_expires_at' => null,
            ]);

            return 'waitlisted';
        });
    }

    /**
     * انسحاب ذاتي — حر قبل إغلاق التسجيل، ممنوع بعده (H §10).
     * لا يُحذف الصف أبداً؛ الحالة → cancelled ويُعرض المقعد على قائمة الانتظار.
     */
    public function withdraw(Event $event, Employee $employee, ?string $reason = null): void
    {
        DB::transaction(function () use ($event, $employee, $reason) {
            $locked = $this->lock($event);
            $row = $this->rowFor($locked, $employee);

            if ($row === null || $row->seat_status !== 'reserved') {
                throw new RuntimeException('أنت غير منضم لهذه الفعالية.');
            }

            if (! $this->withdrawalOpen($locked)) {
                throw new RuntimeException('أُغلق التسجيل — لا انسحاب بعد الإغلاق (H §10).');
            }

            $this->releaseReservedSeat($locked, $row, 'cancelled', $employee, $reason ?? 'انسحاب ذاتي قبل إغلاق التسجيل');
        });
    }

    /**
     * مغادرة قائمة الانتظار (قرار المشارك).
     */
    public function leaveWaitlist(Event $event, Employee $employee): void
    {
        DB::transaction(function () use ($event, $employee) {
            $locked = $this->lock($event);
            $row = $this->rowFor($locked, $employee);

            if ($row === null || $row->seat_status !== 'waitlisted') {
                throw new RuntimeException('أنت غير مسجل في قائمة الانتظار.');
            }

            $position = (int) $row->position;
            $hadOffer = $this->offerActive($row);

            $this->writeSeat($locked, $employee, $row, 'cancelled', $employee, 'مغادرة قائمة الانتظار', [
                'position' => null,
                'offered_at' => null,
                'offer_expires_at' => null,
            ]);

            $this->compactPositions($locked, $position);

            if ($hadOffer) {
                $this->offerSeatToNextInLine($locked);

                // مغادرة حامل عرض بديل بعد الإغلاق: يقيّم خط التحصيل (A10).
                if ((string) $locked->status === EventStatus::AwaitingPayment->value) {
                    app(CollectionService::class)->evaluate($locked);
                }
            }
        });
    }

    /**
     * إزالة مشارك بقرار المنشئ/الإدارة — الحالة → released (قرار نظام/إدارة
     * لا قرار المشارك)، والمقعد يُعرض على قائمة الانتظار.
     */
    public function remove(Event $event, Employee $target, ?Model $actor, ?string $reason = null): void
    {
        DB::transaction(function () use ($event, $target, $actor, $reason) {
            $locked = $this->lock($event);
            $row = $this->rowFor($locked, $target);

            if ($row === null || $row->seat_status !== 'reserved') {
                throw new RuntimeException('هذا المشارك غير منضم.');
            }

            $this->releaseReservedSeat($locked, $row, 'released', $actor, $reason ?? 'إزالة من الفعالية');
        });
    }

    /**
     * قبول عرض المقعد داخل المهلة → ترقية إلى reserved.
     */
    public function acceptOffer(Event $event, Employee $employee): void
    {
        DB::transaction(function () use ($event, $employee) {
            $locked = $this->lock($event);
            $row = $this->rowFor($locked, $employee);

            if ($row === null || $row->seat_status !== 'waitlisted' || ! $this->offerActive($row)) {
                throw new RuntimeException('لا يوجد عرض مقعد قائم أو انتهت مهلته.');
            }

            $reserved = $this->reservedCount($locked);

            if ($reserved >= (int) $locked->capacity) {
                throw new RuntimeException('لم يعد المقعد متاحاً.');
            }

            $this->promote($locked, $row, $reserved, 'قبول عرض المقعد داخل المهلة');
        });
    }

    /**
     * رفض عرض المقعد → خروج من القائمة (قرار المشارك) وعرض المقعد على التالي.
     */
    public function declineOffer(Event $event, Employee $employee): void
    {
        DB::transaction(function () use ($event, $employee) {
            $locked = $this->lock($event);
            $row = $this->rowFor($locked, $employee);

            if ($row === null || $row->seat_status !== 'waitlisted' || ! $this->offerActive($row)) {
                throw new RuntimeException('لا يوجد عرض مقعد قائم.');
            }

            $position = (int) $row->position;

            $this->writeSeat($locked, $employee, $row, 'cancelled', $employee, 'رفض عرض المقعد', [
                'position' => null,
                'offered_at' => null,
                'offer_expires_at' => null,
            ]);

            $this->compactPositions($locked, $position);
            $this->offerSeatToNextInLine($locked);

            // رفض عرض بديل بعد الإغلاق: يقيّم خط التحصيل ويعرض على التالي (A10).
            if ((string) $locked->status === EventStatus::AwaitingPayment->value) {
                app(CollectionService::class)->evaluate($locked);
            }
        });
    }

    /**
     * انقضاء مهل عروض المقاعد (تشغّلها المهمة المجدولة كل 5 دقائق):
     * العرض المنقضي → released ويُعرض المقعد على التالي في الترتيب.
     *
     * @return int عدد العروض المنقضاة
     */
    public function expireLapsedOffers(): int
    {
        $expired = 0;

        $eventIds = EventParticipant::query()
            ->where('seat_status', 'waitlisted')
            ->whereNotNull('offer_expires_at')
            ->where('offer_expires_at', '<', now())
            // عروض البدلاء بعد الإغلاق (awaiting_payment) يعالجها خط تحصيل
            // A10 في app:expire-payment-deadlines — ليست لهذه المهمة.
            ->whereHas('event', fn ($q) => $q->where('status', '!=', EventStatus::AwaitingPayment->value))
            ->distinct()
            ->pluck('event_id');

        foreach ($eventIds as $eventId) {
            $expired += DB::transaction(function () use ($eventId) {
                /** @var Event $locked */
                $locked = Event::withoutGlobalScopes()->whereKey($eventId)->lockForUpdate()->first();

                if ($locked === null) {
                    return 0;
                }

                $count = 0;

                $lapsed = EventParticipant::where('event_id', $locked->id)
                    ->where('seat_status', 'waitlisted')
                    ->whereNotNull('offer_expires_at')
                    ->where('offer_expires_at', '<', now())
                    ->orderBy('position')
                    ->get();

                foreach ($lapsed as $row) {
                    $position = (int) $row->position;

                    $this->writeSeat($locked, $row->employee_id, $row, 'released', null, 'انتهت مهلة عرض المقعد دون تأكيد', [
                        'position' => null,
                        'offered_at' => null,
                        'offer_expires_at' => null,
                    ]);

                    $this->compactPositions($locked, $position);

                    $this->notifyEmployee($locked, (int) $row->employee_id, 'event.waitlist.offer_expired');

                    $count++;
                }

                if ($count > 0) {
                    $this->offerSeatToNextInLine($locked);
                }

                return $count;
            });
        }

        return $expired;
    }

    /**
     * عرض المقعد الشاغر على أول قائمة الانتظار (H §10):
     * مهلة 120 دقيقة ← 30 دقيقة (< 6 ساعات على الإغلاق) ← فورية (< ساعة).
     * يُستدعى داخل معاملة تحمل قفل صف الفعالية.
     */
    public function offerSeatToNextInLine(Event $locked): void
    {
        // القائمة تُغلق مع إغلاق التسجيل — لا عروض بعده (بدلاء ما بعد الإغلاق A10).
        if (! $locked->isRegistrationOpen() || $locked->registration_closes_at === null) {
            return;
        }

        $reserved = $this->reservedCount($locked);

        $activeOffers = EventParticipant::where('event_id', $locked->id)
            ->where('seat_status', 'waitlisted')
            ->whereNotNull('offer_expires_at')
            ->where('offer_expires_at', '>=', now())
            ->count();

        $available = (int) $locked->capacity - $reserved - $activeOffers;

        if ($available <= 0) {
            return;
        }

        $next = EventParticipant::where('event_id', $locked->id)
            ->where('seat_status', 'waitlisted')
            ->whereNull('offered_at')
            ->orderBy('position')
            ->first();

        if ($next === null) {
            return;
        }

        $closesAt = $locked->registration_closes_at;
        $remainingMinutes = now()->diffInMinutes($closesAt, false);
        $config = config('events.waitlist');

        // أقل من ساعة على الإغلاق: فورية — الأسبق يفوز بلا عرض ولا مهلة.
        if ($remainingMinutes <= $config['instant_promotion_within_hours'] * 60) {
            $this->promote($locked, $next, $reserved, 'ترقية فورية — الأسبق يفوز (أقل من ساعة على الإغلاق)');

            return;
        }

        $minutes = $remainingMinutes <= $config['near_close_hours'] * 60
            ? (int) $config['offer_minutes_near_close']
            : (int) $config['offer_minutes'];

        $expiresAt = Carbon::now()->addMinutes($minutes)->min($closesAt);

        $next->forceFill(['offered_at' => now(), 'offer_expires_at' => $expiresAt])->save();

        $this->notifyEmployee(
            $locked,
            (int) $next->employee_id,
            'event.waitlist.offered',
            ['minutes' => $minutes],
        );

        $this->logChange($locked, (int) $next->employee_id, 'seat_status', 'waitlisted', 'waitlisted', null, "عُرض المقعد الشاغر بمهلة {$minutes} دقيقة");
    }

    /**
     * إغلاق قائمة الانتظار عند إغلاق التسجيل: إشعار من بقي فيها وإلغاء العروض
     * المعلقة. الصفوف تبقى waitlisted — بدلاء غير الدافعين بعد الإغلاق (A10).
     */
    public function closeWaitlist(Event $locked): void
    {
        $remaining = EventParticipant::where('event_id', $locked->id)
            ->where('seat_status', 'waitlisted')
            ->get();

        foreach ($remaining as $row) {
            if ($row->offered_at !== null) {
                $row->forceFill(['offered_at' => null, 'offer_expires_at' => null])->save();
            }

            $this->notifyEmployee($locked, (int) $row->employee_id, 'event.registration.closed_waitlisted');
        }
    }

    /**
     * إسقاط مشاركات موظف غادر الشركة ونحوه — حالة لا حذف (تستدعيها سلاسل A3/A4).
     */
    public function cancelParticipation(Event $event, Employee $employee, ?Model $actor, string $reason): void
    {
        DB::transaction(function () use ($event, $employee, $actor, $reason) {
            $locked = $this->lock($event);
            $row = $this->rowFor($locked, $employee);

            if ($row === null) {
                return;
            }

            if ($row->seat_status === 'reserved') {
                $this->releaseReservedSeat($locked, $row, 'cancelled', $actor, $reason);

                return;
            }

            if ($row->seat_status === 'waitlisted') {
                $position = (int) $row->position;
                $this->writeSeat($locked, $employee, $row, 'cancelled', $actor, $reason, [
                    'position' => null,
                    'offered_at' => null,
                    'offer_expires_at' => null,
                ]);
                $this->compactPositions($locked, $position);
            }
        });
    }

    /**
     * سطر سجل تغيير حقل مشارك (participant_events — H §10).
     */
    public function logChange(Event $event, int $employeeId, string $field, ?string $from, ?string $to, ?Model $actor, ?string $reason): void
    {
        ParticipantEvent::create([
            'event_id' => $event->id,
            'employee_id' => $employeeId,
            'field' => $field,
            'from_value' => $from,
            'to_value' => $to,
            'actor_type' => $actor?->getMorphClass(),
            'actor_id' => $actor?->getKey(),
            'reason' => $reason,
            'created_at' => now(),
        ]);
    }

    // ------------------------------------------------------------------

    /**
     * إخلاء مقعد محجوز (انسحاب/إزالة): حالة جديدة، عدّادات، ثم عرض المقعد
     * على قائمة الانتظار. لا رجوع للحالة السابقة للفعالية — جدول §9 لا يعرف
     * انتقال pending_provider ← open عند نزول العدد.
     */
    private function releaseReservedSeat(Event $locked, EventParticipant $row, string $to, ?Model $actor, string $reason): void
    {
        $this->writeSeat($locked, (int) $row->employee_id, $row, $to, $actor, $reason, [
            'position' => null,
            'offered_at' => null,
            'offer_expires_at' => null,
        ]);

        $this->syncCounters($locked, $this->reservedCount($locked));

        $this->offerSeatToNextInLine($locked);
    }

    /**
     * ترقية صف قائمة انتظار إلى مقعد محجوز — داخل معاملة القفل.
     */
    private function promote(Event $locked, EventParticipant $row, int $reservedBefore, string $reason): void
    {
        $position = (int) $row->position;

        $this->writeSeat($locked, (int) $row->employee_id, $row, 'reserved', null, $reason, [
            'joined_at' => now(),
            'position' => null,
            'offered_at' => null,
            'offer_expires_at' => null,
        ]);

        $this->compactPositions($locked, $position);
        $this->syncCounters($locked, $reservedBefore + 1);

        // بلوغ الحد الأدنى بترقية من القائمة وهي open → الطلب للمزوّد.
        if ((string) $locked->status === EventStatus::Open->value
            && ($reservedBefore + 1) >= (int) $locked->min_participants) {
            $this->machine->minimumReached($locked);
            $this->notifyPartnerOfRequest($locked);
            app(FundingService::class)->alertIfSubsidyUncovered($locked);
        }

        // بديل بعد إغلاق التسجيل (awaiting_payment): مطالبة دفع فورية بمهلة
        // البديل القصيرة — الحصة المقفلة نفسها، لا زيادة أبداً (A10 — H §12.3).
        if ((string) $locked->status === EventStatus::AwaitingPayment->value) {
            app(CollectionService::class)
                ->enrollSubstitute($locked, (int) $row->employee_id);
        }

        $this->notifyEmployee($locked, (int) $row->employee_id, 'event.waitlist.confirmed');
    }

    /**
     * كتابة حالة المقعد على الصف (إنشاء أو تحديث — الصف لا يُحذف أبداً) مع
     * سطر السجل.
     *
     * @param  array<string, mixed>  $attributes
     */
    private function writeSeat(Event $event, Employee|int $employee, ?EventParticipant $row, string $seatStatus, ?Model $actor, string $reason, array $attributes = []): EventParticipant
    {
        $employeeId = $employee instanceof Employee ? $employee->id : $employee;
        $from = $row?->seat_status;

        if ($row === null) {
            $row = EventParticipant::create([
                'event_id' => $event->id,
                'employee_id' => $employeeId,
                'seat_status' => $seatStatus,
                'payment_status' => 'not_due',
                ...$attributes,
            ]);
        } else {
            $row->forceFill(['seat_status' => $seatStatus, ...$attributes])->save();
        }

        $this->logChange($event, (int) $employeeId, 'seat_status', $from, $seatStatus, $actor, $reason);

        return $row;
    }

    /**
     * participants_count = المقاعد المحجوزة، و is_full عَلَم مشتق (H §9 قاعدة 3).
     */
    private function syncCounters(Event $locked, int $reserved): void
    {
        $locked->forceFill([
            'participants_count' => $reserved,
            'is_full' => $reserved >= (int) $locked->capacity,
        ])->save();
    }

    private function compactPositions(Event $event, int $removedPosition): void
    {
        if ($removedPosition <= 0) {
            return;
        }

        EventParticipant::where('event_id', $event->id)
            ->where('seat_status', 'waitlisted')
            ->where('position', '>', $removedPosition)
            ->decrement('position');
    }

    private function reservedCount(Event $event): int
    {
        return EventParticipant::where('event_id', $event->id)
            ->where('seat_status', 'reserved')
            ->count();
    }

    private function rowFor(Event $event, Employee $employee): ?EventParticipant
    {
        return EventParticipant::where('event_id', $event->id)
            ->where('employee_id', $employee->id)
            ->first();
    }

    private function offerActive(EventParticipant $row): bool
    {
        return $row->offered_at !== null
            && $row->offer_expires_at !== null
            && $row->offer_expires_at->gte(now());
    }

    private function withdrawalOpen(Event $event): bool
    {
        if ($event->isRegistrationOpen()) {
            return true;
        }

        // نافذة الانسحاب الحر 6 ساعات بعد قبول الوقت البديل (H §9/§10).
        return $event->free_withdrawal_until !== null
            && now()->lt($event->free_withdrawal_until);
    }

    private function ensureCommunityMember(Event $event, Employee $employee): void
    {
        $community = $event->community;

        $isMember = $community !== null
            && ($community->members()->where('employee_id', $employee->id)->exists()
                || $community->isLeader($employee));

        if (! $isMember) {
            throw new RuntimeException('الانضمام متاح لأعضاء المجتمع فقط (H §10).');
        }
    }

    private function lock(Event $event): Event
    {
        /** @var Event */
        return Event::withoutGlobalScopes()->whereKey($event->id)->lockForUpdate()->firstOrFail();
    }

    /**
     * إشعار المزوّد بالطلب الملزم عند بلوغ الحد الأدنى — إشعار مؤقت؛ قناة
     * الطلبات الموقعة بمهلها ملك A9 (event_provider_requests).
     */
    private function notifyPartnerOfRequest(Event $event): void
    {
        if ($event->partner_id === null) {
            return;
        }

        Notify::sendToId(
            'provider.request.minimum_reached',
            Partner::class,
            (int) $event->partner_id,
            ['event_id' => $event->id],
            ['data' => ['event_id' => $event->id]],
        );
    }

    /**
     * A14: النص يملكه القالب — موضع الاستدعاء يمرر مفتاحاً ومتحوّلات فقط.
     *
     * @param  array<string, scalar|null>  $variables
     */
    private function notifyEmployee(Event $event, int $employeeId, string $templateKey, array $variables = []): void
    {
        Notify::sendToId(
            $templateKey,
            Employee::class,
            $employeeId,
            $variables,
            ['data' => ['event_id' => $event->id]],
        );
    }
}
