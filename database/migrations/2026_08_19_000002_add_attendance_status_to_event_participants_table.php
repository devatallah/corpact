<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // H §10/§13: الحضور تلقائي بالكامل — يُضبط على attended لكل مشارك مؤكد عند اكتمال الفعالية.
        // null = لم يُحسم بعد (الفعالية لم تكتمل). الفصل الكامل لحقول المشارك الثلاثة من نصيب A7.
        Schema::table('event_participants', function (Blueprint $table) {
            $table->enum('attendance_status', ['attended', 'absent'])->nullable()->after('position');
        });
    }

    public function down(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropColumn('attendance_status');
        });
    }
};
