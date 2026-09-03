import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Building2, ChevronDown } from 'lucide-react';
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
}: {
    userLabel: string;
    userSub?: string;
    userAvatar?: string;
    /** Where the bell goes. Portals without an inbox render it as a plain button. */
    notificationsUrl?: string;
    /** Context switcher target; the picker appears only with more than one membership. */
    contextSwitchUrl?: string;
}) {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const memberships = ((props.auth as { memberships?: Membership[] } | undefined)?.memberships ?? []) as Membership[];
    const unread = (props.unreadNotifications as number) ?? 0;

    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const showSwitcher = Boolean(contextSwitchUrl) && memberships.length > 1;
    const active = memberships.find((membership) => membership.active);

    useEffect(() => {
        if (!open) {
            return;
        }

        function onPointerDown(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

    return (
        <header className="bg-surface border-b-[0.5px] border-ink/10 sticky top-0 z-40 px-4 sm:px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link href="/" className="flex items-center gap-2" aria-label="تيمات">
                        <BrandMark size={32} />
                    </Link>

                    {showSwitcher && (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setOpen((prev) => !prev)}
                                aria-haspopup="listbox"
                                aria-expanded={open}
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink/5 hover:bg-ink/10 border-[0.5px] border-ink/10 transition-colors text-xs font-bold cursor-pointer"
                            >
                                <Building2 className="w-3.5 h-3.5 text-ink/70" aria-hidden="true" />
                                <span className="truncate max-w-xs">{active?.label ?? 'اختر المنشأة'}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-ink/40" aria-hidden="true" />
                            </button>

                            {open && (
                                <div
                                    role="listbox"
                                    className="absolute top-full mt-2 start-0 min-w-56 bg-surface rounded-2xl border-[0.5px] border-ink/10 overflow-hidden z-50"
                                >
                                    {memberships.map((membership) => (
                                        <button
                                            key={membership.id}
                                            type="button"
                                            role="option"
                                            aria-selected={Boolean(membership.active)}
                                            onClick={() => {
                                                setOpen(false);

                                                if (!membership.active) {
                                                    router.post(contextSwitchUrl as string, { context_id: membership.id });
                                                }
                                            }}
                                            className={`w-full text-start px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                                                membership.active ? 'bg-ink text-lime' : 'text-ink/80 hover:bg-ink/5'
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
                            aria-label={unread > 0 ? `التنبيهات (${unread} غير مقروء)` : 'التنبيهات'}
                            className="p-2 rounded-full text-ink/70 hover:text-ink hover:bg-ink/5 relative transition-colors"
                        >
                            <Bell className="w-5 h-5" aria-hidden="true" />
                            {unread > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-lime border border-ink" />
                            )}
                        </Link>
                    ) : null}

                    <div className="flex items-center gap-2.5 ps-1 select-none">
                        <div className="w-8 h-8 rounded-full bg-ink text-lime font-bold text-xs flex items-center justify-center border border-ink/20">
                            {userAvatar ?? userLabel.charAt(0)}
                        </div>
                        <div className="hidden md:block text-right leading-tight">
                            <span className="text-xs font-extrabold text-ink block">{userLabel}</span>
                            {userSub && <span className="text-[10px] text-ink/60 block font-medium">{userSub}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
