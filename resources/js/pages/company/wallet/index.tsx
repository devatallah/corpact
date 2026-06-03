import CompanyLayout from '@/layouts/company-layout';
import CategoryIcon from '@/components/category-icon';
import { fmtDateTime } from '@/lib/utils';
import type { Community, Wallet, WalletTransaction } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import toastr from 'toastr';

interface Props {
    wallet: Wallet | null;
    walletData: Record<string, unknown>;
    communities: Community[];
    transactions: WalletTransaction[];
}

export default function WalletIndex({ wallet, communities, transactions }: Props) {
    const [showCharge, setShowCharge] = useState(false);
    const chargeForm = useForm({ amount: '' });
    const distForm = useForm({ community_id: communities[0]?.id?.toString() ?? '', amount: '' });
    const [selectedCommunity, setSelectedCommunity] = useState<number | null>(communities[0]?.id ?? null);

    const COLORS = ['#0CA678', '#D4820A', '#5B3FCC', '#3B5BDB', '#E03050', '#8B5CF6'];

    function handleCharge(e: FormEvent) {
        e.preventDefault();
        chargeForm.post('/company/wallet/charge', {
            onSuccess: () => {
                chargeForm.reset();
                setShowCharge(false);
                toastr.success('تم شحن الرصيد بنجاح');
            },
        });
    }

    function handleDistribute(e: FormEvent) {
        e.preventDefault();
        distForm.post('/company/wallet/distribute', {
            onSuccess: () => {
                distForm.reset('amount');
                toastr.success('تم شحن رصيد المجتمع بنجاح');
            },
        });
    }

    function selectCommunity(id: number) {
        setSelectedCommunity(id);
        distForm.setData('community_id', id.toString());
    }

    return (
        <CompanyLayout>
            <Head title="المحفظة" />

            <div className="page-title">المحفظة والدعم</div>
            <div className="page-sub" style={{ marginBottom: 24 }}>إدارة الميزانية وشحن رصيد المجتمعات</div>

            {/* Balance Card */}
            <div style={{ background: 'linear-gradient(135deg,#1A2035,#252D45)', borderRadius: 20, padding: '24px 28px', marginBottom: 20, color: '#fff' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: 1, marginBottom: 4 }}>رصيد المحفظة المتاح</div>
                <div style={{ fontSize: 40, fontWeight: 900 }}>
                    {(wallet?.balance ?? 0).toLocaleString()} <span style={{ fontSize: 18 }}>ريال</span>
                </div>
                <div style={{ marginTop: 16, textAlign: 'left' }}>
                    <button
                        onClick={() => setShowCharge(!showCharge)}
                        style={{ background: 'rgba(255,255,255,.2)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        + شحن رصيد
                    </button>
                </div>
            </div>

            {/* Charge Form */}
            {showCharge && (
                <div style={{ background: '#fff', border: '1px solid #3B5BDB44', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>شحن رصيد جديد</div>
                    <form onSubmit={handleCharge} style={{ display: 'flex', gap: 10 }}>
                        <input
                            type="number"
                            placeholder="المبلغ..."
                            dir="rtl"
                            value={chargeForm.data.amount}
                            onChange={(e) => chargeForm.setData('amount', e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 14, background: '#F0F2F8', outline: 'none', direction: 'rtl' }}
                        />
                        <button type="submit" className="ac-btn" disabled={chargeForm.processing}>شحن</button>
                    </form>
                    {chargeForm.errors.amount && (
                        <div style={{ marginTop: 10, padding: 10, background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, fontSize: 13, color: '#E03050', fontWeight: 600 }}>
                            {chargeForm.errors.amount}
                        </div>
                    )}
                </div>
            )}

            {/* Community Distribution */}
            <div style={{ background: '#fff', border: '2px solid #3B5BDB33', borderRadius: 16, padding: 22, marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>شحن رصيد مجتمع</div>
                <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 16 }}>اختر المجتمع وحدد المبلغ — يُخصم من المحفظة ويُضاف للمجتمع</div>
                <form onSubmit={handleDistribute}>
                    {communities.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#7A8BA8' }}>لا توجد مجتمعات</div>
                    ) : (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                            {communities.map((community, index) => {
                                const color = community.color ?? COLORS[index % COLORS.length];
                                const isSelected = selectedCommunity === community.id;

                                return (
                                    <div
                                        key={community.id}
                                        onClick={() => selectCommunity(community.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                                            border: `2px solid ${isSelected ? color : '#E2E8F4'}`,
                                            background: isSelected ? `${color}12` : '#F0F2F8',
                                        }}
                                    >
                                        <CategoryIcon icon={community.category?.icon} size={20} />
                                        <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? color : '#4A5C78' }}>
                                            {community.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                            type="number"
                            placeholder="المبلغ..."
                            dir="rtl"
                            value={distForm.data.amount}
                            onChange={(e) => distForm.setData('amount', e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 15, fontWeight: 700, background: '#F0F2F8', outline: 'none', direction: 'rtl' }}
                        />
                        <button type="submit" className="ac-btn" disabled={distForm.processing}>
                            شحن ←
                        </button>
                    </div>
                    {distForm.errors.amount && (
                        <div style={{ marginTop: 10, padding: 10, background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, fontSize: 13, color: '#E03050', fontWeight: 600 }}>
                            {distForm.errors.amount}
                        </div>
                    )}
                </form>
            </div>

            {/* Transactions */}
            {transactions.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 22 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>آخر العمليات</div>
                    {transactions.map((tx, index) => (
                        <div
                            key={tx.id}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 0',
                                ...(index < transactions.length - 1 ? { borderBottom: '1px solid #E2E8F4' } : {}),
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>
                                    {tx.type === 'credit' ? 'شحن رصيد' : 'صرف لمجتمع'}
                                    {tx.community ? ` \u2014 ${tx.community.name}` : ''}
                                </div>
                                <div style={{ fontSize: 11, color: '#7A8BA8' }}>{fmtDateTime(tx.created_at)}</div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: tx.type === 'credit' ? '#0CA678' : '#E03050' }}>
                                {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} ر
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CompanyLayout>
    );
}
