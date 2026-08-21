<?php

namespace App\Models\Concerns;

use App\Models\Scopes\CompanyScope;

/**
 * Marks a model as company-owned: all queries are constrained to the active
 * company context (see {@see CompanyScope}). The
 * cross-company-probe auditor also keys off this trait.
 */
trait ScopedToCompany
{
    public static function bootScopedToCompany(): void
    {
        static::addGlobalScope(new CompanyScope);
    }
}
