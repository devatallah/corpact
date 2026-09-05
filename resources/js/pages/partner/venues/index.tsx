import { Head, Link, router } from '@inertiajs/react';
import { MapPinned, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import {
    Badge,
    ButtonLink,
    Card,
    IconButton,
    PageHeader,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import { venueStatus } from '@/lib/status';
import type { Paginated, SortState } from '@/types';

/**
 * H §17 — الملاعب وتسعيرها.
 *
 * A venue with no pricing rows is invisible to the booking flow: nothing can
 * quote it. The list says so on the row itself, because an empty price column
 * reads like "free" rather than "unbookable".
 *
 * All prices here include the 15% VAT (H §12.1).
 */
export type VenueRow = {
    id: number;
    name: string;
    status: string;
    category?: { id: number; name: string } | null;
    pricings?: {
        id: number;
        duration_minutes: number;
        price: string | number;
        is_peak: boolean;
        label: string | null;
        status?: string;
    }[];
};

export default function PartnerVenues({
    venues,
    filters,
    sort,
    categories,
}: {
    partner: { id: number; name: string };
    venues: Paginated<VenueRow>;
    filters: { search?: string; category_id?: string | number };
    sort: SortState;
    categories: {
        id: number;
        name: string;
        children?: { id: number; name: string }[];
    }[];
}) {
    const [deleting, setDeleting] = useState<VenueRow | null>(null);

    return (
        <PartnerLayout>
            <Head title="الملاعب" />

            <PageHeader
                icon={MapPinned}
                title="الملاعب والتسعير"
                subtitle="الملعب بلا تسعيرة لا يُحجز — الأسعار شاملة ضريبة القيمة المضافة."
                actions={
                    <ButtonLink href="/partner/venues/create" icon={Plus}>
                        ملعب جديد
                    </ButtonLink>
                }
            />

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث باسم الملعب…"
                    />
                    <FilterSelect
                        name="category_id"
                        label="الفئة"
                        value={String(filters.category_id ?? '')}
                        options={[
                            ['', 'كل الفئات'],
                            ...categories.flatMap((parent) => [
                                [String(parent.id), parent.name] as [
                                    string,
                                    string,
                                ],
                                ...(parent.children ?? []).map(
                                    (child) =>
                                        [
                                            String(child.id),
                                            `— ${child.name}`,
                                        ] as [string, string],
                                ),
                            ]),
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="الملعب"
                                sortKey="name"
                                sort={sort}
                            />
                        </Th>
                        <Th>الفئة</Th>
                        <Th>التسعيرات</Th>
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
                        {venues.data.map((venue) => {
                            const pricings = venue.pricings ?? [];

                            return (
                                <Tr key={venue.id}>
                                    <Td>
                                        <Link
                                            href={`/partner/venues/${venue.id}/edit`}
                                            className="font-extrabold text-ink hover:underline"
                                        >
                                            {venue.name}
                                        </Link>
                                    </Td>
                                    <Td className="text-ink/85">
                                        {venue.category?.name ?? '—'}
                                    </Td>
                                    <Td>
                                        {pricings.length === 0 ? (
                                            <Badge tone="warning">
                                                بلا تسعيرة — لا يُحجز
                                            </Badge>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {pricings
                                                    .slice(0, 3)
                                                    .map((pricing) => (
                                                        <span
                                                            key={pricing.id}
                                                            className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-ink/12 bg-ink/5 px-2 py-0.5 font-mono text-[10px] font-bold"
                                                        >
                                                            {
                                                                pricing.duration_minutes
                                                            }
                                                            د · {pricing.price}
                                                            {pricing.is_peak && (
                                                                <span className="text-warning">
                                                                    ذروة
                                                                </span>
                                                            )}
                                                        </span>
                                                    ))}
                                                {pricings.length > 3 && (
                                                    <span className="text-[10px] text-ink/50">
                                                        +{pricings.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </Td>
                                    <Td>
                                        <Badge
                                            tone={
                                                venueStatus(venue.status).tone
                                            }
                                        >
                                            {venueStatus(venue.status).label}
                                        </Badge>
                                    </Td>
                                    <Td className="text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Link
                                                href={`/partner/venues/${venue.id}/edit`}
                                                title="تعديل الملعب وتسعيراته"
                                                className="rounded-lg bg-ink/5 p-1.5 text-ink transition-colors hover:bg-ink/10"
                                            >
                                                <Pencil
                                                    className="h-3.5 w-3.5"
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                            <IconButton
                                                icon={Trash2}
                                                label="حذف الملعب"
                                                tone="danger"
                                                onClick={() =>
                                                    setDeleting(venue)
                                                }
                                            />
                                        </div>
                                    </Td>
                                </Tr>
                            );
                        })}

                        <ListStates
                            count={venues.data.length}
                            colSpan={5}
                            empty="لا ملاعب مطابقة."
                            emptyHint="أضف ملعبك الأول ثم اضبط تسعيراته حسب المدة ووقت الذروة."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={venues} />
                    <Pagination page={venues} />
                </div>
            </Card>

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف الملعب"
                message="تُحذف تسعيرات الملعب معه ولا يعود يُعرض للحجز. الحجوزات القائمة عليه لا تُلغى تلقائياً — راجعها أولاً."
                details={
                    deleting && (
                        <>
                            <ConfirmRow
                                label="الملعب"
                                value={deleting.name}
                                strong
                            />
                            <ConfirmRow
                                label="التسعيرات"
                                value={`${deleting.pricings?.length ?? 0} تسعيرة تُحذف معه`}
                            />
                        </>
                    )
                }
                confirmLabel="نعم، احذف الملعب"
                onConfirm={() => {
                    router.delete(`/partner/venues/${deleting?.id}`, {
                        preserveScroll: true,
                    });
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />
        </PartnerLayout>
    );
}
