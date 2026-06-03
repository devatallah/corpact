<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\Company;
use App\Models\Settlement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Settlement>
 */
class SettlementFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $grossAmount = fake()->randomFloat(2, 2000, 15000);
        $commissionRate = fake()->randomFloat(2, 0.08, 0.15);
        $commissionAmount = round($grossAmount * $commissionRate, 2);
        $netAmount = $grossAmount - $commissionAmount;

        return [
            'business_id' => Business::factory(),
            'company_id' => Company::factory(),
            'period' => fake()->date('Y-m'),
            'events_count' => fake()->numberBetween(3, 20),
            'gross_amount' => $grossAmount,
            'commission_amount' => $commissionAmount,
            'net_amount' => $netAmount,
            'status' => 'pending',
            'paid_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status' => 'paid',
            'paid_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    public function processing(): static
    {
        return $this->state(fn () => ['status' => 'processing']);
    }
}
