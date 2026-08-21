<?php

use App\Enums\ReportAction;
use App\Enums\ReportCause;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A13 — التقرير الشهري (H §15، G/المنسّق §3).
 *
 * ثلاث خصائص من نص المواصفة مثبَّتة في المخطط نفسه لا في الكود وحده:
 *
 * 1. **«يُحفظ نسخة ثابتة لكل شهر»** — `snapshot` لقطة JSON للمؤشرات لحظة
 *    التوليد. لا يُعاد حسابها أبداً: تقرير أغسطس يبقى كما قُرئ في 2 سبتمبر
 *    وإن عُدِّل حضور لاحقاً. الثبات محروس في النموذج (تعديل `snapshot` أو
 *    `period_key` يرمي) و**بـ trigger في قاعدة البيانات** ضد المسار الخام.
 * 2. **`unique(company_id, period_key)`** — شهر واحد وتقرير واحد؛ هو قيد
 *    الـ idempotency الحقيقي تحت `JobRun::runOnce`.
 * 3. **التوصيات قائمة مغلقة** — `cause` و`action` بقيود `check` على قيم
 *    {@see ReportCause} و{@see ReportAction}، وحقل الملاحظة **واحد على
 *    التقرير كله** (`note`) لا على كل توصية: «حقل ملاحظة واحد اختياري».
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coordinator_monthly_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // معرّف المنسّق المسنَد إن وُجد — التقرير يُولَّد لكل شركة، والتحليل
            // والتوصيات تُضاف مع خدمة المنسّق المُدار (G/الشركة §9).
            $table->foreignId('coordinator_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('period_key', 7); // YYYY-M M بتوقيت الرياض
            $table->dateTime('period_start');
            $table->dateTime('period_end');
            // generated → submitted (وقّع المنسّق توصياته) — التسليم يقع عند
            // التوليد لأن المواصفة تجعله آلياً لا مشروطاً بالمنسّق.
            $table->string('status', 20)->default('generated');
            $table->json('snapshot');
            $table->text('note')->nullable();
            $table->dateTime('generated_at');
            $table->dateTime('delivered_at')->nullable();
            $table->dateTime('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'period_key']);
            $table->index(['coordinator_user_id', 'period_key']);
        });

        Schema::create('coordinator_report_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coordinator_monthly_report_id')
                ->constrained('coordinator_monthly_reports')
                ->cascadeOnDelete();
            $table->foreignId('community_id')->nullable()->constrained()->nullOnDelete();
            $table->string('cause', 40);
            $table->string('action', 40);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(
                ['coordinator_monthly_report_id', 'community_id', 'cause', 'action'],
                'coordinator_recommendation_unique',
            );
        });

        // القائمة المغلقة مفروضة في قاعدة البيانات أيضاً — لا نص حر يتسلل من
        // مسار خام (H §15: «النص الحر لا يُنتج بيانات قابلة للتحليل»).
        $causes = "'".implode("','", ReportCause::values())."'";
        $actions = "'".implode("','", ReportAction::values())."'";
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb', 'pgsql'], true)) {
            DB::statement("ALTER TABLE coordinator_report_recommendations ADD CONSTRAINT coordinator_recommendation_cause_check CHECK (cause IN ({$causes}))");
            DB::statement("ALTER TABLE coordinator_report_recommendations ADD CONSTRAINT coordinator_recommendation_action_check CHECK (action IN ({$actions}))");
        }

        // ثبات اللقطة على مستوى قاعدة البيانات (الحراسة الأساسية في النموذج).
        if ($driver === 'sqlite') {
            DB::unprepared(<<<'SQL'
                CREATE TRIGGER coordinator_reports_snapshot_immutable
                BEFORE UPDATE OF snapshot, period_key, period_start, period_end, company_id
                ON coordinator_monthly_reports
                WHEN OLD.snapshot IS NOT NEW.snapshot
                  OR OLD.period_key IS NOT NEW.period_key
                  OR OLD.company_id IS NOT NEW.company_id
                BEGIN
                    SELECT RAISE(ABORT, 'coordinator monthly report snapshot is immutable (H 15)');
                END;
            SQL);
        } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::unprepared(<<<'SQL'
                CREATE TRIGGER coordinator_reports_snapshot_immutable
                BEFORE UPDATE ON coordinator_monthly_reports FOR EACH ROW
                BEGIN
                    IF NOT (OLD.snapshot <=> NEW.snapshot)
                       OR NOT (OLD.period_key <=> NEW.period_key)
                       OR NOT (OLD.company_id <=> NEW.company_id) THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'coordinator monthly report snapshot is immutable (H 15)';
                    END IF;
                END;
            SQL);
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['sqlite', 'mysql', 'mariadb'], true)) {
            DB::unprepared('DROP TRIGGER IF EXISTS coordinator_reports_snapshot_immutable');
        }

        Schema::dropIfExists('coordinator_report_recommendations');
        Schema::dropIfExists('coordinator_monthly_reports');
    }
};
