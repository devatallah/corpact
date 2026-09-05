<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Community;
use App\Models\CommunityRequest;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventComment;
use App\Models\Partner;
use App\Models\PermissionReview;
use App\Models\RoleAssignment;
use App\Models\SupportMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

/**
 * ما يحيط بدورة الفعالية: المواسم والتقارير والنتائج والحوكمة والدعم.
 *
 * هذه الجداول هي ما يجعل الشاشات تبدو مستعملة لا مبنية للتو — قائمة بلا صف
 * واحد تُخفي عيوب التصميم كلها، ولا تُظهر ما إذا كان الترتيب والتصفية
 * والحالات الثلاث تعمل أصلاً.
 */
class OperationsSeeder extends Seeder
{
    public function run(): void
    {
        Model::setEventDispatcher(app('events'));

        $this->coordinator();
        $this->supportAgents();
        $this->scheduledJobs();
        $this->communityRequests();
        $this->preferredProviders();
        $this->eventComments();
        $this->governance();
        $this->supportInbox();
        $this->providerSelectionLogs();
        $this->departmentHistory();
        $this->employeeImports();
        $this->storedFiles();
    }

    /**
     * استيراد الموظفين: دفعة نظيفة أُرسلت دعواتها، وأخرى بها صفوف خاطئة.
     *
     * الدفعة الخاطئة هي المهمة: الشاشة تعرض الخطأ سطراً سطراً، وبلا مثال لا
     * يُعرف إن كانت تعرضه أصلاً.
     */
    private function employeeImports(): void
    {
        $company = Company::query()->find(1);
        $uploader = User::query()->where('email', 'hr@advancedtech.sa')->first()
            ?? User::query()->where('email', 'admin@teamat.com')->first();

        if ($company === null) {
            return;
        }

        $clean = DB::table('employee_imports')->insertGetId([
            'company_id' => $company->id,
            'uploaded_by_user_id' => $uploader?->id,
            'original_filename' => 'employees-batch-march.csv',
            'status' => 'invited',
            'total_rows' => 3,
            'valid_rows' => 3,
            'error_rows' => 0,
            'invited_at' => Carbon::now()->subDays(12),
            'created_at' => Carbon::now()->subDays(12),
            'updated_at' => Carbon::now()->subDays(12),
        ]);

        $dirty = DB::table('employee_imports')->insertGetId([
            'company_id' => $company->id,
            'uploaded_by_user_id' => $uploader?->id,
            'original_filename' => 'employees-batch-april.csv',
            'status' => 'needs_correction',
            'total_rows' => 3,
            'valid_rows' => 1,
            'error_rows' => 2,
            'created_at' => Carbon::now()->subDays(2),
            'updated_at' => Carbon::now()->subDays(2),
        ]);

        $rows = [
            [$clean, 1, 'ماجد الشهري', 'majed@advancedtech.sa', '0551000101', '966551000101', 'التقنية', null],
            [$clean, 2, 'هند العنزي', 'hind@advancedtech.sa', '0551000102', '966551000102', 'التسويق', null],
            [$clean, 3, 'بدر الزهراني', 'badr@advancedtech.sa', '0551000103', '966551000103', 'المالية', null],
            [$dirty, 1, 'لمى القرني', 'lama@advancedtech.sa', '0551000104', '966551000104', 'التقنية', null],
            [$dirty, 2, 'فيصل الغامدي', 'not-an-email', '0551000105', null, 'التقنية', json_encode(['email' => ['صيغة البريد الإلكتروني غير صحيحة.']], JSON_UNESCAPED_UNICODE)],
            [$dirty, 3, 'سارة الحارثي', 'sara@advancedtech.sa', '123', null, 'قسم غير معروف', json_encode(['phone' => ['رقم الجوال غير صالح.'], 'department_name' => ['القسم غير موجود في الشركة.']], JSON_UNESCAPED_UNICODE)],
        ];

        foreach ($rows as [$importId, $number, $name, $email, $phone, $normalized, $department, $errors]) {
            DB::table('employee_import_rows')->insert([
                'employee_import_id' => $importId,
                'row_number' => $number,
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'normalized_phone' => $normalized,
                'department_name' => $department,
                'errors' => $errors,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ]);
        }
    }

