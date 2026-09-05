<?php

namespace Database\Seeders;

use App\Enums\EventStatus;
use App\Enums\WalletTransactionType;
use App\Models\Community;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Partner;
use App\Models\PaymentIntent;
use App\Models\VenuePricing;
use App\Models\Wallet;
use App\Services\Employee\EventCreationService;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use App\Services\Payments\CollectionService;
use App\Services\Provider\ProviderRequestService;
use App\Services\Wallet\LedgerService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;

/**
 * دورة حياة الفعالية بحالاتها الستّ عشرة، مُولَّدة بالخدمات الحقيقية.
 *
 * البذرة هنا لا تكتب صفوفاً بيدها: تُنشئ الفعالية عبر `EventCreationService`،
 * وتُنضم الأعضاء عبر `ParticipationService`، وتُحرّك الحالات عبر آلة الحالات.
 * السبب أن الصفوف المكتوبة يدوياً تبدو صحيحة وهي متناقضة — رصيد لا يطابق
 * حجوزاته، وحالة بلا سجل انتقال، وطلب مزوّد بلا مهلة. ما يمرّ من الخدمة
 * يخرج متسقاً لأن الخدمة هي التي تحرس الاتساق في الإنتاج أيضاً.
 */
class EventScenarioSeeder extends Seeder
{
    private EventCreationService $creation;

    private ParticipationService $participation;

    private ProviderRequestService $providerRequests;

    private EventStateMachine $machine;

    private LedgerService $ledger;

    /** عدّاد يوزّع التسعيرات والأوقات، فلا تتزاحم فعاليتان على وحدة واحدة. */
    private int $sequence = 0;

    public function run(): void
    {
        // `DatabaseSeeder` يعطّل أحداث النماذج، ومعها المراقبون. هذه البذرة
        // تعتمد عليهم: طلب المزوّد يُنشئه مراقب الفعالية عند `pending_provider`،
        // فبدونه تبقى كل فعالية معلّقة بلا طلب. تُعاد الأحداث هنا، ويُعيدها
        // `Model::withoutEvents` إلى ما كانت عليه عند خروج البذرة الأم.
        Model::setEventDispatcher(app('events'));

        $this->creation = app(EventCreationService::class);
        $this->participation = app(ParticipationService::class);
        $this->providerRequests = app(ProviderRequestService::class);
        $this->machine = app(EventStateMachine::class);
        $this->ledger = app(LedgerService::class);

        $this->fundCommunities();

        $this->openEvents();
        $this->approvalQueue();
        $this->providerDecisions();
        $this->fullLifecycleToSettled();
        $this->collection();
        $this->runningAndFinished();
        $this->cancellations();
        $this->confirmedAndAwaiting();
        $this->employeeShareDemand();
        $this->paidShares();

        // المال لا يتحرك بتغيير الحالة — يتحرك بالمهام المجدولة التي تُغلق
        // التسجيل وتحجز الدعم وتُنشئ المطالبات وتُكمل الفعالية وتقيّد العمولة.
        // استدعاء الآلة وحدها كان يترك فعالية «مكتملة» بلا حجز ولا مطالبة ولا
        // بند تسوية: حالة صحيحة الشكل، خاوية من أثرها المالي.
        $this->sweep();
        $this->finalise();
        $this->keepClaimsDemonstrable();
    }

