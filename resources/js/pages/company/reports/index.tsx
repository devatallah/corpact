import CompanyLayout from '@/layouts/company-layout';
import StatCard from '@/components/stat-card';
import { Head } from '@inertiajs/react';

interface Props {
    participation: {
        rate: number;
        participating_employees: number;
        total_employees: number;
    };
    mostActive: {
        community_name: string;
        event_count: number;
    } | null;
    budget: {
        utilization_rate: number;
        total_distributed: number;
        total_spent_on_events: number;
        total_credited: number;
    };
}

export default function ReportsIndex({ participation, mostActive, budget }: Props) {
    return (
        <CompanyLayout>
            <Head title="التقارير" />

            <div className="page-title">التقارير والإحصائيات</div>
            <div className="page-sub" style={{ marginBottom: 24 }}>ملخص أداء المجتمعات</div>

            <div className="stat-row">
                <StatCard
                    emoji="📊"
                    label="نسبة المشاركة"
                    value={`${participation.rate}%`}
                    change={`${participation.participating_employees} من ${participation.total_employees} موظف`}
                    color="#3B5BDB"
                />
                <StatCard
                    emoji="🏆"
                    label="أكثر نشاطاً"
                    value={mostActive?.community_name ?? '\u2014'}
                    change={mostActive ? `${mostActive.event_count} فعاليات` : 'لا توجد بيانات'}
                    color="#D4820A"
                />
                <StatCard
                    emoji="💸"
                    label="نسبة صرف الميزانية"
                    value={`${budget.utilization_rate}%`}
                    change={`${(budget.total_distributed + budget.total_spent_on_events).toLocaleString()} من ${budget.total_credited.toLocaleString()}`}
                    color="#0CA678"
                />
            </div>
        </CompanyLayout>
    );
}
