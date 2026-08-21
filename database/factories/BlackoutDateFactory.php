<?php

namespace Database\Factories;

use App\Models\BlackoutDate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlackoutDate>
 */
class BlackoutDateFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('+5 days', '+20 days');

        return [
            'name' => fake()->randomElement(['عيد الفطر', 'اليوم الوطني', 'رمضان', 'إجازة رسمية']),
            'starts_on' => $start->format('Y-m-d'),
            'ends_on' => (clone $start)->modify('+3 days')->format('Y-m-d'),
            'created_by' => null,
        ];
    }
}
