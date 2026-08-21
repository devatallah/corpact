<?php

use App\Http\Controllers\Admin\AdminAlertController;
use App\Http\Controllers\Admin\AdminController as AdminAdminController;
use App\Http\Controllers\Admin\AttendanceController as AdminAttendanceController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\BlackoutDateController as AdminBlackoutDateController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CommunityController as AdminCommunityController;
use App\Http\Controllers\Admin\CompanyContractController;
use App\Http\Controllers\Admin\CompanyController as AdminCompanyController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EmployeeController as AdminEmployeeController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\FinanceInvoiceController;
use App\Http\Controllers\Admin\FinanceSettlementController;
use App\Http\Controllers\Admin\FinanceTermsController;
use App\Http\Controllers\Admin\GhostEventMonitorController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\NotificationLogController;
use App\Http\Controllers\Admin\NotificationTemplateController;
use App\Http\Controllers\Admin\PartnerController as AdminPartnerController;
use App\Http\Controllers\Admin\PaymentFailureController as AdminPaymentFailureController;
use App\Http\Controllers\Admin\PermissionReviewController;
use App\Http\Controllers\Admin\PlatformSettingController;
use App\Http\Controllers\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Admin\ProviderOversightController as AdminProviderOversightController;
use App\Http\Controllers\Admin\RevenueController as AdminRevenueController;
use App\Http\Controllers\Admin\SecurityEventController;
use App\Http\Controllers\Admin\SupportConsoleController;
use App\Http\Controllers\Admin\TopupRequestController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\CompanyAuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\EmployeeAuthController;
use App\Http\Controllers\Auth\InvitationController;
use App\Http\Controllers\Auth\PartnerAuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Company\AuditLogController as CompanyAuditLogController;
use App\Http\Controllers\Company\CommunityController as CompanyCommunityController;
use App\Http\Controllers\Company\CommunityRequestController as CompanyCommunityRequestController;
use App\Http\Controllers\Company\DashboardController as CompanyDashboardController;
use App\Http\Controllers\Company\DepartmentController as CompanyDepartmentController;
use App\Http\Controllers\Company\EmployeeController as CompanyEmployeeController;
use App\Http\Controllers\Company\EmployeeImportController as CompanyEmployeeImportController;
use App\Http\Controllers\Company\EventController as CompanyEventController;
use App\Http\Controllers\Company\InvitationController as CompanyInvitationController;
use App\Http\Controllers\Company\InvoiceController as CompanyInvoiceController;
use App\Http\Controllers\Company\LeagueController as CompanyLeagueController;
use App\Http\Controllers\Company\NotificationController as CompanyNotificationController;
use App\Http\Controllers\Company\ProfileController as CompanyProfileController;
use App\Http\Controllers\Company\ReportController as CompanyReportController;
use App\Http\Controllers\Company\SettingController as CompanySettingController;
use App\Http\Controllers\Company\TemplateController as CompanyTemplateController;
use App\Http\Controllers\Company\WalletController as CompanyWalletController;
use App\Http\Controllers\Coordinator\MonthlyReportController as CoordinatorMonthlyReportController;
use App\Http\Controllers\Employee\AttendanceController as EmployeeAttendanceController;
use App\Http\Controllers\Employee\CommunityController as EmployeeCommunityController;
use App\Http\Controllers\Employee\CommunityExportController as EmployeeCommunityExportController;
use App\Http\Controllers\Employee\CommunityRequestController as EmployeeCommunityRequestController;
use App\Http\Controllers\Employee\EventCommentController;
use App\Http\Controllers\Employee\EventController as EmployeeEventController;
use App\Http\Controllers\Employee\ExploreController as EmployeeExploreController;
use App\Http\Controllers\Employee\HomeController as EmployeeHomeController;
use App\Http\Controllers\Employee\LeaderboardController as EmployeeLeaderboardController;
use App\Http\Controllers\Employee\LeagueController as EmployeeLeagueController;
use App\Http\Controllers\Employee\NotificationController as EmployeeNotificationController;
use App\Http\Controllers\Employee\NotificationPreferenceController as EmployeeNotificationPreferenceController;
use App\Http\Controllers\Employee\PaymentController as EmployeePaymentController;
use App\Http\Controllers\Employee\PreferredProviderController as EmployeePreferredProviderController;
use App\Http\Controllers\Employee\ProfileController as EmployeeProfileController;
use App\Http\Controllers\Employee\ProviderSuggestionController as EmployeeProviderSuggestionController;
use App\Http\Controllers\Employee\QuickMatchController as EmployeeQuickMatchController;
use App\Http\Controllers\Employee\ReportController as EmployeeReportController;
use App\Http\Controllers\Employee\ResultController as EmployeeResultController;
use App\Http\Controllers\Employee\TemplateController as EmployeeTemplateController;
use App\Http\Controllers\Partner\AvailabilityController as PartnerAvailabilityController;
use App\Http\Controllers\Partner\BankAccountController as PartnerBankAccountController;
use App\Http\Controllers\Partner\BranchController as PartnerBranchController;
use App\Http\Controllers\Partner\DashboardController as PartnerDashboardController;
use App\Http\Controllers\Partner\ProfileController as PartnerProfileController;
use App\Http\Controllers\Partner\ProviderRequestController as PartnerProviderRequestController;
use App\Http\Controllers\Partner\ReliabilityController as PartnerReliabilityController;
use App\Http\Controllers\Partner\ReportController as PartnerReportController;
use App\Http\Controllers\Partner\ScheduleController as PartnerScheduleController;
use App\Http\Controllers\Partner\SettlementController as PartnerSettlementController;
use App\Http\Controllers\Partner\StaffController as PartnerStaffController;
use App\Http\Controllers\Partner\VenueController as PartnerVenueController;
use App\Http\Controllers\Payments\TestGatewayController;
use App\Http\Controllers\Payments\WebhookController as PaymentWebhookController;
use App\Http\Controllers\SupportMessageController;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::view('/terms', 'legal.terms');
Route::view('/privacy', 'legal.privacy');
Route::view('/support', 'legal.support');
Route::post('/support', [SupportMessageController::class, 'store'])->middleware('throttle:5,1')->name('support.store');
Route::redirect('/pricing', '/packages');
Route::view('/packages', 'pages.packages');
Route::view('/about', 'pages.about');
Route::view('/blog', 'pages.blog');

Route::get('/', function () {
    return view('welcome');
});

Route::get('/companies', function () {
    return view('landing.companies');
});

Route::get('/employees', function () {
    return view('landing.employees');
});

// A10 — H §12.6: نقطة ويبهوكات بوابة الدفع — بلا جلسة، CSRF مستثنى في
// bootstrap/app.php؛ التوقيع والتفرّد في WebhookProcessor.
Route::post('/webhooks/payments/{gateway}', [PaymentWebhookController::class, 'handle'])
    ->name('webhooks.payments');

