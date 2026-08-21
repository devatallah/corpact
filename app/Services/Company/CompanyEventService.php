<?php

namespace App\Services\Company;

use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventAlternative;
use App\Services\ActivityLogService;
use App\Services\Events\EventStateMachine;
use App\Services\Payments\FundingService;
use App\Support\Money;
use App\Support\Notify;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompanyEventService
{
    /**
     * List events for a company with optional filters.
     *
     * @param  array{status?: string, community_id?: int, partner_id?: int, date_from?: string, date_to?: string, per_page?: int}  $filters
     */
    public function listForCompany(Company $company, array $filters = []): LengthAwarePaginator
    {
        return Event::query()
            ->with(['community', 'partner', 'category', 'creator', 'alternatives', 'venuePricing', 'venues'])
            ->whereHas('community', fn ($query) => $query->where('company_id', $company->id))
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['community_id']), fn ($query) => $query->where('community_id', $filters['community_id']))
            ->when(isset($filters['partner_id']), fn ($query) => $query->where('partner_id', $filters['partner_id']))
            ->when(isset($filters['date_from']), fn ($query) => $query->whereDate('event_date', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($query) => $query->whereDate('event_date', '<=', $filters['date_to']))
            ->when(isset($filters['search']), fn ($query) => $query->where(function ($q) use ($filters) {
                $q->whereHas('partner', fn ($c) => $c->where('name', 'like', "%{$filters['search']}%"))
                    ->orWhereHas('category', fn ($s) => $s->where('name', 'like', "%{$filters['search']}%"));
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
     * قبول منشئ الفعالية للوقت البديل (H §9): تعود open بالتاريخ الجديد،
     * **المشاركون يبقون كما هم** (لا طرد — كان الكود القديم يزيلهم)، وتُفتح
     * نافذة انسحاب حر 6 ساعات للجميع. registration_closes_at يُعاد اشتقاقه
     * آلياً من التاريخ الجديد.
     */
    public function acceptAlternativeForEvent(Event $event, EventAlternative $alternative, ?Employee $actor = null): Event
    {
        if ($event->status !== 'provider_alternative') {
            throw ValidationException::withMessages([
                'status' => ['لا يمكن قبول بديل إلا عندما تكون الحالة "وقت بديل مقترح".'],
            ]);
        }

        return DB::transaction(function () use ($event, $alternative, $actor) {
            // تعديل السعر قبل قبول الطلب مشروع (H §12.1)؛ بعده لا يتغير
            // الإجمالي إطلاقاً. المال هللات صحيحة (A10).
            $newTotalHalalas = $alternative->proposed_amount !== null
                ? Money::toHalalas($alternative->proposed_amount)
                : (int) $event->total_amount_halalas;
            $newvenuesCount = $alternative->proposed_venues_count ?? $event->venues_count;

            $freeWithdrawalHours = (int) config('events.alternative_free_withdrawal_hours', 6);

            // آلة الحالات: provider_alternative ← open (المشاركون محفوظون).
            app(EventStateMachine::class)->creatorAcceptedAlternative($event, $actor);

            $vat = Money::decomposeVat($newTotalHalalas);

            $event->update([
                'event_date' => $alternative->proposed_date,
                'start_time' => $alternative->proposed_start_time,
                'registration_closes_at' => null, // يُعاد اشتقاقه من الموعد الجديد
                'free_withdrawal_until' => now()->addHours($freeWithdrawalHours),
                'venues_count' => $newvenuesCount,
                'total_amount_halalas' => $newTotalHalalas,
                'base_amount_halalas' => $vat['base'],
                'vat_amount_halalas' => $vat['vat'],
                'budget_deducted_at' => null,
                'payment_deadline' => null,
            ]);

            // إعادة إعلان السقف الملزم من الإجمالي الجديد (تغيّر السعر قبل
            // القبول) — نافذة الانسحاب الحر تحمي من لا يرضيه (H §12.2).
            app(FundingService::class)->announceCeiling($event->fresh());

            $alternative->update(['status' => 'accepted']);

            // العدد بلغ الحد الأدنى أصلاً → يعود الطلب للمزوّد فوراً على الموعد
            // الجديد (open ← pending_provider) ليؤكد الحجز رسمياً عبر قناته (A9).
            $event->refresh();
            if ($event->participants_count >= (int) $event->min_participants) {
                app(EventStateMachine::class)->minimumReached($event, $actor);
            }

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

            // إشعار المشاركين بالتاريخ الجديد ونافذة الانسحاب الحر — لا أحد يُزال.
            $event->load('community.members');
            foreach ($event->community->members as $member) {
                Notify::send(
                    'event.alternative.accepted.member',
                    $member,
                    [
                        'community' => $event->community->name,
                        'date' => $alternative->proposed_date,
                        'time' => $alternative->proposed_start_time,
                        'hours' => $freeWithdrawalHours,
                    ],
                    ['data' => ['event_id' => $event->id]],
                );
            }

            // Notify company
            Notify::sendToId(
                'event.alternative.accepted.company',
                Company::class,
                (int) $event->company_id,
                ['event_id' => $event->id],
                ['data' => ['event_id' => $event->id]],
            );

            return $event->fresh(['community', 'partner', 'category', 'alternatives']);
        });
    }

    /**
     * Reject a proposed alternative — shared logic for company, creator, and leader.
     */
    public function rejectAlternativeForEvent(Event $event, EventAlternative $alternative, ?Employee $actor = null): Event
    {
        if ($event->status !== 'provider_alternative') {
            throw ValidationException::withMessages([
                'status' => ['لا يمكن رفض بديل إلا عندما تكون الحالة "وقت بديل مقترح".'],
            ]);
        }

        return DB::transaction(function () use ($event, $alternative, $actor) {
            $alternative->update(['status' => 'rejected']);

            // If no more proposed alternatives, the event dies (H §9):
            // provider_alternative ← رفض المنشئ → cancelled_provider.
            $remainingProposed = $event->alternatives()->where('status', 'proposed')->count();

            if ($remainingProposed === 0) {
                app(EventStateMachine::class)->creatorRejectedAlternative($event, $actor, 'تم رفض الوقت البديل المقترح من المزوّد.');
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
                    Notify::send(
                        'event.alternative.rejected.member',
                        $member,
                        ['community' => $event->community->name],
                        ['data' => ['event_id' => $event->id]],
                    );
                }
            }

            return $event->fresh(['community', 'partner', 'category', 'alternatives']);
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
