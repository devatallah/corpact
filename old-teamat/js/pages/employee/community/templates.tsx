import { Head, Link } from '@inertiajs/react';
import { Screen } from '@/components/employee/ui';
import TemplateManager from '@/components/template-manager';
import type {PartnerOption} from '@/components/template-manager';
import EmployeeLayout from '@/layouts/employee-layout';
import type { Category, EventTemplate } from '@/types/models';

interface Props {
    community: { id: number; name: string; status: string };
    templates: EventTemplate[];
    partners: PartnerOption[];
    categories: Category[];
    manageUrl: string;
}

/** A8 — قوالب التكرار من بوابة الموظف (القائد/المنسّق — H §8) */
export default function CommunityTemplates({ community, templates, partners, categories, manageUrl }: Props) {
    return (
        <EmployeeLayout>
            <Head title={`قوالب التكرار — ${community.name}`} />

            <Screen>
                <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-black text-[#0A0A0A]">قوالب التكرار</h1>
                    <span className="text-[11px] text-[#0A0A0A]/55">— {community.name}</span>
                    <Link
                        href={`/employee/community/${community.id}`}
                        className="ms-auto text-[11px] font-bold text-[#0A0A0A] hover:underline"
                    >
                        ← عودة للمجتمع
                    </Link>
                </div>

                {community.status === 'dormant' && (
                    <div className="p-3.5 rounded-2xl bg-[#FDEDEC] border-[0.5px] border-[#D9381E]/25 text-[11px] text-[#D9381E] font-medium">
                        هذا المجتمع خامل — لا تُولَّد فعاليات من قوالبه حتى يُعيَّن له قائد.
                    </div>
                )}

            <TemplateManager
                templates={templates}
                partners={partners}
                categories={categories}
                manageUrl={manageUrl}
                eventUrlPrefix="/employee/detail/"
                />
            </Screen>
        </EmployeeLayout>
    );
}
