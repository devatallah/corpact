<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Portal session durations (H §4 / G ملحق أ)
    |--------------------------------------------------------------------------
    | Absolute lifetimes per guard, in minutes:
    | employee / leader / account manager → 30 days · provider → 14 days ·
    | Teamat admin & finance admin → 12 hours.
    */

    'session_lifetimes' => [
        'employee' => 30 * 24 * 60,
        'company' => 30 * 24 * 60,
        'partner' => 14 * 24 * 60,
        'admin' => 12 * 60,
    ],
];
