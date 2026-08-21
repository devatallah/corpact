<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use App\Services\Wallet\LedgerService;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * محفظة (H §12.5): رئيسية لكل شركة (owner = Company) وفرعية لكل مجتمع
 * (owner = Community) تُموَّل بتخصيص من الرئيسية.
 *
 * `balance_halalas` عمود cache فقط — ليس fillable ولا يُكتب إلا داخل
 * {@see LedgerService} في نفس معاملة قاعدة البيانات مع
 * قيد الدفتر، وتطابقه مهمة `app:reconcile-balances` ليلياً مع Σ الدفتر.
 * الرصيد الحقيقي = مجموع الحركات.
 */
#[Fillable(['company_id', 'owner_type', 'owner_id'])]
class Wallet extends Model
{
    use HasFactory, ScopedToCompany;

    /**
     * الرصيد بالريال للعرض — كان عموداً؛ يبقى في التسلسل عبر accessor.
     *
     * @var list<string>
     */
    protected $appends = ['balance'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'balance_halalas' => 'integer',
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
     * @return MorphTo<Model, $this>
     */
    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return HasMany<WalletTransaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * @return HasMany<WalletHold, $this>
     */
    public function holds(): HasMany
    {
        return $this->hasMany(WalletHold::class);
    }

    /**
     * الرصيد بالريال للعرض — مشتق من عمود الـ cache بالهللة.
     */
    public function getBalanceAttribute(): float
    {
        return $this->balance_halalas / 100;
    }

    /**
     * المحفظة الرئيسية لشركة (تُنشأ عند أول استخدام).
     */
    public static function mainFor(Company $company): self
    {
        return static::query()->withoutGlobalScopes()->firstOrCreate(
            ['owner_type' => Company::class, 'owner_id' => $company->id],
            ['company_id' => $company->id],
        );
    }

    /**
     * المحفظة الفرعية لمجتمع (تُنشأ عند أول استخدام).
     */
    public static function subFor(Community $community): self
    {
        return static::query()->withoutGlobalScopes()->firstOrCreate(
            ['owner_type' => Community::class, 'owner_id' => $community->id],
            ['company_id' => $community->company_id],
        );
    }
}
