<?php

namespace Database\Factories;

use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<business>
 */
class BusinessFactory extends Factory
{
    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company() . ' business',
            'email' => fake()->unique()->companyEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'city' => fake()->randomElement(['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة']),
            'district' => fake()->streetName(),
            'contact_phone' => fake()->phoneNumber(),
            'working_hours' => '06:00 - 00:00',
            'rating' => fake()->randomFloat(1, 3.0, 5.0),
            'total_bookings' => fake()->numberBetween(0, 200),
            'commission_rate' => fake()->randomFloat(2, 8, 15),
            'email_verified_at' => now(),
            'status' => 'active',
            'role' => 'owner',
            'approved_at' => now(),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => 'pending',
            'approved_at' => null,
        ]);
    }
}
