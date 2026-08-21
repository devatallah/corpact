<?php

namespace App\Services\Company;

use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeImport;
use App\Models\Invitation;
use App\Support\Identity\PhoneNumber;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Employee file onboarding (H §5 / G دليل مسؤول الحساب §3):
 *
 * 1. The CSV/Excel file is parsed and EVERY row validated immediately —
 *    Saudi phone format, duplicates inside the file, duplicates against
 *    existing employees (by phone or work email), unknown department.
 * 2. Each row is stored verbatim with its errors; the per-row error report
 *    is downloadable as CSV.
 * 3. Invitations are blocked while a single row has errors — the account
 *    manager corrects and re-uploads («لا تُرسل دعوات قبل أن يخلو التقرير»).
 */
class EmployeeImportService
{
    public function __construct(
        private EmployeeImportFileReader $reader,
        private InvitationService $invitations,
    ) {}

    /**
     * Parse, validate and persist an uploaded employee file.
     */
    public function import(Company $company, UploadedFile $file, ?int $uploadedByUserId = null): EmployeeImport
    {
        $rows = $this->reader->read($file->getRealPath(), $file->getClientOriginalName());

        if ($rows === []) {
            throw ValidationException::withMessages(['file' => ['الملف لا يحتوي على أي صف بيانات.']]);
        }

        $departmentsByName = Department::query()
            ->withoutGlobalScopes()
            ->where('company_id', $company->id)
            ->pluck('id', 'name')
            ->mapWithKeys(fn ($id, $name) => [mb_strtolower(trim($name)) => $id]);

        // Existing employees, keyed for O(1) duplicate lookups.
        $existing = Employee::query()
            ->withoutGlobalScopes()
            ->where('company_id', $company->id)
            ->get(['id', 'email', 'phone']);

        $existingEmails = $existing->pluck('email')
            ->filter()
            ->map(fn ($email) => mb_strtolower($email))
            ->flip();

        $existingPhones = $existing->pluck('phone')
            ->map(fn ($phone) => PhoneNumber::normalize($phone))
            ->filter()
            ->flip();

        $seenPhones = [];   // normalized phone => first row number
        $seenEmails = [];   // lowercased email => first row number

        $prepared = [];

        foreach ($rows as $row) {
            $errors = [];

            $name = $row['name'];
            $email = $row['email'];
            $phone = $row['phone'];
            $normalizedPhone = PhoneNumber::normalize($phone);
            $departmentName = $row['department'];
            $departmentId = null;

            if ($name === null) {
                $errors[] = 'الاسم مطلوب.';
            }

            if ($email === null) {
                $errors[] = 'بريد العمل مطلوب.';
            } elseif (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = 'بريد العمل غير صالح.';
            }

            if ($phone === null) {
                $errors[] = 'رقم الجوال مطلوب.';
            } elseif ($normalizedPhone === null || ! preg_match('/^9665\d{8}$/', $normalizedPhone)) {
                $errors[] = 'صيغة رقم الجوال السعودي غير صحيحة (05XXXXXXXX أو 9665XXXXXXXX).';
                $normalizedPhone = null;
            }

            // Duplicates inside the file.
            if ($normalizedPhone !== null) {
                if (isset($seenPhones[$normalizedPhone])) {
                    $errors[] = 'رقم الجوال مكرر داخل الملف (ورد أولاً في السطر '.$seenPhones[$normalizedPhone].').';
                } else {
                    $seenPhones[$normalizedPhone] = $row['row_number'];
                }
            }

            if ($email !== null) {
                $emailKey = mb_strtolower($email);

                if (isset($seenEmails[$emailKey])) {
                    $errors[] = 'بريد العمل مكرر داخل الملف (ورد أولاً في السطر '.$seenEmails[$emailKey].').';
                } else {
                    $seenEmails[$emailKey] = $row['row_number'];
                }
            }

            // Duplicates against existing employees of the company.
            if ($normalizedPhone !== null && isset($existingPhones[$normalizedPhone])) {
                $errors[] = 'رقم الجوال مسجل لموظف قائم في الشركة.';
            }

            if ($email !== null && isset($existingEmails[mb_strtolower($email)])) {
                $errors[] = 'بريد العمل مسجل لموظف قائم في الشركة.';
            }

            // Department must pre-exist (G: «أنشئ الإدارات أولاً»).
            if ($departmentName !== null) {
                $departmentId = $departmentsByName[mb_strtolower($departmentName)] ?? null;

                if ($departmentId === null) {
                    $errors[] = 'الإدارة «'.$departmentName.'» غير موجودة — أنشئ الإدارات أولاً.';
                }
            }

            $prepared[] = [
                'row_number' => $row['row_number'],
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'normalized_phone' => $normalizedPhone,
                'department_name' => $departmentName,
                'department_id' => $departmentId,
                'employee_number' => $row['employee_number'],
                'errors' => $errors === [] ? null : $errors,
            ];
        }

        $errorCount = count(array_filter($prepared, fn (array $row) => $row['errors'] !== null));

        return DB::transaction(function () use ($company, $file, $uploadedByUserId, $prepared, $errorCount) {
            $import = EmployeeImport::create([
                'company_id' => $company->id,
                'uploaded_by_user_id' => $uploadedByUserId,
                'original_filename' => $file->getClientOriginalName(),
                'status' => $errorCount > 0 ? EmployeeImport::STATUS_NEEDS_CORRECTION : EmployeeImport::STATUS_READY,
                'total_rows' => count($prepared),
                'valid_rows' => count($prepared) - $errorCount,
                'error_rows' => $errorCount,
            ]);

            foreach ($prepared as $row) {
                $import->rows()->create($row);
            }

            return $import;
        });
    }

