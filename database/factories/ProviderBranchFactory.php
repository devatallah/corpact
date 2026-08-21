<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\ProviderBranch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProviderBranch>
 */
class ProviderBranchFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $window = [['from' => '06:00', 'to' => '23:59']];

        return [
            'partner_id' => Partner::factory(),
            'name' => 'الفرع الرئيسي',
            'address' => fake()->streetAddress(),
            'city' => fake()->randomElement(['الرياض', 'جدة', 'الدمام']),
            'district' => fake()->streetName(),
            'latitude' => fake()->latitude(24, 25),
            'longitude' => fake()->longitude(46, 47),
            'working_hours' => [
                'sun' => $window, 'mon' => $window, 'tue' => $window, 'wed' => $window,
                'thu' => $window, 'fri' => $window, 'sat' => $window,
            ],
            'contact_name' => fake()->name(),
            'contact_phone' => '05'.fake()->unique()->numerify('########'),
            'status' => 'active',
        ];
    }
}
