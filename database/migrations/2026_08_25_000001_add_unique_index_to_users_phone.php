<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * `users.phone` هو **بيان الاعتماد** على كل بوابة تدخل برمز (H §4): من يملك
 * الرقم يملك الحساب. كان عليه فهرس عادي فقط، فلا شيء في قاعدة البيانات يمنع
 * صفّين يحملان الرقم نفسه — وعندها يصبح «أي حساب يفتحه هذا الرقم؟» سؤالاً
 * إجابته سباق. الفهرس الفريد يجعل الدفاعات في `IdentityResolver` (البحث
 * بالرقم قبل الإنشاء، ورفض نقل رقم يملكه غيره) مسنودة بالمخزن نفسه.
 *
 * القيم الفارغة تبقى مسموحة ومتعددة: هوية بلا رقم بعد (مسؤول حساب أنشأه
 * الأدمن بلا جوال) حالة مشروعة، وNULL متمايزة في الفهارس الفريدة على SQLite
 * وMySQL معاً.
 *
 * **إن وُجد تكرار في بيانات قائمة** فالدمج قرار هوية (عضويات وأدوار وجلسات)
 * لا يُتخذ داخل هجرة صامتة: نتخطى الفهرس ونُسجّل تحذيراً صريحاً بدل أن نُسقط
 * نشرة أو نحذف صفاً.
 */
return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('users')
            ->select('phone')
            ->whereNotNull('phone')
            ->groupBy('phone')
            ->havingRaw('count(*) > 1')
            ->pluck('phone');

        if ($duplicates->isNotEmpty()) {
            Log::warning(
                'تخطّي الفهرس الفريد على users.phone — توجد أرقام مكررة يجب دمج هوياتها أولاً.',
                ['duplicate_count' => $duplicates->count()],
            );

            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unique('phone', 'users_phone_unique');
        });
    }

    public function down(): void
    {
        // قد يكون up() تخطّاه عمداً (تكرار قائم).
        if (! Schema::hasIndex('users', 'users_phone_unique')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_phone_unique');
        });
    }
};
