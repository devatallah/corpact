<?php

namespace App\Support\Identity;

use App\Models\User;
use App\Services\Auth\PortalLoginService;

/**
 * Resolves the global user acting in the current request, whichever portal
 * they came through. Primary source is the portal session stamp written at
 * login; guard profile rows are the fallback (e.g. test `actingAs`).
 */
class CurrentActor
{
    /**
     * @return array{id: int|null, name: string|null}
     */
    public static function resolve(): array
    {
        if (! app()->bound('request') || ! request()->hasSession()) {
            return ['id' => null, 'name' => null];
        }

        foreach (self::guardOrder() as $guard) {
            if (! auth($guard)->check()) {
                continue;
            }

            $userId = request()->session()->get(PortalLoginService::sessionKey($guard).'.user_id');

            if ($userId !== null) {
                $user = User::query()->find($userId);

                if ($user !== null) {
                    return ['id' => $user->id, 'name' => $user->name];
                }
            }

            // Fallback for sessions without a stamp (actingAs in tests,
            // legacy activation flows).
            $account = auth($guard)->user();

            $user = match ($guard) {
                'admin' => $account,
                'employee', 'partner' => $account->user_id !== null ? User::query()->find($account->user_id) : null,
                default => null,
            };

            if ($user !== null) {
                return ['id' => $user->id, 'name' => $user->name];
            }

            return ['id' => null, 'name' => $account->contact_name ?? $account->name ?? null];
        }

        return ['id' => null, 'name' => null];
    }

    /**
     * Prefer the portal the request is addressed to, then any other
     * authenticated guard.
     *
     * @return string[]
     */
    private static function guardOrder(): array
    {
        $path = request()->path();

        $primary = match (true) {
            str_starts_with($path, 'admin') => 'admin',
            str_starts_with($path, 'company') => 'company',
            str_starts_with($path, 'partner') => 'partner',
            str_starts_with($path, 'employee') => 'employee',
            default => null,
        };

        $order = ['admin', 'company', 'partner', 'employee'];

        if ($primary !== null) {
            $order = array_values(array_unique([$primary, ...$order]));
        }

        return $order;
    }
}
