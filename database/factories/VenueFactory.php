<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\Venue;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<venue>
 */
class VenueFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'partner_id' => Partner::factory(),
            'category_id' => Category::factory(),
            'name' => 'ملعب ' . fake()->numberBetween(1, 10),
            'status' => 'active',
        ];
    }

    public function closed(): static
    {
        return $this->state(fn () => ['status' => 'closed']);
    }

    public function maintenance(): static
    {
        return $this->state(fn () => ['status' => 'maintenance']);
    }
}
