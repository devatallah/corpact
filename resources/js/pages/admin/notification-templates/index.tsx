import { Head, useForm } from '@inertiajs/react';
import { FileText, Lock, Pencil } from 'lucide-react';
import { useState } from 'react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Field, IconButton, INPUT, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §19 — قوالب الإشعارات.
 *
 * A mandatory template cannot be switched off — not by the user and not by an
 * admin. These are the messages the platform owes people regardless of
 * preference: a payment claim, a cancellation, a seat offer. The toggle is
 * simply absent on those rows rather than present-and-failing.
 */
type Template = {
    id: number;
    key: string;
    group: string;
    audience: string;
    class: string;
    title_ar: string;
    title_en: string | null;
    body_ar: string;
    body_en: string | null;
    channels: string[] | null;
    whatsapp_template_name: string | null;
    active: boolean;
};

export default function NotificationTemplates({
    templates,
    groups,
    stats,
    filters,
    sort,
}: {
    templates: Paginated<Template>;
    groups: string[];
    stats: { total: number; mandatory: number; optional: number; inactive: number };
    filters: { search?: string; group?: string; class?: string };
    sort: SortState;
}) {
    const [editing, setEditing] = useState<Template | null>(null);
    const form = useForm({ title_ar: '', title_en: '', body_ar: '', body_en: '', whatsapp_template_name: '', active: true });

    function startEditing(template: Template) {
        form.setData({
            title_ar: template.title_ar,
            title_en: template.title_en ?? '',
            body_ar: template.body_ar,
            body_en: template.body_en ?? '',
            whatsapp_template_name: template.whatsapp_template_name ?? '',
            active: template.active,
        });
        setEditing(template);
    }

    return (
        <AdminLayout>
            <Head title="قوالب الإشعارات" />

            <PageHeader
                icon={FileText}
                title="قوالب الإشعارات"
                subtitle="نصوص الرسائل التي ترسلها المنصة. القوالب الإلزامية لا تُعطَّل — لا من المستخدم ولا من الأدمن."
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي القوالب" value={stats.total} />
                <StatCard label="إلزامية" value={stats.mandatory} />
                <StatCard label="اختيارية" value={stats.optional} />
                <StatCard label="معطّلة" value={stats.inactive} tone={stats.inactive > 0 ? 'warning' : 'success'} />
            </div>

            {editing && (
                <Card padding="p-4" className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-extrabold text-ink">تعديل القالب</h2>
                        <span className="font-mono text-[11px] text-ink/50">{editing.key}</span>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.put(`/admin/notification-templates/${editing.id}`, {
                                preserveScroll: true,
                                onSuccess: () => setEditing(null),
                            });
                        }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="العنوان بالعربية" htmlFor="tpl-title-ar" required error={form.errors.title_ar}>
                                <input
                                    id="tpl-title-ar"
                                    type="text"
                                    required
                                    value={form.data.title_ar}
                                    onChange={(event) => form.setData('title_ar', event.target.value)}
                                    className={INPUT}
                                />
                            </Field>
                            <Field label="العنوان بالإنجليزية" htmlFor="tpl-title-en">
                                <input
                                    id="tpl-title-en"
                                    type="text"
                                    dir="ltr"
                                    value={form.data.title_en}
                                    onChange={(event) => form.setData('title_en', event.target.value)}
                                    className={`${INPUT} text-right`}
                                />
                            </Field>
                        </div>

                        <Field label="النص بالعربية" htmlFor="tpl-body-ar" required error={form.errors.body_ar}>
                            <textarea
                                id="tpl-body-ar"
                                rows={3}
                                required
                                value={form.data.body_ar}
                                onChange={(event) => form.setData('body_ar', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="النص بالإنجليزية" htmlFor="tpl-body-en">
                            <textarea
                                id="tpl-body-en"
                                rows={3}
                                dir="ltr"
                                value={form.data.body_en}
                                onChange={(event) => form.setData('body_en', event.target.value)}
                                className={`${INPUT} text-right`}
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                            <Field label="اسم قالب واتساب المعتمد" htmlFor="tpl-wa">
                                <input
                                    id="tpl-wa"
                                    type="text"
                                    dir="ltr"
                                    value={form.data.whatsapp_template_name}
                                    onChange={(event) => form.setData('whatsapp_template_name', event.target.value)}
                                    className={`${INPUT} text-right font-mono`}
                                />
                            </Field>

                            {editing.class === 'mandatory' ? (
                                <div className="flex items-center gap-2 text-xs text-ink/60 pb-2">
                                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>قالب إلزامي — لا يُعطَّل.</span>
                                </div>
                            ) : (
                                <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer pb-2">
                                    <input
                                        type="checkbox"
                                        checked={form.data.active}
                                        onChange={(event) => form.setData('active', event.target.checked)}
                                        className="w-4 h-4 accent-lime cursor-pointer"
                                    />
                                    القالب مفعّل
                                </label>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.processing}>
                                حفظ القالب
                            </Button>
                            <Button type="button" tone="soft" onClick={() => setEditing(null)}>
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالمفتاح أو العنوان…" />
                    <FilterSelect
                        name="group"
                        label="المجموعة"
                        value={filters.group ?? ''}
                        options={[['', 'كل المجموعات'], ...groups.map((group): [string, string] => [group, group])]}
                    />
                    <FilterSelect
                        name="class"
                        label="التصنيف"
                        value={filters.class ?? ''}
                        options={[
                            ['', 'الكل'],
                            ['mandatory', 'إلزامية'],
                            ['optional', 'اختيارية'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="المجموعة" sortKey="group" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="القالب" sortKey="key" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="الجمهور" sortKey="audience" sort={sort} />
                        </Th>
                        <Th>القنوات</Th>
                        <Th>
                            <SortableHeader label="التصنيف" sortKey="class" sort={sort} />
                        </Th>
                        <Th className="text-center">تعديل</Th>
                    </Thead>

                    <Tbody>
                        {templates.data.map((template) => (
                            <Tr key={template.id}>
                                <Td className="text-ink/70">{template.group}</Td>
                                <Td>
                                    <span className="font-extrabold text-ink block">{template.title_ar}</span>
                                    <span className="font-mono text-[10px] text-ink/45">{template.key}</span>
                                    {!template.active && <Badge tone="neutral">معطّل</Badge>}
                                </Td>
                                <Td className="text-ink/70">{template.audience}</Td>
                                <Td>
                                    <div className="flex flex-wrap gap-1">
                                        {(template.channels ?? []).map((channel) => (
                                            <span key={channel} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-ink/5 text-ink/70">
                                                {channel}
                                            </span>
                                        ))}
                                    </div>
                                </Td>
                                <Td>
                                    <Badge tone={template.class === 'mandatory' ? 'warning' : 'neutral'} icon={template.class === 'mandatory' ? Lock : undefined}>
                                        {template.class === 'mandatory' ? 'إلزامي' : 'اختياري'}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <IconButton icon={Pencil} label="تعديل القالب" onClick={() => startEditing(template)} />
                                </Td>
                            </Tr>
                        ))}

                        <ListStates count={templates.data.length} colSpan={6} empty="لا قوالب مطابقة." />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={templates} />
                    <Pagination page={templates} />
                </div>
            </Card>

            <Note title="لماذا لا يمكن تعطيل الإلزامي؟">
                القوالب الإلزامية هي ما تدين به المنصة للمستخدم بصرف النظر عن تفضيلاته: مطالبة سداد، إلغاء فعالية، عرض مقعد.
                تعطيلها يعني أن يخسر أحدهم مقعده أو ماله دون أن يُبلَّغ.
            </Note>
        </AdminLayout>
    );
}
