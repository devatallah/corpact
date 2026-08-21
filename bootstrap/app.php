<?php

use App\Http\Middleware\EnforcePortalSession;
use App\Http\Middleware\EnsureScopedPermission;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PartnerPermission;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetCompanyContext;
use App\Support\Tenancy\CrossCompanyProbeAuditor;
use Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            EnforcePortalSession::class,
            HandleInertiaRequests::class,
            SecurityHeaders::class,
        ]);

        // A10 — H §12.6: ويبهوكات البوابة تأتي من خادم البوابة بلا جلسة —
        // أصالتها بتحقق التوقيع في WebhookProcessor لا بـ CSRF.
        $middleware->validateCsrfTokens(except: [
            'webhooks/payments/*',
        ]);

        $middleware->alias([
            'partner.permission' => PartnerPermission::class,
            'permission' => EnsureScopedPermission::class,
            'company.context' => SetCompanyContext::class,
        ]);

        // Ordering matters (H §4):
        // 1) expired/revoked portal sessions are terminated BEFORE the auth
        //    check, so a revoked user is redirected — never half-served;
        // 2) the company context is active BEFORE implicit route-model
        //    binding, so bindings resolve through the company scope
        //    (cross-company ids → 404 at the query level).
        $middleware->prependToPriorityList(
            AuthenticatesRequests::class,
            EnforcePortalSession::class,
        );
        $middleware->prependToPriorityList(
            SubstituteBindings::class,
            SetCompanyContext::class,
        );

        $middleware->redirectGuestsTo(function ($request) {
            $path = $request->path();

            return match (true) {
                str_starts_with($path, 'employee') => route('employee.login'),
                str_starts_with($path, 'partner') => route('partner.login'),
                str_starts_with($path, 'company') => route('company.login'),
                default => route('admin.login'),
            };
        });

        $middleware->redirectUsersTo(function ($request) {
            $path = $request->path();

            return match (true) {
                str_starts_with($path, 'employee') => route('employee.home'),
                str_starts_with($path, 'partner') => route('partner.dash'),
                str_starts_with($path, 'company') => route('company.dash'),
                str_starts_with($path, 'admin') => route('admin.dash'),
                default => '/',
            };
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // H §4: a cross-company probe still 404s, but leaves an audit entry.
        // (ModelNotFoundException is prepared into NotFoundHttpException
        // before render callbacks run, so hook the prepared exception.)
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if (($previous = $e->getPrevious()) instanceof ModelNotFoundException) {
                CrossCompanyProbeAuditor::record($previous, $request);
            }

            return null; // fall through to the default 404 rendering
        });
    })->create();
