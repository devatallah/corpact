<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'community_id',
    'company_id',
    'club_id',
    'court_pricing_id',
    'sport_id',
    'created_by',
    'title',
    'event_date',
    'start_time',
    'duration_minutes',
    'courts_count',
    'total_amount',
    'capacity',
    'participants_count',
    'cost_per_person',
    'company_subsidy',
    'community_contribution',
    'player_payment',
    'notes',
    'rejection_reason',
    'status',
])]
class Event extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_date' => 'date:Y-m-d',
            'duration_minutes' => 'integer',
            'courts_count' => 'integer',
            'total_amount' => 'decimal:2',
            'capacity' => 'integer',
            'participants_count' => 'integer',
            'cost_per_person' => 'decimal:2',
            'company_subsidy' => 'decimal:2',
            'community_contribution' => 'decimal:2',
            'player_payment' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Community, $this>
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<Club, $this>
     */
    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    /**
     * @return BelongsTo<CourtPricing, $this>
     */
    public function courtPricing(): BelongsTo
    {
        return $this->belongsTo(CourtPricing::class);
    }

    /**
     * @return BelongsTo<Sport, $this>
     */
    public function sport(): BelongsTo
    {
        return $this->belongsTo(Sport::class);
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }

    /**
     * @return BelongsToMany<Employee, $this>
     */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'event_participants')
            ->using(EventParticipant::class)
            ->withPivot(['status', 'joined_at']);
    }

    /**
     * @return BelongsToMany<Court, $this>
     */
    public function courts(): BelongsToMany
    {
        return $this->belongsToMany(Court::class, 'event_court');
    }

    /**
     * @return HasMany<EventAlternative, $this>
     */
    public function alternatives(): HasMany
    {
        return $this->hasMany(EventAlternative::class);
    }

    /**
     * @return HasMany<WalletTransaction, $this>
     */
    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * @return HasMany<PlatformRevenue, $this>
     */
    public function platformRevenues(): HasMany
    {
        return $this->hasMany(PlatformRevenue::class);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['open', 'waiting_club']);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now()->toDateString());
    }

    /**
     * Get the total courts booked by overlapping events at a given club/date/time.
     */
    public static function overlappingCourtsCount(int $clubId, string $date, string $startTime, int $durationMinutes, ?int $excludeEventId = null): int
    {
        $newStart = Carbon::parse($startTime);
        $newEnd = $newStart->copy()->addMinutes($durationMinutes);

        return (int) static::where('club_id', $clubId)
            ->where('event_date', $date)
            ->where('status', 'confirmed')
            ->where('event_date', '>=', now()->toDateString())
            ->when($excludeEventId, fn ($q) => $q->where('id', '!=', $excludeEventId))
            ->get(['id', 'start_time', 'duration_minutes', 'courts_count'])
            ->filter(function ($event) use ($newStart, $newEnd) {
                $existingStart = Carbon::parse($event->start_time);
                $existingEnd = $existingStart->copy()->addMinutes($event->duration_minutes);

                return $newStart->lt($existingEnd) && $newEnd->gt($existingStart);
            })
            ->sum('courts_count');
    }
}
