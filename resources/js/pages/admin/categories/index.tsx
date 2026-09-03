import { Head, router, useForm } from '@inertiajs/react';
import { Plus, RotateCcw, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Field, IconButton, INPUT, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §16 — شجرة الفئات والأنشطة.
 *
 * The tree is the vocabulary the whole product speaks: an employee picks
 * interests from it, a provider is listed under it, and the suggestion engine
 * matches on it. Deleting a category soft-deletes it — history that already
 * points at it must keep resolving, so it is disabled, never erased.
 */
type CategoryRow = {
    id: number;
    name: string;
    name_en: string | null;
    icon: string | null;
    parent_id: number | null;
    deleted_at: string | null;
    communities_count: number;
    venues_count: number;
    events_count: number;
    parent?: { id: number; name: string } | null;
};

export default function AdminCategories({
    categories,
    parentCategories,
    totalSports,
    filters,
    sort,
}: {
    categories: Paginated<CategoryRow>;
    parentCategories: { id: number; name: string }[];
    totalSports: number;
    filters: { search?: string; parent_id?: string };
    sort: SortState;
}) {
    const [adding, setAdding] = useState(false);
    const [toggling, setToggling] = useState<{ category: CategoryRow; action: 'disable' | 'restore' } | null>(null);
    const form = useForm<{ name: string; name_en: string; parent_id: string }>({ name: '', name_en: '', parent_id: '' });

    return (
        <AdminLayout>
            <Head title="الفئات والأنشطة" />

            <PageHeader
                icon={Tags}
                title="شجرة الفئات والأنشطة"
                subtitle="المفردات التي يختار منها الموظف اهتماماته ويُدرج تحتها المزوّد — وعليها يطابق محرك الاقتراحات."
                actions={
                    <Button icon={Plus} onClick={() => setAdding(true)}>
                        إضافة فئة
                    </Button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="إجمالي الفئات" value={totalSports} />
                <StatCard label="الفئات الرئيسية" value={parentCategories.length} />
                <StatCard label="المعروض بعد التصفية" value={categories.total} />
            </div>

            {adding && (
                <Card padding="p-4" className="space-y-4">
                    <h2 className="text-sm font-extrabold text-ink">فئة جديدة</h2>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/admin/categories', {
                                preserveScroll: true,
                                onSuccess: () => {
                                    form.reset();
                                    setAdding(false);
                                },
                            });
                        }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Field label="الاسم بالعربية" htmlFor="category-name" required error={form.errors.name}>
                                <input
                                    id="category-name"
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    className={INPUT}
                                />
                            </Field>
                            <Field label="الاسم بالإنجليزية" htmlFor="category-name-en" error={form.errors.name_en}>
                                <input
                                    id="category-name-en"
                                    type="text"
                                    dir="ltr"
                                    value={form.data.name_en}
                                    onChange={(event) => form.setData('name_en', event.target.value)}
                                    className={`${INPUT} text-right`}
                                />
                            </Field>
                            <Field label="الفئة الأمّ" htmlFor="category-parent" hint="اتركه فارغاً لفئة رئيسية">
                                <select
                                    id="category-parent"
                                    value={form.data.parent_id}
                                    onChange={(event) => form.setData('parent_id', event.target.value)}
                                    className={`${INPUT} cursor-pointer`}
                                >
                                    <option value="">— فئة رئيسية —</option>
                                    {parentCategories.map((parent) => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.processing}>
                                حفظ الفئة
                            </Button>
                            <Button
                                type="button"
                                tone="soft"
                                onClick={() => {
                                    form.reset();
                                    setAdding(false);
                                }}
                            >
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالاسم العربي أو الإنجليزي…" />
                    <FilterSelect
                        name="parent_id"
                        label="الفئة الأمّ"
                        value={filters.parent_id ?? ''}
                        options={[
                            ['', 'الشجرة كاملة'],
                            ['root', 'الفئات الرئيسية فقط'],
                            ...parentCategories.map((parent): [string, string] => [String(parent.id), parent.name]),
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="الفئة" sortKey="name" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="بالإنجليزية" sortKey="name_en" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="المجتمعات" sortKey="communities_count" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="المرافق" sortKey="venues_count" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الفعاليات" sortKey="events_count" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>

                    <Tbody>
                        {categories.data.map((category) => (
                            <Tr key={category.id}>
                                <Td>
                                    <span className={`font-extrabold ${category.parent_id === null ? 'text-ink' : 'text-ink/85 ps-4'}`}>
                                        {category.parent_id !== null && <span className="text-ink/30">↳ </span>}
                                        {category.name}
                                    </span>
                                    {category.parent && <span className="block text-[11px] text-ink/45">تحت {category.parent.name}</span>}
                                    {category.deleted_at && <Badge tone="neutral">معطّلة</Badge>}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70" dir="ltr">
                                    {category.name_en ?? '—'}
                                </Td>
                                <Td className="font-mono font-bold text-ink">{category.communities_count}</Td>
                                <Td className="font-mono font-bold text-ink">{category.venues_count}</Td>
                                <Td className="font-mono font-bold text-ink">{category.events_count}</Td>
                                <Td className="text-center">
                                    {category.deleted_at ? (
                                        <IconButton
                                            icon={RotateCcw}
                                            label="إعادة التفعيل"
                                            onClick={() => setToggling({ category, action: 'restore' })}
                                        />
                                    ) : (
                                        <IconButton
                                            icon={Trash2}
                                            label="تعطيل الفئة"
                                            tone="danger"
                                            onClick={() => setToggling({ category, action: 'disable' })}
                                        />
                                    )}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={categories.data.length}
                            colSpan={6}
                            empty="لا توجد فئات مطابقة."
                            emptyHint="جرّب مصطلحاً آخر أو اعرض الشجرة كاملة."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={categories} />
                    <Pagination page={categories} />
                </div>
            </Card>

            <Note title="لماذا تُعطَّل الفئة ولا تُحذف؟">
                فعاليات ومجتمعات ومرافق قائمة تشير إلى الفئة، وسجلها المالي والتاريخي يجب أن يبقى قابلاً للقراءة. التعطيل يمنع
                الاختيار الجديد ويُبقي القديم مفهوماً.
            </Note>

            <ConfirmModal
                open={toggling !== null}
                tone={toggling?.action === 'disable' ? 'danger' : 'default'}
                title={toggling?.action === 'disable' ? 'تعطيل الفئة' : 'إعادة تفعيل الفئة'}
                message={
                    toggling?.action === 'disable'
                        ? 'لن تظهر الفئة في اختيارات الموظفين ولا في إدراج المرافق الجديدة. السجلات القائمة تبقى كما هي.'
                        : 'تعود الفئة للظهور في الاختيارات وإدراج المرافق.'
                }
                details={
                    toggling && (
                        <>
                            <ConfirmRow label="الفئة" value={toggling.category.name} strong />
                            <ConfirmRow label="مجتمعات مرتبطة" value={String(toggling.category.communities_count)} />
                            <ConfirmRow label="مرافق مرتبطة" value={String(toggling.category.venues_count)} />
                        </>
                    )
                }
                confirmLabel={toggling?.action === 'disable' ? 'تعطيل' : 'إعادة التفعيل'}
                onConfirm={() => {
                    if (toggling?.action === 'disable') {
                        router.delete(`/admin/categories/${toggling.category.id}`, { preserveScroll: true });
                    } else {
                        router.post(`/admin/categories/${toggling?.category.id}/restore`, {}, { preserveScroll: true });
                    }

                    setToggling(null);
                }}
                onCancel={() => setToggling(null)}
            />
        </AdminLayout>
    );
}
