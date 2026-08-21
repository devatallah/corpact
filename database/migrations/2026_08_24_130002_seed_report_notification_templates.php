<?php

use Database\Seeders\NotificationTemplateSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A13 — مفتاحا قالب التقرير الشهري (`report.monthly.ready`،
 * `report.monthly.admin_copy`).
 *
 * قاعدة A14: **مفاتيح القوالب بيانات مرجعية تُزرع في ترحيل** لا في
 * `DatabaseSeeder`، ولا تُنشأ من شاشة الأدمن (المفتاح عقد بين الكود والقالب).
 * إعادة تشغيل البذرة تُزامن الحقول البنيوية فقط ولا تدهس نص الأدمن.
 */
return new class extends Migration
{
    public function up(): void
    {
        (new NotificationTemplateSeeder)->run();
    }

    public function down(): void
    {
        DB::table('notification_templates')
            ->whereIn('key', ['report.monthly.ready', 'report.monthly.admin_copy'])
            ->delete();
    }
};
