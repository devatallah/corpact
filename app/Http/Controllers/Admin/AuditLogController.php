<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Company;
use App\Support\Audit\AuditAction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * H §16 «الدعم وسجل التدقيق» + H §19: «يراه أدمن تيمات كاملاً».
 *
 * H §18 global list rules: search + filter + sort + 20 per page, with the
 * three mandatory states rendered on the page side.
 */
class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'action' => ['sometimes', 'nullable', 'string', 'max:120'],
            'group' => ['sometimes', 'nullable', 'string', 'max:60'],
            'company_id' => ['sometimes', 'nullable', 'integer'],
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date'],
            'financial' => ['sometimes', 'nullable', 'string'],
            'sort' => ['sometimes', 'nullable', 'string'],
        ]);

        $logs = AuditLog::query()
            ->with(['actor:id,name', 'company:id,name'])
            ->when(filled($filters['search'] ?? null), fn ($query) => $query->where(fn ($inner) => $inner
                ->where('actor_name', 'like', '%'.$filters['search'].'%')
                ->orWhere('action', 'like', '%'.$filters['search'].'%')
                ->orWhere('reason', 'like', '%'.$filters['search'].'%')
                ->orWhere('entity_type', 'like', '%'.$filters['search'].'%')))
            ->when(filled($filters['action'] ?? null), fn ($query) => $query->where('action', $filters['action']))
            ->when(filled($filters['group'] ?? null), fn ($query) => $query->where('action', 'like', $filters['group'].'.%'))
            ->when(filled($filters['company_id'] ?? null), fn ($query) => $query->where('company_id', $filters['company_id']))
            ->when(filled($filters['from'] ?? null), fn ($query) => $query->whereDate('created_at', '>=', $filters['from']))
            ->when(filled($filters['to'] ?? null), fn ($query) => $query->whereDate('created_at', '<=', $filters['to']))
            ->when(($filters['financial'] ?? null) === '1', fn ($query) => $query->where('is_financial', true))
            ->orderBy('created_at', ($filters['sort'] ?? 'desc') === 'asc' ? 'asc' : 'desc')
            ->orderBy('id', ($filters['sort'] ?? 'desc') === 'asc' ? 'asc' : 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (AuditLog $log) => self::present($log));

        return Inertia::render('admin/audit/index', [
            'logs' => $logs,
            'filters' => $filters,
            'actions' => collect(AuditAction::labels())
                ->map(fn (string $label, string $action) => ['value' => $action, 'label' => $label])
                ->values()
                ->all(),
            'groups' => self::groups(),
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            'total' => AuditLog::query()->count(),
        ]);
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function groups(): array
    {
        return [
            ['value' => 'permission', 'label' => 'الصلاحيات'],
            ['value' => 'financial', 'label' => 'المالية'],
            ['value' => 'provider', 'label' => 'المزوّدون'],
            ['value' => 'event', 'label' => 'الفعاليات'],
            ['value' => 'attendance', 'label' => 'الحضور'],
            ['value' => 'results', 'label' => 'النتائج'],
            ['value' => 'export', 'label' => 'التصدير والتنزيل'],
            ['value' => 'account', 'label' => 'الحسابات'],
            ['value' => 'company', 'label' => 'الشركات والسياق'],
            ['value' => 'settings', 'label' => 'الإعدادات'],
            ['value' => 'file', 'label' => 'الملفات'],
            ['value' => 'security', 'label' => 'الأمن'],
            ['value' => 'retention', 'label' => 'الاحتفاظ'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function present(AuditLog $log): array
    {
        return [
            'id' => $log->id,
            'action' => $log->action,
            'action_label' => AuditAction::label($log->action),
            'actor_name' => $log->actor_name ?? $log->actor?->name,
            'actor_role' => $log->actor_role,
            'actor_guard' => $log->actor_guard,
            'scope_type' => $log->scope_type,
            'scope_id' => $log->scope_id,
            'company' => $log->company?->only(['id', 'name']),
            'entity_type' => $log->entity_type === null ? null : class_basename($log->entity_type),
            'entity_id' => $log->entity_id,
            'before_values' => $log->before_values,
            'after_values' => $log->after_values,
            'reason' => $log->reason,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'is_financial' => (bool) $log->is_financial,
            'created_at' => $log->created_at?->toIso8601String(),
        ];
    }
}
