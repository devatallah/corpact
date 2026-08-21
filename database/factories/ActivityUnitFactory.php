<?php

namespace Database\Factories;

use App\Models\ActivityUnit;
use App\Models\Category;
use App\Models\ProviderBranch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityUnit>
 */
class ActivityUnitFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'provider_branch_id' => ProviderBranch::factory(),
            'category_id' => Category::factory(),
            'venue_id' => null,
            'name' => 'ملعب '.fake()->numberBetween(1, 9),
            'min_capacity' => 2,
            'max_capacity' => 12,
            'pricing_type' => ActivityUnit::PRICING_UNIT_HOUR,
            'price' => fake()->randomElement([200, 300, 400, 500]),
            'default_duration_minutes' => 90,
            'status' => 'active',
        ];
    }

    public function perPerson(): static
    {
        return $this->state(fn () => ['pricing_type' => ActivityUnit::PRICING_PER_PERSON]);
    }

    public function package(): static
    {
        return $this->state(fn () => ['pricing_type' => ActivityUnit::PRICING_PACKAGE]);
    }
}
