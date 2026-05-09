<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\CommunityAnnouncement;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityAnnouncement>
 */
class CommunityAnnouncementFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'community_id' => Community::factory(),
            'employee_id' => Employee::factory(),
            'body' => fake()->randomElement([
                'مرحباً بالأعضاء الجدد في المجتمع!',
                'تم تحديث جدول التدريبات الأسبوعية.',
                'سيتم إقامة بطولة الشركة الشهر القادم.',
                'تذكير: الحجز القادم يوم الخميس الساعة 6 مساءً.',
                'تهانينا لفريقنا على الفوز في المباراة الأخيرة!',
            ]),
        ];
    }
}
