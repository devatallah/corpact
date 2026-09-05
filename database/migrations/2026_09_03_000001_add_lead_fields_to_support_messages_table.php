<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * نموذج «تواصل معنا» يجمع ثلاثة حقول لا عمود لها: اسم الشركة، ونطاق عدد
 * الموظفين، والمسار المالي المفضّل. طيّها في نص الرسالة يجعلها غير قابلة
 * للفرز ولا للتصفية، وهي بالضبط ما يحتاجه من يتابع الطلب — فتأخذ أعمدتها.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_messages', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('email');
            $table->string('employees_range', 40)->nullable()->after('phone');
            $table->string('financial_track', 40)->nullable()->after('employees_range');
        });
    }

    public function down(): void
    {
        Schema::table('support_messages', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'employees_range', 'financial_track']);
        });
    }
};
