<?php

namespace App\Http\Middleware;

use App\Support\Tenancy\CompanyContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Populates the active company context from the authenticated session —
 * never from request input (H §4: any client-supplied `company_id` is
 * ignored). Attached to the employee and company portal route groups only;
 * admin and partner portals run unscoped.
 */
class SetCompanyContext
{
    public function __construct(private CompanyContext $context) {}

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $companyId = null;

        if (auth('employee')->check()) {
            // The employee guard holds the per-company profile row of the
            // active membership; its company IS the session context. Context
            // switching swaps the guard onto a sibling membership row.
            $companyId = $this->context->bypass(fn () => auth('employee')->user()->company_id);
        } elseif (auth('company')->check()) {
            $companyId = auth('company')->id();
        }

        $this->context->set($companyId !== null ? (int) $companyId : null);

        try {
            return $next($request);
        } finally {
            $this->context->clear();
        }
    }
}
