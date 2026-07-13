<?php

use App\Http\Controllers\Admin\AdminController as AdminAdminController;
use App\Http\Controllers\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Admin\PartnerController as AdminPartnerController;
use App\Http\Controllers\Admin\CommunityController as AdminCommunityController;
use App\Http\Controllers\Admin\CompanyController as AdminCompanyController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EmployeeController as AdminEmployeeController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\RevenueController as AdminRevenueController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\PartnerAuthController;
use App\Http\Controllers\Auth\CompanyAuthController;
use App\Http\Controllers\Auth\EmployeeAuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\InvitationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Partner\ProfileController as PartnerProfileController;
use App\Http\Controllers\Partner\BookingController as PartnerBookingController;
use App\Http\Controllers\Partner\StaffController as PartnerStaffController;
use App\Http\Controllers\Partner\VenueController as PartnerVenueController;
use App\Http\Controllers\Partner\DashboardController as PartnerDashboardController;
use App\Http\Controllers\Partner\DiscountController as PartnerDiscountController;
use App\Http\Controllers\Partner\ScheduleController as PartnerScheduleController;
use App\Http\Controllers\Partner\ReportController as PartnerReportController;
use App\Http\Controllers\Partner\SettlementController as PartnerSettlementController;
use App\Http\Controllers\Company\LeagueController as CompanyLeagueController;
use App\Http\Controllers\Employee\CommunityController as EmployeeCommunityController;
use App\Http\Controllers\Employee\CommunityRequestController as EmployeeCommunityRequestController;
use App\Http\Controllers\Employee\LeagueController as EmployeeLeagueController;
use App\Http\Controllers\Employee\EventController as EmployeeEventController;
use App\Http\Controllers\Employee\ExploreController as EmployeeExploreController;
use App\Http\Controllers\Employee\HomeController as EmployeeHomeController;
use App\Http\Controllers\Employee\NotificationController as EmployeeNotificationController;
use App\Http\Controllers\Employee\ProfileController as EmployeeProfileController;
use App\Http\Controllers\Employee\QuickMatchController as EmployeeQuickMatchController;
use App\Http\Controllers\Employee\ReportController as EmployeeReportController;
use App\Http\Controllers\Company\ProfileController as CompanyProfileController;
use App\Http\Controllers\Company\DepartmentController as CompanyDepartmentController;
use App\Http\Controllers\Company\CommunityController as CompanyCommunityController;
use App\Http\Controllers\Company\CommunityRequestController as CompanyCommunityRequestController;
use App\Http\Controllers\Company\DashboardController as CompanyDashboardController;
use App\Http\Controllers\Company\EmployeeController as CompanyEmployeeController;
use App\Http\Controllers\Company\EventController as CompanyEventController;
use App\Http\Controllers\Company\NotificationController as CompanyNotificationController;
use App\Http\Controllers\Company\ReportController as CompanyReportController;
use App\Http\Controllers\Company\WalletController as CompanyWalletController;
use Illuminate\Support\Facades\Route;

Route::view('/terms', 'legal.terms');
Route::view('/privacy', 'legal.privacy');
Route::view('/support', 'legal.support');
Route::post('/support', [App\Http\Controllers\SupportMessageController::class, 'store'])->middleware('throttle:5,1')->name('support.store');
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

// Legacy URLs from before the business -> partner rename
Route::redirect('/businesses', '/partners');
Route::redirect('/business/login', '/partner/login');
Route::redirect('/business/register', '/partner/register');
Route::redirect('/business', '/partner');

