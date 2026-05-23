<?php

namespace App\Console\Commands;

use App\Models\Challenge;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateMonthlyChallenges extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:generate-challenges';

    /**
     * The console command description.
     */
    protected $description = 'توليد تحديات شهرية جديدة';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $startsAt = Carbon::now()->startOfMonth();
        $endsAt = Carbon::now()->endOfMonth();

        // Check if challenges already exist for this month
        $exists = Challenge::query()
            ->whereDate('starts_at', $startsAt->toDateString())
            ->whereDate('ends_at', $endsAt->toDateString())
            ->exists();

        if ($exists) {
            $this->info('تحديات هذا الشهر موجودة بالفعل.');

            return self::SUCCESS;
        }

        $challenges = [
            [
                'title' => 'شارك في 3 فعاليات هذا الشهر',
                'description' => 'انضم وشارك في 3 فعاليات رياضية خلال هذا الشهر',
                'type' => 'events_count',
                'target_count' => 3,
            ],
            [
                'title' => 'شارك في 5 فعاليات هذا الشهر',
                'description' => 'انضم وشارك في 5 فعاليات رياضية خلال هذا الشهر',
                'type' => 'events_count',
                'target_count' => 5,
            ],
        ];

        foreach ($challenges as $challenge) {
            Challenge::create([
                ...$challenge,
                'company_id' => null,
                'starts_at' => $startsAt->toDateString(),
                'ends_at' => $endsAt->toDateString(),
                'status' => 'active',
            ]);
        }

        $this->info('تم توليد ' . count($challenges) . ' تحديات لهذا الشهر.');

        return self::SUCCESS;
    }
}
