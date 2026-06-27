import EmployeeLayout from '@/layouts/employee-layout';
import { Head, router } from '@inertiajs/react';
import { useRef } from 'react';
import { printCard } from '@/lib/print-card';

interface ActivityLogItem {
    event_date: string;
    start_time: string;
    duration_minutes: number;
    participants_count: number;
    company_subsidy: number;
    category_name: string;
    category_icon: string | null;
    business_name: string;
}

interface MyStatsData {
    total_activities: number;
    total_hours: number;
    events_this_month: number;
    favorite_activity: { name: string; icon: string | null; count: number } | null;
    unique_people: number;
    longest_streak: number;
    community_rank: { rank: number; total: number; community_name: string } | null;
}

interface BudgetData {
    total_used: number;
    this_month_used: number;
    breakdown: { category_name: string; amount: number }[];
    renewal_date: string;
}

interface Props {
    employee: { name: string; email: string };
    activityLog: ActivityLogItem[];
    myStats: MyStatsData;
    budget: BudgetData;
    categories: string[];
    currentFilter: string | null;
}

const categoryColors: Record<string, string> = {
    'بادل': '#1A56DB',
    'رياضة': '#0F7B6C',
    'كرة القدم': '#059669',
    'تنس': '#7C3AED',
    'سباحة': '#0EA5E9',
    'جيم': '#DC2626',
    'يوغا': '#D97706',
    'تسلق': '#9333EA',
};

function getCategoryColor(name: string): string {
    return categoryColors[name] ?? '#1A56DB';
}

