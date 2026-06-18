<?php

namespace App\Services;

use App\Models\Event;
use Carbon\Carbon;

class RefundService
{
    /**
     * Calculate the refund percentage based on how far in advance the event is being cancelled.
     */
    public function calculateRefundPercentage(Event $event): int
    {
        $eventStart = Carbon::parse($event->event_date->format('Y-m-d') . ' ' . $event->start_time);
        $hoursUntilEvent = Carbon::now()->diffInMinutes($eventStart, false) / 60;

        // If event has already started, no refund
        if ($hoursUntilEvent <= 0) {
            return 0;
        }

        $tiers = config('refund.tiers', [
            ['min_hours' => 24, 'percentage' => 100],
            ['min_hours' => 4,  'percentage' => 50],
            ['min_hours' => 0,  'percentage' => 0],
        ]);

        foreach ($tiers as $tier) {
            if ($hoursUntilEvent >= $tier['min_hours']) {
                return (int) $tier['percentage'];
            }
        }

        return 0;
    }

    /**
     * Calculate the refund amount (portion of community_contribution to return).
     */
    public function calculateRefundAmount(Event $event): float
    {
        $percentage = $this->calculateRefundPercentage($event);
        $contribution = (float) $event->community_contribution;

        return round($contribution * $percentage / 100, 2);
    }

    /**
     * Get full refund preview info for displaying to the user before cancellation.
     *
     * @return array{percentage: int, refund_amount: float, original_contribution: float, hours_until_event: float, policy_label: string}
     */
    public function getRefundPreview(Event $event): array
    {
        $eventStart = Carbon::parse($event->event_date->format('Y-m-d') . ' ' . $event->start_time);
        $hoursUntilEvent = max(0, Carbon::now()->diffInMinutes($eventStart, false) / 60);

        $percentage = $this->calculateRefundPercentage($event);
        $contribution = (float) $event->community_contribution;
        $refundAmount = round($contribution * $percentage / 100, 2);

        return [
            'percentage' => $percentage,
            'refund_amount' => $refundAmount,
            'original_contribution' => $contribution,
            'hours_until_event' => round($hoursUntilEvent, 1),
            'policy_label' => $this->getPolicyLabel($percentage),
        ];
    }

    /**
     * Apply the refund: return the calculated portion of community_contribution to the community balance.
     * Returns the actual refund amount applied.
     */
    public function applyRefund(Event $event): float
    {
        $percentage = $this->calculateRefundPercentage($event);
        $contribution = (float) $event->community_contribution;
        $refundAmount = round($contribution * $percentage / 100, 2);

        if ($refundAmount > 0 && $event->community) {
            $event->community->increment('balance', $refundAmount);
        }

        $event->update([
            'refund_percentage' => $percentage,
            'refund_amount' => $refundAmount,
        ]);

        return $refundAmount;
    }

    /**
     * Get a human-readable Arabic label for the refund percentage.
     */
    private function getPolicyLabel(int $percentage): string
    {
        return match ($percentage) {
            100 => 'استرداد كامل',
            50 => 'استرداد جزئي (50%)',
            0 => 'لا يوجد استرداد',
            default => "استرداد {$percentage}%",
        };
    }
}
