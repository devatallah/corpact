import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';

interface ScheduledRate {
    id: number;
    rate_percent: number;
    effective_from: string | null;
    reason: string | null;
}

interface ProviderRow {
    id: number;
    name: string;
    effective_rate_percent: number | null;
    scheduled: ScheduledRate[];
}

interface ScheduledTerm {
    id: number;
    fee_per_activated_employee: string | null;
    monthly_minimum: string | null;
    effective_from: string | null;
    reason: string | null;
}

interface CompanyRow {
    id: number;
    name: string;
    fee_per_activated_employee: string | null;
    monthly_minimum: string | null;
    scheduled: ScheduledTerm[];
}

interface Props {
    providers: ProviderRow[];
    companies: CompanyRow[];
    today: string;
}

export default function FinanceTerms({ providers, companies }: Props) {
    const rateForm = useForm({ partner_id: '', rate_percent: '', effective_from: '', reason: '' });
    const termForm = useForm({
        company_id: '',
        fee_per_activated_employee: '',
        monthly_minimum: '',
        effective_from: '',
        reason: '',
    });

    const input = { padding: '9px 14px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13 };

    return (
        <AdminLayout>
            <Head title="الشروط المالية المستقبلية" />

            <div className="page-title">الشروط المالية المستقبلية</div>
            <div className="page-sub" style={{ marginBottom: 20 }}>
                أي تغيير في نسبة عمولة مزوّد أو في رسوم عقد شركة يسري من تاريخ مستقبلي محدد فقط، ولا يُطبَّق بأثر رجعي:
                كشف قديم أو فاتورة دورة سابقة لا يتغيران أبداً.
            </div>

            <div
                style={{
                    background: '#fff',
                    border: '1px solid #E2E8F4',
                    borderRadius: 16,
                    padding: 22,
                    marginBottom: 20,
                }}
            >
                <div className="card-title">نسب عمولة المزوّدين</div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        rateForm.post('/admin/finance/commission-rates', {
                            preserveScroll: true,
                            onSuccess: () => rateForm.reset(),
                        });
                    }}
                    style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}
                >
                    <select
                        value={rateForm.data.partner_id}
                        onChange={(e) => rateForm.setData('partner_id', e.target.value)}
                        style={input}
                    >
                        <option value="">اختر المزوّد</option>
                        {providers.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <input
                        value={rateForm.data.rate_percent}
                        onChange={(e) => rateForm.setData('rate_percent', e.target.value)}
                        placeholder="النسبة %"
                        style={input}
                    />
                    <input
                        type="date"
                        value={rateForm.data.effective_from}
                        onChange={(e) => rateForm.setData('effective_from', e.target.value)}
                        style={input}
                    />
                    <input
                        value={rateForm.data.reason}
                        onChange={(e) => rateForm.setData('reason', e.target.value)}
                        placeholder="السبب (اختياري)"
                        style={input}
                    />
                    <button type="submit" className="fbtn" disabled={rateForm.processing}>
                        جدولة
                    </button>
                </form>

                {rateForm.errors.effective_from && (
                    <div style={{ color: '#E03050', fontSize: 12, marginBottom: 10 }}>
                        {rateForm.errors.effective_from}
                    </div>
                )}

                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>المزوّد</th>
                            <th>النسبة السارية</th>
                            <th>تغييرات مجدولة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map((p) => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 700 }}>{p.name}</td>
                                <td>{p.effective_rate_percent ?? 'لا نسبة في العقد'}</td>
                                <td style={{ fontSize: 12, color: '#7A8BA8' }}>
                                    {p.scheduled.length === 0
                                        ? '—'
                                        : p.scheduled
                                              .map((s) => `${s.rate_percent}% من ${s.effective_from}`)
                                              .join('، ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 22 }}>
                <div className="card-title">رسوم عقود الشركات</div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        termForm.post('/admin/finance/contract-terms', {
                            preserveScroll: true,
                            onSuccess: () => termForm.reset(),
                        });
                    }}
                    style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}
                >
                    <select
                        value={termForm.data.company_id}
                        onChange={(e) => termForm.setData('company_id', e.target.value)}
                        style={input}
                    >
                        <option value="">اختر الشركة</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <input
                        value={termForm.data.fee_per_activated_employee}
                        onChange={(e) => termForm.setData('fee_per_activated_employee', e.target.value)}
                        placeholder="رسم الموظف المفعّل (ريال)"
                        style={input}
                    />
                    <input
                        value={termForm.data.monthly_minimum}
                        onChange={(e) => termForm.setData('monthly_minimum', e.target.value)}
                        placeholder="الحد الأدنى الشهري (ريال)"
                        style={input}
                    />
                    <input
                        type="date"
                        value={termForm.data.effective_from}
                        onChange={(e) => termForm.setData('effective_from', e.target.value)}
                        style={input}
                    />
                    <button type="submit" className="fbtn" disabled={termForm.processing}>
                        جدولة
                    </button>
                </form>

                {termForm.errors.effective_from && (
                    <div style={{ color: '#E03050', fontSize: 12, marginBottom: 10 }}>
                        {termForm.errors.effective_from}
                    </div>
                )}

                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الشركة</th>
                            <th>رسم الموظف المفعّل</th>
                            <th>الحد الأدنى</th>
                            <th>تغييرات مجدولة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((c) => (
                            <tr key={c.id}>
                                <td style={{ fontWeight: 700 }}>{c.name}</td>
                                <td>{c.fee_per_activated_employee ?? 'غير محدد'}</td>
                                <td>{c.monthly_minimum ?? '—'}</td>
                                <td style={{ fontSize: 12, color: '#7A8BA8' }}>
                                    {c.scheduled.length === 0
                                        ? '—'
                                        : c.scheduled
                                              .map(
                                                  (s) =>
                                                      `${s.fee_per_activated_employee ?? '—'} / ${s.monthly_minimum ?? '—'} من ${s.effective_from}`,
                                              )
                                              .join('، ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
