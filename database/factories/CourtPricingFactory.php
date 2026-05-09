<?php

namespace Database\Factories;

use App\Models\Court;
use App\Models\CourtPricing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourtPricing>
 */
class CourtPricingFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'court_id' => Court::factory(),
            'duration_minutes' => fake()->randomElement([60, 90, 120]),
            'price' => fake()->randomElement([150, 200, 250, 300, 350]),
        ];
    }
}
