import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Building2, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** One company a multi-company account can act inside (`auth.memberships`). */
interface MembershipOption {
    id: number;
    /** The server sends `label` (OtpLoginService::options), never `name`. */
    label: string;
    active?: boolean;
}

interface PortalHeaderProps {
    userLabel: string;
    userSub?: string;
    userAvatar?: string;
    /** Where the bell goes. Omitted portals render the bell as a plain button. */
    notificationsUrl?: string;
    /**
     * Context switcher target. The picker only appears when the account has
     * more than one membership to switch between — same rule the sidebar used.
     */
    contextSwitchUrl?: string;
}

/**
 * The portal top bar — ported from teamat.ai.studio.
 *
 * The prototype's header carries the brand, the active-entity switcher, the
 * bell and the identity, which is why the sidebar below it starts straight at
 * «القائمة الرئيسية». Its role-switching demo bar (`aria-label="شريط تجربة
 * وتبديل الأدوار"`) is scaffolding and is deliberately not ported, so this
 * sticks to `top-0` where the prototype offsets to `top-10`.
 */
export default function PortalHeader({
    userLabel,
    userSub,
    userAvatar,
    notificationsUrl,
    contextSwitchUrl,
}: PortalHeaderProps) {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const auth = props.auth as { memberships?: MembershipOption[] } | undefined;
    const memberships = auth?.memberships ?? [];
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
        <header className="bg-white border-b-[0.5px] border-[#0A0A0A]/10 sticky top-0 z-40 px-4 sm:px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                    <a href="/" className="flex items-center gap-2" aria-label="تيمات">
                        <svg width="32" height="32" viewBox="0 0 52 52" role="img" aria-label="شعار تيمات" className="shrink-0">
                            <rect width="52" height="52" rx="13" fill="#C8FF00" />
                            <rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A" />
                            <rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A" />
                        </svg>
                    </a>

                    {showSwitcher && (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setOpen((prev) => !prev)}
                                aria-haspopup="listbox"
                                aria-expanded={open}
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0A0A]/5 hover:bg-[#0A0A0A]/10 border-[0.5px] border-[#0A0A0A]/10 transition-colors text-xs font-bold cursor-pointer"
                            >
                                <Building2 className="w-3.5 h-3.5 text-[#0A0A0A]/70" aria-hidden="true" />
                                <span className="truncate max-w-xs">{active?.label ?? 'اختر المنشأة'}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-[#0A0A0A]/40" aria-hidden="true" />
                            </button>

                            {open && (
                                <div
                                    role="listbox"
                                    className="absolute top-full mt-2 start-0 min-w-56 bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/10 overflow-hidden z-50"
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
                                            className={`w-full text-start px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                                                membership.active
                                                    ? 'bg-[#0A0A0A] text-[#C8FF00]'
                                                    : 'text-[#0A0A0A]/80 hover:bg-[#0A0A0A]/5'
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
                            aria-label="التنبيهات"
                            className="p-2 rounded-full text-[#0A0A0A]/70 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/5 relative"
                        >
                            <Bell className="w-4 h-4" aria-hidden="true" />
                            {unread > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C8FF00] border border-[#0A0A0A]" />
                            )}
                        </Link>
                    ) : null}

                    <div className="flex items-center gap-2.5 ps-1 select-none">
                        <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-[#C8FF00] font-bold text-xs flex items-center justify-center border border-[#0A0A0A]/20 shrink-0">
                            {userAvatar ?? userLabel.charAt(0)}
                        </div>
                        <div className="hidden md:block text-right leading-tight">
                            <span className="text-xs font-extrabold text-[#0A0A0A] block">{userLabel}</span>
                            {userSub && <span className="text-[10px] text-[#0A0A0A]/60 block font-medium">{userSub}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