    /** مرفقات: إيصالات تحويل بنكي وشعار شركة — بنسخة مستبدَلة وأخرى حالية. */
    private function storedFiles(): void
    {
        $company = Company::query()->find(1);
        $uploader = User::query()->where('email', 'admin@teamat.com')->first();

        if ($company === null) {
            return;
        }

        $files = [
            ['bank_receipt', 'receipt-transfer-a.pdf', 'application/pdf', 'pdf', 184_320],
            ['bank_receipt', 'receipt-transfer-b.pdf', 'application/pdf', 'pdf', 201_114],
            ['logo', 'advancedtech-logo.png', 'image/png', 'png', 42_118],
            ['contract', 'service-agreement-2026.pdf', 'application/pdf', 'pdf', 512_004],
        ];

        foreach ($files as $index => [$category, $name, $mime, $extension, $size]) {
            DB::table('stored_files')->insert([
                'uuid' => (string) Str::uuid(),
                'category' => $category,
                'disk' => 'local',
                'path' => "companies/{$company->id}/{$category}/{$name}",
                'original_name' => $name,
                'mime_type' => $mime,
                'extension' => $extension,
                'size_bytes' => $size,
                'checksum' => hash('sha256', $name),
                'fileable_type' => Company::class,
                'fileable_id' => $company->id,
                'company_id' => $company->id,
                'uploaded_by_user_id' => $uploader?->id,
                // الشعار في نسخته الثانية: الأولى تبقى محفوظة وغير حالية.
                'version' => $index === 2 ? 2 : 1,
                'is_current' => true,
                'created_at' => Carbon::now()->subDays(30 - $index * 5),
                'updated_at' => Carbon::now()->subDays(30 - $index * 5),
            ]);
        }
    }

    /**
     * منسّق تيمات — الحساب الذي يقرأ تقارير المنسّق ويكتب توصياتها.
     *
     * التقارير تُولَّد لكل شركة، ومسارها خلف إسناد دور `coordinator` بنطاق
     * الشركة. بلا هذا الحساب تُبذَر خمسة تقارير لا يستطيع أحد فتحها — بيانات
     * موجودة وشاشة لا تُرى.
     */
    private function coordinator(): void
    {
        $user = User::query()->firstOrCreate(
            ['email' => 'coordinator@teamat.com'],
            [
                'name' => 'منسّق تيمات',
                'phone' => '966500000004',
                'password' => bcrypt('123456'),
                'status' => 'active',
                'email_verified_at' => Carbon::now(),
            ],
        );

        // إسنادان لا واحد: دخول بوابة تيمات يشترط دوراً بنطاق المنصة
        // (`platformRole`)، والوصول إلى تقارير شركة بعينها يشترط إسناداً
        // بنطاقها. بالأول وحده لا يرى شيئاً، وبالثاني وحده لا يدخل أصلاً.
        $user->assignRole(Role::Coordinator, RoleAssignment::SCOPE_PLATFORM);

        foreach (Company::query()->pluck('id') as $companyId) {
            $user->assignRole(Role::Coordinator, RoleAssignment::SCOPE_COMPANY, $companyId);
        }
    }

