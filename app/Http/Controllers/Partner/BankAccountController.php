<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Services\Provider\BankAccountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * الملف والحساب البنكي (H §17): الحساب لا يُفعَّل إلا بعد اعتماد يدوي من
 * تيمات وهو شرط لأي صرف. أي تغيير بعد الاعتماد يعيد الحالة إلى «بانتظار
 * الاعتماد» ويُسجَّل حدثاً أمنياً.
 */
class BankAccountController extends Controller
{
    public function __construct(private BankAccountService $bank) {}

    public function edit(): Response
    {
        $partner = auth('partner')->user()->resolvedPartner();

        return Inertia::render('partner/bank', [
            'bank' => [
                'account_holder' => $partner->bank_account_holder,
                'iban' => $partner->bank_iban,
                'status' => $partner->bank_status,
                'approved_at' => $partner->bank_approved_at?->toIso8601String(),
                'payouts_blocked' => $partner->payoutsBlocked(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'account_holder' => ['required', 'string', 'max:120'],
            'iban' => ['required', 'string', 'max:34'],
        ], [
            'account_holder.required' => 'اسم صاحب الحساب مطلوب.',
            'iban.required' => 'رقم الآيبان مطلوب.',
        ]);

        $partner = auth('partner')->user()->resolvedPartner();
        $wasApproved = $partner->bank_status === 'approved';

        $this->bank->update($partner, $data['account_holder'], $data['iban']);

        return back()->with(
            'success',
            $wasApproved
                ? 'حُفظت البيانات — تغيير الحساب المعتمد أعاد الحالة إلى بانتظار الاعتماد، والصرف محجوب حتى يعتمده أدمن تيمات.'
                : 'حُفظت بيانات الحساب البنكي — بانتظار اعتماد أدمن تيمات.',
        );
    }
}
