<?php

use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeImport;
use App\Models\Invitation;
use App\Services\Company\EmployeeImportService;
use Illuminate\Http\UploadedFile;

// H §5 / G دليل مسؤول الحساب §3 — رفع ملف CSV أو Excel، تحقق فوري (صيغة
// الجوال السعودي، التكرار داخل الملف، التكرار مع موظفين قائمين)، تقرير أخطاء
// بالسطر قابل للتنزيل، ولا دعوات قبل خلو التقرير.

function employeesCsv(array $rows, bool $withHeader = true): UploadedFile
{
    $lines = $withHeader ? ['الاسم,بريد العمل,رقم الجوال,الإدارة,الرقم الوظيفي'] : [];

    foreach ($rows as $row) {
        $lines[] = implode(',', $row);
    }

    return UploadedFile::fake()->createWithContent('employees.csv', "\xEF\xBB\xBF".implode("\n", $lines));
}

function employeesXlsx(array $rows): UploadedFile
{
    $header = ['الاسم', 'بريد العمل', 'رقم الجوال', 'الإدارة', 'الرقم الوظيفي'];
    $allRows = [$header, ...$rows];

    // Build the shared-strings table (the layout real Excel produces).
    $strings = [];
    $indexOf = function (string $value) use (&$strings): int {
        $key = array_search($value, $strings, true);
        if ($key === false) {
            $strings[] = $value;

            return count($strings) - 1;
        }

        return $key;
    };

    $sheetRows = '';
    foreach ($allRows as $r => $cells) {
        $rowNumber = $r + 1;
        $sheetRows .= "<row r=\"{$rowNumber}\">";
        foreach ($cells as $c => $value) {
            $column = chr(ord('A') + $c);
            $index = $indexOf((string) $value);
            $sheetRows .= "<c r=\"{$column}{$rowNumber}\" t=\"s\"><v>{$index}</v></c>";
        }
        $sheetRows .= '</row>';
    }

    $sharedItems = implode('', array_map(
        fn (string $value) => '<si><t>'.htmlspecialchars($value, ENT_XML1).'</t></si>',
        $strings,
    ));

    $path = tempnam(sys_get_temp_dir(), 'xlsx');
    $zip = new ZipArchive;
    $zip->open($path, ZipArchive::OVERWRITE);
    $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        .'<Default Extension="xml" ContentType="application/xml"/>'
        .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        .'<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
        .'</Types>');
    $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        .'</Relationships>');
    $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        .'<sheets><sheet name="الموظفون" sheetId="1" r:id="rId1"/></sheets></workbook>');
    $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
        .'</Relationships>');
    $zip->addFromString('xl/sharedStrings.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        ."<sst xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">{$sharedItems}</sst>");
    $zip->addFromString('xl/worksheets/sheet1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        ."<sheetData>{$sheetRows}</sheetData></worksheet>");
    $zip->close();

    return new UploadedFile($path, 'employees.xlsx', null, null, true);
}

test('a clean CSV validates and becomes ready for invitations', function () {
    $company = Company::factory()->create();
    $tech = Department::create(['company_id' => $company->id, 'name' => 'التقنية']);

    $file = employeesCsv([
        ['أحمد السالم', 'ahmad@corp.example', '0551000001', 'التقنية', 'E-100'],
        ['سارة العتيبي', 'sara@corp.example', '966551000002', 'التقنية', ''],
    ]);

    $this->actingAs($company, 'company')
        ->post(route('company.employees.import.store'), ['file' => $file])
        ->assertRedirect(route('company.employees.import.index'));

    $import = EmployeeImport::withoutGlobalScopes()->where('company_id', $company->id)->first();

    expect($import->status)->toBe('ready')
        ->and($import->total_rows)->toBe(2)
        ->and($import->valid_rows)->toBe(2)
        ->and($import->error_rows)->toBe(0);

    $rows = $import->rows()->orderBy('row_number')->get();

    expect($rows[0]->normalized_phone)->toBe('966551000001')
        ->and($rows[0]->department_id)->toBe($tech->id)
        ->and($rows[0]->employee_number)->toBe('E-100')
        ->and($rows[1]->normalized_phone)->toBe('966551000002');
});

test('every spec validation is flagged per row: phone format, in-file dupes, existing dupes, unknown department', function () {
    $company = Company::factory()->create();
    Department::create(['company_id' => $company->id, 'name' => 'التقنية']);
    Employee::factory()->create(['company_id' => $company->id, 'phone' => '0557000009', 'email' => 'existing@corp.example']);

    $file = employeesCsv([
        ['صالح', 'saleh@corp.example', '12345', 'التقنية', ''],                    // بصيغة جوال خاطئة
        ['نورة', 'noura@corp.example', '0551000010', 'التقنية', ''],               // سليمة
        ['ريم', 'reem@corp.example', '0551000010', 'التقنية', ''],                 // جوال مكرر مع السطر 3
        ['بدر', 'noura@corp.example', '0551000011', 'التقنية', ''],                // بريد مكرر مع السطر 3
        ['هند', 'hind@corp.example', '0557000009', 'التقنية', ''],                 // جوال موظف قائم
        ['عمر', 'existing@corp.example', '0551000012', 'التقنية', ''],             // بريد موظف قائم
        ['ليان', 'layan@corp.example', '0551000013', 'الترفيه', ''],               // إدارة غير موجودة
        ['', 'no-name@corp.example', '0551000014', 'التقنية', ''],                 // بلا اسم
    ]);

    $import = app(EmployeeImportService::class)->import($company, $file);

    expect($import->status)->toBe('needs_correction')
        ->and($import->total_rows)->toBe(8)
        ->and($import->error_rows)->toBe(7)
        ->and($import->valid_rows)->toBe(1);

    $errors = $import->rows()->orderBy('row_number')->get()->keyBy('row_number');

    expect($errors[2]->errors[0])->toContain('صيغة رقم الجوال السعودي')
        ->and($errors[3]->errors)->toBeNull()
        ->and($errors[4]->errors[0])->toContain('مكرر داخل الملف')
        ->and($errors[4]->errors[0])->toContain('3')
        ->and($errors[5]->errors[0])->toContain('بريد العمل مكرر داخل الملف')
        ->and($errors[6]->errors[0])->toContain('مسجل لموظف قائم')
        ->and($errors[7]->errors[0])->toContain('مسجل لموظف قائم')
        ->and($errors[8]->errors[0])->toContain('غير موجودة')
        ->and($errors[9]->errors[0])->toContain('الاسم مطلوب');
});

test('invitations are blocked while the error report is not clean', function () {
    $messages = fakeMessages();
    $company = Company::factory()->create();

    $file = employeesCsv([
        ['أحمد', 'ahmad@corp.example', 'ليس رقماً', '', ''],
    ]);

    $import = app(EmployeeImportService::class)->import($company, $file);

    $this->actingAs($company, 'company')
        ->post(route('company.employees.import.invites', $import))
        ->assertSessionHasErrors('import');

    expect(Invitation::withoutGlobalScopes()->where('company_id', $company->id)->count())->toBe(0)
        ->and($messages->sent)->toBe([]);
});

test('a clean import sends WhatsApp invitations with a 7-day link', function () {
    $messages = fakeMessages();
    $company = Company::factory()->create();
    $tech = Department::create(['company_id' => $company->id, 'name' => 'التقنية']);

    $file = employeesCsv([
        ['أحمد السالم', 'ahmad@corp.example', '0551000001', 'التقنية', 'E-1'],
        ['سارة العتيبي', 'sara@corp.example', '0551000002', '', ''],
    ]);

    $import = app(EmployeeImportService::class)->import($company, $file);

    $this->actingAs($company, 'company')
        ->post(route('company.employees.import.invites', $import))
        ->assertRedirect(route('company.employees.import.index'));

    $invitations = Invitation::withoutGlobalScopes()
        ->where('company_id', $company->id)
        ->orderBy('id')
        ->get();

    expect($invitations)->toHaveCount(2)
        ->and($invitations[0]->phone)->toBe('966551000001')
        ->and($invitations[0]->department_id)->toBe($tech->id)
        ->and($invitations[0]->employee_number)->toBe('E-1')
        ->and($invitations[0]->expires_at->diffInDays(now(), true))->toBeLessThanOrEqual(7.01)
        ->and($invitations[0]->expires_at->isFuture())->toBeTrue()
        ->and($import->fresh()->status)->toBe('invited');

    expect($messages->sent)->toHaveCount(2)
        ->and($messages->sent[0]['phone'])->toBe('966551000001')
        ->and($messages->sent[0]['message'])->toContain('/invite/');
});

test('an Excel (.xlsx) file is parsed and validated exactly like CSV', function () {
    $company = Company::factory()->create();
    Department::create(['company_id' => $company->id, 'name' => 'المالية']);

    $file = employeesXlsx([
        ['خالد الدوسري', 'khaled@corp.example', '0551000021', 'المالية', 'E-21'],
        ['منى القحطاني', 'mona@corp.example', 'ليس رقماً', 'المالية', ''],
    ]);

    $import = app(EmployeeImportService::class)->import($company, $file);

    expect($import->total_rows)->toBe(2)
        ->and($import->valid_rows)->toBe(1)
        ->and($import->error_rows)->toBe(1);

    $rows = $import->rows()->orderBy('row_number')->get();

    expect($rows[0]->name)->toBe('خالد الدوسري')
        ->and($rows[0]->normalized_phone)->toBe('966551000021')
        ->and($rows[1]->errors[0])->toContain('صيغة رقم الجوال السعودي');
});

test('a headerless file falls back to the spec column order', function () {
    $company = Company::factory()->create();

    $file = employeesCsv([
        ['فهد', 'fahad@corp.example', '0551000031', '', ''],
    ], withHeader: false);

    $import = app(EmployeeImportService::class)->import($company, $file);

    expect($import->total_rows)->toBe(1)
        ->and($import->valid_rows)->toBe(1)
        ->and($import->rows()->first()->name)->toBe('فهد');
});

test('another company cannot see or download the import (404, not 403)', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();

    $file = employeesCsv([['أحمد', 'a@corp.example', '0551000041', '', '']]);
    $import = app(EmployeeImportService::class)->import($companyA, $file);

    $this->actingAs($companyB, 'company')
        ->get(route('company.employees.import.errors', $import))
        ->assertNotFound();

    $this->actingAs($companyB, 'company')
        ->post(route('company.employees.import.invites', $import))
        ->assertNotFound();
});

