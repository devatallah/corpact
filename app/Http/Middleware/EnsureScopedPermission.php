<?php

namespace App\Http\Middleware;

use App\Models\RoleAssignment;
use App\Services\Authorization\AuthorizationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route-level (permission + scope) gate replacing the old bare-role
 * middleware. Usage: `permission:platform.manage` (platform scope) —
 * currently wired on the admin portal, whose actor is the global user
 * itself.
 */
class EnsureScopedPermission
{
    public function __construct(private AuthorizationService $authorization) {}

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission, string $scopeType = RoleAssignment::SCOPE_PLATFORM): Response
    {
        $user = auth('admin')->user();

        if ($user === null || ! $this->authorization->can($user, $permission, $scopeType)) {
            abort(403, 'غير مصرح لك بالوصول.');
        }

        return $next($request);
    }
}