    /**
     * فريق الدعم: عدة وكلاء، لكل واحد أكثر من شركة يتابعها.
     *
     * وكيل واحد لكل المنصة لا يصف فريقاً ولا يُظهر التوزيع على الشاشة —
     * والمُنتقي في ملف الشركة يعرض عدد شركات كل وكيل، وقائمة من اسم واحد
     * تجعل ذلك العدد بلا معنى. الإسناد تنظيمي: لا يوسّع صلاحية أحد.
     */
    private function supportAgents(): void
    {
        $agents = [
            ['سلمى الرشيد', 'salma.support@teamat.com', '966500000010'],
            ['طارق بن نايف', 'tariq.support@teamat.com', '966500000011'],
            ['هيا المطيري', 'haya.support@teamat.com', '966500000012'],
        ];

        $created = [];

        foreach ($agents as [$name, $email, $phone]) {
            $user = User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'phone' => $phone,
                    'password' => bcrypt('123456'),
                    'status' => 'active',
                    'email_verified_at' => Carbon::now(),
                ],
            );

            $user->assignRole(Role::SupportAgent, RoleAssignment::SCOPE_PLATFORM);
            $created[] = $user;
        }

        // التوزيع بالتناوب: كل وكيل يتابع أكثر من شركة، ولا شركة بلا متابع.
        foreach (Company::query()->orderBy('id')->get() as $index => $company) {
            $company->forceFill([
                'support_agent_user_id' => $created[$index % count($created)]->id,
            ])->save();
        }
    }

    /** المواسم وتقارير المنسّق تُولَّد بمهامها المجدولة لا بالكتابة المباشرة. */
    private function scheduledJobs(): void
    {
        foreach (['app:ensure-seasons', 'app:generate-coordinator-reports', 'app:generate-template-events'] as $command) {
            try {
                Artisan::call($command);
            } catch (Throwable) {
                // مهمة بلا مدخلات لا تنتج شيئاً — ليست حالة خطأ.
            }
        }
    }

    /**
     * طلبات إنشاء مجتمعات جديدة: معلّق، ومقبول صار مجتمعاً، ومرفوض بسبب.
     */
    private function communityRequests(): void
    {
        $company = Company::query()->find(1);

        if ($company === null) {
            return;
        }

        $employees = Employee::query()->where('company_id', $company->id)->orderBy('id')->take(3)->get();

        if ($employees->count() < 3) {
            return;
        }

        $reviewer = User::query()->where('email', 'admin@teamat.com')->first();

        CommunityRequest::query()->create([
            'company_id' => $company->id,
            'employee_id' => $employees[0]->id,
            'category_id' => 4,
            'name' => 'مجتمع الجري الصباحي',
            'description' => 'مجموعة للجري قبل الدوام ثلاث مرات أسبوعياً.',
            'reason' => 'عدد من الزملاء يجرون فرادى ويريدون موعداً ثابتاً.',
            'status' => 'pending',
        ]);

        CommunityRequest::query()->create([
            'company_id' => $company->id,
            'employee_id' => $employees[1]->id,
            'category_id' => 3,
            'name' => 'بادل المساء',
            'description' => 'مجموعة مسائية لمن لا يناسبه موعد الفريق الحالي.',
            'reason' => 'الفريق الحالي ممتلئ ومواعيده نهارية.',
            'status' => 'approved',
            'reviewed_by' => $reviewer?->id,
            'reviewed_at' => Carbon::now()->subDays(9),
            'community_id' => Community::query()->where('company_id', $company->id)->value('id'),
        ]);

        CommunityRequest::query()->create([
            'company_id' => $company->id,
            'employee_id' => $employees[2]->id,
            'category_id' => 5,
            'name' => 'نادي الشطرنج',
            'description' => 'لقاء أسبوعي للشطرنج في قاعة الاجتماعات.',
            'reason' => 'اهتمام مشترك بين عدة أقسام.',
            'status' => 'rejected',
            'rejection_reason' => 'لا يوجد مزوّد معتمد لهذا النشاط في المدينة حتى الآن.',
            'reviewed_by' => $reviewer?->id,
            'reviewed_at' => Carbon::now()->subDays(4),
        ]);
    }

    /** مزوّدون مفضّلون مرتّبون لكل مجتمع — ترتيب يقرأه محرك الاقتراح. */
    private function preferredProviders(): void
    {
        $partners = Partner::query()->where('status', 'active')->orderBy('id')->take(3)->pluck('id');

        foreach (Community::query()->where('status', 'active')->take(3)->get() as $community) {
            foreach ($partners as $position => $partnerId) {
                DB::table('community_preferred_providers')->insert([
                    'community_id' => $community->id,
                    'partner_id' => $partnerId,
                    'position' => $position + 1,
                    'added_by' => $community->primaryLeader()?->user_id,
                    'created_at' => Carbon::now()->subDays(20),
                    'updated_at' => Carbon::now()->subDays(20),
                ]);
            }
        }
    }

    /** نقاش تحت الفعاليات — بما فيه تعليق معدَّل وآخر محذوف. */
    private function eventComments(): void
    {
        $events = Event::query()->whereIn('status', ['open', 'booked', 'completed'])->take(4)->get();

        foreach ($events as $event) {
            $members = $event->community?->members()->take(3)->get() ?? collect();

            if ($members->isEmpty()) {
                continue;
            }

            $lines = [
                'هل يمكن تقديم الموعد نصف ساعة؟ الزحام في هذا الوقت خانق.',
                'أنا جاهز. سأحضر كرتين احتياطيتين.',
                'اعتذر عن هذه الجولة — سفر عمل. أراكم في التالية.',
            ];

            foreach ($members as $index => $member) {
                $comment = EventComment::query()->create([
                    'event_id' => $event->id,
                    'employee_id' => $member->id,
                    'body' => $lines[$index] ?? $lines[0],
                    'created_at' => Carbon::now()->subDays(3 - $index),
                    'updated_at' => Carbon::now()->subDays(3 - $index),
                ]);

                // واحد معدَّل وواحد محذوف: الشاشة تعرض الحالتين بعلامتيهما.
                if ($index === 1) {
                    $comment->forceFill(['edited_at' => Carbon::now()->subDays(1)])->save();
                }

                if ($index === 2 && $event->status === 'completed') {
                    $comment->delete();
                }
            }
        }
    }

    /** مراجعة الصلاحيات الدورية — سجل حوكمة تطلبه المراجعة النظامية. */
    private function governance(): void
    {
        $admin = User::query()->where('email', 'admin@teamat.com')->first();

        if ($admin === null) {
            return;
        }

        foreach ([1, 4] as $monthsAgo) {
            PermissionReview::query()->create([
                'period' => Carbon::now()->subMonths($monthsAgo)->format('Y-m'),
                'reviewed_by_user_id' => $admin->id,
                'reviewed_by_name' => $admin->name,
                'assignments_reviewed' => DB::table('role_assignments')->count(),
                'notes' => 'مراجعة دورية لكل الإسنادات — لم تُرصد صلاحية زائدة عن الحاجة.',
                'reviewed_at' => Carbon::now()->subMonths($monthsAgo)->endOfMonth(),
            ]);
        }
    }

    /** صندوق رسائل الدعم بحالاته الثلاث، بحقول نموذج «اطلب عرضاً» كاملة. */
    private function supportInbox(): void
    {
        $rows = [
            ['نورة العتيبي', 'noura@rowad.sa', 'شركة الرواد للتقنية', '0501112233', '201-500', 'community-wallet', 'طلب عرض سعر', 'لدينا 320 موظفاً في الرياض ونرغب بعرض يشمل البادل وكرة القدم.', 'new'],
            ['خالد الدوسري', 'khalid@mubtakar.sa', 'مجموعة المبتكر', '0502223344', '50-200', 'employee-pay', 'استفسار عن مسار دفع الموظف', 'هل يمكن للموظف الدفع بالتقسيط أم دفعة واحدة قبل الفعالية؟', 'in_progress'],
            ['ريم الشمري', 'reem@afaq.sa', 'شركة آفاق', '0503334455', 'less-than-50', 'undecided', 'شركة صغيرة — هل نناسبكم؟', 'عددنا 28 موظفاً فقط، ونريد معرفة الحد الأدنى التعاقدي.', 'resolved'],
            ['سلطان القحطاني', 'sultan@energy.sa', 'الطاقة الخضراء', '0504445566', '500-plus', 'community-wallet', 'تكامل مع نظام الموارد البشرية', 'هل يوجد تكامل لرفع الموظفين آلياً بدل الاستيراد اليدوي؟', 'new'],
        ];

        foreach ($rows as $index => [$name, $email, $companyName, $phone, $range, $track, $subject, $message, $status]) {
            SupportMessage::query()->create([
                'name' => $name,
                'email' => $email,
                'company_name' => $companyName,
                'phone' => $phone,
                'employees_range' => $range,
                'financial_track' => $track,
                'subject' => $subject,
                'message' => $message,
                'status' => $status,
                'created_at' => Carbon::now()->subDays(($index + 1) * 3),
                'updated_at' => Carbon::now()->subDays($index + 1),
            ]);
        }
    }

    /**
     * سجل اختيار المزوّد — ما اقترحه المحرك وما اختاره المنشئ فعلاً.
     *
     * التجاوز مع سببه هو ما يجعل هذا السجل مفيداً: بدونه لا يُعرف إن كان
     * الاقتراح الآلي يُتَّبع أصلاً.
     */
    private function providerSelectionLogs(): void
    {
        $partnerIds = Partner::query()->where('status', 'active')->orderBy('id')->take(3)->pluck('id')->all();

        if (count($partnerIds) < 2) {
            return;
        }

        foreach (Event::query()->orderBy('id')->take(6)->get() as $index => $event) {
            $override = $index % 3 === 0;

            DB::table('provider_selection_logs')->insert([
                'event_id' => $event->id,
                'community_id' => $event->community_id,
                'chosen_partner_id' => $event->partner_id,
                'suggested_partner_id' => $override ? $partnerIds[1] : $event->partner_id,
                'was_override' => $override,
                'override_reason' => $override ? 'المرفق المقترح أبعد عن مقر الشركة بعشرين دقيقة.' : null,
                'suggestions_json' => json_encode(array_map(
                    fn ($id, $rank) => ['partner_id' => $id, 'rank' => $rank + 1],
                    $partnerIds,
                    array_keys($partnerIds),
                ), JSON_UNESCAPED_UNICODE),
                'actor_user_id' => $event->creator?->user_id,
                'created_at' => $event->created_at,
                'updated_at' => $event->created_at,
            ]);
        }
    }

    /** تاريخ انتقال الموظفين بين الأقسام — صف مفتوح وآخر منتهٍ. */
    private function departmentHistory(): void
    {
        $employees = Employee::query()->whereNotNull('department_id')->orderBy('id')->take(6)->get();

        foreach ($employees as $index => $employee) {
            $moved = $index % 2 === 0;

            if ($moved) {
                DB::table('department_history')->insert([
                    'company_id' => $employee->company_id,
                    'employee_id' => $employee->id,
                    'department_id' => $employee->department_id,
                    'started_at' => Carbon::now()->subMonths(14),
                    'ended_at' => Carbon::now()->subMonths(5),
                    'created_at' => Carbon::now()->subMonths(14),
                    'updated_at' => Carbon::now()->subMonths(5),
                ]);
            }

            DB::table('department_history')->insert([
                'company_id' => $employee->company_id,
                'employee_id' => $employee->id,
                'department_id' => $employee->department_id,
                'started_at' => $moved ? Carbon::now()->subMonths(5) : Carbon::now()->subMonths(11),
                'ended_at' => null,
                'created_at' => Carbon::now()->subMonths($moved ? 5 : 11),
                'updated_at' => Carbon::now()->subMonths($moved ? 5 : 11),
            ]);
        }
    }
}