// Phase-2 acceptance (agent-backlog A4): a 100-employee file yields a
// correct row-level error report.
test('a 100-employee file yields a correct row-level error report', function () {
    $company = Company::factory()->create();
    Department::create(['company_id' => $company->id, 'name' => 'التقنية']);
    Department::create(['company_id' => $company->id, 'name' => 'المالية']);
    Employee::factory()->create(['company_id' => $company->id, 'phone' => '0552000061', 'email' => 'row61@corp.example']);

    $rows = [];

    for ($i = 1; $i <= 100; $i++) {
        $rows[] = [
            "موظف {$i}",
            "emp{$i}@corp.example",
            sprintf('05%08d', 51000000 + $i),
            $i % 2 === 0 ? 'التقنية' : 'المالية',
            "E-{$i}",
        ];
    }

    // Planted defects — 0-indexed data row i lives on file row i+2
    // (the header is file row 1).
    $rows[11][2] = '123456';                       // file row 13: صيغة جوال خاطئة
    $rows[29][2] = $rows[7][2];                    // file row 31: جوال مكرر مع السطر 9
    $rows[44][1] = $rows[8][1];                    // file row 46: بريد مكرر مع السطر 10
    $rows[60][2] = '0552000061';                   // file row 62: جوال موظف قائم
    $rows[60][1] = 'row61@corp.example';           // file row 62: وبريده أيضاً
    $rows[76][3] = 'الترفيه';                      // file row 78: إدارة غير موجودة
    $rows[89][0] = '';                             // file row 91: بلا اسم

    $import = app(EmployeeImportService::class)->import($company, employeesCsv($rows));

    expect($import->total_rows)->toBe(100)
        ->and($import->error_rows)->toBe(6)
        ->and($import->valid_rows)->toBe(94)
        ->and($import->status)->toBe('needs_correction');

    $errorRows = $import->rows()->whereNotNull('errors')->orderBy('row_number')->pluck('row_number')->all();

    expect($errorRows)->toBe([13, 31, 46, 62, 78, 91]);

    $byRow = $import->rows()->whereNotNull('errors')->get()->keyBy('row_number');

    expect($byRow[13]->errors[0])->toContain('صيغة رقم الجوال السعودي')
        ->and($byRow[31]->errors[0])->toContain('مكرر داخل الملف (ورد أولاً في السطر 9)')
        ->and($byRow[46]->errors[0])->toContain('مكرر داخل الملف (ورد أولاً في السطر 10)')
        ->and($byRow[62]->errors)->toContain('رقم الجوال مسجل لموظف قائم في الشركة.')
        ->and($byRow[62]->errors)->toContain('بريد العمل مسجل لموظف قائم في الشركة.')
        ->and($byRow[78]->errors[0])->toContain('«الترفيه» غير موجودة')
        ->and($byRow[91]->errors[0])->toContain('الاسم مطلوب');

    // The downloadable report lists exactly the 6 defective rows.
    $response = $this->actingAs($company, 'company')
        ->get(route('company.employees.import.errors', $import));

    $response->assertOk()->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    $lines = array_filter(explode("\n", trim($response->getContent())));

    expect(count($lines))->toBe(7); // header + 6 error rows

    foreach ([13, 31, 46, 62, 78, 91] as $i => $rowNumber) {
        expect($lines[$i + 1])->toStartWith((string) $rowNumber.',');
    }

    // And invitations stay blocked.
    $this->actingAs($company, 'company')
        ->post(route('company.employees.import.invites', $import))
        ->assertSessionHasErrors('import');

    expect(Invitation::withoutGlobalScopes()->where('company_id', $company->id)->count())->toBe(0);
});
