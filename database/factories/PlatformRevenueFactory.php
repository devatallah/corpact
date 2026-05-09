<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\PlatformRevenue;
use App\Models\Settlement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlatformRevenue>
 */
class PlatformRevenueFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'settlement_id' => null,
            'event_id' => null,
            'amount' => fake()->randomFloat(2, 50, 500),
            'source' => fake()->randomElement(['commission', 'subscription', 'premium']),
            'description' => fake()->randomElement(['عمولة حجز', 'اشتراك شهري', 'خدمة مميزة']),
            'revenue_date' => fake()->dateTimeBetween('-60 days', 'now'),
        ];
    }
}
