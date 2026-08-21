<?php

namespace App\Services\Provider;

use App\Models\ActivityUnit;
use App\Models\EventProviderRequest;
use App\Models\UnitSlot;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * تقويم المنصة هو مصدر الحقيقة الوحيد للتوفر (H §11).
 *
 * النموذج: أوقات عمل الفرع تحدد «المتاح»، وصفوف unit_slots تحجز «المشغول»
 * (داخلي = فعالية مقبولة، خارجي = «حجز خارجي» يسجله المزوّد). قبول أي طلب
 * يحجز الوحدة فوراً داخل معاملة بقفل يمنع الحجز المزدوج.
 */
class AvailabilityService
{
    /**
     * هل الوحدة متاحة في النافذة المطلوبة؟ (أوقات العمل + لا تداخل مع مشغول)
     */
    public function isAvailable(ActivityUnit $unit, CarbonInterface $start, int $durationMinutes): bool
    {
        if ($unit->status !== 'active') {
            return false;
        }

        $end = $start->copy()->addMinutes($durationMinutes);

        $branch = $unit->branch;
        if ($branch === null || $branch->status !== 'active' || ! $branch->isWithinWorkingHours($start, $end)) {
            return false;
        }

        return ! $this->overlapQuery($unit->id, $start, $end)->exists();
    }

    /**
     * حجز الوحدة لفعالية — يُستدعى داخل معاملة القبول. القفل: قراءة الصفوف
     * المتداخلة بقفل تحديث ثم الإدراج؛ القيد الفريد على (الوحدة، اليوم، البداية)
     * صمّام أمان إضافي ضد سباق نفس الفتحة تماماً.
     *
     * @throws ValidationException الفتحة لم تعد متاحة
     */
    public function book(ActivityUnit $unit, EventProviderRequest $request): UnitSlot
    {
        $start = $request->slotStartsAt();
        $end = $request->slotEndsAt();

        $conflict = $this->overlapQuery($unit->id, $start, $end)
            ->lockForUpdate()
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'slot' => ['الفتحة الزمنية لم تعد متاحة — محجوزة لطلب آخر أو بحجز خارجي.'],
            ]);
        }

        try {
            return UnitSlot::create([
                'activity_unit_id' => $unit->id,
                'date' => $start->toDateString(),
                'start_time' => $start->format('H:i'),
                'end_time' => $this->endTimeString($end),
                'booking_type' => UnitSlot::TYPE_INTERNAL,
                'event_id' => $request->event_id,
                'event_provider_request_id' => $request->id,
            ]);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages([
                'slot' => ['الفتحة الزمنية لم تعد متاحة — محجوزة لطلب آخر أو بحجز خارجي.'],
            ]);
        }
    }

    /**
     * تسجيل حجز خارجي بوسم «حجز خارجي» حتى لا تُعرض تلك الأوقات (H §11).
     *
     * @throws ValidationException عند التعارض مع حجز قائم
     */
    public function markExternal(ActivityUnit $unit, string $date, string $startTime, string $endTime, ?string $note = null): UnitSlot
    {
        $start = Carbon::parse($date.' '.$startTime);
        $end = Carbon::parse($date.' '.$endTime);

        if ($end->lte($start)) {
            throw ValidationException::withMessages([
                'end_time' => ['وقت النهاية يجب أن يكون بعد وقت البداية.'],
            ]);
        }

        return DB::transaction(function () use ($unit, $start, $end, $note) {
            $conflict = $this->overlapQuery($unit->id, $start, $end)
                ->lockForUpdate()
                ->first();

            if ($conflict !== null) {
                $label = $conflict->booking_type === UnitSlot::TYPE_INTERNAL ? 'حجز منصة' : 'حجز خارجي';
                throw ValidationException::withMessages([
                    'slot' => ["الوقت يتعارض مع {$label} قائم على هذه الوحدة."],
                ]);
            }

            try {
                return UnitSlot::create([
                    'activity_unit_id' => $unit->id,
                    'date' => $start->toDateString(),
                    'start_time' => $start->format('H:i'),
                    'end_time' => $this->endTimeString($end),
                    'booking_type' => UnitSlot::TYPE_EXTERNAL,
                    'note' => $note ?: 'حجز خارجي',
                ]);
            } catch (UniqueConstraintViolationException) {
                throw ValidationException::withMessages([
                    'slot' => ['الوقت محجوز بالفعل على هذه الوحدة.'],
                ]);
            }
        });
    }

    /**
     * تحرير الحجز الداخلي المرتبط بطلب (إلغاء المزوّد بعد القبول).
     */
    public function release(EventProviderRequest $request): void
    {
        UnitSlot::query()
            ->where('event_provider_request_id', $request->id)
            ->where('booking_type', UnitSlot::TYPE_INTERNAL)
            ->delete();
    }

    /**
     * فتحة تنتهي منتصف الليل تُخزَّن 23:59 حتى تبقى المقارنة النصية HH:MM صحيحة.
     */
    private function endTimeString(CarbonInterface $end): string
    {
        $formatted = $end->format('H:i');

        return $formatted === '00:00' ? '23:59' : $formatted;
    }

    /**
     * @return Builder<UnitSlot>
     */
    private function overlapQuery(int $unitId, CarbonInterface $start, CarbonInterface $end): Builder
    {
        // نافذة تنتهي 00:00 (منتصف الليل) تُقارن كـ 24:00 نصياً — الأوقات
        // تُخزَّن HH:MM فتنجح المقارنة النصية.
        $startTime = $start->format('H:i');
        $endTime = $end->format('H:i') === '00:00' ? '24:00' : $end->format('H:i');

        return UnitSlot::query()
            ->where('activity_unit_id', $unitId)
            ->whereDate('date', $start->toDateString())
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime);
    }
}
