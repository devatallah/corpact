<?php

namespace App\Services\Employee;

use App\Models\Event;

class EventDetailService
{
    /**
     * Get full event details with participants and payment breakdown.
     *
     * @return array{event: Event, payment_breakdown: array{total_cost: float, company_subsidy: float, player_payment: float, cost_per_person: float, participants_count: int, capacity: int}}
     */
    public function getDetail(Event $event): array
    {
        $event->load([
            'community.company',
            'business',
            'category',
            'creator',
            'participants',
            'waitlistEntries',
            'venues',
            'alternatives',
            'parentEvent',
        ]);

        $totalAmount = (float) $event->total_amount;
        $communityContribution = (float) $event->community_contribution;
        $remaining = max(0, $totalAmount - $communityContribution);
        $perPlayer = $event->capacity > 0 ? max(0, ceil($remaining / $event->capacity)) : 0;

        return [
            'event' => $event,
            'payment_breakdown' => [
                'total_amount' => $totalAmount,
                'community_balance' => (float) ($event->community?->balance ?? 0),
                'community_contribution' => $communityContribution,
                'remaining' => $remaining,
                'player_payment' => (float) $perPlayer,
                'cost_per_person' => (float) $event->cost_per_person,
                'participants_count' => $event->participants_count,
                'capacity' => $event->capacity,
            ],
        ];
    }
}
