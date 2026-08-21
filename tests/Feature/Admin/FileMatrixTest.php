<?php

use App\Enums\FileCategory;
use App\Exceptions\PermanentFileException;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\StoredFile;
use App\Services\Files\FileStorageService;
use App\Support\Audit\AuditAction;
use App\Support\Files\MimeSniffer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/**
 * H §19 «الملفات» — the upload matrix verbatim:
 *
 *   شعار: jpg·png·webp حتى 2MB · إشعار تحويل: jpg·png·pdf حتى 5MB ·
 *   عقد: pdf حتى 10MB · فحص نوع MIME الفعلي لا الامتداد، ورفض أي ملف تنفيذي ·
 *   الاستبدال ينشئ نسخة جديدة ويحتفظ بالقديمة · لا حذف نهائي للعقود والملفات
 *   المالية.
 */
beforeEach(function () {
    Storage::fake();
});

test('the matrix matches the spec table exactly', function () {
    expect(FileCategory::Logo->mimeTypes())->toBe(['image/jpeg', 'image/png', 'image/webp'])
        ->and(FileCategory::Logo->maxMegabytes())->toBe(2)
        ->and(FileCategory::BankReceipt->mimeTypes())->toBe(['image/jpeg', 'image/png', 'application/pdf'])
        ->and(FileCategory::BankReceipt->maxMegabytes())->toBe(5)
        ->and(FileCategory::Contract->mimeTypes())->toBe(['application/pdf'])
        ->and(FileCategory::Contract->maxMegabytes())->toBe(10);
});

// ── Real MIME sniffing, not the extension ────────────────────────────────

test('a PDF renamed to .png is refused for a logo — the bytes decide, not the name', function () {
    $company = Company::factory()->create();

    expect(fn () => app(FileStorageService::class)->store(
        a15FakePdf('logo.png'),
        FileCategory::Logo,
        $company,
    ))->toThrow(ValidationException::class);

    expect(StoredFile::query()->count())->toBe(0);
});

test('a PNG renamed to .pdf is refused for a contract', function () {
    $company = Company::factory()->create();

    expect(fn () => app(FileStorageService::class)->store(
        a15FakePng('contract.pdf'),
        FileCategory::Contract,
        $company,
    ))->toThrow(ValidationException::class);
});

test('an empty placeholder file is refused even with a correct extension', function () {
    $company = Company::factory()->create();

    // This is what `UploadedFile::fake()->create()` produces: right name, no
    // real content. A check that trusted the extension would let it through.
    expect(fn () => app(FileStorageService::class)->store(
        UploadedFile::fake()->create('contract.pdf', 40, 'application/pdf'),
        FileCategory::Contract,
        $company,
    ))->toThrow(ValidationException::class);
});

test('an executable disguised as an image is refused outright', function () {
    $company = Company::factory()->create();

    expect(fn () => app(FileStorageService::class)->store(
        a15FakeExecutable('logo.png'),
        FileCategory::Logo,
        $company,
    ))->toThrow(ValidationException::class);
});

test('a PHP polyglot hidden behind a valid image header is refused', function () {
    $company = Company::factory()->create();

    $polyglot = UploadedFile::fake()->createWithContent(
        'logo.png',
        "\x89PNG\r\n\x1a\n".str_repeat("\0", 32).'<?php system("id"); ?>',
    );

    expect(fn () => app(FileStorageService::class)->store($polyglot, FileCategory::Logo, $company))
        ->toThrow(ValidationException::class);
});

test('the sniffer recognises every allowed format and refuses the rest', function () {
    $pdf = tempnam(sys_get_temp_dir(), 'a15');
    file_put_contents($pdf, "%PDF-1.7\n");
    $png = tempnam(sys_get_temp_dir(), 'a15');
    file_put_contents($png, "\x89PNG\r\n\x1a\n");
    $webp = tempnam(sys_get_temp_dir(), 'a15');
    file_put_contents($webp, 'RIFF'.pack('V', 100).'WEBPVP8 ');
    $elf = tempnam(sys_get_temp_dir(), 'a15');
    file_put_contents($elf, "\x7FELF\x02");
    $text = tempnam(sys_get_temp_dir(), 'a15');
    file_put_contents($text, 'just some text');

    expect(MimeSniffer::detect($pdf))->toBe('application/pdf')
        ->and(MimeSniffer::detect($png))->toBe('image/png')
        ->and(MimeSniffer::detect($webp))->toBe('image/webp')
        ->and(MimeSniffer::detect($text))->toBeNull()
        ->and(MimeSniffer::isExecutable($elf))->toBeTrue()
        ->and(MimeSniffer::executableKind($elf))->toBe('ELF')
        ->and(MimeSniffer::isExecutable($png))->toBeFalse();

    foreach ([$pdf, $png, $webp, $elf, $text] as $path) {
        @unlink($path);
    }
});

// ── Size limits ──────────────────────────────────────────────────────────

test('a logo over 2MB is refused', function () {
    $company = Company::factory()->create();

    expect(fn () => app(FileStorageService::class)->store(
        a15FakePng('logo.png', 3 * 1024 * 1024),
        FileCategory::Logo,
        $company,
    ))->toThrow(ValidationException::class);
});