function formatArabicDate(dateStr: string): string {
    const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatArabicTime(timeStr: string): string {
    const [h, min] = String(timeStr).slice(0, 5).split(':').map(Number);
    const suffix = h >= 12 ? 'مساءً' : 'صباحاً';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(min).padStart(2, '0')} ${suffix}`;
}

function getRankEmoji(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

export default function EmployeeReports({
    employee,
    activityLog,
    myStats,
    budget,
    categories,
    currentFilter,
}: Props) {
    const budgetRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const activityRef = useRef<HTMLDivElement>(null);

    const totalBudgetMonthly = budget.this_month_used > 0 ? budget.this_month_used * 2 : 500;
    const monthlyPct = Math.min(100, Math.round((budget.this_month_used / totalBudgetMonthly) * 100));

    function handleFilter(value: string | null) {
        if (value === null) {
            router.get('/employee/reports', {}, { preserveState: true, preserveScroll: true });
        } else {
            router.get('/employee/reports', { category: value }, { preserveState: true, preserveScroll: true });
        }
    }

    return (
        <EmployeeLayout>
            <Head title="تقاريري" />

            {/* Page Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>📊 تقاريري</h1>
                <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{employee.name}</p>
            </div>

            {/* 4 Stat Cards */}
            <div className="metrics">
                <div className="metric" style={{ borderTop: '3px solid #1A56DB' }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>📊</div>
                    <div className="value">{myStats.total_activities}</div>
                    <div className="label">إجمالي أنشطتي</div>
                </div>
                <div className="metric" style={{ borderTop: '3px solid #0F7B6C' }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>⏱️</div>
                    <div className="value">{myStats.total_hours}</div>
                    <div className="label">ساعات النشاط</div>
                </div>
                <div className="metric" style={{ borderTop: '3px solid #059669' }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>💰</div>
                    <div className="value">{budget.total_used.toLocaleString()}</div>
                    <div className="label">إنفاق الدعم</div>
                </div>
                <div className="metric" style={{ borderTop: '3px solid #0A0A0A' }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>👥</div>
                    <div className="value">{myStats.unique_people}</div>
                    <div className="label">زملاء شاركت معهم</div>
                </div>
            </div>

            {/* Budget Card */}
            <div ref={budgetRef} className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>💳 ميزانية الدعم</div>
                    <button className="no-print btn btn-outline" onClick={() => printCard(budgetRef.current, 'ميزانية الدعم')} style={{ fontSize: 12, padding: '4px 10px' }}>
                        ⬇️ تحميل
                    </button>
                </div>

                <div style={{ padding: 16 }}>
                    {/* Progress bar label */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: '#999' }}>هذا الشهر</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#18A86B' }}>{budget.this_month_used.toLocaleString()} ر</span>
                    </div>

                    {/* Progress bar */}
                    <div className="bar-wrap" style={{ height: 10, marginBottom: 10 }}>
                        <div className="bar-fill" style={{ width: `${monthlyPct}%`, minWidth: monthlyPct > 0 ? 12 : 0, transition: 'width 0.5s ease' }} />
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#999', marginBottom: 16 }}>
                        <span>المستخدم: <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{budget.this_month_used.toLocaleString()} ر</span></span>
                        <span>الإجمالي السنوي: <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{budget.total_used.toLocaleString()} ر</span></span>
                    </div>

                    <div style={{ height: 1, background: '#EBEBEB', marginBottom: 14 }} />

                    {/* Renewal date */}
                    <div style={{ fontSize: 13, color: '#999', marginBottom: 14 }}>
                        🔄 تجدد ميزانيتك في <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{budget.renewal_date}</span>
                    </div>

                    {/* Category breakdown pills */}
                    {budget.breakdown.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {budget.breakdown.map((item, idx) => (
                                <span
                                    key={idx}
                                    className="badge b-confirmed"
                                    style={{ fontSize: 13, padding: '5px 14px' }}
                                >
                                    {item.category_name}: {item.amount.toLocaleString()} ر
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* My Stats Card */}
            <div ref={statsRef} className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>⭐ إحصائياتي</div>
                    <button className="no-print btn btn-outline" onClick={() => printCard(statsRef.current, 'إحصائياتي')} style={{ fontSize: 12, padding: '4px 10px' }}>
                        ⬇️ تحميل
                    </button>
                </div>

                <div style={{ padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {/* Favorite Activity */}
                        <div className="card" style={{ background: '#FAFAFA', marginBottom: 0 }}>
                            <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 500 }}>نشاطي المفضل</div>
                            {myStats.favorite_activity ? (
                                <>
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>{myStats.favorite_activity.icon ?? '🏃'}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{myStats.favorite_activity.name}</div>
                                    <div style={{ fontSize: 12, color: '#999' }}>{myStats.favorite_activity.count} من {myStats.total_activities} نشاط</div>
                                </>
                            ) : (
                                <div style={{ fontSize: 13, color: '#999' }}>لا يوجد بعد</div>
                            )}
                        </div>

                        {/* Longest Streak */}
                        <div className="card" style={{ background: '#FAFAFA', marginBottom: 0 }}>
                            <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 500 }}>أطول streak</div>
                            <div style={{ fontSize: 22, marginBottom: 4 }}>🔥</div>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{myStats.longest_streak} أسابيع</div>
                            <div style={{ fontSize: 12, color: '#999' }}>متواصلة</div>
                        </div>

                        {/* This Month */}
                        <div className="card" style={{ background: '#FAFAFA', marginBottom: 0 }}>
                            <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 500 }}>هذا الشهر</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#18A86B', letterSpacing: '-1px', lineHeight: 1, marginBottom: 4 }}>{myStats.events_this_month}</div>
                            <div style={{ fontSize: 12, color: '#999' }}>أنشطة</div>
                        </div>

                        {/* Community Rank */}
                        <div className="card" style={{ background: '#FAFAFA', marginBottom: 0 }}>
                            <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 500 }}>ترتيبي في المجتمع</div>
                            {myStats.community_rank ? (
                                <>
                                    <div style={{ fontSize: 22, marginBottom: 4 }}>{getRankEmoji(myStats.community_rank.rank)}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{myStats.community_rank.community_name}</div>
                                    <div style={{ fontSize: 12, color: '#999' }}>من {myStats.community_rank.total} عضو</div>
                                </>
                            ) : (
                                <div style={{ fontSize: 13, color: '#999' }}>غير مصنّف بعد</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Log Card */}
            <div ref={activityRef} className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                {/* Card Header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>سجل أنشطتي</div>
                    <button className="no-print btn btn-outline" onClick={() => printCard(activityRef.current, 'سجل أنشطتي')} style={{ fontSize: 12, padding: '4px 10px' }}>
                        ⬇️ تحميل
                    </button>
                </div>

                {/* Filter Buttons */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #EBEBEB', display: 'flex', gap: 8, overflowX: 'auto' }}>
                    <button
                        onClick={() => handleFilter(null)}
                        className={`pill${currentFilter === null ? ' on' : ''}`}
                    >
                        الكل
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleFilter(cat)}
                            className={`pill${currentFilter === cat ? ' on' : ''}`}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Activity Timeline */}
                <div>
                    {activityLog.length > 0 ? (
                        activityLog.map((item, idx) => {
                            const color = getCategoryColor(item.category_name);
                            const isLast = idx === activityLog.length - 1;
                            const colleagues = Math.max(0, item.participants_count - 1);

                            return (
                                <div
                                    key={idx}
                                    className="list-row"
                                    style={{ cursor: 'default', borderBottom: isLast ? 'none' : undefined }}
                                >
                                    {/* Category Icon */}
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                        {item.category_icon ?? '🏃'}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                                            {item.category_name}
                                            {item.business_name && (
                                                <span style={{ fontWeight: 400, color: '#999' }}>
                                                    {' — '}{item.business_name}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#999', lineHeight: 1.6 }}>
                                            {formatArabicDate(item.event_date)}
                                            {' · '}
                                            {formatArabicTime(item.start_time)}
                                            {colleagues > 0 && (
                                                <span> · مع {colleagues} زملاء</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#18A86B', flexShrink: 0 }}>
                                        {item.company_subsidy} ر
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty">
                            <div className="ico">📭</div>
                            <div className="txt">لا توجد أنشطة مسجّلة</div>
                        </div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
}
