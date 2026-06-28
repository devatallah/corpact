import BusinessLayout from '@/layouts/business-layout';
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
            color: '#EF4444',
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
        <BusinessLayout>
            <Head title={`تسوية #${settlement.id}`} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/business/settlements" style={{ color: '#999', textDecoration: 'none', fontSize: 14 }}>← التسويات</Link>
                <span style={{ color: '#EBEBEB' }}>/</span>
                <span style={{ fontWeight: 700, color: '#0A0A0A' }}>تسوية #{settlement.id}</span>
            </div>

            <div className="card" style={{ maxWidth: 600, padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A' }}>تفاصيل التسوية</div>
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
                                borderBottom: i < rows.length - 1 ? '1px solid #EBEBEB' : undefined,
                            }}
                        >
                            <span style={{ fontSize: 13, color: '#999' }}>{row.label}</span>
                            <span
                                style={{
                                    fontSize: row.highlight ? 16 : 13,
                                    fontWeight: row.highlight ? 900 : 600,
                                    color: row.highlight ? '#18A86B' : row.color ?? '#0A0A0A',
                                }}
                            >
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 24 }}>
                    <Link
                        href="/business/settlements"
                        className="btn btn-outline btn-full"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: 12,
                            textDecoration: 'none',
                        }}
                    >
                        العودة للتسويات
                    </Link>
                </div>
            </div>
        </BusinessLayout>
    );
}