    /**
     * تمديد مهلة المطالبات المفتوحة — في البذرة وحدها.
     *
     * `paymentWindowDeadline` تحسب المهلة 120 دقيقة من **لحظة الإغلاق**، وهي
     * هنا لحظة البذر: فبعد ساعتين من `migrate:fresh --seed` تنقضي كل مطالبة
     * وتختفي بطاقة «مطالبة سداد مفتوحة» من رئيسية الموظف — وهي أول ما تعرضه
     * الشاشة وأهمّ مشهد في البوابة. مشهدٌ لا يعيش إلا ساعتين بعد البذر غير
     * موجود عملياً، ومن يفتح البيانات بعد الغداء يجدها ناقصة بلا سبب ظاهر.
     *
     * يُستدعى **بعد** `sweep()`: المطالبات لا توجد قبله — هو من يُغلق
     * التسجيل ويُنشئها.
     *
     * والمهلة الممدودة تبقى ضمن القاعدة نفسها (السقف 6 ساعات قبل البداية)،
     * ولا تمسّ المطالبة التي أُريد لها أن تنقضي في `finalise()`: تلك حالتها
     * لم تعد `pending`.
     */
    private function keepClaimsDemonstrable(): void
    {
        PaymentIntent::query()
            ->where('status', PaymentIntent::STATUS_PENDING)
            ->whereHas('event', fn ($q) => $q->where('event_date', '>', Carbon::now()->addDay()))
            ->update(['expires_at' => Carbon::now()->addDays(2)]);
    }

    /**
     * الكنسة الثانية — ما لا يكتمل في تمريرة واحدة.
     *
     * في الإنتاج تعمل هذه المهام كل بضع دقائق، فتمرّ الفعالية بعدة تمريرات
     * قبل أن تستقر. تمريرة واحدة هنا كانت تُنتج نتائج خاطئة: مهلة الدفع
     * يُعاد حسابها لحظة إغلاق التسجيل فلا تكون منقضية بعد، والفعالية التي
     * أُريد لها أن تنتهي مهلتها تُعاد جدولتها أولاً لأن الحد الأدنى لم يكتمل.
     */
    private function finalise(): void
    {
        // (أ) انقضاء مهلة الدفع: تُدفع المهلة إلى الماضي بعد أن كتبها الإغلاق.
        $failing = Event::query()->where('title', 'like', '%سقطت لعدم اكتمال التحصيل%')->first();

        if ($failing !== null && $failing->status === EventStatus::AwaitingPayment->value) {
            $failing->forceFill(['payment_deadline' => Carbon::now()->subHour()])->save();

            // المهلة التي تُقاس عليها هي `expires_at` على المطالبة نفسها، لا
            // `payment_deadline` على الفعالية — تحريك الثانية وحدها لا يُسقط شيئاً.
            PaymentIntent::query()
                ->where('event_id', $failing->id)
                ->where('status', PaymentIntent::STATUS_PENDING)
                ->update(['expires_at' => Carbon::now()->subMinutes(30)]);

            Artisan::call('app:expire-payment-deadlines');
        }

        // (ب) انتهاء المهلة بلا نصاب: `registration_closes_at` يُترك في المستقبل
        //     حتى لا يلتقطها الإغلاق فيعيد جدولتها، بينما مرّ موعد بدئها.
        $stale = Event::query()->where('title', 'like', '%انتهت المهلة بلا مشاركين%')->first();

        if ($stale !== null && $stale->status === EventStatus::Open->value) {
            $start = Carbon::now()->subDay();
            $stale->forceFill([
                'event_date' => $start->toDateString(),
                'start_time' => $start->format('H:i'),
                'starts_at' => $start,
                'ends_at' => (clone $start)->addMinutes($stale->duration_minutes),
                'registration_closes_at' => Carbon::now()->addDay(),
            ])->save();

            Artisan::call('app:transition-event-lifecycle');
        }
    }

    /**
     * تشغيل المهام المجدولة كما تعمل في الإنتاج — كنسة واحدة على كل ما بُني.
     */
    private function sweep(): void
    {
        Artisan::call('app:close-registration');
        Artisan::call('app:expire-payment-deadlines');
        Artisan::call('app:transition-event-lifecycle');
        Artisan::call('app:close-attendance-window');
    }

