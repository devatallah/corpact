import EmployeeBottomNav from '@/components/employee-bottom-nav';
import PortalHeader from '@/components/portal-header';
import { usePage } from '@inertiajs/react';
import '../../css/main.css';
import '../../css/employee.css';

/**
 * The employee shell — ported from teamat.ai.studio (`employee_n0_*`).
 *
 * The prototype's employee portal is phone-shaped, and deliberately so: it
 * carries no rail at all, centres a `max-w-2xl` column under the shared header,
 * and pins a five-up tab bar to the bottom of that column. This replaces the
 * pre-port desktop top-nav plus its separate emoji mobile bar; both are gone.
 *
 * `main.css` / `employee.css` still load here for the page-level classes the
 * employee screens use, and `.portal-employee` scopes them so they cannot leak
 * into the other portals.
 */
export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const { props } = usePage();
    const auth = (props as Record<string, unknown>).auth as
        | { user?: { name?: string }; memberships?: { id: number; label: string; active?: boolean }[] }
        | undefined;
    const employee = (props as Record<string, unknown>).employee as { name?: string } | undefined;
    const name = employee?.name ?? auth?.user?.name ?? 'الموظف';
    const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2);

    // The prototype's column opens with a strip naming the company whose
    // communities you're looking at — the employee portal is always scoped to
    // one membership, and a multi-company account switches from the header.
    const company = auth?.memberships?.find((m) => m.active) ?? auth?.memberships?.[0];
    const companyMark = (company?.label ?? '').replace(/^شركة\s+/, '').trim().slice(0, 3);

    return (
        <div
            className="portal-employee min-h-screen bg-[#F6F8F5] text-[#0A0A0A] font-arabic antialiased selection:bg-[#C8FF00] selection:text-[#0A0A0A] flex flex-col"
            dir="rtl"
        >
            <PortalHeader
                userLabel={name}
                userSub="موظف"
                userAvatar={initials}
                notificationsUrl="/employee/notifications"
                contextSwitchUrl="/employee/context/switch"
            />

            <div className="flex-1 flex max-w-7xl mx-auto w-full">
                <main className="flex-1 min-w-0 p-0 sm:p-4 lg:p-6 pb-0 flex justify-center">
                    <div className="w-full max-w-2xl min-w-0 min-h-full flex flex-col justify-between">
                        {company && (
                            <div className="sticky top-0 z-30 bg-[#F6F8F5]/90 backdrop-blur-md px-4 py-3 border-b-[0.5px] border-[#0A0A0A]/10 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-[#0A0A0A] text-[#C8FF00] font-black text-xs flex items-center justify-center shrink-0">
                                        {companyMark}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] text-[#0A0A0A]/50 font-bold">مجتمعات منسوبي</div>
                                        <div className="text-xs font-black text-[#0A0A0A] leading-tight truncate">{company.label}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 min-w-0 p-4">{children}</div>
                        <EmployeeBottomNav />
                    </div>
                </main>
            </div>
        </div>
    );
}
