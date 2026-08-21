<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A14 — بنية الإشعارات (H §14).
 *
 * أربعة جداول:
 * - `notification_templates`: نصوص الرسائل كلها — «القوالب يديرها أدمن تيمات
 *   فقط، ولا تُكتب نصوص الرسائل داخل الكود».
 * - `notification_preferences`: إيقاف الإشعارات الاختيارية فقط.
 * - `notification_logs`: كل رسالة صادرة بقالبها ومتحوّلاتها وقناتها وحالة
 *   تسليمها ووقتها — أول ما يفحصه الدعم في شكوى «ما وصلني شيء».
 * - `admin_alerts`: قناة التنبيه الحرجة لأدمن تيمات (H §20 المراقبة).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('group')->default('general');
            $table->string('audience')->nullable();

            // إلزامي = لا يستطيع المستخدم إيقافه أبداً (H §14).
            $table->string('class')->default('optional');

            $table->string('title_ar');
            $table->string('title_en')->nullable();
            $table->text('body_ar');
            $table->text('body_en')->nullable();

            // ترتيب القنوات المسموحة لهذا القالب، مثل ["whatsapp","sms","in_app"].
            $table->json('channels');

            // اسم القالب المعتمد لدى واتساب + ترتيب متحوّلاته الموضعية {{1}}...
            $table->string('whatsapp_template_name')->nullable();
            $table->json('whatsapp_variables')->nullable();

            // أسماء المتحوّلات المعلنة — تتحقق منها شاشة الأدمن ويعرضها الدعم.
            $table->json('variables')->nullable();

            // نوع الإشعار داخل المنصة (info/success/warning/error/...) لأيقونات الواجهة.
            $table->string('in_app_type')->default('info');

            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['group', 'class']);
        });

        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->string('notifiable_type');
            $table->unsignedBigInteger('notifiable_id');
            $table->string('template_key');
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->unique(['notifiable_type', 'notifiable_id', 'template_key'], 'notification_preferences_unique');
        });

        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('template_key')->nullable();
            $table->uuid('notification_id')->nullable();

            $table->string('recipient_type')->nullable();
            $table->unsignedBigInteger('recipient_id')->nullable();
            $table->string('recipient_phone', 20)->nullable();

            $table->string('channel');
            $table->string('status');
            $table->unsignedTinyInteger('attempt')->default(1);
            $table->string('reason')->nullable();

            $table->json('variables')->nullable();
            $table->text('rendered_body')->nullable();
            $table->string('locale', 5)->default('ar');
            $table->string('purpose')->nullable();

            $table->string('provider_message_id')->nullable();
            $table->text('error')->nullable();

            $table->timestamp('queued_at')->nullable();
            $table->timestamp('deferred_until')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();

            $table->index(['recipient_type', 'recipient_id']);
            $table->index('recipient_phone');
            $table->index('template_key');
            $table->index(['status', 'created_at']);
        });

        Schema::create('admin_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->string('level')->default('critical');
            $table->string('title');
            $table->text('body')->nullable();
            $table->json('context')->nullable();

            // بصمة لتجميع التنبيه نفسه بدل إغراق الصندوق.
            $table->string('fingerprint')->nullable();
            $table->unsignedInteger('occurrences')->default(1);
            $table->timestamp('last_seen_at')->nullable();

            $table->timestamp('acknowledged_at')->nullable();
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['level', 'acknowledged_at']);
            $table->index('fingerprint');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->string('template_key')->nullable()->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('template_key');
        });

        Schema::dropIfExists('admin_alerts');
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('notification_templates');
    }
};
