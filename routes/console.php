<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:complete-events')->dailyAt('02:00');
Schedule::command('app:expire-stale')->everyFiveMinutes();
Schedule::command('app:suggest-matches')->dailyAt('09:00');
Schedule::command('app:send-nudges')->dailyAt('10:00');
Schedule::command('app:weekly-digest')->weeklyOn(0, '18:00');
Schedule::command('app:generate-challenges')->monthlyOn(1, '00:00');
