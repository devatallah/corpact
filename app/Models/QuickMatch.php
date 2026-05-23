<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'community_id',
    'created_by',
    'preferred_date',
    'preferred_time',
    'message',
    'source',
    'status',
])]
class QuickMatch extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'preferred_date' => 'date:Y-m-d',
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
     * @return BelongsTo<Employee, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }

    /**
     * @return HasMany<QuickMatchInterest, $this>
     */
    public function interests(): HasMany
    {
        return $this->hasMany(QuickMatchInterest::class);
    }

    /**
     * @return BelongsToMany<Employee, $this>
     */
    public function interestedEmployees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'quick_match_interests')
            ->withTimestamps();
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
