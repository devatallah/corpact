<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * سجل مؤشر الموثوقية — صف لكل تغيّر (H §11): من 0 إلى 100 يبدأ من 80.
 * +2 قبول خلال المهلة · −3 رد متأخر · −1 رفض · −15 إلغاء بعد القبول ·
 * +3 فعالية اكتملت بلا مشاكل. التعديل اليدوي لأدمن تيمات وحده بسبب موثَّق.
 */
#[Fillable([
    'partner_id',
    'event_provider_request_id',
    'event_id',
    'delta',
    'score_before',
    'score_after',
    'reason',
    'note',
    'actor_user_id',
    'counts_as_sample',
])]
class ProviderReliabilityLog extends Model
{
    use HasFactory;

    protected $table = 'provider_reliability_log';

    public const REASON_ACCEPT_WITHIN_DEADLINE = 'accept_within_deadline';

    public const REASON_LATE_RESPONSE = 'late_response';

    public const REASON_REJECT = 'reject';

    public const REASON_CANCEL_AFTER_ACCEPT = 'cancel_after_accept';

    public const REASON_COMPLETED_CLEAN = 'event_completed_clean';

    public const REASON_STALE_AVAILABILITY = 'stale_availability_conflict';

    public const REASON_MANUAL = 'manual_adjustment';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'delta' => 'integer',
            'score_before' => 'integer',
            'score_after' => 'integer',
            'counts_as_sample' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Partner, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * @return BelongsTo<EventProviderRequest, $this>
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(EventProviderRequest::class, 'event_provider_request_id');
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
