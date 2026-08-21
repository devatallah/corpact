<?php

namespace App\Models\Scopes;

use App\Support\Tenancy\CompanyContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * H §4 — company isolation at the query level: every query touching
 * company-owned data is constrained to the active session context via an
 * Eloquent global scope. Cross-company ids therefore resolve to nothing,
 * which surfaces as 404 — never 403 — so existence is not leaked.
 */
class CompanyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $companyId = app(CompanyContext::class)->id();

        if ($companyId !== null) {
            $builder->where($model->qualifyColumn('company_id'), $companyId);
        }
    }
}
