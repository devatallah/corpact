import { Head } from '@inertiajs/react';
import { FileSpreadsheet, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Badge, Card, Note, PageHeader, StatCard, TableShell, Tbody, Td, Th, Thead, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §12.9 — the tax position of every money flow, in one place.
 *
 * Read-only on purpose. These are contractual and regulatory facts, not
 * settings: changing who issues an invoice or how a flow is treated for VAT
 * is a decision taken outside the product and then configured, never toggled
 * by whoever happens to be on this screen.
 */
type Flow = {
    key: string;
    label: string;
    treatment: string;
    treatment_label: string;
    issuer: string;
    issuer_label: string;
};

export default function TaxStatus({
    flows,
    vatRatePercent,
    realInvoicesEnabled,
    sellerVatNumber,
    sellerName,
}: {
    flows: Flow[];
    vatRatePercent: number;
    realInvoicesEnabled: boolean;
    sellerVatNumber: string | null;
    sellerName: string | null;
}) {
    return (
        <AdminLayout>
            <Head title="الصفة الضريبية" />

            <PageHeader
                icon={FileSpreadsheet}
                title="الصفة الضريبية ومصفوفة الفوترة (ZATCA)"
                subtitle="كيف تُعامل كل حركة مالية ضريبياً، ومن يصدر الفاتورة عنها. هذه الشاشة للقراءة — التغيير قرار تعاقدي يُضبط في الإعدادات."
            />

            <Note tone="danger" title="بند غير محسوم — يحتاج مراجعة محاسب قانوني ومستشار ضريبي">
                تعتمد المعالجة الضريبية للمنصة على تصنيف نموذج عمل تيمات أمام هيئة الزكاة والضريبة والجمارك: وكيل وسيط بالعمولة
                (Agent) أم أصيل بائع للخدمة (Principal). الجدول أدناه يقارن الأثر المحاسبي لكل نموذج — لا يقرّره.
            </Note>

            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">مصفوفة المعالجة الضريبية المقارنة</h2>

                <TableShell>
                    <Thead>
                        <Th>عنصر المعالجة</Th>
                        <Th>النموذج أ: وكيل وسيط بالعمولة (Agent)</Th>
                        <Th>النموذج ب: أصيل مشترٍ وبائع (Principal)</Th>
                    </Thead>
                    <Tbody>
                        {TAX_MODELS.map((row) => (
                            <Tr key={row.item}>
                                <Td className="font-extrabold text-ink">{row.item}</Td>
                                <Td className="text-[11px] text-ink/75 max-w-xs">{row.agent}</Td>
                                <Td className="text-[11px] text-ink/75 max-w-xs">{row.principal}</Td>
                            </Tr>
                        ))}
                        <Tr>
                            <Td className="font-extrabold text-ink">الوضع التشغيلي الحالي</Td>
                            <Td>
                                <Badge tone="success">النموذج المعتمد افتراضياً</Badge>
                            </Td>
                            <Td>
                                <Badge tone="neutral">نموذج بديل قيد الدراسة القانونية</Badge>
                            </Td>
                        </Tr>
                    </Tbody>
                </TableShell>
            </Card>

            {!realInvoicesEnabled && (
                <Note tone="warning" title="الفوترة الضريبية الحقيقية غير مفعّلة">
                    الفواتير تُنشأ بوضع تجريبي بلا رقم تسلسلي ضريبي معتمد. لا تُفعَّل{' '}
                    <span className="font-mono">real_invoices_enabled</span> قبل اعتماد المحاسب القانوني ومراجعة هيئة الزكاة
                    والضريبة.
                </Note>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="نسبة ضريبة القيمة المضافة" value={`${vatRatePercent}٪`} />
                <StatCard
                    label="حالة الفوترة الحقيقية"
                    value={realInvoicesEnabled ? 'مفعّلة' : 'تجريبية'}
                    tone={realInvoicesEnabled ? 'success' : 'warning'}
                />
                <StatCard label="عدد المسارات المعرّفة" value={flows.length} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">هوية البائع في الفواتير الصادرة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-page border-[0.5px] border-ink/10">
                        <span className="text-[11px] font-bold text-ink/50 block">الاسم النظامي</span>
                        <span className="font-bold text-ink">{sellerName ?? '— غير مضبوط'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-page border-[0.5px] border-ink/10">
                        <span className="text-[11px] font-bold text-ink/50 block">الرقم الضريبي</span>
                        <span className="font-mono font-bold text-ink" dir="ltr">
                            {sellerVatNumber ?? '— غير مضبوط'}
                        </span>
                    </div>
                </div>
                {(sellerName === null || sellerVatNumber === null) && (
                    <div className="flex items-start gap-2 text-[11px] text-danger font-bold">
                        <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
                        <span>لا يمكن إصدار فاتورة ضريبية نظامية قبل ضبط الاسم والرقم الضريبي.</span>
                    </div>
                )}
            </Card>

            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">مسارات الأموال</h2>

                <TableShell>
                    <Thead>
                        <Th>المسار</Th>
                        <Th>المعاملة الضريبية</Th>
                        <Th>جهة إصدار الفاتورة</Th>
                    </Thead>
                    <Tbody>
                        {flows.map((flow) => (
                            <Tr key={flow.key}>
                                <Td>
                                    <span className="font-extrabold text-ink block">{flow.label}</span>
                                    <span className="font-mono text-[10px] text-ink/45">{flow.key}</span>
                                </Td>
                                <Td>
                                    <Badge tone={flow.treatment === 'exempt' ? 'neutral' : 'lime'}>{flow.treatment_label}</Badge>
                                </Td>
                                <Td>
                                    <span className="text-ink/85">{flow.issuer_label}</span>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </TableShell>
            </Card>

            <Note title="لماذا تختلف جهة الإصدار بين المسارات؟">
                <span className="flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
                    <span>
                        تيمات هي جهة الإصدار حيث تكون الطرف المتعاقد (رسوم النظام، وتحصيل حصص الموظفين بصفتها Merchant of
                        Record). المزوّد هو جهة الإصدار حيث تكون الخدمة خدمته المباشرة. خلط الاثنين يفسد المطابقة الضريبية.
                    </span>
                </span>
            </Note>
        </AdminLayout>
    );
}

/**
 * المقارنة بين النموذجين الضريبيين.
 *
 * Kept as data on the screen rather than pulled from config, because nothing
 * in the system decides this — it is a legal classification pending an
 * accountant's ruling, and the table exists to frame that decision rather
 * than to reflect a setting.
 */
const TAX_MODELS = [
    {
        item: 'مصدر فاتورة حجز الفعالية',
        agent: 'مزوّد الخدمة يصدر الفاتورة باسم الشركة المشتركة مباشرة.',
        principal: 'تيمات تصدر فاتورة الفعالية باسم الشركة المشتركة.',
    },
    {
        item: 'فاتورة رسوم تيمات',
        agent: 'فاتورة عمولة وساطة على المزوّد + فاتورة رسوم النظام على الشركة (+15٪ ضريبة).',
        principal: 'فاتورة مجمّعة بقيمة الخدمة الإجمالية شاملة هامش الربح والضريبة.',
    },
    {
        item: 'إقرار ضريبة القيمة المضافة',
        agent: 'تيمات تُقرّ بالضريبة المحصَّلة عن عمولاتها ورسوم الموظف المفعَّل فقط.',
        principal: 'تيمات تُقرّ بإجمالي المبيعات وتقدّم فواتير المزوّدين كمدخلات ضريبية.',
    },
];