    /**
     * مطالبات مدفوعة بالكامل — الطرف الآخر من مسار التحصيل.
     *
     * كانت كل المطالبات في البيانات `pending` أو `expired`: لا مطالبة واحدة
     * دُفعت، ولا معاملة بوابة ناجحة، ولا فاتورة ضريبية للموظف — فالمسار الذي
     * ينتهي بالسداد (نافذة الدفع، وإيصال النجاح، ومستند ZATCA) بلا بيانات
     * تُعرض عليه، وشاشة «مدفوعاتي» لا تُظهر إلا حالة واحدة.
     *
     * تُدفع الحصص هنا بمسار الإنتاج نفسه (`markIntentPaid`) لا بكتابة الحالة:
     * هو من يُنشئ معاملة البوابة الناجحة، ويُصدر الفاتورة، ويُعيد تقييم
     * الفعالية — فتصل `confirmed` بأثرها المالي كاملاً.
     */
    private function paidShares(): void
    {
        $community = Community::find(1);

        if ($community === null) {
            return;
        }

        $event = $this->create($community, [
            'title' => 'بادل — حصص مدفوعة بالكامل',
            'capacity' => 4,
            'min' => 2,
            'date' => Carbon::now()->addDays(9),
            'subsidy_type' => 'fixed',
            'company_subsidy' => 0,
        ]);

        if ($event === null) {
            return;
        }

        $this->fill($event, 2);
        $this->acceptProvider($event);
        $event->forceFill(['registration_closes_at' => Carbon::now()->subMinutes(2)])->save();

        // الإغلاق يُنشئ المطالبات؛ ثم تُدفع كلها.
        Artisan::call('app:close-registration');

        $collection = app(CollectionService::class);

        PaymentIntent::query()
            ->where('event_id', $event->id)
            ->where('status', PaymentIntent::STATUS_PENDING)
            ->get()
            ->each(fn (PaymentIntent $intent) => $collection->markIntentPaid($intent, 'SEED-'.$intent->id));
    }

    /**
     * الحالتان الباقيتان: مؤكدة تنتظر يومها، وأخرى سقطت لفشل التحصيل.
     *
     * كلتاهما تمرّ بـ`awaiting_payment` ثم تفترقان — وهو بالضبط المفترق الذي
     * تصفه المواصفة: التمويل اكتمل أو لم يكتمل قبل انقضاء مهلة الدفع.
     */
    /**
     * مطالبة سداد مفتوحة على موظف بعينه.
     *
     * شركة تغطي 100٪ من محفظتها لا تُنتج مطالبة قط، فبطاقة «مطالبة سداد
     * مفتوحة» على شاشة الموظف لا تظهر في البيانات مهما كانت سليمة. هذه
     * الفعالية بلا دعم: الحصة تقع على المشاركين، ومنهم قائد «فريق البادل»
     * نفسه — فتظهر البطاقة لمن يفتح الشاشة بحسابه.
     */
    /**
     * مطالبات سداد مفتوحة على قائد المجتمع — أكثر من واحدة عمداً.
     *
     * مطالبة واحدة كانت تُظهر البطاقة ولا تُظهر ما حولها: قائمة «مدفوعاتي»
     * بصف واحد، ولا فرق بين مطالبة تنتهي قريباً وأخرى بعد يومين، ولا ترتيب
     * يُختبر. أربع مطالبات بمبالغ ومواعيد مختلفة تجعل الشاشة تُقرأ كما
     * ستُقرأ في الإنتاج.
     *
     * الدعم صفر في كلها (`subsidy_type: fixed` و`company_subsidy: 0`): هذا هو
     * المسار الذي يدفع فيه اللاعب حصته — ومع تغطية المحفظة الكاملة لا توجد
     * مطالبة أصلاً.
     */
    private function employeeShareDemand(): void
    {
        $community = Community::find(1);

        if ($community === null) {
            return;
        }

        $claims = [
            ['title' => 'بطولة بادل ثنائية ودية — حجز ملاعب النرجس', 'days' => 4, 'capacity' => 6, 'min' => 3],
            ['title' => 'بادل الخميس — ملعبان محجوزان', 'days' => 6, 'capacity' => 8, 'min' => 4],
            ['title' => 'بادل الصباح — مباراة ودّية', 'days' => 8, 'capacity' => 4, 'min' => 2],
            ['title' => 'بادل نهاية الأسبوع — دور المجموعات', 'days' => 11, 'capacity' => 8, 'min' => 4],
        ];

        foreach ($claims as $claim) {
            $event = $this->create($community, [
                'title' => $claim['title'],
                'capacity' => $claim['capacity'],
                'min' => $claim['min'],
                'date' => Carbon::now()->addDays($claim['days']),
                'subsidy_type' => 'fixed',
                'company_subsidy' => 0,
            ]);

            if ($event === null) {
                continue;
            }

            // المنشئ ينضم تلقائياً، فيكفي ملء الباقي لبلوغ الحد الأدنى.
            $this->fill($event, $claim['min']);
            $this->acceptProvider($event);

            // التسجيل أُغلق للتوّ ومهلة الدفع ما تزال مفتوحة — وهي الحالة
            // التي تُعرض فيها البطاقة بعدّادها.
            $event->forceFill(['registration_closes_at' => Carbon::now()->subMinutes(2)])->save();
        }
    }

