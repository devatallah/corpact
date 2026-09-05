import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    Globe,
    Mail,
    MapPin,
    MessageCircle,
    Menu,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BrandLockup } from '@/components/brand';

const NAV: [string, string][] = [
    ['/how-it-works', 'كيف تعمل'],
    ['/for-companies', 'للشركات'],
    ['/for-providers', 'لمزودي الخدمة'],
    ['/activities', 'الأنشطة'],
    ['/model', 'النموذج'],
];

const FOOTER_COLUMNS: [string, [string, string][]][] = [
    [
        'المنتج',
        [
            ['كيف تعمل المنصة', '/how-it-works'],
            ['حلول الشركات', '/for-companies'],
            ['شبكة مزودي الخدمة', '/for-providers'],
            ['دليل الأنشطة', '/activities'],
            ['النموذج المالي', '/model'],
        ],
    ],
    [
        'المنصة',
        [
            ['عن تيمات', '/for-companies'],
            ['طلب عرض مخصص', '/contact'],
            ['انضمام مزودي الخدمة', '/for-providers'],
        ],
    ],
];

/**
 * The public marketing shell.
 *
 * The header has two variants because the hero behind it changes: light on the
 * home page (its hero sits on #F8FAF7) and dark everywhere else (ink heroes).
 * They differ only in colour, so the structure lives here once.
 */
/**
 * البوابات الثلاث التي يدخل منها زائر الموقع العام.
 *
 * `/login` كان يحوّل الجميع إلى دخول الموظف بصمت، فمسؤول حساب الشركة
 * ومزوّد الخدمة يصلان شاشة ليست لهما ولا شيء يقول ذلك. الاختيار هنا صريح.
 * دخول أدمن تيمات ليس منها: مسار داخلي لا يُعلَن في موقع عام.
 */
const PORTALS: [string, string, string][] = [
    ['/employee/login', 'موظف', 'انضم لمجتمعات شركتك وأكّد حضورك'],
    ['/company/login', 'شركة', 'أدر المجتمعات والمحفظة والتقارير'],
    ['/partner/login', 'مزوّد خدمة', 'استقبل طلبات الحجز وأدر مرافقك'],
];

