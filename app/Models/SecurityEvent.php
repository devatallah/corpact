<?php

namespace App\Models;

use App\Models\Concerns\AppendOnly;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * H §19 — «سجل أحداث أمنية منفصل (دخول فاشل، تغيير صلاحية، تغيير بيانات
 * بنكية)». Separate from `audit_logs` on purpose: a failed login has no
 * actor and no entity, and the security feed must stay readable when the
 * audit log is thousands of rows of routine approvals.
 */
#[Fillable([
    'event',
    'severity',
    'actor_user_id',
    'actor_name',
    'actor_identifier',
    'guard',
    'subject_type',
    'subject_id',
    'company_id',
    'ip_address',
    'user_agent',
    'context',
])]
class SecurityEvent extends Model
{
    use AppendOnly, HasFactory;

    public const UPDATED_AT = null;

    // Event keys.
    public const LOGIN_FAILED = 'login.failed';

    public const LOGIN_LOCKOUT = 'login.lockout';

    public const OTP_FAILED = 'otp.failed';

    public const PERMISSION_CHANGED = 'permission.changed';

    public const BANK_ACCOUNT_CHANGED = 'bank_account.changed';

    public const BANK_ACCOUNT_APPROVED = 'bank_account.approved';

    public const CROSS_COMPANY_PROBE = 'cross_company.probe';

    public const ACCOUNT_DEACTIVATED = 'account.deactivated';

    public const SESSIONS_REVOKED = 'sessions.revoked';

    public const SECRET_SENSITIVE = 'secret.sensitive_action';

    public const FINANCIAL_FILE_ACCESSED = 'file.financial_accessed';

    public const SELF_APPROVAL_BLOCKED = 'financial.self_approval_blocked';

    public const SEVERITY_INFO = 'info';

    public const SEVERITY_WARNING = 'warning';

    public const SEVERITY_CRITICAL = 'critical';

    protected static function appendOnlyMessage(): string
    {
        return 'سجل الأحداث الأمنية للكتابة فقط — لا تعديل ولا حذف (H §19).';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'context' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return array<string, string>
     */
    public static function labels(): array
    {
        return [
            self::LOGIN_FAILED => 'محاولة دخول فاشلة',
            self::LOGIN_LOCKOUT => 'قفل بعد محاولات فاشلة',
            self::OTP_FAILED => 'رمز دخول خاطئ',
            self::PERMISSION_CHANGED => 'تغيير صلاحية أو دور',
            self::BANK_ACCOUNT_CHANGED => 'تغيير بيانات بنكية',
            self::BANK_ACCOUNT_APPROVED => 'اعتماد حساب بنكي',
            self::CROSS_COMPANY_PROBE => 'محاولة وصول إلى شركة أخرى',
            self::ACCOUNT_DEACTIVATED => 'تعطيل حساب',
            self::SESSIONS_REVOKED => 'إلغاء كل الجلسات',
            self::SECRET_SENSITIVE => 'إجراء يمس الأسرار',
            self::FINANCIAL_FILE_ACCESSED => 'الوصول إلى ملف مالي',
            self::SELF_APPROVAL_BLOCKED => 'منع اعتماد ذاتي',
        ];
    }

    public static function label(string $event): string
    {
        return self::labels()[$event] ?? $event;
    }
}
