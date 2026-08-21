<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\Company;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wallet>
 */
class WalletFactory extends Factory
{
    /**
     * لا رصيد هنا: `balance_halalas` عمود cache لا يُكتب إلا عبر
     * LedgerService مع قيد دفتر في نفس المعاملة (H §12.5).
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'owner_type' => Company::class,
            'owner_id' => function (array $attributes) {
                return $attributes['company_id'];
            },
        ];
    }

    /**
     * محفظة فرعية لمجتمع.
     */
    public function forCommunity(Community $community): static
    {
        return $this->state(fn () => [
            'company_id' => $community->company_id,
            'owner_type' => Community::class,
            'owner_id' => $community->id,
        ]);
    }
}
