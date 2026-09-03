{{--
    Marketing header — ported from teamat.ai.studio.

    The prototype ships two variants: a light bar on the home page, whose hero
    sits on #F8FAF7, and a dark bar on every other page, whose hero is ink.
    They differ only in colour, so the structure lives here once and $theme
    picks the palette. $active is the path of the current page, or '' when the
    page is not in the nav (home, contact).
--}}
@php
    $theme = $theme ?? 'dark';
    $active = $active ?? '';
    $dark = $theme === 'dark';

    $nav = [
        '/how-it-works' => 'كيف تعمل',
        '/for-companies' => 'للشركات',
        '/for-providers' => 'لمزودي الخدمة',
        '/activities' => 'الأنشطة',
        '/model' => 'النموذج',
    ];

    $link = $dark
        ? 'text-white/80 hover:text-white hover:bg-white/5'
        : 'text-[#0A0A0A]/80 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/5';
    $linkOn = $dark
        ? 'text-[#C8FF00] bg-white/5 font-bold'
        : 'text-[#0A0A0A] bg-[#0A0A0A]/5 font-bold';
@endphp

<header id="main-header"
    class="fixed top-0 inset-x-0 z-50 transition-all duration-200 py-4 {{ $dark
        ? 'bg-[#0A0A0A]/70 backdrop-blur-sm border-b-[0.5px] border-white/5'
        : 'bg-[#F8FAF7]/90 backdrop-blur-md border-b-[0.5px] border-[#0A0A0A]/10' }}">
    <div class="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a id="header-brand-logo" href="/" data-discover="true"
            class="group inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] rounded-lg p-1"
            aria-label="الصفحة الرئيسية لمنصة تيمات">
            <div class="inline-flex items-center gap-3 select-none">
                <svg width="36" height="36" viewBox="0 0 52 52" role="img" aria-label="شعار تيمات" class="shrink-0 transition-transform duration-200"><rect width="52" height="52" rx="13" fill="#C8FF00"></rect><rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A"></rect><rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A"></rect></svg>
                <span class="font-arabic font-extrabold tracking-tight text-2xl {{ $dark ? 'text-white' : 'text-[#0A0A0A]' }}">تيمات</span>
            </div>
        </a>

        <nav id="desktop-nav" class="hidden md:flex items-center gap-1 lg:gap-2 text-[14px] lg:text-[15px]" aria-label="القائمة الرئيسية">
            @foreach ($nav as $path => $label)
                <a href="{{ $path }}" data-discover="true"
                    @if ($active === $path) aria-current="page" @endif
                    class="px-3.5 py-1.5 rounded-full transition-colors duration-150 font-medium {{ $active === $path ? $linkOn : $link }}">{{ $label }}</a>
            @endforeach
        </nav>

        <div class="flex items-center gap-2 sm:gap-3">
            <a id="header-login-link" href="{{ url('/login') }}" data-discover="true"
                class="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border-[0.5px] {{ $dark
                    ? 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                    : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40' }}">
                <span>دخول المنصة</span>
            </a>

            <div class="hidden sm:block">
                <a id="header-cta-button" href="/contact" data-discover="true"
                    class="inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] text-[13px] py-2 px-4 font-bold border-[0.5px] {{ $dark
                        ? 'bg-[#C8FF00] text-[#0A0A0A] border-[#C8FF00] hover:bg-[#bcf200] hover:border-[#bcf200] active:opacity-90'
                        : 'bg-[#0A0A0A] text-white border-[#0A0A0A] hover:bg-[#1a1a1a] hover:border-[#222222]' }}">اطلب عرضاً</a>
            </div>

            <button id="mobile-menu-toggle" type="button" aria-label="فتح القائمة الرئيسية"
                aria-expanded="false" aria-controls="mobile-menu"
                class="md:hidden p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] {{ $dark ? 'text-white hover:bg-white/10' : 'text-[#0A0A0A] hover:bg-[#0A0A0A]/5' }}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu w-6 h-6" aria-hidden="true"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>
            </button>
        </div>
    </div>

    {{--
        The prototype renders its mobile drawer only once React opens it, so the
        static capture has the toggle button but no panel. This is built to the
        same language: ink ground, hairline rules, lime on the active row.
    --}}
    <div id="mobile-menu" hidden
        class="md:hidden mt-4 mx-4 sm:mx-6 rounded-2xl border-[0.5px] border-white/10 bg-[#0A0A0A] text-white overflow-hidden">
        <nav class="flex flex-col divide-y-[0.5px] divide-white/10" aria-label="القائمة الرئيسية للجوال">
            @foreach ($nav as $path => $label)
                <a href="{{ $path }}"
                    @if ($active === $path) aria-current="page" @endif
                    class="px-5 py-3.5 text-sm transition-colors {{ $active === $path ? 'text-[#C8FF00] font-bold' : 'text-white/80 hover:text-white hover:bg-white/5' }}">{{ $label }}</a>
            @endforeach
            <a href="{{ url('/login') }}" class="px-5 py-3.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors">دخول المنصة</a>
            <a href="/contact" class="px-5 py-3.5 text-sm font-bold text-[#0A0A0A] bg-[#C8FF00] hover:bg-[#bcf200] transition-colors">اطلب عرضاً</a>
        </nav>
    </div>
</header>
