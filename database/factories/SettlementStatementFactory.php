<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\SettlementStatement;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<SettlementStatement>
 */
class SettlementStatementFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = Carbon::now()->startOfMonth();

        return [
            'partner_id' => Partner::factory(),
            'period_key' => $start->format('Y-m').'-P1',
            'period_start' => $start->toDateString(),
            'period_end' => $start->copy()->addDays(14)->toDateString(),
            'status' => SettlementStatement::STATUS_DRAFT,
            'items_count' => 0,
            'gross_amount_halalas' => 0,
            'commission_amount_halalas' => 0,
            'vat_amount_halalas' => 0,
            'net_amount_halalas' => 0,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => SettlementStatement::STATUS_APPROVED,
            'approved_at' => Carbon::now(),
        ]);
    }
}
