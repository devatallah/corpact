<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use App\Support\FileUrl;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\URL;

#[Fillable([
    'name',
    'commercial_registration',
    'vat_number',
    'logo',
    'timezone',
    'contract_fee_per_activated_employee',
    'contract_monthly_minimum',
    'contract_coordinator_service',
    'event_creation_blocked_at',
    'event_creation_block_reason',
    'email',
    'password',
    'contact_name',
    'contact_phone',
    'contact_title',
    'support_agent_user_id',
    'domain',
    'sector',
    'employee_count',
    'employee_count_range',
    'city',
    'notes',
    'status',
    'approved_at',
    'activation_token',
    'activation_token_expires_at',
    'requester_name',
    'requester_email',
    'requester_phone',
])]
// `activation_token` هو مفتاح تفعيل الحساب — من قرأه فعّل الشركة باسمها.
// إخفاؤه دفاع في العمق: لا يُسلسَل مع الصف مهما شُحن النموذج لواجهة (الاستعلام
// بالعمود في مسار التفعيل لا يتأثر بـ `$hidden`).
#[Hidden(['password', 'remember_token', 'activation_token'])]
class Company extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    /**
     * وكيل الدعم المتابِع لهذه الشركة.
     *
     * حقل تنظيمي لا صلاحية: يقول من يتابعها، ولا يمنح ولا يمنع. وكيل الدعم
     * يبحث في كل الشركات كما كان — هذا يجيب «من أتواصل معه» لا «من يستطيع».
     */
    public function supportAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'support_agent_user_id');
    }

    public function sendPasswordResetNotification($token): void
    {
        $url = url('/company/reset-password/'.$token.'?email='.urlencode($this->email));
        $this->notify(new ResetPasswordNotification($url));
    }

    public function sendEmailVerificationNotification(): void
    {
        $url = URL::temporarySignedRoute(
            'company.verification.verify',
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
            'employee_count' => 'integer',
            'approved_at' => 'datetime',
            'activation_token_expires_at' => 'datetime',
            // العقد — مبالغ بالهللة (H §21)، قيمها من المالك لذا nullable.
            'contract_fee_per_activated_employee' => 'integer',
            'contract_monthly_minimum' => 'integer',
            'contract_coordinator_service' => 'boolean',
            // A11 — H §12.8: علم تأخر السداد. أثره الوحيد حجب **إنشاء**
            // الفعاليات الجديدة؛ لا يمس الدخول ولا الفعاليات المؤكدة.
            'event_creation_blocked_at' => 'datetime',
        ];
    }

    /**
     * H §12.8: «إيقاف إنشاء فعاليات جديدة بعد 30 يوماً» من الاستحقاق — ولا
     * شيء غير ذلك: لا إيقاف دخول موظف ولا إلغاء فعالية مؤكدة.
     */
    public function eventCreationBlocked(): bool
    {
        return $this->event_creation_blocked_at !== null;
    }

    /**
     * Logos live on the private default disk; reads resolve to a temporary
     * signed URL (15 min) — same policy as employee avatars.
     */
    protected function logo(): Attribute
    {
        return Attribute::get(
            fn (?string $value) => FileUrl::temporary($value),
        );
    }

    /**
     * @return HasOne<CompanySetting, $this>
     */
    public function settings(): HasOne
    {
        return $this->hasOne(CompanySetting::class);
    }

    /**
     * The settings row with the spec defaults (H §5) — created on first
     * access for companies that predate the settings table.
     */
    public function getSettings(): CompanySetting
    {
        $settings = $this->settings()->withoutGlobalScopes()->firstOrCreate(['company_id' => $this->id]);

        // A freshly created row only has the attributes we passed — refresh
        // so the schema defaults (H §5) are visible to the caller.
        return $settings->wasRecentlyCreated ? $settings->refresh() : $settings;
    }

    /**
     * @return HasMany<Department, $this>
     */
    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    /**
     * @return HasMany<Employee, $this>
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * @return HasMany<Community, $this>
     */
    public function communities(): HasMany
    {
        return $this->hasMany(Community::class);
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * @return HasOne<Wallet, $this>
     */
    public function wallet(): HasOne
    {
        // المحفظة الرئيسية فقط — محافظ المجتمعات الفرعية تحمل نفس company_id
        // لكن مالكها Community (H §12.5).
        return $this->hasOne(Wallet::class)
            ->where('owner_type', self::class);
    }

    /**
     * فواتير رسوم النظام الشهرية (H §12.8). التسويات ليست علاقة شركة —
     * الكشف لكل **مزوّد** لا لكل (مزوّد + شركة) كما كان النموذج المؤرشف.
     *
     * @return HasMany<PlatformFeeInvoice, $this>
     */
    public function platformFeeInvoices(): HasMany
    {
        return $this->hasMany(PlatformFeeInvoice::class);
    }

    /**
     * شروط العقد المجدولة بتاريخ سريان مستقبلي (H §12.10).
     *
     * @return HasMany<CompanyContractTerm, $this>
     */
    public function contractTerms(): HasMany
    {
        return $this->hasMany(CompanyContractTerm::class);
    }

    /**
     * @return HasMany<Invitation, $this>
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    /**
     * @return HasMany<ActivityLog, $this>
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
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
