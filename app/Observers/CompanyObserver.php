<?php

namespace App\Observers;

use App\Models\Company;
use App\Models\CompanySetting;
use App\Services\Identity\IdentityResolver;
use App\Support\Tenancy\CompanyContext;

class CompanyObserver
{
    public function __construct(private IdentityResolver $resolver) {}

    public function created(Company $company): void
    {
        app(CompanyContext::class)->bypass(function () use ($company): void {
            $this->resolver->linkCompanyAccountManager($company);

            // Settings row with the spec defaults (H §5) — exists from day
            // one so every consumer can read it without null checks.
            CompanySetting::firstOrCreate(['company_id' => $company->id]);
        });
    }
}
