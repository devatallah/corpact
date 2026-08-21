<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A12 — نافذة تعديل الحضور وأثر الغياب على سجل الموظف (H §13).
 *
 * - `events.attendance_locked_at`: تختمه مهمة `app:close-attendance-window`
 *   بعد 24 ساعة من `completed_at`؛ بعده لا يعدّل القائمة إلا أدمن تيمات بسبب
 *   موثَّق («استثناء لا إجراء روتيني»).
 * - `event_participants.attendance_reason` / `attendance_marked_at` /
 *   `attendance_marked_by_user_id`: «يظهر في سجله» — الغياب يُعرض على سجل
 *   مشاركة الموظف بسببه وفاعله بلا استعلام على سجل التغييرات في كل صف.
 *   (السطر الكامل يبقى في `participant_events` كما تفرض A7.)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dateTime('attendance_locked_at')->nullable()->after('completed_at');
        });

        Schema::table('event_participants', function (Blueprint $table) {
            $table->text('attendance_reason')->nullable()->after('attendance_status');
            $table->dateTime('attendance_marked_at')->nullable()->after('attendance_reason');
            $table->unsignedBigInteger('attendance_marked_by_user_id')->nullable()->after('attendance_marked_at');
        });
    }

    public function down(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropColumn(['attendance_reason', 'attendance_marked_at', 'attendance_marked_by_user_id']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('attendance_locked_at');
        });
    }
};
