import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import toastr from 'toastr';
import CompanyLayout from '@/layouts/company-layout';

interface Settings {
    employee_can_create_event: boolean;
    default_funding_mode: string;
    default_subsidy: number;
    registration_close_hours: number;
    allow_absence_marking: boolean;
}

interface Props {
    settings: Settings;
    fundingModes: string[];
}

const fundingModeLabels: Record<string, string> = {
    community_wallet: 'محفظة المجتمع',
    employee_paid: 'دفع الموظف',
    mixed: 'مختلط',
};

export default function CompanySettings({ settings, fundingModes }: Props) {
    const form = useForm({
        employee_can_create_event: settings.employee_can_create_event,
        default_funding_mode: settings.default_funding_mode,
        default_subsidy: settings.default_subsidy,
        registration_close_hours: settings.registration_close_hours,
        allow_absence_marking: settings.allow_absence_marking,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.put('/company/settings', {
            onSuccess: () => toastr.success('تم حفظ إعدادات الشركة'),
        });
    }

    const rowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        padding: '16px 0',
        borderBottom: '1px solid #EEF2F9',
        flexWrap: 'wrap',
    };

    return (
        <CompanyLayout>
            <Head title="إعدادات الشركة" />

            <div style={{ marginBottom: 24 }}>
                <div className="page-title">إعدادات الشركة</div>
                <div className="page-sub">تُورَّث هذه الإعدادات للفعاليات الجديدة وتُضبط قبل دعوة الموظفين</div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: '8px 24px', maxWidth: 760 }}>
                    <div style={rowStyle}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>صلاحية الموظف بإنشاء فعالية</div>
                            <div style={{ fontSize: 12, color: '#7A8BA8', maxWidth: 480 }}>
                                معطّلاً: اقتراح الموظف يحتاج اعتماد القائد أو المنسّق. مفعّلاً: ينشر الموظف الفعالية مباشرة —
                                أي أن موظفاً يستطيع إنشاء التزام مالي على محفظة الشركة.
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={form.data.employee_can_create_event}
                            onChange={(e) => form.setData('employee_can_create_event', e.target.checked)}
                            style={{ width: 18, height: 18 }}
                        />
                    </div>

                    <div style={rowStyle}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>مصدر التمويل الافتراضي</div>
                            <div style={{ fontSize: 12, color: '#7A8BA8' }}>يُورَّث للفعاليات الجديدة وقابل للتجاوز على مستوى القالب والفعالية.</div>
                        </div>
                        <select
                            value={form.data.default_funding_mode}
                            onChange={(e) => form.setData('default_funding_mode', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13, fontFamily: 'inherit' }}
                        >
                            {fundingModes.map((mode) => (
                                <option key={mode} value={mode}>
                                    {fundingModeLabels[mode] ?? mode}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={rowStyle}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>قيمة الدعم الافتراضية (هللة)</div>
                            <div style={{ fontSize: 12, color: '#7A8BA8' }}>ما تتحمله محفظة المجتمع من كل فعالية. 100 هللة = ريال.</div>
                        </div>
                        <input
                            type="number"
                            min={0}
                            value={form.data.default_subsidy}
                            onChange={(e) => form.setData('default_subsidy', Number(e.target.value))}
                            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13, width: 120, fontFamily: 'inherit' }}
                        />
                    </div>

                    <div style={rowStyle}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>ساعات إغلاق التسجيل</div>
                            <div style={{ fontSize: 12, color: '#7A8BA8' }}>كم ساعة قبل بدء الفعالية يُغلق التسجيل ويبدأ التحصيل.</div>
                        </div>
                        <input
                            type="number"
                            min={1}
                            max={168}
                            value={form.data.registration_close_hours}
                            onChange={(e) => form.setData('registration_close_hours', Number(e.target.value))}
                            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13, width: 120, fontFamily: 'inherit' }}
                        />
                    </div>

                    <div style={{ ...rowStyle, borderBottom: 'none' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>السماح بتعديل الحضور</div>
                            <div style={{ fontSize: 12, color: '#7A8BA8' }}>هل يستطيع القائد تعديل قائمة الحاضرين بعد اكتمال الفعالية.</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={form.data.allow_absence_marking}
                            onChange={(e) => form.setData('allow_absence_marking', e.target.checked)}
                            style={{ width: 18, height: 18 }}
                        />
                    </div>
                </div>

                {Object.keys(form.errors).length > 0 && (
                    <div style={{ background: '#E0305010', border: '1px solid #E0305033', borderRadius: 10, padding: '10px 14px', marginTop: 16, maxWidth: 760 }}>
                        {Object.values(form.errors).map((error, i) => (
                            <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                        ))}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={form.processing}
                    style={{ marginTop: 16, background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: form.processing ? 0.6 : 1 }}
                >
                    حفظ الإعدادات
                </button>
            </form>
        </CompanyLayout>
    );
}