    private function confirmedAndAwaiting(): void
    {
        $community = Community::find(1);

        if ($community === null) {
            return;
        }

        $confirmed = $this->create($community, [
            'title' => 'بادل — مؤكدة وتنتظر موعدها',
            'capacity' => 6,
            'min' => 3,
            'date' => Carbon::now()->addDays(14),
        ]);

        if ($confirmed !== null) {
            $this->fill($confirmed, 3);
            $this->acceptProvider($confirmed);
            // التسجيل أُغلق والموعد لم يأتِ: تُموَّل وتقف عند `confirmed`.
            $confirmed->forceFill(['registration_closes_at' => Carbon::now()->subMinutes(5)])->save();
        }

        // مسار دفع الموظف لا مسار المحفظة: في الأول تُموَّل الفعالية آلياً من
        // رصيد المجتمع فلا يوجد تحصيل ليفشل.
        $paidCommunity = Community::find(4) ?? $community;

        $failed = $this->create($paidCommunity, [
            'title' => 'بادل الابتكار — سقطت لعدم اكتمال التحصيل',
            'capacity' => 6,
            'min' => 3,
            'date' => Carbon::now()->addDays(16),
        ]);

        if ($failed !== null) {
            $this->fill($failed, 3);
            $this->acceptProvider($failed);
            // أُغلق تسجيلها وانقضت مهلة دفعها معاً — تسقط عند كنسة المهل.
            $failed->forceFill([
                'registration_closes_at' => Carbon::now()->subHours(12),
                'payment_deadline' => Carbon::now()->subHours(2),
            ])->save();
        }
    }

    // ── أدوات ────────────────────────────────────────────────────────────

    /**
     * تسعيرة تطابق نشاط المجتمع — بلا تطابق لا يُنشأ حجز صحيح.
     *
     * تدور على التسعيرات المتاحة بدل أن تعيد الأولى دائماً: الوحدة الواحدة
     * لا تُحجز مرتين في الوقت نفسه، فإعادة الأولى تُفشل كل قبول بعد الأول.
     */
    private function pricingFor(Community $community): ?VenuePricing
    {
        $pricings = VenuePricing::query()
            ->whereHas('venue', fn ($q) => $q->where('category_id', $community->category_id)->where('status', 'active')
                ->whereHas('partner', fn ($p) => $p->whereHas('branches.units')))
            ->where('status', 'active')
            ->orderBy('id')
            ->get();

        if ($pricings->isEmpty()) {
            return null;
        }

        return $pricings[$this->sequence % $pricings->count()];
    }

    private function leaderOf(Community $community): Employee
    {
        return $community->primaryLeader()
            ?? $community->leaderEmployees()->first()
            ?? Employee::findOrFail($community->members()->value('employees.id'));
    }

