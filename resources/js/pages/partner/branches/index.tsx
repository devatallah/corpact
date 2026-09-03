import { Head, router, useForm } from '@inertiajs/react';
import { Building, Lock, MapPin, Pencil, Plus, Trash2, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import {
    Pagination,
    ResultCount,
    SearchInput,
    SortableHeader,
    Toolbar,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Badge, Button, Card, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §17 — الفروع ووحدات النشاط.
 *
 * A unit is what actually gets booked, so its capacity range and price are
 * the two fields with consequences. Under a price contract a new price does
 * *not* take effect on save — it becomes a pending change for a Teamat admin
 * to approve, and the old price keeps applying meanwhile. That is stated on
 * the price field itself rather than in the flash message afterwards: by then
 * the provider has already assumed the new rate is live.
 */
type Unit = {
    id: number;
    name: string;
    category_id: number;
    min_capacity: number;
    max_capacity: number;
    pricing_type: string;
    price: string | number;
    default_duration_minutes: number;
    status: string;
    category?: { id: number; name: string } | null;
    price_changes?: {
        id: number;
        old_price: string;
        new_price: string;
        status: string;
    }[];
};

type WorkingHours = Record<string, { from: string; to: string }[]> | null;

type Branch = {
    working_hours?: WorkingHours;
    id: number;
    name: string;
    address: string | null;
    city: string | null;
    district: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    status: string;
    units?: Unit[];
};

const PRICING_LABEL: Record<string, string> = {
    unit_hour: 'بالساعة للوحدة',
    package: 'باقة',
    per_person: 'للشخص',
};

const UNIT_STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
    active: { label: 'متاحة', tone: 'success' },
    maintenance: { label: 'تحت الصيانة', tone: 'warning' },
    disabled: { label: 'معطّلة', tone: 'neutral' },
};

export default function PartnerBranches({
    partner,
    branches,
    filters,
    sort,
    categories,
}: {
    partner: {
        id: number;
        name: string;
        trade_name: string | null;
        has_price_contract: boolean;
    };
    branches: Paginated<Branch>;
    filters: { search?: string };
    sort: SortState;
    categories: { id: number; name: string }[];
}) {
    const [addingBranch, setAddingBranch] = useState(false);
    const [addingUnitTo, setAddingUnitTo] = useState<Branch | null>(null);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
    const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

    const branchForm = useForm({
        name: '',
        address: '',
        city: '',
        district: '',
        contact_name: '',
        contact_phone: '',
        status: 'active',
    });

    return (
        <PartnerLayout>
            <Head title="الفروع والوحدات" />

            <PageHeader
                icon={Building}
                title="الفروع ووحدات الأنشطة والأسعار"
                badge={`${branches.total} فروع · ${branches.data.reduce((sum, branch) => sum + (branch.units?.length ?? 0), 0)} وحدات`}
                subtitle="إدارة طاقتك الاستيعابية وأسعارك المعتمدة. جميع الأسعار بالريال وشاملة ضريبة القيمة المضافة 15٪."
                actions={
                    <Button
                        type="button"
                        icon={Plus}
                        onClick={() => setAddingBranch(true)}
                    >
                        فرع جديد
                    </Button>
                }
            />

            <Note tone="info" title="حوكمة الأنشطة والتسعير في تيمات">
                الأنشطة والفئات تُدار مركزياً لدى تيمات — تختار منها ولا تضيف إليها، حتى تبقى التقارير والاقتراح الآلي متسقة.
                وتعديل السعر يسري على الطلبات المستقبلية وحدها؛ الطلب المقبول يبقى بسعره المتفق عليه.
            </Note>

            {partner.has_price_contract && (
                <Note tone="warning" title="أنت تحت عقد سعر">
                    تعديل سعر أي وحدة لا يسري فور الحفظ: يُرفع كطلب تغيير يعتمده
                    أدمن تيمات، ويبقى السعر القائم ساري المفعول حتى ذلك الحين.
                </Note>
            )}

            {addingBranch && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        branchForm.post('/partner/branches', {
                            preserveScroll: true,
                            onSuccess: () => {
                                branchForm.reset();
                                setAddingBranch(false);
                            },
                        });
                    }}
                    className="space-y-6"
                >
                    <FormSection title="فرع جديد">
                        <FormGrid>
                            <Field
                                label="اسم الفرع"
                                error={branchForm.errors.name}
                                required
                            >
                                <input
                                    className={INPUT}
                                    value={branchForm.data.name}
                                    onChange={(event) =>
                                        branchForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="المدينة"
                                error={branchForm.errors.city}
                            >
                                <input
                                    className={INPUT}
                                    value={branchForm.data.city}
                                    onChange={(event) =>
                                        branchForm.setData(
                                            'city',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="الحي"
                                error={branchForm.errors.district}
                            >
                                <input
                                    className={INPUT}
                                    value={branchForm.data.district}
                                    onChange={(event) =>
                                        branchForm.setData(
                                            'district',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="اسم المسؤول"
                                error={branchForm.errors.contact_name}
                            >
                                <input
                                    className={INPUT}
                                    value={branchForm.data.contact_name}
                                    onChange={(event) =>
                                        branchForm.setData(
                                            'contact_name',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="جوال المسؤول"
                                error={branchForm.errors.contact_phone}
                            >
                                <input
                                    dir="ltr"
                                    className={INPUT}
                                    value={branchForm.data.contact_phone}
                                    onChange={(event) =>
                                        branchForm.setData(
                                            'contact_phone',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </FormGrid>

                        <Field
                            label="العنوان"
                            error={branchForm.errors.address}
                        >
                            <input
                                className={INPUT}
                                value={branchForm.data.address}
                                onChange={(event) =>
                                    branchForm.setData(
                                        'address',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </FormSection>

                    <FormActions>
                        <Button
                            type="submit"
                            disabled={
                                branchForm.processing ||
                                !branchForm.data.name.trim()
                            }
                        >
                            إضافة الفرع
                        </Button>
                        <Button
                            type="button"
                            tone="soft"
                            onClick={() => setAddingBranch(false)}
                        >
                            إلغاء
                        </Button>
                    </FormActions>
                </form>
            )}

            <Card padding="p-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث باسم الفرع أو المدينة…"
                    />
                    <div className="flex items-center gap-3 text-[11px] text-ink/55">
                        <SortableHeader
                            label="الاسم"
                            sortKey="name"
                            sort={sort}
                        />
                        <SortableHeader
                            label="المدينة"
                            sortKey="city"
                            sort={sort}
                        />
                        <SortableHeader
                            label="الحالة"
                            sortKey="status"
                            sort={sort}
                        />
                    </div>
                </Toolbar>
            </Card>

            {branches.data.map((branch) => (
                <Card key={branch.id} padding="p-4" className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="text-sm font-extrabold text-ink">
                                {branch.name}
                            </h2>
                            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink/55">
                                <MapPin
                                    className="h-3 w-3 shrink-0"
                                    aria-hidden="true"
                                />
                                {[branch.district, branch.city]
                                    .filter(Boolean)
                                    .join('، ') ||
                                    branch.address ||
                                    '—'}
                                {branchHours(branch) && (
                                    <>
                                        <span className="text-ink/25">·</span>
                                        <span className="font-mono">
                                            ساعات العمل: {branchHours(branch)}
                                        </span>
                                    </>
                                )}
                            </span>
                            {(branch.contact_name || branch.contact_phone) && (
                                <span className="mt-0.5 block text-[10px] text-ink/50">
                                    المسؤول: {branch.contact_name ?? '—'}
                                    {branch.contact_phone && (
                                        <span className="font-mono" dir="ltr">
                                            {' '}
                                            ({branch.contact_phone})
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Badge
                                tone={
                                    branch.status === 'active'
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {branch.status === 'active' ? 'يعمل' : 'موقوف'}
                            </Badge>
                            <Button
                                type="button"
                                tone="soft"
                                icon={Plus}
                                onClick={() => setAddingUnitTo(branch)}
                            >
                                وحدة نشاط
                            </Button>
                            <Button
                                type="button"
                                tone="danger"
                                icon={Trash2}
                                onClick={() => setDeletingBranch(branch)}
                            >
                                حذف
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {(branch.units ?? []).map((unit) => {
                            const pendingChange = (
                                unit.price_changes ?? []
                            ).find((change) => change.status === 'pending');

                            return (
                                <div
                                    key={unit.id}
                                    className="space-y-2 rounded-2xl border-[0.5px] border-ink/12 bg-page p-3.5"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <span className="block truncate text-xs font-extrabold text-ink">
                                                {unit.name}
                                            </span>
                                            <span className="block text-[11px] text-ink/55">
                                                {unit.category?.name ?? '—'}
                                            </span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <Badge
                                                tone={
                                                    UNIT_STATUS[unit.status]
                                                        ?.tone ?? 'neutral'
                                                }
                                            >
                                                {UNIT_STATUS[unit.status]
                                                    ?.label ?? unit.status}
                                            </Badge>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingUnit(unit)
                                                }
                                                aria-label="تعديل الوحدة"
                                                className="rounded-lg bg-ink/5 p-1.5 text-ink transition-colors hover:bg-ink/10"
                                            >
                                                <Pencil
                                                    className="h-3 w-3"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeletingUnit(unit)
                                                }
                                                aria-label="حذف الوحدة"
                                                className="rounded-lg bg-danger/8 p-1.5 text-danger transition-colors hover:bg-danger/15"
                                            >
                                                <Trash2
                                                    className="h-3 w-3"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 font-mono text-[11px] text-ink/70">
                                        <span>
                                            {unit.min_capacity}–
                                            {unit.max_capacity} شخصاً
                                        </span>
                                        <span className="text-ink/25">·</span>
                                        <span>
                                            {unit.default_duration_minutes} د
                                        </span>
                                        <span className="text-ink/25">·</span>
                                        <span className="font-black text-ink">
                                            {unit.price}
                                        </span>
                                        <span className="text-ink/50">
                                            {PRICING_LABEL[unit.pricing_type] ??
                                                unit.pricing_type}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                        <span className="text-ink/50">
                                            شامل 15٪ ضريبة
                                        </span>
                                        <span className="text-ink/25">·</span>
                                        <span className="inline-flex items-center gap-1 text-ink/60">
                                            <Lock
                                                className="h-2.5 w-2.5 shrink-0"
                                                aria-hidden="true"
                                            />
                                            الإجمالي مجمَّد بعد القبول
                                        </span>
                                    </div>

                                    {pendingChange && (
                                        <div className="flex items-center gap-1.5 rounded-lg bg-warning-tint px-2 py-1 text-[10px] font-bold text-warning">
                                            <TriangleAlert
                                                className="h-3 w-3 shrink-0"
                                                aria-hidden="true"
                                            />
                                            تغيير سعر بانتظار الاعتماد:{' '}
                                            {pendingChange.old_price} ←{' '}
                                            {pendingChange.new_price}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {(branch.units ?? []).length === 0 && (
                            <p className="col-span-full py-4 text-center text-xs text-ink/55">
                                لا وحدات في هذا الفرع — لن تصلك عليه طلبات حتى
                                تضيف وحدة واحدة على الأقل.
                            </p>
                        )}
                    </div>
                </Card>
            ))}

            <Card padding="p-4" className="space-y-3">
                <ListStates
                    count={branches.data.length}
                    empty="لا فروع مطابقة."
                    emptyHint="أضف فرعك الأول، ثم أضف تحته وحدات النشاط التي تُحجز."
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={branches} />
                    <Pagination page={branches} />
                </div>
            </Card>

            {/* ── نموذج الوحدة (إضافة/تعديل) ── */}
            {(addingUnitTo || editingUnit) && (
                <UnitForm
                    key={editingUnit?.id ?? `new-${addingUnitTo?.id}`}
                    unit={editingUnit}
                    branch={addingUnitTo}
                    categories={categories}
                    hasPriceContract={partner.has_price_contract}
                    onDone={() => {
                        setAddingUnitTo(null);
                        setEditingUnit(null);
                    }}
                />
            )}

            <ConfirmModal
                open={deletingBranch !== null}
                tone="danger"
                title="حذف الفرع"
                message="تُحذف كل وحدات النشاط تحته، ولن تصلك عليه طلبات جديدة. الحجوزات القائمة على وحداته لا تُلغى تلقائياً — راجعها أولاً."
                details={
                    deletingBranch && (
                        <>
                            <ConfirmRow
                                label="الفرع"
                                value={deletingBranch.name}
                                strong
                            />
                            <ConfirmRow
                                label="وحدات النشاط"
                                value={`${deletingBranch.units?.length ?? 0} وحدة تُحذف معه`}
                                strong
                            />
                        </>
                    )
                }
                confirmLabel="نعم، احذف الفرع"
                onConfirm={() => {
                    router.delete(`/partner/branches/${deletingBranch?.id}`, {
                        preserveScroll: true,
                    });
                    setDeletingBranch(null);
                }}
                onCancel={() => setDeletingBranch(null)}
            />

            <ConfirmModal
                open={deletingUnit !== null}
                tone="danger"
                title="حذف وحدة النشاط"
                message="لن تُعرض هذه الوحدة للحجز بعد الآن. إن كان عليها حجوزات قادمة فراجعها قبل الحذف."
                details={
                    deletingUnit && (
                        <>
                            <ConfirmRow
                                label="الوحدة"
                                value={deletingUnit.name}
                                strong
                            />
                            <ConfirmRow
                                label="السعر الحالي"
                                value={`${deletingUnit.price} ر.س`}
                            />
                        </>
                    )
                }
                confirmLabel="نعم، احذف الوحدة"
                onConfirm={() => {
                    router.delete(`/partner/units/${deletingUnit?.id}`, {
                        preserveScroll: true,
                    });
                    setDeletingUnit(null);
                }}
                onCancel={() => setDeletingUnit(null)}
            />
        </PartnerLayout>
    );
}

function UnitForm({
    unit,
    branch,
    categories,
    hasPriceContract,
    onDone,
}: {
    unit: Unit | null;
    branch: Branch | null;
    categories: { id: number; name: string }[];
    hasPriceContract: boolean;
    onDone: () => void;
}) {
    const form = useForm({
        category_id: unit ? String(unit.category_id) : '',
        name: unit?.name ?? '',
        min_capacity: String(unit?.min_capacity ?? 2),
        max_capacity: String(unit?.max_capacity ?? 20),
        pricing_type: unit?.pricing_type ?? 'unit_hour',
        price: String(unit?.price ?? ''),
        default_duration_minutes: String(unit?.default_duration_minutes ?? 60),
        status: unit?.status ?? 'active',
    });

    const priceChanged =
        unit !== null && String(form.data.price) !== String(unit.price);

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                const options = { preserveScroll: true, onSuccess: onDone };

                if (unit) {
                    form.put(`/partner/units/${unit.id}`, options);
                } else {
                    form.post(`/partner/branches/${branch?.id}/units`, options);
                }
            }}
            className="space-y-6"
        >
            <FormSection
                title={
                    unit
                        ? `تعديل ${unit.name}`
                        : `وحدة نشاط جديدة في ${branch?.name ?? ''}`
                }
                hint="السعة تحدد أي الفعاليات تُعرض عليك: فعالية بعشرين مشاركاً لا تصل وحدةً سعتها القصوى عشرة."
            >
                <FormGrid>
                    <Field label="اسم الوحدة" error={form.errors.name} required>
                        <input
                            className={INPUT}
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        label="الفئة"
                        error={form.errors.category_id}
                        required
                    >
                        <select
                            className={INPUT}
                            value={form.data.category_id}
                            onChange={(event) =>
                                form.setData('category_id', event.target.value)
                            }
                        >
                            <option value="">— اختر الفئة —</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="أقل عدد"
                        error={form.errors.min_capacity}
                        required
                    >
                        <input
                            type="number"
                            min="1"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.min_capacity}
                            onChange={(event) =>
                                form.setData('min_capacity', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        label="أكبر عدد"
                        error={form.errors.max_capacity}
                        required
                    >
                        <input
                            type="number"
                            min="1"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.max_capacity}
                            onChange={(event) =>
                                form.setData('max_capacity', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        label="نوع التسعير"
                        error={form.errors.pricing_type}
                        required
                    >
                        <select
                            className={INPUT}
                            value={form.data.pricing_type}
                            onChange={(event) =>
                                form.setData('pricing_type', event.target.value)
                            }
                        >
                            <option value="unit_hour">بالساعة للوحدة</option>
                            <option value="package">باقة</option>
                            <option value="per_person">للشخص</option>
                        </select>
                    </Field>

                    <Field
                        label="السعر"
                        error={form.errors.price}
                        hint={
                            hasPriceContract && unit
                                ? 'تحت عقد السعر: التعديل يُرفع للاعتماد ولا يسري قبله.'
                                : undefined
                        }
                        required
                    >
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.price}
                            onChange={(event) =>
                                form.setData('price', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        label="المدة الافتراضية (دقيقة)"
                        error={form.errors.default_duration_minutes}
                        required
                    >
                        <input
                            type="number"
                            min="15"
                            max="600"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.default_duration_minutes}
                            onChange={(event) =>
                                form.setData(
                                    'default_duration_minutes',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>

                    <Field
                        label="الحالة"
                        error={form.errors.status}
                        hint="«تحت الصيانة» تخفيها من الطلبات دون حذفها."
                    >
                        <select
                            className={INPUT}
                            value={form.data.status}
                            onChange={(event) =>
                                form.setData('status', event.target.value)
                            }
                        >
                            <option value="active">متاحة</option>
                            <option value="maintenance">تحت الصيانة</option>
                            <option value="disabled">معطّلة</option>
                        </select>
                    </Field>
                </FormGrid>

                {hasPriceContract && priceChanged && (
                    <Note tone="warning" title="هذا التعديل لن يسري فوراً">
                        السعر الجديد ({form.data.price} ر.س) يُرفع كطلب تغيير
                        لأدمن تيمات. حتى يُعتمد، تبقى الحجوزات على السعر الحالي
                        ({unit?.price} ر.س).
                    </Note>
                )}
            </FormSection>

            <FormActions>
                <Button type="submit" disabled={form.processing}>
                    {unit ? 'حفظ التعديلات' : 'إضافة الوحدة'}
                </Button>
                <Button type="button" tone="soft" icon={X} onClick={onDone}>
                    إلغاء
                </Button>
            </FormActions>
        </form>
    );
}

/** ساعات العمل كمدى واحد — الفرع الذي يفتح ٦ ص ويغلق ١ ص يُقرأ سطراً لا جدولاً. */
function branchHours(branch: Branch): string | null {
    const windows = Object.values(branch.working_hours ?? {}).flat().filter(Boolean);

    if (windows.length === 0) {
        return null;
    }

    const from = windows.map((w) => w.from).sort()[0];
    const to = windows.map((w) => w.to).sort().at(-1);

    return `${from} - ${to}`;
}
