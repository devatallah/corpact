import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    Clock,
    MapPin,
    UserMinus,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink, ListStates } from '@/components/list-states';
import {
    Badge,
    Button,
    Card,
    IconButton,
    Money,
    PageHeader,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import { eventStatus } from '@/lib/status';

/**
 * H §9 / §12.4 — the account manager's view of one event.
 *
 * Cancelling here is a company cancellation, and the matrix says that is
 * always a full refund: the dialog states the policy and the headcount, not
 * just «هل أنت متأكد؟».
 */
type EventModel = {
    id: number;
    title: string;
    description: string | null;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    status: string;
    capacity: number | null;
    participants_count: number | null;
    min_participants: number | null;
    total_amount?: string | number | null;
    community?: { id: number; name: string } | null;
    partner?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
    creator?: { id: number; name: string } | null;
    participants?: { id: number; name: string; email?: string }[];
};


export default function CompanyEventShow({
    event,
    communityMembers,
    joinedIds,
    refundPreview,
}: {
    company: { id: number; name: string };
    event: EventModel;
    communityMembers: { id: number; name: string; email: string }[];
    joinedIds: number[];
    seriesEvents: unknown[];
    refundPreview: { percentage: number; policy_label: string } | null;
}) {
    const [cancelling, setCancelling] = useState(false);
    const [removing, setRemoving] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [adding, setAdding] = useState('');

    const joined = new Set(joinedIds);
    const participants = communityMembers.filter((member) =>
        joined.has(member.id),
    );
    const available = communityMembers.filter(
        (member) => !joined.has(member.id),
    );
    const status = eventStatus(event.status);

    return (
        <CompanyLayout>
            <Head title={event.title} />

            <BackLink href="/company/events" label="العودة إلى الفعاليات" />

            <PageHeader
                icon={CalendarDays}
                title={event.title}
                subtitle={event.community?.name ?? undefined}
                actions={
                    <>
                        <Badge tone={status.tone}>{status.label}</Badge>
                        {refundPreview && (
                            <Button
                                tone="danger"
                                onClick={() => setCancelling(true)}
                            >
                                إلغاء الفعالية
                            </Button>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="space-y-2">
                    <span className="block text-[11px] font-bold text-ink/50">
                        الموعد
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-ink">
                        <CalendarDays
                            className="h-3.5 w-3.5 text-ink/50"
                            aria-hidden="true"
                        />
                        <span className="font-mono">
                            {event.event_date ?? '—'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink">
                        <Clock
                            className="h-3.5 w-3.5 text-ink/50"
                            aria-hidden="true"
                        />
                        <span className="font-mono">
                            {event.start_time ?? '—'}
                            {event.end_time ? ` - ${event.end_time}` : ''}
                        </span>
                    </div>
                </Card>

                <Card className="space-y-2">
                    <span className="block text-[11px] font-bold text-ink/50">
                        المرفق
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-ink">
                        <MapPin
                            className="h-3.5 w-3.5 text-ink/50"
                            aria-hidden="true"
                        />
                        <span className="truncate">
                            {event.partner?.name ?? 'لم يُحدَّد بعد'}
                        </span>
                    </div>
                    {event.total_amount !== undefined &&
                        event.total_amount !== null && (
                            <div className="text-xs text-ink/70">
                                التكلفة الإجمالية:{' '}
                                <Money
                                    amount={event.total_amount}
                                    className="text-ink"
                                />
                            </div>
                        )}
                </Card>

                <Card className="space-y-2">
                    <span className="block text-[11px] font-bold text-ink/50">
                        المشاركة
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-ink">
                        <Users
                            className="h-3.5 w-3.5 text-ink/50"
                            aria-hidden="true"
                        />
                        <span className="font-mono">
                            {participants.length} / {event.capacity ?? '—'} مقعد
                        </span>
                    </div>
                    <div className="text-[11px] text-ink/55">
                        النصاب الأدنى {event.min_participants ?? '—'}
                    </div>
                </Card>
            </div>

            {event.description && (
                <Card>
                    <p className="text-xs leading-relaxed text-ink/75">
                        {event.description}
                    </p>
                </Card>
            )}

            {/* ── المشاركون ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <h2 className="text-sm font-extrabold text-ink">
                        المشاركون
                    </h2>

                    {available.length > 0 && (
                        <div className="flex items-center gap-2">
                            <select
                                aria-label="إضافة عضو"
                                value={adding}
                                onChange={(changeEvent) =>
                                    setAdding(changeEvent.target.value)
                                }
                                className="cursor-pointer rounded-xl border-[0.5px] border-ink/20 bg-surface p-2 text-xs focus:border-ink focus:outline-none"
                            >
                                <option value="">اختر عضواً من المجتمع…</option>
                                {available.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                tone="soft"
                                icon={UserPlus}
                                disabled={adding === ''}
                                onClick={() => {
                                    router.post(
                                        `/company/events/${event.id}/add-member`,
                                        { employee_id: Number(adding) },
                                        { preserveScroll: true },
                                    );
                                    setAdding('');
                                }}
                            >
                                إضافة
                            </Button>
                        </div>
                    )}
                </div>

                <TableShell>
                    <Thead>
                        <Th>العضو</Th>
                        <Th>البريد</Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>
                    <Tbody>
                        {participants.map((member) => (
                            <Tr key={member.id}>
                                <Td className="font-extrabold text-ink">
                                    {member.name}
                                </Td>
                                <Td
                                    className="font-mono text-[11px] text-ink/70"
                                    dir="ltr"
                                >
                                    {member.email}
                                </Td>
                                <Td className="text-center">
                                    <IconButton
                                        icon={UserMinus}
                                        label="إزالة من الفعالية"
                                        tone="danger"
                                        onClick={() =>
                                            setRemoving({
                                                id: member.id,
                                                name: member.name,
                                            })
                                        }
                                    />
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={participants.length}
                            colSpan={3}
                            empty="لا مشاركين بعد."
                            emptyHint="أضف أعضاء من المجتمع أو انتظر تأكيدهم بأنفسهم."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            {/* H §12.4 — a company cancellation is always a full refund; say so. */}
            <ConfirmModal
                open={cancelling}
                tone="danger"
                title="إلغاء الفعالية"
                message="سيُبلَّغ كل المشاركين والمزوّد فوراً، ويُنفَّذ الاسترداد وفق سياسة الاسترداد أدناه."
                details={
                    <>
                        <ConfirmRow label="الفعالية" value={event.title} />
                        <ConfirmRow
                            label="المشاركون المتأثرون"
                            value={`${participants.length} موظف`}
                        />
                        <ConfirmRow
                            label="سياسة الاسترداد"
                            value={refundPreview?.policy_label ?? '—'}
                            strong
                        />
                        <ConfirmRow
                            label="نسبة الاسترداد"
                            value={`${refundPreview?.percentage ?? 0}٪`}
                        />
                    </>
                }
                confirmLabel="تأكيد الإلغاء"
                onConfirm={() => {
                    router.post(`/company/events/${event.id}/cancel`);
                    setCancelling(false);
                }}
                onCancel={() => setCancelling(false)}
            />

            <ConfirmModal
                open={removing !== null}
                tone="danger"
                title="إزالة مشارك"
                message="سيُحرَّر مقعده ويُعرض على أول من في قائمة الانتظار، ويصله إشعار بالإزالة."
                details={
                    removing && (
                        <ConfirmRow
                            label="العضو"
                            value={removing.name}
                            strong
                        />
                    )
                }
                confirmLabel="إزالة"
                onConfirm={() => {
                    router.post(
                        `/company/events/${event.id}/remove-member`,
                        { employee_id: removing?.id },
                        { preserveScroll: true },
                    );
                    setRemoving(null);
                }}
                onCancel={() => setRemoving(null)}
            />
        </CompanyLayout>
    );
}
