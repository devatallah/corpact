<?php

use Database\Seeders\NotificationTemplateSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A14 — كتالوج القوالب بيانات مرجعية لا بيانات تجريبية.
 *
 * يُزرع في الترحيل لا في `DatabaseSeeder` لأن المنصة **لا تعمل بدونه**: كل
 * موضع إشعار صار ينادي مفتاح قالب، والبيئة بلا قوالب ترسل نصاً احتياطياً.
 * الزرع لا يدهس تحرير الأدمن (انظر `NotificationTemplateSeeder`).
 */
return new class extends Migration
{
    public function up(): void
    {
        (new NotificationTemplateSeeder)->run();
    }

    public function down(): void
    {
        DB::table('notification_templates')->delete();
    }
};
