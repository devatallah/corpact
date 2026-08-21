import CompanyLayout from '@/layouts/company-layout';
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

/** A8 — قوالب التكرار من بوابة الشركة (مسؤول الحساب — H §8) */
export default function CompanyCommunityTemplates({ community, templates, partners, categories, manageUrl }: Props) {
    return (
        <CompanyLayout>
            <Head title={`قوالب التكرار — ${community.name}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>قوالب التكرار</h1>
                <span style={{ color: '#7A8BA8', fontSize: 14 }}>— {community.name}</span>
                <Link href="/company/communities" style={{ marginRight: 'auto', fontSize: 13, color: '#1A5FAB', textDecoration: 'none', fontWeight: 600 }}>
                    ← عودة للمجتمعات
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
                eventUrlPrefix="/company/events/"
            />
        </CompanyLayout>
    );
}
