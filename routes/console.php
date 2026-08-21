<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// --- Ops baseline (Phase 0 — H §20/§22) -----------------------------------
// Daily backup (DB + storage/app), 30-day retention — config/backup.php.
// clean before run so the retention window is applied first; monitor alerts
// (mail) if the newest backup is older than a day or storage exceeds cap.
Schedule::command('backup:clean')->dailyAt('00:30');
Schedule::command('backup:run')->dailyAt('01:00');
Schedule::command('backup:monitor')->dailyAt('07:00');

// Horizon queue metrics (harmless no-op while the database queue driver is
// the local fallback; production runs Redis + Horizon under Supervisor).
Schedule::command('horizon:snapshot')->everyFiveMinutes();
// --------------------------------------------------------------------------

// جدول المهام المجدولة — H §20
Schedule::command('app:generate-template-events')->dailyAt('02:00');
Schedule::command('app:close-registration')->everyFiveMinutes();
Schedule::command('app:expire-payment-deadlines')->everyMinute();
Schedule::command('app:expire-provider-deadlines')->everyFiveMinutes();
Schedule::command('app:transition-event-lifecycle')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('app:close-attendance-window')->hourly();
Schedule::command('app:generate-settlements')->cron('0 3 1,16 * *'); // كل 15 يوماً — 03:00
Schedule::command('app:generate-monthly-invoices')->monthlyOn(3, '03:00');
// A11 — H §12.8: سلّم التأخر (تنبيه 7 ثم 15 ثم حجب إنشاء الفعاليات بعد 30).
// ليست في جدول §20 صراحةً؛ النص يفرض سلّماً يومياً (نظير app:retry-failed-refunds).
Schedule::command('app:process-invoice-arrears')->dailyAt('06:00');
// A13 — H §15: التقرير الشهري يُولَّد آلياً في **اليوم الثاني** من كل شهر عن
// دورة الشهر المنقضي، ويُسلَّم لمسؤول الحساب ونسخة لأدمن تيمات.
Schedule::command('app:generate-coordinator-reports')->monthlyOn(2, '04:00');
Schedule::command('app:check-dormant-communities')->dailyAt('05:00');
// A12 — H §13: إغلاق المواسم المنتهية بأرشفة لوحاتها وفتح الموسم الربعي التالي.
Schedule::command('app:ensure-seasons')->dailyAt('05:15');
Schedule::command('app:send-reminders')->everyFifteenMinutes();
// A10 — H §12.4: إعادة محاولة الاستردادات الفاشلة آلياً؛ القائمة مرئية
// للأدمن المالي ولا فشل يُترك صامتاً.
Schedule::command('app:retry-failed-refunds')->everyFifteenMinutes();
Schedule::command('app:reconcile-balances')->dailyAt('04:00');
// H §12.5: الرصيد السالب لا يبقى ساعة بلا تنبيه — فحص سريع كل ساعة (A6).
Schedule::command('app:reconcile-balances --negatives-only')->hourly();
Schedule::command('app:watchdog-scheduled-jobs')->hourly()->withoutOverlapping();
// A15 — H §19: جدول الاحتفاظ (تجميع الحضور بعد 24 شهراً + إخفاء هوية من
// انتهت علاقته + 12 شهراً). أسبوعي وخارج نافذة النسخ الاحتياطي (00:30–01:30)
// كي لا يُخفى شيء أثناء الأرشفة — ولا يمس أي سجل مالي.
Schedule::command('app:apply-retention')->weeklyOn(1, '03:30')->withoutOverlapping();

// مهام سابقة على اعتماد جدول H §20 — تُدمج تباعاً في المهام أعلاه:
// app:complete-events **حُذفت** (A11): كانت تولّد تسويات شهرية عشرية لكل
// (مزوّد + شركة) بلا اعتماد ولا لقطة، وحلّت محلها app:generate-settlements
// بالنموذج المنصوص (كشف كل 15 يوماً لكل مزوّد) — وجدولاها مؤرشفان
// legacy_settlements / legacy_platform_revenue.
// app:expire-stale (مهلة الدفع بنموذج قديم) → توحدها A10 في app:expire-payment-deadlines.
Schedule::command('app:expire-stale')->everyFiveMinutes();
Schedule::command('app:suggest-matches')->dailyAt('09:00');
Schedule::command('app:send-nudges')->dailyAt('10:00');
Schedule::command('app:weekly-digest')->weeklyOn(0, '18:00');
Schedule::command('app:generate-challenges')->monthlyOn(1, '00:00');
