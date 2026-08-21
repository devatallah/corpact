<?php

namespace App\Models;

use App\Enums\WalletTransactionType;
use App\Exceptions\ImmutableLedgerException;
use App\Services\Wallet\LedgerService;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * قيد في دفتر الحركات (H §12.5) — append-only.
 *
 * كل حركة تحمل: المحفظة، النوع، المبلغ بالهللة، الاتجاه، المرجع
 * (polymorphic)، الفاعل، مفتاح التفرّد، والوقت. لا تعديل ولا حذف أبداً —
 * التصحيح بحركة عكسية مرتبطة عبر `related_transaction_id`. الحراسة هنا في
 * النموذج، وتساندها triggers في قاعدة البيانات ضد الاستعلامات الخام.
 *
 * الكتابة حصراً عبر {@see LedgerService} كي يتحدث
 * رصيد الـ cache في نفس المعاملة.
 */
#[Fillable([
    'wallet_id',
    'type',
    'amount_halalas',
    'direction',
    'reference_type',
    'reference_id',
    'actor_user_id',
    'related_transaction_id',
    'idempotency_key',
    'note',
    'occurred_at',
])]
class WalletTransaction extends Model
{
    use HasFactory;

    public const DIRECTION_CREDIT = 'credit';

    public const DIRECTION_DEBIT = 'debit';

    protected static function booted(): void
    {
        static::updating(function (): never {
            throw new ImmutableLedgerException;
        });

        static::deleting(function (): never {
            throw new ImmutableLedgerException;
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => WalletTransactionType::class,
            'amount_halalas' => 'integer',
            'occurred_at' => 'datetime',
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
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    /**
     * الحركة المرتبطة: الأصل المعكوس لقيد العكس، أو الساق المقابلة لزوج تخصيص.
     *
     * @return BelongsTo<WalletTransaction, $this>
     */
    public function related(): BelongsTo
    {
        return $this->belongsTo(self::class, 'related_transaction_id');
    }

    /**
     * القيمة الموقَّعة بالهللة (credit موجب، debit سالب).
     */
    public function signedAmountHalalas(): int
    {
        return $this->direction === self::DIRECTION_CREDIT
            ? $this->amount_halalas
            : -$this->amount_halalas;
    }
}
