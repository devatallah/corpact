<?php

namespace App\Models;

use App\Enums\PartnerRole;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\URL;

#[Fillable([
    'name',
    'trade_name',
    'cr_number',
    'vat_number',
    'email',
    'password',
    'user_id',
    'city',
    'district',
    'contact_phone',
    'contact_name',
    'contact_title',
    'working_hours',
    'venues_count',
    'rating',
    'reliability_score',
    'reliability_samples',
    'total_bookings',
    'commission_rate',
    'bank_account_holder',
    'bank_iban',
    'bank_status',
    'bank_approved_at',
    'bank_approved_by',
    'has_price_contract',
    'notes',
    'status',
    'role',
    'parent_id',
    'approved_at',
    'activation_token',
    'activation_token_expires_at',
])]
// رقم مؤشر الموثوقية لا يُعرض للمزوّد في الإصدار الأول (H §11) — مخفي من
// السيريالايز الافتراضي (auth المشترك يمرّر النموذج كاملاً)؛ لوحات الأدمن
// تكشفه صراحة بـ makeVisible.
#[Hidden(['password', 'remember_token', 'reliability_score', 'reliability_samples'])]
class Partner extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    public function sendPasswordResetNotification($token): void
    {
        $url = url('/partner/reset-password/'.$token.'?email='.urlencode($this->email));
        $this->notify(new ResetPasswordNotification($url));
    }

    public function sendEmailVerificationNotification(): void
    {
        $url = URL::temporarySignedRoute(
            'partner.verification.verify',
            now()->addMinutes(60),
            ['id' => $this->getKey(), 'hash' => sha1($this->getEmailForVerification())]
        );
        $this->notify(new VerifyEmailNotification($url));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'rating' => 'decimal:1',
            'reliability_score' => 'integer',
            'reliability_samples' => 'integer',
            'total_bookings' => 'integer',
            'commission_rate' => 'decimal:2',
            'bank_approved_at' => 'datetime',
            'has_price_contract' => 'boolean',
            'role' => PartnerRole::class,
            'approved_at' => 'datetime',
            'activation_token_expires_at' => 'datetime',
        ];
    }

    /**
     * The global account behind this provider login.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent partner (for staff accounts like receptionists).
     *
     * @return BelongsTo<Partner, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'parent_id');
    }

    /**
     * Get the staff members belonging to this partner.
     *
     * @return HasMany<Partner, $this>
     */
    public function staff(): HasMany
    {
        return $this->hasMany(Partner::class, 'parent_id');
    }

    /**
     * Get the actual partner entity (self for owners, parent for staff).
     */
    public function resolvedPartner(): self
    {
        return $this->parent_id ? $this->parent : $this;
    }

    /**
     * Get the partner ID to use for data queries (resolves to parent for staff).
     */
    public function resolvedPartnerId(): int
    {
        return $this->parent_id ?? $this->id;
    }

    /**
     * Check if this partner account is an owner.
     */
    public function isOwner(): bool
    {
        return $this->role === PartnerRole::Owner;
    }

    /**
     * Check if this partner account is a receptionist.
     */
    public function isReceptionist(): bool
    {
        return $this->role === PartnerRole::Receptionist;
    }

    /**
     * Check if this partner account is an accountant.
     */
    public function isAccountant(): bool
    {
        return $this->role === PartnerRole::Accountant;
    }

    /**
     * Check if this partner account has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->role->can($permission);
    }

    /**
     * Check if this partner user has one of the given roles.
     */
    public function hasRole(PartnerRole ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    /**
     * @return BelongsToMany<Sport, $this>
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'partner_category');
    }

    /**
     * @return HasMany<Venue, $this>
     */
    public function venues(): HasMany
    {
        return $this->hasMany(Venue::class);
    }

    /**
     * فروع المزوّد — التسلسل: مزوّد ← فروع ← وحدات نشاط ← توفر (H §11).
     *
     * @return HasMany<ProviderBranch, $this>
     */
    public function branches(): HasMany
    {
        return $this->hasMany(ProviderBranch::class);
    }

    /**
     * @return HasMany<EventProviderRequest, $this>
     */
    public function providerRequests(): HasMany
    {
        return $this->hasMany(EventProviderRequest::class);
    }

    /**
     * @return HasMany<ProviderReliabilityLog, $this>
     */
    public function reliabilityLogs(): HasMany
    {
        return $this->hasMany(ProviderReliabilityLog::class);
    }

    /**
     * الحساب البنكي المعتمد شرط لأي صرف — A11 يستهلك هذا العلم (H §11).
     */
    public function payoutsBlocked(): bool
    {
        return $this->bank_status !== 'approved';
    }

    /**
     * هل تبنّى هذا المزوّد التسلسل الجديد (فروع + وحدات)؟ شركاء الاختبارات
     * القدامى بلا فروع يتخطون قواعد التوفر حتى يكتمل ترحيلهم.
     */
    public function hasHierarchy(): bool
    {
        return $this->branches()->exists();
    }

    /**
     * المؤشر لا يُعرض لأي مستخدم قبل 10 عينات (H §11).
     */
    public function reliabilityVisible(): bool
    {
        return $this->reliability_samples >= 10;
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * كشوف التسوية كل 15 يوماً (H §12.7).
     *
     * @return HasMany<SettlementStatement, $this>
     */
    public function settlementStatements(): HasMany
    {
        return $this->hasMany(SettlementStatement::class);
    }

    /**
     * @return HasMany<SettlementItem, $this>
     */
    public function settlementItems(): HasMany
    {
        return $this->hasMany(SettlementItem::class);
    }

    /**
     * نسب العمولة المجدولة بتاريخ سريان مستقبلي (H §12.10).
     *
     * @return HasMany<ProviderCommissionRate, $this>
     */
    public function commissionRates(): HasMany
    {
        return $this->hasMany(ProviderCommissionRate::class);
    }

    /**
     * @return MorphMany<Notification, $this>
     */
    public function notifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
