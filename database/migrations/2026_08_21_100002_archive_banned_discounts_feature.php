<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A10 — إزالة ميزة التخفيضات المحظورة (H §12.1: «لا تخفيضات ولا رموز ترويجية
 * في الإصدار الأول»؛ H §2 يحظر «خصم» أصلاً):
 *
 * - كل مسارات الكتابة والواجهات وحساب التكلفة أُزيلت من الكود (routes /
 *   controller / service / صفحات UI / معادلة التسعير).
 * - الجدول نفسه لا يُحذف — «لا يُحذف سجل مالي أبداً»: يُؤرشف باسم
 *   `legacy_discounts` (نمط أرشفة A6 لدفتر الحركات القديم) مع ختم أرشفة،
 *   ويبقى `events.discount_id` و `events.discount_amount_halalas` تاريخاً
 *   للقراءة فقط على الفعاليات القديمة.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('discounts')) {
            return;
        }

        Schema::table('discounts', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable();
        });

        DB::table('discounts')->update(['archived_at' => now()]);

        Schema::rename('discounts', 'legacy_discounts');
    }

    public function down(): void
    {
        Schema::rename('legacy_discounts', 'discounts');

        Schema::table('discounts', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }
};
