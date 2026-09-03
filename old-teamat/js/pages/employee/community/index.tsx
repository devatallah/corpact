import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Users } from 'lucide-react';
import CategoryIcon from '@/components/category-icon';
import { Card, CardTitle, MetaRow, Screen, Section } from '@/components/employee/ui';
import EmployeeLayout from '@/layouts/employee-layout';
import type { Category, Community, Employee } from '@/types/models';

interface CommunityItem extends Community {
    category?: Category;
    leader?: Employee;
    members_count: number;
    events_count: number;
}

interface Props {
    communities: CommunityItem[];
}

export default function CommunityIndex({ communities }: Props) {
    return (
        <EmployeeLayout>
            <Head title="مجتمعاتي" />

            <Screen>
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-lg font-black text-[#0A0A0A]">مجتمعاتي المعتمدة</h1>
                    <Link
                        href="/employee/community-requests"
                        className="shrink-0 inline-flex items-center justify-center h-9 px-4 rounded-full bg-white text-[#0A0A0A] text-xs font-bold border-[0.5px] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40 transition-colors"
                    >
                        اقتراح مجتمع
                    </Link>
                </div>

                {communities.length > 0 ? (
                    <>
                        {/* The prototype's horizontal community strip. */}
                        <div className="flex gap-2.5 overflow-x-auto pb-1">
                            {communities.map((community) => (
                                <Link
                                    key={community.id}
                                    href={`/employee/community/${community.id}`}
                                    className="shrink-0 w-40 p-3.5 bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/30 transition-all space-y-2"
                                >
                                    <CategoryIcon icon={community.category?.icon} size={22} />
                                    <h3 className="text-xs font-black text-[#0A0A0A] line-clamp-1">{community.name}</h3>
                                    <div className="flex items-center justify-between text-[11px] text-[#0A0A0A]/55">
                                        <span>{community.members_count} عضو</span>
                                        <span className="font-bold text-[#0A0A0A]">دخول ←</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Section title="كل مجتمعاتي">
                            <div className="space-y-2.5">
                                {communities.map((community) => (
                                    <Link key={community.id} href={`/employee/community/${community.id}`} className="block">
                                        <Card interactive>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#F6F8F5] border-[0.5px] border-[#0A0A0A]/10 flex items-center justify-center shrink-0">
                                                    <CategoryIcon icon={community.category?.icon} size={22} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <CardTitle>{community.name}</CardTitle>
                                                    {community.category?.name && (
                                                        <div className="text-[11px] text-[#0A0A0A]/55 mt-0.5">{community.category.name}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <MetaRow
                                                left={
                                                    <span className="inline-flex items-center gap-3">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Users className="w-3 h-3" aria-hidden="true" />
                                                            {community.members_count} عضو
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <CalendarDays className="w-3 h-3" aria-hidden="true" />
                                                            {community.events_count} فعالية نشطة
                                                        </span>
                                                    </span>
                                                }
                                                right="دخول ←"
                                            />
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </Section>
                    </>
                ) : (
                    <Card>
                        <p className="text-[11px] text-[#0A0A0A]/55 text-center py-4">
                            لم تنضم لأي مجتمع بعد.{' '}
                            <Link href="/employee/explore" className="font-bold text-[#0A0A0A] hover:underline">
                                اكتشف المجتمعات
                            </Link>
                        </p>
                    </Card>
                )}
            </Screen>
        </EmployeeLayout>
    );
}
