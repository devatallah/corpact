import { Head, router, useForm } from '@inertiajs/react';
import { MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { BackLink, ListStates } from '@/components/list-states';
import { FormActions, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
    Note,
    PageHeader,
} from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §11 — المرافق المفضّلة للمجتمع.
 *
 * The order is the preference: when an event goes out for provider bids, the
 * list is walked from the top. So position is shown as a number, not implied
 * by the row's place on screen.
 *
 * Reliability is displayed only once a provider has at least ten samples —
 * below that the index is noise, and the card says "لا يكفي" rather than
 * showing a number that would be read as a verdict.
 */
type Preferred = {
    id: number;
    position: number;
    partner: {
        id: number;
        name: string;
        city: string | null;
        district: string | null;
        reliability: number | null;
        reliability_samples: number;
    } | null;
};

export default function EmployeePreferredProviders({
    community,
    preferred,
    available,
}: {
    community: { id: number; name: string };
    preferred: Preferred[];
    available: {
        id: number;
        name: string;
        city: string | null;
        district: string | null;
    }[];
}) {
    const form = useForm({ partner_id: '' });

    return (
        <EmployeeLayout>
            <Head title={`مرافق ${community.name}`} />

            <BackLink
                href={`/employee/community/${community.id}`}
                label={`العودة إلى ${community.name}`}
            />

            <PageHeader
                icon={Star}
                title="المرافق المفضّلة"
                subtitle="ترتيبها هو أولويتها — يُعرض الطلب عليها بهذا الترتيب."
            />

            <div className="space-y-2">
                {preferred.map((row) => (
                    <Card key={row.id} padding="p-3.5">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-black text-lime">
                                {row.position}
                            </span>

                            <div className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-extrabold text-ink">
                                    {row.partner?.name ?? '—'}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-ink/50">
                                    <MapPin
                                        className="h-2.5 w-2.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    {[row.partner?.district, row.partner?.city]
                                        .filter(Boolean)
                                        .join('، ') || '—'}
                                </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                {row.partner?.reliability !== null &&
                                row.partner?.reliability !== undefined ? (
                                    <Badge
                                        tone={
                                            row.partner.reliability >= 70
                                                ? 'success'
                                                : 'warning'
                                        }
                                    >
                                        موثوقية {row.partner.reliability}
                                    </Badge>
                                ) : (
                                    <Badge tone="neutral">
                                        بيانات غير كافية (
                                        {row.partner?.reliability_samples ?? 0}
                                        /10)
                                    </Badge>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.delete(
                                            `/employee/communities/${community.id}/preferred-providers/${row.partner?.id}`,
                                            { preserveScroll: true },
                                        )
                                    }
                                    aria-label="إزالة المرفق"
                                    className="rounded-lg bg-danger/8 p-1.5 text-danger transition-colors hover:bg-danger/15"
                                >
                                    <Trash2
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}

                <ListStates
                    count={preferred.length}
                    empty="لا مرافق مفضّلة بعد."
                    emptyHint="بدونها يقترح النظام المرافق تلقائياً حسب الفئة والموقع والموثوقية."
                />
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(
                        `/employee/communities/${community.id}/preferred-providers`,
                        {
                            preserveScroll: true,
                            onSuccess: () => form.reset(),
                        },
                    );
                }}
                className="space-y-6"
            >
                <FormSection title="إضافة مرفق">
                    <Field
                        label="المرفق"
                        error={form.errors.partner_id}
                        required
                    >
                        <select
                            className={INPUT}
                            value={form.data.partner_id}
                            onChange={(event) =>
                                form.setData('partner_id', event.target.value)
                            }
                        >
                            <option value="">— اختر مرفقاً —</option>
                            {available.map((partner) => (
                                <option key={partner.id} value={partner.id}>
                                    {partner.name}
                                    {partner.city ? ` — ${partner.city}` : ''}
                                </option>
                            ))}
                        </select>
                    </Field>
                </FormSection>

                <FormActions>
                    <Button
                        type="submit"
                        icon={Plus}
                        disabled={form.processing || !form.data.partner_id}
                    >
                        أضف إلى المفضّلة
                    </Button>
                </FormActions>
            </form>

            <Note title="لماذا يُخفى مؤشر الموثوقية أحياناً؟">
                المؤشر لا يُعرض قبل عشر تجارب مع المرفق. قبلها هو رقم مبنيّ على
                حالات قليلة، وقراءته كحكم تظلم المرافق الجديدة.
            </Note>
        </EmployeeLayout>
    );
}