// المشغّل التجريبي LocalTestGateway — صفحة checkout وهمية (نجاح/فشل/تأخير)
// خارج الإنتاج فقط؛ تبني ويبهوكات موقَّعة تمر بنفس مسار البوابة الحقيقية.
Route::get('/test-gateway/checkout/{reference}', [TestGatewayController::class, 'checkout'])
    ->name('test-gateway.checkout');
Route::post('/test-gateway/checkout/{reference}', [TestGatewayController::class, 'complete'])
    ->name('test-gateway.complete');

// Legacy URLs from before the business -> partner rename
Route::redirect('/businesses', '/partners');
Route::redirect('/business/login', '/partner/login');
Route::redirect('/business/register', '/partner/register');
Route::redirect('/business', '/partner');

Route::get('/partners', function () {
    return view('landing.partners', [
        'categories' => Category::whereNull('parent_id')
            ->with('children:id,parent_id,name')
            ->select('id', 'parent_id', 'name')
            ->orderBy('name')
            ->get(),
    ]);
});

/*
|--------------------------------------------------------------------------
| Invitation Acceptance (public, no auth required)
|--------------------------------------------------------------------------
*/
// The link names the invitation; it does not authenticate the holder. The
// acceptor proves control of the phone by OTP before an account or a session
// exists (see InvitationController), so both POSTs sit behind the OTP limiter.
Route::get('/invite/{token}', [InvitationController::class, 'show'])->name('invitation.show');
Route::post('/invite/{token}', [InvitationController::class, 'accept'])->middleware('throttle:otp')->name('invitation.accept');
Route::post('/invite/{token}/verify', [InvitationController::class, 'verify'])->middleware('throttle:otp')->name('invitation.verify');

