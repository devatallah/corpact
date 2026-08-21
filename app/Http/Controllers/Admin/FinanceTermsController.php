<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanyContractTerm;
use App\Models\Partner;
use App\Models\ProviderCommissionRate;
use App\Services\ActivityLogService;
use App\Services\Billing\FinancialTermsService;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * تجميد الشروط المالية بتاريخ مستقبلي (H §12.10): «أي تغيير في نسبة عمولة
 * مزوّد أو في رسوم عقد شركة يسري من تاريخ مستقبلي محدد فقط ولا يُطبَّق بأثر
 * رجعي». الشاشة تعرض الساري اليوم والمجدول لاحقاً، ولا تسمح بتاريخ ماضٍ.
 */
class FinanceTermsController extends Controller
{
    public function __construct(private FinancialTermsService $terms) {}

    public function index(): Response
    {
        $today = Carbon::now();

        $providers = Partner::query()
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name', 'commission_rate'])
            ->map(fn (Partner $partner) => [
                'id' => $partner->id,
                'name' => $partner->name,
                'effective_rate_percent' => $this->terms->commissionRatePercentFor($partner, $today),
                'scheduled' => ProviderCommissionRate::query()
                    ->where('partner_id', $partner->id)
                    ->whereDate('effective_from', '>', $today->toDateString())
                    ->orderBy('effective_from')
                    ->get()
                    ->map(fn (ProviderCommissionRate $rate) => [
                        'id' => $rate->id,
                        'rate_percent' => (float) $rate->rate_percent,
                        'effective_from' => $rate->effective_from?->toDateString(),
                        'reason' => $rate->reason,
                    ])->all(),
            ])->all();

        $companies = Company::query()
            ->withoutGlobalScopes()
            ->orderBy('name')
            ->get(['id', 'name', 'contract_fee_per_activated_employee', 'contract_monthly_minimum'])
            ->map(function (Company $company) use ($today) {
                $effective = $this->terms->contractTermsFor($company, $today);

                return [
                    'id' => $company->id,
                    'name' => $company->name,
                    'fee_per_activated_employee' => $effective['fee_per_activated_employee_halalas'] !== null
                        ? Money::format($effective['fee_per_activated_employee_halalas'])
                        : null,
                    'monthly_minimum' => $effective['monthly_minimum_halalas'] !== null
                        ? Money::format($effective['monthly_minimum_halalas'])
                        : null,
                    'scheduled' => CompanyContractTerm::query()
                        ->where('company_id', $company->id)
                        ->whereDate('effective_from', '>', $today->toDateString())
                        ->orderBy('effective_from')
                        ->get()
                        ->map(fn (CompanyContractTerm $term) => [
                            'id' => $term->id,
                            'fee_per_activated_employee' => $term->fee_per_activated_employee_halalas !== null
                                ? Money::format((int) $term->fee_per_activated_employee_halalas)
                                : null,
                            'monthly_minimum' => $term->monthly_minimum_halalas !== null
                                ? Money::format((int) $term->monthly_minimum_halalas)
                                : null,
                            'effective_from' => $term->effective_from?->toDateString(),
                            'reason' => $term->reason,
                        ])->all(),
                ];
            })->all();

        return Inertia::render('admin/finance/terms', [
            'providers' => $providers,
            'companies' => $companies,
            'today' => $today->toDateString(),
        ]);
    }

    public function storeCommissionRate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'partner_id' => ['required', 'integer', 'exists:partners,id'],
            'rate_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'effective_from' => ['required', 'date', 'after:today'],
            'reason' => ['nullable', 'string', 'max:500'],
        ], [
            'effective_from.after' => 'تاريخ السريان يجب أن يكون مستقبلياً — لا تغيير بأثر رجعي (H §12.10).',
        ]);

        $partner = Partner::findOrFail($validated['partner_id']);
        $actor = auth('admin')->user();

        try {
            $rate = $this->terms->scheduleCommissionRate(
                $partner,
                (float) $validated['rate_percent'],
                Carbon::parse($validated['effective_from']),
                $actor?->id,
                $validated['reason'] ?? null,
            );
        } catch (Throwable $e) {
            return back()->withErrors(['effective_from' => $e->getMessage()]);
        }

        ActivityLogService::log(
            null,
            $rate,
            'provider_commission_rate_scheduled',
            "جدولة نسبة عمولة {$validated['rate_percent']}% للمزوّد {$partner->name} اعتباراً من {$rate->effective_from?->toDateString()}",
            ['partner_id' => $partner->id, 'rate_percent' => (float) $validated['rate_percent']],
            $actor?->id,
        );

        return back()->with('success', 'جُدولت النسبة — تسري من تاريخها ولا تمس أي كشف سابق.');
    }

    public function storeContractTerms(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'fee_per_activated_employee' => ['nullable', 'numeric', 'min:0'],
            'monthly_minimum' => ['nullable', 'numeric', 'min:0'],
            'effective_from' => ['required', 'date', 'after:today'],
            'reason' => ['nullable', 'string', 'max:500'],
        ], [
            'effective_from.after' => 'تاريخ السريان يجب أن يكون مستقبلياً — لا تغيير بأثر رجعي (H §12.10).',
        ]);

        $company = Company::withoutGlobalScopes()->findOrFail($validated['company_id']);
        $actor = auth('admin')->user();

        try {
            $term = $this->terms->scheduleContractTerms(
                $company,
                isset($validated['fee_per_activated_employee']) ? Money::toHalalas($validated['fee_per_activated_employee']) : null,
                isset($validated['monthly_minimum']) ? Money::toHalalas($validated['monthly_minimum']) : null,
                Carbon::parse($validated['effective_from']),
                $actor?->id,
                $validated['reason'] ?? null,
            );
        } catch (Throwable $e) {
            return back()->withErrors(['effective_from' => $e->getMessage()]);
        }

        ActivityLogService::log(
            $company->id,
            $term,
            'company_contract_terms_scheduled',
            "جدولة رسوم عقد جديدة لشركة {$company->name} اعتباراً من {$term->effective_from?->toDateString()}",
            [
                'company_id' => $company->id,
                'fee_per_activated_employee_halalas' => $term->fee_per_activated_employee_halalas,
                'monthly_minimum_halalas' => $term->monthly_minimum_halalas,
            ],
            $actor?->id,
        );

        return back()->with('success', 'جُدولت رسوم العقد — تسري من تاريخها ولا تمس فاتورة دورة سابقة.');
    }
}
