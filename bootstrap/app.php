<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'role' => CheckRole::class,
        ]);

        $middleware->redirectGuestsTo(function ($request) {
            $path = $request->path();

            return match (true) {
                str_starts_with($path, 'employee') => route('employee.login'),
                str_starts_with($path, 'business') => route('business.login'),
                str_starts_with($path, 'company') => route('company.login'),
                default => route('admin.login'),
            };
        });

        $middleware->redirectUsersTo(function ($request) {
            $path = $request->path();

            return match (true) {
                str_starts_with($path, 'employee') => route('employee.home'),
                str_starts_with($path, 'business') => route('business.dash'),
                str_starts_with($path, 'company') => route('company.dash'),
                str_starts_with($path, 'admin') => route('admin.dash'),
                default => '/',
            };
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