/*
|--------------------------------------------------------------------------
| Admin Auth
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return auth('admin')->check()
            ? redirect()->route('admin.dash')
            : redirect()->route('admin.login');
    });
    Route::middleware('guest:admin')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:login');
        // Second factor (mandatory): OTP challenge after email + password.
        Route::get('/otp', [AdminAuthController::class, 'showOtpChallenge'])->name('otp');
        Route::post('/otp/verify', [AdminAuthController::class, 'verifyOtp'])->middleware('throttle:otp')->name('otp.verify');
        Route::post('/otp/resend', [AdminAuthController::class, 'resendOtp'])->middleware('throttle:otp')->name('otp.resend');
        Route::get('/forgot-password', fn () => app(PasswordResetController::class)->showForgotForm('admin'))->name('password.request');
        Route::post('/forgot-password', fn (Request $r) => app(PasswordResetController::class)->sendResetLink($r, 'admin'))->name('password.email')->middleware('throttle:password-reset');
        Route::get('/reset-password/{token}', fn (Request $r, string $token) => app(PasswordResetController::class)->showResetForm($r, 'admin', $token))->name('password.reset');
        Route::post('/reset-password', fn (Request $r) => app(PasswordResetController::class)->reset($r, 'admin'))->name('password.update');
    });
    Route::post('/logout', [AdminAuthController::class, 'logout'])->middleware('auth:admin')->name('logout');

    Route::middleware('auth:admin')->group(function () {
        Route::get('/email/verify', fn (Request $r) => app(EmailVerificationController::class)->notice($r, 'admin'))->name('verification.notice');
        Route::get('/email/verify/{id}/{hash}', fn (Request $r, int $id, string $hash) => app(EmailVerificationController::class)->verify($r, 'admin', $id, $hash))->middleware('signed')->name('verification.verify');
        Route::post('/email/verification-notification', fn (Request $r) => app(EmailVerificationController::class)->resend($r, 'admin'))->middleware('throttle:6,1')->name('verification.send');
    });
});

/*
|--------------------------------------------------------------------------
| Employee Auth
|--------------------------------------------------------------------------
*/
Route::prefix('employee')->name('employee.')->group(function () {
    Route::get('/', function () {
        return auth('employee')->check()
            ? redirect()->route('employee.home')
            : redirect()->route('employee.login');
    });
    Route::middleware('guest:employee')->group(function () {
        // Phone + OTP login (H §4) — no passwords on this portal.
        Route::get('/login', [EmployeeAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/otp/request', [EmployeeAuthController::class, 'requestOtp'])->middleware('throttle:otp')->name('otp.request');
        Route::post('/otp/verify', [EmployeeAuthController::class, 'verifyOtp'])->middleware('throttle:otp')->name('otp.verify');
        Route::post('/login/context', [EmployeeAuthController::class, 'chooseContext'])->name('login.context');
        Route::get('/register', fn () => redirect('/employees#register'));
        Route::post('/register', [EmployeeAuthController::class, 'register'])->middleware('throttle:login');
    });
    Route::post('/logout', [EmployeeAuthController::class, 'logout'])->middleware('auth:employee')->name('logout');
    Route::post('/context/switch', [EmployeeAuthController::class, 'switchContext'])->middleware('auth:employee')->name('context.switch');

    // Verify route accessible without auth (clicked from email)
    Route::get('/email/verify/{id}/{hash}', fn (Request $r, int $id, string $hash) => app(EmailVerificationController::class)->verify($r, 'employee', $id, $hash))->middleware('signed')->name('verification.verify');

    Route::middleware('auth:employee')->group(function () {
        Route::get('/email/verify', fn (Request $r) => app(EmailVerificationController::class)->notice($r, 'employee'))->name('verification.notice');
        Route::post('/email/verification-notification', fn (Request $r) => app(EmailVerificationController::class)->resend($r, 'employee'))->middleware('throttle:6,1')->name('verification.send');
    });
});

/*
|--------------------------------------------------------------------------
| partner Auth
|--------------------------------------------------------------------------
*/
Route::prefix('partner')->name('partner.')->group(function () {
    Route::get('/', function () {
        return auth('partner')->check()
            ? redirect()->route('partner.dash')
            : redirect()->route('partner.login');
    });
    Route::middleware('guest:partner')->group(function () {
        // Phone + OTP login (H §4) — provider is invited by Teamat admin.
        Route::get('/login', [PartnerAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/otp/request', [PartnerAuthController::class, 'requestOtp'])->middleware('throttle:otp')->name('otp.request');
        Route::post('/otp/verify', [PartnerAuthController::class, 'verifyOtp'])->middleware('throttle:otp')->name('otp.verify');
        Route::post('/login/context', [PartnerAuthController::class, 'chooseContext'])->name('login.context');
        Route::get('/register', fn () => redirect('/partners#register'));
        // Throttled: the `unique:…,email` rules make this endpoint an account
        // enumeration oracle, so it may not be replayed at machine speed.
        Route::post('/register', [PartnerAuthController::class, 'register'])->middleware('throttle:login');
        Route::get('/activate/{token}', [PartnerAuthController::class, 'showActivateForm'])->name('activate');
        Route::post('/activate/{token}', [PartnerAuthController::class, 'activate']);
    });
    Route::post('/logout', [PartnerAuthController::class, 'logout'])->middleware('auth:partner')->name('logout');

    Route::middleware('auth:partner')->group(function () {
        Route::get('/email/verify', fn (Request $r) => app(EmailVerificationController::class)->notice($r, 'partner'))->name('verification.notice');
        Route::get('/email/verify/{id}/{hash}', fn (Request $r, int $id, string $hash) => app(EmailVerificationController::class)->verify($r, 'partner', $id, $hash))->middleware('signed')->name('verification.verify');
        Route::post('/email/verification-notification', fn (Request $r) => app(EmailVerificationController::class)->resend($r, 'partner'))->middleware('throttle:6,1')->name('verification.send');
    });
});

/*
|--------------------------------------------------------------------------
| Company Auth
|--------------------------------------------------------------------------
*/
Route::prefix('company')->name('company.')->group(function () {
    Route::get('/', function () {
        return auth('company')->check()
            ? redirect()->route('company.dash')
            : redirect()->route('company.login');
    });
    Route::middleware('guest:company')->group(function () {
        // Phone + OTP login for the account manager (H §4) — no passwords.
        Route::get('/login', [CompanyAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/otp/request', [CompanyAuthController::class, 'requestOtp'])->middleware('throttle:otp')->name('otp.request');
        Route::post('/otp/verify', [CompanyAuthController::class, 'verifyOtp'])->middleware('throttle:otp')->name('otp.verify');
        Route::post('/login/context', [CompanyAuthController::class, 'chooseContext'])->name('login.context');
        Route::get('/register', fn () => redirect('/companies#register'));
        // Throttled for the same reason as the provider registration above.
        Route::post('/register', [CompanyAuthController::class, 'register'])->middleware('throttle:login');
        Route::get('/activate/{token}', [CompanyAuthController::class, 'showActivateForm'])->name('activate');
        Route::post('/activate/{token}', [CompanyAuthController::class, 'activate']);
    });
    Route::post('/logout', [CompanyAuthController::class, 'logout'])->middleware('auth:company')->name('logout');
    Route::post('/context/switch', [CompanyAuthController::class, 'switchContext'])->middleware('auth:company')->name('context.switch');

    Route::middleware('auth:company')->group(function () {
        Route::get('/email/verify', fn (Request $r) => app(EmailVerificationController::class)->notice($r, 'company'))->name('verification.notice');
        Route::get('/email/verify/{id}/{hash}', fn (Request $r, int $id, string $hash) => app(EmailVerificationController::class)->verify($r, 'company', $id, $hash))->middleware('signed')->name('verification.verify');
        Route::post('/email/verification-notification', fn (Request $r) => app(EmailVerificationController::class)->resend($r, 'company'))->middleware('throttle:6,1')->name('verification.send');
    });
});

/*
|--------------------------------------------------------------------------
| Admin Portal
|--------------------------------------------------------------------------
*/
Route::prefix('admin')
    ->name('admin.')
    ->middleware('auth:admin')
    ->group(function () {
        Route::get('/dash', [AdminDashboardController::class, 'index'])->name('dash');

        // Platform operations — (permission + platform scope), never bare role.
        Route::middleware('permission:platform.manage')->group(function () {
            Route::resource('companies', AdminCompanyController::class)->except(['show']);
            Route::post('/companies/{company}/approve', [AdminCompanyController::class, 'approve'])->name('companies.approve');
            Route::post('/companies/{company}/reject', [AdminCompanyController::class, 'reject'])->name('companies.reject');
            Route::post('/companies/{company}/reset-password', [AdminCompanyController::class, 'sendResetPassword'])->name('companies.reset-password');

            Route::resource('partners', AdminPartnerController::class)->except(['show']);
            Route::post('/partners/{partner}/approve', [AdminPartnerController::class, 'approve'])->name('partners.approve');
            Route::post('/partners/{partner}/reject', [AdminPartnerController::class, 'reject'])->name('partners.reject');
            Route::post('/partners/{partner}/reset-password', [AdminPartnerController::class, 'sendResetPassword'])->name('partners.reset-password');

            // A9 — إشراف المزوّدين (H §17): اعتماد الحساب البنكي (شرط الصرف)،
            // تعديل الموثوقية الموثَّق، واعتماد أسعار عقود السعر.
            Route::get('/providers/oversight', [AdminProviderOversightController::class, 'index'])->name('providers.oversight');
            Route::post('/providers/{partner}/bank/approve', [AdminProviderOversightController::class, 'approveBank'])->name('providers.bank.approve');
            Route::post('/providers/{partner}/reliability', [AdminProviderOversightController::class, 'adjustReliability'])->name('providers.reliability.adjust');
            Route::post('/providers/price-changes/{priceChange}', [AdminProviderOversightController::class, 'decidePriceChange'])->name('providers.price-changes.decide');

            Route::resource('employees', AdminEmployeeController::class)->except(['show']);
            Route::post('/employees/{employee}/reset-password', [AdminEmployeeController::class, 'sendResetPassword'])->name('employees.reset-password');

            Route::get('communities', [AdminCommunityController::class, 'index'])->name('communities.index');

            Route::resource('categories', AdminCategoryController::class)->except(['show', 'create', 'edit']);
            Route::post('/categories/{category}/restore', [AdminCategoryController::class, 'restore'])->name('categories.restore');

            Route::resource('events', AdminEventController::class)->except(['create', 'store', 'edit', 'update']);
            Route::post('/events/{event}/cancel', [AdminEventController::class, 'cancel'])->name('events.cancel');

            // A8 — أيام الحظر (H §8): إجازات/رمضان — تخطٍ أو إزاحة أسبوع
            // حسب إعداد القالب. CRUD أدنى — يوسّعه A15.
            Route::get('/blackouts', [AdminBlackoutDateController::class, 'index'])->name('blackouts.index');
            Route::post('/blackouts', [AdminBlackoutDateController::class, 'store'])->name('blackouts.store');
            Route::put('/blackouts/{blackout}', [AdminBlackoutDateController::class, 'update'])->name('blackouts.update');
            Route::delete('/blackouts/{blackout}', [AdminBlackoutDateController::class, 'destroy'])->name('blackouts.destroy');
            // A7 — H §9 القاعدة 2: تغيير يدوي للحالة — أدمن تيمات وحده بسبب مكتوب
            Route::post('/events/{event}/force-status', [AdminEventController::class, 'forceStatus'])->name('events.force-status');
            // A12 — H §13: تعديل الحضور بعد إقفال نافذة الـ24 ساعة — أدمن
            // تيمات وحده بسبب موثَّق («استثناء لا إجراء روتيني»).
            Route::post('/events/{event}/attendance/{employee}', [AdminAttendanceController::class, 'update'])->name('events.attendance.update');

            Route::get('/notifs', [AdminNotificationController::class, 'index'])->name('notifs.index');
            Route::post('/notifs', [AdminNotificationController::class, 'store'])->name('notifs.store');

            Route::post('/notifs/{notification}/read', [AdminNotificationController::class, 'markAsRead'])->name('notifs.read');
            Route::delete('/notifs/{notification}', [AdminNotificationController::class, 'destroy'])->name('notifs.destroy');

            // A14 — H §14: «القوالب يديرها أدمن تيمات فقط». لا إنشاء ولا حذف
            // لمفاتيح القوالب من الواجهة: المفتاح عقد مع الكود.
            Route::get('/notification-templates', [NotificationTemplateController::class, 'index'])->name('notification-templates.index');
            Route::put('/notification-templates/{notificationTemplate}', [NotificationTemplateController::class, 'update'])->name('notification-templates.update');
            Route::post('/notification-templates/{notificationTemplate}/preview', [NotificationTemplateController::class, 'preview'])->name('notification-templates.preview');

            // A13 — H §13 ⟶ §15: المراقبة الأسبوعية لمؤشر «الفعالية الشبح» —
            // ارتفاع معدل التعديل بعد الاكتمال أو التدخل اليدوي عطلٌ تشغيلي.
            Route::get('/monitoring/ghost-events', [GhostEventMonitorController::class, 'index'])
                ->name('monitoring.ghost-events');

            // A14 — H §20: صندوق التنبيهات الحرجة (يُقَر ولا يُحذف).
            Route::get('/alerts', [AdminAlertController::class, 'index'])->name('alerts.index');
            Route::post('/alerts/{adminAlert}/acknowledge', [AdminAlertController::class, 'acknowledge'])->name('alerts.acknowledge');

            // A15 — H §16 «الشركات والعقود»: قيم العقد والرقم الضريبي (الأعمدة
            // جاهزة منذ A4/A11 بلا واجهة إدخال).
            Route::put('/companies/{company}/contract', [CompanyContractController::class, 'update'])->name('companies.contract.update');
            Route::put('/partners/{partner}/tax', [CompanyContractController::class, 'updateProvider'])->name('partners.tax.update');

            // A15 — H §16 «الإعدادات: العتبات والمهل» (مهل A7 كانت config فقط).
            Route::get('/settings/platform', [PlatformSettingController::class, 'index'])->name('settings.platform.index');
            Route::put('/settings/platform', [PlatformSettingController::class, 'update'])->name('settings.platform.update');
        });

        // ── A15 — الدعم وسجل التدقيق (H §16, §19) ─────────────────────────
        // كل مسار بصلاحيته المسماة: أدمن تيمات يحملها كلها، ووكيل الدعم يحمل
        // القراءة والتدخل المحدود وحدها (G — «دليل وكيل الدعم»).

        Route::get('/audit', [AuditLogController::class, 'index'])
            ->middleware('permission:audit.view')
            ->name('audit.index');

        Route::get('/security/events', [SecurityEventController::class, 'index'])
            ->middleware('permission:security.events.view')
            ->name('security.events.index');

        Route::middleware('permission:admins.manage')->group(function () {
            Route::get('/security/permission-review', [PermissionReviewController::class, 'index'])->name('security.permission-review.index');
            Route::post('/security/permission-review', [PermissionReviewController::class, 'store'])->name('security.permission-review.store');
        });

        // رسائل الدعم — صلاحية مسماة كي يصلها وكيل الدعم («توثيق البلاغ»).
        Route::middleware('permission:support.messages.manage')->group(function () {
            Route::get('/support', [App\Http\Controllers\Admin\SupportMessageController::class, 'index'])->name('support.index');
            Route::patch('/support/{supportMessage}', [App\Http\Controllers\Admin\SupportMessageController::class, 'update'])->name('support.update');
            Route::delete('/support/{supportMessage}', [App\Http\Controllers\Admin\SupportMessageController::class, 'destroy'])->name('support.destroy');
        });

        Route::get('/support-console', [SupportConsoleController::class, 'index'])
            ->middleware('permission:support.search')
            ->name('support-console.index');
        Route::get('/support-console/events/{event}', [SupportConsoleController::class, 'event'])
            ->middleware('permission:event.history.view')
            ->name('support-console.event');
        Route::post('/support-console/invitations/{invitation}/resend', [SupportConsoleController::class, 'resendInvitation'])
            ->middleware('permission:support.resend')
            ->name('support-console.invitations.resend');
        Route::post('/support-console/otp/resend', [SupportConsoleController::class, 'resendOtp'])
            ->middleware(['permission:support.resend', 'throttle:otp'])
            ->name('support-console.otp.resend');

        // A14 — سجل الإشعارات: قراءة فقط، وأول ما يفحصه الدعم في شكوى «ما
        // وصلني شيء» (G — دليل وكيل الدعم). صلاحية مستقلة كي يمنحها A15 لدور
        // وكيل الدعم بلا منحه بقية صلاحيات إدارة المنصة.
        Route::get('/notification-logs', [NotificationLogController::class, 'index'])
            ->middleware('permission:notifications.logs.view')
            ->name('notification-logs.index');

        // Revenue — platform admin + finance admin
        Route::get('/revenue', [AdminRevenueController::class, 'index'])->middleware('permission:revenue.view')->name('revenue.index');

        // A10 — H §12.4: قائمة فشل المدفوعات والاستردادات — الأدمن المالي.
        Route::get('/payments/failures', [AdminPaymentFailureController::class, 'index'])
            ->middleware('permission:payments.failures.view')
            ->name('payments.failures.index');
        Route::post('/payments/refunds/{intent}/retry', [AdminPaymentFailureController::class, 'retryRefund'])
            ->middleware('permission:payments.refund.retry')
            ->name('payments.refunds.retry');

        // الاعتمادات المالية — الأدمن المالي وحده (H §3: فصل التشغيل عن
        // الاعتماد المالي). منع الاعتماد الذاتي مطبَّق في الخدمة.
        Route::middleware('permission:wallet.topup.approve')->group(function () {
            Route::get('/finance/topups', [TopupRequestController::class, 'index'])->name('finance.topups.index');
            Route::post('/finance/topups/{topup}/start-review', [TopupRequestController::class, 'startReview'])->name('finance.topups.start-review');
            Route::post('/finance/topups/{topup}/approve', [TopupRequestController::class, 'approve'])->name('finance.topups.approve');
            Route::post('/finance/topups/{topup}/reject', [TopupRequestController::class, 'reject'])->name('finance.topups.reject');
            Route::post('/finance/topups/{topup}/unapprove', [TopupRequestController::class, 'unapprove'])
                ->middleware('permission:wallet.topup.unapprove')
                ->name('finance.topups.unapprove');
            // A15 — H §19: رابط الإشعار البنكي يُصدر عند الطلب من مسار مدقَّق
            // (صالح 15 دقيقة)، ولمسه يُسجَّل تدقيقاً وحدثاً أمنياً.
            Route::get('/finance/topups/{topup}/receipt', [TopupRequestController::class, 'receipt'])->name('finance.topups.receipt');
        });

        // A11 — التسويات (H §12.7): التوليد والمراجعة والاعتماد وتسجيل الصرف.
        // الاعتماد الذاتي وحجب الصرف قبل اعتماد البنك مفروضان في الخدمة.
        Route::middleware('permission:settlement.approve')->group(function () {
            Route::get('/finance/settlements', [FinanceSettlementController::class, 'index'])->name('finance.settlements.index');
            Route::post('/finance/settlements/generate', [FinanceSettlementController::class, 'generate'])->name('finance.settlements.generate');
            Route::get('/finance/settlements/{statement}', [FinanceSettlementController::class, 'show'])->name('finance.settlements.show');
            Route::post('/finance/settlements/{statement}/approve', [FinanceSettlementController::class, 'approve'])->name('finance.settlements.approve');
            Route::post('/finance/settlements/{statement}/pay', [FinanceSettlementController::class, 'markPaid'])->name('finance.settlements.pay');
            Route::post('/finance/settlement-items/{item}/correct', [FinanceSettlementController::class, 'correct'])->name('finance.settlement-items.correct');
            Route::post('/finance/commission-rates', [FinanceTermsController::class, 'storeCommissionRate'])->name('finance.commission-rates.store');
        });

        // A11 — الفوترة الشهرية (H §12.8/§12.9) + سلّم التأخر + شروط العقد المستقبلية.
        Route::middleware('permission:invoice.approve')->group(function () {
            Route::get('/finance/invoices', [FinanceInvoiceController::class, 'index'])->name('finance.invoices.index');
            Route::post('/finance/invoices/generate', [FinanceInvoiceController::class, 'generate'])->name('finance.invoices.generate');
            Route::post('/finance/invoices/arrears', [FinanceInvoiceController::class, 'runArrears'])->name('finance.invoices.arrears');
            Route::get('/finance/invoices/{invoice}', [FinanceInvoiceController::class, 'show'])->name('finance.invoices.show');
            Route::post('/finance/invoices/{invoice}/pay', [FinanceInvoiceController::class, 'markPaid'])->name('finance.invoices.pay');
            Route::get('/finance/terms', [FinanceTermsController::class, 'index'])->name('finance.terms.index');
            Route::post('/finance/contract-terms', [FinanceTermsController::class, 'storeContractTerms'])->name('finance.contract-terms.store');
        });

        // Admin management
        Route::middleware('permission:admins.manage')->group(function () {
            Route::get('/admins', [AdminAdminController::class, 'index'])->name('admins.index');
            Route::post('/admins', [AdminAdminController::class, 'store'])->name('admins.store');
            Route::put('/admins/{admin}', [AdminAdminController::class, 'update'])->name('admins.update');
            Route::post('/admins/{admin}/reset-password', [AdminAdminController::class, 'sendResetPassword'])->name('admins.reset-password');
            Route::delete('/admins/{admin}', [AdminAdminController::class, 'destroy'])->name('admins.destroy');
        });

        Route::get('/profile', [AdminProfileController::class, 'index'])->name('profile.index');
        Route::put('/profile', [AdminProfileController::class, 'update'])->name('profile.update');
    });

/*
|--------------------------------------------------------------------------
| Coordinator (المنسّق المُدار — H §18)
|--------------------------------------------------------------------------
|
| المنسّق موظف لدى تيمات فهويته `users` وحارسه `admin`؛ نطاقه الشركات المسندة
| إليه عبر role_assignments (coordinator + scope=company)، وخارجها 404 لا 403.
| مجموعة مستقلة عن `/admin` كي لا يُمنح صلاحيات إدارة المنصة (A15 يملك شاشات
| الأدمن وتقسيم أدواره).
*/
Route::prefix('coordinator')
    ->name('coordinator.')
    ->middleware('auth:admin')
    ->group(function () {
        Route::get('/reports', [CoordinatorMonthlyReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/{report}', [CoordinatorMonthlyReportController::class, 'show'])->name('reports.show');
        Route::post('/reports/{report}/recommendations', [CoordinatorMonthlyReportController::class, 'storeRecommendations'])
            ->name('reports.recommendations.store');
        Route::get('/reports/{report}/export/{exportKey}', [CoordinatorMonthlyReportController::class, 'export'])
            ->name('reports.export');
    });

/*
|--------------------------------------------------------------------------
| partner Portal
|--------------------------------------------------------------------------
*/
Route::prefix('partner')
    ->name('partner.')
    ->middleware('auth:partner')
    ->group(function () {
        Route::get('/dash', [PartnerDashboardController::class, 'index'])->name('dash');

        // A9 — قناة قرار المزوّد (H §11): القائمة، صفحة القرار، الرابط
        // الموقّع أحادي الاستخدام، والقرارات (اللوحة هي القناة الوحيدة).
        Route::get('/requests-queue', [PartnerProviderRequestController::class, 'queue'])->middleware('partner.permission:bookings.view')->name('provider-requests.queue');
        Route::get('/requests-queue/link/{token}', [PartnerProviderRequestController::class, 'openLink'])->middleware('signed')->name('requests.link');
        Route::get('/requests-queue/{providerRequest}', [PartnerProviderRequestController::class, 'decision'])->middleware('partner.permission:bookings.view')->name('provider-requests.decision');
        Route::post('/requests-queue/{providerRequest}/accept', [PartnerProviderRequestController::class, 'accept'])->middleware('partner.permission:bookings.approve')->name('provider-requests.accept');
        Route::post('/requests-queue/{providerRequest}/reject', [PartnerProviderRequestController::class, 'reject'])->middleware('partner.permission:bookings.reject')->name('provider-requests.reject');
        Route::post('/requests-queue/{providerRequest}/propose-alternative', [PartnerProviderRequestController::class, 'proposeAlternative'])->middleware('partner.permission:bookings.propose-alternative')->name('provider-requests.propose-alternative');
        Route::post('/requests-queue/{providerRequest}/cancel', [PartnerProviderRequestController::class, 'cancel'])->middleware('partner.permission:bookings.cancel')->name('provider-requests.cancel');

        // A9 — الفروع ووحدات النشاط (H §17)
        Route::middleware('partner.permission:branches.view')->group(function () {
            Route::get('/branches', [PartnerBranchController::class, 'index'])->name('branches.index');
            Route::middleware('partner.permission:branches.manage')->group(function () {
                Route::post('/branches', [PartnerBranchController::class, 'store'])->name('branches.store');
                Route::put('/branches/{branch}', [PartnerBranchController::class, 'update'])->name('branches.update');
                Route::delete('/branches/{branch}', [PartnerBranchController::class, 'destroy'])->name('branches.destroy');
                Route::post('/branches/{branch}/units', [PartnerBranchController::class, 'storeUnit'])->name('branches.units.store');
                Route::put('/units/{unit}', [PartnerBranchController::class, 'updateUnit'])->name('units.update');
                Route::delete('/units/{unit}', [PartnerBranchController::class, 'destroyUnit'])->name('units.destroy');
            });
        });

        // A9 — تقويم التوفر والحجوزات الخارجية «حجز خارجي» (H §11)
        Route::get('/availability', [PartnerAvailabilityController::class, 'index'])->middleware('partner.permission:availability.view')->name('availability.index');
        Route::middleware('partner.permission:availability.manage')->group(function () {
            Route::post('/availability/external', [PartnerAvailabilityController::class, 'storeExternal'])->name('availability.external.store');
            Route::delete('/availability/external/{slot}', [PartnerAvailabilityController::class, 'destroyExternal'])->name('availability.external.destroy');
        });

        // A9 — بطاقة السلوكيات (لا رقم للمؤشر في الإصدار الأول — H §11)
        Route::get('/reliability', [PartnerReliabilityController::class, 'index'])->middleware('partner.permission:reliability.view')->name('reliability.index');

        // A9 — الحساب البنكي (اعتماد يدوي شرط الصرف — H §11)
        Route::get('/bank', [PartnerBankAccountController::class, 'edit'])->middleware('partner.permission:bank.view')->name('bank.edit');
        Route::put('/bank', [PartnerBankAccountController::class, 'update'])->middleware('partner.permission:bank.manage')->name('bank.update');

        Route::get('/schedule', [PartnerScheduleController::class, 'index'])->name('schedule.index');
        Route::middleware('partner.permission:schedule.manage')->group(function () {
            Route::post('/schedule', [PartnerScheduleController::class, 'store'])->name('schedule.store');
            Route::put('/schedule/{slot}', [PartnerScheduleController::class, 'update'])->name('schedule.update');
            Route::delete('/schedule/{slot}', [PartnerScheduleController::class, 'destroy'])->name('schedule.destroy');
        });

        Route::middleware('partner.permission:venues.view')->group(function () {
            Route::resource('venues', PartnerVenueController::class)->except(['show']);
            Route::post('/venues/{venue}/pricings', [PartnerVenueController::class, 'storePricing'])->name('venues.pricings.store');
            Route::put('/venues/{venue}/pricings/{pricing}', [PartnerVenueController::class, 'updatePricing'])->name('venues.pricings.update');
            Route::post('/venues/{venue}/pricings/{pricing}/toggle', [PartnerVenueController::class, 'togglePricing'])->name('venues.pricings.toggle');
            Route::delete('/venues/{venue}/pricings/{pricing}', [PartnerVenueController::class, 'destroyPricing'])->name('venues.pricings.destroy');
        });

        // A10 — H §12.1: «لا تخفيضات ولا رموز ترويجية» — ميزة التخفيضات
        // أُزيلت بالكامل (routes/controller/service/UI) وجدولها مؤرشف
        // legacy_discounts للقراءة فقط.

        // Settlements — accessible by both owner and accountant
        Route::middleware('partner.permission:settlements.view')->group(function () {
            Route::get('/settlements', [PartnerSettlementController::class, 'index'])->name('settlements.index');
            Route::get('/settlements/{settlement}', [PartnerSettlementController::class, 'show'])->name('settlements.show');
        });

        Route::get('/reports', [PartnerReportController::class, 'index'])->middleware('partner.permission:reports.view')->name('reports.index');

        Route::get('/profile', [PartnerProfileController::class, 'index'])->name('profile.index');
        Route::put('/profile', [PartnerProfileController::class, 'update'])->middleware('partner.permission:profile.update')->name('profile.update');

        Route::middleware('partner.permission:staff.view')->group(function () {
            Route::get('/staff', [PartnerStaffController::class, 'index'])->name('staff.index');
            Route::post('/staff', [PartnerStaffController::class, 'store'])->middleware('partner.permission:staff.create')->name('staff.store');
            Route::put('/staff/{staff}', [PartnerStaffController::class, 'update'])->middleware('partner.permission:staff.update')->name('staff.update');
            Route::delete('/staff/{staff}', [PartnerStaffController::class, 'destroy'])->middleware('partner.permission:staff.delete')->name('staff.destroy');
        });
    });

/*
|--------------------------------------------------------------------------
| Company Portal (was HR)
|--------------------------------------------------------------------------
*/
Route::prefix('company')
    ->name('company.')
    ->middleware(['auth:company', 'company.context'])
    ->group(function () {
        Route::get('/dash', [CompanyDashboardController::class, 'index'])->name('dash');

        Route::resource('departments', CompanyDepartmentController::class)->only(['index', 'store', 'update', 'destroy']);

        // A4 — employee file onboarding (before the resource so "import"
        // never collides with an {employee} parameter).
        Route::get('/employees/import', [CompanyEmployeeImportController::class, 'index'])->name('employees.import.index');
        Route::post('/employees/import', [CompanyEmployeeImportController::class, 'store'])->name('employees.import.store');
        Route::get('/employees/import/{import}/errors', [CompanyEmployeeImportController::class, 'errors'])->name('employees.import.errors');
        Route::post('/employees/import/{import}/invites', [CompanyEmployeeImportController::class, 'sendInvites'])->name('employees.import.invites');
        Route::post('/invitations/{invitation}/resend', [CompanyInvitationController::class, 'resend'])->name('invitations.resend');

        // A4 — company settings (H §5).
        Route::get('/settings', [CompanySettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [CompanySettingController::class, 'update'])->name('settings.update');

        Route::resource('employees', CompanyEmployeeController::class)->except(['show']);

        Route::resource('events', CompanyEventController::class)->except(['create', 'store', 'edit', 'update']);
        Route::post('/events/{event}/cancel', [CompanyEventController::class, 'cancel'])->name('events.cancel');
        Route::post('/events/{event}/add-member', [CompanyEventController::class, 'addMember'])->name('events.add-member');
        Route::post('/events/{event}/remove-member', [CompanyEventController::class, 'removeMember'])->name('events.remove-member');

        Route::resource('communities', CompanyCommunityController::class)->except(['show']);

        // A8 — قوالب التكرار من بوابة الشركة (مسؤول الحساب — H §8)
        Route::get('/communities/{community}/templates', [CompanyTemplateController::class, 'index'])->name('communities.templates.index');
        Route::post('/communities/{community}/templates', [CompanyTemplateController::class, 'store'])->name('communities.templates.store');
        Route::patch('/communities/{community}/templates/{template}', [CompanyTemplateController::class, 'update'])->name('communities.templates.update');
        Route::post('/communities/{community}/templates/{template}/pause', [CompanyTemplateController::class, 'pause'])->name('communities.templates.pause');
        Route::post('/communities/{community}/templates/{template}/resume', [CompanyTemplateController::class, 'resume'])->name('communities.templates.resume');

        // A5 — القيادة المتعددة عبر role_assignments والعضوية كحالات (H §6)
        Route::post('/communities/{community}/leaders', [CompanyCommunityController::class, 'assignLeader'])->name('communities.leaders.assign');
        Route::delete('/communities/{community}/leaders/{employee}', [CompanyCommunityController::class, 'removeLeader'])->name('communities.leaders.remove');
        Route::post('/communities/{community}/leaders/{employee}/primary', [CompanyCommunityController::class, 'setPrimaryLeader'])->name('communities.leaders.primary');
        Route::post('/communities/{community}/members/{employee}/remove', [CompanyCommunityController::class, 'removeMember'])->name('communities.members.remove');
        Route::post('/communities/{community}/members/{employee}/ban', [CompanyCommunityController::class, 'banMember'])->name('communities.members.ban');

        Route::get('/community-requests', [CompanyCommunityRequestController::class, 'index'])->name('community-requests.index');
        Route::post('/community-requests/{communityRequest}/approve', [CompanyCommunityRequestController::class, 'approve'])->name('community-requests.approve');
        Route::post('/community-requests/{communityRequest}/reject', [CompanyCommunityRequestController::class, 'reject'])->name('community-requests.reject');

        Route::get('/employees/search', [CompanyEmployeeController::class, 'search'])->name('employees.search');

        Route::get('/wallet', [CompanyWalletController::class, 'index'])->name('wallet.index');
        // الشحن الذاتي الفوري أُزيل (H §12.5) — بدله طلب تحويل بنكي يعتمده
        // الأدمن المالي في تيمات.
        Route::post('/wallet/topup', [CompanyWalletController::class, 'submitTopup'])->name('wallet.topup');
        Route::post('/wallet/distribute', [CompanyWalletController::class, 'distribute'])->name('wallet.distribute');

        // A15 — H §18 (مسؤول الحساب): «المالية: … الفواتير». عرض فقط —
        // تسجيل السداد صلاحية الأدمن المالي (H §12.8).
        Route::get('/invoices', [CompanyInvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/{invoice}', [CompanyInvoiceController::class, 'show'])->name('invoices.show');

        // A15 — H §19: «يرى مسؤول الحساب ملخصاً محدوداً لشركته فقط».
        Route::get('/audit', [CompanyAuditLogController::class, 'index'])->name('audit.index');

        // A13 — H §15: التقارير على قاموس المؤشرات، والتصدير Excel/PDF داخل
        // مجموعة المسارات نفسها فيرث فحص الصلاحية ونطاق الشركة حرفياً.
        Route::get('/reports', [CompanyReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/monthly/{report}', [CompanyReportController::class, 'monthly'])->name('reports.monthly');
        Route::get('/reports/export/{exportKey}', [CompanyReportController::class, 'export'])->name('reports.export');

        Route::get('/notifications', [CompanyNotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications', [CompanyNotificationController::class, 'store'])->name('notifications.store');
        Route::post('/notifications/{notification}/read', [CompanyNotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/mark-all-read', [CompanyNotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead');
        Route::delete('/notifications/{notification}', [CompanyNotificationController::class, 'destroy'])->name('notifications.destroy');

        Route::get('/leagues', [CompanyLeagueController::class, 'index'])->name('leagues.index');
        Route::get('/leagues/{league}', [CompanyLeagueController::class, 'show'])->name('leagues.show');

        Route::get('/profile', [CompanyProfileController::class, 'index'])->name('profile.index');
        Route::put('/profile', [CompanyProfileController::class, 'update'])->name('profile.update');
    });

/*
|--------------------------------------------------------------------------
| Employee Portal
|--------------------------------------------------------------------------
*/
Route::prefix('employee')
    ->name('employee.')
    ->middleware(['auth:employee', 'company.context'])
    ->group(function () {
        Route::get('/home', [EmployeeHomeController::class, 'index'])->name('home');

        Route::get('/explore', [EmployeeExploreController::class, 'index'])->name('explore.index');
        Route::get('/explore/{partner}', [EmployeeExploreController::class, 'show'])->name('explore.show');

        Route::get('/create', [EmployeeEventController::class, 'create'])->name('events.create');
        Route::post('/create/pricings', [EmployeeEventController::class, 'pricings'])->name('events.pricings');
        Route::post('/create', [EmployeeEventController::class, 'store'])->name('events.store');

        // A9 — الاقتراح الآلي للمزوّد + المزوّدون المفضّلون للمجتمع (H §11)
        Route::get('/provider-suggestions', [EmployeeProviderSuggestionController::class, 'index'])->name('provider-suggestions');
        // A15 — H §18 (القائد): شاشة «إدارة المزوّدين المفضّلين» (A9 بنى
        // الـ endpoints وترك الواجهة).
        Route::get('/communities/{community}/preferred-providers', [EmployeePreferredProviderController::class, 'index'])->name('communities.preferred-providers.index');
        Route::post('/communities/{community}/preferred-providers', [EmployeePreferredProviderController::class, 'store'])->name('communities.preferred-providers.store');
        Route::delete('/communities/{community}/preferred-providers/{partner}', [EmployeePreferredProviderController::class, 'destroy'])->name('communities.preferred-providers.destroy');
        // A10 — H §12.3 / دليل الموظف §6: صفحة الدفع (رابط موقّع يُستأنف منه
        // طوال النافذة) + سجل المدفوعات.
        Route::get('/payments', [EmployeePaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{intent}', [EmployeePaymentController::class, 'show'])->name('payments.show');
        Route::post('/payments/{intent}/pay', [EmployeePaymentController::class, 'pay'])->name('payments.pay');

        Route::get('/detail/{event}', [EmployeeEventController::class, 'show'])->name('events.show');
        Route::post('/detail/{event}/join', [EmployeeEventController::class, 'join'])->name('events.join');
        Route::post('/detail/{event}/leave', [EmployeeEventController::class, 'leave'])->name('events.leave');
        Route::post('/detail/{event}/leave-waitlist', [EmployeeEventController::class, 'leaveWaitlist'])->name('events.leave-waitlist');
        // A7 — H §10: عرض المقعد الشاغر على أول قائمة الانتظار بمهلة
        Route::post('/detail/{event}/waitlist-offer/accept', [EmployeeEventController::class, 'acceptSeatOffer'])->name('events.waitlist-offer.accept');
        Route::post('/detail/{event}/waitlist-offer/decline', [EmployeeEventController::class, 'declineSeatOffer'])->name('events.waitlist-offer.decline');
        // A7 — H §7: اعتماد/رفض اقتراحات الموظفين (قائد/منسّق) خلال 48 ساعة
        Route::post('/detail/{event}/proposal/approve', [EmployeeEventController::class, 'approveProposal'])->name('events.proposal.approve');
        Route::post('/detail/{event}/proposal/reject', [EmployeeEventController::class, 'rejectProposal'])->name('events.proposal.reject');
        Route::post('/detail/{event}/alternatives/{alternative}/accept', [EmployeeEventController::class, 'acceptAlternative'])->name('events.accept-alternative');
        Route::post('/detail/{event}/alternatives/{alternative}/reject', [EmployeeEventController::class, 'rejectAlternative'])->name('events.reject-alternative');
        Route::post('/detail/{event}/remove/{employee}', [EmployeeEventController::class, 'removeMember'])->name('events.remove-member');
        Route::get('/detail/{event}/refund-preview', [EmployeeEventController::class, 'refundPreview'])->name('events.refund-preview');

        // A12 — H §13: نافذة تعديل الحضور 24 ساعة (القائد/المنسّق) وإدخال
        // النتائج وتصحيحها. لا أثر مالي لأي منها إطلاقاً.
        Route::post('/detail/{event}/attendance/{employee}', [EmployeeAttendanceController::class, 'update'])->name('events.attendance.update');
        Route::post('/detail/{event}/results/{employee}', [EmployeeResultController::class, 'store'])->name('events.results.store');
        Route::post('/results/{result}/correct', [EmployeeResultController::class, 'correct'])->name('results.correct');
        // A8 — H §24: تمديد التسجيل 24 ساعة مرة واحدة قبل مسار إعادة الجدولة
        Route::post('/detail/{event}/extend-registration', [EmployeeEventController::class, 'extendRegistration'])->name('events.extend-registration');

        // A5 — تعليقات الأعضاء تحت الفعالية فقط (H §6): لا محادثة عامة ولا رسائل خاصة
        Route::post('/detail/{event}/comments', [EventCommentController::class, 'store'])->name('events.comments.store');
        Route::patch('/comments/{comment}', [EventCommentController::class, 'update'])->name('events.comments.update');
        Route::delete('/comments/{comment}', [EventCommentController::class, 'destroy'])->name('events.comments.destroy');
        Route::post('/comments/{comment}/report', [EventCommentController::class, 'report'])->name('events.comments.report');
        Route::delete('/detail/{event}', [EmployeeEventController::class, 'destroy'])->name('events.destroy');

        Route::get('/community-requests', [EmployeeCommunityRequestController::class, 'index'])->name('community-requests.index');
        Route::post('/community-requests', [EmployeeCommunityRequestController::class, 'store'])->name('community-requests.store');

        Route::get('/community', [EmployeeCommunityController::class, 'index'])->name('community.index');
        Route::get('/community/{community}', [EmployeeCommunityController::class, 'show'])->name('community.show');
        Route::post('/community/{community}/join', [EmployeeCommunityController::class, 'join'])->name('community.join');
        Route::post('/community/{community}/leave', [EmployeeCommunityController::class, 'leave'])->name('community.leave');
        Route::post('/community/{community}/announcement', [EmployeeCommunityController::class, 'postAnnouncement'])->name('community.announce');
        Route::patch('/community/{community}/announcement/{announcement}', [EmployeeCommunityController::class, 'updateAnnouncement'])->name('community.announce.update');
        Route::delete('/community/{community}/announcement/{announcement}', [EmployeeCommunityController::class, 'deleteAnnouncement'])->name('community.announce.delete');
        Route::post('/community/{community}/members/{member}/remove', [EmployeeCommunityController::class, 'removeMember'])->name('community.members.remove');
        Route::post('/community/{community}/invite', [EmployeeCommunityController::class, 'invite'])->name('community.invite');
        Route::post('/community/{community}/transfer-leadership', [EmployeeCommunityController::class, 'transferLeadership'])->name('community.transfer-leadership');
        Route::post('/community/{community}/step-down', [EmployeeCommunityController::class, 'stepDown'])->name('community.step-down');
        // A8 — قوالب التكرار (H §8): إدارة القائد/المنسّق عبر template.manage
        Route::get('/community/{community}/templates', [EmployeeTemplateController::class, 'index'])->name('community.templates.index');
        Route::post('/community/{community}/templates', [EmployeeTemplateController::class, 'store'])->name('community.templates.store');
        Route::patch('/community/{community}/templates/{template}', [EmployeeTemplateController::class, 'update'])->name('community.templates.update');
        Route::post('/community/{community}/templates/{template}/pause', [EmployeeTemplateController::class, 'pause'])->name('community.templates.pause');
        Route::post('/community/{community}/templates/{template}/resume', [EmployeeTemplateController::class, 'resume'])->name('community.templates.resume');

        Route::post('/community/{community}/polls', [EmployeeCommunityController::class, 'createPoll'])->name('community.polls.store');
        Route::post('/community/{community}/polls/{poll}/vote', [EmployeeCommunityController::class, 'votePoll'])->name('community.polls.vote');
        Route::post('/community/{community}/polls/{poll}/close', [EmployeeCommunityController::class, 'closePoll'])->name('community.polls.close');

        // A13 — H §15: تصدير القائد في نطاق مجتمعه، بلا أي بيانات مالية.
        Route::get('/community/{community}/exports/{exportKey}', EmployeeCommunityExportController::class)
            // الاسم `download` لا `exports`: مولّد Wayfinder يشتق منه معرّفاً في
            // TypeScript، و`exports` يصطدم بالمعرّف المحجوز في نطاق الوحدة.
            ->name('community.download');

        Route::get('/community/{community}/leagues/create', [EmployeeLeagueController::class, 'create'])->name('communities.leagues.create');
        Route::post('/community/{community}/leagues', [EmployeeLeagueController::class, 'store'])->name('communities.leagues.store');
        Route::get('/community/{community}/leagues/{league}', [EmployeeLeagueController::class, 'show'])->name('communities.leagues.show');
        Route::post('/community/{community}/leagues/{league}/matches/{match}/result', [EmployeeLeagueController::class, 'recordResult'])->name('communities.leagues.record-result');
        Route::delete('/community/{community}/leagues/{league}', [EmployeeLeagueController::class, 'destroy'])->name('communities.leagues.destroy');

        Route::post('/quick-match', [EmployeeQuickMatchController::class, 'store'])->name('quick-match.store');
        Route::post('/quick-match/{quickMatch}/vote', [EmployeeQuickMatchController::class, 'vote'])->name('quick-match.vote');
        Route::post('/quick-match/{quickMatch}/convert', [EmployeeQuickMatchController::class, 'convert'])->name('quick-match.convert');

        Route::get('/notifications', [EmployeeNotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/{notification}/read', [EmployeeNotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/read-all', [EmployeeNotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

        Route::get('/reports', [EmployeeReportController::class, 'index'])->name('reports.index');

        // A12 — H §13: لوحتا الصدارة بمنتقي الموسم + إدارة المواسم للقائد.
        Route::get('/leaderboards', [EmployeeLeaderboardController::class, 'index'])->name('leaderboards.index');
        Route::post('/community/{community}/seasons', [EmployeeLeaderboardController::class, 'storeSeason'])->name('seasons.store');
        Route::post('/seasons/{season}/close', [EmployeeLeaderboardController::class, 'closeSeason'])->name('seasons.close');

        Route::get('/profile', [EmployeeProfileController::class, 'index'])->name('profile.index');
        Route::put('/profile', [EmployeeProfileController::class, 'update'])->name('profile.update');

        // A14 — H §14: إيقاف الإشعارات الاختيارية فقط؛ الإلزامية ترفضها الخدمة.
        Route::put('/profile/notification-preferences', [EmployeeNotificationPreferenceController::class, 'update'])
            ->name('profile.notification-preferences.update');
    });