    /** عضو في المجتمع لم ينضم بعد لهذه الفعالية. */
    private function freeMembers(Community $community, Event $event, int $count): array
    {
        $taken = $event->participants()->pluck('employee_id')->all();

        return $community->members()
            ->whereNotIn('employees.id', $taken)
            ->limit($count)
            ->pluck('employees.id')
            ->map(fn ($id) => Employee::find($id))
            ->filter()
            ->all();
    }

    private function create(Community $community, array $options = []): ?Event
    {
        $pricing = $this->pricingFor($community);

        if ($pricing === null) {
            return null;
        }

        $partner = $pricing->venue->partner;

        if ($partner === null) {
            return null;
        }

        $creator = $options['creator'] ?? $this->leaderOf($community);
        $times = ['17:00', '18:30', '20:00', '21:30', '16:00', '19:00'];
        $time = $options['time'] ?? $times[$this->sequence % count($times)];
        $this->sequence++;

        return $this->creation->create($creator, [
            'community_id' => $community->id,
            'partner_id' => $partner->id,
            'category_id' => $community->category_id,
            'venue_pricing_id' => $pricing->id,
            'venue_ids' => [$pricing->venue_id],
            'date' => ($options['date'] ?? Carbon::now()->addDays(5))->toDateString(),
            'time' => $time,
            'capacity' => $options['capacity'] ?? 8,
            'min_participants' => $options['min'] ?? 4,
            'title' => $options['title'] ?? null,
            // الدعم اختياري هنا: بدونه تُطبَّق افتراضات الشركة، وشركة تغطي
            // 100٪ لا تُنتج حصةً على الموظف — ولا مطالبة سداد يراها.
            ...array_filter([
                'subsidy_type' => $options['subsidy_type'] ?? null,
                'company_subsidy' => $options['company_subsidy'] ?? null,
            ], fn ($value) => $value !== null),
        ]);
    }

    /** ينضم `$count` عضواً إضافياً عبر الخدمة — تحترم السعة وقائمة الانتظار. */
    private function fill(Event $event, int $count): Event
    {
        foreach ($this->freeMembers($event->community, $event, $count) as $employee) {
            $this->participation->join($event->fresh(), $employee);
        }

        return $event->fresh();
    }

    private function acceptProvider(Event $event): ?EventProviderRequest
    {
        $request = EventProviderRequest::query()
            ->where('event_id', $event->id)
            ->where('status', EventProviderRequest::STATUS_PENDING)
            ->latest('id')
            ->first();

        if ($request === null) {
            return null;
        }

        return $this->providerRequests->accept(Partner::findOrFail($request->partner_id), $request);
    }

    // ── تمويل المحافظ ────────────────────────────────────────────────────

    /**
     * كل مجتمع نشط يبدأ برصيد مخصص.
     *
     * بلا رصيد يفشل حجز الدعم عند إغلاق التسجيل، فتتعطل كل السيناريوهات
     * التالية لسبب لا علاقة له بها.
     */
    private function fundCommunities(): void
    {
        foreach (Community::query()->where('status', 'active')->get() as $community) {
            /*
             * المحفظة تُعنون بعمودَي التعدّد (`owner_type`/`owner_id`) لا
             * بعمود `community_id` — وهو غير موجود على الجدول أصلاً.
             *
             * الاستعلام القديم كان يسأل عن `community_id` وعن `owner_type`
             * بقيمة `'company'`/`'community'` بدل اسم الصنف الكامل. وSQLite
             * يعامل المعرّف المجهول بين علامتي اقتباس مزدوجتين **نصاً** لا
             * عموداً، فيصير الشرط `'community_id' = 1` أي كاذباً دائماً:
             * يعود null بلا خطأ، فيقفز `continue`، فلا يُموَّل مجتمع واحد —
             * بصمت، وفي كل تشغيل محلي. MySQL يرفض العمود المجهول فظهر العطب.
             *
             * `mainFor`/`subFor` هما مصدر الحقيقة لعنونة المحافظ.
             */
            $companyWallet = Wallet::mainFor($community->company);
            $communityWallet = Wallet::subFor($community);

            $amount = 2_000_00;

            $this->ledger->credit(
                $companyWallet,
                WalletTransactionType::TopUp,
                $amount,
                "seed:topup:{$community->id}",
                ['note' => 'شحن المحفظة الرئيسية بتحويل بنكي معتمد'],
            );

            $this->ledger->allocate(
                $companyWallet->refresh(),
                $communityWallet,
                $amount,
                "seed:allocation:{$community->id}",
                null,
                "تخصيص لمحفظة {$community->name}",
            );
        }
    }

