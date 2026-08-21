<?php

namespace App\Models;

use App\Contracts\FinancialAction;
use App\Enums\TopupRequestStatus;
use App\Models\Concerns\ScopedToCompany;
use App\Support\Authorization\SelfApprovalGuard;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * طلب شحن المحفظة بتحويل بنكي (H §12.5).
 *
 * مسؤول الحساب يرفع: المبلغ، تاريخ التحويل، آخر 4 أرقام من حساب المُرسِل،
 * مرجع العملية، وصورة الإشعار (قرص خاص). الحالات:
 * submitted ← under_review ← approved أو rejected. قيد فريد على
 * (مرجع العملية + المبلغ). يعتمده الأدمن المالي، ولا يعتمد أحد طلباً أنشأه
 * بنفسه ({@see SelfApprovalGuard}). الاعتماد ينشئ
 * حركة `top_up` في الدفتر؛ وإلغاء اعتماد سابق حركة عكسية مرتبطة بسبب مسجَّل.
 */
#[Fillable([
    'company_id',
    'wallet_id',
    'amount_halalas',
    'transfer_date',
    'sender_account_last4',
    'bank_reference',
    'receipt_path',
    'status',
    'created_by_user_id',
])]
class WalletTopupRequest extends Model implements FinancialAction
{
    use HasFactory, ScopedToCompany;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => TopupRequestStatus::class,
            'amount_halalas' => 'integer',
            'transfer_date' => 'date',
            'reviewed_at' => 'datetime',
            'unapproved_at' => 'datetime',
        ];
    }

    public function createdByUserId(): ?int
    {
        return $this->created_by_user_id;
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<Wallet, $this>
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    /**
     * @return BelongsTo<WalletTransaction, $this>
     */
    public function approvalTransaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'approval_transaction_id');
    }

    /**
     * @return BelongsTo<WalletTransaction, $this>
     */
    public function reversalTransaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'reversal_transaction_id');
    }

    /**
     * المبلغ بالريال للعرض.
     */
    public function getAmountAttribute(): float
    {
        return $this->amount_halalas / 100;
    }
}
