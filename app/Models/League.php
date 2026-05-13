<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class League extends Model
{
    use HasFactory;

    protected $fillable = [
        'community_id',
        'created_by',
        'name',
        'format',
        'status',
    ];

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }

    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(Department::class, 'league_departments')
            ->withPivot('seed_order');
    }

    public function matches(): HasMany
    {
        return $this->hasMany(LeagueMatch::class);
    }

    public function isKnockout(): bool
    {
        return $this->format === 'knockout';
    }

    public function isRoundRobin(): bool
    {
        return in_array($this->format, ['single_round_robin', 'double_round_robin']);
    }
}
