import { Head } from '@inertiajs/react';
import { Repeat } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { PageHeader } from '@/components/portal/ui';
import TemplateManager from '@/components/template-manager';
import type {
    TemplatePartner,
    TemplateRow,
} from '@/components/template-manager';
import CompanyLayout from '@/layouts/company-layout';

/** H §8 — القوالب من بوابة الشركة. نفس المحرّر الذي يستخدمه قائد المجتمع. */
export default function CompanyCommunityTemplates({
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
        <CompanyLayout>
            <Head title={`قوالب ${community.name}`} />

            <BackLink
                href={`/company/communities/${community.id}/edit`}
                label={`العودة إلى ${community.name}`}
            />

            <PageHeader
                icon={Repeat}
                title="قوالب التكرار"
                subtitle={`${community.name} — اضبط الموعد مرة، ويولّد النظام فعالياته قبل كل موعد بـ14 يوماً.`}
            />

            <TemplateManager
                community={community}
                templates={templates}
                partners={partners}
                categories={categories}
                manageUrl={manageUrl}
            />
        </CompanyLayout>
    );
}
