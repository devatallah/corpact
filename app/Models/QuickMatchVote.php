<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'quick_match_id',
    'option_id',
    'employee_id',
])]
class QuickMatchVote extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<QuickMatch, $this>
     */
    public function quickMatch(): BelongsTo
    {
        return $this->belongsTo(QuickMatch::class);
    }

    /**
     * @return BelongsTo<QuickMatchOption, $this>
     */
    public function option(): BelongsTo
    {
        return $this->belongsTo(QuickMatchOption::class, 'option_id');
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
