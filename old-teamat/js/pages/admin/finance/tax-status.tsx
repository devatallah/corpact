import PageHeader from '@/components/page-header';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

interface Flow {
    key: string;
    label: string;
    treatment: 'agent' | 'principal' | string;
    treatment_label: string;
    issuer: string;
    issuer_label: string;
}

interface Props {
    flows: Flow[];
    vatRatePercent: number;
    realInvoicesEnabled: boolean;
    sellerVatNumber: string | null;
    sellerName: string;
}

/**
 * H §12.9 — الصفة الضريبية ومصفوفة الفوترة.
 *
 * Read-only by design. Every value on this screen comes from
 * `config/billing.php` through the controller, so it always states what the
 * system is actually applying rather than a description that can drift.
 */
export default function TaxStatus({ flows, vatRatePercent, realInvoicesEnabled, sellerVatNumber, sellerName }: Props) {
    return (
        <AdminLayout>
            <Head title="الصفة الضريبية" />

            <PageHeader
                icon={FileText}
                title={<>الصفة الضريبية ومصفوفة الفوترة</>}
                subtitle={<>المعالجة الضريبية لكل تدفّق مالي، وحالة بوّابة إصدار الفواتير النهائية.</>}
            />

            {/* H §12.9 نصّاً: «قرار ضريبي غير نهائي». الشاشة تقول ذلك قبل أي رقم. */}
            <div className="flex gap-2.5 p-4 rounded-2xl bg-[#FEF08A]/40 border-[0.5px] border-[#C87D00]/30 mb-5">
                <AlertTriangle className="w-4 h-4 text-[#C87D00] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#C87D00] mb-1.5">بند غير محسوم — يحتاج مراجعة محاسب قانوني</p>
                    <p className="text-[11px] text-[#0A0A0A]/70 leading-relaxed">
                        جدول الصفة الضريبية أدناه هو توجّه البناء المعتمد، ويحتاج مراجعة محاسب قانوني قبل إصدار أي فاتورة
                        لعميل حقيقي. الصفة تُخزَّن على كل حركة وبند، فيمكن تعديل المعالجة لاحقاً بلا إعادة بناء.
                    </p>
                </div>
            </div>

            {/* بوّابة الفواتير الحقيقية — علم تشغيلي، وقلبه قرار مالك ومحاسب. */}
            <div className="bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/10 p-5 mb-5 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-sm font-extrabold text-[#0A0A0A]">بوّابة إصدار الفواتير النهائية</h2>
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border-[0.5px] ${
                            realInvoicesEnabled
                                ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/20'
                                : 'bg-[#FEF9E0] text-[#C87D00] border-[#C87D00]/25'
                        }`}
                    >
                        {realInvoicesEnabled ? (
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        {realInvoicesEnabled ? 'مفعّلة — تصدر فواتير نهائية' : 'مطفأة — الفواتير مبدئية (provisional)'}
                    </span>
                </div>
                <p className="text-[11px] text-[#0A0A0A]/60 leading-relaxed">
                    {realInvoicesEnabled
                        ? 'الفواتير تصدر مستنداً ضريبياً نهائياً. أي تغيير في الصفة الضريبية بعد اليوم يخص الفواتير الجديدة وحدها.'
                        : 'الفواتير تُحسب وتُخزَّن وتُعرض للأدمن، ولا تُقدَّم على أنها مستند ضريبي نهائي ولا تُربط بفاتورة (Fatoora).'}
                </p>

                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-[#F6F8F5] p-3.5 rounded-xl border-[0.5px] border-[#0A0A0A]/10">
                        <dt className="text-[11px] text-[#0A0A0A]/50 font-medium block mb-0.5">ضريبة القيمة المضافة</dt>
                        <dd className="font-mono font-bold text-sm text-[#0A0A0A]">{vatRatePercent}% تُضاف على رسوم النظام</dd>
                    </div>
                    <div className="bg-[#F6F8F5] p-3.5 rounded-xl border-[0.5px] border-[#0A0A0A]/10">
                        <dt className="text-[11px] text-[#0A0A0A]/50 font-medium block mb-0.5">البائع في الفاتورة</dt>
                        <dd className="font-bold text-sm text-[#0A0A0A]">{sellerName}</dd>
                    </div>
                    <div className="bg-[#F6F8F5] p-3.5 rounded-xl border-[0.5px] border-[#0A0A0A]/10">
                        <dt className="text-[11px] text-[#0A0A0A]/50 font-medium block mb-0.5">الرقم الضريبي للبائع</dt>
                        <dd className={`font-mono font-bold text-sm ${sellerVatNumber ? 'text-[#0A0A0A]' : 'text-[#C87D00]'}`} dir="ltr">
                            {sellerVatNumber ?? '— غير مسجَّل'}
                        </dd>
                    </div>
                </dl>
            </div>

            {/* مصفوفة المعالجة لكل تدفّق — من config/billing.php مباشرة. */}
            <div className="bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/10 overflow-hidden">
                <div className="px-5 py-3.5 border-b-[0.5px] border-[#0A0A0A]/10">
                    <h2 className="text-sm font-extrabold text-[#0A0A0A]">مصفوفة المعالجة الضريبية</h2>
                    <p className="text-[11px] text-[#0A0A0A]/50 mt-0.5">ما يطبّقه النظام الآن على كل تدفّق مالي.</p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>التدفّق المالي</th>
                                <th>الصفة</th>
                                <th>مُصدِر الفاتورة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flows.map((flow) => (
                                <tr key={flow.key}>
                                    <td className="font-bold text-[#0A0A0A]">{flow.label}</td>
                                    <td>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border-[0.5px] ${
                                                flow.treatment === 'agent'
                                                    ? 'bg-[#F6F8F5] text-[#0A0A0A]/70 border-[#0A0A0A]/10'
                                                    : 'bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A]'
                                            }`}
                                        >
                                            {flow.treatment_label}
                                        </span>
                                    </td>
                                    <td className="text-[#0A0A0A]/70">{flow.issuer_label}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
