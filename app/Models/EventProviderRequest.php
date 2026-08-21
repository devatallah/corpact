<?php

namespace App\Models;

use App\Support\Money;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * طلب الحجز المرسل للمزوّد — قناة القرار (H §11). القرار في لوحة المزوّد
 * حصراً: قبول / رفض / اقتراح وقت بديل. أول رد يثبّت الحالة، وأي رد لاحق
 * يُرفض برسالة «تم اتخاذ القرار مسبقاً» ويُسجَّل. واتساب والبريد إشعار فقط
 * برابط موقّع صالح 72 ساعة وأحادي الاستخدام — قبول نصي لا يُلزم أحداً.
 */
#[Fillable([
    'event_id',
    'partner_id',
    'activity_unit_id',
    'requested_date',
    'start_time',
    'duration_minutes',
    'quantity',
    'pricing_type',
    'frozen_participants_count',
    'total_amount',
    'total_amount_halalas',
    'status',
    'sent_at',
    'deadline_at',
    'responded_at',
    'responded_by',
    'late_response',
    'rejection_reason',
    'cancellation_reason',
    'link_token_hash',
    'link_expires_at',
    'link_used_at',
])]
class EventProviderRequest extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $appends = ['total_amount'];

    public const STATUS_PENDING = 'pending';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_ALTERNATIVE = 'alternative_proposed';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_CANCELLED = 'cancelled';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'requested_date' => 'date:Y-m-d',
            'duration_minutes' => 'integer',
            'quantity' => 'integer',
            'frozen_participants_count' => 'integer',
            'total_amount_halalas' => 'integer',
            'sent_at' => 'datetime',
            'deadline_at' => 'datetime',
            'responded_at' => 'datetime',
            'late_response' => 'boolean',
            'link_expires_at' => 'datetime',
            'link_used_at' => 'datetime',
        ];
    }

    /**
     * لقطة الإجمالي هللات صحيحة (A10)؛ الاسم القديم جسر عرض/إدخال بالريال.
     */
    public function getTotalAmountAttribute(): ?string
    {
        return $this->total_amount_halalas === null
            ? null
            : Money::format((int) $this->total_amount_halalas);
    }

    public function setTotalAmountAttribute(mixed $value): void
    {
        $this->attributes['total_amount_halalas'] = $value === null ? null : Money::toHalalas($value);
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @return BelongsTo<Partner, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * @return BelongsTo<ActivityUnit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(ActivityUnit::class, 'activity_unit_id');
    }

    /**
     * حساب اللوحة الذي اتخذ القرار (أثر رقمي مرتبط بحساب الفرع).
     *
     * @return BelongsTo<Partner, $this>
     */
    public function responder(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'responded_by');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isDecided(): bool
    {
        return $this->responded_at !== null || $this->status !== self::STATUS_PENDING;
    }

    /**
     * وقت بدء الفتحة المطلوبة.
     */
    public function slotStartsAt(): Carbon
    {
        return Carbon::parse($this->requested_date->format('Y-m-d').' '.$this->start_time);
    }

    public function slotEndsAt(): Carbon
    {
        return $this->slotStartsAt()->addMinutes($this->duration_minutes);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }
}
