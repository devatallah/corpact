import { Head, router, useForm } from '@inertiajs/react';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Field, IconButton, INPUT, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §16 — فريق تيمات الداخلي، وفصل الأدوار.
 *
 * «حساب واحد هنا يكفي للوصول إلى كل الأموال» — which is why this list exists
 * as its own screen, why a phone is mandatory (the second factor has to reach
 * somewhere), and why every grant lands in the quarterly permission review.
 */
type AdminRow = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    role: string | null;
    roles: string[];
    created_at: string | null;
};

const ROLE_LABELS: Record<string, { label: string; tone: 'neutral' | 'warning' | 'danger' | 'lime' }> = {
    platform_admin: { label: 'أدمن المنصة', tone: 'danger' },
    finance_admin: { label: 'الأدمن المالي', tone: 'warning' },
    support_agent: { label: 'وكيل الدعم', tone: 'neutral' },
};

export default function AdminAdmins({
    admins,
    totalAdmins,
    filters,
    sort,
}: {
    admins: Paginated<AdminRow>;
    totalAdmins: number;
    filters: { search?: string; status?: string };
    sort: SortState;
}) {
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState<AdminRow | null>(null);
    const form = useForm({ name: '', email: '', phone: '', password: '', role: 'support_agent' });

    return (
        <AdminLayout>
            <Head title="المشرفون" />

            <PageHeader
                icon={KeyRound}
                title="فريق تيمات الداخلي"
                subtitle="ثلاثة أدوار مفصولة: أدمن المنصة (كل شيء عدا الاعتماد المالي)، الأدمن المالي (الاعتمادات)، وكيل الدعم (قراءة وتدخل محدود)."
                actions={
                    <Button icon={Plus} onClick={() => setAdding(true)}>
                        إضافة مشرف
                    </Button>
                }
            />

            <Note tone="warning" title="مبدأ أقل صلاحية">
                امنح وكيل الدعم أولاً، ولا ترفع إلى أدمن المنصة إلا لحاجة قائمة. كل تعيين يظهر في المراجعة الربع سنوية
                للصلاحيات ويُقيَّد في سجل التدقيق.
            </Note>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="إجمالي المشرفين" value={totalAdmins} />
                <StatCard
                    label="أدمن المنصة"
                    value={admins.data.filter((admin) => admin.roles.includes('platform_admin')).length}
                    hint="في هذه الصفحة"
                    tone="warning"
                />
                <StatCard label="المعروض بعد التصفية" value={admins.total} />
            </div>

            {adding && (
                <Card padding="p-4" className="space-y-4">
                    <h2 className="text-sm font-extrabold text-ink">مشرف جديد</h2>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/admin/admins', {
                                preserveScroll: true,
                                onSuccess: () => {
                                    form.reset();
                                    setAdding(false);
                                },
                            });
                        }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <Field label="الاسم" htmlFor="admin-name" required error={form.errors.name}>
                                <input
                                    id="admin-name"
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    className={INPUT}
                                />
                            </Field>
                            <Field label="البريد المؤسسي" htmlFor="admin-email" required error={form.errors.email}>
                                <input
                                    id="admin-email"
                                    type="email"
                                    dir="ltr"
                                    required
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    className={`${INPUT} text-right font-mono`}
                                />
                            </Field>
                            <Field
                                label="رقم الجوال"
                                htmlFor="admin-phone"
                                required
                                hint="إلزامي — إليه يصل العامل الثاني"
                                error={form.errors.phone}
                            >
                                <input
                                    id="admin-phone"
                                    type="tel"
                                    dir="ltr"
                                    required
                                    value={form.data.phone}
                                    onChange={(event) => form.setData('phone', event.target.value)}
                                    className={`${INPUT} text-right font-mono`}
                                />
                            </Field>
                            <Field label="كلمة المرور المبدئية" htmlFor="admin-password" required error={form.errors.password}>
                                <input
                                    id="admin-password"
                                    type="password"
                                    required
                                    value={form.data.password}
                                    onChange={(event) => form.setData('password', event.target.value)}
                                    className={INPUT}
                                />
                            </Field>
                            <Field label="الدور" htmlFor="admin-role" required error={form.errors.role}>
                                <select
                                    id="admin-role"
                                    value={form.data.role}
                                    onChange={(event) => form.setData('role', event.target.value)}
                                    className={`${INPUT} cursor-pointer`}
                                >
                                    <option value="support_agent">وكيل الدعم</option>
                                    <option value="finance_admin">الأدمن المالي</option>
                                    <option value="platform_admin">أدمن المنصة</option>
                                </select>
                            </Field>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.processing}>
                                إنشاء الحساب
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
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالاسم أو البريد…" />
                    <FilterSelect
                        name="status"
                        label="حالة الحساب"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['active', 'مفعّل'],
                            ['inactive', 'معطّل'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="المشرف" sortKey="name" sort={sort} />
                        </Th>
                        <Th>الجوال</Th>
                        <Th>الأدوار</Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="أُنشئ في" sortKey="created_at" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {admins.data.map((admin) => (
                            <Tr key={admin.id}>
                                <Td>
                                    <span className="font-extrabold text-ink block">{admin.name}</span>
                                    <span className="font-mono text-[11px] text-ink/50" dir="ltr">
                                        {admin.email}
                                    </span>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/80" dir="ltr">
                                    {admin.phone ?? (
                                        <span className="font-arabic text-danger font-bold" dir="rtl">
                                            بلا جوال — لا يمكنه الدخول
                                        </span>
                                    )}
                                </Td>
                                <Td>
                                    <div className="flex flex-wrap gap-1">
                                        {admin.roles.map((role) => (
                                            <Badge key={role} tone={ROLE_LABELS[role]?.tone ?? 'neutral'}>
                                                {ROLE_LABELS[role]?.label ?? role}
                                            </Badge>
                                        ))}
                                        {admin.roles.length === 0 && <span className="text-ink/45">—</span>}
                                    </div>
                                </Td>
                                <Td>
                                    <Badge tone={admin.status === 'active' ? 'success' : 'neutral'}>
                                        {admin.status === 'active' ? 'مفعّل' : 'معطّل'}
                                    </Badge>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/60">
                                    {admin.created_at ? new Date(admin.created_at).toLocaleDateString('ar-SA') : '—'}
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <IconButton
                                            icon={KeyRound}
                                            label="إرسال رابط إعادة تعيين كلمة المرور"
                                            onClick={() => router.post(`/admin/admins/${admin.id}/reset-password`, {}, { preserveScroll: true })}
                                        />
                                        <IconButton
                                            icon={Trash2}
                                            label="إزالة صلاحيات المشرف"
                                            tone="danger"
                                            onClick={() => setRemoving(admin)}
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates count={admins.data.length} colSpan={6} empty="لا يوجد مشرفون مطابقون." />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={admins} />
                    <Pagination page={admins} />
                </div>
            </Card>

            <ConfirmModal
                open={removing !== null}
                tone="danger"
                title="إزالة صلاحيات المشرف"
                message="يفقد الحساب وصوله إلى البوابة الداخلية فوراً. سجلاته في التدقيق تبقى منسوبة إليه."
                details={
                    removing && (
                        <>
                            <ConfirmRow label="المشرف" value={removing.name} strong />
                            <ConfirmRow label="البريد" value={removing.email} />
                            <ConfirmRow
                                label="الأدوار المُزالة"
                                value={removing.roles.map((role) => ROLE_LABELS[role]?.label ?? role).join(' · ') || '—'}
                            />
                        </>
                    )
                }
                confirmLabel="إزالة الصلاحيات"
                onConfirm={() => {
                    router.delete(`/admin/admins/${removing?.id}`, { preserveScroll: true });
                    setRemoving(null);
                }}
                onCancel={() => setRemoving(null)}
            />
        </AdminLayout>
    );
}
