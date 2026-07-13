<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PartnerPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  string  ...$permissions  One or more permission strings (any must match)
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $partner = auth('partner')->user();

        if (! $partner) {
            abort(403);
        }

        foreach ($permissions as $permission) {
            if ($partner->hasPermission($permission)) {
                return $next($request);
            }
        }

        abort(403, 'ليس لديك صلاحية للوصول إلى هذه الصفحة.');
    }
}
