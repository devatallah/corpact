<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\Company;
use App\Models\Discount;
use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Discount>
 */
class DiscountFactory extends Factory
{
    protected $model = Discount::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'partner_id' => Partner::factory(),
            'company_id' => Company::factory(),
            'community_id' => Community::factory(),
            'name' => 'تخفيض '.fake()->randomElement(['الربع الأول', 'الافتتاح', 'الولاء']),
            'type' => Discount::TYPE_FIXED,
            'value' => 50,
            'value_halalas' => 5000,
            'usage' => Discount::USAGE_DATE_RANGE,
            'starts_at' => null,
            'expires_at' => null,
            'start_time' => null,
            'end_time' => null,
            'status' => 'active',
        ];
    }

    public function percentage(float $percent = 10): static
    {
        return $this->state(fn () => [
            'type' => Discount::TYPE_PERCENTAGE,
            'value' => $percent,
            'value_halalas' => 0,
        ]);
    }

    public function oneTime(): static
    {
        return $this->state(fn () => ['usage' => Discount::USAGE_ONE_TIME]);
    }

    /**
     * صفٌّ ختمه A10 — يبقى قراءةً فقط ولا يدخل أي حساب.
     *
     * الختم يُكتب بالقوة: `archived_at` خارج fillable عمداً كي لا يوجد مسار
     * كتابة له في التطبيق.
     */
    public function archived(): static
    {
        return $this->afterMaking(fn (Discount $discount) => $discount->forceFill(['archived_at' => now()]))
            ->afterCreating(fn (Discount $discount) => $discount->forceFill(['archived_at' => now()])->save());
    }
}
