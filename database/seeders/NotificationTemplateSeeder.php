<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use App\Services\Notifications\TemplateRenderer;
use Illuminate\Database\Seeder;

/**
 * كتالوج نصوص الرسائل (H §14 — «القوالب يديرها أدمن تيمات فقط، ولا تُكتب نصوص
 * الرسائل داخل الكود»).
 *
 * كل صف هنا كان نصاً عربياً مكتوباً داخل موضع استدعاء. التصنيف
 * (إلزامي/اختياري) يتبع مصفوفة H §14 حرفياً؛ ما ليس في المصفوفة صُنِّف
 * اجتهاداً وموثَّق في `docs/divergences.md`.
 *
 * إعادة التشغيل **لا تدهس تحرير الأدمن**: القالب القائم تُزامَن حقوله البنيوية
 * فقط (التصنيف، القنوات، المتحوّلات)، ويبقى نصه كما حرّره الأدمن.
 */
class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $renderer = app(TemplateRenderer::class);

        foreach ($this->templates() as $row) {
            $variables = array_values(array_unique(array_merge(
                $renderer->declaredVariables($row['title_ar'] ?? ''),
                $renderer->declaredVariables($row['body_ar'] ?? ''),
            )));

            $structural = [
                'group' => $row['group'],
                'audience' => $row['audience'] ?? null,
                'class' => $row['class'],
                'channels' => $row['channels'] ?? ['whatsapp', 'sms', 'in_app'],
                'in_app_type' => $row['in_app_type'] ?? 'info',
                'variables' => $variables,
                'whatsapp_variables' => $row['whatsapp_variables'] ?? $variables,
                'active' => true,
            ];

            $existing = NotificationTemplate::query()->where('key', $row['key'])->first();

            if ($existing !== null) {
                $existing->fill($structural)->save();

                continue;
            }

            NotificationTemplate::query()->create($structural + [
                'key' => $row['key'],
                'title_ar' => $row['title_ar'],
                'title_en' => $row['title_en'] ?? null,
                'body_ar' => $row['body_ar'],
                'body_en' => $row['body_en'] ?? null,
                'whatsapp_template_name' => null,
            ]);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function templates(): array
    {
        return array_merge(
            $this->authTemplates(),
            $this->communityTemplates(),
            $this->eventTemplates(),
            $this->providerTemplates(),
            $this->moneyTemplates(),
            $this->billingTemplates(),
            $this->attendanceTemplates(),
            $this->engagementTemplates(),
            $this->reportTemplates(),
        );
    }

    /**
     * A13 — H §15: التقرير الشهري «يستلمه مسؤول الحساب ونسخة لأدمن تيمات».
     * غير مذكور في مصفوفة H §14 فصُنِّف `optional`؟ لا — التقرير الشهري التزام
     * تعاقدي في G/الشركة §9 («يصل مسؤول الحساب **آلياً**») فهو `mandatory`،
     * وقناته الأساسية داخل المنصة لأنه وثيقة لا تنبيه.
     *
     * @return array<int, array<string, mixed>>
     */
    private function reportTemplates(): array
    {
        return [
            [
                'key' => 'report.monthly.ready',
                'group' => 'engagement',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['whatsapp', 'sms', 'in_app'],
                'title_ar' => 'التقرير الشهري لدورة {period}',
                'title_en' => 'Monthly report for {period}',
                'body_ar' => 'جاهز تقرير {period}: {events} فعالية مكتملة، معدل تفعيل {activation}%، و{dormant} مجتمعاً خاملاً.',
                'body_en' => 'The {period} report is ready: {events} completed events, {activation}% activation, {dormant} dormant communities.',
            ],
            [
                'key' => 'report.monthly.admin_copy',
                'group' => 'engagement',
                'audience' => 'أدمن تيمات',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'title_ar' => 'نسخة تقرير {company} — {period}',
                'title_en' => 'Copy of {company} report — {period}',
                'body_ar' => 'صدر تقرير {period} لشركة {company}: {events} فعالية مكتملة، معدل تفعيل {activation}%، و{dormant} مجتمعاً خاملاً.',
                'body_en' => 'The {period} report for {company} was issued: {events} completed events, {activation}% activation, {dormant} dormant communities.',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function authTemplates(): array
    {
        return [
            [
                'key' => 'auth.otp',
                'group' => 'auth',
                'audience' => 'كل المستخدمين',
                'class' => 'mandatory',
                'channels' => ['whatsapp', 'sms'],
                'title_ar' => 'رمز تسجيل الدخول',
                'title_en' => 'Login code',
                'body_ar' => 'رمز دخولك إلى تيمات هو {code}. صالح ٥ دقائق ولا تشاركه مع أحد.',
                'body_en' => 'Your Teamat login code is {code}. Valid for 5 minutes — never share it.',
                'whatsapp_variables' => ['code'],
            ],
            [
                'key' => 'invite.employee',
                'group' => 'auth',
                'audience' => 'الموظف',
                'class' => 'mandatory',
                'title_ar' => 'دعوة للانضمام إلى تيمات',
                'title_en' => 'You are invited to Teamat',
                'body_ar' => 'دعوة من «{company}» للانضمام إلى تيمات. فعّل حسابك خلال {days} أيام عبر الرابط: {url}',
                'body_en' => '{company} invited you to Teamat. Activate your account within {days} days: {url}',
            ],
            [
                'key' => 'invite.provider',
                'group' => 'auth',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'title_ar' => 'دعوة لتفعيل حساب المزوّد',
                'title_en' => 'Activate your provider account',
                'body_ar' => 'دعاك أدمن تيمات لتفعيل حساب مزوّد الخدمة. فعّل حسابك عبر: {url}',
                'body_en' => 'Teamat invited you to activate your provider account: {url}',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function communityTemplates(): array
    {
        return [
            [
                'key' => 'community.request.submitted',
                'group' => 'community',
                'audience' => 'مسؤول الحساب',
                'class' => 'optional',
                'in_app_type' => 'community_request',
                'channels' => ['in_app'],
                'title_ar' => 'طلب إنشاء مجتمع جديد',
                'title_en' => 'New community request',
                'body_ar' => 'قام {employee} بطلب إنشاء مجتمع «{community}».',
                'body_en' => '{employee} requested a new community “{community}”.',
            ],
            [
                'key' => 'community.request.approved',
                'group' => 'community',
                'audience' => 'مقدّم الطلب',
                'class' => 'optional',
                'in_app_type' => 'community_request_approved',
                'title_ar' => 'تمت الموافقة على طلبك',
                'title_en' => 'Your request was approved',
                'body_ar' => 'تمت الموافقة على طلب إنشاء مجتمع «{community}».',
                'body_en' => 'Your request to create the community “{community}” was approved.',
            ],
            [
                'key' => 'community.request.rejected',
                'group' => 'community',
                'audience' => 'مقدّم الطلب',
                'class' => 'optional',
                'in_app_type' => 'community_request_rejected',
                'title_ar' => 'تم رفض طلبك',
                'title_en' => 'Your request was declined',
                'body_ar' => 'تم رفض طلب إنشاء مجتمع «{community}».{reason_suffix}',
                'body_en' => 'Your request to create the community “{community}” was declined.{reason_suffix}',
            ],
            [
                'key' => 'community.member.invited',
                'group' => 'community',
                'audience' => 'الموظف المدعو',
                'class' => 'optional',
                'in_app_type' => 'community_invite',
                'title_ar' => 'دعوة للانضمام إلى {community}',
                'title_en' => 'Invitation to join {community}',
                'body_ar' => 'دعاك {inviter} للانضمام إلى مجتمع «{community}».',
                'body_en' => '{inviter} invited you to join the “{community}” community.',
            ],
            [
                'key' => 'community.member.removed',
                'group' => 'community',
                'audience' => 'العضو',
                'class' => 'mandatory',
                'in_app_type' => 'community_removed',
                'title_ar' => 'تمت إزالتك من مجتمع',
                'title_en' => 'You were removed from a community',
                'body_ar' => 'تمت إزالتك من مجتمع «{community}». السبب: {reason}',
                'body_en' => 'You were removed from the “{community}” community. Reason: {reason}',
            ],
            [
                'key' => 'community.member.banned',
                'group' => 'community',
                'audience' => 'العضو',
                'class' => 'mandatory',
                'in_app_type' => 'community_banned',
                'title_ar' => 'تم حظرك من مجتمع',
                'title_en' => 'You were banned from a community',
                'body_ar' => 'تم حظرك من مجتمع «{community}» ولا يمكنك إعادة الانضمام. السبب: {reason}',
                'body_en' => 'You were banned from “{community}” and cannot rejoin. Reason: {reason}',
            ],
            [
                'key' => 'community.leaderless',
                'group' => 'community',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'in_app_type' => 'community_leaderless',
                'title_ar' => 'مجتمع بلا قائد',
                'title_en' => 'Community without a leader',
                'body_ar' => 'أصبح مجتمع «{community}» بلا قائد. يرجى تعيين قائد جديد — بعد ٣٠ يوماً يصبح المجتمع خاملاً.',
                'body_en' => 'The “{community}” community has no leader. Assign one — after 30 days it becomes dormant.',
            ],
            [
                'key' => 'community.leaderless.departed',
                'group' => 'community',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'in_app_type' => 'community_leaderless',
                'title_ar' => 'مجتمع بلا قائد',
                'title_en' => 'Community without a leader',
                'body_ar' => 'غادر قائد مجتمع «{community}» الشركة. يرجى تعيين قائد جديد.',
                'body_en' => 'The leader of “{community}” left the company. Please assign a new one.',
            ],
            [
                'key' => 'community.leaderless.reminder',
                'group' => 'community',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'in_app_type' => 'community_leaderless_alert',
                'title_ar' => 'مجتمع بلا قائد منذ ١٤ يوماً',
                'title_en' => 'Community leaderless for 14 days',
                'body_ar' => 'مجتمع «{community}» بلا قائد منذ ١٤ يوماً. عيّن قائداً قبل أن يصبح خاملاً بعد ٣٠ يوماً.',
                'body_en' => '“{community}” has been leaderless for 14 days. Assign a leader before it goes dormant at 30.',
            ],
            [
                'key' => 'community.primary_leader_needed',
                'group' => 'community',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'in_app_type' => 'community_primary_needed',
                'title_ar' => 'مجتمع بلا قائد أساسي',
                'title_en' => 'Community without a primary leader',
                'body_ar' => 'غادر القائد الأساسي لمجتمع «{community}». يرجى تحديد قائد أساسي من القادة الحاليين.',
                'body_en' => 'The primary leader of “{community}” left. Please designate one from the current leaders.',
            ],
            [
                'key' => 'community.dormant',
                'group' => 'community',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'in_app_type' => 'community_dormant',
                'title_ar' => 'أصبح المجتمع خاملاً',
                'title_en' => 'Community is now dormant',
                'body_ar' => 'مجتمع «{community}» بلا قائد منذ ٣٠ يوماً وأصبح خاملاً — توقف توليد فعالياته. تعيين قائد جديد يعيد تنشيطه.',
                'body_en' => '“{community}” has been leaderless for 30 days and is now dormant — event generation stopped. Assigning a leader reactivates it.',
            ],
            [
                'key' => 'community.announcement',
                'group' => 'community',
                'audience' => 'أعضاء المجتمع',
                'class' => 'optional',
                'in_app_type' => 'announcement',
                'channels' => ['in_app'],
                'title_ar' => 'إعلان جديد في {community}',
                'title_en' => 'New announcement in {community}',
                'body_ar' => '{excerpt}',
                'body_en' => '{excerpt}',
            ],
            [
                'key' => 'community.poll',
                'group' => 'community',
                'audience' => 'أعضاء المجتمع',
                'class' => 'optional',
                'in_app_type' => 'poll',
                'channels' => ['in_app'],
                'title_ar' => 'تصويت جديد في {community}',
                'title_en' => 'New poll in {community}',
                'body_ar' => '{question}',
                'body_en' => '{question}',
            ],
            [
                'key' => 'community.comment.reported',
                'group' => 'community',
                'audience' => 'مسؤول الحساب',
                'class' => 'optional',
                'channels' => ['in_app'],
                'in_app_type' => 'comment_reported',
                'title_ar' => 'تبليغ عن تعليق',
                'title_en' => 'Comment reported',
                'body_ar' => 'بلّغ {reporter} عن تعليق في فعالية بمجتمع «{community}»{reason_suffix}',
                'body_en' => '{reporter} reported a comment on an event in “{community}”{reason_suffix}',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function eventTemplates(): array
    {
        return [
            // ── فعالية جديدة في مجتمعك (H §14: اختياري) ──────────────────
            [
                'key' => 'event.created.member',
                'group' => 'events',
                'audience' => 'أعضاء المجتمع',
                'class' => 'optional',
                'title_ar' => 'فعالية جديدة',
                'title_en' => 'New event',
                'body_ar' => 'تم إنشاء فعالية جديدة في {community} — انضم الآن!',
                'body_en' => 'A new event was created in {community} — join now!',
            ],
            [
                'key' => 'event.published.member',
                'group' => 'events',
                'audience' => 'أعضاء المجتمع',
                'class' => 'optional',
                'title_ar' => 'فعالية جديدة',
                'title_en' => 'New event',
                'body_ar' => 'تم نشر فعالية جديدة في {community} — انضم الآن!',
                'body_en' => 'A new event was published in {community} — join now!',
            ],
            [
                'key' => 'event.generated.member',
                'group' => 'events',
                'audience' => 'أعضاء المجتمع',
                'class' => 'optional',
                'title_ar' => 'فعالية جديدة',
                'title_en' => 'New event',
                'body_ar' => 'وُلّدت فعالية جديدة في {community} يوم {date} — انضم الآن!',
                'body_en' => 'A new event was generated in {community} on {date} — join now!',
            ],

            // ── اقتراح الفعالية ─────────────────────────────────────────
            [
                'key' => 'event.proposal.pending_leader',
                'group' => 'events',
                'audience' => 'قائد المجتمع',
                'class' => 'optional',
                'title_ar' => 'اقتراح فعالية بانتظار الاعتماد',
                'title_en' => 'Event proposal awaiting approval',
                'body_ar' => 'اقترح {creator} فعالية في {community} — الاعتماد خلال ٤٨ ساعة وإلا رُفض تلقائياً.',
                'body_en' => '{creator} proposed an event in {community} — approve within 48 hours or it is auto-declined.',
            ],
            [
                'key' => 'event.proposal.approved',
                'group' => 'events',
                'audience' => 'مقترح الفعالية',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'اعتُمد اقتراحك',
                'title_en' => 'Your proposal was approved',
                'body_ar' => 'اعتُمد اقتراح فعاليتك ونُشرت للمجتمع.',
                'body_en' => 'Your event proposal was approved and published to the community.',
            ],
            [
                'key' => 'event.proposal.rejected',
                'group' => 'events',
                'audience' => 'مقترح الفعالية',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'رُفض اقتراحك',
                'title_en' => 'Your proposal was declined',
                'body_ar' => 'رُفض اقتراح فعاليتك.{reason_suffix}',
                'body_en' => 'Your event proposal was declined.{reason_suffix}',
            ],
            [
                'key' => 'event.proposal.auto_rejected',
                'group' => 'events',
                'audience' => 'مقترح الفعالية',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'رُفض اقتراحك تلقائياً',
                'title_en' => 'Your proposal was auto-declined',
                'body_ar' => 'انقضت مهلة اعتماد اقتراح فعاليتك ({hours} ساعة) دون قرار فرُفض تلقائياً.',
                'body_en' => 'The approval window for your event proposal ({hours} hours) passed with no decision, so it was auto-declined.',
            ],

            // ── العضوية في الفعالية ─────────────────────────────────────
            [
                'key' => 'event.participant.removed',
                'group' => 'events',
                'audience' => 'المشارك',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'تمت إزالتك من الفعالية',
                'title_en' => 'You were removed from the event',
                'body_ar' => 'قام منشئ الفعالية بإزالتك من فعالية {community}.',
                'body_en' => 'The event creator removed you from the {community} event.',
            ],
            [
                'key' => 'event.waitlist.cancelled',
                'group' => 'events',
                'audience' => 'من في قائمة الانتظار',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'تم إلغاء الفعالية',
                'title_en' => 'The event was cancelled',
                'body_ar' => 'تم إلغاء الفعالية التي كنت في قائمة انتظارها.',
                'body_en' => 'The event you were waitlisted for has been cancelled.',
            ],
            [
                'key' => 'event.waitlist.offered',
                'group' => 'events',
                'audience' => 'التالي في قائمة الانتظار',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'شغر مقعد في الفعالية',
                'title_en' => 'A seat opened up',
                'body_ar' => 'شغر مقعد وأنت أول قائمة الانتظار — أكّد انضمامك خلال {minutes} دقيقة وإلا انتقل العرض للتالي.',
                'body_en' => 'A seat opened and you are first on the waitlist — confirm within {minutes} minutes or the offer moves on.',
            ],
            [
                'key' => 'event.waitlist.offer_expired',
                'group' => 'events',
                'audience' => 'من في قائمة الانتظار',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'انتهت مهلة عرض المقعد',
                'title_en' => 'Your seat offer expired',
                'body_ar' => 'انتهت مهلة تأكيد المقعد الشاغر وانتقل العرض للتالي في قائمة الانتظار.',
                'body_en' => 'The window to confirm the open seat passed; the offer moved to the next person on the waitlist.',
            ],
            [
                'key' => 'event.waitlist.confirmed',
                'group' => 'events',
                'audience' => 'من في قائمة الانتظار',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'تم تأكيد مقعدك',
                'title_en' => 'Your seat is confirmed',
                'body_ar' => 'شغر مقعد في الفعالية وتم تأكيد انضمامك من قائمة الانتظار.',
                'body_en' => 'A seat opened up and your place from the waitlist is confirmed.',
            ],
            [
                'key' => 'event.registration.closed_waitlisted',
                'group' => 'events',
                'audience' => 'من في قائمة الانتظار',
                'class' => 'optional',
                'title_ar' => 'أُغلق التسجيل',
                'title_en' => 'Registration closed',
                'body_ar' => 'أُغلق تسجيل الفعالية ولم يشغر مقعد لك — تبقى في القائمة كبديل إن تعذر تحصيل حصة أحد المشاركين.',
                'body_en' => 'Registration closed and no seat opened for you — you stay on the list in case a participant’s payment fails.',
            ],

            // ── التأكيد والتذكيرات (H §14) ──────────────────────────────
            [
                'key' => 'event.confirmed.participant',
                'group' => 'events',
                'audience' => 'المشاركون',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'تأكيد الفعالية',
                'title_en' => 'Event confirmed',
                'body_ar' => 'تأكدت فعالية {community} يوم {date} في {location}. نراك هناك!',
                'body_en' => 'Your {community} event on {date} at {location} is confirmed. See you there!',
            ],
            [
                'key' => 'event.confirmed.provider',
                'group' => 'events',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'تأكيد الفعالية',
                'title_en' => 'Event confirmed',
                'body_ar' => 'تأكدت الفعالية #{event_id} يوم {date} بعدد {participants} مشاركاً.',
                'body_en' => 'Event #{event_id} on {date} is confirmed with {participants} participants.',
            ],
            [
                'key' => 'event.reminder.24h',
                'group' => 'events',
                'audience' => 'المشاركون المؤكدون',
                'class' => 'optional',
                'title_ar' => 'تذكير: فعاليتك غداً',
                'title_en' => 'Reminder: your event is tomorrow',
                'body_ar' => 'تذكير: فعالية {community} غداً {date} في {location}. نراك هناك!',
                'body_en' => 'Reminder: your {community} event is tomorrow, {date}, at {location}. See you there!',
            ],
            [
                'key' => 'event.reminder.2h',
                'group' => 'events',
                'audience' => 'المشاركون المؤكدون',
                'class' => 'optional',
                'title_ar' => 'تذكير: فعاليتك بعد ساعتين',
                'title_en' => 'Reminder: your event starts in 2 hours',
                'body_ar' => 'تذكير: فعالية {community} تبدأ الساعة {time} في {location}.',
                'body_en' => 'Reminder: your {community} event starts at {time} at {location}.',
            ],
            [
                'key' => 'event.closing_soon',
                'group' => 'events',
                'audience' => 'غير المنضمين في المجتمع',
                'class' => 'optional',
                'title_ar' => 'قرب إغلاق التسجيل',
                'title_en' => 'Registration closes soon',
                'body_ar' => 'يُغلق تسجيل فعالية {community} الساعة {time} — تبقّى {seats} مقاعد.',
                'body_en' => 'Registration for the {community} event closes at {time} — {seats} seats left.',
            ],
            [
                'key' => 'event.min_approaching',
                'group' => 'events',
                'audience' => 'غير المنضمين في المجتمع',
                'class' => 'optional',
                'title_ar' => 'اقترب الحد الأدنى',
                'title_en' => 'Minimum nearly reached',
                'body_ar' => 'تبقّى {needed} مشاركين ليبلغ حد فعالية {community} الأدنى — انضم لتقام الفعالية.',
                'body_en' => '{needed} more participants and the {community} event reaches its minimum — join to make it happen.',
            ],

            // ── فشل الحد الأدنى وإعادة الجدولة ──────────────────────────
            [
                'key' => 'event.min_not_met.participant',
                'group' => 'events',
                'audience' => 'المشاركون',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'أُلغيت الفعالية — لم يكتمل العدد',
                'title_en' => 'Event cancelled — minimum not met',
                'body_ar' => 'لم تبلغ الفعالية حدها الأدنى عند إغلاق التسجيل — لا أثر مالي عليك.',
                'body_en' => 'The event did not reach its minimum by registration close — you are not charged anything.',
            ],
            [
                'key' => 'event.min_not_met.leader',
                'group' => 'events',
                'audience' => 'قائد المجتمع',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'راجع الحد الأدنى للفعالية',
                'title_en' => 'Review the event minimum',
                'body_ar' => 'أُلغيت فعالية {community} لعدم بلوغ الحد الأدنى ({minimum}) — بلغ العدد {reserved} فقط. راجع الحد الأدنى أو موعد الفعالية.',
                'body_en' => 'The {community} event was cancelled for not reaching its minimum ({minimum}) — only {reserved} joined. Review the minimum or the date.',
            ],
            [
                'key' => 'event.min_not_met.partner',
                'group' => 'events',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'إلغاء حجز — لم يكتمل العدد',
                'title_en' => 'Booking cancelled — minimum not met',
                'body_ar' => 'أُلغيت الفعالية #{event_id} لعدم بلوغ الحد الأدنى قبل إغلاق التسجيل.',
                'body_en' => 'Event #{event_id} was cancelled for not reaching its minimum before registration closed.',
            ],
            [
                'key' => 'event.reschedule.request_cancelled.partner',
                'group' => 'events',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'إلغاء حجز — لم يكتمل العدد',
                'title_en' => 'Booking cancelled — minimum not met',
                'body_ar' => 'أُلغي طلب الحجز #{request_id} للفعالية #{event_id}: لم يبلغ العدد الحد الأدنى قبل إغلاق التسجيل. الوحدة أُعيدت متاحة في تقويمك.',
                'body_en' => 'Booking request #{request_id} for event #{event_id} was cancelled: the minimum was not met before registration closed. The unit is available again on your calendar.',
            ],
            [
                'key' => 'event.reschedule.participant',
                'group' => 'events',
                'audience' => 'المشاركون',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'أُعيدت جدولة الفعالية — لم يكتمل العدد',
                'title_en' => 'Event rescheduled — minimum not met',
                'body_ar' => 'لم يبلغ العدد الحد الأدنى عند إغلاق التسجيل، فأُعيدت جدولة الفعالية إلى {date} (نفس الفعالية ونفس الرابط). مقعدك محفوظ ولا أثر مالي عليك.',
                'body_en' => 'The minimum was not met at registration close, so the event moved to {date} (same event, same link). Your seat is kept and you are not charged.',
            ],
            [
                'key' => 'event.reschedule.leader',
                'group' => 'events',
                'audience' => 'قائد المجتمع',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'أُعيدت جدولة فعالية — محاولة أخيرة',
                'title_en' => 'Event rescheduled — final attempt',
                'body_ar' => 'أُعيدت جدولة الفعالية #{event_id} إلى {date} لعدم بلوغ الحد الأدنى ({minimum}). إن فشلت المحاولة الثانية تُلغى نهائياً — ادفع للانضمام أو راجع الحد الأدنى.',
                'body_en' => 'Event #{event_id} moved to {date} for not reaching its minimum ({minimum}). If the second attempt fails it is cancelled for good — join or review the minimum.',
            ],
            [
                'key' => 'event.registration.extended',
                'group' => 'events',
                'audience' => 'أعضاء المجتمع',
                'class' => 'optional',
                'title_ar' => 'مُدد تسجيل الفعالية ٢٤ ساعة',
                'title_en' => 'Registration extended by 24 hours',
                'body_ar' => 'مُدد التسجيل في الفعالية #{event_id} حتى {closes_at} — لم يكتمل العدد بعد، انضم الآن!',
                'body_en' => 'Registration for event #{event_id} is extended to {closes_at} — the minimum is not met yet, join now!',
            ],

            // ── الوقت البديل ────────────────────────────────────────────
            [
                'key' => 'event.alternative.accepted.member',
                'group' => 'events',
                'audience' => 'المشاركون',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'تم تغيير وقت الفعالية',
                'title_en' => 'The event time changed',
                'body_ar' => 'تم تحديث وقت فعالية {community} إلى {date} الساعة {time}. مقعدك محفوظ — ولك انسحاب حر خلال {hours} ساعات.',
                'body_en' => 'The {community} event moved to {date} at {time}. Your seat is kept — you may withdraw free of charge within {hours} hours.',
            ],
            [
                'key' => 'event.alternative.accepted.company',
                'group' => 'events',
                'audience' => 'مسؤول الحساب',
                'class' => 'optional',
                'channels' => ['in_app'],
                'in_app_type' => 'success',
                'title_ar' => 'تم قبول الوقت البديل',
                'title_en' => 'Alternative time accepted',
                'body_ar' => 'تم قبول الوقت البديل للفعالية #{event_id} — عادت مفتوحة بالتاريخ الجديد والمشاركون محفوظون.',
                'body_en' => 'The alternative time for event #{event_id} was accepted — it reopened on the new date with participants kept.',
            ],
            [
                'key' => 'event.alternative.rejected.member',
                'group' => 'events',
                'audience' => 'المشاركون',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'تم إلغاء الفعالية',
                'title_en' => 'The event was cancelled',
                'body_ar' => 'تم رفض الوقت البديل وإلغاء فعالية {community}.',
                'body_en' => 'The alternative time was declined and the {community} event was cancelled.',
            ],

            // ── قوالب التكرار (A8) ──────────────────────────────────────
            [
                'key' => 'event.template.skipped.blackout',
                'group' => 'events',
                'audience' => 'قادة المجتمع',
                'class' => 'optional',
                'channels' => ['in_app'],
                'in_app_type' => 'warning',
                'title_ar' => 'تُخطيت فعالية قالب — فترة حظر',
                'title_en' => 'Template occurrence skipped — blackout',
                'body_ar' => 'لن تُولَّد فعالية «{template}» ليوم {date} لوقوعه في «{blackout}» (إعداد القالب: تخطٍ).',
                'body_en' => 'The “{template}” event for {date} will not be generated — it falls in “{blackout}” (template setting: skip).',
            ],
            [
                'key' => 'event.template.shifted',
                'group' => 'events',
                'audience' => 'قادة المجتمع',
                'class' => 'optional',
                'channels' => ['in_app'],
                'in_app_type' => 'warning',
                'title_ar' => 'أُزيح موعد فعالية القالب أسبوعاً',
                'title_en' => 'Template occurrence shifted a week',
                'body_ar' => 'فعالية «{template}» ليوم {pattern_date} تقع في «{blackout}» — وُلّدت بتاريخ {date} (إزاحة أسبوع حسب إعداد القالب).',
                'body_en' => 'The “{template}” event for {pattern_date} falls in “{blackout}” — generated on {date} instead (one-week shift per template setting).',
            ],
            [
                'key' => 'event.template.skipped.unavailable',
                'group' => 'events',
                'audience' => 'قادة المجتمع',
                'class' => 'optional',
                'channels' => ['in_app'],
                'in_app_type' => 'warning',
                'title_ar' => 'لم تُولَّد فعالية القالب — الوحدة غير متاحة',
                'title_en' => 'Template occurrence not generated — unit unavailable',
                'body_ar' => 'وحدة النشاط المرتبطة بقالب «{template}» غير متاحة يوم {date} (خارج أوقات العمل أو محجوزة) — لم تُولَّد الفعالية. أنشئها يدوياً بوقت أو مزوّد آخر إن أردت.',
                'body_en' => 'The activity unit tied to the “{template}” template is unavailable on {date} (outside hours or already booked) — no event was generated. Create one manually with another time or provider.',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function providerTemplates(): array
    {
        return [
            [
                'key' => 'provider.request.new',
                'group' => 'provider',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'title_ar' => 'طلب حجز جديد',
                'title_en' => 'New booking request',
                'body_ar' => 'طلب حجز جديد #{request_id} عبر تيمات. القرار من لوحتك فقط — الرد النصي لا يُعتد به. رابط صفحة القرار (صالح ٧٢ ساعة ولمرة واحدة): {url} — مهلة الرد: {deadline}',
                'body_en' => 'New booking request #{request_id} on Teamat. The decision is made in your panel only — a text reply is not binding. Decision link (valid 72 hours, single use): {url} — respond by {deadline}',
            ],
            [
                'key' => 'provider.request.minimum_reached',
                'group' => 'provider',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'title_ar' => 'طلب فعالية جديد',
                'title_en' => 'New event request',
                'body_ar' => 'بلغت الفعالية #{event_id} حدها الأدنى — بانتظار ردك خلال المهلة (١٢ ساعة أو حتى ٦ ساعات قبل الموعد أيهما أقرب).',
                'body_en' => 'Event #{event_id} reached its minimum — awaiting your reply within the window (12 hours, or 6 hours before start, whichever is sooner).',
            ],
            [
                'key' => 'provider.request.deadline_expired.partner',
                'group' => 'provider',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'انتهت مهلة الرد',
                'title_en' => 'Response deadline passed',
                'body_ar' => 'انتهت مهلة الرد على طلب الحجز #{request_id} — الطلب سقط وانعكس أثره على مؤشر الموثوقية.',
                'body_en' => 'The response window for booking request #{request_id} passed — the request lapsed and it affected your reliability score.',
            ],
            [
                'key' => 'provider.request.deadline_expired.company',
                'group' => 'provider',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'in_app_type' => 'warning',
                'title_ar' => 'المزوّد لم يرد في المهلة',
                'title_en' => 'Provider did not respond in time',
                'body_ar' => 'انتهت مهلة رد المزوّد على الفعالية #{event_id} بلا قرار — يلزم اختيار مزوّد آخر أو وقت آخر.',
                'body_en' => 'The provider’s window for event #{event_id} passed with no decision — pick another provider or another time.',
            ],
            [
                'key' => 'provider.request.deadline_expired.creator',
                'group' => 'provider',
                'audience' => 'منشئ الفعالية',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'المزوّد لم يرد في المهلة',
                'title_en' => 'Provider did not respond in time',
                'body_ar' => 'انتهت مهلة رد المزوّد على فعاليتك #{event_id} بلا قرار.',
                'body_en' => 'The provider’s window for your event #{event_id} passed with no decision.',
            ],
            [
                'key' => 'provider.decision.accepted.company',
                'group' => 'provider',
                'audience' => 'مسؤول الحساب',
                'class' => 'optional',
                'channels' => ['in_app'],
                'in_app_type' => 'success',
                'title_ar' => 'تم قبول الطلب',
                'title_en' => 'Request accepted',
                'body_ar' => 'المزوّد قبل طلب الفعالية #{event_id} — الوحدة محجوزة والتسجيل مفتوح حتى موعد الإغلاق.',
                'body_en' => 'The provider accepted the request for event #{event_id} — the unit is booked and registration is open until close.',
            ],
            [
                'key' => 'provider.decision.accepted.member',
                'group' => 'provider',
                'audience' => 'أعضاء المجتمع',
                'class' => 'optional',
                'in_app_type' => 'success',
                'title_ar' => 'قبل المزوّد الفعالية',
                'title_en' => 'The provider accepted the event',
                'body_ar' => 'قبل المزوّد فعالية {community} — التسجيل مستمر حتى الإغلاق.',
                'body_en' => 'The provider accepted the {community} event — registration continues until close.',
            ],
            [
                'key' => 'provider.decision.rejected.company',
                'group' => 'provider',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'in_app_type' => 'error',
                'title_ar' => 'تم رفض الطلب',
                'title_en' => 'Request declined',
                'body_ar' => 'رفض المزوّد طلب الفعالية #{event_id} — السبب: {reason}',
                'body_en' => 'The provider declined the request for event #{event_id} — reason: {reason}',
            ],
            [
                'key' => 'provider.decision.rejected.member',
                'group' => 'provider',
                'audience' => 'أعضاء المجتمع',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'تم رفض الفعالية',
                'title_en' => 'The event was declined',
                'body_ar' => 'رفض المزوّد فعالية {community}.',
                'body_en' => 'The provider declined the {community} event.',
            ],
            [
                'key' => 'provider.decision.alternative.company',
                'group' => 'provider',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'in_app_type' => 'warning',
                'title_ar' => 'وقت بديل مقترح من المزوّد',
                'title_en' => 'Provider proposed an alternative time',
                'body_ar' => 'اقترح المزوّد وقتاً بديلاً للفعالية #{event_id} — التاريخ: {date} الساعة: {time}',
                'body_en' => 'The provider proposed an alternative time for event #{event_id} — date: {date}, time: {time}',
            ],
            [
                'key' => 'provider.decision.alternative.creator',
                'group' => 'provider',
                'audience' => 'منشئ الفعالية',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'وقت بديل مقترح من المزوّد',
                'title_en' => 'Provider proposed an alternative time',
                'body_ar' => 'اقترح المزوّد وقتاً بديلاً للفعالية — التاريخ: {date} الساعة: {time}',
                'body_en' => 'The provider proposed an alternative time — date: {date}, time: {time}',
            ],
            [
                'key' => 'provider.cancelled.company',
                'group' => 'provider',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'channels' => ['in_app'],
                'in_app_type' => 'error',
                'title_ar' => 'ألغى المزوّد الحجز',
                'title_en' => 'The provider cancelled the booking',
                'body_ar' => 'ألغى المزوّد الفعالية #{event_id} بعد قبولها — تُطبَّق سياسة إلغاء المزوّد. السبب: {reason}',
                'body_en' => 'The provider cancelled event #{event_id} after accepting it — the provider-cancellation policy applies. Reason: {reason}',
            ],
            [
                'key' => 'provider.bank_account.approved',
                'group' => 'provider',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'اعتُمد حسابك البنكي',
                'title_en' => 'Your bank account was approved',
                'body_ar' => 'اعتمد أدمن تيمات حسابك البنكي — التحويلات أصبحت متاحة.',
                'body_en' => 'Teamat approved your bank account — payouts are now available.',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function moneyTemplates(): array
    {
        return [
            [
                'key' => 'payment.demand',
                'group' => 'money',
                'audience' => 'المشاركون المطالبون',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'مطالبة دفع — ثُبّتت حصتك',
                'title_en' => 'Payment due — your share is locked',
                'body_ar' => 'حصتك في فعالية {community}: {amount} ريال (شاملة الضريبة). ادفع قبل الساعة {deadline} من هذا الرابط: {url} — مقعدك محجوز طوال المهلة، وإغلاق الصفحة لا يلغي شيئاً.',
                'body_en' => 'Your share for the {community} event: SAR {amount} (VAT included). Pay before {deadline} using this link: {url} — your seat is held for the whole window, and closing the page cancels nothing.',
            ],
            [
                'key' => 'payment.deadline_expired',
                'group' => 'money',
                'audience' => 'المشارك',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'انقضت مهلة الدفع',
                'title_en' => 'Payment window expired',
                'body_ar' => 'لم تُسدد حصتك خلال النافذة فأُخلي مقعدك وعُرض على قائمة الانتظار.',
                'body_en' => 'Your share was not paid within the window, so your seat was released to the waitlist.',
            ],
            [
                'key' => 'waitlist.offer',
                'group' => 'money',
                'audience' => 'التالي في قائمة الانتظار',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'شغر مقعد — أنت البديل',
                'title_en' => 'A seat opened — you are next',
                'body_ar' => 'شغر مقعد بعد إغلاق التسجيل وأنت أول قائمة الانتظار. أكّد وادفع حصتك خلال {minutes} دقيقة وإلا انتقل العرض للتالي.',
                'body_en' => 'A seat opened after registration closed and you are first on the waitlist. Confirm and pay within {minutes} minutes or the offer moves on.',
            ],
            [
                'key' => 'event.collection_failed.participant',
                'group' => 'money',
                'audience' => 'المشاركون',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'أُلغيت الفعالية — فشل التحصيل',
                'title_en' => 'Event cancelled — collection failed',
                'body_ar' => 'لم يكتمل تحصيل الحصص فأُلغيت الفعالية. كل مبلغ دُفع يُرد تلقائياً إلى وسيلة الدفع الأصلية.',
                'body_en' => 'Share collection did not complete, so the event was cancelled. Everything paid is refunded automatically to the original payment method.',
            ],
            [
                'key' => 'event.collection_failed.partner',
                'group' => 'money',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'أُلغيت الفعالية — فشل التحصيل',
                'title_en' => 'Event cancelled — collection failed',
                'body_ar' => 'أُلغيت الفعالية #{event_id} لفشل تحصيل الحصص — لا مستحقات عليها.',
                'body_en' => 'Event #{event_id} was cancelled because share collection failed — nothing is payable on it.',
            ],
            [
                'key' => 'event.cancelled.no_charge',
                'group' => 'money',
                'audience' => 'المشاركون',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'أُلغيت الفعالية — بلا أي استقطاع',
                'title_en' => 'Event cancelled — nothing charged',
                'body_ar' => 'رصيد محفظة المجتمع لم يكف الدعم الموعود، والحصة المعادة كانت ستتجاوز السقف المعلن لك — أُلغيت الفعالية ولن يُستقطع منك شيء.',
                'body_en' => 'The community wallet could not cover the promised subsidy and the recalculated share would exceed the ceiling announced to you — the event was cancelled and you are charged nothing.',
            ],
            [
                'key' => 'payment.refunded',
                'group' => 'money',
                'audience' => 'المشارك',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'رُدّ مبلغك',
                'title_en' => 'You were refunded',
                'body_ar' => 'رُدّ مبلغ {amount} ريال إلى وسيلة الدفع الأصلية تلقائياً — لا حاجة لأي إجراء منك.',
                'body_en' => 'SAR {amount} was refunded automatically to your original payment method — no action needed.',
            ],
            [
                'key' => 'wallet.below_subsidy.leader',
                'group' => 'money',
                'audience' => 'قائد المجتمع',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'رصيد المحفظة لا يغطي دعم الفعالية',
                'title_en' => 'Wallet balance below the expected subsidy',
                'body_ar' => 'بلغت فعالية {community} حدها الأدنى، لكن رصيد محفظة المجتمع ({available} ريال) لا يغطي الدعم المتوقع ({planned} ريال). اشحن الرصيد قبل إغلاق التسجيل وإلا أُعيد حساب الحصص ضمن السقف المعلن أو أُلغيت الفعالية.',
                'body_en' => 'The {community} event reached its minimum, but the community wallet (SAR {available}) does not cover the expected subsidy (SAR {planned}). Top up before registration closes or shares are recalculated within the announced ceiling — or the event is cancelled.',
            ],
            [
                'key' => 'wallet.below_subsidy.company',
                'group' => 'money',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'رصيد محفظة مجتمع لا يغطي دعم فعالية',
                'title_en' => 'A community wallet is below the expected subsidy',
                'body_ar' => 'بلغت فعالية {community} حدها الأدنى، لكن رصيد محفظة المجتمع ({available} ريال) لا يغطي الدعم المتوقع ({planned} ريال). اشحن الرصيد قبل إغلاق التسجيل وإلا أُعيد حساب الحصص ضمن السقف المعلن أو أُلغيت الفعالية.',
                'body_en' => 'The {community} event reached its minimum, but the community wallet (SAR {available}) does not cover the expected subsidy (SAR {planned}). Top up before registration closes.',
            ],
            [
                'key' => 'wallet.topup.approved',
                'group' => 'money',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'تم اعتماد طلب الشحن',
                'title_en' => 'Top-up approved',
                'body_ar' => 'اعتُمد تحويلكم البنكي بمبلغ {amount} ريال وأُضيف إلى رصيد المحفظة.',
                'body_en' => 'Your bank transfer of SAR {amount} was approved and credited to the wallet.',
            ],
            [
                'key' => 'wallet.topup.rejected',
                'group' => 'money',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'تم رفض طلب الشحن',
                'title_en' => 'Top-up declined',
                'body_ar' => 'رُفض طلب شحن المحفظة بمبلغ {amount} ريال — السبب: {reason}',
                'body_en' => 'The wallet top-up of SAR {amount} was declined — reason: {reason}',
            ],
            [
                'key' => 'wallet.topup.reversed',
                'group' => 'money',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'أُلغي اعتماد طلب الشحن',
                'title_en' => 'Top-up approval reversed',
                'body_ar' => 'أُلغي اعتماد تحويلكم البنكي بمبلغ {amount} ريال وسُحب المبلغ بحركة عكسية — السبب: {reason}',
                'body_en' => 'The approval of your SAR {amount} bank transfer was reversed and the amount was debited back — reason: {reason}',
            ],
        ];
    }

    /**
     * فوترة وتسويات (H §14) — مفاتيح جاهزة يستهلكها A11.
     *
     * @return array<int, array<string, mixed>>
     */
    private function billingTemplates(): array
    {
        return [
            [
                'key' => 'invoice.issued',
                'group' => 'billing',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'title_ar' => 'صدرت الفاتورة الشهرية',
                'title_en' => 'Monthly invoice issued',
                'body_ar' => 'صدرت فاتورة {period} بمبلغ {amount} ريال. تستحق في {due_date}.',
                'body_en' => 'The {period} invoice of SAR {amount} was issued. Due on {due_date}.',
            ],
            [
                'key' => 'invoice.reminder',
                'group' => 'billing',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'تذكير باستحقاق الفاتورة',
                'title_en' => 'Invoice due reminder',
                'body_ar' => 'فاتورة {period} بمبلغ {amount} ريال ما زالت غير مسددة وتستحق في {due_date}.',
                'body_en' => 'Invoice {period} of SAR {amount} is still unpaid and due on {due_date}.',
            ],
            [
                'key' => 'settlement.ready',
                'group' => 'billing',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'title_ar' => 'كشف تسوية جاهز',
                'title_en' => 'Settlement statement ready',
                'body_ar' => 'كشف تسوية الفترة {period} جاهز: {events} فعالية بصافي {amount} ريال.',
                'body_en' => 'Your settlement statement for {period} is ready: {events} events, net SAR {amount}.',
            ],
            [
                'key' => 'settlement.paid',
                'group' => 'billing',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'صُرفت مستحقاتك',
                'title_en' => 'Your payout was made',
                'body_ar' => 'صُرف مبلغ {amount} ريال عن كشف الفترة {period} إلى حسابك البنكي.',
                'body_en' => 'SAR {amount} for the {period} statement was paid out to your bank account.',
            ],
            [
                'key' => 'settlement.item_corrected',
                'group' => 'billing',
                'audience' => 'مزوّد الخدمة',
                'class' => 'mandatory',
                'in_app_type' => 'warning',
                'title_ar' => 'بند تصحيحي في كشفك التالي',
                'title_en' => 'A correcting line on your next statement',
                'body_ar' => 'صُحّح بند الفعالية #{event} — {direction} {amount} ريال في الكشف التالي. السبب: {reason}',
                'body_en' => 'The line for event #{event} was corrected — {direction} SAR {amount} on your next statement. Reason: {reason}',
            ],
            [
                'key' => 'invoice.paid',
                'group' => 'billing',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'سُجّل سداد فاتورتك',
                'title_en' => 'Your invoice payment was recorded',
                'body_ar' => 'سُجّل سداد الفاتورة {serial} عن دورة {period}.',
                'body_en' => 'Payment of invoice {serial} for the {period} cycle was recorded.',
            ],
            [
                'key' => 'billing.event_creation_blocked',
                'group' => 'billing',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'in_app_type' => 'error',
                'title_ar' => 'أُوقف إنشاء الفعاليات الجديدة',
                'title_en' => 'New event creation is suspended',
                // القاعدة الملزمة: لا عقاب للموظف بمتأخرات شركته — لا حجب دخول
                // ولا إلغاء لفعالية مؤكدة. النص يقولها صراحة حتى لا يُفهم غير ذلك.
                'body_ar' => 'تأخر سداد الفاتورة {serial} {days} يوماً عن الاستحقاق، فأُوقف إنشاء الفعاليات الجديدة. الفعاليات المؤكدة قائمة كما هي ودخول الموظفين لم يتأثر. يعود الإنشاء فور السداد.',
                'body_en' => 'Invoice {serial} is {days} days overdue, so creating new events is suspended. Confirmed events are unaffected and employee sign-in is untouched. Creation resumes as soon as it is paid.',
            ],
            [
                'key' => 'billing.event_creation_unblocked',
                'group' => 'billing',
                'audience' => 'مسؤول الحساب',
                'class' => 'mandatory',
                'in_app_type' => 'success',
                'title_ar' => 'عاد إنشاء الفعاليات',
                'title_en' => 'Event creation is restored',
                'body_ar' => 'سُدّدت المتأخرات ورُفع الحجب — يمكنكم إنشاء فعاليات جديدة الآن.',
                'body_en' => 'The arrears were paid and the block was lifted — you can create new events again.',
            ],
        ];
    }

    /**
     * الحضور والنتائج والمواسم (A12) — مفاتيح تركها A12 عمداً بلا نص لتُبنى
     * هنا. كلها **غير إلزامية** في جدول H §14.
     *
     * @return array<int, array<string, mixed>>
     */
    private function attendanceTemplates(): array
    {
        return [
            [
                'key' => 'attendance.window_opened',
                'group' => 'events',
                'audience' => 'قائد المجتمع',
                'class' => 'optional',
                'title_ar' => 'فُتحت نافذة تعديل الحضور',
                'title_en' => 'The attendance edit window is open',
                'body_ar' => 'اكتملت فعالية {community} وسُجِّل الحضور تلقائياً. تستطيع تعديله خلال {hours} ساعة.',
                'body_en' => 'The {community} event completed and attendance was recorded automatically. You can edit it for {hours} hours.',
            ],
            [
                'key' => 'attendance.window_closing',
                'group' => 'events',
                'audience' => 'قائد المجتمع',
                'class' => 'optional',
                'in_app_type' => 'warning',
                'title_ar' => 'تُقفل نافذة تعديل الحضور بعد ساعتين',
                'title_en' => 'The attendance window closes in 2 hours',
                'body_ar' => 'تبقّى ساعتان على إقفال تعديل حضور فعالية {community}. بعدها يحتاج التعديل تدخّل أدمن تيمات.',
                'body_en' => 'Two hours remain to edit attendance for the {community} event. After that it takes a Teamat admin.',
            ],
            [
                'key' => 'attendance.marked_absent',
                'group' => 'events',
                'audience' => 'المشارك',
                'class' => 'optional',
                'in_app_type' => 'warning',
                'title_ar' => 'سُجِّلت غائباً',
                'title_en' => 'You were marked absent',
                'body_ar' => 'سُجِّلت غائباً عن فعالية {community} يوم {date}. لا استرداد على عدم الحضور — راجع القائد إن كان ذلك خطأً.',
                'body_en' => 'You were marked absent from the {community} event on {date}. No-shows are not refunded — talk to your leader if this is wrong.',
            ],
            [
                'key' => 'season.closed',
                'group' => 'events',
                'audience' => 'أعضاء المجتمع',
                'class' => 'optional',
                'title_ar' => 'أُغلق الموسم',
                'title_en' => 'The season is closed',
                'body_ar' => 'أُغلق موسم {season} وأُرشفت لوحة الصدارة النهائية.',
                'body_en' => 'The {season} season is closed and the final leaderboard is archived.',
            ],
        ];
    }

    /**
     * تفاعل — خارج مصفوفة H §14 (مسارات قائمة في المنتج)؛ كلها اختيارية
     * وداخل المنصة فقط حتى لا تُزعج على واتساب.
     *
     * @return array<int, array<string, mixed>>
     */
    private function engagementTemplates(): array
    {
        return [
            [
                'key' => 'engagement.nudge.inactive_employee',
                'group' => 'engagement',
                'audience' => 'الموظف',
                'class' => 'optional',
                'in_app_type' => 'nudge_inactive',
                'channels' => ['in_app'],
                'title_ar' => 'وحشتنا! 👋',
                'title_en' => 'We missed you! 👋',
                'body_ar' => 'فريقك سوّى فعاليات وأنت غايب، ارجع العب معهم!',
                'body_en' => 'Your team has been playing without you — come back and join them!',
            ],
            [
                'key' => 'engagement.nudge.inactive_community',
                'group' => 'engagement',
                'audience' => 'قائد المجتمع',
                'class' => 'optional',
                'in_app_type' => 'nudge_community',
                'channels' => ['in_app'],
                'title_ar' => 'مجتمعك يحتاجك! 🏃',
                'title_en' => 'Your community needs you! 🏃',
                'body_ar' => 'مجتمع {community} ما لعب من أسبوعين، وش رايك تسوي فعالية؟',
                'body_en' => '{community} has not played in two weeks — how about creating an event?',
            ],
            [
                'key' => 'engagement.nudge.new_member',
                'group' => 'engagement',
                'audience' => 'الموظف',
                'class' => 'optional',
                'in_app_type' => 'nudge_new_member',
                'channels' => ['in_app'],
                'title_ar' => 'وقت أول مباراة! 🏸',
                'title_en' => 'Time for your first match! 🏸',
                'body_ar' => 'انضميت لـ {community} ولسّا ما لعبت، أول مباراة دايم أحلى!',
                'body_en' => 'You joined {community} but have not played yet — the first match is always the best!',
            ],
            [
                'key' => 'engagement.weekly_digest',
                'group' => 'engagement',
                'audience' => 'الموظف',
                'class' => 'optional',
                'in_app_type' => 'weekly_digest',
                'channels' => ['in_app'],
                'title_ar' => 'ملخصك الأسبوعي',
                'title_en' => 'Your weekly digest',
                'body_ar' => "📅 لديك {events} فعاليات قادمة هذا الأسبوع\n👥 انضم {members} أعضاء جدد لمجتمعاتك\n🏆 تم لعب {matches} مباريات في الدوريات\n🔥 سلسلتك: {streak} أسابيع متتالية",
                'body_en' => "📅 {events} upcoming events this week\n👥 {members} new members joined your communities\n🏆 {matches} league matches played\n🔥 Your streak: {streak} weeks",
            ],
            [
                'key' => 'engagement.quick_match',
                'group' => 'engagement',
                'audience' => 'أعضاء المجتمع',
                'class' => 'optional',
                'in_app_type' => 'quick_match',
                'channels' => ['in_app'],
                'title_ar' => 'تصويت جديد في {community}',
                'title_en' => 'New quick match in {community}',
                'body_ar' => '{message}',
                'body_en' => '{message}',
            ],
        ];
    }
}
