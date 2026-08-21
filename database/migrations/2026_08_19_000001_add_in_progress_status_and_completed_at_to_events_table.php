<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // H §9: الفعالية تنتقل إلى in_progress عند بدء وقتها ثم completed عند انتهائه.
        // القيمة الجديدة الوحيدة هي in_progress — بقية القيم كما هي (إعادة هيكلة الحالات بالكامل من نصيب A7).
        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', [
                'open',
                'full',
                'waiting_business',
                'confirmed',
                'rejected',
                'alternative_proposed',
                'in_progress',
                'completed',
                'cancelled',
            ])->default('open')->change();
        });

        Schema::table('events', function (Blueprint $table) {
            // وقت الانتقال الفعلي إلى completed — تعتمد عليه نافذة تعديل الحضور 24 ساعة (H §13).
            $table->timestamp('completed_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('completed_at');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->enum('status', [
                'open',
                'full',
                'waiting_business',
                'confirmed',
                'rejected',
                'alternative_proposed',
                'completed',
                'cancelled',
            ])->default('open')->change();
        });
    }
};
