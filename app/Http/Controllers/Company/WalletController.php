<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\SubmitTopupRequest;
use App\Models\Community;
use App\Models\Company;
use App\Models\Notification;
use App\Models\Wallet;
use App\Models\WalletTopupRequest;
use App\Models\WalletTransaction;
use App\Services\Company\WalletService;
use App\Services\Wallet\TopupRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function __construct(
        private WalletService $walletService,
        private TopupRequestService $topupService,
    ) {}

    /**
     * Show the company wallet overview.
     *
     * الشحن الفوري أُزيل (H §12.5): الرصيد لا يتحرك إلا بقيد دفتر، وشحن
     * المحفظة حصراً بطلب تحويل بنكي يعتمده الأدمن المالي.
     */
    public function index(): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = Notification::where('notifiable_type', Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $wallet = Wallet::mainFor($company);
        $communities = $company->communities()->with(['category', 'wallet'])->get();
        Community::attachPrimaryLeaders($communities);

        // دفتر الأستاذ يُقرأ من الأقدم للأحدث ليُبنى «الرصيد بعد الحركة»، ثم
        // يُعرض بالعكس. رصيد جارٍ محسوب على صفحة واحدة يكذب على القارئ، فيُبنى
        // من كامل الدفتر ثم تُقتطع آخر 20 حركة.
        $ledger = $wallet->transactions()
            ->with('actor:id,name')
            ->orderBy('occurred_at')
            ->orderBy('id')
            ->get();

        // المرجع المعروض هو ما يُطابَق به القيد فعلاً: رقم العملية البنكية
        // لقيود الشحن. `WalletTopupRequest-7` لا يُبحث عنه في كشف بنك.
        $bankReferences = WalletTopupRequest::query()
            ->whereIn('id', $ledger->where('reference_type', WalletTopupRequest::class)->pluck('reference_id')->filter())
            ->pluck('bank_reference', 'id');

        $running = 0;
        $rows = [];

        foreach ($ledger as $tx) {
            $signed = $tx->direction === 'credit' ? $tx->amount_halalas : -$tx->amount_halalas;
            $running += $signed;

            $rows[] = [
                'id' => $tx->id,
                'type' => $tx->type->value,
                'type_label' => $tx->type->label(),
                'direction' => $tx->direction,
                'amount' => $tx->amount_halalas / 100,
                'signed_amount' => $signed / 100,
                'balance_after' => $running / 100,
                // المرجع يربط القيد بمصدره — بلا مرجع لا يمكن تتبّع خطأ إلى أصله.
                'reference' => $this->ledgerReference($tx, $bankReferences),
                'actor_name' => $tx->actor?->name,
                'note' => $tx->note,
                'occurred_at' => $tx->occurred_at?->toIso8601String(),
            ];
        }

        $transactions = collect(array_reverse($rows))->take(20)->values();

        $topupRequests = WalletTopupRequest::query()
            ->where('company_id', $company->id)
            ->with('reviewer:id,name')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (WalletTopupRequest $request) => [
                'id' => $request->id,
                'amount' => $request->amount,
                'transfer_date' => $request->transfer_date?->toDateString(),
                'sender_account_last4' => $request->sender_account_last4,
                'bank_reference' => $request->bank_reference,
                'status' => $request->status->value,
                'status_label' => $request->status->label(),
                'rejection_reason' => $request->rejection_reason,
                // من اعتمده ومتى — الطلب المعتمد بلا اسم معتمِد لا يُدقَّق.
                'receipt_name' => $request->receipt_path === null ? null : basename($request->receipt_path),
                'reviewed_by' => $request->reviewer?->name,
                'reviewed_at' => $request->reviewed_at?->toIso8601String(),
                'created_at' => $request->created_at?->toIso8601String(),
            ]);

        return Inertia::render('company/wallet/index', [
            'company' => $company,
            'wallet' => $wallet,
            'walletData' => ['wallet_id' => $wallet->id, 'balance' => $wallet->balance],
            'communities' => $communities,
            'transactions' => $transactions,
            'topupRequests' => $topupRequests,
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * رفع طلب شحن بتحويل بنكي — يعتمده الأدمن المالي في تيمات.
     */
    public function submitTopup(SubmitTopupRequest $request): RedirectResponse
    {
        $company = auth('company')->user();

        $this->topupService->submit(
            $company,
            $request->safe()->except('receipt'),
            $request->file('receipt'),
        );

        return back()->with('success', 'تم رفع طلب الشحن — يُضاف الرصيد بعد اعتماد الأدمن المالي.');
    }

    /**
     * Distribute funds from wallet to a community (allocation ledger pair).
     */
    public function distribute(Request $request): RedirectResponse
    {
        $request->validate([
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $company = auth('company')->user();
        $community = Community::findOrFail($request->input('community_id'));

        $this->walletService->distributeToCommunity($company, $community, (float) $request->input('amount'));

        return back()->with('success', 'تم تخصيص الرصيد للمجتمع بنجاح.');
    }

    /**
     * مرجع القيد كما يُقرأ لا كما يُخزَّن.
     *
     * @param  \Illuminate\Support\Collection<int, string|null>  $bankReferences
     */
    private function ledgerReference(WalletTransaction $tx, $bankReferences): ?string
    {
        if ($tx->reference_type === null) {
            return null;
        }

        if ($tx->reference_type === WalletTopupRequest::class) {
            return $bankReferences[$tx->reference_id] ?? 'TOPUP-'.$tx->reference_id;
        }

        return strtoupper(Str::snake(class_basename($tx->reference_type), '-')).'-'.$tx->reference_id;
    }
}
