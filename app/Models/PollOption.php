<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['poll_id', 'label', 'sort_order'])]
class PollOption extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<CommunityPoll, $this>
     */
    public function poll(): BelongsTo
    {
        return $this->belongsTo(CommunityPoll::class, 'poll_id');
    }

    /**
     * @return HasMany<PollVote, $this>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(PollVote::class, 'option_id');
    }
}
