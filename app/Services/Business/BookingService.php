<?php

namespace App\Services\Business;

use App\Models\Business;
use App\Models\Venue;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventAlternative;
use App\Models\Notification;
use App\Services\ActivityLogService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    /**
     * List events (booking requests) for a business with optional filters.
     *
     * @param  array{status?: string, date_from?: string, date_to?: string, per_page?: int}  $filters
     */
    public function listForbusiness(Business $business, array $filters = []): LengthAwarePaginator
    {
        return Event::query()
            ->with(['company', 'community', 'category', 'venues', 'creator', 'alternatives'])
            ->where('business_id', $business->id)
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['date_from']), fn ($query) => $query->whereDate('event_date', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($query) => $query->whereDate('event_date', '<=', $filters['date_to']))
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Approve an event booking request.
     */
    public function approve(Business $business, Event $event): Event
    {
        $this->ensureEventBelongsTobusiness($business, $event);

        if ($event->status !== 'waiting_business') {
            throw ValidationException::withMessages([
                'status' => ['يمكن قبول الفعاليات المنتظرة فقط.'],
            ]);
        }

        $event->update(['status' => 'confirmed']);

        ActivityLogService::log(
            $event->company_id,
            $event,
            'event_approved',
            "تم قبول الفعالية #{$event->id} من النادي",
        );

        // Notify company
        Notification::create([
            'notifiable_type' => \App\Models\Company::class,
            'notifiable_id' => $event->company_id,
            'type' => 'success',
            'title' => 'تم قبول الحج��',
            'body' => "النادي وافق على حجز الفعالية #{$event->id}",
            'data' => ['event_id' => $event->id],
        ]);

        // Notify community members
        $event->load('community.members');
        foreach ($event->community->members as $member) {
            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $member->id,
                'type' => 'success',
                'title' => 'تم تأكيد الفعالية',
                'body' => "تم تأكيد حجز فعالية {$event->community->name} من النادي",
                'data' => ['event_id' => $event->id],
            ]);
        }

        return $event->loadMissing(['company', 'community', 'venues']);
    }

    /**
     * Reject an event booking request with a reason.
     */
    public function reject(Business $business, Event $event, string $reason): Event
    {
        $this->ensureEventBelongsTobusiness($business, $event);

        if ($event->status !== 'waiting_business') {
            throw ValidationException::withMessages([
                'status' => ['يمكن رفض الفعاليات المنتظرة فقط.'],
            ]);
        }

        $event->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        // Full refund on business rejection (not user-initiated cancellation)
        $contribution = (float) $event->community_contribution;
        if ($contribution > 0 && $event->community) {
            $event->community->increment('balance', $contribution);
            $event->update([
                'refund_percentage' => 100,
                'refund_amount' => $contribution,
            ]);
        }

        ActivityLogService::log(
            $event->company_id,
            $event,
            'event_rejected',
            "تم رفض الفعالية #{$event->id} من النادي",
            ['reason' => $reason],
        );

        // Notify company
        Notification::create([
            'notifiable_type' => \App\Models\Company::class,
            'notifiable_id' => $event->company_id,
            'type' => 'error',
            'title' => 'تم رفض الحجز',
            'body' => "النادي رفض حجز الفعالية #{$event->id} — السبب: {$reason}",
            'data' => ['event_id' => $event->id],
        ]);

        // Notify community members
        $event->load('community.members');
        foreach ($event->community->members as $member) {
            Notification::create([
                'notifiable_type' => Employee::class,
                'notifiable_id' => $member->id,
                'type' => 'error',
                'title' => 'تم رفض الفعالية',
                'body' => "تم رفض فعالية {$event->community->name} من النادي",
                'data' => ['event_id' => $event->id],
            ]);
        }

        return $event->loadMissing(['company', 'community']);
    }

    /**
     * Propose an alternative for an event.
     *
     * @param  array{proposed_date: string, proposed_start_time: string, proposed_venues_count?: int, proposed_amount?: float, notes?: string}  $data
     */
    public function proposeAlternative(Business $business, Event $event, array $data): EventAlternative
    {
        $this->ensureEventBelongsTobusiness($business, $event);

        if (! in_array($event->status, ['waiting_business', 'alternative_proposed'])) {
            throw ValidationException::withMessages([
                'status' => ['يمكن اقتراح بدائل للفعاليات المنتظرة فقط.'],
            ]);
        }

        return DB::transaction(function () use ($event, $data) {
            $event->update(['status' => 'alternative_proposed']);

            $endTime = \Carbon\Carbon::createFromFormat('H:i', $data['proposed_start_time'])
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
            Notification::create([
                'notifiable_type' => \App\Models\Company::class,
                'notifiable_id' => $event->company_id,
                'type' => 'warning',
                'title' => 'وقت بديل مقترح من النادي',
                'body' => "النادي اقترح وقت بديل للفعالية #{$event->id} — التاريخ: {$data['proposed_date']} الساعة: {$data['proposed_start_time']}",
                'data' => ['event_id' => $event->id],
            ]);

            // Notify event creator
            if ($event->created_by) {
                Notification::create([
                    'notifiable_type' => Employee::class,
                    'notifiable_id' => $event->created_by,
                    'type' => 'warning',
                    'title' => 'وقت بديل مقترح من النادي',
                    'body' => "النادي اقترح وقت بديل للفعالية — التاريخ: {$data['proposed_date']} الساعة: {$data['proposed_start_time']}",
                    'data' => ['event_id' => $event->id],
                ]);
            }

            return $alternative;
        });
    }

    /**
     * Assign venues to an event.
     *
     * @param  array<int>  $venueIds
     */
    public function assignvenues(Business $business, Event $event, array $venueIds): Event
    {
        $this->ensureEventBelongsTobusiness($business, $event);

        $validVenues = Venue::query()
            ->where('business_id', $business->id)
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
     * Verify that an event belongs to the given business.
     */
    private function ensureEventBelongsTobusiness(Business $business, Event $event): void
    {
        if ($event->business_id !== $business->id) {
            throw new AuthorizationException('هذه الفعالية لا تتبع ناديك.');
        }
    }
}
