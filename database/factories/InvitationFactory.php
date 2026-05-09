<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Employee;
use App\Models\Invitation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invitation>
 */
class InvitationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'invited_by' => Employee::factory(),
            'email' => fake()->unique()->safeEmail(),
            'status' => 'pending',
            'accepted_at' => null,
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn () => [
            'status' => 'accepted',
            'accepted_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn () => ['status' => 'expired']);
    }
}
