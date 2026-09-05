<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * وكيل الدعم المسؤول عن الشركة.
 *
 * عمود لا صفّ في `role_assignments` عمداً: الإسناد هناك يمنح وصولاً بنطاقه،
 * وهذا الحقل تنظيمي بحت — يقول «من يتابع هذه الشركة» ولا يوسّع ولا يضيّق ما
 * يراه أحد. وضعه في جدول الصلاحيات يخلط المعنيين، ويجعل تغيير مسؤول متابعة
 * تغييرَ صلاحية دون قصد.
 *
 * `nullOnDelete` لا `cascade`: حذف موظف من تيمات لا يحذف الشركة، يترك خانتها
 * فارغة حتى يُسنَد غيره.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('support_agent_user_id')
                ->nullable()
                ->after('contact_title')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropConstrainedForeignId('support_agent_user_id');
        });
    }
};
