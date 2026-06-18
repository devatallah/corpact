<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BusinessPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  string  ...$permissions  One or more permission strings (any must match)
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $business = auth('business')->user();

        if (! $business) {
            abort(403);
        }

        foreach ($permissions as $permission) {
            if ($business->hasPermission($permission)) {
                return $next($request);
            }
        }

        abort(403, 'ليس لديك صلاحية للوصول إلى هذه الصفحة.');
    }
}
