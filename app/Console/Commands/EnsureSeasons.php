<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Models\Community;
use App\Models\JobRun;
use App\Models\Season;
use App\Services\Competition\SeasonService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * المواسم الربعية التلقائية (H §13 — خطوة يومية إلى جانب فحص الخمول).
 *
 * خطوتان، كلتاهما idempotent بمفتاح `JobRun::runOnce`:
 * 1. **إغلاق** كل موسم انقضى تاريخ نهايته: تُؤرشف لوحاته نسخاً نهائية ثابتة
 *    ولا تُحذف نتيجة واحدة.
 * 2. **فتح** الموسم الربعي الحالي لكل مجتمع غير خامل إن لم يوجد موسم يغطي
 *    اليوم — الموسم الجديد يبدأ بترتيب صفري.
 */
class EnsureSeasons extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:ensure-seasons';

    protected $description = 'إغلاق المواسم المنتهية بأرشفة لوحاتها وفتح الموسم الربعي التالي لكل مجتمع (H §13 — يومياً)';

    public function __construct(private SeasonService $seasons)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->recordHeartbeat();

        $closed = $this->closeExpiredSeasons();
        $opened = $this->openCurrentSeasons();

        $this->info("مواسم أُغلقت وأُرشفت: {$closed} — مواسم ربعية فُتحت: {$opened}.");

        return self::SUCCESS;
    }

    private function closeExpiredSeasons(): int
    {
        $closed = 0;

        foreach ($this->seasons->seasonsDueForClose() as $season) {
            try {
                $ran = JobRun::runOnce(
                    job: $this->getName(),
                    entityType: 'season',
                    entityId: (int) $season->id,
                    period: 'close:'.$season->ends_on->toDateString(),
                    callback: function () use ($season): void {
                        $this->seasons->close($season);
                    },
                );

                if ($ran) {
                    $closed++;
                }
            } catch (Throwable $e) {
                Log::error("فشل إغلاق الموسم #{$season->id}.", ['exception' => $e->getMessage()]);
            }
        }

        return $closed;
    }

    private function openCurrentSeasons(): int
    {
        $opened = 0;
        $today = now();
        $periodKey = $today->year.'-Q'.((int) ceil($today->month / 3));

        $communities = Community::withoutGlobalScopes()
            ->where('status', '!=', Community::STATUS_INACTIVE)
            ->orderBy('id')
            ->get();

        foreach ($communities as $community) {
            $covered = Season::withoutGlobalScopes()
                ->where('community_id', $community->id)
                ->whereDate('starts_on', '<=', $today->toDateString())
                ->whereDate('ends_on', '>=', $today->toDateString())
                ->exists();

            if ($covered) {
                continue;
            }

            try {
                $ran = JobRun::runOnce(
                    job: $this->getName(),
                    entityType: 'community',
                    entityId: (int) $community->id,
                    period: 'open:'.$periodKey,
                    callback: function () use ($community, $today): void {
                        $this->seasons->ensureQuarterlySeason($community, $today);
                    },
                );

                if ($ran) {
                    $opened++;
                }
            } catch (Throwable $e) {
                Log::error("فشل فتح الموسم الربعي لمجتمع #{$community->id}.", ['exception' => $e->getMessage()]);
            }
        }

        return $opened;
    }
}
