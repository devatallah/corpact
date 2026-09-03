import AdminLayout from '@/layouts/admin-layout';
import ConfirmModal from '@/components/confirm-modal';
import type { Partner, UnitPriceChange, ProviderReliabilityLogEntry } from '@/types/models';
import { fmtDateTime } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    bankQueue: Partner[];
    priceChanges: UnitPriceChange[];
    recentAdjustments: ProviderReliabilityLogEntry[];
    providers: Partner[];
}

export default function ProvidersOversight({ bankQueue, priceChanges, recentAdjustments, providers }: Props) {
    const [approveBankFor, setApproveBankFor] = useState<Partner | null>(null);
    const adjustForm = useForm({ partner_id: '', delta: '', reason: '' });

    return (
        <AdminLayout>
            <Head title="إشراف المزوّدين" />
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>إشراف المزوّدين</h1>

            {/* طابور اعتماد الحسابات البنكية */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>اعتماد الحسابات البنكية ({bankQueue.length})</div>
                <div style={{ fontSize: 12, color: '#8A7868', marginBottom: 10 }}>
                    الاعتماد يدوي وشرط لأي صرف. أي تغيير بعد الاعتماد يعيد المزوّد إلى هذا الطابور ويُسجَّل حدثاً أمنياً.
                </div>
                {bankQueue.length === 0 && <div style={{ color: '#8A7868', fontSize: 13 }}>لا حسابات بانتظار الاعتماد.</div>}
                {bankQueue.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                            <b>{p.trade_name || p.name}</b>
                            {p.cr_number && <span style={{ fontSize: 12, color: '#8A7868', marginRight: 8 }}>س.ت {p.cr_number}</span>}
                            <div style={{ fontSize: 12, color: '#8A7868', marginTop: 2 }} dir="ltr">{p.bank_iban} · {p.bank_account_holder}</div>
                        </div>
                        <button className="act-btn" style={{ background: '#1A7A4A', color: '#fff', borderColor: '#1A7A4A', padding: '8px 18px', borderRadius: 8 }} onClick={() => setApproveBankFor(p)}>
                            اعتماد الحساب
                        </button>
                    </div>
                ))}
            </div>

            {/* تعديلات الأسعار تحت عقد سعر */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>تعديلات الأسعار — عقود السعر ({priceChanges.length})</div>
                {priceChanges.length === 0 && <div style={{ color: '#8A7868', fontSize: 13 }}>لا تعديلات معلّقة.</div>}
                {priceChanges.map((c) => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontSize: 13 }}>
                            <b>{c.unit?.branch?.partner?.trade_name || c.unit?.branch?.partner?.name}</b> — {c.unit?.name}:
                            <span style={{ margin: '0 6px', color: '#C8410A', textDecoration: 'line-through' }}>{Number(c.old_price).toLocaleString()}</span>
                            ← <b style={{ color: '#1A7A4A' }}>{Number(c.new_price).toLocaleString()} ريال</b>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="act-btn" style={{ background: '#1A7A4A', color: '#fff', borderColor: '#1A7A4A', padding: '6px 14px', borderRadius: 8, fontSize: 12 }}
                                onClick={() => router.post(`/admin/providers/price-changes/${c.id}`, { decision: 'approved' }, { onSuccess: () => toastr.success('اعتُمد السعر') })}>
                                اعتماد
                            </button>
                            <button className="act-btn" style={{ color: '#C8410A', borderColor: '#C8410A', padding: '6px 14px', borderRadius: 8, fontSize: 12 }}
                                onClick={() => router.post(`/admin/providers/price-changes/${c.id}`, { decision: 'rejected' }, { onSuccess: () => toastr.success('رُفض التعديل') })}>
                                رفض
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* تعديل الموثوقية اليدوي */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>تعديل مؤشر الموثوقية يدوياً</div>
                <div style={{ fontSize: 12, color: '#8A7868', marginBottom: 10 }}>
                    أدمن تيمات وحده، بسبب موثَّق إلزامي يُسجَّل في سجل التدقيق. التعديل اليدوي لا يُحتسب عينة.
                </div>
                <div className="frow">
                    <div className="fg">
                        <label>المزوّد</label>
                        <select value={adjustForm.data.partner_id} onChange={(e) => adjustForm.setData('partner_id', e.target.value)}>
                            <option value="">اختر</option>
                            {providers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {(p.trade_name || p.name)} — المؤشر {p.reliability_score} ({p.reliability_samples} عينة)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="fg">
                        <label>التغيير (مثال: −5 أو 5)</label>
                        <input type="number" value={adjustForm.data.delta} onChange={(e) => adjustForm.setData('delta', e.target.value)} />
                        {adjustForm.errors.delta && <div style={{ fontSize: 11, color: '#C8410A' }}>{adjustForm.errors.delta}</div>}
                    </div>
                </div>
                <div className="fg">
                    <label>السبب الموثَّق (إلزامي)</label>
                    <input value={adjustForm.data.reason} onChange={(e) => adjustForm.setData('reason', e.target.value)} />
                    {adjustForm.errors.reason && <div style={{ fontSize: 11, color: '#C8410A' }}>{adjustForm.errors.reason}</div>}
                </div>
                <button
                    className="act-btn"
                    style={{ background: '#1A5FAB', color: '#fff', borderColor: '#1A5FAB', padding: '9px 20px', borderRadius: 8, marginTop: 6 }}
                    disabled={adjustForm.processing || !adjustForm.data.partner_id || !adjustForm.data.delta || !adjustForm.data.reason}
                    onClick={() => adjustForm.post(`/admin/providers/${adjustForm.data.partner_id}/reliability`, { onSuccess: () => { adjustForm.reset(); toastr.success('عُدّل المؤشر وسُجّل السبب'); } })}
                >
                    تطبيق التعديل
                </button>
            </div>

            {/* آخر التعديلات اليدوية */}
            <div className="card">
                <div style={{ fontWeight: 800, marginBottom: 10 }}>آخر التعديلات اليدوية</div>
                {recentAdjustments.length === 0 && <div style={{ color: '#8A7868', fontSize: 13 }}>لا تعديلات يدوية بعد.</div>}
                {recentAdjustments.map((log) => (
                    <div key={log.id} style={{ fontSize: 13, borderBottom: '1px solid rgba(0,0,0,.05)', padding: '8px 0' }}>
                        <b>{log.partner?.trade_name || log.partner?.name}</b>: {log.score_before} ← {log.score_after}
                        <span style={{ color: log.delta > 0 ? '#1A7A4A' : '#C8410A', margin: '0 6px' }}>({log.delta > 0 ? '+' : ''}{log.delta})</span>
                        <span style={{ color: '#8A7868' }}>— {log.note} · {fmtDateTime(log.created_at)}</span>
                    </div>
                ))}
            </div>

            <ConfirmModal
                open={approveBankFor !== null}
                title="اعتماد الحساب البنكي"
                message={approveBankFor ? `سيُعتمد حساب «${approveBankFor.trade_name || approveBankFor.name}» (${approveBankFor.bank_iban}) ويُفتح الصرف له.` : ''}
                onConfirm={() => {
                    if (approveBankFor) {
                        router.post(`/admin/providers/${approveBankFor.id}/bank/approve`, {}, { onSuccess: () => toastr.success('اعتُمد الحساب البنكي') });
                    }
                    setApproveBankFor(null);
                }}
                onCancel={() => setApproveBankFor(null)}
            />
        </AdminLayout>
    );
}
