import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import type { NotificationTemplate, PaginatedResult } from '@/types/models';

interface Props {
    templates: PaginatedResult<NotificationTemplate>;
    groups: string[];
    stats: { total: number; mandatory: number; optional: number; inactive: number };
    filters: { search?: string; group?: string; class?: string; sort?: string; dir?: string };
    sort: SortState;
}

const GROUP_LABELS: Record<string, string> = {
    auth: 'الدخول والدعوات',
    community: 'المجتمعات',
    events: 'الفعاليات',
    provider: 'المزوّدون',
    money: 'المال والتحصيل',
    billing: 'الفوترة والتسويات',
    engagement: 'التفاعل',
    general: 'عام',
};

function ClassBadge({ value }: { value: string }) {
    const mandatory = value === 'mandatory';

    return (
        <span
            style={{
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: mandatory ? '#E03050' : '#4A9DE0',
                background: mandatory ? 'rgba(224,48,80,0.12)' : 'rgba(74,157,224,0.12)',
            }}
        >
            {mandatory ? 'إلزامي' : 'اختياري'}
        </span>
    );
}

export default function NotificationTemplatesIndex({ templates, groups, stats, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        group: filters?.group,
        class: filters?.class,
        sort: filters?.sort,
        dir: filters?.dir,
    });
    const [editing, setEditing] = useState<NotificationTemplate | null>(null);

    const form = useForm({
        title_ar: '',
        title_en: '',
        body_ar: '',
        body_en: '',
        whatsapp_template_name: '',
        active: true,
    });

    function openEditor(template: NotificationTemplate) {
        setEditing(template);
        form.setData({
            title_ar: template.title_ar ?? '',
            title_en: template.title_en ?? '',
            body_ar: template.body_ar ?? '',
            body_en: template.body_en ?? '',
            whatsapp_template_name: template.whatsapp_template_name ?? '',
            active: template.active,
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!editing) return;

        form.put(`/admin/notification-templates/${editing.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toastr.success('حُدِّث القالب.');
                setEditing(null);
            },
        });
    }

    function filterBy(key: 'group' | 'class', value: string) {
        router.get(
            '/admin/notification-templates',
            {
                search: filters?.search || undefined,
                group: key === 'group' ? value || undefined : filters?.group || undefined,
                class: key === 'class' ? value || undefined : filters?.class || undefined,
                // الترتيب النشط لا يسقط بتغيير الفلتر.
                sort: filters?.sort || undefined,
                dir: filters?.dir || undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    const selectStyle = {
        padding: '9px 14px',
        background: '#161B27',
        border: '1px solid #232A3E',
        borderRadius: 10,
        fontSize: 13,
        color: '#E8EAF0',
        outline: 'none',
        direction: 'rtl' as const,
        fontFamily: 'inherit',
    };

    return (
        <AdminLayout>
            <Head title="قوالب الإشعارات" />

            <div style={{ marginBottom: 4 }}>
                <div className="page-title">قوالب الإشعارات</div>
            </div>
            <div className="page-sub">
                {stats.total} قالباً — {stats.mandatory} إلزامي، {stats.optional} اختياري، {stats.inactive} معطَّل. نصوص
                الرسائل تُدار من هنا ولا تُكتب داخل الكود.
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالمفتاح أو النص..."
                    style={{ ...selectStyle, minWidth: 240 }}
                />
                <select value={filters?.group ?? ''} onChange={(e) => filterBy('group', e.target.value)} style={selectStyle}>
                    <option value="">كل المجموعات</option>
                    {groups.map((g) => (
                        <option key={g} value={g}>
                            {GROUP_LABELS[g] ?? g}
                        </option>
                    ))}
                </select>
                <select value={filters?.class ?? ''} onChange={(e) => filterBy('class', e.target.value)} style={selectStyle}>
                    <option value="">الكل</option>
                    <option value="mandatory">إلزامي</option>
                    <option value="optional">اختياري</option>
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <SortableHeader label="المجموعة" sortKey="group" sort={sort} />
                                <SortableHeader label="المفتاح" sortKey="key" sort={sort} />
                                <SortableHeader label="العنوان" sortKey="title_ar" sort={sort} />
                                <SortableHeader label="المستلم" sortKey="audience" sort={sort} />
                                <SortableHeader label="التصنيف" sortKey="class" sort={sort} />
                                <th>القنوات</th>
                                <SortableHeader label="الحالة" sortKey="active" sort={sort} />
                                <th>إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={templates.data.length}
                                columns={8}
                                emptyTitle="لا توجد قوالب مطابقة"
                                emptyHint="لا قالب إشعار مطابق للبحث والفلاتر الحالية."
                            />
                            {templates.data.map((template) => (
                                <tr key={template.id}>
                                    <td style={{ fontSize: 12, color: '#C8D0E0', whiteSpace: 'nowrap' }}>
                                        {GROUP_LABELS[template.group] ?? template.group}
                                    </td>
                                    <td style={{ direction: 'ltr', textAlign: 'right', fontSize: 12, color: '#6B7A99' }}>
                                        {template.key}
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{template.title_ar}</td>
                                    <td style={{ color: '#C8D0E0', fontSize: 13 }}>{template.audience ?? '—'}</td>
                                    <td>
                                        <ClassBadge value={template.class} />
                                    </td>
                                    <td style={{ fontSize: 12, color: '#6B7A99' }}>{(template.channels ?? []).join(' ← ')}</td>
                                    <td style={{ fontSize: 12, color: template.active ? '#009E82' : '#E03050' }}>
                                        {template.active ? 'مفعَّل' : 'معطَّل'}
                                    </td>
                                    <td>
                                        <button onClick={() => openEditor(template)} className="act-btn btn-view">
                                            تحرير
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={templates.links} />

            {editing && (
                <div className="detail-overlay open" onClick={() => setEditing(null)}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            تحرير القالب
                            <ClassBadge value={editing.class} />
                        </h3>
                        <div style={{ direction: 'ltr', textAlign: 'right', fontSize: 12, color: '#6B7A99', marginTop: 4 }}>
                            {editing.key}
                        </div>

                        {(editing.variables ?? []).length > 0 && (
                            <div style={{ marginTop: 12, fontSize: 12, color: '#6B7A99' }}>
                                المتحوّلات المتاحة:{' '}
                                {(editing.variables ?? []).map((v) => (
                                    <code
                                        key={v}
                                        style={{
                                            direction: 'ltr',
                                            display: 'inline-block',
                                            margin: '0 3px',
                                            padding: '2px 6px',
                                            background: '#161B27',
                                            border: '1px solid #232A3E',
                                            borderRadius: 6,
                                            color: '#C8FF00',
                                        }}
                                    >
                                        {`{${v}}`}
                                    </code>
                                ))}
                            </div>
                        )}

                        <form onSubmit={submit} style={{ marginTop: 16 }}>
                            {Object.keys(form.errors).length > 0 && (
                                <div
                                    style={{
                                        marginBottom: 12,
                                        padding: 10,
                                        borderRadius: 8,
                                        background: 'rgba(224,48,80,0.12)',
                                        color: '#E03050',
                                        fontSize: 13,
                                    }}
                                >
                                    {Object.values(form.errors).map((message) => (
                                        <div key={message}>{message}</div>
                                    ))}
                                </div>
                            )}

                            <div className="fg">
                                <label>العنوان (عربي)</label>
                                <input value={form.data.title_ar} onChange={(e) => form.setData('title_ar', e.target.value)} />
                            </div>
                            <div className="fg">
                                <label>النص (عربي)</label>
                                <textarea
                                    rows={4}
                                    value={form.data.body_ar}
                                    onChange={(e) => form.setData('body_ar', e.target.value)}
                                />
                            </div>
                            <div className="fg">
                                <label>العنوان (إنجليزي — اختياري)</label>
                                <input
                                    dir="ltr"
                                    value={form.data.title_en}
                                    onChange={(e) => form.setData('title_en', e.target.value)}
                                />
                            </div>
                            <div className="fg">
                                <label>النص (إنجليزي — اختياري)</label>
                                <textarea
                                    dir="ltr"
                                    rows={4}
                                    value={form.data.body_en}
                                    onChange={(e) => form.setData('body_en', e.target.value)}
                                />
                            </div>
                            <div className="fg">
                                <label>اسم قالب واتساب المعتمد</label>
                                <input
                                    dir="ltr"
                                    placeholder="يُملأ بعد اعتماد القالب لدى واتساب"
                                    value={form.data.whatsapp_template_name}
                                    onChange={(e) => form.setData('whatsapp_template_name', e.target.value)}
                                />
                            </div>

                            {editing.class === 'mandatory' ? (
                                <div style={{ fontSize: 12, color: '#6B7A99', marginTop: 8 }}>
                                    قالب إلزامي — لا يمكن تعطيله ولا إيقافه من تفضيلات المستخدم.
                                </div>
                            ) : (
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13 }}>
                                    <input
                                        type="checkbox"
                                        checked={form.data.active}
                                        onChange={(e) => form.setData('active', e.target.checked)}
                                    />
                                    مفعَّل
                                </label>
                            )}

                            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                                <button type="submit" disabled={form.processing} className="act-btn btn-approve">
                                    حفظ
                                </button>
                                <button type="button" onClick={() => setEditing(null)} className="act-btn btn-view">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
