import PageHeader from '@/components/page-header';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface ItemRow {
    id: number;
    type: string;
    status: string;
    event_id: number;
    event_title: string | null;
    event_date: string | null;
    commission_rate_percent: number | null;
    gross_amount: string;
    commission_amount: string;
    vat_amount: string;
    net_amount: string;
    reason: string | null;
    corrects_item_id: number | null;
}

interface Statement {
    id: number;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: string;
    items_count: number;
    gross_amount: string;
    commission_amount: string;
    vat_amount: string;
    net_amount: string;
    payout_reference: string | null;
    partner: { id: number; name: string } | null;
    payouts_blocked: boolean;
    generated_by: { id: number; name: string } | null;
    approved_by: { id: number; name: string } | null;
    paid_by: { id: number; name: string } | null;
    items: ItemRow[];
}

interface Props {
    statement: Statement;
}

export default function FinanceSettlementShow({ statement }: Props) {
    const [correctFor, setCorrectFor] = useState<number | null>(null);
    const [gross, setGross] = useState('');
    const [rate, setRate] = useState('');
    const [reason, setReason] = useState('');

    function submitCorrection() {
        if (!correctFor || !reason.trim() || gross === '') return;
        router.post(
            `/admin/finance/settlement-items/${correctFor}/correct`,
            { corrected_gross: gross, corrected_rate_percent: rate === '' ? null : rate, reason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCorrectFor(null);
                    setGross('');
                    setRate('');
                    setReason('');
                },
            },
        );
    }

    return (
        <AdminLayout>
            <Head title={`كشف ${statement.period_key}`} />

            <div style={{ marginBottom: 16 }}>
                <Link href="/admin/finance/settlements" style={{ color: '#C87D00', fontWeight: 700 }}>
                    ← كل الكشوف
                </Link>
            </div>

            <PageHeader
                title={<>{statement.partner?.name ?? '—'} · {statement.period_key}</>}
                subtitle={<>
                {statement.period_start} → {statement.period_end} · {statement.items_count} بند · إجمالي{' '}
                {statement.gross_amount} · عمولة {statement.commission_amount} · صافي {statement.net_amount} ريال
                {statement.payout_reference ? ` · مرجع التحويل ${statement.payout_reference}` : ''}
                </>}
            />

            <div style={{ background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 16, padding: 22 }}>
                {statement.items.map((item, index) => (
                    <div
                        key={item.id}
                        style={{
                            padding: '14px 0',
                            ...(index < statement.items.length - 1 ? { borderBottom: '0.5px solid rgba(10,10,10,.1)' } : {}),
                        }}
                    >
                        <div
                            style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
                        >
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800 }}>
                                    {item.event_title ?? `فعالية #${item.event_id}`}
                                    {item.type === 'correction' && (
                                        <span style={{ marginInlineStart: 10, color: '#D9381E' }}>بند تصحيحي</span>
                                    )}
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginTop: 4 }}>
                                    {item.event_date ?? '—'} · إجمالي {item.gross_amount} · نسبة{' '}
                                    {item.commission_rate_percent ?? '—'}% · عمولة {item.commission_amount} (منها
                                    ضريبة {item.vat_amount}) · صافي {item.net_amount} ريال
                                </div>
                                {item.reason && (
                                    <div style={{ fontSize: 11, color: '#D9381E', marginTop: 4 }}>
                                        سبب التصحيح: {item.reason}
                                    </div>
                                )}
                            </div>

                            {item.type === 'event' && item.status !== 'adjusted' && (
                                <button type="button" className="fbtn" onClick={() => setCorrectFor(item.id)}>
                                    تصحيح
                                </button>
                            )}
                        </div>

                        {correctFor === item.id && (
                            <div style={{ marginTop: 12, display: 'grid', gap: 8, maxWidth: 520 }}>
                                <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>
                                    التصحيح ينشئ حركة عكسية + بنداً تصحيحياً في الكشف التالي. السبب إلزامي ويُسجَّل في
                                    سجل التدقيق. لا يُعدَّل أي كشف مدفوع.
                                </div>
                                <input
                                    value={gross}
                                    onChange={(e) => setGross(e.target.value)}
                                    placeholder="الإجمالي الصحيح بالريال (شامل الضريبة)"
                                    style={{ padding: '9px 14px', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)' }}
                                />
                                <input
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    placeholder="نسبة العمولة الصحيحة % (اتركه فارغاً لإبقاء نسبة البند)"
                                    style={{ padding: '9px 14px', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)' }}
                                />
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="سبب التصحيح (إلزامي)"
                                    rows={2}
                                    style={{ padding: '9px 14px', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)' }}
                                />
                                <div>
                                    <button type="button" className="fbtn" onClick={submitCorrection}>
                                        إنشاء البند التصحيحي
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
