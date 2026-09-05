<?php

namespace App\Models;

use App\Services\Employee\EventCreationService;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A17 — التخفيض الذي يمنحه المزوّد لمجتمع بعينه.
 *
 * يُطبَّق على **إجمالي الحجز قبل الدعم**، فيقلّ ما تدفعه محفظة المجتمع وما
 * يتبقّى على اللاعبين معاً. ترتيب الحساب مثبَّت في
 * {@see EventCreationService::costsFromTotal()}.
 *
 * الصفوف المختومة بـ `archived_at` (ختم A10) خامدة أبداً: قراءةً فقط، لا
 * تدخل أي حساب ولا تظهر في أي قائمة.
 */
#[Fillable([
    'partner_id',
    'company_id',
    'community_id',
    'name',
    'type',
    'value',
    'value_halalas',
    'usage',
    'starts_at',
    'expires_at',
    'start_time',
    'end_time',
    'status',
])]
class Discount extends Model
{
    use HasFactory;

    public const TYPE_FIXED = 'fixed';

    public const TYPE_PERCENTAGE = 'percentage';

    public const USAGE_ONE_TIME = 'one_time';

    public const USAGE_DATE_RANGE = 'date_range';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'value_halalas' => 'integer',
            'starts_at' => 'date',
            'expires_at' => 'date',
            'archived_at' => 'datetime',
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
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<Community, $this>
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * تخفيض «مرة واحدة» استُهلك بفعالية سابقة.
     */
    public function isUsed(): bool
    {
        return $this->usage === self::USAGE_ONE_TIME && $this->events()->exists();
    }

    public function usedCount(): int
    {
        return $this->events()->count();
    }

    /**
     * مبلغ التخفيض على إجمالي بالهللة — لا يتجاوز الإجمالي أبداً.
     */
    public function amountFor(int $totalHalalas): int
    {
        if ($totalHalalas <= 0) {
            return 0;
        }

        $amount = $this->type === self::TYPE_PERCENTAGE
            ? intdiv($totalHalalas * (int) min(100, max(0, (float) $this->value)), 100)
            : (int) $this->value_halalas;

        return max(0, min($amount, $totalHalalas));
    }

    /**
     * ما هو حيّ الآن: غير مؤرشف، وحالته `active`.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive($query)
    {
        return $query->whereNull('archived_at')->where('status', 'active');
    }

    /**
     * ما ينطبق على حجز بعينه: نافذة التاريخ ونافذة الساعة، وأن يكون
     * تخفيض «مرة واحدة» لم يُستهلك بعد.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeApplicableOn($query, string $date, string $time)
    {
        return $query->active()
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhereDate('starts_at', '<=', $date))
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhereDate('expires_at', '>=', $date))
            ->where(fn ($q) => $q->whereNull('start_time')->orWhere('start_time', '<=', $time))
            ->where(fn ($q) => $q->whereNull('end_time')->orWhere('end_time', '>', $time))
            ->where(fn ($q) => $q->where('usage', '!=', self::USAGE_ONE_TIME)->orWhereDoesntHave('events'));
    }
}
