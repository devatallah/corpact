<?php

namespace App\Services\Partner;

use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventAlternative;
use App\Models\Partner;
use App\Models\Venue;
use App\Services\ActivityLogService;
use App\Services\Events\EventStateMachine;
use App\Support\Notify;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    /**
     * قبول المزوّد للطلب → booked عبر آلة الحالات (A7 — H §9): الوحدة محجوزة
     * والتسجيل ما زال مفتوحاً حتى registration_closes_at، **ولا أثر مالي هنا**
     * — استقطاع الدعم وتحصيل الحصص عند إغلاق التسجيل (awaiting_payment، قشرة
     * A7 ثم A10). مهلة الـ 30 دقيقة القديمة ماتت.
     */
    public function approve(Partner $partner, Event $event): Event
    {
        $this->ensureEventBelongsTopartner($partner, $event);

        if ($event->status !== 'pending_provider') {
            throw ValidationException::withMessages([
                'status' => ['يمكن قبول الطلبات المنتظرة رد المزوّد فقط.'],
            ]);
        }

        return DB::transaction(function () use ($partner, $event) {
            app(EventStateMachine::class)->providerAccepted($event, $partner);

            ActivityLogService::log(
                $event->company_id,
                $event,
                'event_approved',
                "قبل المزوّد طلب الفعالية #{$event->id} — الوحدة محجوزة والتسجيل مستمر حتى الإغلاق",
            );

            // Notify company
            Notify::sendToId(
                'provider.decision.accepted.company',
                Company::class,
                (int) $event->company_id,
                ['event_id' => $event->id],
                ['data' => ['event_id' => $event->id]],
            );

            // Notify community members
            $event->load('community.members');
            foreach ($event->community->members as $member) {
                Notify::send(
                    'provider.decision.accepted.member',
                    $member,
                    ['community' => $event->community->name],
                    ['data' => ['event_id' => $event->id]],
                );
            }

            return $event->loadMissing(['company', 'community', 'venues']);
        });
    }

    /**
     * Reject an event booking request with a reason.
     *
     * Since budget is only deducted after approval, rejection does not
     * require a refund unless the event was previously approved and
     * the budget was already deducted.
     */
    public function reject(Partner $partner, Event $event, string $reason): Event
    {
        $this->ensureEventBelongsTopartner($partner, $event);

        if ($event->status !== 'pending_provider') {
            throw ValidationException::withMessages([
                'status' => ['يمكن رفض الطلبات المنتظرة رد المزوّد فقط.'],
            ]);
        }

        // رفض المزوّد → cancelled_provider (H §9) — لا مال استُقطع قبل الإغلاق
        // فلا استرداد؛ خفض الموثوقية عند A9.
        app(EventStateMachine::class)->providerRejected($event, $partner, $reason);

        ActivityLogService::log(
            $event->company_id,
            $event,
            'event_rejected',
            "تم رفض الفعالية #{$event->id} من الشريك",
            ['reason' => $reason],
        );

        // Notify company
        Notify::sendToId(
            'provider.decision.rejected.company',
            Company::class,
            (int) $event->company_id,
            ['event_id' => $event->id, 'reason' => $reason],
            ['data' => ['event_id' => $event->id]],
        );

        // Notify community members
        $event->load('community.members');
        foreach ($event->community->members as $member) {
            Notify::send(
                'provider.decision.rejected.member',
                $member,
                ['community' => $event->community->name],
                ['data' => ['event_id' => $event->id]],
            );
        }

        return $event->loadMissing(['company', 'community']);
    }

    /**
     * Propose an alternative for an event.
     *
     * @param  array{proposed_date: string, proposed_start_time: string, proposed_venues_count?: int, proposed_amount?: float, notes?: string}  $data
     */
    public function proposeAlternative(Partner $partner, Event $event, array $data): EventAlternative
    {
        $this->ensureEventBelongsTopartner($partner, $event);

        if (! in_array($event->status, ['pending_provider', 'provider_alternative'])) {
            throw ValidationException::withMessages([
                'status' => ['يمكن اقتراح بدائل للطلبات المنتظرة رد المزوّد فقط.'],
            ]);
        }

        return DB::transaction(function () use ($partner, $event, $data) {
            if ($event->status === 'pending_provider') {
                app(EventStateMachine::class)->providerProposedAlternative($event, $partner);
            }

            $endTime = Carbon::createFromFormat('H:i', $data['proposed_start_time'])
                ->addMinutes($event->duration_minutes)
                ->format('H:i');

            $alternative = EventAlternative::create([
                'event_id' => $event->id,
                'proposed_date' => $data['proposed_date'],
                'proposed_start_time' => $data['proposed_start_time'],
                'proposed_end_time' => $endTime,
                'proposed_venues_count' => $data['proposed_venues_count'] ?? null,
                'proposed_amount' => $data['proposed_amount'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'proposed',
            ]);

            ActivityLogService::log(
                $event->company_id,
                $event,
                'alternative_proposed',
                "تم اقتراح وقت بديل للفعالية #{$event->id}",
                ['alternative_id' => $alternative->id, 'proposed_date' => $data['proposed_date']],
            );

            // Notify company
            Notify::sendToId(
                'provider.decision.alternative.company',
                Company::class,
                (int) $event->company_id,
                [
                    'event_id' => $event->id,
                    'date' => $data['proposed_date'],
                    'time' => $data['proposed_start_time'],
                ],
                ['data' => ['event_id' => $event->id]],
            );

            // Notify event creator
            if ($event->created_by) {
                Notify::sendToId(
                    'provider.decision.alternative.creator',
                    Employee::class,
                    (int) $event->created_by,
                    [
                        'date' => $data['proposed_date'],
                        'time' => $data['proposed_start_time'],
                    ],
                    ['data' => ['event_id' => $event->id]],
                );
            }

            return $alternative;
        });
    }

    /**
     * Assign venues to an event.
     *
     * @param  array<int>  $venueIds
     */
    public function assignvenues(Partner $partner, Event $event, array $venueIds): Event
    {
        $this->ensureEventBelongsTopartner($partner, $event);

        $validVenues = Venue::query()
            ->where('partner_id', $partner->id)
            ->where('status', 'active')
            ->whereIn('id', $venueIds)
            ->count();

        if ($validVenues !== count($venueIds)) {
            throw ValidationException::withMessages([
                'venues' => ['أحد الملاعب المختارة غير صالح أو غير نشط.'],
            ]);
        }

        $event->venues()->sync($venueIds);

        return $event->fresh(['venues']);
    }

    /**
     * Verify that an event belongs to the given partner.
     */
    private function ensureEventBelongsTopartner(Partner $partner, Event $event): void
    {
        if ($event->partner_id !== $partner->id) {
            // Foreign-entity probe → 404, never 403 (H §4 isolation rule).
            throw (new ModelNotFoundException)
                ->setModel(Event::class, [$event->id]);
        }
    }
}
