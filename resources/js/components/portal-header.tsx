import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Building2, ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BrandMark } from '@/components/brand';
import type { Membership } from '@/types/auth';

/**
 * The portal top bar, from the prototype's app screens.
 *
 * The prototype carries the brand, the active-entity switcher, the bell and
 * the identity up here, which is why the rail below opens straight onto
 * «القائمة الرئيسية». Its role-switching demo strip (`aria-label="شريط تجربة
 * وتبديل الأدوار"`) is scaffolding for the prototype gallery and is
 * deliberately not ported — so this sits at `top-0` where the prototype
 * offsets to `top-10`.
 */
export default function PortalHeader({
    userLabel,
    userSub,
    userAvatar,
    notificationsUrl,
    contextSwitchUrl,
    logoutUrl,
}: {
    userLabel: string;
    userSub?: string;
    userAvatar?: string;
    /**
     * يُمرَّر في البوابات التي لا شريط جانبي لها.
     *
     * بوابة الموظف بتبويباتها السفلية لم يكن فيها زر خروج **إطلاقاً**: الخروج
     * يعيش في ذيل الشريط الجانبي، ولا شريط جانبي هنا. ومن دخل بجواله لا يجد
     * سبيلاً للخروج إلا مسح بيانات المتصفح.
     */
    logoutUrl?: string;
    /** Where the bell goes. Portals without an inbox render it as a plain button. */
    notificationsUrl?: string;
    /** Context switcher target; the picker appears only with more than one membership. */
    contextSwitchUrl?: string;
}) {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const memberships = ((
        props.auth as { memberships?: Membership[] } | undefined
    )?.memberships ?? []) as Membership[];
    const unread = (props.unreadNotifications as number) ?? 0;

    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [userOpen, setUserOpen] = useState(false);
    const userRef = useRef<HTMLDivElement>(null);

    const showSwitcher = Boolean(contextSwitchUrl) && memberships.length > 1;
    const active = memberships.find((membership) => membership.active);

    useEffect(() => {
        if (!open) {
            return;
        }

        function onPointerDown(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    useEffect(() => {
        if (!userOpen) {
            return;
        }

        function onPointerDown(event: MouseEvent) {
            if (
                userRef.current &&
                !userRef.current.contains(event.target as Node)
            ) {
                setUserOpen(false);
            }
        }

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setUserOpen(false);
            }
        }

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [userOpen]);

    return (
        <header className="sticky top-0 z-40 border-b-[0.5px] border-ink/10 bg-surface px-4 py-3 sm:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2"
                        aria-label="تيمات"
                    >
                        <BrandMark size={32} />
                    </Link>

                    {showSwitcher && (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setOpen((prev) => !prev)}
                                aria-haspopup="listbox"
                                aria-expanded={open}
                                className="hidden cursor-pointer items-center gap-2 rounded-full border-[0.5px] border-ink/10 bg-ink/5 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-ink/10 sm:flex"
                            >
                                <Building2
                                    className="h-3.5 w-3.5 text-ink/70"
                                    aria-hidden="true"
                                />
                                <span className="max-w-xs truncate">
                                    {active?.label ?? 'اختر المنشأة'}
                                </span>
                                <ChevronDown
                                    className="h-3.5 w-3.5 text-ink/40"
                                    aria-hidden="true"
                                />
                            </button>

                            {open && (
                                <div
                                    role="listbox"
                                    className="absolute start-0 top-full z-50 mt-2 min-w-56 overflow-hidden rounded-2xl border-[0.5px] border-ink/10 bg-surface"
                                >
                                    {memberships.map((membership) => (
                                        <button
                                            key={membership.id}
                                            type="button"
                                            role="option"
                                            aria-selected={Boolean(
                                                membership.active,
                                            )}
                                            onClick={() => {
                                                setOpen(false);

                                                if (!membership.active) {
                                                    router.post(
                                                        contextSwitchUrl as string,
                                                        {
                                                            context_id:
                                                                membership.id,
                                                        },
                                                    );
                                                }
                                            }}
                                            className={`w-full cursor-pointer px-3.5 py-2.5 text-start text-xs font-bold transition-colors ${
                                                membership.active
                                                    ? 'bg-ink text-lime'
                                                    : 'text-ink/80 hover:bg-ink/5'
                                            }`}
                                        >
                                            {membership.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {notificationsUrl ? (
                        <Link
                            href={notificationsUrl}
                            aria-label={
                                unread > 0
                                    ? `التنبيهات (${unread} غير مقروء)`
                                    : 'التنبيهات'
                            }
                            className="relative rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
                        >
                            <Bell className="h-5 w-5" aria-hidden="true" />
                            {unread > 0 && (
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full border border-ink bg-lime" />
                            )}
                        </Link>
                    ) : null}

                    {logoutUrl ? (
                        <div className="relative" ref={userRef}>
                            <button
                                type="button"
                                onClick={() => setUserOpen((prev) => !prev)}
                                aria-haspopup="menu"
                                aria-expanded={userOpen}
                                aria-label={`حساب ${userLabel}`}
                                className="flex cursor-pointer items-center gap-2.5 rounded-full ps-1 transition-colors hover:bg-ink/5"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 bg-ink text-xs font-bold text-lime">
                                    {userAvatar ?? userLabel.charAt(0)}
                                </div>
                                <div className="hidden text-right leading-tight md:block">
                                    <span className="block text-xs font-extrabold text-ink">
                                        {userLabel}
                                    </span>
                                    {userSub && (
                                        <span className="block text-[10px] font-medium text-ink/60">
                                            {userSub}
                                        </span>
                                    )}
                                </div>
                                <ChevronDown
                                    className="me-1 h-3.5 w-3.5 text-ink/40"
                                    aria-hidden="true"
                                />
                            </button>

                            {userOpen && (
                                <div
                                    role="menu"
                                    className="absolute end-0 top-full z-50 mt-2 min-w-44 overflow-hidden rounded-2xl border-[0.5px] border-ink/10 bg-surface p-1"
                                >
                                    <div className="px-3 py-2 md:hidden">
                                        <span className="block text-xs font-extrabold text-ink">
                                            {userLabel}
                                        </span>
                                        {userSub && (
                                            <span className="block text-[10px] font-medium text-ink/60">
                                                {userSub}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            setUserOpen(false);
                                            router.post(logoutUrl);
                                        }}
                                        className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger-tint"
                                    >
                                        <LogOut
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        <span>تسجيل الخروج</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5 ps-1 select-none">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 bg-ink text-xs font-bold text-lime">
                                {userAvatar ?? userLabel.charAt(0)}
                            </div>
                            <div className="hidden text-right leading-tight md:block">
                                <span className="block text-xs font-extrabold text-ink">
                                    {userLabel}
                                </span>
                                {userSub && (
                                    <span className="block text-[10px] font-medium text-ink/60">
                                        {userSub}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
