<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
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
            'member_count' => fake()->numberBetween(5, 30),
            'status' => 'active',
        ];
    }
}
