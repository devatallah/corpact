<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\ProviderReliabilityLog;
use App\Models\UnitPriceChange;
use App\Services\ActivityLogService;
use App\Services\Provider\BankAccountService;
use App\Services\Provider\ReliabilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ما يديره أدمن تيمات من ملف المزوّد (H §17): اعتماد الحساب البنكي،
 * التعديل اليدوي الموثَّق لمؤشر الموثوقية، واعتماد تعديلات الأسعار تحت
 * عقد سعر. التحقق/التفعيل ونسبة العمولة قائمان في AdminPartnerController.
 */
class ProviderOversightController extends Controller
{
    public function __construct(
        private BankAccountService $bank,
        private ReliabilityService $reliability,
    ) {}

    /**
     * طابور اعتماد الحسابات البنكية + تعديلات الأسعار المعلّقة.
     */
    public function index(): Response
    {
        $bankQueue = Partner::query()
            ->whereNull('parent_id')
            ->where('bank_status', 'pending')
            ->orderBy('updated_at')
            ->get(['id', 'name', 'trade_name', 'cr_number', 'bank_account_holder', 'bank_iban', 'bank_status', 'updated_at']);

        $priceChanges = UnitPriceChange::query()
            ->where('status', 'pending')
            ->with(['unit.branch.partner:id,name,trade_name'])
            ->orderBy('created_at')
            ->get();

        $recentAdjustments = ProviderReliabilityLog::query()
            ->where('reason', ProviderReliabilityLog::REASON_MANUAL)
            ->with('partner:id,name,trade_name')
            ->latest()
            ->limit(20)
            ->get();

        $providers = Partner::query()
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name', 'trade_name', 'status', 'reliability_score', 'reliability_samples', 'bank_status', 'commission_rate'])
            ->each->makeVisible(['reliability_score', 'reliability_samples']);

        return Inertia::render('admin/providers/oversight', [
            'bankQueue' => $bankQueue,
            'priceChanges' => $priceChanges,
            'recentAdjustments' => $recentAdjustments,
            'providers' => $providers,
        ]);
    }

    /**
     * اعتماد الحساب البنكي — يدوي، platform_admin (middleware المسار).
     */
    public function approveBank(Partner $partner): RedirectResponse
    {
        $this->bank->approve($partner, auth('admin')->user());

        return back()->with('success', "اعتُمد الحساب البنكي للمزوّد {$partner->name} — الصرف متاح.");
    }

    /**
     * تعديل يدوي لمؤشر الموثوقية بسبب موثَّق إلزامي (H §11).
     */
    public function adjustReliability(Request $request, Partner $partner): RedirectResponse
    {
        $data = $request->validate([
            'delta' => ['required', 'integer', 'between:-100,100', 'not_in:0'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'reason.required' => 'سبب التعديل اليدوي إلزامي — لا تعديل بلا توثيق.',
            'reason.min' => 'وثّق سبباً حقيقياً للتعديل.',
        ]);

        $this->reliability->adjustManually(
            $partner,
            (int) $data['delta'],
            $data['reason'],
            auth('admin')->id(),
        );

        return back()->with('success', 'عُدّل مؤشر الموثوقية وسُجّل السبب في سجل التدقيق.');
    }

    /**
     * البت في تعديل سعر تحت عقد سعر (H §17).
     */
    public function decidePriceChange(Request $request, UnitPriceChange $priceChange): RedirectResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
        ]);

        if ($priceChange->status !== 'pending') {
            return back()->withErrors(['decision' => 'هذا التعديل سبق البت فيه.']);
        }

        $priceChange->update([
            'status' => $data['decision'],
            'decided_by' => auth('admin')->id(),
            'decided_at' => now(),
        ]);

        if ($data['decision'] === 'approved') {
            $priceChange->unit->update(['price' => $priceChange->new_price]);
        }

        ActivityLogService::log(
            null,
            $priceChange,
            'unit_price_change_'.$data['decision'],
            ($data['decision'] === 'approved' ? 'اعتُمد' : 'رُفض')." تعديل سعر الوحدة #{$priceChange->activity_unit_id} من {$priceChange->old_price} إلى {$priceChange->new_price}",
        );

        return back()->with('success', $data['decision'] === 'approved' ? 'اعتُمد تعديل السعر وسرى.' : 'رُفض تعديل السعر.');
    }
}
