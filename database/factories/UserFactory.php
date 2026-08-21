<?php

namespace Database\Factories;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('123456'),
            'phone' => '9665'.fake()->unique()->numerify('########'),
            'avatar' => null,
            'status' => 'active',
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Grant the platform admin role (Teamat admin).
     */
    public function platformAdmin(): static
    {
        return $this->afterCreating(fn (User $user) => $user->assignRole(Role::PlatformAdmin));
    }

    /**
     * Grant the finance admin role.
     */
    public function financeAdmin(): static
    {
        return $this->afterCreating(fn (User $user) => $user->assignRole(Role::FinanceAdmin));
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['status' => 'inactive']);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}
