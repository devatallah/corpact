<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * صف مشغول في تقويم الوحدة — تقويم المنصة هو مصدر الحقيقة الوحيد (H §11).
 * داخلي: حجز فعالية عبر قبول طلب. خارجي: يسجله المزوّد بوسم «حجز خارجي»
 * حتى لا تُعرض تلك الأوقات.
 */
#[Fillable([
    'activity_unit_id',
    'date',
    'start_time',
    'end_time',
    'booking_type',
    'event_id',
    'event_provider_request_id',
    'note',
])]
class UnitSlot extends Model
{
    use HasFactory;

    public const TYPE_INTERNAL = 'internal';

    public const TYPE_EXTERNAL = 'external';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
        ];
    }

    /**
     * @return BelongsTo<ActivityUnit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(ActivityUnit::class, 'activity_unit_id');
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @return BelongsTo<EventProviderRequest, $this>
     */
    public function providerRequest(): BelongsTo
    {
        return $this->belongsTo(EventProviderRequest::class, 'event_provider_request_id');
    }
}
