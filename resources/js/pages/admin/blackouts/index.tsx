import AdminLayout from '@/layouts/admin-layout';
import ConfirmModal from '@/components/confirm-modal';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { BlackoutDate } from '@/types/models';
import { fmtDate } from '@/lib/utils';
import toastr from 'toastr';

interface Props {
    blackouts: BlackoutDate[];
}

/**
 * A8 — أيام الحظر (H §8): يديرها أدمن تيمات (إجازات/رمضان). الفعالية المولَّدة
 * من قالب والواقعة في نطاق حظر تُتخطى افتراضياً أو تُزاح أسبوعاً حسب إعداد
 * القالب. تسري على التوليد القادم فقط — لا تمس فعاليات مولّدة. CRUD أدنى (A15 يوسّعه).
 */
export default function BlackoutsIndex({ blackouts }: Props) {
    const [deleting, setDeleting] = useState<BlackoutDate | null>(null);
    const form = useForm({ name: '', starts_on: '', ends_on: '' });

    return (
        <AdminLayout>
            <Head title="أيام الحظر" />
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>أيام الحظر — الإجازات ورمضان</h1>
            <div style={{ fontSize: 12, color: '#8A7868', marginBottom: 16 }}>
                فعالية قالب تقع في نطاق حظر تُتخطى افتراضياً أو تُزاح أسبوعاً حسب إعداد القالب. يسري على التوليد القادم فقط — الفعاليات المولّدة سلفاً لا تُمس.
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>إضافة نطاق حظر</div>
                <div className="frow">
                    <div className="fg">
                        <label>الاسم (مثال: عيد الفطر)</label>
                        <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                        {form.errors.name && <div style={{ fontSize: 11, color: '#C8410A' }}>{form.errors.name}</div>}
                    </div>
                    <div className="fg">
                        <label>من تاريخ</label>
                        <input type="date" value={form.data.starts_on} onChange={(e) => form.setData('starts_on', e.target.value)} />
                        {form.errors.starts_on && <div style={{ fontSize: 11, color: '#C8410A' }}>{form.errors.starts_on}</div>}
                    </div>
                    <div className="fg">
                        <label>إلى تاريخ</label>
                        <input type="date" value={form.data.ends_on} onChange={(e) => form.setData('ends_on', e.target.value)} />
                        {form.errors.ends_on && <div style={{ fontSize: 11, color: '#C8410A' }}>{form.errors.ends_on}</div>}
                    </div>
                </div>
                <button
                    className="act-btn"
                    style={{ background: '#1A7A4A', color: '#fff', borderColor: '#1A7A4A', padding: '9px 20px', borderRadius: 8, marginTop: 6 }}
                    disabled={form.processing || !form.data.name || !form.data.starts_on || !form.data.ends_on}
                    onClick={() => form.post('/admin/blackouts', { onSuccess: () => { form.reset(); toastr.success('أُضيف نطاق الحظر'); } })}
                >
                    إضافة
                </button>
            </div>

            <div className="card">
                <div style={{ fontWeight: 800, marginBottom: 10 }}>النطاقات ({blackouts.length})</div>
                {blackouts.length === 0 && <div style={{ color: '#8A7868', fontSize: 13 }}>لا نطاقات حظر بعد.</div>}
                {blackouts.map((b) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                            <b>{b.name}</b>
                            <span style={{ fontSize: 12, color: '#8A7868', marginRight: 8 }}>
                                {fmtDate(b.starts_on)} — {fmtDate(b.ends_on)}
                            </span>
                        </div>
                        <button className="act-btn" style={{ color: '#C8410A', borderColor: '#C8410A', padding: '6px 14px', borderRadius: 8, fontSize: 12 }} onClick={() => setDeleting(b)}>
                            حذف
                        </button>
                    </div>
                ))}
            </div>

            <ConfirmModal
                open={deleting !== null}
                title="حذف نطاق الحظر"
                message={deleting ? `سيُحذف «${deleting.name}» — التوليد القادم لن يتخطى هذه الأيام بعد الآن.` : ''}
                onConfirm={() => {
                    if (deleting) {
                        router.delete(`/admin/blackouts/${deleting.id}`, { onSuccess: () => toastr.success('حُذف نطاق الحظر') });
                    }
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />
        </AdminLayout>
    );
}
