import { Head, Link, router } from '@inertiajs/react';
import { Building2, CalendarDays, Headphones, Send, TriangleAlert, UserRound } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, SearchInput, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Note, PageHeader, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import { companyStatus, employeeStatus, eventStatus } from '@/lib/status';

/**
 * دليل وكيل الدعم — البحث والاستعلام.
 *
 * The agent reads; they do not decide. Every search here is itself written to
 * the audit log («كل ما تقرأه من بيانات موظفين وشركات يخضع لسجل التدقيق»),
 * phone numbers are shown as their last four digits only, and the escalation
 * table states in the agent's own words what they must hand upward instead of
 * doing themselves.
 */
type Results = {
    events: { id: number; title: string; status: string; event_date: string | null; company: { id: number; name: string } | null; community: { id: number; name: string } | null }[];
    employees: { id: number; name: string; email: string; phone_tail: string | null; status: string; company: { id: number; name: string } | null }[];
    companies: { id: number; name: string; email: string; status: string }[];
};

type Invitation = {
    id: number;
    name: string | null;
    email: string;
    phone_tail: string | null;
    company: { id: number; name: string } | null;
    send_count: number;
    expires_at: string | null;
};

export default function SupportConsole({
    filters,
    results,
    escalation,
    pendingInvitations,
}: {
    filters: { search?: string; scope?: string };
    results: Results;
    escalation: { action: string; label: string; role: string }[];
    pendingInvitations: Invitation[];
}) {
    const [resending, setResending] = useState<Invitation | null>(null);
    const searched = (filters.search ?? '').trim() !== '';
    const found = results.events.length + results.employees.length + results.companies.length;

    return (
        <AdminLayout>
            <Head title="مركز الدعم" />

            <PageHeader
                icon={Headphones}
                title="مركز الدعم — البحث والاستعلام"
                subtitle="ابحث عن فعالية أو موظف أو شركة لتشخيص بلاغ. كل عملية بحث تُقيَّد في سجل التدقيق باسمك."
            />

            <Note title="حدود صلاحيتك">
                تقرأ وتشخّص وتعيد الإرسال ضمن الحدود. أي تغيير في حالة أو مال أو صلاحية يُصعَّد إلى الدور المختص أدناه — لا
                يُنفَّذ من هنا.
            </Note>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="اسم، بريد، رقم جوال، أو رقم فعالية…" />
                    <FilterSelect
                        name="scope"
                        label="نطاق البحث"
                        value={filters.scope ?? 'all'}
                        options={[
                            ['all', 'كل النتائج'],
                            ['events', 'الفعاليات'],
                            ['employees', 'الموظفون'],
                            ['companies', 'الشركات'],
                        ]}
                    />
                </Toolbar>

                {!searched && (
                    <ListStates
                        count={0}
                        empty="ابدأ بالبحث"
                        emptyHint="اكتب اسماً أو بريداً أو رقم جوال أو رقم فعالية. لا تُعرض أي بيانات قبل بحث صريح."
                    />
                )}

                {searched && found === 0 && (
                    <ListStates count={0} empty="لا نتائج مطابقة." emptyHint="جرّب مصطلحاً أقصر أو غيّر نطاق البحث." />
                )}

                {results.events.length > 0 && (
                    <ResultBlock icon={CalendarDays} title="الفعاليات">
                        <TableShell>
                            <Thead>
                                <Th>الفعالية</Th>
                                <Th>الشركة</Th>
                                <Th>التاريخ</Th>
                                <Th>الحالة</Th>
                                <Th className="text-center">السجل</Th>
                            </Thead>
                            <Tbody>
                                {results.events.map((event) => (
                                    <Tr key={event.id}>
                                        <Td>
                                            <span className="font-extrabold text-ink block">{event.title}</span>
                                            <span className="font-mono text-[10px] text-ink/45">#{event.id}</span>
                                        </Td>
                                        <Td className="text-ink/85">{event.company?.name ?? '—'}</Td>
                                        <Td className="font-mono text-[11px] text-ink/70">{event.event_date ?? '—'}</Td>
                                        <Td>
                                            <Badge tone={eventStatus(event.status).tone}>{eventStatus(event.status).label}</Badge>
                                        </Td>
                                        <Td className="text-center">
                                            <Link
                                                href={`/admin/support-console/events/${event.id}`}
                                                className="text-[11px] font-bold text-ink hover:underline"
                                            >
                                                سجل الحالات ←
                                            </Link>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </TableShell>
                    </ResultBlock>
                )}

                {results.employees.length > 0 && (
                    <ResultBlock icon={UserRound} title="الموظفون">
                        <TableShell>
                            <Thead>
                                <Th>الموظف</Th>
                                <Th>البريد</Th>
                                <Th>الجوال</Th>
                                <Th>الشركة</Th>
                                <Th>الحالة</Th>
                            </Thead>
                            <Tbody>
                                {results.employees.map((employee) => (
                                    <Tr key={employee.id}>
                                        <Td className="font-extrabold text-ink">{employee.name}</Td>
                                        <Td className="font-mono text-[11px] text-ink/70" dir="ltr">
                                            {employee.email}
                                        </Td>
                                        <Td className="font-mono text-[11px] text-ink/70" dir="ltr">
                                            {employee.phone_tail ? `•••• ${employee.phone_tail}` : '—'}
                                        </Td>
                                        <Td className="text-ink/85">{employee.company?.name ?? '—'}</Td>
                                        <Td>
                                            <Badge tone={employeeStatus(employee.status).tone}>{employeeStatus(employee.status).label}</Badge>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </TableShell>
                    </ResultBlock>
                )}

                {results.companies.length > 0 && (
                    <ResultBlock icon={Building2} title="الشركات">
                        <TableShell>
                            <Thead>
                                <Th>الشركة</Th>
                                <Th>البريد</Th>
                                <Th>الحالة</Th>
                            </Thead>
                            <Tbody>
                                {results.companies.map((company) => (
                                    <Tr key={company.id}>
                                        <Td className="font-extrabold text-ink">{company.name}</Td>
                                        <Td className="font-mono text-[11px] text-ink/70" dir="ltr">
                                            {company.email}
                                        </Td>
                                        <Td>
                                            <Badge tone={companyStatus(company.status).tone}>{companyStatus(company.status).label}</Badge>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </TableShell>
                    </ResultBlock>
                )}
            </Card>

            {/* ── إعادة إرسال الدعوات ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">دعوات معلّقة — إعادة الإرسال</h2>

                <TableShell>
                    <Thead>
                        <Th>المدعو</Th>
                        <Th>الشركة</Th>
                        <Th>مرات الإرسال</Th>
                        <Th>تنتهي في</Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>
                    <Tbody>
                        {pendingInvitations.map((invitation) => {
                            const expired = invitation.expires_at !== null && new Date(invitation.expires_at) < new Date();

                            return (
                                <Tr key={invitation.id}>
                                    <Td>
                                        <span className="font-extrabold text-ink block">{invitation.name ?? '—'}</span>
                                        <span className="font-mono text-[11px] text-ink/60" dir="ltr">
                                            {invitation.email}
                                        </span>
                                    </Td>
                                    <Td className="text-ink/85">{invitation.company?.name ?? '—'}</Td>
                                    <Td className="font-mono text-ink/70">{invitation.send_count}</Td>
                                    <Td>
                                        <span className="font-mono text-[11px] text-ink/70">
                                            {invitation.expires_at ? new Date(invitation.expires_at).toLocaleDateString('ar-SA') : '—'}
                                        </span>
                                        {expired && <Badge tone="danger">منتهية</Badge>}
                                    </Td>
                                    <Td className="text-center">
                                        <Button tone="soft" icon={Send} onClick={() => setResending(invitation)}>
                                            إعادة الإرسال
                                        </Button>
                                    </Td>
                                </Tr>
                            );
                        })}
                        <ListStates
                            count={pendingInvitations.length}
                            colSpan={5}
                            empty="لا دعوات معلّقة."
                            emptyHint="كل الدعوات إما قُبلت أو انتهت صلاحيتها."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── ما لا تفعله — يُصعَّد فوراً ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <TriangleAlert className="w-4 h-4 text-warning" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">ما لا تفعله — يُصعَّد فوراً</h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>الإجراء</Th>
                        <Th>يُصعَّد إلى</Th>
                    </Thead>
                    <Tbody>
                        {escalation.map((row) => (
                            <Tr key={row.action}>
                                <Td>
                                    <span className="font-bold text-ink block">{row.label}</span>
                                    <span className="font-mono text-[10px] text-ink/45">{row.action}</span>
                                </Td>
                                <Td>
                                    <Badge tone="warning">{row.role}</Badge>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </TableShell>
            </Card>

            <ConfirmModal
                open={resending !== null}
                title="إعادة إرسال الدعوة"
                message="سيصل المدعو رابط جديد صالح ٧ أيام، ويزيد عدّاد الإرسال. لا يُنشأ حساب جديد ولا تتغيّر هوية الدعوة."
                details={
                    resending && (
                        <>
                            <ConfirmRow label="المدعو" value={resending.email} />
                            <ConfirmRow label="الشركة" value={resending.company?.name ?? '—'} />
                            <ConfirmRow label="مرات الإرسال السابقة" value={String(resending.send_count)} strong />
                        </>
                    )
                }
                confirmLabel="إعادة الإرسال"
                onConfirm={() => {
                    router.post(`/admin/support-console/invitations/${resending?.id}/resend`, {}, { preserveScroll: true });
                    setResending(null);
                }}
                onCancel={() => setResending(null)}
            />
        </AdminLayout>
    );
}

function ResultBlock({ icon: Icon, title, children }: { icon: typeof Building2; title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-ink/60" aria-hidden="true" />
                <h3 className="text-xs font-extrabold text-ink">{title}</h3>
            </div>
            {children}
        </div>
    );
}
