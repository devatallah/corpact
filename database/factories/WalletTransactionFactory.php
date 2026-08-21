<?php

namespace Database\Factories;

use App\Enums\WalletTransactionType;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * قيد دفتر للاختبارات فقط — كود الإنتاج يكتب القيود حصراً عبر LedgerService
 * كي يتحدث رصيد الـ cache في نفس المعاملة.
 *
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
            'type' => WalletTransactionType::Adjustment,
            'amount_halalas' => fake()->numberBetween(100, 500_000),
            'direction' => fake()->randomElement([WalletTransaction::DIRECTION_CREDIT, WalletTransaction::DIRECTION_DEBIT]),
            'reference_type' => null,
            'reference_id' => null,
            'actor_user_id' => null,
            'related_transaction_id' => null,
            'idempotency_key' => (string) Str::uuid(),
            'note' => null,
            'occurred_at' => now(),
        ];
    }

    public function credit(): static
    {
        return $this->state(fn () => ['direction' => WalletTransaction::DIRECTION_CREDIT]);
    }

    public function debit(): static
    {
        return $this->state(fn () => ['direction' => WalletTransaction::DIRECTION_DEBIT]);
    }

    public function ofType(WalletTransactionType $type): static
    {
        return $this->state(fn () => ['type' => $type]);
    }
}
