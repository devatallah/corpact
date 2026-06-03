<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'quick_match_id',
    'date',
    'time',
    'votes_count',
    'sort_order',
])]
class QuickMatchOption extends Model
{
    use HasFactory;

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
     * @return BelongsTo<QuickMatch, $this>
     */
    public function quickMatch(): BelongsTo
    {
        return $this->belongsTo(QuickMatch::class);
    }

    /**
     * @return HasMany<QuickMatchVote, $this>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(QuickMatchVote::class, 'option_id');
    }
}
