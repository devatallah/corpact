import { Head } from '@inertiajs/react';
import { Repeat } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { PageHeader } from '@/components/portal/ui';
import TemplateManager from '@/components/template-manager';
import type {
    TemplatePartner,
    TemplateRow,
} from '@/components/template-manager';
import EmployeeLayout from '@/layouts/employee-layout';

/** H §8 — قوالب التكرار من بوابة الموظف (قائد المجتمع). نفس محرّر بوابة الشركة. */
export default function EmployeeCommunityTemplates({
    community,
    templates,
    partners,
    categories,
    manageUrl,
}: {
    community: { id: number; name: string; status?: string };
    templates: TemplateRow[];
    partners: TemplatePartner[];
    categories: { id: number; name: string }[];
    manageUrl: string;
}) {
    return (
        <EmployeeLayout>
            <Head title={`قوالب ${community.name}`} />

            <BackLink
                href={`/employee/community/${community.id}`}
                label={`العودة إلى ${community.name}`}
            />

            <PageHeader
                icon={Repeat}
                title="قوالب التكرار"
                subtitle="اضبط الموعد مرة، ويولّد النظام الفعالية قبل كل موعد بـ14 يوماً."
            />

            <TemplateManager
                community={community}
                templates={templates}
                partners={partners}
                categories={categories}
                manageUrl={manageUrl}
            />
        </EmployeeLayout>
    );
}
