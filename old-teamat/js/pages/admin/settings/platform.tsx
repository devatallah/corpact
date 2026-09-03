import PageHeader from '@/components/page-header';
import ConfirmModal from '@/components/confirm-modal';
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

/**
 * H §16 «الإعدادات: … العتبات والمهل» / G (أدمن تيمات §4):
 * «العتبات والمهل على مستوى المنصة، ومنها مهلة قائمة الانتظار (لا تُضبط من
 * القالب)». A7 تركها قيم config بانتظار هذه الشاشة.
 */

interface Field {
    key: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    group: string;
    hint: string;
    value: number;
    default: number;
    config_key: string;
}

interface Props {
    fields: Field[];
}

const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    background: '#FFFFFF',
    border: '0.5px solid rgba(10,10,10,.1)',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#0A0A0A',
    outline: 'none',
    direction: 'ltr',
    fontFamily: 'inherit',
    width: 120,
};

export default function PlatformSettings({ fields }: Props) {
    const initial: Record<string, number> = {};
    fields.forEach((field) => {
        initial[field.key] = field.value;
    });

    const form = useForm<{ values: Record<string, number> }>({ values: initial });
    const [confirming, setConfirming] = useState(false);

    const groups = Array.from(new Set(fields.map((field) => field.group)));
    const changed = fields.filter((field) => Number(form.data.values[field.key]) !== field.value);

    function save() {
        setConfirming(false);
        form.put('/admin/settings/platform', {
            preserveScroll: true,
            onSuccess: () => toastr.success('حُفظت عتبات المنصة.'),
        });
    }

    return (
        <AdminLayout>
            <Head title="إعدادات المنصة" />

            <PageHeader
                title={<>إعدادات المنصة — العتبات والمهل</>}
                subtitle={<>
                تسري على كل الشركات والمجتمعات فوراً. كل تعديل يُسجَّل في سجل التدقيق بقيمته قبل وبعد.
                </>}
            />

            {Object.keys(form.errors).length > 0 && (
                <div
                    style={{
                        background: 'rgba(224,48,80,.1)',
                        border: '1px solid rgba(224,48,80,.25)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        margin: '16px 0',
                    }}
                >
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: '12px', color: '#D9381E', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            {groups.map((group) => (
                <div className="card" key={group} style={{ marginTop: 16 }}>
                    <h3 style={{ marginTop: 0 }}>{group}</h3>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الإعداد</th>
                                <th>القيمة</th>
                                <th>الافتراضي</th>
                                <th>الشرح</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields
                                .filter((field) => field.group === group)
                                .map((field) => (
                                    <tr key={field.key}>
                                        <td style={{ fontWeight: 700, color: '#0A0A0A' }}>
                                            {field.label}
                                            <div dir="ltr" style={{ fontSize: 10, color: 'rgba(10,10,10,.55)' }}>{field.config_key}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <input
                                                    type="number"
                                                    min={field.min}
                                                    max={field.max}
                                                    value={form.data.values[field.key]}
                                                    onChange={(e) =>
                                                        form.setData('values', {
                                                            ...form.data.values,
                                                            [field.key]: Number(e.target.value),
                                                        })
                                                    }
                                                    style={inputStyle}
                                                />
                                                <span style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>{field.unit}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>
                                            {field.default} {field.unit}
                                        </td>
                                        <td style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', lineHeight: 1.8 }}>{field.hint}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            ))}

            <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="act-btn btn-approve" disabled={form.processing || changed.length === 0} onClick={() => setConfirming(true)}>
                    حفظ التغييرات
                </button>
                <span style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>
                    {changed.length === 0 ? 'لا تغييرات بعد.' : `${changed.length} إعداداً معدّلاً.`}
                </span>
            </div>

            <ConfirmModal
                open={confirming}
                title="تطبيق عتبات المنصة"
                message={
                    changed.length === 0
                        ? ''
                        : `ستسري هذه القيم على كل الفعاليات الجارية فوراً:\n${changed
                              .map((field) => `${field.label}: ${field.value} ← ${form.data.values[field.key]} ${field.unit}`)
                              .join(' · ')}`
                }
                confirmLabel="تطبيق"
                onConfirm={save}
                onCancel={() => setConfirming(false)}
            />
        </AdminLayout>
    );
}
