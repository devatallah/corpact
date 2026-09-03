import AdminLayout from '@/layouts/admin-layout';
import type { Company } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import toastr from 'toastr';

interface ContractFile {
    id: number;
    original_name: string;
    version: number;
    is_current: boolean;
    size: string;
    created_at: string | null;
}

interface Props {
    company: Company;
    contract: {
        commercial_registration: string | null;
        vat_number: string | null;
        contract_fee_per_activated_employee: string;
        contract_monthly_minimum: string;
        contract_coordinator_service: boolean;
    };
    contractFiles: ContractFile[];
}

export default function CompaniesEdit({ company, contract, contractFiles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: company.name ?? '',
        email: company.email ?? '',
        password: '',
        domain: company.domain ?? '',
        sector: company.sector ?? '',
        employee_count: String(company.employee_count ?? ''),
        contact_name: company.contact_name ?? '',
        city: company.city ?? '',
        status: company.status ?? 'pending',
    });

    // H §16 «الشركات والعقود» + G/أدمن تيمات §1: «سجّل العقد: رسوم النظام لكل
    // موظف مفعّل، والحد الأدنى الشهري، وخدمة المنسّق إن وُجدت» + الرقم الضريبي
    // الذي تحتاجه الفاتورة (H §12.9). الأعمدة كانت جاهزة بلا واجهة إدخال.
    const contractForm = useForm({
        commercial_registration: contract?.commercial_registration ?? '',
        vat_number: contract?.vat_number ?? '',
        contract_fee_per_activated_employee: contract?.contract_fee_per_activated_employee ?? '',
        contract_monthly_minimum: contract?.contract_monthly_minimum ?? '',
        contract_coordinator_service: contract?.contract_coordinator_service ?? false,
        contract_file: null as File | null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/companies/${company.id}`);
    }

    function submitContract(e: React.FormEvent) {
        e.preventDefault();
        contractForm.put(`/admin/companies/${company.id}/contract`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toastr.success('حُفظت بيانات العقد.'),
        });
    }

    return (
        <AdminLayout>
            <Head title={`تعديل: ${company.name}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href="/admin/companies" style={{ color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontSize: '14px' }}>
                    ← الشركات
                </Link>
                <span style={{ color: '#0A0A0A' }}>/</span>
                <span style={{ color: '#0A0A0A', fontWeight: 700 }}>تعديل: {company.name}</span>
            </div>

            {Object.keys(errors).length > 0 && (
                <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                    {Object.values(errors).map((error, i) => (
                        <p key={i} style={{ fontSize: '12px', color: '#D9381E', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>تعديل بيانات الشركة</div>
                <form onSubmit={submit}>
                    <div className="frow">
                        <div className="fg">
                            <label>اسم الشركة *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="مثال: شركة التقنية المتقدمة"
                                required
                            />
                        </div>
                        <div className="fg">
                            <label>المسؤول</label>
                            <input
                                type="text"
                                value={data.contact_name}
                                onChange={(e) => setData('contact_name', e.target.value)}
                                placeholder="اسم مسؤول الحساب"
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>البريد الإلكتروني *</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="info@company.sa"
                                dir="ltr"
                                required
                            />
                        </div>
                        <div className="fg">
                            <label>النطاق *</label>
                            <input
                                type="text"
                                value={data.domain}
                                onChange={(e) => setData('domain', e.target.value)}
                                placeholder="company.sa"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>القطاع *</label>
                            <input
                                type="text"
                                value={data.sector}
                                onChange={(e) => setData('sector', e.target.value)}
                                placeholder="تقنية المعلومات"
                            />
                        </div>
                        <div className="fg">
                            <label>المدينة *</label>
                            <input
                                type="text"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                placeholder="الرياض"
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>عدد الموظفين *</label>
                            <input
                                type="number"
                                value={data.employee_count}
                                onChange={(e) => setData('employee_count', e.target.value)}
                                placeholder="50"
                                min={1}
                            />
                        </div>
                        <div className="fg">
                            <label>الحالة</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="pending">معلق</option>
                                <option value="review">قيد المراجعة</option>
                                <option value="active">نشط</option>
                                <option value="rejected">مرفوض</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                        <button
                            type="submit"
                            disabled={processing}
                            className="act-btn btn-approve"
                            style={{ flex: 1, padding: '12px' }}
                        >
                            حفظ التعديلات
                        </button>
                        <Link
                            href="/admin/companies"
                            style={{ padding: '12px 24px', background: 'rgba(10,10,10,.1)', borderRadius: '10px', color: 'rgba(10,10,10,.55)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>

            <div className="card" style={{ maxWidth: '600px', marginTop: 20 }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>العقد والرقم الضريبي</div>
                <p style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', lineHeight: 1.9, marginTop: 0 }}>
                    أي تغيير في رسوم عقد شركة يسري <b>من تاريخ مستقبلي محدد فقط</b> ولا يُطبَّق بأثر رجعي — الجدولة
                    المؤرَّخة من شاشة «شروط العقود». هذه القيم هي عقد الأساس، وكل تعديل يُسجَّل في سجل التدقيق.
                </p>

                {Object.keys(contractForm.errors).length > 0 && (
                    <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                        {Object.values(contractForm.errors).map((error, i) => (
                            <p key={i} style={{ fontSize: '12px', color: '#D9381E', margin: '0 0 4px' }}>{error}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={submitContract}>
                    <div className="frow">
                        <div className="fg">
                            <label>السجل التجاري</label>
                            <input
                                type="text"
                                dir="ltr"
                                value={contractForm.data.commercial_registration}
                                onChange={(e) => contractForm.setData('commercial_registration', e.target.value)}
                                placeholder="1010XXXXXX"
                            />
                        </div>
                        <div className="fg">
                            <label>الرقم الضريبي (15 رقماً)</label>
                            <input
                                type="text"
                                dir="ltr"
                                value={contractForm.data.vat_number}
                                onChange={(e) => contractForm.setData('vat_number', e.target.value)}
                                placeholder="3XXXXXXXXXXXXX3"
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>رسوم النظام لكل موظف مفعّل (ريال)</label>
                            <input
                                type="text"
                                dir="ltr"
                                value={contractForm.data.contract_fee_per_activated_employee}
                                onChange={(e) => contractForm.setData('contract_fee_per_activated_employee', e.target.value)}
                                placeholder="لا افتراض — القيمة من العقد"
                            />
                        </div>
                        <div className="fg">
                            <label>الحد الأدنى الشهري (ريال)</label>
                            <input
                                type="text"
                                dir="ltr"
                                value={contractForm.data.contract_monthly_minimum}
                                onChange={(e) => contractForm.setData('contract_monthly_minimum', e.target.value)}
                                placeholder="لا افتراض — القيمة من العقد"
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={contractForm.data.contract_coordinator_service}
                                    onChange={(e) => contractForm.setData('contract_coordinator_service', e.target.checked)}
                                    style={{ marginInlineEnd: 8 }}
                                />
                                خدمة المنسّق المُدار مشمولة في العقد
                            </label>
                        </div>
                        <div className="fg">
                            <label>ملف العقد (pdf — حتى 10MB)</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => contractForm.setData('contract_file', e.target.files?.[0] ?? null)}
                            />
                        </div>
                    </div>

                    {contractFiles.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginBottom: 6 }}>
                                نسخ العقد المحفوظة — الاستبدال ينشئ نسخة جديدة وتبقى القديمة، ولا حذف نهائي
                            </div>
                            <table className="portal-table">
                                <thead>
                                    <tr>
                                        <th>النسخة</th>
                                        <th>الملف</th>
                                        <th>الحجم</th>
                                        <th>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contractFiles.map((file) => (
                                        <tr key={file.id}>
                                            <td>v{file.version}</td>
                                            <td dir="ltr" style={{ fontSize: 12 }}>{file.original_name}</td>
                                            <td dir="ltr" style={{ fontSize: 12 }}>{file.size}</td>
                                            <td style={{ fontSize: 12, color: file.is_current ? '#2E7D32' : 'rgba(10,10,10,.55)' }}>
                                                {file.is_current ? 'النسخة السارية' : 'نسخة سابقة (محفوظة)'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div style={{ marginTop: 20 }}>
                        <button type="submit" disabled={contractForm.processing} className="act-btn btn-approve" style={{ padding: '12px 24px' }}>
                            حفظ بيانات العقد
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
