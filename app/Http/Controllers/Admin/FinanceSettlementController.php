<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Services\Billing\SettlementCorrectionService;
use App\Services\Billing\SettlementStatementService;
use App\Services\Partner\PartnerSettlementService;
use App\Support\Lists\ListSort;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * لوحة الأدمن المالي — التسويات (G/الأدمن المالي §3):
 * توليد الكشوف، مراجعة بنودها، الاعتماد (وليس لمن ولّدها)، وتسجيل الصرف بعد
 * التحويل الفعلي (وليس قبل اعتماد الحساب البنكي). التصحيح بحركة عكسية وبند
 * تصحيحي بسبب إلزامي — لا تعديل لكشف مدفوع.
 *
 * المسارات خلف `permission:settlement.approve` (الأدمن المالي وحده).
 */
class FinanceSettlementController extends Controller
{
    public function __construct(
        private SettlementStatementService $statements,
        private SettlementCorrectionService $corrections,
        private PartnerSettlementService $presenter,
    ) {}

    /**
     * H §18 — الأعمدة المسموح الترتيب بها. كلها معروضة في سطر الكشف أصلاً
     * (الفترة · الحالة · عدد البنود · الإجمالي والعمولة والصافي)، فالترتيب لا
     * يكشف مبلغاً لا يراه الأدمن المالي. الافتراضي هو ترتيب الشاشة السابق
     * نفسه: أحدث فترة أولاً ثم المعرّف.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'period_end' => 'period_end',
            'status' => 'status',
            'items_count' => 'items_count',
            'gross_amount' => 'gross_amount_halalas',
            'commission_amount' => 'commission_amount_halalas',
            'net_amount' => 'net_amount_halalas',
        ], 'period_end', ListSort::DESC, 'id');
    }

    public function index(Request $request): Response
    {
        $request->validate([
            'status' => ['sometimes', 'nullable', 'string', 'max:40'],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            // H §18 — الترتيب: مفتاح من قائمة بيضاء لا اسم عمود.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $status = $request->string('status')->toString();
        $search = trim((string) $request->query('search', ''));

        $query = SettlementStatement::query()
            ->with(['partner:id,name,bank_status', 'generatedBy:id,name', 'approvedBy:id,name', 'paidBy:id,name'])
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(fn ($inner) => $inner
                ->where('period_key', 'like', '%'.$search.'%')
                ->orWhereHas('partner', fn ($partner) => $partner->where('name', 'like', '%'.$search.'%'))));

        $statements = self::sort()
            ->apply($query, $request->query('sort'), $request->query('dir'))
            ->paginate(20)
            ->withQueryString()
            ->through(fn (SettlementStatement $statement) => [
                ...$this->presenter->presentStatement($statement),
                'partner' => $statement->partner?->only(['id', 'name']),
                'payouts_blocked' => (bool) $statement->partner?->payoutsBlocked(),
                'generated_by' => $statement->generatedBy?->only(['id', 'name']),
                'approved_by' => $statement->approvedBy?->only(['id', 'name']),
                'paid_by' => $statement->paidBy?->only(['id', 'name']),
            ]);

        $period = $this->statements->periodEndingBefore();

        $pending = SettlementItem::query()
            ->where('status', SettlementItem::STATUS_PENDING)
            ->selectRaw('partner_id, COUNT(*) as items, SUM(net_amount_halalas) as net')
            ->groupBy('partner_id')
            ->with('partner:id,name')
            ->get()
            ->map(fn ($row) => [
                'partner_id' => (int) $row->partner_id,
                'partner_name' => $row->partner?->name,
                'items' => (int) $row->items,
                'net_amount_halalas' => (int) $row->net,
                'net_amount' => Money::format((int) $row->net),
            ])
            ->all();

        return Inertia::render('admin/finance/settlements', [
            'statements' => $statements,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'sort' => $request->query('sort'),
                'dir' => $request->query('dir'),
            ],
            'sort' => self::sort()->state($request->query('sort'), $request->query('dir')),
            'nextPeriod' => [
                'key' => $period['key'],
                'start' => $period['start']->toDateString(),
                'end' => $period['end']->toDateString(),
            ],
            'pendingByPartner' => $pending,
        ]);
    }

    public function show(SettlementStatement $statement): Response
    {
        $statement->load(['partner:id,name,bank_status,bank_iban', 'generatedBy:id,name', 'approvedBy:id,name', 'paidBy:id,name']);

        return Inertia::render('admin/finance/settlement-show', [
            'statement' => [
                ...$this->presenter->statementDetail($statement),
                'partner' => $statement->partner?->only(['id', 'name', 'bank_status']),
                'payouts_blocked' => (bool) $statement->partner?->payoutsBlocked(),
                'generated_by' => $statement->generatedBy?->only(['id', 'name']),
                'approved_by' => $statement->approvedBy?->only(['id', 'name']),
                'paid_by' => $statement->paidBy?->only(['id', 'name']),
            ],
        ]);
    }

    /**
     * توليد يدوي لكشوف الفترة المنتهية (نفس ما تفعله المهمة المجدولة —
     * `app:generate-settlements` كل 1 و16 الساعة 03:00).
     */
    public function generate(): RedirectResponse
    {
        $result = $this->statements->generateAll(
            $this->statements->periodEndingBefore(),
            auth('admin')->user(),
        );

        return back()->with('success', "وُلِّد {$result['generated']} كشف تسوية.");
    }

    public function approve(SettlementStatement $statement): RedirectResponse
    {
        try {
            $this->statements->approve($statement, auth('admin')->user());
        } catch (Throwable $e) {
            return back()->withErrors(['statement' => $e->getMessage()]);
        }

        return back()->with('success', 'اعتُمد الكشف — سجّل الصرف بعد التحويل الفعلي.');
    }

    public function markPaid(Request $request, SettlementStatement $statement): RedirectResponse
    {
        $validated = $request->validate([
            'payout_reference' => ['required', 'string', 'max:120'],
            'transferred_at' => ['nullable', 'date'],
        ], [
            'payout_reference.required' => 'مرجع التحويل البنكي إلزامي — الصرف يُسجَّل بعد التحويل الفعلي.',
        ]);

        try {
            $this->statements->markPaid(
                $statement,
                auth('admin')->user(),
                $validated['payout_reference'],
                isset($validated['transferred_at']) ? Carbon::parse($validated['transferred_at']) : null,
            );
        } catch (Throwable $e) {
            return back()->withErrors(['statement' => $e->getMessage()]);
        }

        return back()->with('success', 'سُجّل الصرف وانتقلت فعاليات الكشف إلى «مسوّاة».');
    }

    /**
     * تصحيح بند — حركة عكسية + بند تصحيحي في الكشف التالي بسبب إلزامي.
     */
    public function correct(Request $request, SettlementItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'corrected_gross' => ['required', 'numeric', 'min:0'],
            'corrected_rate_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'reason' => ['required', 'string', 'max:1000'],
        ], [
            'reason.required' => 'سبب التصحيح إلزامي ويُسجَّل في سجل التدقيق.',
        ]);

        try {
            $this->corrections->correct(
                $item,
                Money::toHalalas($validated['corrected_gross']),
                isset($validated['corrected_rate_percent']) ? (float) $validated['corrected_rate_percent'] : null,
                $validated['reason'],
                auth('admin')->user(),
            );
        } catch (Throwable $e) {
            return back()->withErrors(['item' => $e->getMessage()]);
        }

        return back()->with('success', 'أُنشئ بند تصحيحي — يظهر في الكشف التالي للمزوّد.');
    }
}
