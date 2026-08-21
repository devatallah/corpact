<?php

namespace App\Models\Concerns;

use App\Exceptions\AppendOnlyException;
use App\Support\Database\AppendOnlyTable;

/**
 * Model-level half of the append-only guarantee (H §19). The database
 * trigger installed by {@see AppendOnlyTable} is the
 * other half — this one produces a readable Arabic failure, the trigger
 * catches anything that never passes through Eloquent.
 *
 * Rows also carry `created_at` only: an `updated_at` column would have to be
 * written on update, which is exactly what is forbidden.
 */
trait AppendOnly
{
    public static function bootAppendOnly(): void
    {
        static::updating(function (): never {
            throw new AppendOnlyException(static::appendOnlyMessage());
        });

        static::deleting(function (): never {
            throw new AppendOnlyException(static::appendOnlyMessage());
        });
    }

    protected static function appendOnlyMessage(): string
    {
        return 'هذا السجل للكتابة فقط — لا يُعدَّل ولا يُحذف.';
    }
}
