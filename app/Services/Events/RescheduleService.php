<?php

namespace App\Services\Events;

use App\Enums\EventStatus;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Partner;
use App\Services\ActivityLogService;
use App\Services\Provider\AvailabilityService;
use App\Support\Notify;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * فشل بلوغ الحد الأدنى وإعادة الجدولة (H §8) + تمديد التسجيل 24 ساعة (H §24):
 *
 * - إعادة الجدولة **مرة واحدة فقط** إلى نفس اليوم والوقت بعد 7 أيام (قابلة
 *   للإعداد على القالب) — **نفس سجل الفعالية** مع reschedule_attempt++
 *   وحفظ original_starts_at؛ لا سجل جديد حتى لا تنكسر التقارير.
 * - لا استقطاع مالي على أي طرف في أي من المحاولتين (المال كله في خط تحصيل
 *   A10 — CollectionService — على مسار النجاح بعد الإغلاق حصراً).
 * - المزوّد الذي قبل الطلب يُبلَّغ بالإلغاء فوراً ويُفك حجز وحدته — بلا أثر على
 *   مؤشر موثوقيته (الإلغاء من المنصة لا منه).
 * - بلوغ الحد الأدنى مجدداً بعد إعادة الجدولة يعيد إرسال طلب المزوّد تلقائياً
 *   (open ← pending_provider عبر آلة A7 ثم observer قناة A9).
 * - البديل المعتمد لفتح الفعالية على مجتمعات أخرى (مؤجل — H §24): تمديد
 *   التسجيل **مرة واحدة** 24 ساعة بقرار القائد قبل الوقوع في مسار إعادة
 *   الجدولة.
 *
 * يسري على الفعاليات المولّدة من قوالب والمنشأة يدوياً على السواء (H §8).
 */
class RescheduleService
{
    public function __construct(
        private EventStateMachine $machine,
        private AvailabilityService $availability,
    ) {}

    /**
     * محاولة إعادة الجدولة عند إغلاق التسجيل دون بلوغ الحد الأدنى.
     * يعيد false إذا استُنفدت المحاولة (فشل المحاولة الثانية ← الإلغاء على
     * المستدعي) أو كانت الحالة خارج open/booked.
     */
    public function rescheduleOnce(Event $event): bool
    {
        $rescheduled = DB::transaction(function () use ($event) {
            /** @var Event $fresh */
            $fresh = Event::withoutGlobalScopes()->whereKey($event->id)->lockForUpdate()->firstOrFail();

            $status = (string) $fresh->status;

            if ($fresh->reschedule_attempt >= 1
                || ! in_array($status, [EventStatus::Open->value, EventStatus::Booked->value], true)) {
                return false;
            }

            // إبلاغ المزوّد فوراً وفك حجز الوحدة إن كان قد قبل (H §8).
            $this->cancelActiveProviderRequest(
                $fresh,
                'لم يبلغ العدد الحد الأدنى عند إغلاق التسجيل — أُلغي الحجز وأعيدت جدولة الفعالية',
            );

            $old = $fresh->startsAt();
            $intervalDays = max(1, (int) ($fresh->template?->reschedule_interval_days ?? 7));

            // booked ← open (انتقال A8 الموثق)؛ open تبقى open بسطر تاريخ.
            $this->machine->rescheduleMinNotMet($fresh, metadata: [
                'reschedule_attempt' => $fresh->reschedule_attempt + 1,
                'from_starts_at' => $old->toIso8601String(),
                'to_starts_at' => $old->copy()->addDays($intervalDays)->toIso8601String(),
            ]);

            // نفس السجل: الموعد +7 أيام، حفظ الأصل، عدّاد المحاولة —
            // registration_closes_at وends_at يُشتقان آلياً في النموذج.
            $fresh->forceFill([
                'starts_at' => $old->copy()->addDays($intervalDays),
                'original_starts_at' => $fresh->original_starts_at ?? $old,
                'reschedule_attempt' => $fresh->reschedule_attempt + 1,
                'free_withdrawal_until' => null,
            ])->save();

            $event->setRawAttributes($fresh->getAttributes(), true);

            return true;
        });

        if (! $rescheduled) {
            return false;
        }

        ActivityLogService::log(
            $event->company_id,
            $event,
            'event_rescheduled_min_not_met',
            "أُعيدت جدولة الفعالية #{$event->id} مرة واحدة (لم يبلغ العدد الحد الأدنى) إلى {$event->starts_at->format('Y-m-d H:i')} — نفس السجل، لا استقطاع على أي طرف",
        );

        $this->notifyRescheduled($event);

        return true;
    }

