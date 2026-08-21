<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * H §6: an announcement is text + link only (no images, no attachments),
 * posted by a leader or coordinator only. The author may edit or delete it
 * within 15 minutes.
 */
#[Fillable(['community_id', 'employee_id', 'body', 'link_url', 'edited_at'])]
class CommunityAnnouncement extends Model
{
    use HasFactory;

    /** Author edit/delete window in minutes. */
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
     * @return BelongsTo<Community, $this>
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * The author's 15-minute edit/delete window.
     */
    public function isModifiableBy(Employee $employee): bool
    {
        return $this->employee_id === $employee->id
            && $this->created_at !== null
            && $this->created_at->gt(now()->subMinutes(self::EDIT_WINDOW_MINUTES));
    }
}
