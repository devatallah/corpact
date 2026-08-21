<?php

namespace App\Observers;

use App\Models\Partner;
use App\Services\Identity\IdentityResolver;
use App\Support\Tenancy\CompanyContext;

class PartnerObserver
{
    public function __construct(private IdentityResolver $resolver) {}

    public function created(Partner $partner): void
    {
        app(CompanyContext::class)->bypass(function () use ($partner): void {
            $this->resolver->linkPartner($partner);
        });
    }
}
