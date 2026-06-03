<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Community>
 */
class CommunityFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'icon' => fake()->randomElement(['⚽', '🎾', '🏸', '🏐', '🏀']),
            'color' => fake()->hexColor(),
            'company_id' => Company::factory(),
            'category_id' => Category::factory(),
            'leader_id' => null,
            'member_count' => fake()->numberBetween(5, 30),
            'balance' => fake()->randomFloat(2, 0, 5000),
            'status' => 'active',
        ];
    }
}
