<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A17 — إعادة ميزة التخفيضات التي أزالها A10، بقرار المالك.
 *
 * A10 أرشف الجدول باسم `legacy_discounts` استناداً إلى H §12.1 («لا تخفيضات
 * ولا رموز ترويجية في الإصدار الأول»). المالك نقض القرار وطلب الميزة في
 * شاشة إنشاء الفعالية وفي لوحة المزوّد — فهي تعود divergence معلنة عن H،
 * لا التزاماً به.
 *
 * ثلاثة قيود تحكم العودة:
 *
 * 1) الصفوف التي ختمها A10 بـ `archived_at` تبقى خامدة. رفع الختم عنها كان
 *    سيُحيي تخفيضات وافق عليها المزوّد قبل سنة على أسعار تغيّرت — الجدول
 *    يعود، وسجلّه القديم يبقى قراءةً فقط.
 * 2) `value` decimal بقيت كما هي للتاريخ، ويُضاف `value_halalas` عدداً
 *    صحيحاً: المال في هذا النظام هللات (A9)، والنسبة المئوية تبقى في `value`.
 * 3) `events.discount_id` و`events.discount_amount_halalas` موجودان أصلاً —
 *    A10 أبقاهما عمداً — فلا تغيير على الفعاليات.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('discounts') || ! Schema::hasTable('legacy_discounts')) {
            return;
        }

        Schema::rename('legacy_discounts', 'discounts');

        Schema::table('discounts', function (Blueprint $table) {
            // مبلغ ثابت بالهللة — `value` decimal تبقى للتاريخ فقط.
            $table->unsignedBigInteger('value_halalas')->default(0)->after('value');
        });

        // النسبة تبقى في `value`؛ المبلغ الثابت يُنقل إلى الهللات.
        DB::table('discounts')->where('type', 'fixed')->update([
            'value_halalas' => $this->toHalalas('value'),
        ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('discounts')) {
            return;
        }

        Schema::table('discounts', function (Blueprint $table) {
            $table->dropColumn('value_halalas');
        });

        Schema::rename('discounts', 'legacy_discounts');
    }

    /**
     * تحويل ريالات عشرية إلى هللات صحيحة، بتعبير SQL يفهمه المحركان.
     *
     * `CAST(... AS INTEGER)` صالح في SQLite ومرفوض في MySQL — الأخير يريد
     * `SIGNED`. الفرق لا يظهر محلياً على SQLite، فكانت الهجرة تسقط على
     * الخادم وحده بـ«error in your SQL syntax near INTEGER» بعد أن تكون قد
     * أضافت أعمدتها — فتترك القاعدة نصف مهاجَرة ولا تُسجَّل، ويفشل كل تشغيل
     * تالٍ بـ«Duplicate column».
     */
    private function toHalalas(string $column): Expression
    {
        $type = DB::connection()->getDriverName() === 'sqlite' ? 'INTEGER' : 'SIGNED';

        return DB::raw("CAST(ROUND({$column} * 100) AS {$type})");
    }
};
