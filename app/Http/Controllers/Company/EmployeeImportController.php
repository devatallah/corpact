<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\EmployeeImport;
use App\Models\Invitation;
use App\Services\Audit\AuditLogService;
use App\Services\Company\EmployeeImportService;
use App\Support\Identity\CurrentActor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * Employee file onboarding (H §5): upload → immediate per-row validation →
 * downloadable error report → invitations only once the report is clean.
 */
class EmployeeImportController extends Controller
{
    public function __construct(private EmployeeImportService $imports) {}

    public function index(): Response
    {
        $company = auth('company')->user();

        $latest = EmployeeImport::query()
            ->where('company_id', $company->id)
            ->latest()
            ->first();

        // Error rows first so they are always visible; cap the payload — the
        // full picture is the downloadable report.
        $latest?->load(['rows' => fn ($query) => $query
            ->orderByRaw('(errors is null) asc')
            ->orderBy('row_number')
            ->limit(500)]);

        $imports = EmployeeImport::query()
            ->where('company_id', $company->id)
            ->latest()
            ->take(10)
            ->get();

        $invitations = Invitation::query()
            ->where('company_id', $company->id)
            ->whereIn('status', ['pending', 'expired'])
            ->latest()
            ->take(50)
            ->get(['id', 'email', 'name', 'phone', 'status', 'expires_at', 'last_sent_at', 'send_count']);

        return Inertia::render('company/employees/import', [
            'latestImport' => $latest,
            'imports' => $imports,
            'invitations' => $invitations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'extensions:csv,txt,xlsx', 'max:5120'],
        ], [
            'file.required' => 'اختر ملف CSV أو Excel.',
            'file.extensions' => 'صيغة الملف غير مدعومة — المقبول CSV أو Excel (xlsx).',
            'file.max' => 'حجم الملف يتجاوز 5 ميجابايت.',
        ]);

        $company = auth('company')->user();

        $import = $this->imports->import(
            $company,
            $request->file('file'),
            CurrentActor::resolve()['id'],
        );

        $message = $import->isErrorFree()
            ? "تم التحقق من الملف: {$import->valid_rows} صف سليم. يمكنك إرسال الدعوات."
            : "الملف يحتوي على {$import->error_rows} صف بأخطاء من أصل {$import->total_rows}. نزّل تقرير الأخطاء وصحّح ثم أعد الرفع.";

        return redirect()->route('company.employees.import.index')
            ->with($import->isErrorFree() ? 'success' : 'error', $message);
    }

    /**
     * Download the per-row error report (CSV).
     */
    public function errors(EmployeeImport $import): SymfonyResponse
    {
        $csv = $this->imports->errorReportCsv($import);

        // A15 — H §19: كل تنزيل يحمل بيانات موظفين يُسجَّل.
        AuditLogService::export(
            report: 'company.employee_import.errors',
            companyId: $import->company_id,
            context: ['import_id' => $import->id, 'error_rows' => $import->error_rows],
            format: 'csv',
        );

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="employee-import-'.$import->id.'-errors.csv"',
        ]);
    }

    /**
     * Send the invitations for a clean import — blocked while the error
     * report is non-empty (enforced again in the service).
     */
    public function sendInvites(EmployeeImport $import): RedirectResponse
    {
        $sent = $this->imports->sendInvites($import);

        return redirect()->route('company.employees.import.index')
            ->with('success', "تم إرسال {$sent} دعوة عبر واتساب — الرابط صالح 7 أيام.");
    }
}
