<?php

namespace App\Services\Company;

use App\Models\Community;
use App\Models\Company;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\ActivityLogService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    /**
     * Get the wallet balance for a company.
     *
     * @return array{balance: float, wallet_id: int}
     */
    public function getBalance(Company $company): array
    {
        $wallet = $this->getOrFailWallet($company);

        return [
            'wallet_id' => $wallet->id,
            'balance' => (float) $wallet->balance,
        ];
    }

    /**
     * Charge (credit) the company wallet.
     */
    public function charge(Company $company, float $amount, ?string $description = null): WalletTransaction
    {
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['المبلغ يجب أن يكون أكبر من صفر.'],
            ]);
        }

        $wallet = $this->getOrFailWallet($company);

        return DB::transaction(function () use ($company, $wallet, $amount, $description) {
            $wallet->increment('balance', $amount);

            $transaction = WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => $amount,
                'description' => $description,
            ]);

            ActivityLogService::log(
                $company->id,
                $transaction,
                'wallet_charged',
                "تم شحن المحفظة بمبلغ {$amount}",
                ['amount' => $amount],
            );

            return $transaction;
        });
    }

    /**
     * Distribute funds from wallet to a community balance.
     */
    public function distributeToCommunity(Company $company, Community $community, float $amount): WalletTransaction
    {
        if ($community->company_id !== $company->id) {
            throw new AuthorizationException('This community does not belong to your company.');
        }

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['المبلغ يجب أن يكون أكبر من صفر.'],
            ]);
        }

        $wallet = $this->getOrFailWallet($company);

        if ($wallet->balance < $amount) {
            throw ValidationException::withMessages([
                'amount' => ['رصيد المحفظة غير كافٍ.'],
            ]);
        }

        return DB::transaction(function () use ($company, $wallet, $community, $amount) {
            $wallet->decrement('balance', $amount);
            $community->increment('balance', $amount);

            $transaction = WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'community_id' => $community->id,
                'type' => 'debit',
                'amount' => $amount,
            ]);

            ActivityLogService::log(
                $company->id,
                $transaction,
                'wallet_distributed',
                "تم توزيع {$amount} على المجتمع {$community->name}",
                ['amount' => $amount, 'community_id' => $community->id],
            );

            return $transaction;
        });
    }

    /**
     * Get the wallet for a company or throw an exception.
     */
    private function getOrFailWallet(Company $company): Wallet
    {
        return Wallet::query()->where('company_id', $company->id)->firstOrCreate(
            ['company_id' => $company->id],
            ['balance' => 0],
        );
    }
}
