<?php

namespace App\Exceptions;

use App\Enums\FileCategory;
use RuntimeException;

/**
 * H §19: «لا حذف نهائي للعقود والملفات المالية».
 */
class PermanentFileException extends RuntimeException
{
    public function __construct(FileCategory $category, ?string $message = null)
    {
        parent::__construct(
            $message ?? "لا يجوز حذف ملفات «{$category->label()}» — تُستبدل بنسخة جديدة وتبقى القديمة."
        );
    }
}
