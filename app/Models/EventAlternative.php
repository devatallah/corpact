<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'event_id',
    'proposed_date',
    'proposed_start_time',
    'proposed_end_time',
    'proposed_venues_count',
    'proposed_amount',
    'notes',
    'status',
])]
class EventAlternative extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'proposed_date' => 'date:Y-m-d',
            'proposed_venues_count' => 'integer',
            'proposed_amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeProposed($query)
    {
        return $query->where('status', 'proposed');
    }
}