export default function MarketingLayout({
    children,
    headerTheme = 'dark',
    activeNav = '',
}: {
    children: ReactNode;
    headerTheme?: 'light' | 'dark';
    activeNav?: string;
}) {
    const dark = headerTheme === 'dark';
    const [menuOpen, setMenuOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setMenuOpen(false);
            }
        }

        document.addEventListener('keydown', onKey);

        return () => document.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    // قائمة الدخول تُغلق بالمفتاح وبالنقر خارجها — وإلا بقيت مفتوحة فوق
    // الصفحة بعد أن ينصرف عنها الزائر.
    useEffect(() => {
        if (!loginOpen) {
            return;
        }

        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setLoginOpen(false);
            }
        }

        function onPointer(e: MouseEvent) {
            if (!(e.target as HTMLElement).closest('[data-login-menu]')) {
                setLoginOpen(false);
            }
        }

        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onPointer);

        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onPointer);
        };
    }, [loginOpen]);

    const link = dark
        ? 'text-white/80 hover:text-white hover:bg-white/5'
        : 'text-ink/80 hover:text-ink hover:bg-ink/5';
    const linkOn = dark
        ? 'text-lime bg-white/5 font-bold'
        : 'text-ink bg-ink/5 font-bold';

    return (
        <div className="flex min-h-screen flex-col">
            <header
                className={`fixed inset-x-0 top-0 z-50 py-4 transition-all duration-200 ${
                    dark
                        ? 'border-b-[0.5px] border-white/5 bg-ink/70 backdrop-blur-sm'
                        : 'border-b-[0.5px] border-ink/10 bg-[#F8FAF7]/90 backdrop-blur-md'
                }`}
            >
                <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        aria-label="الصفحة الرئيسية لمنصة تيمات"
                        className="inline-flex items-center rounded-lg p-1 focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none"
                    >
                        <BrandLockup size={36} tone={dark ? 'white' : 'ink'} />
                    </Link>

                    <nav
                        className="hidden items-center gap-1 text-[14px] md:flex lg:gap-2 lg:text-[15px]"
                        aria-label="القائمة الرئيسية"
                    >
                        {NAV.map(([path, label]) => (
                            <Link
                                key={path}
                                href={path}
                                aria-current={
                                    activeNav === path ? 'page' : undefined
                                }
                                className={`rounded-full px-3.5 py-1.5 font-medium transition-colors duration-150 ${
                                    activeNav === path ? linkOn : link
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <div
                            data-login-menu
                            className="relative hidden sm:block"
                        >
                            <button
                                type="button"
                                onClick={() => setLoginOpen((v) => !v)}
                                aria-expanded={loginOpen}
                                aria-haspopup="menu"
                                className={`inline-flex cursor-pointer items-center gap-1 rounded-full border-[0.5px] px-3.5 py-1.5 text-xs font-bold transition-all ${
                                    dark
                                        ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                                        : 'border-ink/15 bg-surface text-ink hover:border-ink/40'
                                }`}
                            >
                                دخول المنصة
                                <ChevronDown
                                    className={`h-3.5 w-3.5 transition-transform ${loginOpen ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                />
                            </button>

                            {loginOpen && (
                                <div
                                    role="menu"
                                    aria-label="اختر بوابة الدخول"
                                    className="absolute end-0 top-full z-50 mt-2 w-[248px] overflow-hidden rounded-[14px] border-[0.5px] border-ink/10 bg-surface text-right shadow-xl"
                                >
                                    {PORTALS.map(([href, label, hint]) => (
                                        <a
                                            key={href}
                                            href={href}
                                            role="menuitem"
                                            className="block border-b-[0.5px] border-ink/[0.07] px-4 py-3 transition-colors last:border-b-0 hover:bg-page"
                                        >
                                            <span className="block text-[13px] font-extrabold text-ink">
                                                {label}
                                            </span>
                                            <span className="block pt-0.5 text-[11px] leading-relaxed text-ink/55">
                                                {hint}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/contact"
                            className={`hidden items-center justify-center rounded-full border px-4 py-2 text-[13px] font-bold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none sm:inline-flex ${
                                dark
                                    ? 'border-lime bg-lime text-ink hover:bg-lime-hover'
                                    : 'border-ink bg-ink text-white hover:bg-[#1a1a1a]'
                            }`}
                        >
                            اطلب عرضاً
                        </Link>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-expanded={menuOpen}
                            aria-label={
                                menuOpen
                                    ? 'إغلاق القائمة الرئيسية'
                                    : 'فتح القائمة الرئيسية'
                            }
                            className={`cursor-pointer rounded-full p-2 focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none md:hidden ${
                                dark
                                    ? 'text-white hover:bg-white/10'
                                    : 'text-ink hover:bg-ink/5'
                            }`}
                        >
                            <Menu
                                className="h-6 w-6"
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </div>

                {/*
                    The prototype renders its drawer only once React opens it, so
                    the static capture has the toggle and no panel. Built here to
                    the same language: ink ground, hairlines, lime on the active row.
                */}
                {menuOpen && (
                    <div className="mx-4 mt-4 overflow-hidden rounded-2xl border hairline-light bg-ink text-white sm:mx-6 md:hidden">
                        <nav
                            className="flex flex-col divide-y divide-white/10"
                            aria-label="القائمة الرئيسية للجوال"
                        >
                            {NAV.map(([path, label]) => (
                                <Link
                                    key={path}
                                    href={path}
                                    onClick={() => setMenuOpen(false)}
                                    className={`px-5 py-3.5 text-sm transition-colors ${
                                        activeNav === path
                                            ? 'font-bold text-lime'
                                            : 'text-white/80 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                            <span className="px-5 pt-4 pb-1 text-[11px] font-bold tracking-wider text-white/40 uppercase">
                                دخول المنصة
                            </span>
                            {PORTALS.map(([href, label, hint]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="px-5 py-3 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                                >
                                    <span className="block font-bold">
                                        {label}
                                    </span>
                                    <span className="block text-[11px] text-white/45">
                                        {hint}
                                    </span>
                                </a>
                            ))}
                            <Link
                                href="/contact"
                                className="bg-lime px-5 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-lime-hover"
                            >
                                اطلب عرضاً
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t-[0.5px] border-white/10 bg-ink text-white">
                <div className="mx-auto max-w-[1120px] px-4 pt-16 pb-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                        <div className="space-y-4">
                            <Link
                                href="/"
                                aria-label="الرئيسية - تيمات"
                                className="inline-block rounded-lg focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none"
                            >
                                <BrandLockup size={36} tone="white" />
                            </Link>
                            <p className="max-w-[260px] text-sm leading-relaxed text-white/70">
                                منصة سعودية تحوّل الاهتمامات المشتركة بين
                                الموظفين إلى فعاليات متكررة تلقائياً.
                            </p>
                            <div className="flex items-center gap-2 pt-2 text-xs text-white/50">
                                <MapPin
                                    className="h-3.5 w-3.5 shrink-0 text-lime"
                                    aria-hidden="true"
                                />
                                <span>
                                    تيمات — الرياض، المملكة العربية السعودية
                                </span>
                            </div>
                        </div>

                        {FOOTER_COLUMNS.map(([heading, links]) => (
                            <div key={heading}>
                                <h2 className="mb-4 font-sans text-xs font-extrabold tracking-[2px] text-lime uppercase">
                                    {heading}
                                </h2>
                                <ul className="space-y-2.5 text-sm">
                                    {links.map(([label, href]) => (
                                        <li key={label}>
                                            <Link
                                                href={href}
                                                className="inline-block py-0.5 text-white/70 transition-colors duration-150 hover:text-lime"
                                            >
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div>
                            <h2 className="mb-4 font-sans text-xs font-extrabold tracking-[2px] text-lime uppercase">
                                التواصل
                            </h2>
                            <div className="space-y-3 text-sm">
                                <a
                                    href="mailto:contact@teamat.app"
                                    className="flex items-center gap-2.5 text-white/70 transition-colors duration-150 hover:text-lime"
                                >
                                    <Mail
                                        className="h-4 w-4 shrink-0 text-lime"
                                        aria-hidden="true"
                                    />
                                    <span
                                        dir="ltr"
                                        className="font-sans text-xs sm:text-sm"
                                    >
                                        contact@teamat.app
                                    </span>
                                </a>
                                <a
                                    href="https://wa.me/966500000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 text-white/70 transition-colors duration-150 hover:text-lime"
                                >
                                    <MessageCircle
                                        className="h-4 w-4 shrink-0 text-lime"
                                        aria-hidden="true"
                                    />
                                    <span
                                        dir="ltr"
                                        className="font-sans text-xs sm:text-sm"
                                    >
                                        +966 50 000 0000
                                    </span>
                                </a>
                                <div className="flex items-center gap-2.5 pt-1 text-xs text-white/50">
                                    <Globe
                                        className="h-4 w-4 shrink-0 text-lime"
                                        aria-hidden="true"
                                    />
                                    <span dir="ltr" className="font-sans">
                                        teamat.app
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t-[0.5px] border-white/10 pt-8 text-xs font-light text-white/50 sm:flex-row">
                        <p>
                            © {new Date().getFullYear()} تيمات · جميع الحقوق
                            محفوظة
                        </p>
                        <div className="flex items-center gap-6">
                            {/* الصفحتان النظاميتان تُطلبان بالاسم في المراجعة، وموضعهما
                                المتعارف عليه شريط الحقوق — لا قائمة التصفح. */}
                            <Link
                                href="/terms"
                                className="transition-colors hover:text-white"
                            >
                                الشروط والأحكام
                            </Link>
                            <Link
                                href="/privacy"
                                className="transition-colors hover:text-white"
                            >
                                سياسة الخصوصية
                            </Link>
                            <span className="font-sans text-[10px] tracking-wider text-lime uppercase">
                                SAUDI ARABIA · B2B SAAS
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
