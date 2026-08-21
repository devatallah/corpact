<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A4 — Company entity completion (H §5): commercial registration, logo,
 * timezone (fixed Asia/Riyadh in v1, the column exists for expansion) and
 * the contract values. Contract values come from the owner during
 * contracting, hence nullable; amounts are integer halalas (H §21 — never
 * float).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('commercial_registration', 30)->nullable()->after('name');
            $table->string('logo')->nullable()->after('commercial_registration');
            $table->string('timezone', 40)->default('Asia/Riyadh')->after('logo');
            // رسوم النظام لكل موظف مفعّل في الدورة — بالهللة.
            $table->unsignedInteger('contract_fee_per_activated_employee')->nullable()->after('timezone');
            // الحد الأدنى الشهري في العقد — بالهللة.
            $table->unsignedInteger('contract_monthly_minimum')->nullable()->after('contract_fee_per_activated_employee');
            // خدمة المنسّق المُدار — خدمة اختيارية منفصلة في العقد.
            $table->boolean('contract_coordinator_service')->nullable()->after('contract_monthly_minimum');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'commercial_registration',
                'logo',
                'timezone',
                'contract_fee_per_activated_employee',
                'contract_monthly_minimum',
                'contract_coordinator_service',
            ]);
        });
    }
};
