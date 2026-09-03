<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\IndexSettlementRequest;
use App\Models\SettlementStatement;
use App\Services\Partner\PartnerSettlementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * لوحة المزوّد — المستحقات والتسويات (H §17، G/دليل المزوّد §7): قائمة
 * الكشوف وصفحة كشف واحد بمطابقة بند ببند مقابل الفعاليات. قراءة فقط:
 * الاعتماد والصرف عند الأدمن المالي وحده.
 */
class SettlementController extends Controller
{
    public function __construct(
        private PartnerSettlementService $settlements,
    ) {}

    public function index(IndexSettlementRequest $request): Response
    {
        $partner = auth('partner')->user()->resolvedPartner();
        $filters = $request->validated();

        return Inertia::render('partner/settlements/index', [
            'partner' => $partner,
            'statements' => $this->settlements->listForPartner($partner, $filters),
            'totals' => $this->settlements->totals($partner),
            'filters' => (object) $filters,
            'sort' => PartnerSettlementService::statementSort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
        ]);
    }

    public function show(Request $request, SettlementStatement $settlement): Response
    {
        Gate::authorize('view', $settlement);

        $sort = $request->query('sort');
        $dir = $request->query('dir');

        return Inertia::render('partner/settlements/show', [
            // البنود صارت حمولة مرقّمة مستقلة (20/صفحة — H §18) بدل مصفوفة
            // بلا حدّ داخل الكشف؛ بقية الكشف كما هي.
            'statement' => $this->settlements->presentStatement($settlement),
            'items' => $this->settlements->statementItems(
                $settlement,
                is_string($sort) ? $sort : null,
                is_string($dir) ? $dir : null,
            ),
            'sort' => PartnerSettlementService::itemSort()->state(
                is_string($sort) ? $sort : null,
                is_string($dir) ? $dir : null,
            ),
        ]);
    }
}
