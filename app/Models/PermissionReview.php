<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * H §19 / G (أدمن تيمات §7): «مراجعة صلاحيات ربع سنوية موثَّقة» — one row per
 * quarter, naming who reviewed, when, how many assignments and what they
 * concluded.
 */
#[Fillable([
    'period',
    'reviewed_by_user_id',
    'reviewed_by_name',
    'assignments_reviewed',
    'notes',
    'reviewed_at',
])]
class PermissionReview extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'assignments_reviewed' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
