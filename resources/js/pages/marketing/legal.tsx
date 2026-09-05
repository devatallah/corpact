import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Band, PageHero, SHELL } from '@/components/marketing/ui';
import MarketingLayout from '@/layouts/marketing-layout';

/**
 * الشروط والأحكام وسياسة الخصوصية.
 *
 * صفحتان نصّيتان تتقاسمان تخطيطاً واحداً، فالفرق بينهما محتوى لا شكل. كانتا
 * قالبَي Blade حُذفا في إعادة البناء وبقي مساراهما يشيران إليهما، فكان
 * `/terms` و`/privacy` يردّان 500 — وهما أول ما تطلبه المراجعة النظامية.
 */
export type Clause = { heading: string; body: string };

export function LegalPage({
    nav,
    eyebrow,
    title,
    updated,
    clauses,
}: {
    nav: string;
    eyebrow: string;
    title: string;
    updated: string;
    clauses: Clause[];
}) {
    return (
        <MarketingLayout activeNav={nav}>
            <Head title={title} />

            <PageHero eyebrow={eyebrow} title={title} lede={updated} tight />

            <Band ground="page" gap={8}>
                <div
                    className={`${SHELL} max-w-[820px] space-y-10 px-0 sm:px-0 lg:px-0`}
                >
                    {clauses.map((clause) => (
                        <section key={clause.heading} className="space-y-3">
                            <h2 className="inline-block border-b-2 border-lime pb-2 font-arabic text-lg font-bold text-ink sm:text-xl">
                                {clause.heading}
                            </h2>
                            <p className="text-[15px] leading-[1.9] text-ink/75">
                                {clause.body}
                            </p>
                        </section>
                    ))}

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-[10px] bg-ink px-6 py-3 text-sm font-bold text-lime transition-colors hover:bg-panel"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        العودة للرئيسية
                    </Link>
                </div>
            </Band>
        </MarketingLayout>
    );
}
