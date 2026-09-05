<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Support\Audit\AuditAction;
use App\Support\Lists\ListSort;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * H §19: «يراه أدمن تيمات كاملاً، ويرى **مسؤول الحساب ملخصاً محدوداً لشركته
 * فقط**».
 *
 * "Limited summary" is enforced three ways here, not just by a where-clause:
 *
 * 1. `forCompany()` — rows of the session's company only. Platform-wide rows
 *    (`company_id` null) are invisible by construction.
 * 2. an allow-list of actions — the company sees what happened *to its own
 *    account*, not Teamat's internal operations.
 * 3. the payload is a summary: no IP, no user agent, no raw before/after
 *    blobs — those belong to the full log.
 */
class AuditLogController extends Controller
{
    /**
     * The actions an account manager may see about their own company.
     *
     * @return string[]
     */
    public static function visibleActions(): array
    {
        return [
            AuditAction::TOPUP_SUBMITTED,
            AuditAction::TOPUP_UNDER_REVIEW,
            AuditAction::TOPUP_APPROVED,
            AuditAction::TOPUP_REJECTED,
            AuditAction::TOPUP_UNAPPROVED,
            AuditAction::WALLET_ALLOCATED,
            AuditAction::REFUND_ISSUED,
            AuditAction::INVOICE_ISSUED,
            AuditAction::INVOICE_PAID,
            AuditAction::EVENT_CREATION_BLOCKED,
            AuditAction::EVENT_CREATION_UNBLOCKED,
            AuditAction::CONTRACT_TERMS_SCHEDULED,
            AuditAction::COMPANY_CONTRACT_UPDATED,
            AuditAction::EVENT_STATE_FORCED,
            AuditAction::EVENT_CANCELLED_BY_ADMIN,
            AuditAction::ATTENDANCE_POST_WINDOW_EDITED,
            AuditAction::RESULT_CORRECTED,
            AuditAction::PERMISSION_GRANTED,
            AuditAction::PERMISSION_REVOKED,
            AuditAction::ACCOUNT_DEACTIVATED,
            AuditAction::ACCOUNT_ANONYMIZED,
            AuditAction::REPORT_EXPORTED,
            AuditAction::COMPANY_CONTEXT_SWITCHED,
        ];
    }

    /**
     * الأعمدة المسموح الترتيب بها — أعمدة الملخص المعروضة وحدها. لا `ip_address`
     * ولا `user_agent` ولا قيم قبل/بعد: ما لا يراه مسؤول الحساب لا يُرتَّب به،
     * فالترتيب لا يستنتج ما لا يُعرض (H §18/§19).
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'created_at' => 'created_at',
            'action' => 'action',
            'actor_name' => 'actor_name',
            'entity_type' => 'entity_type',
        ], 'created_at', ListSort::DESC, 'id');
    }

    public function index(Request $request): Response
    {
        $company = auth('company')->user();

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'action' => ['sometimes', 'nullable', 'string', 'max:120'],
            'group' => ['sometimes', 'nullable', 'string', 'max:60'],
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date'],
            // H §18 — مفتاح ترتيب من القائمة البيضاء + اتجاهه؛ `?sort=asc`
            // القديم يبقى عاملاً عبر توافق `ListSort`.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $query = AuditLog::query()
            ->forCompany($company->id)
            ->whereIn('action', self::visibleActions())
            ->when(filled($filters['search'] ?? null), fn ($query) => $query->where(fn ($inner) => $inner
                ->where('actor_name', 'like', '%'.$filters['search'].'%')
                ->orWhere('reason', 'like', '%'.$filters['search'].'%')))
            ->when(filled($filters['action'] ?? null), fn ($query) => $query->where('action', $filters['action']))
            // `groups` كانت تُرسَل للواجهة بلا تصفية خلفها. التصفية بالبادئة
            // نفسها التي يستعملها أدمن تيمات، فالمجموعة تعني الشيء ذاته في
            // الشاشتين ولا يبقى النطاق هو الفرق الوحيد.
            ->when(filled($filters['group'] ?? null), fn ($query) => $query->where('action', 'like', $filters['group'].'.%'))
            ->when(filled($filters['from'] ?? null), fn ($query) => $query->whereDate('created_at', '>=', $filters['from']))
            ->when(filled($filters['to'] ?? null), fn ($query) => $query->whereDate('created_at', '<=', $filters['to']));

        $logs = self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate(20)
            ->withQueryString()
            ->through(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'action_label' => AuditAction::label($log->action),
                'actor_name' => $log->actor_name,
                'actor_role' => $log->actor_role,
                'entity_type' => $log->entity_type === null ? null : class_basename($log->entity_type),
                'entity_id' => $log->entity_id,
                'reason' => $log->reason,
                'is_financial' => (bool) $log->is_financial,
                'created_at' => $log->created_at?->toIso8601String(),
                // Deliberately absent: ip_address, user_agent, before/after.
            ]);

        return Inertia::render('company/audit/index', [
            'company' => $company,
            'logs' => $logs,
            'filters' => (object) $filters,
            'sort' => self::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'actions' => collect(self::visibleActions())
                ->map(fn (string $action) => ['value' => $action, 'label' => AuditAction::label($action)])
                ->values()
                ->all(),
            'groups' => AdminAuditLogController::groups(),
        ]);
    }
}
