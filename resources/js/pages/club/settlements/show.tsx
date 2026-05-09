import ClubLayout from '@/layouts/club-layout';
import StatusBadge from '@/components/status-badge';
import type { Settlement } from '@/types/models';
import { fmtDateTime } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface Props {
    settlement: Settlement;
}

export default function SettlementShow({ settlement }: Props) {
    const rows: { label: string; value: string; highlight?: boolean; color?: string }[] = [
        {
            label: 'رقم التسوية',
            value: `#${settlement.id}`,
        },
        {
            label: 'المبلغ الإجمالي',
            value: `${(settlement.gross_amount ?? 0).toLocaleString()} ر`,
        },
    ];

    if (settlement.commission_amount) {
        rows.push({
            label: 'العمولة',
            value: `-${settlement.commission_amount.toLocaleString()} ر`,
            color: '#C8410A',
        });
    }

    rows.push({
        label: 'صافي المبلغ',
        value: `${(settlement.net_amount ?? 0).toLocaleString()} ر`,
        highlight: true,
    });

    rows.push({
        label: 'تاريخ الإنشاء',
        value: fmtDateTime(settlement.created_at) || '-',
    });

    if (settlement.paid_at) {
        rows.push({
            label: 'تاريخ الدفع',
            value: fmtDateTime(settlement.paid_at),
        });
    }

    return (
        <ClubLayout>
            <Head title={`تسوية #${settlement.id}`} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/club/settlements" style={{ color: '#8A7868', textDecoration: 'none', fontSize: 14 }}>← التسويات</Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700 }}>تسوية #{settlement.id}</span>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 32, maxWidth: 600 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>تفاصيل التسوية</div>
                    <StatusBadge status={settlement.status} />
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                    {rows.map((row, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 0',
                                borderBottom: i < rows.length - 1 ? '1px solid #E2E8F4' : undefined,
                            }}
                        >
                            <span style={{ fontSize: 13, color: '#7A8BA8' }}>{row.label}</span>
                            <span
                                style={{
                                    fontSize: row.highlight ? 16 : 13,
                                    fontWeight: row.highlight ? 900 : 600,
                                    color: row.highlight ? '#1A7A4A' : row.color ?? undefined,
                                }}
                            >
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 24 }}>
                    <Link
                        href="/club/settlements"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: 12,
                            background: '#E2E8F4',
                            borderRadius: 10,
                            color: '#4A5C78',
                            fontSize: 14,
                            fontWeight: 700,
                            textDecoration: 'none',
                        }}
                    >
                        العودة للتسويات
                    </Link>
                </div>
            </div>
        </ClubLayout>
    );
}
