import { Head, useForm } from '@inertiajs/react';
import { CalendarClock, Ruler } from 'lucide-react';
import { useState } from 'react';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Field, INPUT, Note, PageHeader, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §12.9 — شروط العقود المجدولة.
 *
 * Terms are never edited in place and never take effect today: a rate change
 * is *scheduled* from a future date, and everything already invoiced or
 * settled keeps the terms it was computed under. That is the whole point —
 * «لا تغيير بأثر رجعي» — so the form refuses today's date at the server.
 */
type Provider = {
    id: number;
    name: string;
    effective_rate_percent: number | null;
    scheduled: { id: number; rate_percent: number; effective_from: string | null; reason: string | null }[];
};

type CompanyTerms = {
    id: number;
    name: string;
    fee_per_activated_employee: string | null;
    monthly_minimum: string | null;
    scheduled: {
        id: number;
        fee_per_activated_employee: string | null;
        monthly_minimum: string | null;
        effective_from: string | null;
        reason: string | null;
    }[];
};

export default function FinanceTerms({
    providers,
    companies,
    today,
}: {
    providers: Provider[];
    companies: CompanyTerms[];
    today: string;
}) {
    const [tab, setTab] = useState<'providers' | 'companies'>('providers');

    const rateForm = useForm({ partner_id: '', rate_percent: '', effective_from: '', reason: '' });
    const termsForm = useForm({ company_id: '', fee_per_activated_employee: '', monthly_minimum: '', effective_from: '', reason: '' });

    return (
        <AdminLayout>
            <Head title="شروط العقود" />

            <PageHeader
                icon={Ruler}
                title="شروط العقود المجدولة"
                subtitle="نسب عمولة المزوّدين ورسوم عقود الشركات. كل تغيير يُجدوَل لتاريخ مستقبلي ولا يمسّ ما صدر."
            />

            <Note tone="warning" title="لا تغيير بأثر رجعي">
                الفواتير والكشوف الصادرة تبقى محسوبة بالشروط التي كانت سارية وقت احتسابها. لذلك تاريخ السريان يجب أن يكون بعد
                اليوم ({today}) — لا يمكن تعديل الماضي.
            </Note>

            <div className="flex items-center gap-2">
                <Button tone={tab === 'providers' ? 'ink' : 'soft'} onClick={() => setTab('providers')}>
                    عمولة المزوّدين
                </Button>
                <Button tone={tab === 'companies' ? 'ink' : 'soft'} onClick={() => setTab('companies')}>
                    عقود الشركات
                </Button>
            </div>

            {tab === 'providers' ? (
                <>
                    <Card padding="p-4" className="space-y-4">
                        <h2 className="text-sm font-extrabold text-ink">جدولة نسبة عمولة جديدة</h2>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                rateForm.post('/admin/finance/commission-rates', {
                                    preserveScroll: true,
                                    onSuccess: () => rateForm.reset(),
                                });
                            }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <Field label="المزوّد" htmlFor="rate-partner" required error={rateForm.errors.partner_id}>
                                    <select
                                        id="rate-partner"
                                        required
                                        value={rateForm.data.partner_id}
                                        onChange={(event) => rateForm.setData('partner_id', event.target.value)}
                                        className={`${INPUT} cursor-pointer`}
                                    >
                                        <option value="">اختر المزوّد…</option>
                                        {providers.map((provider) => (
                                            <option key={provider.id} value={provider.id}>
                                                {provider.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="النسبة الجديدة" htmlFor="rate-percent" required error={rateForm.errors.rate_percent}>
                                    <input
                                        id="rate-percent"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        max={100}
                                        required
                                        value={rateForm.data.rate_percent}
                                        onChange={(event) => rateForm.setData('rate_percent', event.target.value)}
                                        className={`${INPUT} font-mono`}
                                    />
                                </Field>
                                <Field
                                    label="تسري من"
                                    htmlFor="rate-from"
                                    required
                                    hint="تاريخ مستقبلي"
                                    error={rateForm.errors.effective_from}
                                >
                                    <input
                                        id="rate-from"
                                        type="date"
                                        required
                                        value={rateForm.data.effective_from}
                                        onChange={(event) => rateForm.setData('effective_from', event.target.value)}
                                        className={INPUT}
                                    />
                                </Field>
                                <Field label="السبب" htmlFor="rate-reason">
                                    <input
                                        id="rate-reason"
                                        type="text"
                                        value={rateForm.data.reason}
                                        onChange={(event) => rateForm.setData('reason', event.target.value)}
                                        className={INPUT}
                                    />
                                </Field>
                            </div>

                            <Button type="submit" disabled={rateForm.processing}>
                                جدولة النسبة
                            </Button>
                        </form>
                    </Card>

                    <Card padding="p-4" className="space-y-4">
                        <h2 className="text-sm font-extrabold text-ink">النسب السارية والمجدولة</h2>

                        <TableShell>
                            <Thead>
                                <Th>المزوّد</Th>
                                <Th>النسبة السارية</Th>
                                <Th>مجدول</Th>
                            </Thead>
                            <Tbody>
                                {providers.map((provider) => (
                                    <Tr key={provider.id}>
                                        <Td className="font-extrabold text-ink">{provider.name}</Td>
                                        <Td className="font-mono font-bold text-ink">
                                            {provider.effective_rate_percent ?? '—'}٪
                                        </Td>
                                        <Td>
                                            {provider.scheduled.length === 0 ? (
                                                <span className="text-ink/45">—</span>
                                            ) : (
                                                <div className="space-y-1">
                                                    {provider.scheduled.map((rate) => (
                                                        <div key={rate.id} className="flex items-center gap-2 text-[11px]">
                                                            <Badge tone="warning" icon={CalendarClock}>
                                                                {rate.rate_percent}٪ من {rate.effective_from}
                                                            </Badge>
                                                            {rate.reason && <span className="text-ink/55">{rate.reason}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                                <ListStates count={providers.length} colSpan={3} empty="لا مزوّدون مسجّلون." />
                            </Tbody>
                        </TableShell>
                    </Card>
                </>
            ) : (
                <>
                    <Card padding="p-4" className="space-y-4">
                        <h2 className="text-sm font-extrabold text-ink">جدولة شروط عقد جديدة</h2>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                termsForm.post('/admin/finance/contract-terms', {
                                    preserveScroll: true,
                                    onSuccess: () => termsForm.reset(),
                                });
                            }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                <Field label="الشركة" htmlFor="terms-company" required error={termsForm.errors.company_id}>
                                    <select
                                        id="terms-company"
                                        required
                                        value={termsForm.data.company_id}
                                        onChange={(event) => termsForm.setData('company_id', event.target.value)}
                                        className={`${INPUT} cursor-pointer`}
                                    >
                                        <option value="">اختر الشركة…</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="رسم الموظف المفعّل" htmlFor="terms-fee" error={termsForm.errors.fee_per_activated_employee}>
                                    <input
                                        id="terms-fee"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={termsForm.data.fee_per_activated_employee}
                                        onChange={(event) => termsForm.setData('fee_per_activated_employee', event.target.value)}
                                        className={`${INPUT} font-mono`}
                                    />
                                </Field>
                                <Field label="الحد الأدنى الشهري" htmlFor="terms-min" error={termsForm.errors.monthly_minimum}>
                                    <input
                                        id="terms-min"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={termsForm.data.monthly_minimum}
                                        onChange={(event) => termsForm.setData('monthly_minimum', event.target.value)}
                                        className={`${INPUT} font-mono`}
                                    />
                                </Field>
                                <Field
                                    label="تسري من"
                                    htmlFor="terms-from"
                                    required
                                    hint="تاريخ مستقبلي"
                                    error={termsForm.errors.effective_from}
                                >
                                    <input
                                        id="terms-from"
                                        type="date"
                                        required
                                        value={termsForm.data.effective_from}
                                        onChange={(event) => termsForm.setData('effective_from', event.target.value)}
                                        className={INPUT}
                                    />
                                </Field>
                                <Field label="السبب" htmlFor="terms-reason">
                                    <input
                                        id="terms-reason"
                                        type="text"
                                        value={termsForm.data.reason}
                                        onChange={(event) => termsForm.setData('reason', event.target.value)}
                                        className={INPUT}
                                    />
                                </Field>
                            </div>

                            <Button type="submit" disabled={termsForm.processing}>
                                جدولة الشروط
                            </Button>
                        </form>
                    </Card>

                    <Card padding="p-4" className="space-y-4">
                        <h2 className="text-sm font-extrabold text-ink">الشروط السارية والمجدولة</h2>

                        <TableShell>
                            <Thead>
                                <Th>الشركة</Th>
                                <Th>رسم الموظف</Th>
                                <Th>الحد الأدنى</Th>
                                <Th>مجدول</Th>
                            </Thead>
                            <Tbody>
                                {companies.map((company) => (
                                    <Tr key={company.id}>
                                        <Td className="font-extrabold text-ink">{company.name}</Td>
                                        <Td className="font-mono text-ink/85">
                                            {company.fee_per_activated_employee ?? <span className="text-danger font-bold font-arabic">بلا عقد</span>}
                                        </Td>
                                        <Td className="font-mono text-ink/85">{company.monthly_minimum ?? '—'}</Td>
                                        <Td>
                                            {company.scheduled.length === 0 ? (
                                                <span className="text-ink/45">—</span>
                                            ) : (
                                                <div className="space-y-1">
                                                    {company.scheduled.map((term) => (
                                                        <Badge key={term.id} tone="warning" icon={CalendarClock}>
                                                            {term.fee_per_activated_employee ?? '—'} من {term.effective_from}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                                <ListStates count={companies.length} colSpan={4} empty="لا شركات مسجّلة." />
                            </Tbody>
                        </TableShell>
                    </Card>
                </>
            )}
        </AdminLayout>
    );
}
