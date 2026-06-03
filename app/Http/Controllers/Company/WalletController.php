<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\ChargeWalletRequest;
use App\Services\Company\WalletService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function __construct(
        private WalletService $walletService,
    ) {}

    /**
     * Show the company wallet overview.
     */
    public function index(): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $walletData = $this->walletService->getBalance($company);
        $wallet = $company->wallet;
        $communities = $company->communities()->with('category')->get();
        $transactions = $wallet?->transactions()->latest()->limit(20)->get() ?? collect();

        return Inertia::render('company/wallet/index', [
            'company' => $company,
            'wallet' => $wallet,
            'walletData' => $walletData,
            'communities' => $communities,
            'transactions' => $transactions,
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * Charge the company wallet.
     */
    public function charge(ChargeWalletRequest $request): RedirectResponse
    {
        $company = auth('company')->user();

        $data = $request->validated();

        $this->walletService->charge($company, $data['amount']);

        return back()->with('success', 'تم شحن المحفظة بنجاح.');
    }

    /**
     * Distribute funds from wallet to a community.
     */
    public function distribute(\Illuminate\Http\Request $request): RedirectResponse
    {
        $request->validate([
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $company = auth('company')->user();
        $community = \App\Models\Community::findOrFail($request->input('community_id'));

        $this->walletService->distributeToCommunity($company, $community, (float) $request->input('amount'));

        return back()->with('success', 'تم شحن رصيد المجتمع بنجاح.');
    }
}
