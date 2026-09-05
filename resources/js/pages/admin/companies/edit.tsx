import { Head, useForm } from '@inertiajs/react';
import { Building2, FileText, Upload } from 'lucide-react';
import { BackLink, ListStates } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
    Note,
    PageHeader,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import { companyStatus } from '@/lib/status';
import type { SupportAgent } from '@/types';

/**
 * H §16 — الشركة وعقدها.
 *
 * Two forms on purpose: the company record and the *contract*. The contract
 * fields drive the monthly invoice, and every contract file version is kept —
 * nothing is ever deleted from the contract history (H §19), so a superseded
 * PDF stays readable next to the one that replaced it.
 */
type Company = {
    id: number;
    name: string;
    email: string;
    domain: string | null;
    sector: string | null;
    city: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    status: string;
    event_creation_blocked_at: string | null;
    event_creation_block_reason: string | null;
    support_agent_user_id: number | null;
};

type ContractFile = {
    id: number;
    original_name: string;
    version: number;
    is_current: boolean;
    size: string;
    created_at: string | null;
};

export default function EditCompany({
    company,
    contract,
    contractFiles,
    supportAgents,
}: {
    company: Company;
    supportAgents: SupportAgent[];
    contract: {
        commercial_registration: string | null;
        vat_number: string | null;
        contract_fee_per_activated_employee: string;
        contract_monthly_minimum: string;
        contract_coordinator_service: boolean;
    };
    contractFiles: ContractFile[];
}) {
    const profile = useForm({
        name: company.name,
        email: company.email,
        password: '',
        domain: company.domain ?? '',
        sector: company.sector ?? '',
        city: company.city ?? '',
        contact_name: company.contact_name ?? '',
        contact_phone: company.contact_phone ?? '',
        status: company.status,
        support_agent_user_id: company.support_agent_user_id
            ? String(company.support_agent_user_id)
            : '',
    });

    const terms = useForm<{
        commercial_registration: string;
        vat_number: string;
        contract_fee_per_activated_employee: string;
        contract_monthly_minimum: string;
        contract_coordinator_service: boolean;
        contract_file: File | null;
    }>({
        commercial_registration: contract.commercial_registration ?? '',
        vat_number: contract.vat_number ?? '',
        contract_fee_per_activated_employee:
            contract.contract_fee_per_activated_employee,
        contract_monthly_minimum: contract.contract_monthly_minimum,
        contract_coordinator_service: contract.contract_coordinator_service,
        contract_file: null,
    });

    return (
        <AdminLayout>
            <Head title={company.name} />

            <BackLink href="/admin/companies" label="العودة إلى الشركات" />

            <PageHeader
                icon={Building2}
                title={company.name}
                subtitle={company.email}
                actions={
                    <Badge tone={companyStatus(company.status).tone}>
                        {companyStatus(company.status).label}
                    </Badge>
                }
            />

            {company.event_creation_blocked_at && (
                <Note
                    tone="danger"
                    title="إنشاء الفعاليات موقوف على هذه الشركة"
                >
                    {company.event_creation_block_reason ??
                        'مستحق متأخر على الحساب. يُرفع الحجب تلقائياً عند تسجيل السداد.'}
                </Note>
            )}

            {/* ── بيانات الشركة ── */}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    profile.put(`/admin/companies/${company.id}`, {
                        preserveScroll: true,
                    });
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات الشركة">
                    <FormGrid>
                        <Field
                            label="اسم الشركة"
                            htmlFor="edit-name"
                            required
                            error={profile.errors.name}
                        >
                            <input
                                id="edit-name"
                                type="text"
                                required
                                value={profile.data.name}
                                onChange={(event) =>
                                    profile.setData('name', event.target.value)
                                }
                                className={INPUT}
                            />
                        </Field>

                        <Field
                            label="البريد الإلكتروني"
                            htmlFor="edit-email"
                            error={profile.errors.email}
                        >
                            <input
                                id="edit-email"
                                type="email"
                                dir="ltr"
                                value={profile.data.email}
                                onChange={(event) =>
                                    profile.setData('email', event.target.value)
                                }
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field
                            label="القطاع"
                            htmlFor="edit-sector"
                            error={profile.errors.sector}
                        >
                            <input
                                id="edit-sector"
                                type="text"
                                value={profile.data.sector}
                                onChange={(event) =>
                                    profile.setData(
                                        'sector',
                                        event.target.value,
                                    )
                                }
                                className={INPUT}
                            />
                        </Field>

                        <Field
                            label="المدينة"
                            htmlFor="edit-city"
                            error={profile.errors.city}
                        >
                            <input
                                id="edit-city"
                                type="text"
                                value={profile.data.city}
                                onChange={(event) =>
                                    profile.setData('city', event.target.value)
                                }
                                className={INPUT}
                            />
                        </Field>

                        <Field
                            label="نطاق البريد"
                            htmlFor="edit-domain"
                            error={profile.errors.domain}
                        >
                            <input
                                id="edit-domain"
                                type="text"
                                dir="ltr"
                                value={profile.data.domain}
                                onChange={(event) =>
                                    profile.setData(
                                        'domain',
                                        event.target.value,
                                    )
                                }
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field
                            label="حالة الشركة"
                            htmlFor="edit-status"
                            error={profile.errors.status}
                        >
                            <select
                                id="edit-status"
                                value={profile.data.status}
                                onChange={(event) =>
                                    profile.setData(
                                        'status',
                                        event.target.value,
                                    )
                                }
                                className={`${INPUT} cursor-pointer`}
                            >
                                <option value="pending">طلب جديد</option>
                                <option value="review">قيد المراجعة</option>
                                <option value="active">مفعّلة</option>
                                <option value="rejected">مرفوضة</option>
                            </select>
                        </Field>

                        <Field
                            label="وكيل الدعم المتابع"
                            htmlFor="c-support"
                            hint="من يتابع هذه الشركة داخل فريق الدعم. حقل تنظيمي — لا يمنح صلاحية ولا يمنعها."
                            error={profile.errors.support_agent_user_id}
                        >
                            <select
                                id="c-support"
                                value={profile.data.support_agent_user_id}
                                onChange={(event) =>
                                    profile.setData(
                                        'support_agent_user_id',
                                        event.target.value,
                                    )
                                }
                                className={`${INPUT} cursor-pointer`}
                            >
                                <option value="">— بلا وكيل متابع —</option>
                                {supportAgents.map((agent) => (
                                    <option
                                        key={agent.id}
                                        value={String(agent.id)}
                                    >
                                        {agent.name} · {agent.companies} شركة
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection
                    title="مسؤول الحساب"
                    hint="الجوال هنا هو هوية الدخول لبوابة الشركة."
                >
                    <FormGrid>
                        <Field
                            label="الاسم"
                            htmlFor="edit-contact"
                            error={profile.errors.contact_name}
                        >
                            <input
                                id="edit-contact"
                                type="text"
                                value={profile.data.contact_name}
                                onChange={(event) =>
                                    profile.setData(
                                        'contact_name',
                                        event.target.value,
                                    )
                                }
                                className={INPUT}
                            />
                        </Field>

                        <Field
                            label="رقم الجوال"
                            htmlFor="edit-phone"
                            error={profile.errors.contact_phone}
                        >
                            <input
                                id="edit-phone"
                                type="tel"
                                dir="ltr"
                                value={profile.data.contact_phone}
                                onChange={(event) =>
                                    profile.setData(
                                        'contact_phone',
                                        event.target.value,
                                    )
                                }
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field
                            label="كلمة مرور جديدة"
                            htmlFor="edit-password"
                            hint="اتركها فارغة للإبقاء عليها"
                            error={profile.errors.password}
                        >
                            <input
                                id="edit-password"
                                type="password"
                                autoComplete="new-password"
                                value={profile.data.password}
                                onChange={(event) =>
                                    profile.setData(
                                        'password',
                                        event.target.value,
                                    )
                                }
                                className={INPUT}
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormActions cancelHref="/admin/companies">
                    <Button type="submit" disabled={profile.processing}>
                        حفظ بيانات الشركة
                    </Button>
                </FormActions>
            </form>

            {/* ── شروط العقد ── */}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    terms.post(`/admin/companies/${company.id}/contract`, {
                        preserveScroll: true,
                        forceFormData: true,
                        headers: { 'X-HTTP-Method-Override': 'PUT' },
                    });
                }}
                className="space-y-6"
            >
                <FormSection
                    title="شروط العقد والفوترة"
                    hint="هذه القيم تُبنى عليها الفاتورة الشهرية. شركة بلا رسم موظف مفعّل لا تدخل دورة الفوترة."
                >
                    <FormGrid>
                        <Field
                            label="رسم الموظف المفعّل"
                            htmlFor="terms-fee"
                            hint="بالريال، شهرياً لكل موظف"
                            error={
                                terms.errors.contract_fee_per_activated_employee
                            }
                        >
                            <input
                                id="terms-fee"
                                type="number"
                                step="0.01"
                                min={0}
                                value={
                                    terms.data
                                        .contract_fee_per_activated_employee
                                }
                                onChange={(event) =>
                                    terms.setData(
                                        'contract_fee_per_activated_employee',
                                        event.target.value,
                                    )
                                }
                                className={`${INPUT} font-mono`}
                            />
                        </Field>

                        <Field
                            label="الحد الأدنى الشهري"
                            htmlFor="terms-minimum"
                            hint="يُكمَّل الفرق إن قلّت الرسوم عنه"
                            error={terms.errors.contract_monthly_minimum}
                        >
                            <input
                                id="terms-minimum"
                                type="number"
                                step="0.01"
                                min={0}
                                value={terms.data.contract_monthly_minimum}
                                onChange={(event) =>
                                    terms.setData(
                                        'contract_monthly_minimum',
                                        event.target.value,
                                    )
                                }
                                className={`${INPUT} font-mono`}
                            />
                        </Field>

                        <Field
                            label="السجل التجاري"
                            htmlFor="terms-cr"
                            error={terms.errors.commercial_registration}
                        >
                            <input
                                id="terms-cr"
                                type="text"
                                dir="ltr"
                                value={terms.data.commercial_registration}
                                onChange={(event) =>
                                    terms.setData(
                                        'commercial_registration',
                                        event.target.value,
                                    )
                                }
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field
                            label="الرقم الضريبي"
                            htmlFor="terms-vat"
                            hint="١٥ رقماً يبدأ وينتهي بالرقم ٣"
                            error={terms.errors.vat_number}
                        >
                            <input
                                id="terms-vat"
                                type="text"
                                dir="ltr"
                                value={terms.data.vat_number}
                                onChange={(event) =>
                                    terms.setData(
                                        'vat_number',
                                        event.target.value,
                                    )
                                }
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field
                            label="ملف العقد (PDF)"
                            htmlFor="terms-file"
                            error={terms.errors.contract_file}
                        >
                            <input
                                id="terms-file"
                                type="file"
                                accept="application/pdf"
                                onChange={(event) =>
                                    terms.setData(
                                        'contract_file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                                className={`${INPUT} cursor-pointer`}
                            />
                        </Field>

                        <div className="flex items-end pb-2">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-ink">
                                <input
                                    type="checkbox"
                                    checked={
                                        terms.data.contract_coordinator_service
                                    }
                                    onChange={(event) =>
                                        terms.setData(
                                            'contract_coordinator_service',
                                            event.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 cursor-pointer accent-lime"
                                />
                                خدمة المنسّق المُدار مفعّلة
                            </label>
                        </div>
                    </FormGrid>
                </FormSection>

                <FormActions cancelHref="/admin/companies">
                    <Button
                        type="submit"
                        icon={Upload}
                        disabled={terms.processing}
                    >
                        حفظ شروط العقد
                    </Button>
                </FormActions>
            </form>

            {/* ── نسخ العقد ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">
                        نسخ ملف العقد
                    </h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>الملف</Th>
                        <Th>النسخة</Th>
                        <Th>الحجم</Th>
                        <Th>رُفع في</Th>
                    </Thead>
                    <Tbody>
                        {contractFiles.map((file) => (
                            <Tr key={file.id}>
                                <Td>
                                    <span className="font-bold text-ink">
                                        {file.original_name}
                                    </span>
                                    {file.is_current && (
                                        <Badge tone="success">
                                            النسخة السارية
                                        </Badge>
                                    )}
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    v{file.version}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {file.size}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {file.created_at
                                        ? new Date(
                                              file.created_at,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={contractFiles.length}
                            colSpan={4}
                            empty="لا نسخ عقد مرفوعة."
                            emptyHint="ارفع نسخة PDF من العقد الموقّع لحفظها في السجل."
                        />
                    </Tbody>
                </TableShell>

                <Note title="لماذا تبقى النسخ القديمة؟">
                    نسخة العقد دليل تعاقدي على فترة فوترة مضت. حذفها يعني فقدان
                    المرجع الذي حُسبت عليه فواتير صادرة فعلاً — لذلك ترفع نسخة
                    جديدة ولا تُستبدل القديمة أبداً.
                </Note>
            </Card>
        </AdminLayout>
    );
}
