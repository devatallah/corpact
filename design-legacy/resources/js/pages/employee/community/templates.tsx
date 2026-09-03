import EmployeeLayout from '@/layouts/employee-layout';
import TemplateManager, { type PartnerOption } from '@/components/template-manager';
import { Head, Link } from '@inertiajs/react';
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>قوالب التكرار</h1>
                <span style={{ color: '#999', fontSize: 14 }}>— {community.name}</span>
                <Link href={`/employee/community/${community.id}`} style={{ marginRight: 'auto', fontSize: 13, color: '#18A86B', textDecoration: 'none', fontWeight: 600 }}>
                    ← عودة للمجتمع
                </Link>
            </div>

            {community.status === 'dormant' && (
                <div className="card" style={{ background: '#FEF2F2', borderColor: '#FCA5A5', color: '#B91C1C', fontSize: 13 }}>
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
        </EmployeeLayout>
    );
}
