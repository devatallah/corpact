<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<EventProviderRequest>
 */
class EventProviderRequestFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sentAt = now();

        return [
            'event_id' => Event::factory(),
            'partner_id' => Partner::factory(),
            'activity_unit_id' => null,
            'requested_date' => now()->addDays(3)->toDateString(),
            'start_time' => '18:00',
            'duration_minutes' => 90,
            'quantity' => 1,
            'pricing_type' => null,
            'frozen_participants_count' => null,
            'total_amount' => 300,
            'status' => EventProviderRequest::STATUS_PENDING,
            'sent_at' => $sentAt,
            'deadline_at' => $sentAt->copy()->addHours(12),
            'link_token_hash' => hash('sha256', Str::random(48)),
            'link_expires_at' => $sentAt->copy()->addHours(72),
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn () => [
            'status' => EventProviderRequest::STATUS_ACCEPTED,
            'responded_at' => now(),
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn () => [
            'sent_at' => now()->subHours(14),
            'deadline_at' => now()->subHours(2),
        ]);
    }
}
