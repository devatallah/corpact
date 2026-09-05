<?php

namespace App\Models;

use Database\Factories\SlotFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['venue_id', 'date', 'start_time', 'end_time', 'status'])]
/**
 * ساعة معروضة على ملعب في يوم بعينه.
 *
 * ليست حجزاً: الحجز يُقيَّد في `unit_slots` على وحدة النشاط. هذه هي الساعات
 * التي يعرضها المزوّد أصلاً — «متى يفتح هذا الملعب» — والحجز لا يقع إلا
 * داخلها (`AvailabilityService::withinOfferedHours`).
 */
class Slot extends Model
{
    /** @use HasFactory<SlotFactory> */
    use HasFactory;

    /** ساعة معروضة للحجز. */
    public const STATUS_AVAILABLE = 'available';

    /** ساعة عرضها المزوّد ثم أُغلقت — تبقى في السجل ولا تُحجز. */
    public const STATUS_BOOKED = 'booked';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Venue, $this>
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }
}
