<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\Event;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WalletTransaction>
 */
class WalletTransactionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wallet_id' => Wallet::factory(),
            'community_id' => null,
            'event_id' => null,
            'type' => fake()->randomElement(['credit', 'debit']),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'description' => fake()->randomElement([
                'شحن رصيد',
                'دعم حدث رياضي',
                'توزيع على المجتمعات',
                'استرداد مبلغ',
                'خصم حجز ملعب',
            ]),
        ];
    }

    public function credit(): static
    {
        return $this->state(fn () => ['type' => 'credit']);
    }

    public function debit(): static
    {
        return $this->state(fn () => ['type' => 'debit']);
    }
}
