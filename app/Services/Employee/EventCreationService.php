<?php

namespace App\Services\Employee;

use App\Models\Community;
use App\Models\CourtPricing;
use App\Models\Discount;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Notification;
use App\Models\QuickMatch;
use App\Services\ActivityLogService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventCreationService
{
    /**
     * Calculate cost breakdown for an event before creation.
     *
     * @param  array{court_pricing_id: int, court_ids: array<int>, capacity: int, company_subsidy: float, community_balance: float, discount_id?: int|null}  $params
     * @return array{total_cost: float, discount_amount: float, discount_id: int|null, company_subsidy: float, community_contribution: float, player_payment: float, cost_per_person: float}
     */
    public function calculateCosts(array $params): array
    {
        $pricing = CourtPricing::findOrFail($params['court_pricing_id']);
        $duration = $pricing->duration_minutes;

        // Sum each court's price for the selected duration
        $totalCost = 0;
        foreach ($params['court_ids'] as $courtId) {
            $courtPricing = CourtPricing::where('court_id', $courtId)
                ->where('duration_minutes', $duration)
                ->first();
            $totalCost += $courtPricing ? (float) $courtPricing->price : (float) $pricing->price;
        }

        // Apply discount if provided
        $discountAmount = 0;
        $discountId = $params['discount_id'] ?? null;
        if ($discountId) {
            $discount = Discount::where('id', $discountId)->where('status', 'active')->first();
            if ($discount) {
                $discountAmount = $this->calculateDiscountAmount($discount, $totalCost);
            } else {
                $discountId = null;
            }
        }

        $afterDiscount = max(0, $totalCost - $discountAmount);

        $communityBalance = max(0, $params['community_balance'] ?? 0);
        $communityContribution = min($afterDiscount, $communityBalance);
        $companySubsidy = $communityContribution;
        $remainingCost = $afterDiscount - $communityContribution;

        $costPerPerson = $params['capacity'] > 0
            ? round($remainingCost / $params['capacity'], 2)
            : 0;

        return [
            'total_cost' => (float) $totalCost,
            'discount_amount' => (float) $discountAmount,
            'discount_id' => $discountId,
            'company_subsidy' => (float) $companySubsidy,
            'community_contribution' => (float) $communityContribution,
            'player_payment' => (float) $remainingCost,
            'cost_per_person' => $costPerPerson,
        ];
    }

    /**
     * Calculate the discount amount based on type.
     */
    private function calculateDiscountAmount(Discount $discount, float $totalCost): float
    {
        if ($discount->type === 'percentage') {
            return round($totalCost * (float) $discount->value / 100, 2);
        }

        // Fixed amount — can't exceed total cost
        return min((float) $discount->value, $totalCost);
    }

    /**
     * Create a new event.
     *
     * @param  array{
     *     community_id: int,
     *     club_id: int,
     *     sport_id: int,
     *     court_pricing_id: int,
     *     date: string,
     *     time: string,
     *     capacity: int,
     *     courts_count: int,
     *     company_subsidy: float,
     *     title?: string,
     *     notes?: string
     * }  $data
     */
    public function create(Employee $creator, array $data): Event
    {
        $community = Community::findOrFail($data['community_id']);

        if ($community->company_id !== $creator->company_id) {
            throw new AuthorizationException('You can only create events for your company communities.');
        }

        $isMember = $community->members()
            ->where('employee_id', $creator->id)
            ->exists();

        if (! $isMember) {
            throw ValidationException::withMessages([
                'community_id' => ['يجب أن تكون عضواً في المجتمع لإنشاء الفعاليات.'],
            ]);
        }

        $pricing = CourtPricing::findOrFail($data['court_pricing_id']);

        $courtIds = $data['court_ids'];
        $courtsCount = count($courtIds);

        $costs = $this->calculateCosts([
            'court_pricing_id' => $data['court_pricing_id'],
            'court_ids' => $courtIds,
            'capacity' => $data['capacity'],
            'company_subsidy' => $data['company_subsidy'],
            'community_balance' => (float) $community->balance,
            'discount_id' => $data['discount_id'] ?? null,
        ]);

        return DB::transaction(function () use ($creator, $community, $data, $costs, $pricing, $courtIds, $courtsCount) {
            // Deduct company subsidy from community wallet
            if ($costs['community_contribution'] > 0) {
                $community->decrement('balance', $costs['community_contribution']);
            }

            $event = Event::create([
                'community_id' => $data['community_id'],
                'company_id' => $community->company_id,
                'club_id' => $data['club_id'],
                'sport_id' => $data['sport_id'],
                'court_pricing_id' => $data['court_pricing_id'],
                'discount_id' => $costs['discount_id'],
                'discount_amount' => $costs['discount_amount'] > 0 ? $costs['discount_amount'] : null,
                'created_by' => $creator->id,
                'title' => $data['title'] ?? null,
                'event_date' => $data['date'],
                'start_time' => $data['time'],
                'duration_minutes' => $pricing->duration_minutes,
                'courts_count' => $courtsCount,
                'total_amount' => $costs['total_cost'],
                'capacity' => $data['capacity'],
                'participants_count' => 1,
                'cost_per_person' => $costs['cost_per_person'],
                'company_subsidy' => $costs['company_subsidy'],
                'community_contribution' => $costs['community_contribution'],
                'player_payment' => $costs['player_payment'],
                'notes' => $data['notes'] ?? null,
                'status' => 'open',
            ]);

            // Attach selected courts
            $event->courts()->attach($courtIds);

            // Creator auto-joins the event
            $event->participants()->attach($creator->id, [
                'status' => 'joined',
                'joined_at' => now(),
            ]);

            // Auto-join interested members from quick match
            if (! empty($data['quick_match_id'])) {
                $quickMatch = QuickMatch::find($data['quick_match_id']);
                if ($quickMatch && $quickMatch->community_id === (int) $data['community_id']) {
                    $interestedIds = $quickMatch->interests()->pluck('employee_id')
                        ->filter(fn ($id) => $id !== $creator->id)
                        ->take($data['capacity'] - 1); // leave room respecting capacity

                    foreach ($interestedIds as $empId) {
                        $event->participants()->attach($empId, [
                            'status' => 'joined',
                            'joined_at' => now(),
                        ]);
                        $event->increment('participants_count');
                    }
                }
            }

            ActivityLogService::log(
                $community->company_id,
                $event,
                'event_created',
                "تم إنشاء الفعالية #{$event->id} بواسطة موظف #{$creator->id}",
            );

            // Notify community members about the new event
            $community->load('members');
            foreach ($community->members as $member) {
                if ($member->id === $creator->id) {
                    continue;
                }
                Notification::create([
                    'notifiable_type' => Employee::class,
                    'notifiable_id' => $member->id,
                    'type' => 'info',
                    'title' => 'فعالية جديدة',
                    'body' => "تم إنشاء فعالية جديدة في {$community->name} — انضم الآن!",
                    'data' => ['event_id' => $event->id],
                ]);
            }

            return $event->fresh(['community', 'club', 'sport', 'creator']);
        });
    }
}