    // ── الحالات ──────────────────────────────────────────────────────────

    /** فعاليات تسجيلها مفتوح، بمستويات امتلاء مختلفة وقائمة انتظار. */
    private function openEvents(): void
    {
        // بلوغ الحد الأدنى ينقل الفعالية فوراً إلى `pending_provider`، فالبقاء
        // في `open` يعني بالضرورة عدداً أقل من الحد. المنشئ ينضم تلقائياً،
        // فالعدد النهائي = 1 + ما يُضاف هنا.
        $plans = [
            [1, 'بادل الخميس الأسبوعي', 8, 6, 2, 3],
            [2, 'مباراة الشركة الودية', 12, 8, 3, 5],
            [4, 'بادل الابتكار — الجولة الثانية', 8, 5, 2, 2],
            [3, 'تنس فردي — تصفيات المجموعة', 6, 4, 4, 1],
        ];

        foreach ($plans as [$communityId, $title, $capacity, $min, $days, $joins]) {
            $community = Community::find($communityId);

            if ($community === null) {
                continue;
            }

            $event = $this->create($community, [
                'title' => $title,
                'capacity' => $capacity,
                'min' => $min,
                'date' => Carbon::now()->addDays($days),
            ]);

            if ($event !== null) {
                $this->fill($event, $joins);
            }
        }
    }

    /**
     * طابور موافقة مسؤول الحساب.
     *
     * موظف غير قائد في شركة لا تسمح بالإنشاء المباشر ينتج `pending_approval`.
     * واحدة تُقبل وواحدة تُرفض حتى تظهر الحالتان في الشاشة نفسها.
     */
    private function approvalQueue(): void
    {
        $community = Community::find(2);

        if ($community === null) {
            return;
        }

        $leader = $this->leaderOf($community);
        $member = $community->members()->where('employees.id', '!=', $leader->id)->first();

        if ($member === null) {
            return;
        }

        $setting = $community->company->settings;
        $wasAllowed = $setting?->employee_can_create_event;
        $setting?->forceFill(['employee_can_create_event' => false])->save();

        $pending = $this->create($community, [
            'creator' => Employee::find($member->id),
            'title' => 'اقتراح: دوري الأقسام الودي',
            'date' => Carbon::now()->addDays(12),
        ]);

        $rejected = $this->create($community, [
            'creator' => Employee::find($member->id),
            'title' => 'اقتراح: رحلة رياضية خارج المدينة',
            'date' => Carbon::now()->addDays(20),
        ]);

        $setting?->forceFill(['employee_can_create_event' => $wasAllowed])->save();

        if ($rejected !== null) {
            $this->machine->rejectProposal(
                $rejected,
                $community->company,
                'خارج نطاق الأنشطة المعتمدة لهذه الدورة.',
            );
        }

        unset($pending);
    }

