<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->headers->set('X-XSS-Protection', '0');

        $response->headers->remove('X-Powered-By');

        // 'unsafe-inline' is required by the landing pages' inline handlers and
        // React style attributes; tighten to nonces if those are ever removed.
        $dev = app()->environment('local');
        $response->headers->set('Content-Security-Policy', implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'".($dev ? " 'unsafe-eval' http://localhost:5173 http://127.0.0.1:5173" : ''),
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net".($dev ? ' http://localhost:5173 http://127.0.0.1:5173' : ''),
            "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net",
            "img-src 'self' data: https:",
            "connect-src 'self'".($dev ? ' http://localhost:5173 http://127.0.0.1:5173 ws://localhost:5173 ws://127.0.0.1:5173' : ''),
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "form-action 'self' mailto:",
        ]));

        return $response;
    }
}
