<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'notifiable_type' => User::class,
            'notifiable_id' => User::factory(),
            'type' => fake()->randomElement(['event_created', 'event_approved', 'event_rejected', 'payment', 'system', 'reminder']),
            'title' => fake()->randomElement([
                'تم إنشاء حدث جديد',
                'تمت الموافقة على الحجز',
                'تم رفض الحجز',
                'تم استلام دفعة',
                'تذكير بالحدث القادم',
                'تحديث النظام',
            ]),
            'body' => fake()->sentence(),
            'data' => null,
            'read_at' => fake()->optional(0.4)->dateTimeBetween('-7 days', 'now'),
        ];
    }

    public function unread(): static
    {
        return $this->state(fn () => ['read_at' => null]);
    }

    public function read(): static
    {
        return $this->state(fn () => ['read_at' => now()]);
    }
}
