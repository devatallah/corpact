<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:  ->middleware('role:super_admin,admin')
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! isset($user->role)) {
            abort(403, 'غير مصرح لك بالوصول.');
        }

        if (! in_array($user->role, $roles, true)) {
            abort(403, 'غير مصرح لك بالوصول.');
        }

        return $next($request);
    }
}