    /** حالات قرار المزوّد الثلاث: بانتظار الردّ، بديل مقترح، مقبول. */
    private function providerDecisions(): void
    {
        // (أ) بانتظار ردّ المزوّد — بلغت الحد الأدنى وأُرسل الطلب.
        $awaiting = $this->create(Community::findOrFail(1), [
            'title' => 'بادل — بانتظار تأكيد المرفق',
            'capacity' => 6,
            'min' => 3,
            'date' => Carbon::now()->addDays(7),
        ]);

        if ($awaiting !== null) {
            $this->fill($awaiting, 3);
        }

        // (ب) بديل مقترح من المزوّد.
        $alternative = $this->create(Community::findOrFail(1), [
            'title' => 'بادل — المرفق اقترح وقتاً بديلاً',
            'capacity' => 6,
            'min' => 3,
            'date' => Carbon::now()->addDays(9),
        ]);

        if ($alternative !== null) {
            $this->fill($alternative, 3);
            $request = EventProviderRequest::query()
                ->where('event_id', $alternative->id)
                ->where('status', EventProviderRequest::STATUS_PENDING)
                ->latest('id')
                ->first();

            if ($request !== null) {
                $this->providerRequests->proposeAlternative(
                    Partner::findOrFail($request->partner_id),
                    $request,
                    [
                        'proposed_date' => Carbon::now()->addDays(10)->toDateString(),
                        'proposed_start_time' => '21:00',
                        'notes' => 'الملعب محجوز في الموعد المطلوب — نقترح اليوم التالي بالسعر نفسه.',
                    ],
                );
            }
        }

        // (ج) مقبول من المزوّد وينتظر إغلاق التسجيل.
        $booked = $this->create(Community::findOrFail(4), [
            'title' => 'بادل الابتكار — الحجز مؤكد',
            'capacity' => 8,
            'min' => 4,
            'date' => Carbon::now()->addDays(6),
        ]);

        if ($booked !== null) {
            $this->fill($booked, 4);
            $this->acceptProvider($booked);
        }
    }

    /**
     * المسار أ كاملاً: تمويل ← إنشاء ← نصاب ← قبول ← إغلاق ← اكتمال ← تسوية.
     *
     * هذه هي الفعالية التي تُثبت أن الدفتر يتزن: حجز الدعم عند الإغلاق،
     * واستقطاعه والعمولة عند الاكتمال، وبند تسوية للمزوّد بعدها.
     */
    private function fullLifecycleToSettled(): void
    {
        foreach ([[1, 'بادل — دورة مكتملة ومسوّاة', 40], [2, 'كرة قدم — جولة مسوّاة', 55]] as [$communityId, $title, $daysAgo]) {
            $community = Community::find($communityId);

            if ($community === null) {
                continue;
            }

            $event = $this->create($community, [
                'title' => $title,
                'capacity' => 8,
                'min' => 4,
                'date' => Carbon::now()->addDays(3),
            ]);

            if ($event === null) {
                continue;
            }

            $this->fill($event, 5);
            $this->acceptProvider($event);

            // تُرجَع إلى الماضي بعد أن اكتمل بناؤها، فتلتقطها الكنسة وتمرّ
            // بالإغلاق والتحصيل والاكتمال كما تمرّ فعالية حقيقية.
            $this->backdate($event, Carbon::now()->subDays($daysAgo)->setTime(20, 0));
        }
    }

    /** يُرجِع فعالية إلى موعد ماضٍ مع كل الحقول المشتقة منه. */
    private function backdate(Event $event, Carbon $start): void
    {
        $event->forceFill([
            'event_date' => $start->toDateString(),
            'start_time' => $start->format('H:i'),
            'starts_at' => $start,
            'ends_at' => (clone $start)->addMinutes($event->duration_minutes),
            'registration_closes_at' => (clone $start)->subDay(),
            'free_withdrawal_until' => (clone $start)->subDays(2),
        ])->save();
    }

    /**
     * المسار ب: مطالبات على الموظفين.
     *
     * التسجيل أُغلق ومهلة الدفع ما تزال مفتوحة، فتبقى في `awaiting_payment`
     * بمطالبات بعضها مدفوع وبعضها لا — وهي الحالة التي تُرى فيها الشاشة فعلاً.
     */
    private function collection(): void
    {
        $community = Community::find(5) ?? Community::find(4);

        if ($community === null) {
            return;
        }

        $event = $this->create($community, [
            'title' => 'مسار دفع الموظف — تحصيل جارٍ',
            'capacity' => 6,
            'min' => 3,
            'date' => Carbon::now()->addDays(2),
        ]);

        if ($event === null) {
            return;
        }

        $this->fill($event, 4);
        $this->acceptProvider($event);

        $event->forceFill(['registration_closes_at' => Carbon::now()->subMinutes(10)])->save();
    }

