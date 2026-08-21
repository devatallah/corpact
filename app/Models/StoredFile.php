<?php

namespace App\Models;

use App\Enums\FileCategory;
use App\Exceptions\PermanentFileException;
use App\Support\FileUrl;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A15 — H §19 «الملفات» / H §21 `files`.
 *
 * Every upload is a row: category, sniffed MIME, size, checksum, owner,
 * uploader, and a version chain. Replacing a file writes a **new** row and
 * flips `is_current` on the old one — «الاستبدال ينشئ نسخة جديدة ويحتفظ
 * بالقديمة». Contracts and financial evidence can never be deleted at all.
 */
#[Fillable([
    'uuid',
    'category',
    'disk',
    'path',
    'original_name',
    'mime_type',
    'extension',
    'size_bytes',
    'checksum',
    'fileable_type',
    'fileable_id',
    'company_id',
    'uploaded_by_user_id',
    'version',
    'replaces_file_id',
    'is_current',
])]
class StoredFile extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::deleting(function (StoredFile $file) {
            // Soft delete is allowed for ordinary files; contracts and
            // financial evidence are refused outright (H §19).
            if ($file->category->isPermanent()) {
                throw new PermanentFileException($file->category);
            }

            if ($file->isForceDeleting()) {
                throw new PermanentFileException($file->category, 'الحذف النهائي غير مسموح — الاستبدال ينشئ نسخة جديدة ويحتفظ بالقديمة.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => FileCategory::class,
            'is_current' => 'boolean',
            'size_bytes' => 'integer',
            'version' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<StoredFile, $this>
     */
    public function replaces(): BelongsTo
    {
        return $this->belongsTo(StoredFile::class, 'replaces_file_id');
    }

    public function fileable()
    {
        return $this->morphTo();
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeCurrent(Builder $query): Builder
    {
        return $query->where('is_current', true);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOfCategory(Builder $query, FileCategory $category): Builder
    {
        return $query->where('category', $category->value);
    }

    /**
     * 15-minute signed URL — the only way any stored file is ever served
     * (H §19: «لا ملف عام إطلاقاً»).
     */
    public function temporaryUrl(): ?string
    {
        return FileUrl::temporary($this->path);
    }

    public function sizeLabel(): string
    {
        $kb = $this->size_bytes / 1024;

        return $kb >= 1024
            ? number_format($kb / 1024, 2).' MB'
            : number_format($kb, 0).' KB';
    }
}
