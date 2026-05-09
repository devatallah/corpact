<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wallet>
 */
class WalletFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'balance' => fake()->randomFloat(2, 5000, 50000),
        ];
    }
}
