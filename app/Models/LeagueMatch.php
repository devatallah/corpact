<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeagueMatch extends Model
{
    protected $fillable = [
        'league_id',
        'department_a_id',
        'department_b_id',
        'score_a',
        'score_b',
        'penalty_a',
        'penalty_b',
        'round',
        'match_number',
        'round_label',
        'is_third_place',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_third_place' => 'boolean',
        ];
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function departmentA(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_a_id');
    }

    public function departmentB(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_b_id');
    }
}
