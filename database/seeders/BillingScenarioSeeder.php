<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Partner;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Models\User;
use App\Services\Billing\InvoiceArrearsService;
use App\Services\Billing\InvoiceService;
use App\Services\Billing\SettlementStatementService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * الطرف المالي: كشوف تسوية المزوّدين وفواتير رسوم النظام على الشركات.
 *
 * تُبنى بالخدمات نفسها التي تبنيها في الإنتاج، لأن الأرقام هنا مشتقة لا
 * مكتوبة: الإجمالي والعمولة والضريبة والصافي تُحسب من بنود فعاليات مكتملة
 * فعلاً. كشف مكتوب بيده يبدو صحيحاً حتى يُفتح بجانب الفعاليات التي يُفترض
 * أنه يمثّلها.
 */
class BillingScenarioSeeder extends Seeder
{
    public function run(): void
    {
        Model::setEventDispatcher(app('events'));

        $platformAdmin = User::query()->where('email', 'admin@teamat.com')->firstOrFail();
        $financeAdmin = User::query()->where('email', 'accountant@teamat.com')->first() ?? $platformAdmin;

        $this->approveBankAccounts();
        // ثلاثة أشخاص لا اثنان: من يولّد غير من يعتمد غير من يصرف. الفصل
        // شرط في الخدمة نفسها (`SelfApprovalGuard`) لا تجميل — واستعمال حساب
        // واحد للثلاثة يجعل كل اعتماد يُرفض بصمت وتبقى الكشوف مسودات.
        $supportAdmin = User::query()->where('email', 'support@teamat.com')->first() ?? $platformAdmin;
        $this->settlements($supportAdmin, $financeAdmin, $platformAdmin);
        $this->invoices($financeAdmin);
    }

    /**
     * اعتماد الحسابات البنكية للمزوّدين العاملين.
     *
     * لا صرف قبل الاعتماد (`payoutsBlocked`)، فمزوّد بحساب غير معتمد يُنتج
     * كشوفاً لا تُصرف أبداً. يُترك اثنان بلا اعتماد عمداً: الشاشة المالية
     * تعرض هذا الحظر، وحظر لا مثال له لا يُرى.
     */
    private function approveBankAccounts(): void
    {
        $partners = Partner::query()->where('status', 'active')->orderBy('id')->get();

        foreach ($partners as $index => $partner) {
            $partner->forceFill([
                'bank_status' => $index < $partners->count() - 2 ? 'approved' : 'pending',
            ])->save();
        }
    }

    /**
     * كشف لكل مزوّد له بنود معلّقة، ثم مسارات ثلاثة: مصروف، معتمد ينتظر
     * التحويل، ومولَّد ينتظر الاعتماد — الحالات الثلاث التي تراها الشاشة.
     */
    private function settlements(User $generator, User $approver, User $payer): void
    {
        $service = app(SettlementStatementService::class);

        // الكنسة تختم الاكتمال والعمولة بلحظة تشغيل البذرة، فتقول فعالية
        // انتهت قبل أربعين يوماً إنها اكتملت اليوم — وتقع عمولتها خارج كل
        // فترة مغلقة فلا يُولَّد لها كشف. الختمان يُردّان إلى نهاية الفعالية
        // نفسها، وهي اللحظة التي كانا سيُكتبان فيها لو مرّ الوقت فعلاً.
        foreach (SettlementItem::query()->with('event')->get() as $item) {
            $endedAt = $item->event?->ends_at;

            if ($endedAt === null || $endedAt->isFuture()) {
                continue;
            }

            $item->event->forceFill(['completed_at' => $endedAt])->save();
            $item->forceFill(['computed_at' => $endedAt])->save();
        }

        $period = $service->periodEndingBefore(Carbon::now());

        foreach (Partner::query()->orderBy('id')->get() as $partner) {
            try {
                $service->generateFor($partner, $period, $generator);
            } catch (Throwable) {
                // مزوّد بلا بنود معلّقة لا كشف له — ليست حالة خطأ.
                continue;
            }
        }

        $statements = SettlementStatement::query()->orderBy('id')->get();

        foreach ($statements as $index => $statement) {
            // الثالث فصاعداً يبقى مولَّداً ينتظر الاعتماد.
            if ($index > 1) {
                continue;
            }

            try {
                $service->approve($statement, $approver);
            } catch (Throwable) {
                continue;
            }

            // الأول يُصرف — وبه تنتقل فعالياته إلى «مسوّاة». الثاني يبقى
            // معتمداً بلا تحويل، فتظهر الحالتان جنباً إلى جنب.
            if ($index === 0) {
                try {
                    $service->markPaid(
                        $statement->fresh(),
                        $payer,
                        'TRF-'.Carbon::now()->format('Ymd').'-'.$statement->id,
                        Carbon::now()->subDays(2),
                    );
                } catch (Throwable) {
                    continue;
                }
            }
        }
    }