Route::get('/partners', function () {
    return view('landing.partners', [
        'categories' => \App\Models\Category::whereNull('parent_id')
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
Route::get('/invite/{token}', [InvitationController::class, 'show'])->name('invitation.show');
Route::post('/invite/{token}', [InvitationController::class, 'accept'])->name('invitation.accept');

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
        Route::get('/forgot-password', fn () => app(PasswordResetController::class)->showForgotForm('admin'))->name('password.request');
        Route::post('/forgot-password', fn (Illuminate\Http\Request $r) => app(PasswordResetController::class)->sendResetLink($r, 'admin'))->name('password.email')->middleware('throttle:password-reset');
        Route::get('/reset-password/{token}', fn (Illuminate\Http\Request $r, string $token) => app(PasswordResetController::class)->showResetForm($r, 'admin', $token))->name('password.reset');
        Route::post('/reset-password', fn (Illuminate\Http\Request $r) => app(PasswordResetController::class)->reset($r, 'admin'))->name('password.update');
    });
    Route::post('/logout', [AdminAuthController::class, 'logout'])->middleware('auth:admin')->name('logout');

    Route::middleware('auth:admin')->group(function () {
        Route::get('/email/verify', fn (Illuminate\Http\Request $r) => app(EmailVerificationController::class)->notice($r, 'admin'))->name('verification.notice');
        Route::get('/email/verify/{id}/{hash}', fn (Illuminate\Http\Request $r, int $id, string $hash) => app(EmailVerificationController::class)->verify($r, 'admin', $id, $hash))->middleware('signed')->name('verification.verify');
        Route::post('/email/verification-notification', fn (Illuminate\Http\Request $r) => app(EmailVerificationController::class)->resend($r, 'admin'))->middleware('throttle:6,1')->name('verification.send');
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
        Route::get('/login', [EmployeeAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [EmployeeAuthController::class, 'login'])->middleware('throttle:login');
        Route::get('/register', fn () => redirect('/employees#register'));
        Route::post('/register', [EmployeeAuthController::class, 'register'])->middleware('throttle:login');
        Route::get('/forgot-password', fn () => app(PasswordResetController::class)->showForgotForm('employee'))->name('password.request');
        Route::post('/forgot-password', fn (Illuminate\Http\Request $r) => app(PasswordResetController::class)->sendResetLink($r, 'employee'))->name('password.email')->middleware('throttle:password-reset');
        Route::get('/reset-password/{token}', fn (Illuminate\Http\Request $r, string $token) => app(PasswordResetController::class)->showResetForm($r, 'employee', $token))->name('password.reset');
        Route::post('/reset-password', fn (Illuminate\Http\Request $r) => app(PasswordResetController::class)->reset($r, 'employee'))->name('password.update');
    });
    Route::post('/logout', [EmployeeAuthController::class, 'logout'])->middleware('auth:employee')->name('logout');

    // Verify route accessible without auth (clicked from email)
    Route::get('/email/verify/{id}/{hash}', fn (Illuminate\Http\Request $r, int $id, string $hash) => app(EmailVerificationController::class)->verify($r, 'employee', $id, $hash))->middleware('signed')->name('verification.verify');

    Route::middleware('auth:employee')->group(function () {
        Route::get('/email/verify', fn (Illuminate\Http\Request $r) => app(EmailVerificationController::class)->notice($r, 'employee'))->name('verification.notice');
        Route::post('/email/verification-notification', fn (Illuminate\Http\Request $r) => app(EmailVerificationController::class)->resend($r, 'employee'))->middleware('throttle:6,1')->name('verification.send');
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
        Route::get('/login', [PartnerAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [PartnerAuthController::class, 'login'])->middleware('throttle:login');
        Route::get('/register', fn () => redirect('/partners#register'));
        Route::post('/register', [PartnerAuthController::class, 'register']);
        Route::get('/activate/{token}', [PartnerAuthController::class, 'showActivateForm'])->name('activate');
        Route::post('/activate/{token}', [PartnerAuthController::class, 'activate']);
        Route::get('/forgot-password', fn () => app(PasswordResetController::class)->showForgotForm('partner'))->name('password.request');
        Route::post('/forgot-password', fn (Illuminate\Http\Request $r) => app(PasswordResetController::class)->sendResetLink($r, 'partner'))->name('password.email')->middleware('throttle:password-reset');
        Route::get('/reset-password/{token}', fn (Illuminate\Http\Request $r, string $token) => app(PasswordResetController::class)->showResetForm($r, 'partner', $token))->name('password.reset');
        Route::post('/reset-password', fn (Illuminate\Http\Request $r) => app(PasswordResetController::class)->reset($r, 'partner'))->name('password.update');
    });
    Route::post('/logout', [PartnerAuthController::class, 'logout'])->middleware('auth:partner')->name('logout');

    Route::middleware('auth:partner')->group(function () {
        Route::get('/email/verify', fn (Illuminate\Http\Request $r) => app(EmailVerificationController::class)->notice($r, 'partner'))->name('verification.notice');
        Route::get('/email/verify/{id}/{hash}', fn (Illuminate\Http\Request $r, int $id, string $hash) => app(EmailVerificationController::class)->verify($r, 'partner', $id, $hash))->middleware('signed')->name('verification.verify');
        Route::post('/email/verification-notification', fn (Illuminate\Http\Request $r) => app(EmailVerificationController::class)->resend($r, 'partner'))->middleware('throttle:6,1')->name('verification.send');
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
        Route::get('/login', [CompanyAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [CompanyAuthController::class, 'login'])->middleware('throttle:login');
        Route::get('/register', fn () => redirect('/companies#register'));
        Route::post('/register', [CompanyAuthController::class, 'register']);
        Route::get('/activate/{token}', [CompanyAuthController::class, 'showActivateForm'])->name('activate');
        Route::post('/activate/{token}', [CompanyAuthController::class, 'activate']);
        Route::get('/forgot-password', fn () => app(PasswordResetController::class)->showForgotForm('company'))->name('password.request');
        Route::post('/forgot-password', fn (Illuminate\Http\Request $r) => app(PasswordResetController::class)->sendResetLink($r, 'company'))->name('password.email')->middleware('throttle:password-reset');
        Route::get('/reset-password/{token}', fn (Illuminate\Http\Request $r, string $token) => app(PasswordResetController::class)->showResetForm($r, 'company', $token))->name('password.reset');
        Route::post('/reset-password', fn (Illuminate\Http\Request $r) => app(PasswordResetController::class)->reset($r, 'company'))->name('password.update');
    });
    Route::post('/logout', [CompanyAuthController::class, 'logout'])->middleware('auth:company')->name('logout');

    Route::middleware('auth:company')->group(function () {
        Route::get('/email/verify', fn (Illuminate\Http\Request $r) => app(EmailVerificationController::class)->notice($r, 'company'))->name('verification.notice');
        Route::get('/email/verify/{id}/{hash}', fn (Illuminate\Http\Request $r, int $id, string $hash) => app(EmailVerificationController::class)->verify($r, 'company', $id, $hash))->middleware('signed')->name('verification.verify');
        Route::post('/email/verification-notification', fn (Illuminate\Http\Request $r) => app(EmailVerificationController::class)->resend($r, 'company'))->middleware('throttle:6,1')->name('verification.send');
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

        // Routes accessible by super_admin and admin only
        Route::middleware('role:super_admin,admin')->group(function () {
            Route::resource('companies', AdminCompanyController::class)->except(['show']);
            Route::post('/companies/{company}/approve', [AdminCompanyController::class, 'approve'])->name('companies.approve');
            Route::post('/companies/{company}/reject', [AdminCompanyController::class, 'reject'])->name('companies.reject');
            Route::post('/companies/{company}/reset-password', [AdminCompanyController::class, 'sendResetPassword'])->name('companies.reset-password');

            Route::resource('partners', AdminPartnerController::class)->except(['show']);
            Route::post('/partners/{partner}/approve', [AdminPartnerController::class, 'approve'])->name('partners.approve');
            Route::post('/partners/{partner}/reject', [AdminPartnerController::class, 'reject'])->name('partners.reject');
            Route::post('/partners/{partner}/reset-password', [AdminPartnerController::class, 'sendResetPassword'])->name('partners.reset-password');

            Route::resource('employees', AdminEmployeeController::class)->except(['show']);
            Route::post('/employees/{employee}/reset-password', [AdminEmployeeController::class, 'sendResetPassword'])->name('employees.reset-password');

            Route::get('communities', [AdminCommunityController::class, 'index'])->name('communities.index');

            Route::resource('categories', AdminCategoryController::class)->except(['show', 'create', 'edit']);
            Route::post('/categories/{category}/restore', [AdminCategoryController::class, 'restore'])->name('categories.restore');

            Route::resource('events', AdminEventController::class)->except(['create', 'store', 'edit', 'update']);
            Route::post('/events/{event}/cancel', [AdminEventController::class, 'cancel'])->name('events.cancel');

            Route::get('/notifs', [AdminNotificationController::class, 'index'])->name('notifs.index');
            Route::post('/notifs', [AdminNotificationController::class, 'store'])->name('notifs.store');

            Route::get('/support', [App\Http\Controllers\Admin\SupportMessageController::class, 'index'])->name('support.index');
            Route::patch('/support/{supportMessage}', [App\Http\Controllers\Admin\SupportMessageController::class, 'update'])->name('support.update');
            Route::delete('/support/{supportMessage}', [App\Http\Controllers\Admin\SupportMessageController::class, 'destroy'])->name('support.destroy');
            Route::post('/notifs/{notification}/read', [AdminNotificationController::class, 'markAsRead'])->name('notifs.read');
            Route::delete('/notifs/{notification}', [AdminNotificationController::class, 'destroy'])->name('notifs.destroy');
        });

        // Revenue — accessible by all admin roles (accountant can view)
        Route::get('/revenue', [AdminRevenueController::class, 'index'])->name('revenue.index');

        // Admin management — super_admin only
        Route::middleware('role:super_admin')->group(function () {
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
| partner Portal
|--------------------------------------------------------------------------
*/
Route::prefix('partner')
    ->name('partner.')
    ->middleware('auth:partner')
    ->group(function () {
        Route::get('/dash', [PartnerDashboardController::class, 'index'])->name('dash');

        Route::get('/requests', [PartnerBookingController::class, 'index'])->name('bookings.index');
        Route::post('/requests/{event}/approve', [PartnerBookingController::class, 'approve'])->middleware('partner.permission:bookings.approve')->name('bookings.approve');
        Route::post('/requests/{event}/reject', [PartnerBookingController::class, 'reject'])->middleware('partner.permission:bookings.reject')->name('bookings.reject');
        Route::post('/requests/{event}/propose-alternative', [PartnerBookingController::class, 'proposeAlternative'])->middleware('partner.permission:bookings.propose-alternative')->name('bookings.propose-alternative');

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

        Route::middleware('partner.permission:discounts.view')->group(function () {
            Route::get('/discounts', [PartnerDiscountController::class, 'index'])->name('discounts.index');
            Route::get('/discounts/communities/{company}', [PartnerDiscountController::class, 'communities'])->name('discounts.communities');
            Route::post('/discounts', [PartnerDiscountController::class, 'store'])->name('discounts.store');
            Route::put('/discounts/{discount}', [PartnerDiscountController::class, 'update'])->name('discounts.update');
            Route::delete('/discounts/{discount}', [PartnerDiscountController::class, 'destroy'])->name('discounts.destroy');
        });

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
    ->middleware('auth:company')
    ->group(function () {
        Route::get('/dash', [CompanyDashboardController::class, 'index'])->name('dash');

        Route::resource('departments', CompanyDepartmentController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::resource('employees', CompanyEmployeeController::class)->except(['show']);

        Route::resource('events', CompanyEventController::class)->except(['create', 'store', 'edit', 'update']);
        Route::post('/events/{event}/cancel', [CompanyEventController::class, 'cancel'])->name('events.cancel');
        Route::post('/events/{event}/add-member', [CompanyEventController::class, 'addMember'])->name('events.add-member');
        Route::post('/events/{event}/remove-member', [CompanyEventController::class, 'removeMember'])->name('events.remove-member');

        Route::resource('communities', CompanyCommunityController::class)->except(['show']);

        Route::get('/community-requests', [CompanyCommunityRequestController::class, 'index'])->name('community-requests.index');
        Route::post('/community-requests/{communityRequest}/approve', [CompanyCommunityRequestController::class, 'approve'])->name('community-requests.approve');
        Route::post('/community-requests/{communityRequest}/reject', [CompanyCommunityRequestController::class, 'reject'])->name('community-requests.reject');

        Route::get('/employees/search', [CompanyEmployeeController::class, 'search'])->name('employees.search');

        Route::get('/wallet', [CompanyWalletController::class, 'index'])->name('wallet.index');
        Route::post('/wallet/charge', [CompanyWalletController::class, 'charge'])->name('wallet.charge');
        Route::post('/wallet/distribute', [CompanyWalletController::class, 'distribute'])->name('wallet.distribute');

        Route::get('/reports', [CompanyReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/export', [CompanyReportController::class, 'export'])->name('reports.export');

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
    ->middleware('auth:employee')
    ->group(function () {
        Route::get('/home', [EmployeeHomeController::class, 'index'])->name('home');

        Route::get('/explore', [EmployeeExploreController::class, 'index'])->name('explore.index');
        Route::get('/explore/{partner}', [EmployeeExploreController::class, 'show'])->name('explore.show');

        Route::get('/create', [EmployeeEventController::class, 'create'])->name('events.create');
        Route::post('/create/pricings', [EmployeeEventController::class, 'pricings'])->name('events.pricings');
        Route::post('/create', [EmployeeEventController::class, 'store'])->name('events.store');
        Route::get('/detail/{event}', [EmployeeEventController::class, 'show'])->name('events.show');
        Route::post('/detail/{event}/join', [EmployeeEventController::class, 'join'])->name('events.join');
        Route::post('/detail/{event}/leave', [EmployeeEventController::class, 'leave'])->name('events.leave');
        Route::post('/detail/{event}/leave-waitlist', [EmployeeEventController::class, 'leaveWaitlist'])->name('events.leave-waitlist');
        Route::post('/detail/{event}/alternatives/{alternative}/accept', [EmployeeEventController::class, 'acceptAlternative'])->name('events.accept-alternative');
        Route::post('/detail/{event}/alternatives/{alternative}/reject', [EmployeeEventController::class, 'rejectAlternative'])->name('events.reject-alternative');
        Route::post('/detail/{event}/remove/{employee}', [EmployeeEventController::class, 'removeMember'])->name('events.remove-member');
        Route::get('/detail/{event}/refund-preview', [EmployeeEventController::class, 'refundPreview'])->name('events.refund-preview');
        Route::delete('/detail/{event}', [EmployeeEventController::class, 'destroy'])->name('events.destroy');

        Route::get('/community-requests', [EmployeeCommunityRequestController::class, 'index'])->name('community-requests.index');
        Route::post('/community-requests', [EmployeeCommunityRequestController::class, 'store'])->name('community-requests.store');

        Route::get('/community', [EmployeeCommunityController::class, 'index'])->name('community.index');
        Route::get('/community/{community}', [EmployeeCommunityController::class, 'show'])->name('community.show');
        Route::post('/community/{community}/join', [EmployeeCommunityController::class, 'join'])->name('community.join');
        Route::post('/community/{community}/leave', [EmployeeCommunityController::class, 'leave'])->name('community.leave');
        Route::post('/community/{community}/announcement', [EmployeeCommunityController::class, 'postAnnouncement'])->name('community.announce');
        Route::post('/community/{community}/polls', [EmployeeCommunityController::class, 'createPoll'])->name('community.polls.store');
        Route::post('/community/{community}/polls/{poll}/vote', [EmployeeCommunityController::class, 'votePoll'])->name('community.polls.vote');
        Route::post('/community/{community}/polls/{poll}/close', [EmployeeCommunityController::class, 'closePoll'])->name('community.polls.close');

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

        Route::get('/profile', [EmployeeProfileController::class, 'index'])->name('profile.index');
        Route::put('/profile', [EmployeeProfileController::class, 'update'])->name('profile.update');
    });
