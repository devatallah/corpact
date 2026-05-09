<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityLog>
 */
class ActivityLogFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'subject_type' => 'App\\Models\\Event',
            'subject_id' => 1,
            'type' => fake()->randomElement(['event_created', 'event_approved', 'employee_joined', 'wallet_charged', 'settlement_paid']),
            'description' => fake()->sentence(),
            'data' => null,
        ];
    }
}
