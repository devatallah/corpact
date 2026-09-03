import { Head, useForm } from '@inertiajs/react';
import { RotateCcw, Settings } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { Button, Card, INPUT, Note, PageHeader } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §16 — الإعدادات المركزية.
 *
 * Every field here changes platform-wide behaviour for everyone at once: a
 * payment window, a correction window, a reminder cadence. The default and
 * the allowed range travel with each field so an operator can see how far
 * they are from the value the system was designed around.
 */
type Field = {
    key: string;
    label: string;
    unit: string | null;
    min: number;
    max: number;
    group: string;
    hint: string | null;
    value: number;
    default: number;
    config_key: string;
};

export default function PlatformSettings({ fields }: { fields: Field[] }) {
    const [confirming, setConfirming] = useState(false);
    const form = useForm<Record<string, number>>(
        Object.fromEntries(fields.map((field) => [field.key, field.value])),
    );

    const groups = [...new Set(fields.map((field) => field.group))];
    const changed = fields.filter((field) => Number(form.data[field.key]) !== field.value);

    return (
        <AdminLayout>
            <Head title="إعدادات المنصة" />

            <PageHeader
                icon={Settings}
                title="الإعدادات المركزية"
                subtitle="قيم تحكم سلوك المنصة كلها في الوقت نفسه. كل تعديل يُقيَّد في سجل التدقيق."
                actions={
                    <Button onClick={() => setConfirming(true)} disabled={changed.length === 0}>
                        حفظ التغييرات ({changed.length})
                    </Button>
                }
            />

            <Note tone="warning" title="أثر فوري على كل الشركات">
                لا تُطبَّق هذه القيم على شركة واحدة: تغيير نافذة السداد مثلاً يغيّرها لكل مطالبة قادمة في المنصة. راجع القيمة
                الافتراضية قبل الابتعاد عنها.
            </Note>

            {groups.map((group) => (
                <Card key={group} padding="p-4" className="space-y-4">
                    <h2 className="text-sm font-extrabold text-ink">{group}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields
                            .filter((field) => field.group === group)
                            .map((field) => {
                                const current = Number(form.data[field.key]);
                                const isDefault = current === field.default;

                                return (
                                    <div key={field.key} className="p-3.5 rounded-xl bg-page border-[0.5px] border-ink/10 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <label htmlFor={field.key} className="text-xs font-extrabold text-ink">
                                                {field.label}
                                            </label>
                                            <span className="font-mono text-[10px] text-ink/40">{field.config_key}</span>
                                        </div>

                                        {field.hint && <p className="text-[11px] text-ink/60 leading-relaxed">{field.hint}</p>}

                                        <div className="flex items-center gap-2">
                                            <input
                                                id={field.key}
                                                type="number"
                                                min={field.min}
                                                max={field.max}
                                                value={current}
                                                onChange={(event) => form.setData(field.key, Number(event.target.value))}
                                                className={`${INPUT} font-mono`}
                                            />
                                            {field.unit && <span className="text-[11px] text-ink/60 shrink-0">{field.unit}</span>}
                                            {!isDefault && (
                                                <button
                                                    type="button"
                                                    title="إعادة للقيمة الافتراضية"
                                                    onClick={() => form.setData(field.key, field.default)}
                                                    className="p-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink cursor-pointer shrink-0"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-[10px] text-ink/45 font-mono">
                                            <span>
                                                المدى {field.min} — {field.max}
                                            </span>
                                            <span className={isDefault ? '' : 'text-warning font-bold'}>
                                                الافتراضي {field.default}
                                            </span>
                                        </div>

                                        {form.errors[field.key] && (
                                            <p className="text-[11px] font-bold text-danger">{form.errors[field.key]}</p>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </Card>
            ))}

            <ConfirmModal
                open={confirming}
                title="حفظ الإعدادات المركزية"
                message="تسري القيم الجديدة فوراً على كل الشركات والفعاليات القادمة."
                details={
                    <>
                        {changed.map((field) => (
                            <ConfirmRow
                                key={field.key}
                                label={field.label}
                                value={`${field.value} ← ${form.data[field.key]} ${field.unit ?? ''}`}
                                strong
                            />
                        ))}
                        {changed.length === 0 && <span className="text-ink/60">لا تغييرات.</span>}
                    </>
                }
                confirmLabel="حفظ وتطبيق"
                onConfirm={() => {
                    form.put('/admin/settings/platform', {
                        preserveScroll: true,
                        onSuccess: () => setConfirming(false),
                    });
                }}
                onCancel={() => setConfirming(false)}
            />
        </AdminLayout>
    );
}
