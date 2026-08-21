<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Member discussion exists ONLY under events (H §6 — no general chat, no
 * DMs). Text only. The author may edit or delete within 15 minutes; a
 * report button routes the comment to the account manager. Soft deleted so
 * reported content stays inspectable.
 */
#[Fillable(['event_id', 'employee_id', 'body', 'edited_at'])]
class EventComment extends Model
{
    use HasFactory, SoftDeletes;

    /** H §6: author edit/delete window in minutes. */
    public const EDIT_WINDOW_MINUTES = 15;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'edited_at' => 'datetime',
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
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * The author's 15-minute edit/delete window (H §6).
     */
    public function isModifiableBy(Employee $employee): bool
    {
        return $this->employee_id === $employee->id
            && $this->created_at !== null
            && $this->created_at->gt(now()->subMinutes(self::EDIT_WINDOW_MINUTES));
    }
}
