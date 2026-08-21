<?php

namespace App\Models;

use App\Models\Concerns\AppendOnly;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * H §19 — «جدول `audit_logs` للكتابة فقط — لا تعديل ولا حذف. الحقول: الفاعل،
 * دوره، النطاق، الإجراء، الكيان، القيمة قبل وبعد، IP، المتصفح، الوقت».
 *
 * «يراه أدمن تيمات كاملاً، ويرى مسؤول الحساب ملخصاً محدوداً لشركته فقط» —
 * the AM path always goes through {@see scopeForCompany}.
 */
#[Fillable([
    'actor_user_id',
    'actor_name',
    'actor_role',
    'actor_guard',
    'scope_type',
    'scope_id',
    'company_id',
    'action',
    'entity_type',
    'entity_id',
    'before_values',
    'after_values',
    'reason',
    'ip_address',
    'user_agent',
    'is_financial',
])]
class AuditLog extends Model
{
    use AppendOnly, HasFactory;

    /** Append-only: there is no `updated_at` to write. */
    public const UPDATED_AT = null;

    protected static function appendOnlyMessage(): string
    {
        return 'سجل التدقيق للكتابة فقط — لا تعديل ولا حذف.';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'before_values' => 'array',
            'after_values' => 'array',
            'is_financial' => 'boolean',
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
     * @return MorphTo<Model, $this>
     */
    public function entity(): MorphTo
    {
        return $this->morphTo('entity');
    }

    /**
     * The account manager's «ملخص محدود لشركته فقط»: rows of that company
     * only — never platform-wide rows, never another company's.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForCompany(Builder $query, int $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }
}
