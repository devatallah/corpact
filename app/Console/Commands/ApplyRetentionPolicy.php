<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Services\Retention\RetentionService;
use Illuminate\Console\Command;

/**
 * A15 — H §19 «الخصوصية والاحتفاظ».
 *
 * Safe by construction: the only writes are the statistical roll-up and the
 * identity scrub. No financial row, contract or receipt is ever touched, and
 * the append-only audit log is reported on, not pruned.
 *
 * Scheduled outside the 00:30–01:30 backup window so nothing is scrubbed
 * mid-archive (see docs/deployment.md §7).
 */
class ApplyRetentionPolicy extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:apply-retention {--dry-run : يعرض ما سيُنفَّذ دون كتابة}';

    protected $description = 'تطبيق جدول الاحتفاظ (H §19): تجميع الحضور بعد 24 شهراً وإخفاء هوية من انتهت علاقته + 12 شهراً — بلا مساس بأي سجل مالي';

    public function handle(RetentionService $retention): int
    {
        $this->recordHeartbeat();

        $dryRun = (bool) $this->option('dry-run');
        $report = $retention->apply($dryRun);

        $this->info($dryRun ? 'محاكاة سياسة الاحتفاظ (بلا كتابة):' : 'نُفِّذت سياسة الاحتفاظ:');
        $this->line("  لقطات إحصائية للحضور: {$report['aggregates_written']}");
        $this->line("  هويات أُخفيت: {$report['identities_anonymized']}");
        $this->line("  صفوف تدقيق تجاوزت 24 شهراً (تُبلَّغ ولا تُحذف — السجل للكتابة فقط): {$report['audit_purge_candidates']}");
        $this->line("  ملفات مالية/عقود محميّة من أي حذف: {$report['financial_files_protected']}");

        return self::SUCCESS;
    }
}
