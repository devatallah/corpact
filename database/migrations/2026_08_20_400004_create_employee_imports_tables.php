<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A4 — Employee file onboarding (H §5): the uploaded CSV/Excel file is
 * validated immediately, row by row; every row is stored with its errors so
 * the per-row error report is downloadable, and invitations stay blocked
 * while a single row has errors («لا تُرسل دعوات قبل أن يخلو التقرير»).
 *
 * Also adds the optional `employee_number` (الرقم الوظيفي) to employees.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_imports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('original_filename');
            // needs_correction: صفوف بأخطاء — الدعوات محظورة.
            // ready: الملف نظيف — يمكن إرسال الدعوات.
            // invited: أُرسلت الدعوات لكل الصفوف.
            $table->enum('status', ['needs_correction', 'ready', 'invited'])->default('needs_correction');
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('valid_rows')->default(0);
            $table->unsignedInteger('error_rows')->default(0);
            $table->timestamp('invited_at')->nullable();
            $table->timestamps();
        });

        Schema::create('employee_import_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_import_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('row_number'); // رقم السطر في الملف الأصلي (بعد صف العناوين)
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 40)->nullable();          // كما ورد في الملف
            $table->string('normalized_phone', 20)->nullable(); // 9665XXXXXXXX
            $table->string('department_name')->nullable();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_number', 50)->nullable();
            $table->json('errors')->nullable(); // قائمة أخطاء السطر — null = سليم
            $table->timestamps();

            $table->index(['employee_import_id', 'row_number']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('employee_number', 50)->nullable()->after('department_id');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('employee_number');
        });

        Schema::dropIfExists('employee_import_rows');
        Schema::dropIfExists('employee_imports');
    }
};
