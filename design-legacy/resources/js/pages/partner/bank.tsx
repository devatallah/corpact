import PartnerLayout from '@/layouts/partner-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import type { Auth } from '@/types/auth';
import toastr from 'toastr';

interface Props {
    bank: {
        account_holder: string | null;
        iban: string | null;
        status: 'missing' | 'pending' | 'approved';
        approved_at: string | null;
        payouts_blocked: boolean;
    };
}

const statusView: Record<string, { label: string; color: string; hint: string }> = {
    missing: { label: 'لم يُسجَّل حساب', color: '#8A7868', hint: 'سجّل حسابك البنكي — لا صرف قبل تسجيله واعتماده.' },
    pending: { label: 'بانتظار اعتماد تيمات', color: '#B8860A', hint: 'الاعتماد يدوي من أدمن تيمات — الصرف محجوب حتى يكتمل.' },
    approved: { label: 'معتمد — الصرف متاح', color: '#1A7A4A', hint: 'أي تغيير على الحساب يعيد الحالة إلى بانتظار الاعتماد ويحجب الصرف.' },
};

export default function BankAccount({ bank }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const permissions = (auth.partnerPermissions ?? auth.permissions ?? []) as string[];
    const canManage = permissions.includes('bank.manage');

    const form = useForm({
        account_holder: bank.account_holder ?? '',
        iban: bank.iban ?? '',
    });

    const st = statusView[bank.status] ?? statusView.missing;

    return (
        <PartnerLayout>
            <Head title="الحساب البنكي" />
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>الحساب البنكي</h1>

            <div className="card" style={{ borderRight: `4px solid ${st.color}`, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b>حالة الحساب</b>
                    <span className="badge" style={{ background: `${st.color}18`, color: st.color, fontSize: 13 }}>{st.label}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8A7868', marginTop: 6 }}>{st.hint}</div>
                {bank.payouts_blocked && (
                    <div style={{ fontSize: 12, color: '#C8410A', fontWeight: 700, marginTop: 6 }}>
                        الصرف محجوب حالياً — لن تُدفع أي تسوية قبل اعتماد الحساب.
                    </div>
                )}
            </div>

            <div className="card">
                <div className="frow">
                    <div className="fg">
                        <label>اسم صاحب الحساب</label>
                        <input value={form.data.account_holder} onChange={(e) => form.setData('account_holder', e.target.value)} disabled={!canManage} />
                        {form.errors.account_holder && <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{form.errors.account_holder}</div>}
                    </div>
                    <div className="fg">
                        <label>الآيبان (SA…)</label>
                        <input dir="ltr" value={form.data.iban} onChange={(e) => form.setData('iban', e.target.value)} placeholder="SA0000000000000000000000" disabled={!canManage} />
                        {(form.errors as Record<string, string>).iban && <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{(form.errors as Record<string, string>).iban}</div>}
                        {(form.errors as Record<string, string>).bank_iban && <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{(form.errors as Record<string, string>).bank_iban}</div>}
                    </div>
                </div>
                {canManage ? (
                    <button
                        className="act-btn"
                        style={{ background: '#1A5FAB', color: '#fff', borderColor: '#1A5FAB', padding: '10px 22px', borderRadius: 8 }}
                        disabled={form.processing || !form.data.account_holder || !form.data.iban}
                        onClick={() => form.put('/partner/bank', { onSuccess: () => toastr.success('حُفظت بيانات الحساب — بانتظار الاعتماد') })}
                    >
                        {bank.status === 'approved' ? 'حفظ التغيير (سيُعاد الاعتماد)' : 'حفظ وإرسال للاعتماد'}
                    </button>
                ) : (
                    <div style={{ fontSize: 12, color: '#8A7868' }}>ليس لديك صلاحية تعديل الحساب البنكي.</div>
                )}
            </div>
        </PartnerLayout>
    );
}
