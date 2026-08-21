<?php

namespace App\Services\Company;

use App\Models\Community;
use App\Models\Company;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\ActivityLogService;
use App\Services\Wallet\LedgerService;
use App\Services\Wallet\TopupRequestService;
use App\Support\Identity\CurrentActor;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * محفظة الشركة من بوابة مسؤول الحساب. لا تعديل رصيد مباشراً هنا أبداً —
 * كل الحركات عبر {@see LedgerService}. الشحن الذاتي الفوري أُزيل نهائياً:
 * الشحن حصراً بطلب تحويل بنكي يعتمده الأدمن المالي
 * ({@see TopupRequestService}).
 */
class WalletService
{
    public function __construct(private LedgerService $ledger) {}

    /**
     * Get the wallet balance for a company.
     *
     * @return array{balance: float, wallet_id: int}
     */
    public function getBalance(Company $company): array
    {
        $wallet = Wallet::mainFor($company);

        return [
            'wallet_id' => $wallet->id,
            'balance' => $wallet->balance,
        ];
    }

    /**
     * تخصيص من المحفظة الرئيسية إلى محفظة مجتمع فرعية — زوج قيود allocation
     * في الدفتر (H §12.5)، لا عمود رصيد.
     */
    public function distributeToCommunity(Company $company, Community $community, float $amount): WalletTransaction
    {
        if ($community->company_id !== $company->id) {
            // Cross-company probe → 404, never 403 (H §4) — audited centrally.
            throw (new ModelNotFoundException)
                ->setModel(Community::class, [$community->id]);
        }

        $amountHalalas = (int) round($amount * 100);

        if ($amountHalalas <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['المبلغ يجب أن يكون أكبر من صفر.'],
            ]);
        }

        $wallet = Wallet::mainFor($company);

        if ($wallet->balance_halalas < $amountHalalas) {
            throw ValidationException::withMessages([
                'amount' => ['رصيد المحفظة غير كافٍ.'],
            ]);
        }

        $pair = $this->ledger->allocate(
            $wallet,
            Wallet::subFor($community),
            $amountHalalas,
            'allocation:'.Str::uuid(),
            CurrentActor::resolve()['id'],
            "تخصيص لمجتمع {$community->name}",
        );

        ActivityLogService::log(
            $company->id,
            $pair['out'],
            'wallet_distributed',
            "تم تخصيص {$amount} للمجتمع {$community->name}",
            ['amount_halalas' => $amountHalalas, 'community_id' => $community->id],
        );

        return $pair['out'];
    }
}
