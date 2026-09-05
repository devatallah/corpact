import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, TicketPercent, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import {
    FilterSelect,
    Pagination,
    ResultCount,
    SearchInput,
    SortableHeader,
    Toolbar,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import Modal from '@/components/modal';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    IconButton,
    INPUT,
    Note,
    PageHeader,
    StatCard,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import TimeSelect from '@/components/time-select';
import PartnerLayout from '@/layouts/partner-layout';
import type { Paginated, SortState } from '@/types';

/**
 * A17 — تخفيضات المزوّد.
 *
 * التخفيض هنا اتفاق ثنائي مع مجتمع بعينه، لا رمز ترويجي عام: لذلك يُختار
 * الشركة ثم المجتمع، ولا خيار «للجميع». وهو يُطبَّق على إجمالي الحجز قبل
 * دعم المحفظة، فيقلّ ما تدفعه الشركة وما يتبقّى على اللاعبين معاً.
 */
type DiscountRow = {
    id: number;
    name: string | null;
    type: 'fixed' | 'percentage';
    value: string;
    value_halalas: number;
    usage: 'one_time' | 'date_range';
    starts_at: string | null;
    expires_at: string | null;
    start_time: string | null;
    end_time: string | null;
    status: string;
    used_count: number;
    company?: { id: number; name: string } | null;
    community?: { id: number; name: string } | null;
};

type CompanyOption = { id: number; name: string; city: string | null };
type CommunityOption = { id: number; name: string };

const USAGE_LABEL: Record<string, string> = {
    one_time: 'مرة واحدة',
    date_range: 'خلال مدة',
};

/**
 * `starts_at`/`expires_at` يصلان ISO كاملاً (cast: date) — والمعروض تاريخ،
 * و`<input type="date">` لا يقبل غير `YYYY-MM-DD`.
 */
function day(value: string | null): string {
    return value === null ? '' : value.slice(0, 10);
}

function amountLabel(row: {
    type: string;
    value: string;
    value_halalas: number;
}): string {
    return row.type === 'percentage'
        ? `${Number(row.value)}٪`
        : `${(row.value_halalas / 100).toFixed(2)} ر.س`;
}

export default function PartnerDiscounts({
    discounts,
    companies,
    filters,
    sort,
}: {
    partner: { id: number; name: string };
    discounts: Paginated<DiscountRow>;
    companies: CompanyOption[];
    filters: {
        search?: string;
        status?: string;
        company_id?: number | string;
    };
    sort: SortState;
}) {
    const form = useForm({
        company_id: '',
        community_id: '',
        name: '',
        type: 'fixed',
        value: '',
        usage: 'date_range',
        starts_at: '',
        expires_at: '',
        start_time: '',
        end_time: '',
    });

    const [communityCache, setCommunityCache] = useState<{
        key: string;
        data: CommunityOption[];
    } | null>(null);
    const [editing, setEditing] = useState<DiscountRow | null>(null);
    const [deleting, setDeleting] = useState<DiscountRow | null>(null);

    /*
     * مجتمعات الشركة تُجلب عند اختيارها لا مع الصفحة: مجتمعات كل شركات
     * المنصة حمولة كبيرة لا يُستعمل منها إلا واحدة.
     *
     * والقائمة **تُشتق** من مفتاح الشركة بدل أن يُفرغها أثرٌ عند التبديل:
     * ردٌّ لشركة سابقة يصل متأخراً لا يجد مكاناً يُعرض فيه أصلاً.
     */
    const communities =
        form.data.company_id !== '' &&
        communityCache?.key === form.data.company_id
            ? communityCache.data
            : [];

    useEffect(() => {
        if (form.data.company_id === '') {
            return;
        }

        const key = form.data.company_id;
        let cancelled = false;

        fetch(`/partner/discounts/communities?company_id=${key}`, {
            headers: { Accept: 'application/json' },
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data: { communities?: CommunityOption[] } | null) => {
                if (!cancelled) {
                    setCommunityCache({ key, data: data?.communities ?? [] });
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [form.data.company_id]);

    const active = discounts.data.filter(
        (row) => row.status === 'active',
    ).length;

    return (
        <PartnerLayout>
            <Head title="التخفيضات" />

            <PageHeader
                icon={TicketPercent}
                title="التخفيضات"
                subtitle="اتفاق تمنحه لمجتمع بعينه — يُخصم من إجمالي الحجز قبل دعم محفظة الشركة."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="سارية في هذه الصفحة"
                    value={active}
                    tone={active > 0 ? 'success' : undefined}
                />
                <StatCard label="الإجمالي" value={discounts.total} />
            </div>

            <Note title="التخفيض يُخصم من حصّتك أنت">
                التسوية تُحتسب على المبلغ بعد التخفيض: أنت من يمنحه، وأنت من
                يتحمّله. المنصة لا تعوّضه.
            </Note>

            {/* ── تخفيض جديد ── */}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/partner/discounts', {
                        preserveScroll: true,
                        onSuccess: () => form.reset(),
                    });
                }}
            >
                <FormSection
                    title="تخفيض جديد"
                    hint="اختر الشركة ثم المجتمع — التخفيض يخصّ ذلك المجتمع وحده."
                >
                    <FormGrid columns={2}>
                        <Field
                            label="الشركة"
                            error={form.errors.company_id}
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.company_id}
                                onChange={(event) => {
                                    form.setData(
                                        'company_id',
                                        event.target.value,
                                    );
                                    form.setData('community_id', '');
                                }}
                            >
                                <option value="">— اختر الشركة —</option>
                                {companies.map((row) => (
                                    <option key={row.id} value={row.id}>
                                        {row.name}
                                        {row.city ? ` — ${row.city}` : ''}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="المجتمع"
                            error={form.errors.community_id}
                            hint={
                                form.data.company_id === ''
                                    ? 'اختر الشركة أولاً.'
                                    : undefined
                            }
                            required
                        >
                            <select
                                className={INPUT}
                                disabled={form.data.company_id === ''}
                                value={form.data.community_id}
                                onChange={(event) =>
                                    form.setData(
                                        'community_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">— اختر المجتمع —</option>
                                {communities.map((row) => (
                                    <option key={row.id} value={row.id}>
                                        {row.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="الاسم" error={form.errors.name}>
                            <input
                                className={INPUT}
                                placeholder="تخفيض الربع الأول"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                        </Field>

                        <Field label="النوع" error={form.errors.type} required>
                            <select
                                className={INPUT}
                                value={form.data.type}
                                onChange={(event) =>
                                    form.setData('type', event.target.value)
                                }
                            >
                                <option value="fixed">مبلغ ثابت (ر.س)</option>
                                <option value="percentage">نسبة (٪)</option>
                            </select>
                        </Field>

                        <Field
                            label={
                                form.data.type === 'percentage'
                                    ? 'النسبة (٪)'
                                    : 'المبلغ (ر.س)'
                            }
                            error={form.errors.value}
                            required
                        >
                            <input
                                type="number"
                                min="0"
                                max={
                                    form.data.type === 'percentage'
                                        ? '100'
                                        : undefined
                                }
                                step="0.01"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.value}
                                onChange={(event) =>
                                    form.setData('value', event.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="الاستخدام"
                            error={form.errors.usage}
                            hint="«مرة واحدة» يسقط بعد أول فعالية استعملته."
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.usage}
                                onChange={(event) =>
                                    form.setData('usage', event.target.value)
                                }
                            >
                                <option value="date_range">خلال مدة</option>
                                <option value="one_time">مرة واحدة</option>
                            </select>
                        </Field>

                        <Field label="يبدأ في" error={form.errors.starts_at}>
                            <input
                                type="date"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.starts_at}
                                onChange={(event) =>
                                    form.setData(
                                        'starts_at',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field label="ينتهي في" error={form.errors.expires_at}>
                            <input
                                type="date"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.expires_at}
                                onChange={(event) =>
                                    form.setData(
                                        'expires_at',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            label="من الساعة"
                            error={form.errors.start_time}
                            hint="اتركه فارغاً ليسري طوال اليوم."
                        >
                            <TimeSelect
                                value={form.data.start_time}
                                onChange={(next) =>
                                    form.setData('start_time', next)
                                }
                            />
                        </Field>

                        <Field label="إلى الساعة" error={form.errors.end_time}>
                            <TimeSelect
                                value={form.data.end_time}
                                onChange={(next) =>
                                    form.setData('end_time', next)
                                }
                            />
                        </Field>
                    </FormGrid>

                    <FormActions>
                        <Button
                            type="submit"
                            disabled={
                                form.processing ||
                                !form.data.company_id ||
                                !form.data.community_id ||
                                form.data.value === ''
                            }
                        >
                            إضافة التخفيض
                        </Button>
                    </FormActions>
                </FormSection>
            </form>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث باسم التخفيض…"
                    />
                    <FilterSelect
                        name="status"
                        label="الحالة"
                        value={String(filters.status ?? '')}
                        options={[
                            ['', 'كل الحالات'],
                            ['active', 'سارٍ'],
                            ['expired', 'منتهٍ'],
                        ]}
                    />
                    <FilterSelect
                        name="company_id"
                        label="الشركة"
                        value={String(filters.company_id ?? '')}
                        options={[
                            ['', 'كل الشركات'],
                            ...companies.map(
                                (row) =>
                                    [String(row.id), row.name] as [
                                        string,
                                        string,
                                    ],
                            ),
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="التخفيض"
                                sortKey="name"
                                sort={sort}
                            />
                        </Th>
                        <Th>المجتمع</Th>
                        <Th>
                            <SortableHeader
                                label="القيمة"
                                sortKey="value"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="ينتهي في"
                                sortKey="expires_at"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="status"
                                sort={sort}
                            />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {discounts.data.map((row) => (
                            <Tr key={row.id}>
                                <Td>
                                    <span className="block text-xs font-extrabold text-ink">
                                        {row.name ?? 'تخفيض'}
                                    </span>
                                    <span className="block text-[10px] text-ink/50">
                                        {USAGE_LABEL[row.usage] ?? row.usage}
                                        {row.used_count > 0 &&
                                            ` · استُعمل ${row.used_count} مرة`}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="block truncate text-[11px] font-bold text-ink/80">
                                        {row.community?.name ?? '—'}
                                    </span>
                                    <span className="block truncate text-[10px] text-ink/50">
                                        {row.company?.name ?? '—'}
                                    </span>
                                </Td>
                                <Td className="font-mono text-[11px] font-black whitespace-nowrap text-ink">
                                    {amountLabel(row)}
                                </Td>
                                <Td className="font-mono text-[11px] whitespace-nowrap text-ink/70">
                                    {day(row.expires_at) || '—'}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            row.status === 'active'
                                                ? 'success'
                                                : 'neutral'
                                        }
                                    >
                                        {row.status === 'active'
                                            ? 'سارٍ'
                                            : 'منتهٍ'}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <IconButton
                                            icon={Pencil}
                                            label="تعديل التخفيض"
                                            onClick={() => setEditing(row)}
                                        />
                                        <IconButton
                                            icon={Trash2}
                                            label="حذف التخفيض"
                                            tone="danger"
                                            onClick={() => setDeleting(row)}
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={discounts.data.length}
                            colSpan={6}
                            empty="لا تخفيضات."
                            emptyHint="أضف تخفيضاً أعلاه ليظهر لمنشئ الفعالية في ذلك المجتمع."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={discounts} />
                    <Pagination page={discounts} />
                </div>
            </Card>

            <EditDiscountModal
                discount={editing}
                onClose={() => setEditing(null)}
            />

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف التخفيض"
                message="لن يظهر بعدها لمنشئي الفعاليات. الفعاليات التي استعملته تحتفظ بمبلغها كما هو."
                details={
                    deleting && (
                        <>
                            <ConfirmRow
                                label="التخفيض"
                                value={deleting.name ?? 'تخفيض'}
                                strong
                            />
                            <ConfirmRow
                                label="المجتمع"
                                value={deleting.community?.name ?? '—'}
                            />
                        </>
                    )
                }
                confirmLabel="نعم، احذفه"
                onConfirm={() => {
                    router.delete(`/partner/discounts/${deleting?.id}`, {
                        preserveScroll: true,
                    });
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />
        </PartnerLayout>
    );
}

/**
 * التعديل لا ينقل التخفيض بين المجتمعات: تحويله لمجتمع آخر يغيّر الطرف
 * المستفيد من اتفاق قائم — يُحذف ويُنشأ. الخادم يفرض ذلك أيضاً.
 */
function EditDiscountModal({
    discount,
    onClose,
}: {
    discount: DiscountRow | null;
    onClose: () => void;
}) {
    const form = useForm({
        name: '',
        type: 'fixed',
        value: '',
        usage: 'date_range',
        starts_at: '',
        expires_at: '',
        start_time: '',
        end_time: '',
        status: 'active',
    });

    const { setDefaults, reset } = form;

    // النموذج يُملأ من الصف عند فتحه — لا حالة قديمة تُعرض لصف جديد.
    useEffect(() => {
        if (discount === null) {
            return;
        }

        setDefaults({
            name: discount.name ?? '',
            type: discount.type,
            value:
                discount.type === 'percentage'
                    ? String(Number(discount.value))
                    : (discount.value_halalas / 100).toFixed(2),
            usage: discount.usage,
            starts_at: day(discount.starts_at),
            expires_at: day(discount.expires_at),
            start_time: discount.start_time?.slice(0, 5) ?? '',
            end_time: discount.end_time?.slice(0, 5) ?? '',
            status: discount.status,
        });
        reset();
    }, [discount, setDefaults, reset]);

    if (discount === null) {
        return null;
    }

    return (
        <Modal
            open
            title="تعديل التخفيض"
            subtitle={`${discount.community?.name ?? '—'} — لا أثر على فعاليات أُنشئت قبل الآن.`}
            onClose={onClose}
        >
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put(`/partner/discounts/${discount.id}`, {
                        preserveScroll: true,
                        onSuccess: onClose,
                    });
                }}
                className="space-y-4"
            >
                <Field label="الاسم" error={form.errors.name}>
                    <input
                        className={INPUT}
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                    />
                </Field>

                <FormGrid columns={2}>
                    <Field label="النوع" error={form.errors.type} required>
                        <select
                            className={INPUT}
                            value={form.data.type}
                            onChange={(event) =>
                                form.setData('type', event.target.value)
                            }
                        >
                            <option value="fixed">مبلغ ثابت (ر.س)</option>
                            <option value="percentage">نسبة (٪)</option>
                        </select>
                    </Field>

                    <Field
                        label={
                            form.data.type === 'percentage'
                                ? 'النسبة (٪)'
                                : 'المبلغ (ر.س)'
                        }
                        error={form.errors.value}
                        required
                    >
                        <input
                            type="number"
                            min="0"
                            max={
                                form.data.type === 'percentage'
                                    ? '100'
                                    : undefined
                            }
                            step="0.01"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.value}
                            onChange={(event) =>
                                form.setData('value', event.target.value)
                            }
                        />
                    </Field>

                    <Field label="الاستخدام" error={form.errors.usage} required>
                        <select
                            className={INPUT}
                            value={form.data.usage}
                            onChange={(event) =>
                                form.setData('usage', event.target.value)
                            }
                        >
                            <option value="date_range">خلال مدة</option>
                            <option value="one_time">مرة واحدة</option>
                        </select>
                    </Field>

                    <Field label="الحالة" error={form.errors.status}>
                        <select
                            className={INPUT}
                            value={form.data.status}
                            onChange={(event) =>
                                form.setData('status', event.target.value)
                            }
                        >
                            <option value="active">سارٍ</option>
                            <option value="expired">منتهٍ</option>
                        </select>
                    </Field>

                    <Field label="يبدأ في" error={form.errors.starts_at}>
                        <input
                            type="date"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.starts_at}
                            onChange={(event) =>
                                form.setData('starts_at', event.target.value)
                            }
                        />
                    </Field>

                    <Field label="ينتهي في" error={form.errors.expires_at}>
                        <input
                            type="date"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.expires_at}
                            onChange={(event) =>
                                form.setData('expires_at', event.target.value)
                            }
                        />
                    </Field>

                    <Field label="من الساعة" error={form.errors.start_time}>
                        <TimeSelect
                            value={form.data.start_time}
                            onChange={(next) =>
                                form.setData('start_time', next)
                            }
                        />
                    </Field>

                    <Field label="إلى الساعة" error={form.errors.end_time}>
                        <TimeSelect
                            value={form.data.end_time}
                            onChange={(next) => form.setData('end_time', next)}
                        />
                    </Field>
                </FormGrid>

                <FormActions>
                    <Button type="button" tone="soft" onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        حفظ
                    </Button>
                </FormActions>
            </form>
        </Modal>
    );
}
