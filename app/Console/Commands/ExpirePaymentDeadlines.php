<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Services\Payments\CollectionService;
use Illuminate\Console\Command;

/**
 * انتهاء مهل الدفع (A10 — H §12.3/§20، كل دقيقة):
 *
 * - مطالبة تجاوزت نافذتها: المقعد يُخلى (released) و payment_status = failed
 *   والمطالبة expired، ويُعرض المقعد على بدلاء قائمة الانتظار FIFO بمهلة
 *   قصيرة («الأسبق يفوز»).
 * - عروض بدلاء منقضية تنتقل للتالي.
 * - ثم يُقيَّم الاكتمال: كل الحصص مدفوعة ⇒ استقطاع حجز الدعم + confirmed؛
 *   العدد تحت الحد ⇒ cancelled_payment_failed + رد كل ما حُصِّل + فك الحجز +
 *   إبلاغ المزوّد؛ عجز فوق الحد ⇒ تغطية من المحفظة أو إلغاء (الحصص المقفلة
 *   لا تتغير أبداً).
 *
 * مسار «مهلة الدفع» القديم (30 دقيقة بعد قبول المزوّد في app:expire-stale)
 * مات مع آلة A7 — هذه المهمة هي الموحِّد الوحيد لمهل الدفع.
 * idempotency: كل أثر مالي خلف مفاتيح تفرّد في خط التحصيل نفسه.
 */
class ExpirePaymentDeadlines extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:expire-payment-deadlines';

    protected $description = 'انتهاء مهلة الدفع: إخلاء غير الدافعين وعرض البدلاء وتقييم الاكتمال (H §20 — كل دقيقة)';

    public function __construct(private CollectionService $collection)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $expired = $this->collection->expireOverdue();

        $this->recordHeartbeat();

        $this->info("مطالبات منقضاة عولجت: {$expired}");

        return self::SUCCESS;
    }
}
