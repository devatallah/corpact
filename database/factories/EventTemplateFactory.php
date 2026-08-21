<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\EventTemplate;
use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventTemplate>
 */
class EventTemplateFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalAmount = fake()->randomElement([300, 400, 500, 600]);
        $companySubsidy = fake()->randomElement([0, 50, 100]);
        $capacity = fake()->randomElement([6, 8, 10, 12]);
        $playerPayment = $totalAmount - $companySubsidy;

        // مرساة أسبوعية على أحدٍ قادم — بداية الأسبوع الأحد (H §8)
        $anchor = now()->startOfDay();
        while ($anchor->dayOfWeek !== 0) {
            $anchor->addDay();
        }

        return [
            'company_id' => Company::factory(),
            'community_id' => Community::factory(),
            'partner_id' => Partner::factory(),
            'activity_unit_id' => null,
            'category_id' => Category::factory(),
            'venue_pricing_id' => null,
            'venue_ids' => [],
            'created_by' => Employee::factory(),
            'title' => fake()->randomElement(['تدريب أسبوعي', 'لقاء المجتمع', 'مباراة دورية']),
            'notes' => null,
            'recurrence_pattern' => EventTemplate::PATTERN_WEEKLY,
            'day_of_week' => 0, // الأحد
            'day_of_month' => null,
            'anchor_date' => $anchor->toDateString(),
            'ends_on' => null,
            'start_time' => '20:00',
            'duration_minutes' => 90,
            'capacity' => $capacity,
            'min_participants' => 2,
            'venues_count' => 1,
            'total_amount' => $totalAmount,
            'company_subsidy' => $companySubsidy,
            'community_contribution' => $companySubsidy,
            'player_payment' => $playerPayment,
            'cost_per_person' => round($playerPayment / $capacity, 2),
            'blackout_behavior' => EventTemplate::BLACKOUT_SKIP,
            'reschedule_interval_days' => 7,
            'status' => EventTemplate::STATUS_ACTIVE,
        ];
    }

    public function paused(): static
    {
        return $this->state(fn () => [
            'status' => EventTemplate::STATUS_PAUSED,
            'paused_at' => now(),
        ]);
    }

    public function biweekly(): static
    {
        return $this->state(fn () => ['recurrence_pattern' => EventTemplate::PATTERN_BIWEEKLY]);
    }

    public function monthly(int $dayOfMonth = 15): static
    {
        return $this->state(function (array $attrs) use ($dayOfMonth) {
            $anchor = now()->startOfDay()->addDay();
            $candidate = $anchor->copy()->day(min($dayOfMonth, $anchor->daysInMonth));
            if ($candidate->lt($anchor)) {
                $next = $anchor->copy()->addMonthNoOverflow()->startOfMonth();
                $candidate = $next->day(min($dayOfMonth, $next->daysInMonth));
            }

            return [
                'recurrence_pattern' => EventTemplate::PATTERN_MONTHLY,
                'day_of_week' => null,
                'day_of_month' => $dayOfMonth,
                'anchor_date' => $candidate->toDateString(),
            ];
        });
    }

    public function shiftOnBlackout(): static
    {
        return $this->state(fn () => ['blackout_behavior' => EventTemplate::BLACKOUT_SHIFT_WEEK]);
    }
}
