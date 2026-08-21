<?php

namespace App\Exceptions;

use App\Support\Database\AppendOnlyTable;
use LogicException;

/**
 * H §19: «سجل التدقيق للكتابة فقط — لا تعديل ولا حذف». Thrown by the model
 * guard on any attempt to update or delete an append-only row; the DB
 * trigger installed by {@see AppendOnlyTable} covers
 * the raw-query path.
 */
class AppendOnlyException extends LogicException
{
    public function __construct(string $message = 'هذا السجل للكتابة فقط — لا يُعدَّل ولا يُحذف.')
    {
        parent::__construct($message);
    }
}
