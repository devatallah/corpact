<?php

namespace App\Models;

use App\Services\Wallet\LedgerService;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * حجز مبلغ في محفظة (H §12.5) — الأساس الذي يبني عليه A10 تدفق التحصيل.
 *
 * الحجز قيد `hold` (سحب) في الدفتر يخفض الرصيد المتاح فوراً؛ فكّه قيد
 * `hold_release` (إيداع) يعيده؛ والاستقطاع قيد `hold_release` + `capture`
 * فيبقى ثابت الدفتر: الرصيد = Σ الحركات دائماً.
 *
 * يُدار حصراً عبر {@see LedgerService}.
 */
#[Fillable([
    'wallet_id',
    'amount_halalas',
    'captured_amount_halalas',
    'status',
    'reference_type',
    'reference_id',
    'actor_user_id',
    'hold_transaction_id',
    'idempotency_key',
    'note',
    'released_at',
    'captured_at',
])]
class WalletHold extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_RELEASED = 'released';

    public const STATUS_CAPTURED = 'captured';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_halalas' => 'integer',
            'captured_amount_halalas' => 'integer',
            'released_at' => 'datetime',
            'captured_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Wallet, $this>
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<WalletTransaction, $this>
     */
    public function holdTransaction(): BelongsTo
    {
        return $this->belongsTo(WalletTransaction::class, 'hold_transaction_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
