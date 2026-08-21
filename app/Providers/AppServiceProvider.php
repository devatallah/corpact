<?php

namespace App\Providers;

use App\Listeners\RecordAuthSecurityEvent;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\Partner;
use App\Models\RoleAssignment;
use App\Observers\CompanyObserver;
use App\Observers\EmployeeObserver;
use App\Observers\EventObserver;
use App\Observers\PartnerObserver;
use App\Observers\RoleAssignmentObserver;
use App\Services\Admin\PlatformSettingsService;
use App\Services\Messaging\Channels\LogMessageChannel;
use App\Services\Messaging\Channels\MessageChannel;
use App\Services\Notifications\NotificationDispatcher;
use App\Services\Notifications\TemplateRenderer;
use App\Services\Otp\Channels\LogOtpChannel;
use App\Services\Otp\Channels\OtpChannel;
use App\Support\Tenancy\CompanyContext;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\ValidationException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CompanyContext::class);

        $this->app->bind(
            OtpChannel::class,
            fn ($app) => $app->make(config('otp.channels.'.config('otp.channel'), LogOtpChannel::class)),
        );

        $this->app->bind(
            MessageChannel::class,
            fn ($app) => $app->make(config('messaging.channels.'.config('messaging.channel'), LogMessageChannel::class)),
        );

        // A14 — نقطة الإرسال المركزية خلف واجهة `Notify` (H §14).
        // القارئ singleton كي تكون خريطة القوالب المُهيَّأة واحدة لكل طلب،
        // ولكي يُسقطها تحرير الأدمن فوراً (NotificationTemplate::booted).
        $this->app->singleton(TemplateRenderer::class);
        $this->app->singleton(NotificationDispatcher::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.url') && str_starts_with(config('app.url'), 'https')) {
            URL::forceScheme('https');
        }

        // Identity glue: every legacy account row maps onto the global
        // users / memberships / role_assignments model (H §4).
        Employee::observe(EmployeeObserver::class);
        Partner::observe(PartnerObserver::class);
        Company::observe(CompanyObserver::class);
        // A9: فعالية تدخل انتظار المزوّد → إنشاء طلب قناة القرار (H §11).
        Event::observe(EventObserver::class);
        // A15 — H §19: «تغيير الصلاحيات» في سجل التدقيق + سجل الأحداث الأمنية.
        RoleAssignment::observe(RoleAssignmentObserver::class);

        // A15 — H §19: الدخول الفاشل والقفل بعد 5 محاولات حدثان أمنيان.
        \Illuminate\Support\Facades\Event::listen(
            Failed::class,
            [RecordAuthSecurityEvent::class, 'handleFailed'],
        );
        \Illuminate\Support\Facades\Event::listen(
            Lockout::class,
            [RecordAuthSecurityEvent::class, 'handleLockout'],
        );

        // A15 — H §16: العتبات والمهل يديرها أدمن تيمات. المخزَّن يغطّي قيم
        // `config/events.php` فيبقى كل محرك يقرأ `config()` كما هو (A7).
        $this->app->booted(function (): void {
            try {
                app(PlatformSettingsService::class)->apply();
            } catch (\Throwable) {
                // Settings are an override layer — never let them break boot.
            }
        });

        RateLimiter::for('otp', function (Request $request) {
            $key = mb_strtolower((string) $request->input('phone')).'|'.$request->ip();

            return Limit::perMinute(10)->by($key)->response(function () {
                throw ValidationException::withMessages([
                    'phone' => ['محاولات كثيرة جدًا. يرجى المحاولة بعد دقيقة.'],
                ]);
            });
        });
        RateLimiter::for('login', function (Request $request) {
            $key = mb_strtolower($request->input('email')).'|'.$request->ip();

            return Limit::perMinute(5)->by($key)->response(function () {
                throw ValidationException::withMessages([
                    'email' => ['عدد محاولات تسجيل الدخول كثيرة جدًا. يرجى المحاولة بعد دقيقة.'],
                ]);
            });
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip())->response(function () {
                throw ValidationException::withMessages([
                    'email' => ['عدد المحاولات كثيرة جدًا. يرجى المحاولة بعد دقيقة.'],
                ]);
            });
        });
    }
}