test('a bank receipt over 5MB is refused but a 1MB one is accepted', function () {
    $company = Company::factory()->create();
    $service = app(FileStorageService::class);

    expect(fn () => $service->store(a15FakeJpeg('receipt.jpg', 6 * 1024 * 1024), FileCategory::BankReceipt, $company))
        ->toThrow(ValidationException::class);

    $ok = $service->store(a15FakeJpeg('receipt.jpg', 1024 * 1024), FileCategory::BankReceipt, $company);

    expect($ok->mime_type)->toBe('image/jpeg')
        ->and($ok->size_bytes)->toBeGreaterThan(1000000);
});

test('a contract over 10MB is refused', function () {
    $company = Company::factory()->create();

    expect(fn () => app(FileStorageService::class)->store(
        a15FakePdf('contract.pdf', 11 * 1024 * 1024),
        FileCategory::Contract,
        $company,
    ))->toThrow(ValidationException::class);
});

// ── Versioning: replacement keeps the old file ───────────────────────────

test('replacing a file creates a new version and keeps the old row and its bytes', function () {
    $company = Company::factory()->create();
    $service = app(FileStorageService::class);

    $v1 = $service->store(a15FakePdf('contract-2025.pdf'), FileCategory::Contract, $company);
    $v2 = $service->store(a15FakePdf('contract-2026.pdf'), FileCategory::Contract, $company);

    expect($v1->fresh()->version)->toBe(1)
        ->and($v2->version)->toBe(2)
        ->and($v2->replaces_file_id)->toBe($v1->id)
        ->and($v1->fresh()->is_current)->toBeFalse()
        ->and($v2->is_current)->toBeTrue()
        ->and($service->current($company, FileCategory::Contract)->id)->toBe($v2->id)
        ->and($service->versions($company, FileCategory::Contract))->toHaveCount(2);

    // The superseded bytes are still on the private disk.
    Storage::assertExists($v1->path);
    Storage::assertExists($v2->path);
});

test('storing and replacing are both audited', function () {
    $company = Company::factory()->create();
    $service = app(FileStorageService::class);

    $service->store(a15FakePdf('c1.pdf'), FileCategory::Contract, $company);
    $service->store(a15FakePdf('c2.pdf'), FileCategory::Contract, $company);

    expect(AuditLog::query()->where('action', AuditAction::FILE_UPLOADED)->count())->toBe(1)
        ->and(AuditLog::query()->where('action', AuditAction::FILE_REPLACED)->count())->toBe(1);
});

// ── No hard delete for contracts and financial evidence ──────────────────

test('a contract can never be deleted — soft or hard', function () {
    $company = Company::factory()->create();
    $contract = app(FileStorageService::class)->store(a15FakePdf(), FileCategory::Contract, $company);

    expect(fn () => $contract->delete())->toThrow(PermanentFileException::class)
        ->and(fn () => $contract->forceDelete())->toThrow(PermanentFileException::class);

    expect(StoredFile::query()->whereKey($contract->id)->exists())->toBeTrue();
});

test('a bank receipt can never be deleted either', function () {
    $company = Company::factory()->create();
    $receipt = app(FileStorageService::class)->store(a15FakeJpeg(), FileCategory::BankReceipt, $company);

    expect(fn () => $receipt->delete())->toThrow(PermanentFileException::class);

    expect(StoredFile::query()->whereKey($receipt->id)->exists())->toBeTrue();
});

test('an ordinary logo may be soft-deleted but never hard-deleted', function () {
    $company = Company::factory()->create();
    $logo = app(FileStorageService::class)->store(a15FakePng(), FileCategory::Logo, $company);

    $logo->delete();

    expect(StoredFile::withTrashed()->whereKey($logo->id)->exists())->toBeTrue()
        ->and(StoredFile::query()->whereKey($logo->id)->exists())->toBeFalse()
        ->and(fn () => StoredFile::withTrashed()->find($logo->id)->forceDelete())
        ->toThrow(PermanentFileException::class);
});

// ── Serving: private disk + signed URL + audited download ────────────────

test('a stored file is served only through a temporary signed URL, and the download is audited', function () {
    $company = Company::factory()->create();
    $receipt = app(FileStorageService::class)->store(a15FakeJpeg(), FileCategory::BankReceipt, $company);

    app(FileStorageService::class)->downloadUrl($receipt);

    $log = AuditLog::query()->where('action', AuditAction::FILE_DOWNLOADED)->latest('id')->first();

    expect($log)->not->toBeNull()
        ->and($log->company_id)->toBe($company->id)
        ->and($log->after_values['category'])->toBe('bank_receipt');
});

test('the real upload path for a bank receipt goes through the matrix', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->post('/company/wallet/topup', [
            'amount' => 500,
            'transfer_date' => now()->subDay()->toDateString(),
            'sender_account_last4' => '1234',
            'bank_reference' => 'TRF-A15-'.uniqid(),
            'receipt' => a15FakeExecutable('receipt.pdf'),
        ])
        ->assertSessionHasErrors('receipt');

    expect(StoredFile::query()->count())->toBe(0);
});
