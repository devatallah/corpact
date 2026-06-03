<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventAlternative;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventAlternative>
 */
class EventAlternativeFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'proposed_date' => fake()->dateTimeBetween('+1 day', '+30 days'),
            'proposed_start_time' => fake()->randomElement(['16:00', '17:00', '18:00', '19:00', '20:00']),
            'proposed_end_time' => fake()->randomElement(['17:30', '18:30', '19:30', '20:30', '21:30']),
            'proposed_venues_count' => fake()->optional(0.5)->randomElement([1, 2, 3]),
            'proposed_amount' => fake()->optional(0.5)->randomFloat(2, 200, 600),
            'notes' => fake()->optional(0.5)->sentence(),
            'status' => 'proposed',
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn () => ['status' => 'accepted']);
    }

    public function rejected(): static
    {
        return $this->state(fn () => ['status' => 'rejected']);
    }
}
