<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'community_id',
    'created_by',
    'message',
    'source',
    'status',
])]
class QuickMatch extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<Community, $this>
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }

    /**
     * @return HasMany<QuickMatchOption, $this>
     */
    public function options(): HasMany
    {
        return $this->hasMany(QuickMatchOption::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<QuickMatchVote, $this>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(QuickMatchVote::class);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }
}