    /** فعالية جارية الآن، وأخرى انتهت مهلتها بلا نصاب. */
    private function runningAndFinished(): void
    {
        $community = Community::find(1);

        if ($community === null) {
            return;
        }

        $running = $this->create($community, [
            'title' => 'بادل — جارية الآن',
            'capacity' => 6,
            'min' => 3,
            'date' => Carbon::now()->addDays(3),
        ]);

        if ($running !== null) {
            $this->fill($running, 4);
            $this->acceptProvider($running);
            // بدأت قبل نصف ساعة ولم تنتهِ: الكنسة تبدأها ولا تُكملها.
            $this->backdate($running, Carbon::now()->subMinutes(30));
        }

        $expired = $this->create($community, [
            'title' => 'بادل — انتهت المهلة بلا مشاركين',
            'capacity' => 8,
            'min' => 6,
            'date' => Carbon::now()->addDays(4),
        ]);

        // تُترك كما أُنشئت هنا: إرجاعها قبل الكنسة يجعل الإغلاق يُعيد جدولتها
        // بدل أن تنتهي مهلتها. تُعالَج في `finalise()` بعد أن يمرّ الإغلاق.
        unset($expired);
    }

    /** الإلغاءات الثلاثة: الحد الأدنى (بعد إعادة جدولة)، المزوّد، الشركة. */
    private function cancellations(): void
    {
        $community = Community::findOrFail(1);

        // (أ) الحد الأدنى لم يكتمل — إعادة جدولة ثم إلغاء نهائي.
        $minNotMet = $this->create($community, [
            'title' => 'بادل — لم يكتمل الحد الأدنى مرتين',
            'capacity' => 10,
            'min' => 8,
            'date' => Carbon::now()->addDays(4),
        ]);

        if ($minNotMet !== null) {
            $this->fill($minNotMet, 2);
            $minNotMet->forceFill(['registration_closes_at' => Carbon::now()->subHours(3)])->save();
            $this->machine->rescheduleMinNotMet($minNotMet->fresh(), 'لم يكتمل الحد الأدنى — أُعيدت الجدولة مرة واحدة.');

            $retried = $minNotMet->fresh();
            $retried->forceFill(['registration_closes_at' => Carbon::now()->subHour()])->save();
            $this->machine->cancelMinNotMet($retried->fresh(), 'لم يكتمل الحد الأدنى بعد إعادة الجدولة — أُلغيت بلا أي استقطاع.');
        }

        // (ب) المزوّد ألغى بعد التأكيد.
        $providerCancelled = $this->create($community, [
            'title' => 'بادل — ألغاها المرفق بعد التأكيد',
            'capacity' => 6,
            'min' => 3,
            'date' => Carbon::now()->addDays(8),
        ]);

        if ($providerCancelled !== null) {
            $this->fill($providerCancelled, 3);
            $request = $this->acceptProvider($providerCancelled);

            if ($request !== null) {
                $this->providerRequests->cancelAccepted(
                    Partner::findOrFail($request->partner_id),
                    $request->fresh(),
                    'عطل مفاجئ في الإنارة — اعتذار عن الموعد.',
                );
            }
        }

        // (ج) الشركة ألغت.
        $companyCancelled = $this->create($community, [
            'title' => 'بادل — ألغتها الشركة',
            'capacity' => 8,
            'min' => 4,
            'date' => Carbon::now()->addDays(11),
        ]);

        if ($companyCancelled !== null) {
            $this->fill($companyCancelled, 4);
            // الإلغاء من الشركة مسموح بعد الحجز لا قبله — تُقبل أولاً.
            $this->acceptProvider($companyCancelled);
            $this->machine->cancelCompany(
                $companyCancelled->fresh(),
                $community->company,
                'تعارض مع اجتماع ربع سنوي أُعلن لاحقاً.',
            );
        }
    }
}