    /**
     * إلغاء طلب المزوّد الفعال (إن وُجد) من جهة المنصة: فك حجز الوحدة، وسم
     * الطلب ملغى، إشعار المزوّد فوراً — **بلا أثر على مؤشر الموثوقية** (الإلغاء
     * من المنصة لا منه؛ وإلغاء الطلب المعلّق يحميه من انقضاء مهلةٍ لفعالية
     * ماتت). يعيد true إن وُجد طلب فعال أُلغي (فالمزوّد أُشعر هنا).
     */
    public function cancelActiveProviderRequest(Event $event, string $reason): bool
    {
        $request = EventProviderRequest::query()
            ->where('event_id', $event->id)
            ->whereIn('status', [
                EventProviderRequest::STATUS_PENDING,
                EventProviderRequest::STATUS_ACCEPTED,
                EventProviderRequest::STATUS_ALTERNATIVE,
            ])
            ->lockForUpdate()
            ->first();

        if ($request === null) {
            return false;
        }

        $this->availability->release($request);

        $request->update([
            'status' => EventProviderRequest::STATUS_CANCELLED,
            'cancellation_reason' => $reason,
        ]);

        Notify::sendToId(
            'event.reschedule.request_cancelled.partner',
            Partner::class,
            (int) $request->partner_id,
            ['request_id' => $request->id, 'event_id' => $event->id],
            ['data' => ['event_id' => $event->id, 'event_provider_request_id' => $request->id]],
        );

        return true;
    }

    /**
     * تمديد التسجيل 24 ساعة — مرة واحدة لكل فعالية، بقرار القائد/المنسّق/
     * مسؤول الحساب، قبل إغلاق التسجيل وقبل بلوغ الحد الأدنى (H §24).
     */
    public function extendRegistration(Event $event, Employee $actor): Event
    {
        return DB::transaction(function () use ($event, $actor) {
            /** @var Event $fresh */
            $fresh = Event::withoutGlobalScopes()->whereKey($event->id)->lockForUpdate()->firstOrFail();

            if (! in_array((string) $fresh->status, [EventStatus::Open->value, EventStatus::Booked->value], true)) {
                throw ValidationException::withMessages([
                    'status' => ['التمديد متاح للفعاليات المفتوحة أو المحجوزة فقط.'],
                ]);
            }

            if ($fresh->registration_extended_at !== null) {
                throw ValidationException::withMessages([
                    'registration' => ['مُدد تسجيل هذه الفعالية مرة من قبل — التمديد مرة واحدة فقط.'],
                ]);
            }

            $closesAt = $fresh->registration_closes_at ?? $fresh->startsAt();

            if (now()->gte($closesAt)) {
                throw ValidationException::withMessages([
                    'registration' => ['أُغلق التسجيل بالفعل — لم يعد التمديد ممكناً.'],
                ]);
            }

            if ((int) $fresh->reservedParticipants()->count() >= (int) $fresh->min_participants) {
                throw ValidationException::withMessages([
                    'registration' => ['بلغ العدد الحد الأدنى — لا حاجة للتمديد.'],
                ]);
            }

            // ‎+24 ساعة بسقف وقت البدء نفسه.
            $newClosesAt = $closesAt->copy()->addHours(24)->min($fresh->startsAt());

            $fresh->forceFill([
                'registration_closes_at' => $newClosesAt,
                'registration_extended_at' => now(),
                'registration_extended_by' => $actor->id,
            ])->save();

            $event->setRawAttributes($fresh->getAttributes(), true);

            ActivityLogService::log(
                $fresh->company_id,
                $fresh,
                'event_registration_extended',
                "مُدد تسجيل الفعالية #{$fresh->id} 24 ساعة (مرة واحدة) حتى {$newClosesAt->format('Y-m-d H:i')} — بديل فتحها على مجتمعات أخرى",
            );

            $this->notifyExtension($fresh);

            return $event;
        });
    }

    private function notifyRescheduled(Event $event): void
    {
        $newDate = $event->starts_at->format('Y-m-d H:i');

        foreach ($event->reservedParticipants()->pluck('employees.id') as $employeeId) {
            Notify::sendToId(
                'event.reschedule.participant',
                Employee::class,
                (int) $employeeId,
                ['date' => $newDate],
                ['data' => ['event_id' => $event->id]],
            );
        }

        foreach ($event->community?->leaderEmployees() ?? [] as $leader) {
            Notify::send(
                'event.reschedule.leader',
                $leader,
                ['event_id' => $event->id, 'date' => $newDate, 'minimum' => $event->min_participants],
                ['data' => ['event_id' => $event->id]],
            );
        }
    }

    private function notifyExtension(Event $event): void
    {
        $community = $event->community;
        $community?->loadMissing('members');

        foreach ($community?->members ?? [] as $member) {
            Notify::send(
                'event.registration.extended',
                $member,
                [
                    'event_id' => $event->id,
                    'closes_at' => $event->registration_closes_at->format('Y-m-d H:i'),
                ],
                ['data' => ['event_id' => $event->id]],
            );
        }
    }
}
