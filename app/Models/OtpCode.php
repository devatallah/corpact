<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One issued login code (H §4 / ملحق أ): 6 digits, 5-minute validity,
 * max 3 sends per hour per phone, 5 wrong entries → 15-minute lock.
 * Codes are stored hashed; `delivered_at` is the hook the 60-second
 * SMS-fallback job keys off (A14 provides the real channels).
 */
#[Fillable([
    'phone',
    'purpose',
    'user_id',
    'code_hash',
    'expires_at',
    'attempts',
    'locked_until',
    'consumed_at',
    'delivered_at',
    'fallback_sent_at',
    'channel',
])]
class OtpCode extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'locked_until' => 'datetime',
            'consumed_at' => 'datetime',
            'delivered_at' => 'datetime',
            'fallback_sent_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }
}
