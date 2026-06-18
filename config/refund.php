<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Refund Policy Tiers
    |--------------------------------------------------------------------------
    |
    | Each tier defines a minimum number of hours before the event start time
    | and the corresponding refund percentage. Tiers are evaluated from top
    | to bottom — the first matching tier is used.
    |
    | 24+ hours  => 100% refund
    | 4-24 hours =>  50% refund
    | < 4 hours  =>   0% refund
    |
    */

    'tiers' => [
        ['min_hours' => 24, 'percentage' => 100],
        ['min_hours' => 4,  'percentage' => 50],
        ['min_hours' => 0,  'percentage' => 0],
    ],

];
