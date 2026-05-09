<?php

namespace Database\Factories;

use App\Models\Club;
use App\Models\Community;
use App\Models\Company;
use App\Models\CourtPricing;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Sport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalAmount = fake()->randomElement([300, 400, 500, 600, 800]);
        $capacity = fake()->randomElement([4, 6, 8, 10, 12]);
        $companySubsidy = fake()->randomElement([0, 50, 100, 150, 200]);
        $playerPayment = $totalAmount - $companySubsidy;
        $costPerPerson = round($playerPayment / $capacity, 2);

        return [
            'community_id' => Community::factory(),
            'company_id' => Company::factory(),
            'club_id' => Club::factory(),
            'court_pricing_id' => CourtPricing::factory(),
            'sport_id' => Sport::factory(),
            'created_by' => Employee::factory(),
            'title' => fake()->randomElement([null, 'مباراة ودية', 'تدريب أسبوعي', 'بطولة الشركة', 'لقاء رياضي']),
            'event_date' => fake()->dateTimeBetween('now', '+30 days'),
            'start_time' => fake()->randomElement(['16:00', '17:00', '18:00', '19:00', '20:00', '21:00']),
            'duration_minutes' => fake()->randomElement([60, 90, 120]),
            'courts_count' => fake()->randomElement([1, 2]),
            'total_amount' => $totalAmount,
            'capacity' => $capacity,
            'participants_count' => fake()->numberBetween(1, $capacity),
            'cost_per_person' => $costPerPerson,
            'company_subsidy' => $companySubsidy,
            'player_payment' => $playerPayment,
            'notes' => fake()->optional(0.3)->sentence(),
            'rejection_reason' => null,
            'status' => 'open',
        ];
    }

    public function open(): static
    {
        return $this->state(fn () => ['status' => 'open']);
    }

    public function full(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => 'full',
            'participants_count' => $attrs['capacity'],
        ]);
    }

    public function waitingClub(): static
    {
        return $this->state(fn () => ['status' => 'waiting_club']);
    }

    public function confirmed(): static
    {
        return $this->state(fn () => ['status' => 'confirmed']);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => 'rejected',
            'rejection_reason' => fake()->sentence(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'event_date' => fake()->dateTimeBetween('-30 days', '-1 day'),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => 'cancelled']);
    }
}
