import CompanyLayout from '@/layouts/company-layout';
import CategoryIcon from '@/components/category-icon';
import { fmtDateTime } from '@/lib/utils';
import type { Community, Wallet, WalletTopupRequest, WalletTransaction } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import toastr from 'toastr';

interface Props {
    wallet: Wallet | null;
    walletData: Record<string, unknown>;
    communities: Community[];
    transactions: WalletTransaction[];
    topupRequests: WalletTopupRequest[];
}

const STATUS_COLORS: Record<string, string> = {
    submitted: '#D4820A',
    under_review: '#3B5BDB',
    approved: '#0CA678',
    rejected: '#E03050',
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F4',
    fontSize: 14, background: '#F0F2F8', outline: 'none', direction: 'rtl',
};

export default function WalletIndex({ wallet, communities, transactions, topupRequests }: Props) {
    const [showTopup, setShowTopup] = useState(false);
    const topupForm = useForm<{
        amount: string;
        transfer_date: string;
        sender_account_last4: string;
        bank_reference: string;
        receipt: File | null;
    }>({ amount: '', transfer_date: '', sender_account_last4: '', bank_reference: '', receipt: null });
    const distForm = useForm({ community_id: communities[0]?.id?.toString() ?? '', amount: '' });
    const [selectedCommunity, setSelectedCommunity] = useState<number | null>(communities[0]?.id ?? null);

    const COLORS = ['#0CA678', '#D4820A', '#5B3FCC', '#3B5BDB', '#E03050', '#8B5CF6'];

    function handleTopup(e: FormEvent) {
        e.preventDefault();
        topupForm.post('/company/wallet/topup', {
            forceFormData: true,
            onSuccess: () => {
                topupForm.reset();
                setShowTopup(false);
                toastr.success('تم رفع طلب الشحن — يُضاف الرصيد بعد اعتماد الأدمن المالي');
            },
        });
    }

    function handleDistribute(e: FormEvent) {
        e.preventDefault();
        distForm.post('/company/wallet/distribute', {
            onSuccess: () => {
                distForm.reset('amount');
                toastr.success('تم تخصيص الرصيد للمجتمع بنجاح');
            },
        });
    }

    function selectCommunity(id: number) {
        setSelectedCommunity(id);
        distForm.setData('community_id', id.toString());
    }

    const topupErrors = Object.values(topupForm.errors);

    return (
        <CompanyLayout>
            <Head title="المحفظة" />

            <div className="page-title">المحفظة والدعم</div>
            <div className="page-sub" style={{ marginBottom: 24 }}>إدارة الميزانية وتخصيص رصيد المجتمعات — كل حركة تُسجَّل في الدفتر</div>

            {/* Balance Card */}
            <div style={{ background: 'linear-gradient(135deg,#1A2035,#252D45)', borderRadius: 20, padding: '24px 28px', marginBottom: 20, color: '#fff' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: 1, marginBottom: 4 }}>رصيد المحفظة المتاح</div>
                <div style={{ fontSize: 40, fontWeight: 900 }}>
                    {(wallet?.balance ?? 0).toLocaleString()} <span style={{ fontSize: 18 }}>ريال</span>
                </div>
                <div style={{ marginTop: 16, textAlign: 'left' }}>
                    <button
                        onClick={() => setShowTopup(!showTopup)}
                        style={{ background: 'rgba(255,255,255,.2)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        + طلب شحن (تحويل بنكي)
                    </button>
                </div>
            </div>

            {/* Bank-transfer top-up request form */}
            {showTopup && (
                <div style={{ background: '#fff', border: '1px solid #3B5BDB44', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>طلب شحن بتحويل بنكي</div>
                    <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 14 }}>
                        حوّل المبلغ إلى حساب تيمات ثم ارفع الطلب — يُضاف الرصيد بعد مطابقة الأدمن المالي واعتماده.
                    </div>
                    <form onSubmit={handleTopup}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 10 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>المبلغ (ريال)</label>
                                <input type="number" min={1} dir="rtl" value={topupForm.data.amount}
                                    onChange={(e) => topupForm.setData('amount', e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>تاريخ التحويل</label>
                                <input type="date" dir="rtl" value={topupForm.data.transfer_date}
                                    onChange={(e) => topupForm.setData('transfer_date', e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>آخر 4 أرقام من حساب المُرسِل</label>
                                <input type="text" maxLength={4} inputMode="numeric" dir="rtl" value={topupForm.data.sender_account_last4}
                                    onChange={(e) => topupForm.setData('sender_account_last4', e.target.value.replace(/\D/g, ''))} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>مرجع العملية</label>
                                <input type="text" dir="rtl" value={topupForm.data.bank_reference}
                                    onChange={(e) => topupForm.setData('bank_reference', e.target.value)} style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>صورة إشعار التحويل (jpg / png / pdf)</label>
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => topupForm.setData('receipt', e.target.files?.[0] ?? null)}
                                style={{ fontSize: 13 }} />
                        </div>
                        <button type="submit" className="ac-btn" disabled={topupForm.processing}>رفع الطلب</button>
                    </form>
                    {topupErrors.length > 0 && (
                        <div style={{ marginTop: 10, padding: 10, background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, fontSize: 13, color: '#E03050', fontWeight: 600 }}>
                            {topupErrors.map((error, i) => <div key={i}>{error}</div>)}
                        </div>
                    )}
                </div>
            )}

            {/* Top-up requests */}
            {topupRequests.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 22, marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>طلبات الشحن</div>
                    {topupRequests.map((request, index) => (
                        <div key={request.id} style={{ padding: '10px 0', ...(index < topupRequests.length - 1 ? { borderBottom: '1px solid #E2E8F4' } : {}) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                                        {request.amount.toLocaleString()} ريال
                                        <span style={{ fontSize: 11, color: '#7A8BA8', fontWeight: 500 }}> — مرجع {request.bank_reference} · حساب ****{request.sender_account_last4}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#7A8BA8' }}>تاريخ التحويل: {request.transfer_date ?? '—'}</div>
                                </div>
                                <span style={{
                                    fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 999,
                                    color: STATUS_COLORS[request.status] ?? '#7A8BA8',
                                    background: `${STATUS_COLORS[request.status] ?? '#7A8BA8'}18`,
                                }}>
                                    {request.status_label}
                                </span>
                            </div>
                            {request.status === 'rejected' && request.rejection_reason && (
                                <div style={{ marginTop: 6, fontSize: 12, color: '#E03050' }}>سبب الرفض: {request.rejection_reason}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Community Allocation */}
            <div style={{ background: '#fff', border: '2px solid #3B5BDB33', borderRadius: 16, padding: 22, marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>تخصيص رصيد لمجتمع</div>
                <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 16 }}>اختر المجتمع وحدد المبلغ — قيد تخصيص من المحفظة الرئيسية إلى محفظة المجتمع الفرعية</div>
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
                                        <span style={{ fontSize: 11, color: '#7A8BA8' }}>
                                            {Number(community.balance ?? 0).toLocaleString()} ر
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
                            تخصيص ←
                        </button>
                    </div>
                    {distForm.errors.amount && (
                        <div style={{ marginTop: 10, padding: 10, background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, fontSize: 13, color: '#E03050', fontWeight: 600 }}>
                            {distForm.errors.amount}
                        </div>
                    )}
                </form>
            </div>

            {/* Ledger */}
            {transactions.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 22 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>دفتر الحركات</div>
                    <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 12 }}>الرصيد = مجموع الحركات — لا تعديل ولا حذف؛ التصحيح بحركة عكسية مرتبطة</div>
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
                                    {tx.type_label}
                                    {tx.note ? ` — ${tx.note}` : ''}
                                </div>
                                <div style={{ fontSize: 11, color: '#7A8BA8' }}>{tx.occurred_at ? fmtDateTime(tx.occurred_at) : ''}</div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: tx.direction === 'credit' ? '#0CA678' : '#E03050' }}>
                                {tx.direction === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} ر
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CompanyLayout>
    );
}
