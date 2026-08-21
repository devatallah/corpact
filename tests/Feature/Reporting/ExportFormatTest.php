<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Services\Company\EmployeeImportFileReader;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportFormat;
use App\Services\Reporting\Export\ExportService;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpKernel\Exception\HttpException;

// H §15: «بصيغتي Excel وPDF». الكاتب أصلي بلا اعتمادية — فالاختبار يثبت أن
// المخرَج **ملف xlsx حقيقي** لا مجرد نص بامتداد، بأن يقرأه قارئ A4 نفسه.

test('the Excel export is a real xlsx that the native reader can parse back', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create(['name' => 'شركة الاختبار']);
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create([
        'company_id' => $company->id,
        'name' => 'نورة العتيبي',
        'email' => 'noura@example.test',
        'phone' => '0555555555',
    ]);

    a13Event($community, [$employee->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    $response = app(ExportService::class)->download(
        'employees_activation',
        a13Context($company, ExportAudience::AccountManager),
        ExportFormat::Xlsx,
    );

    expect($response->headers->get('Content-Type'))
        ->toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        ->and($response->headers->get('Content-Disposition'))->toContain('attachment')
        ->and($response->headers->get('X-Export-Rows'))->toBe('1');

    $path = tempnam(sys_get_temp_dir(), 'a13-').'.xlsx';
    file_put_contents($path, $response->getContent());

    // ZIP سليم بأجزاء OOXML المطلوبة.
    $zip = new ZipArchive;
    expect($zip->open($path))->toBeTrue()
        ->and($zip->locateName('[Content_Types].xml'))->not->toBeFalse()
        ->and($zip->locateName('xl/workbook.xml'))->not->toBeFalse()
        ->and($zip->locateName('xl/worksheets/sheet1.xml'))->not->toBeFalse();

    $sheet = $zip->getFromName('xl/worksheets/sheet1.xml');
    $zip->close();

    // العربية تمر UTF-8 سليمة، والورقة تُفتح من اليمين.
    expect($sheet)->toContain('نورة العتيبي')
        ->and($sheet)->toContain('rightToLeft="1"')
        ->and($sheet)->toContain('0555555555');

    // والدليل القاطع: قارئ XLSX الأصلي (A4) يستخرج الصف كاملاً.
    $rows = app(EmployeeImportFileReader::class)->read($path, 'export.xlsx');

    expect($rows)->toHaveCount(1)
        ->and($rows[0]['name'])->toBe('نورة العتيبي')
        ->and($rows[0]['email'])->toBe('noura@example.test');

    @unlink($path);

    Carbon::setTestNow();
});

test('the PDF export returns a self-contained RTL print document', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create(['name' => 'شركة الاختبار']);
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create(['company_id' => $company->id, 'name' => 'نورة العتيبي']);

    a13Event($community, [$employee->id => 'attended'], ['completed_at' => Carbon::parse('2026-08-10 18:00')]);

    $response = app(ExportService::class)->download(
        'employees_activation',
        a13Context($company, ExportAudience::AccountManager),
        ExportFormat::Pdf,
    );

    $body = $response->getContent();

    expect($response->headers->get('Content-Type'))->toContain('text/html')
        ->and($body)->toContain('dir="rtl"')
        ->and($body)->toContain('@page')
        ->and($body)->toContain('window.print()')
        ->and($body)->toContain('نورة العتيبي')
        ->and($body)->toContain('عدد السجلات: 1')
        // الترويسة الوصفية داخل المستند نفسه: من صدّر ومتى وأي نطاق.
        ->and($body)->toContain('شركة الاختبار')
        ->and($body)->toContain('أغسطس 2026');

    Carbon::setTestNow();
});

test('an empty export still produces a valid file with an explicit empty state', function () {
    Carbon::setTestNow(Carbon::parse('2026-08-20 12:00'));

    $company = Company::factory()->create();

    $pdf = app(ExportService::class)->download(
        'invoices',
        a13Context($company, ExportAudience::AccountManager),
        ExportFormat::Pdf,
    );

    expect($pdf->getContent())->toContain('لا توجد بيانات في هذه الفترة.');

    $xlsx = app(ExportService::class)->download(
        'invoices',
        a13Context($company, ExportAudience::AccountManager),
        ExportFormat::Xlsx,
    );

    expect($xlsx->headers->get('X-Export-Rows'))->toBe('0');

    Carbon::setTestNow();
});

test('an unknown export key or format is a 404, never a partial file', function () {
    $company = Company::factory()->create();

    expect(fn () => app(ExportService::class)->definition('does_not_exist'))
        ->toThrow(HttpException::class)
        ->and(ExportFormat::tryFrom('csv'))->toBeNull()
        ->and($company->id)->toBeGreaterThan(0);
});
