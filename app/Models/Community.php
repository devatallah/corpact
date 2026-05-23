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
    'name',
    'description',
    'icon',
    'color',
    'company_id',
    'sport_id',
    'leader_id',
    'member_count',
    'balance',
    'status',
])]
class Community extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'member_count' => 'integer',
            'balance' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<Sport, $this>
     */
    public function sport(): BelongsTo
    {
        return $this->belongsTo(Sport::class);
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'leader_id');
    }

    /**
     * @return BelongsToMany<Employee, $this>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'community_member')
            ->using(CommunityMember::class)
            ->withPivot(['role', 'joined_at']);
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * @return HasMany<CommunityAnnouncement, $this>
     */
    public function announcements(): HasMany
    {
        return $this->hasMany(CommunityAnnouncement::class);
    }

    /**
     * @return HasMany<CommunityPoll, $this>
     */
    public function polls(): HasMany
    {
        return $this->hasMany(CommunityPoll::class);
    }

    /**
     * @return HasMany<League, $this>
     */
    public function leagues(): HasMany
    {
        return $this->hasMany(League::class);
    }

    /**
     * @return HasMany<WalletTransaction, $this>
     */
    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * @return HasMany<QuickMatch, $this>
     */
    public function quickMatches(): HasMany
    {
        return $this->hasMany(QuickMatch::class);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
