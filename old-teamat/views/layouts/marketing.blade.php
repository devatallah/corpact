{{--
    Public marketing site — ported from teamat.ai.studio.

    Deliberately not the Inertia shell: these pages are static, so they skip
    React entirely and take only the compiled stylesheet. Unlike app.blade.php
    this one is Arabic RTL at the document root, which is what the ported
    markup's logical properties assume.
--}}
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>@yield('title', 'تيمات | فعاليات متكررة تلقائياً للموظفين')</title>
    <meta name="description" content="@yield('description', 'تيمات منصة B2B SaaS سعودية تحوّل الاهتمامات المشتركة بين الموظفين إلى فعاليات متكررة تلقائياً دون الحاجة إلى مجهود تنظيمي داخل الشركة.')">

    <meta property="og:type" content="website">
    <meta property="og:locale" content="ar_SA">
    <meta property="og:site_name" content="تيمات | Teamat">
    <meta property="og:title" content="@yield('title', 'تيمات')">
    <meta property="og:description" content="@yield('description', '')">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#0A0A0A">

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.png" type="image/png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css'])
</head>
<body class="bg-[#F6F8F5] text-[#0A0A0A] font-arabic antialiased selection:bg-[#C8FF00] selection:text-[#0A0A0A]">
    <div class="flex flex-col min-h-screen">
        @include('partials.marketing-header', [
            'theme' => $headerTheme ?? 'dark',
            'active' => $activeNav ?? '',
        ])

        <main class="flex-1">
            @yield('content')
        </main>

        @include('partials.marketing-footer')
    </div>

    <script>
        // The header is fixed, so the drawer is the only nav on small screens.
        (function () {
            const toggle = document.getElementById('mobile-menu-toggle');
            const menu = document.getElementById('mobile-menu');

            if (!toggle || !menu) {
                return;
            }

            toggle.addEventListener('click', function () {
                const open = menu.hidden;
                menu.hidden = !open;
                toggle.setAttribute('aria-expanded', String(open));
                toggle.setAttribute('aria-label', open ? 'إغلاق القائمة الرئيسية' : 'فتح القائمة الرئيسية');
            });

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && !menu.hidden) {
                    toggle.click();
                    toggle.focus();
                }
            });
        })();
    </script>
</body>
</html>
