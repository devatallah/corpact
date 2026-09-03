import EmployeeLayout from '@/layouts/employee-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { Community, Department, Category } from '@/types/models';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    community: Community & { category?: Category };
    departments: Department[];
}

export default function LeagueCreate({ community, departments }: Props) {
    const color = community.category?.color ?? community.color ?? '#18A86B';

    const form = useForm({
        name: '',
        format: 'single_round_robin' as string,
        department_ids: [] as number[],
    });

    const [seedOrder, setSeedOrder] = useState<number[]>([]);

    function toggleDepartment(id: number) {
        const current = [...form.data.department_ids];
        const idx = current.indexOf(id);
        if (idx >= 0) {
            current.splice(idx, 1);
            setSeedOrder(prev => prev.filter(d => d !== id));
        } else {
            current.push(id);
            setSeedOrder(prev => [...prev, id]);
        }
        form.setData('department_ids', current);
    }

    function moveSeed(index: number, direction: -1 | 1) {
        const arr = [...seedOrder];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= arr.length) return;
        [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
        setSeedOrder(arr);
        form.setData('department_ids', arr);
    }

    const isKnockout = form.data.format === 'knockout';
    const count = form.data.department_ids.length;
    const isPowerOf2 = count >= 2 && (count & (count - 1)) === 0;
    const knockoutValid = !isKnockout || isPowerOf2;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const ids = isKnockout ? seedOrder : form.data.department_ids;
        form.transform((data) => ({ ...data, department_ids: ids }));
        form.post(`/employee/community/${community.id}/leagues`, {
            onSuccess: () => toastr.success('تم إنشاء البطولة بنجاح'),
        });
    }

    const formatOptions = [
        { value: 'single_round_robin', label: 'دوري دور واحد', desc: 'كل فريق يلعب مع الآخر مرة واحدة' },
        { value: 'double_round_robin', label: 'دوري ذهاب وإياب', desc: 'كل فريق يلعب مع الآخر مرتين' },
        { value: 'knockout', label: 'خروج المغلوب', desc: 'الخاسر يخرج مباشرة — يشمل مباراة تحديد المركز الثالث' },
    ];

    return (
        <EmployeeLayout>
            <Head title="إنشاء بطولة" />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, paddingTop: 4 }}>
                <Link href={`/employee/community/${community.id}?tab=leagues`} style={{ color: '#999', textDecoration: 'none', fontSize: 13 }}>← {community.name}</Link>
                <span style={{ color: '#EBEBEB' }}>/</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>إنشاء بطولة</span>
            </div>

            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>إنشاء بطولة</h1>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div className="card" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
                    {Object.values(form.errors).map((err, i) => (
                        <div key={i} className="field-error" style={{ marginTop: 0 }}>{err}</div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="card">
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', marginBottom: 8, display: 'block' }}>اسم البطولة *</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder="مثال: بطولة البادل الأولى"
                        required
                    />
                </div>

                {/* Format */}
                <div className="card">
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', marginBottom: 12, display: 'block' }}>نظام البطولة *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {formatOptions.map((opt) => {
                            const selected = form.data.format === opt.value;
                            return (
                                <label
                                    key={opt.value}
                                    className="card"
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                                        marginBottom: 0, padding: '12px 14px',
                                        borderColor: selected ? color : '#EBEBEB',
                                        borderWidth: selected ? 2 : 1,
                                        background: selected ? `${color}08` : '#fff',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="format"
                                        value={opt.value}
                                        checked={selected}
                                        onChange={() => form.setData('format', opt.value)}
                                        style={{ marginTop: 2, width: 'auto' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
                                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{opt.desc}</div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Departments selection */}
                <div className="card">
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', marginBottom: 6, display: 'block' }}>
                        الأقسام المشاركة * ({count} مختار)
                    </label>
                    {isKnockout && (
                        <div style={{ fontSize: 12, color: count > 0 && !isPowerOf2 ? '#EF4444' : '#999', marginBottom: 12 }}>
                            {count > 0 && !isPowerOf2
                                ? `عدد الأقسام يجب أن يكون 2 أو 4 أو 8 أو 16 (الحالي: ${count})`
                                : 'اختر 2 أو 4 أو 8 أو 16 قسم'}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {departments.map((dept) => {
                            const selected = form.data.department_ids.includes(dept.id);
                            return (
                                <button
                                    key={dept.id}
                                    type="button"
                                    onClick={() => toggleDepartment(dept.id)}
                                    className={`pill${selected ? ' on' : ''}`}
                                    style={selected ? { background: color, borderColor: color } : undefined}
                                >
                                    {selected ? '✓ ' : ''}{dept.name}
                                </button>
                            );
                        })}
                    </div>
                    {departments.length === 0 && (
                        <div className="empty">
                            <div className="txt">لا توجد أقسام — أنشئ أقساماً من بوابة الشركة أولاً</div>
                        </div>
                    )}
                </div>

                {/* Knockout: seed order */}
                {isKnockout && seedOrder.length >= 2 && isPowerOf2 && (
                    <div className="card">
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', marginBottom: 4, display: 'block' }}>ترتيب المواجهات</label>
                        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>رتّب الأقسام — كل زوج متجاور سيتقابل في الدور الأول</div>
                        <div className="list-card">
                            {seedOrder.map((deptId, index) => {
                                const dept = departments.find(d => d.id === deptId);
                                const isTop = index % 2 === 0;
                                return (
                                    <div
                                        key={deptId}
                                        className="list-row"
                                        style={{
                                            cursor: 'default',
                                            background: isTop ? '#FAFAFA' : '#fff',
                                            borderBottom: index % 2 === 1 ? `2px solid ${color}33` : undefined,
                                        }}
                                    >
                                        <span style={{ fontSize: 13, color: '#999', width: 20 }}>{index + 1}</span>
                                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{dept?.name}</span>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button type="button" onClick={() => moveSeed(index, -1)} disabled={index === 0}
                                                className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 14 }}>↑</button>
                                            <button type="button" onClick={() => moveSeed(index, 1)} disabled={index === seedOrder.length - 1}
                                                className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 14 }}>↓</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
                            المواجهات: {seedOrder.reduce<string[]>((acc, _, i) => {
                                if (i % 2 === 0 && i + 1 < seedOrder.length) {
                                    const a = departments.find(d => d.id === seedOrder[i])?.name;
                                    const b = departments.find(d => d.id === seedOrder[i + 1])?.name;
                                    acc.push(`${a} vs ${b}`);
                                }
                                return acc;
                            }, []).join(' · ')}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={form.processing || !knockoutValid || count < 2}
                    style={{
                        opacity: form.processing || !knockoutValid || count < 2 ? 0.5 : 1,
                        cursor: form.processing || !knockoutValid || count < 2 ? 'not-allowed' : 'pointer',
                    }}
                >
                    إنشاء البطولة
                </button>
            </form>
        </EmployeeLayout>
    );
}
