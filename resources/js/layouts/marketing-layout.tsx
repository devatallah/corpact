import { Link } from '@inertiajs/react';
import { Globe, Mail, MapPin, MessageCircle, Menu } from 'lucide-react';
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

    const link = dark ? 'text-white/80 hover:text-white hover:bg-white/5' : 'text-ink/80 hover:text-ink hover:bg-ink/5';
    const linkOn = dark ? 'text-lime bg-white/5 font-bold' : 'text-ink bg-ink/5 font-bold';

    return (
        <div className="flex flex-col min-h-screen">
            <header
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 py-4 ${
                    dark
                        ? 'bg-ink/70 backdrop-blur-sm border-b-[0.5px] border-white/5'
                        : 'bg-[#F8FAF7]/90 backdrop-blur-md border-b-[0.5px] border-ink/10'
                }`}
            >
                <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link
                        href="/"
                        aria-label="الصفحة الرئيسية لمنصة تيمات"
                        className="inline-flex items-center rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                    >
                        <BrandLockup size={36} tone={dark ? 'white' : 'ink'} />
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-[14px] lg:text-[15px]" aria-label="القائمة الرئيسية">
                        {NAV.map(([path, label]) => (
                            <Link
                                key={path}
                                href={path}
                                aria-current={activeNav === path ? 'page' : undefined}
                                className={`px-3.5 py-1.5 rounded-full transition-colors duration-150 font-medium ${
                                    activeNav === path ? linkOn : link
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <a
                            href="/login"
                            className={`hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border-[0.5px] ${
                                dark
                                    ? 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                                    : 'bg-surface text-ink border-ink/15 hover:border-ink/40'
                            }`}
                        >
                            دخول المنصة
                        </a>

                        <Link
                            href="/contact"
                            className={`hidden sm:inline-flex items-center justify-center rounded-full whitespace-nowrap text-[13px] py-2 px-4 font-bold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime ${
                                dark
                                    ? 'bg-lime text-ink border-lime hover:bg-lime-hover'
                                    : 'bg-ink text-white border-ink hover:bg-[#1a1a1a]'
                            }`}
                        >
                            اطلب عرضاً
                        </Link>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-expanded={menuOpen}
                            aria-label={menuOpen ? 'إغلاق القائمة الرئيسية' : 'فتح القائمة الرئيسية'}
                            className={`md:hidden p-2 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime ${
                                dark ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-ink/5'
                            }`}
                        >
                            <Menu className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/*
                    The prototype renders its drawer only once React opens it, so
                    the static capture has the toggle and no panel. Built here to
                    the same language: ink ground, hairlines, lime on the active row.
                */}
                {menuOpen && (
                    <div className="md:hidden mt-4 mx-4 sm:mx-6 rounded-2xl border hairline-light bg-ink text-white overflow-hidden">
                        <nav className="flex flex-col divide-y divide-white/10" aria-label="القائمة الرئيسية للجوال">
                            {NAV.map(([path, label]) => (
                                <Link
                                    key={path}
                                    href={path}
                                    onClick={() => setMenuOpen(false)}
                                    className={`px-5 py-3.5 text-sm transition-colors ${
                                        activeNav === path ? 'text-lime font-bold' : 'text-white/80 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                            <a href="/login" className="px-5 py-3.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors">
                                دخول المنصة
                            </a>
                            <Link href="/contact" className="px-5 py-3.5 text-sm font-bold text-ink bg-lime hover:bg-lime-hover transition-colors">
                                اطلب عرضاً
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <footer className="bg-ink text-white border-t-[0.5px] border-white/10">
                <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12">
                        <div className="space-y-4">
                            <Link
                                href="/"
                                aria-label="الرئيسية - تيمات"
                                className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                            >
                                <BrandLockup size={36} tone="white" />
                            </Link>
                            <p className="text-white/70 text-sm leading-relaxed max-w-[260px]">
                                منصة سعودية تحوّل الاهتمامات المشتركة بين الموظفين إلى فعاليات متكررة تلقائياً.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-white/50 pt-2">
                                <MapPin className="w-3.5 h-3.5 text-lime shrink-0" aria-hidden="true" />
                                <span>تيمات — الرياض، المملكة العربية السعودية</span>
                            </div>
                        </div>

                        {FOOTER_COLUMNS.map(([heading, links]) => (
                            <div key={heading}>
                                <h2 className="text-xs font-sans font-extrabold uppercase tracking-[2px] text-lime mb-4">{heading}</h2>
                                <ul className="space-y-2.5 text-sm">
                                    {links.map(([label, href]) => (
                                        <li key={label}>
                                            <Link
                                                href={href}
                                                className="text-white/70 hover:text-lime transition-colors duration-150 inline-block py-0.5"
                                            >
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div>
                            <h2 className="text-xs font-sans font-extrabold uppercase tracking-[2px] text-lime mb-4">التواصل</h2>
                            <div className="space-y-3 text-sm">
                                <a
                                    href="mailto:contact@teamat.app"
                                    className="flex items-center gap-2.5 text-white/70 hover:text-lime transition-colors duration-150"
                                >
                                    <Mail className="w-4 h-4 text-lime shrink-0" aria-hidden="true" />
                                    <span dir="ltr" className="font-sans text-xs sm:text-sm">contact@teamat.app</span>
                                </a>
                                <a
                                    href="https://wa.me/966500000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 text-white/70 hover:text-lime transition-colors duration-150"
                                >
                                    <MessageCircle className="w-4 h-4 text-lime shrink-0" aria-hidden="true" />
                                    <span dir="ltr" className="font-sans text-xs sm:text-sm">+966 50 000 0000</span>
                                </a>
                                <div className="flex items-center gap-2.5 text-white/50 text-xs pt-1">
                                    <Globe className="w-4 h-4 text-lime shrink-0" aria-hidden="true" />
                                    <span dir="ltr" className="font-sans">teamat.app</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t-[0.5px] border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-light">
                        <p>© {new Date().getFullYear()} تيمات · جميع الحقوق محفوظة</p>
                        <div className="flex items-center gap-6">
                            <span className="font-sans tracking-wider uppercase text-[10px] text-lime">SAUDI ARABIA · B2B SAAS</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
