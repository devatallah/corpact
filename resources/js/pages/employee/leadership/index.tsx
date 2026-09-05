import { Head, Link } from '@inertiajs/react';
import { Repeat, ShieldCheck, UsersRound, Wallet } from 'lucide-react';
import { ListStates } from '@/components/list-states';
import { Badge, Card, Note, PageHeader } from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §6 — أدوات قائد المجتمع، مُسمّاة.
 *
 * ثلاثة أبواب لكل مجتمع يقوده: أعضاؤه، وقالب تكراره، ومحفظته. كانت جميعها
 * أقساماً داخل صفحة المجتمع لا يصلها القائد إلا بالنزول فيها، ولم يكن لقائد
 * مجتمعين طريق مباشر إلى أيّهما.
 */
type LedCommunity = {
    id: number;
    name: string;
    icon: string | null;
    status: string;
    members_count: number;
    is_primary: boolean;
};

export default function EmployeeLeadership({
    communities,
}: {
    communities: LedCommunity[];
}) {
    return (
        <EmployeeLayout>
            <Head title="قيادتي" />

            <PageHeader
                icon={ShieldCheck}
                title="قيادتي"
                subtitle="المجتمعات التي تقودها، وما تملك فعله فيها."
            />

            {communities.length === 0 ? (
                <ListStates
                    count={0}
                    empty="لا تقود مجتمعاً حالياً."
                    emptyHint="القيادة يعيّنها مسؤول حساب الشركة. حتى ذلك الحين تشارك كعضو كبقية زملائك."
                />
            ) : (
                communities.map((community) => (
                    <Card
                        key={community.id}
                        padding="p-4"
                        className="space-y-3"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-lg text-ink">
                                    {community.icon ?? '👥'}
                                </span>
                                <div className="min-w-0">
                                    <span className="block truncate text-sm font-extrabold text-ink">
                                        {community.name}
                                    </span>
                                    <span className="block text-[11px] text-ink/55">
                                        {community.members_count} عضواً
                                    </span>
                                </div>
                            </div>
                            {community.is_primary ? (
                                <Badge tone="lime">قائد أساسي</Badge>
                            ) : (
                                <Badge tone="neutral">نائب</Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <LeaderLink
                                href={`/employee/community/${community.id}`}
                                icon={UsersRound}
                                label="إدارة المجتمع"
                                hint="الأعضاء والقيادة والإعلانات"
                            />
                            <LeaderLink
                                href={`/employee/community/${community.id}/templates`}
                                icon={Repeat}
                                label="قالب التكرار"
                                hint="توليد الفعاليات تلقائياً"
                            />
                            <LeaderLink
                                href={`/employee/community/${community.id}#wallet`}
                                icon={Wallet}
                                label="محفظة المجتمع"
                                hint="الرصيد ودفتر الحركات"
                            />
                        </div>
                    </Card>
                ))
            )}

            {communities.length > 0 && (
                <Note title="ما لا يملكه القائد">
                    شحن المحفظة وتخصيص الرصيد من مسؤول حساب الشركة، لا من هنا.
                    دفتر الحركات معروض للقراءة حتى تعرف أين ذهب الرصيد دون أن
                    تملك تحريكه.
                </Note>
            )}
        </EmployeeLayout>
    );
}

/** بابٌ واحد من أبواب القائد — اسمه وما وراءه في سطر. */
function LeaderLink({
    href,
    icon: Icon,
    label,
    hint,
}: {
    href: string;
    icon: typeof UsersRound;
    label: string;
    hint: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2.5 rounded-xl border-[0.5px] border-ink/10 bg-page p-3 transition-colors hover:border-ink/30"
        >
            <Icon className="h-4 w-4 shrink-0 text-ink/70" aria-hidden="true" />
            <span className="min-w-0">
                <span className="block text-xs font-extrabold text-ink">
                    {label}
                </span>
                <span className="block truncate text-[10px] text-ink/50">
                    {hint}
                </span>
            </span>
        </Link>
    );
}
