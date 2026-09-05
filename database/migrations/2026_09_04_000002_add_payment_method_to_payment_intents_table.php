<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * وسيلة الدفع التي اختارها الموظف.
 *
 * كانت الوسائل تُعرض شارات للاطلاع فقط، فلا يُعرف بعد السداد بأي وسيلة دُفع —
 * وهو أول ما يُسأل عنه في بلاغ «خُصم مرتين» أو «لم يصلني الاسترداد». تُحفظ
 * الاختيار لحظة الانتقال للبوابة، وتُعرض في شاشة النجاح.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_intents', function (Blueprint $table) {
            $table->string('payment_method', 20)->nullable()->after('gateway');
        });
    }

    public function down(): void
    {
        Schema::table('payment_intents', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });
    }
};
