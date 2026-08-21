<?php

namespace App\Services\Files;

use App\Enums\FileCategory;
use App\Models\Company;
use App\Models\StoredFile;
use App\Services\Audit\AuditLogService;
use App\Support\Audit\AuditAction;
use App\Support\Files\MimeSniffer;
use App\Support\Identity\CurrentActor;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * A15 — the one door every upload goes through (H §19 «الملفات»).
 *
 * 1. size against the matrix (logo 2MB · receipt 5MB · contract 10MB);
 * 2. **real MIME sniffing** of the bytes, not the extension or the
 *    browser-declared type;
 * 3. hard refusal of anything that looks like an executable or a script;
 * 4. storage on the private disk A0 configured — never public;
 * 5. replacement creates a new version and keeps the old row;
 * 6. contracts and financial evidence are never deleted.
 */
class FileStorageService
{
    /**
     * Validate and store an upload, superseding the owner's previous file of
     * the same category if there is one.
     *
     * @throws ValidationException
     */
    public function store(
        UploadedFile $upload,
        FileCategory $category,
        ?Model $owner = null,
        ?int $companyId = null,
        string $field = 'file',
    ): StoredFile {
        $this->assertAcceptable($upload, $category, $field);

        $path = $upload->store($category->directory());

        if ($path === false) {
            throw ValidationException::withMessages([
                $field => ['تعذّر حفظ الملف — حاول مرة أخرى.'],
            ]);
        }

        $companyId ??= $this->inferCompanyId($owner);

        return DB::transaction(function () use ($upload, $category, $owner, $companyId, $path) {
            $previous = $owner !== null
                ? StoredFile::query()
                    ->where('fileable_type', $owner->getMorphClass())
                    ->where('fileable_id', $owner->getKey())
                    ->ofCategory($category)
                    ->current()
                    ->lockForUpdate()
                    ->first()
                : null;

            // «الاستبدال ينشئ نسخة جديدة ويحتفظ بالقديمة»: the old row keeps
            // its path and bytes, it just stops being the current one.
            $previous?->forceFill(['is_current' => false])->save();

            ['id' => $actorId] = CurrentActor::resolve();

            $file = StoredFile::create([
                'uuid' => (string) Str::uuid(),
                'category' => $category->value,
                'disk' => config('filesystems.default'),
                'path' => $path,
                'original_name' => $upload->getClientOriginalName(),
                'mime_type' => MimeSniffer::detect($upload->getRealPath()) ?? $upload->getMimeType(),
                'extension' => strtolower($upload->getClientOriginalExtension()) ?: null,
                'size_bytes' => $upload->getSize(),
                'checksum' => @hash_file('sha256', $upload->getRealPath()) ?: null,
                'fileable_type' => $owner?->getMorphClass(),
                'fileable_id' => $owner?->getKey(),
                'company_id' => $companyId,
                'uploaded_by_user_id' => $actorId,
                'version' => $previous !== null ? $previous->version + 1 : 1,
                'replaces_file_id' => $previous?->id,
                'is_current' => true,
            ]);

            AuditLogService::record(
                action: $previous !== null ? AuditAction::FILE_REPLACED : AuditAction::FILE_UPLOADED,
                entity: $file,
                before: $previous !== null ? ['file_id' => $previous->id, 'version' => $previous->version] : null,
                after: [
                    'file_id' => $file->id,
                    'category' => $category->value,
                    'version' => $file->version,
                    'mime_type' => $file->mime_type,
                    'size_bytes' => $file->size_bytes,
                ],
                companyId: $companyId,
            );

            return $file;
        });
    }

    /**
     * All versions of an owner's file in a category, newest first.
     *
     * @return Collection<int, StoredFile>
     */
    public function versions(Model $owner, FileCategory $category)
    {
        return StoredFile::query()
            ->where('fileable_type', $owner->getMorphClass())
            ->where('fileable_id', $owner->getKey())
            ->ofCategory($category)
            ->orderByDesc('version')
            ->get();
    }

    public function current(Model $owner, FileCategory $category): ?StoredFile
    {
        return StoredFile::query()
            ->where('fileable_type', $owner->getMorphClass())
            ->where('fileable_id', $owner->getKey())
            ->ofCategory($category)
            ->current()
            ->first();
    }

    /**
     * Hand a stored file to a browser through a 15-minute signed URL, and
     * record the download — H §19 makes «كل تصدير أو تنزيل تقرير» mandatory,
     * and financial evidence gets a security row on top.
     */
    public function downloadUrl(StoredFile $file): ?string
    {
        AuditLogService::download(
            descriptor: $file->original_name,
            entity: $file,
            companyId: $file->company_id,
            context: ['category' => $file->category->value, 'version' => $file->version],
        );

        return $file->temporaryUrl();
    }

    /**
     * @throws ValidationException
     */
    private function assertAcceptable(UploadedFile $upload, FileCategory $category, string $field): void
    {
        if (! $upload->isValid()) {
            throw ValidationException::withMessages([
                $field => ['فشل رفع الملف.'],
            ]);
        }

        $size = (int) $upload->getSize();

        if ($size > $category->maxBytes()) {
            throw ValidationException::withMessages([
                $field => ["حجم الملف يتجاوز الحد المسموح لـ«{$category->label()}» ({$category->maxMegabytes()}MB)."],
            ]);
        }

        $realPath = $upload->getRealPath();

        if ($realPath === false) {
            throw ValidationException::withMessages([
                $field => ['تعذّر قراءة الملف المرفوع.'],
            ]);
        }

        // «رفض أي ملف تنفيذي» — checked before the allow-list so a polyglot
        // (valid image header + embedded script) is refused as an executable.
        if (($kind = MimeSniffer::executableKind($realPath)) !== null) {
            throw ValidationException::withMessages([
                $field => ["الملفات التنفيذية مرفوضة (اكتُشف {$kind})."],
            ]);
        }

        // «فحص نوع MIME الفعلي لا الامتداد».
        $detected = MimeSniffer::detect($realPath);

        if ($detected === null || ! in_array($detected, $category->mimeTypes(), true)) {
            throw ValidationException::withMessages([
                $field => ["صيغة الملف غير مقبولة لـ«{$category->label()}» — المسموح: {$category->formatsLabel()}."],
            ]);
        }
    }

    private function inferCompanyId(?Model $owner): ?int
    {
        if ($owner === null) {
            return null;
        }

        if ($owner->getMorphClass() === Company::class || $owner instanceof Company) {
            return (int) $owner->getKey();
        }

        $companyId = $owner->getAttribute('company_id');

        return is_numeric($companyId) ? (int) $companyId : null;
    }
}
