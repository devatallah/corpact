<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;

/**
 * Thrown whenever someone tries to approve a financial action they created
 * themselves (H §3 — «لا يعتمد أي شخص إجراءً مالياً أنشأه بنفسه»).
 */
class SelfApprovalException extends AuthorizationException
{
    public function __construct(string $message = 'لا يمكن اعتماد إجراء مالي أنشأته بنفسك.')
    {
        parent::__construct($message);
    }
}
