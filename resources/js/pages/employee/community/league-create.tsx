import EmployeeLayout from '@/layouts/employee-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { Community, Department, Sport } from '@/types/models';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    community: Community & { sport?: Sport };
    departments: Department[];
}

export default function LeagueCreate({ community, departments }: Props) {
    const color = community.sport?.color ?? community.color ?? '#009E82';

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

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, marginTop: 16 }}>
                <Link href={`/employee/community/${community.id}?tab=leagues`} style={{ color: '#7A8BA8', textDecoration: 'none', fontSize: 13 }}>← {community.name}</Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>إنشاء بطولة</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div className="card" style={{ background: '#E0305010', borderColor: '#E0305033', marginBottom: 12 }}>
                    {Object.values(form.errors).map((err, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#E03050', marginBottom: 2 }}>{err}</div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="card" style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5C78', marginBottom: 8, display: 'block' }}>اسم البطولة *</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder="مثال: بطولة البادل الأولى"
                        required
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F4', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                    />
                </div>

                {/* Format */}
                <div className="card" style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5C78', marginBottom: 10, display: 'block' }}>نظام البطولة *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {formatOptions.map((opt) => (
                            <label
                                key={opt.value}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                                    border: `2px solid ${form.data.format === opt.value ? color : '#E2E8F4'}`,
                                    borderRadius: 10, cursor: 'pointer', transition: 'border-color .15s',
                                    background: form.data.format === opt.value ? `${color}08` : '#fff',
                                }}
                            >
                                <input
                                    type="radio"
                                    name="format"
                                    value={opt.value}
                                    checked={form.data.format === opt.value}
                                    onChange={() => form.setData('format', opt.value)}
                                    style={{ marginTop: 2 }}
                                />
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</div>
                                    <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>{opt.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Departments selection */}
                <div className="card" style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5C78', marginBottom: 4, display: 'block' }}>
                        الأقسام المشاركة * ({count} مختار)
                    </label>
                    {isKnockout && (
                        <div style={{ fontSize: 11, color: count > 0 && !isPowerOf2 ? '#E03050' : '#7A8BA8', marginBottom: 10 }}>
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
                                    style={{
                                        padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                        border: `2px solid ${selected ? color : '#E2E8F4'}`,
                                        background: selected ? `${color}15` : '#fff',
                                        color: selected ? color : '#4A5C78',
                                    }}
                                >
                                    {selected ? '✓ ' : ''}{dept.name}
                                </button>
                            );
                        })}
                    </div>
                    {departments.length === 0 && (
                        <div style={{ fontSize: 12, color: '#7A8BA8', padding: 12, textAlign: 'center' }}>لا توجد أقسام — أنشئ أقساماً من بوابة الشركة أولاً</div>
                    )}
                </div>

                {/* Knockout: seed order / matchup arrangement */}
                {isKnockout && seedOrder.length >= 2 && isPowerOf2 && (
                    <div className="card" style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5C78', marginBottom: 4, display: 'block' }}>ترتيب المواجهات</label>
                        <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 10 }}>رتّب الأقسام — كل زوج متجاور سيتقابل في الدور الأول</div>
                        {seedOrder.map((deptId, index) => {
                            const dept = departments.find(d => d.id === deptId);
                            const isTop = index % 2 === 0;
                            return (
                                <div
                                    key={deptId}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                                        background: isTop ? '#F7F8FA' : '#fff',
                                        borderRadius: 8,
                                        borderBottom: index % 2 === 1 ? `2px solid ${color}33` : 'none',
                                        marginBottom: index % 2 === 1 ? 8 : 0,
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: '#7A8BA8', width: 20 }}>{index + 1}</span>
                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{dept?.name}</span>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button type="button" onClick={() => moveSeed(index, -1)} disabled={index === 0}
                                            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E2E8F4', background: '#fff', cursor: 'pointer', fontSize: 14 }}>↑</button>
                                        <button type="button" onClick={() => moveSeed(index, 1)} disabled={index === seedOrder.length - 1}
                                            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E2E8F4', background: '#fff', cursor: 'pointer', fontSize: 14 }}>↓</button>
                                    </div>
                                </div>
                            );
                        })}
                        <div style={{ marginTop: 12, fontSize: 11, color: '#7A8BA8' }}>
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
                    disabled={form.processing || !knockoutValid || count < 2}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                        background: color, color: '#fff', fontSize: 14, fontWeight: 700,
                        cursor: form.processing || !knockoutValid || count < 2 ? 'not-allowed' : 'pointer',
                        opacity: form.processing || !knockoutValid || count < 2 ? 0.5 : 1,
                        fontFamily: 'inherit',
                    }}
                >
                    إنشاء البطولة
                </button>
            </form>
        </EmployeeLayout>
    );
}
