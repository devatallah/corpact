<?php

namespace App\Services\Company;

use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventAlternative;
use App\Models\Notification;
use App\Services\ActivityLogService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompanyEventService
{
    /**
     * List events for a company with optional filters.
     *
     * @param  array{status?: string, community_id?: int, club_id?: int, date_from?: string, date_to?: string, per_page?: int}  $filters
     */
    public function listForCompany(Company $company, array $filters = []): LengthAwarePaginator
    {
        return Event::query()
            ->with(['community', 'club', 'sport', 'creator', 'alternatives', 'courtPricing', 'courts'])
            ->whereHas('community', fn ($query) => $query->where('company_id', $company->id))
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['community_id']), fn ($query) => $query->where('community_id', $filters['community_id']))
            ->when(isset($filters['club_id']), fn ($query) => $query->where('club_id', $filters['club_id']))
            ->when(isset($filters['date_from']), fn ($query) => $query->whereDate('event_date', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($query) => $query->whereDate('event_date', '<=', $filters['date_to']))
            ->when(isset($filters['search']), fn ($query) => $query->where(function ($q) use ($filters) {
                $q->whereHas('club', fn ($c) => $c->where('name', 'like', "%{$filters['search']}%"))
                  ->orWhereHas('sport', fn ($s) => $s->where('name', 'like', "%{$filters['search']}%"));
            }))
            ->latest('event_date')
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Accept a proposed alternative — update event with alternative details and confirm.
     * Called from company context.
     */
    public function acceptAlternative(Company $company, Event $event, EventAlternative $alternative): Event
    {
        $this->ensureEventBelongsToCompany($company, $event);

        return $this->acceptAlternativeForEvent($event, $alternative);
    }

    /**
     * Reject a proposed alternative.
     * Called from company context.
     */
    public function rejectAlternative(Company $company, Event $event, EventAlternative $alternative): Event
    {
        $this->ensureEventBelongsToCompany($company, $event);

        return $this->rejectAlternativeForEvent($event, $alternative);
    }

    /**
     * Accept a proposed alternative — shared logic for company, creator, and leader.
     */
    public function acceptAlternativeForEvent(Event $event, EventAlternative $alternative): Event
    {
        if ($event->status !== 'alternative_proposed') {
            throw ValidationException::withMessages([
                'status' => ['لا يمكن قبول بديل إلا عندما تكون الحالة "وقت بديل مقترح".'],
            ]);
        }

        return DB::transaction(function () use ($event, $alternative) {
            $newAmount = $alternative->proposed_amount ?? $event->total_amount;
            $newCourtsCount = $alternative->proposed_courts_count ?? $event->courts_count;

            // Remove all participants except the creator
            $event->participants()
                ->where('employee_id', '!=', $event->created_by)
                ->detach();

            // Ensure creator is still joined
            $creatorJoined = $event->participants()
                ->where('employee_id', $event->created_by)
                ->wherePivot('status', 'joined')
                ->exists();

            if (! $creatorJoined) {
                $event->participants()->syncWithoutDetaching([
                    $event->created_by => ['status' => 'joined', 'joined_at' => now()],
                ]);
            }

            $event->update([
                'event_date' => $alternative->proposed_date,
                'start_time' => $alternative->proposed_start_time,
                'courts_count' => $newCourtsCount,
                'total_amount' => $newAmount,
                'participants_count' => 1,
                'cost_per_person' => $event->capacity > 0 ? round(($newAmount - $event->community_contribution) / $event->capacity, 2) : 0,
                'status' => 'open',
            ]);

            $alternative->update(['status' => 'accepted']);

            // Reject all other proposed alternatives for this event
            $event->alternatives()
                ->where('id', '!=', $alternative->id)
                ->where('status', 'proposed')
                ->update(['status' => 'rejected']);

            ActivityLogService::log(
                $event->company_id,
                $event,
                'alternative_accepted',
                "تم قبول البديل للفعالية #{$event->id}",
                ['alternative_id' => $alternative->id],
            );

            // Notify community members about the date/time change
            $event->load('community.members');
            foreach ($event->community->members as $member) {
                Notification::create([
                    'notifiable_type' => Employee::class,
                    'notifiable_id' => $member->id,
                    'type' => 'warning',
                    'title' => 'تم تغيير موعد الفعالية',
                    'body' => "تم تحديث موعد فعالية {$event->community->name} إلى {$alternative->proposed_date} الساعة {$alternative->proposed_start_time}. يرجى الانضمام مجدداً.",
                    'data' => ['event_id' => $event->id],
                ]);
            }

            // Notify company
            Notification::create([
                'notifiable_type' => \App\Models\Company::class,
                'notifiable_id' => $event->company_id,
                'type' => 'success',
                'title' => 'تم قبول الوقت البديل',
                'body' => "تم قبول الوقت البديل للفعالية #{$event->id} — الفعالية مفتوحة للانضمام مجدداً",
                'data' => ['event_id' => $event->id],
            ]);

            return $event->fresh(['community', 'club', 'sport', 'alternatives']);
        });
    }

    /**
     * Reject a proposed alternative — shared logic for company, creator, and leader.
     */
    public function rejectAlternativeForEvent(Event $event, EventAlternative $alternative): Event
    {
        if ($event->status !== 'alternative_proposed') {
            throw ValidationException::withMessages([
                'status' => ['لا يمكن رفض بديل إلا عندما تكون الحالة "وقت بديل مقترح".'],
            ]);
        }

        return DB::transaction(function () use ($event, $alternative) {
            $alternative->update(['status' => 'rejected']);

            // If no more proposed alternatives, reject the event
            $remainingProposed = $event->alternatives()->where('status', 'proposed')->count();

            if ($remainingProposed === 0) {
                $event->update(['status' => 'rejected', 'rejection_reason' => 'تم رفض الوقت البديل المقترح من النادي.']);
            }

            ActivityLogService::log(
                $event->company_id,
                $event,
                'alternative_rejected',
                "تم رفض البديل للفعالية #{$event->id}",
                ['alternative_id' => $alternative->id],
            );

            // Notify community members if event was fully rejected
            if ($remainingProposed === 0) {
                $event->load('community.members');
                foreach ($event->community->members as $member) {
                    Notification::create([
                        'notifiable_type' => Employee::class,
                        'notifiable_id' => $member->id,
                        'type' => 'error',
                        'title' => 'تم إلغاء الفعالية',
                        'body' => "تم رفض الوقت البديل وإلغاء فعالية {$event->community->name}",
                        'data' => ['event_id' => $event->id],
                    ]);
                }
            }

            return $event->fresh(['community', 'club', 'sport', 'alternatives']);
        });
    }

    private function ensureEventBelongsToCompany(Company $company, Event $event): void
    {
        if ($event->company_id !== $company->id) {
            throw ValidationException::withMessages([
                'event' => ['هذه الفعالية لا تنتمي لشركتك.'],
            ]);
        }
    }
}
