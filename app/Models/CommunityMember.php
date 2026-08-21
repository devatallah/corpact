<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Membership is a state machine, never a deletable row (H §6): joining,
 * leaving and rejoining are recorded as statuses with dates; `removed`
 * documents a leader removal (reason required); `banned` blocks rejoining
 * and is an account-manager-only state.
 */
class CommunityMember extends Pivot
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_LEFT = 'left';

    public const STATUS_REMOVED = 'removed';

    public const STATUS_BANNED = 'banned';

    protected $table = 'community_member';

    public $incrementing = true;

    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'left_at' => 'datetime',
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
}