    /**
     * The downloadable per-row error report (CSV, UTF-8 BOM for Excel).
     */
    public function errorReportCsv(EmployeeImport $import): string
    {
        $rows = $import->rows()->whereNotNull('errors')->orderBy('row_number')->get();

        $out = fopen('php://temp', 'r+');

        fwrite($out, "\xEF\xBB\xBF"); // BOM so Excel renders the Arabic correctly
        fputcsv($out, ['السطر', 'الاسم', 'بريد العمل', 'رقم الجوال', 'الإدارة', 'الرقم الوظيفي', 'الأخطاء']);

        foreach ($rows as $row) {
            fputcsv($out, [
                $row->row_number,
                $row->name,
                $row->email,
                $row->phone,
                $row->department_name,
                $row->employee_number,
                implode(' | ', $row->errors ?? []),
            ]);
        }

        rewind($out);
        $csv = stream_get_contents($out) ?: '';
        fclose($out);

        return $csv;
    }

    /**
     * Send the WhatsApp invitations for a clean import. Blocked while the
     * error report is non-empty; a phone that gained a pending invitation
     * since validation is resent, not duplicated.
     *
     * @return int number of invitations sent
     */
    public function sendInvites(EmployeeImport $import, ?int $invitedByEmployeeId = null): int
    {
        if (! $import->isErrorFree()) {
            throw ValidationException::withMessages([
                'import' => ['لا يمكن إرسال الدعوات وتقرير الأخطاء غير خالٍ — نزّل التقرير وصحّح الملف وأعد الرفع.'],
            ]);
        }

        if ($import->status === EmployeeImport::STATUS_INVITED) {
            throw ValidationException::withMessages([
                'import' => ['أُرسلت دعوات هذا الملف من قبل — استخدم إعادة الإرسال لمن لم يفعّل.'],
            ]);
        }

        $company = $import->company()->withoutGlobalScopes()->firstOrFail();

        $sent = 0;

        foreach ($import->rows()->whereNull('errors')->orderBy('row_number')->get() as $row) {
            $pending = Invitation::query()
                ->withoutGlobalScopes()
                ->where('company_id', $import->company_id)
                ->whereIn('status', ['pending', 'expired'])
                ->where(function ($query) use ($row) {
                    $query->where('phone', $row->normalized_phone)
                        ->orWhere('email', $row->email);
                })
                ->first();

            if ($pending !== null) {
                $pending->fill([
                    'name' => $row->name,
                    'phone' => $row->normalized_phone,
                    'department_id' => $row->department_id,
                    'employee_number' => $row->employee_number,
                    'employee_import_id' => $import->id,
                ])->save();

                $this->invitations->resend($pending);
                $sent++;

                continue;
            }

            $this->invitations->invite($company, [
                'email' => $row->email,
                'name' => $row->name,
                'phone' => $row->normalized_phone,
                'department_id' => $row->department_id,
                'employee_number' => $row->employee_number,
                'employee_import_id' => $import->id,
            ], $invitedByEmployeeId);

            $sent++;
        }

        $import->update([
            'status' => EmployeeImport::STATUS_INVITED,
            'invited_at' => now(),
        ]);

        return $sent;
    }
}
