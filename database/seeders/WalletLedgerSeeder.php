<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Enums\TopupRequestStatus;
use App\Models\Company;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTopupRequest;
use App\Services\Wallet\LedgerService;
use App\Services\Wallet\TopupRequestService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/**
 * A6 — بيانات عرض للمحافظ والدفتر (H §12.5):
 *
 * لكل شركة معتمدة: طلب شحن بتحويل بنكي «معتمد» ينشئ حركة top_up في الدفتر،
 * ثم تخصيص لكل مجتمع (زوج allocation). زائد طلب مُقدَّم بانتظار الأدمن المالي
 * وطلب مرفوض بسبب موثَّق — كي تعرض لوحتا الشركة والأدمن المالي دورة كاملة.
 * لا يُكتب أي رصيد مباشرة: كل الأرقام قيود دفتر.
 */
class WalletLedgerSeeder extends Seeder
{
    public function run(LedgerService $ledger, TopupRequestService $topups): void
    {
        $financeAdmin = User::query()
            ->whereHas('roleAssignments', fn ($query) => $query->where('role', Role::FinanceAdmin->value))
            ->first();

        // إشعار تحويل تجريبي على القرص الخاص كي تعمل الروابط الموقّتة.
        $receiptPath = 'topup-receipts/seed-receipt.pdf';
        if (! Storage::exists($receiptPath)) {
            Storage::put($receiptPath, "%PDF-1.4\n% إشعار تحويل تجريبي (seed)\n");
        }

        $companies = Company::query()->where('status', 'active')->orderBy('id')->get();

        foreach ($companies as $index => $company) {
            $wallet = Wallet::mainFor($company);
            $amountHalalas = ($index === 0 ? 50_000 : 35_000) * 100;

            $approved = WalletTopupRequest::create([
                'company_id' => $company->id,
                'wallet_id' => $wallet->id,
                'amount_halalas' => $amountHalalas,
                'transfer_date' => now()->subDays(10)->toDateString(),
                'sender_account_last4' => (string) (1000 + $company->id),
                'bank_reference' => "SEED-TRF-{$company->id}-A",
                'receipt_path' => $receiptPath,
                'status' => TopupRequestStatus::Submitted,
                'created_by_user_id' => null,
            ]);

            if ($financeAdmin !== null) {
                $topups->approve($approved, $financeAdmin);
            }

            foreach ($company->communities()->get() as $community) {
                $allocationHalalas = 2_000 * 100;

                $ledger->allocate(
                    $wallet->refresh(),
                    Wallet::subFor($community),
                    $allocationHalalas,
                    "seed:allocation:{$company->id}:{$community->id}",
                    null,
                    "تخصيص لمجتمع {$community->name}",
                );
            }
        }

        // طلب مُقدَّم بانتظار المراجعة + طلب مرفوض بسبب موثَّق (للعرض).
        $first = $companies->first();
        if ($first !== null) {
            WalletTopupRequest::create([
                'company_id' => $first->id,
                'wallet_id' => Wallet::mainFor($first)->id,
                'amount_halalas' => 12_500 * 100,
                'transfer_date' => now()->subDay()->toDateString(),
                'sender_account_last4' => '4821',
                'bank_reference' => "SEED-TRF-{$first->id}-B",
                'receipt_path' => $receiptPath,
                'status' => TopupRequestStatus::Submitted,
                'created_by_user_id' => null,
            ]);

            WalletTopupRequest::query()->create([
                'company_id' => $first->id,
                'wallet_id' => Wallet::mainFor($first)->id,
                'amount_halalas' => 9_000 * 100,
                'transfer_date' => now()->subDays(4)->toDateString(),
                'sender_account_last4' => '7719',
                'bank_reference' => "SEED-TRF-{$first->id}-C",
                'receipt_path' => $receiptPath,
                'status' => TopupRequestStatus::Submitted,
                'created_by_user_id' => null,
            ])->forceFill([
                'status' => TopupRequestStatus::Rejected,
                'reviewed_by_user_id' => $financeAdmin?->id,
                'reviewed_at' => now()->subDays(3),
                'rejection_reason' => 'المبلغ لا يطابق كشف البنك — أعيدوا الرفع بالمرجع الصحيح.',
            ])->save();
        }
    }
}
