<?php

namespace Database\Factories;

use App\Models\Venue;
use App\Models\VenuePricing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VenuePricing>
 */
class VenuePricingFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'venue_id' => Venue::factory(),
            'duration_minutes' => fake()->randomElement([60, 90, 120]),
            'price' => fake()->randomElement([150, 200, 250, 300, 350]),
        ];
    }
}
