<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Partner;
use App\Models\VenuePricing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // A10 — H §12.2: المال هللات صحيحة؛ السقف الملزم = (الإجمالي − الدعم
        // المخطط) ÷ الحد الأدنى بلا تقريب لأعلى.
        $totalHalalas = fake()->randomElement([30000, 40000, 50000, 60000, 80000]);
        $capacity = fake()->randomElement([4, 6, 8, 10, 12]);
        $subsidyValue = fake()->randomElement([0, 5000, 10000, 15000, 20000]);
        $minParticipants = 2;
        $maxShare = intdiv($totalHalalas - min($subsidyValue, $totalHalalas), $minParticipants);
        $vatBase = intdiv($totalHalalas * 100, 115);

        return [
            'community_id' => Community::factory(),
            'company_id' => Company::factory(),
            'partner_id' => Partner::factory(),
            'venue_pricing_id' => VenuePricing::factory(),
            'category_id' => Category::factory(),
            'created_by' => Employee::factory(),
            'title' => fake()->randomElement([null, 'مباراة ودية', 'تدريب أسبوعي', 'بطولة الشركة', 'لقاء رياضي']),
            'event_date' => fake()->dateTimeBetween('now', '+30 days'),
            'start_time' => fake()->randomElement(['16:00', '17:00', '18:00', '19:00', '20:00', '21:00']),
            'duration_minutes' => fake()->randomElement([60, 90, 120]),
            'venues_count' => fake()->randomElement([1, 2]),
            'total_amount_halalas' => $totalHalalas,
            'base_amount_halalas' => $vatBase,
            'vat_amount_halalas' => $totalHalalas - $vatBase,
            'subsidy_type' => 'fixed',
            'subsidy_value' => $subsidyValue,
            'max_share_halalas' => $maxShare,
            'capacity' => $capacity,
            'participants_count' => fake()->numberBetween(1, $capacity),
            'notes' => fake()->optional(0.3)->sentence(),
            'rejection_reason' => null,
            'min_participants' => $minParticipants,
            'status' => 'open',
        ];
    }

    public function open(): static
    {
        return $this->state(fn () => ['status' => 'open']);
    }

    public function pendingApproval(): static
    {
        return $this->state(fn () => ['status' => 'pending_approval']);
    }

    /**
     * بلوغ السعة عَلَم is_full لا حالة (H §9 قاعدة 3) — حلّ محل حالة full القديمة.
     */
    public function full(): static
    {
        return $this->state(fn (array $attrs) => [
            'is_full' => true,
            'participants_count' => $attrs['capacity'],
        ]);
    }

    public function pendingProvider(): static
    {
        return $this->state(fn () => ['status' => 'pending_provider']);
    }

    /**
     * @deprecated الاسم القديم — يبقى مؤقتاً للاختبارات القائمة.
     */
    public function waitingpartner(): static
    {
        return $this->pendingProvider();
    }

    public function booked(): static
    {
        return $this->state(fn () => ['status' => 'booked']);
    }

    public function awaitingPayment(): static
    {
        return $this->state(fn () => ['status' => 'awaiting_payment']);
    }

    public function confirmed(): static
    {
        return $this->state(fn () => ['status' => 'confirmed']);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => 'rejected',
            'rejection_reason' => fake()->sentence(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'event_date' => fake()->dateTimeBetween('-30 days', '-1 day'),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => 'cancelled']);
    }
}