    /**
     * فواتير رسوم النظام: مسددة، وصادرة في مهلتها، ومتأخرة تجاوزت المهلة.
     *
     * الشركة التي بلا شروط عقد لا تُفوتر أصلاً — وهي في البيانات عمداً حتى
     * يظهر تحذير «شركات بلا عقد» على شاشة الفواتير بقائمة غير فارغة.
     */
    private function invoices(User $finance): void
    {
        $service = app(InvoiceService::class);
        $companies = Company::query()->where('status', 'active')->orderBy('id')->get();

        /*
         * شركة واحدة فقط تُترك متأخرة — وهي الأخيرة، لا الأولى.
         *
         * كانت فاتورة الشهر الثاني تبقى غير مسددة لدى **كل** شركة، ومهلتها
         * تكون قد مضت أصلاً بحكم تاريخها، فتحجب دورة التأخر إنشاء الفعاليات
         * على الجميع: قاعدة البيانات التجريبية لا يمكن إنشاء فعالية فيها
         * إطلاقاً، وهو المسار الرئيسي في المنصة. المشهد يبقى مُمثَّلاً
         * بشركة واحدة بلا مجتمعات، وبقية الشركات تُسدَّد فواتيرها.
         */
        $arrearsCompanyId = $companies->last()?->id;

        foreach ($companies as $company) {
            // ثلاث دورات ماضية لكل شركة — الفوترة شهرية، وشهر واحد لا يُظهر اتجاهاً.
            foreach ([3, 2, 1] as $monthsAgo) {
                $cycle = $service->cycleFor(Carbon::now()->subMonths($monthsAgo));

                try {
                    $invoice = $service->generateFor($company, $cycle, $finance, $cycle['end'] ?? null);
                } catch (Throwable) {
                    continue;
                }

                if ($invoice === null) {
                    continue;
                }

                // الأقدم مسددة، والأوسط متأخرة لدى شركة التأخر وحدها،
                // والأحدث صادرة في مهلتها.
                $overdue = $monthsAgo === 2 && $company->id === $arrearsCompanyId;

                if ($overdue) {
                    $invoice->forceFill(['due_at' => Carbon::now()->subDays(35)])->save();

                    continue;
                }

                if ($monthsAgo !== 1) {
                    try {
                        $service->markPaid($invoice, $finance, 'PAY-'.$invoice->id);
                    } catch (Throwable) {
                        // تُترك صادرة إن رفض الاعتماد.
                    }
                }
            }
        }

        // دورة التأخر تُحوّل ما تجاوز مهلته إلى متأخرة ثم محجوبة، بالمنطق نفسه
        // الذي يعمل في الإنتاج لا بكتابة الحالة يدوياً.
        try {
            app(InvoiceArrearsService::class)->process();
        } catch (Throwable) {
            // لا شيء مستحق بعد.
        }

    }
}
