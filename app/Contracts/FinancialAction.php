<?php

namespace App\Contracts;

/**
 * Anything financial that goes through a request→approval cycle (bank
 * top-ups, settlements, refunds, invoices — A6/A11) implements this so the
 * self-approval guard can compare creator and approver.
 */
interface FinancialAction
{
    /**
     * Global user id of whoever created/requested the action.
     */
    public function createdByUserId(): ?int;
}
