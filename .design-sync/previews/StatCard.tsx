import { StatCard } from 'teamat-ui';

// StatCard is themed by the enclosing portal class (.portal-admin dark,
// .portal-company light) — always compose it inside one, as the app does.

export const AdminPortal = () => (
    <div className="portal-admin" dir="rtl" style={{ minHeight: 0, padding: 20 }}>
        <div className="stat-row" style={{ marginBottom: 0 }}>
            <StatCard emoji="🏢" label="الشركات المسجلة" value={48} change="+6 هذا الشهر" color="#009E82" />
            <StatCard emoji="👥" label="الموظفون النشطون" value="1,284" change="+12% هذا الشهر" color="#5B7EFF" />
            <StatCard emoji="📅" label="حجوزات اليوم" value={37} color="#D4820A" />
            <StatCard emoji="💰" label="إيرادات الشهر" value="52,400 ر.س" change="+8%" color="#E03050" />
        </div>
    </div>
);

export const CompanyPortal = () => (
    <div className="portal-company" dir="rtl" style={{ minHeight: 0, padding: 20 }}>
        <div className="stat-row" style={{ marginBottom: 0 }}>
            <StatCard emoji="⚽" label="الأنشطة المتاحة" value={12} color="#00D4AA" />
            <StatCard emoji="👤" label="الموظفون المشتركون" value={216} change="+18 هذا الأسبوع" color="#3B5BDB" />
            <StatCard emoji="📊" label="نسبة المشاركة" value="64%" change="+5%" color="#F5A623" />
        </div>
    </div>
);
