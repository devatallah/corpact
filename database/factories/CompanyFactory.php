<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'email' => fake()->unique()->companyEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'contact_name' => fake()->name(),
            'contact_phone' => '05'.fake()->unique()->numerify('########'),
            'domain' => fake()->domainName(),
            'sector' => fake()->randomElement(['تقنية', 'مالية', 'صحة', 'تعليم', 'طاقة', 'اتصالات', 'عقارات']),
            'employee_count' => fake()->numberBetween(50, 500),
            'city' => fake()->randomElement(['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة']),
            'email_verified_at' => now(),
            'status' => 'active',
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
