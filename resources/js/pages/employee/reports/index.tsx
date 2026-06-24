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
            <div style={{ padding: '16px 0 20px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F1923' }}>
                    📊 تقاريري
                </div>
                <div style={{ fontSize: 13, color: '#7A8BA8', marginTop: 3 }}>
                    {employee.name}
                </div>
            </div>

            {/* 4 Stat Cards Row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {/* Total Activities */}
                <div style={{
                    minWidth: 130,
                    flexShrink: 0,
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: 20,
                    borderTop: '3px solid #1A56DB',
                }}>
                    <div style={{ fontSize: 22 }}>📊</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0F1923', marginTop: 8 }}>
                        {myStats.total_activities}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#4A5C78', marginTop: 2 }}>إجمالي أنشطتي</div>
                    <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 1 }}>نشاطاً</div>
                </div>

                {/* Total Hours */}
                <div style={{
                    minWidth: 130,
                    flexShrink: 0,
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: 20,
                    borderTop: '3px solid #0F7B6C',
                }}>
                    <div style={{ fontSize: 22 }}>⏱️</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0F1923', marginTop: 8 }}>
                        {myStats.total_hours}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#4A5C78', marginTop: 2 }}>ساعات النشاط</div>
                    <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 1 }}>ساعة مجموع</div>
                </div>

                {/* Budget Used */}
                <div style={{
                    minWidth: 130,
                    flexShrink: 0,
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: 20,
                    borderTop: '3px solid #059669',
                }}>
                    <div style={{ fontSize: 22 }}>💰</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0F1923', marginTop: 8 }}>
                        {budget.total_used.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#4A5C78', marginTop: 2 }}>إنفاق الدعم</div>
                    <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 1 }}>ريال هذا العام</div>
                </div>

                {/* Unique People */}
                <div style={{
                    minWidth: 130,
                    flexShrink: 0,
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: 20,
                    borderTop: '3px solid #111827',
                }}>
                    <div style={{ fontSize: 22 }}>👥</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0F1923', marginTop: 8 }}>
                        {myStats.unique_people}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#4A5C78', marginTop: 2 }}>زملاء شاركت معهم</div>
                    <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 1 }}>شخصاً مختلفاً</div>
                </div>
            </div>

            {/* Two-column grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>

                {/* Budget Card */}
                <div ref={budgetRef} style={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #E5E7EB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>ميزانية الدعم</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="no-print" onClick={() => printCard(budgetRef.current, 'ميزانية الدعم')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', color: '#7A8BA8', display: 'flex', alignItems: 'center', gap: 3 }}>
                                ⬇️ تحميل
                            </button>
                            <span style={{ fontSize: 18 }}>💳</span>
                        </div>
                    </div>

                    <div style={{ padding: 20 }}>
                        {/* Progress bar label */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontSize: 12, color: '#7A8BA8' }}>هذا الشهر</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F7B6C' }}>
                                {budget.this_month_used.toLocaleString()} ر
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: 10, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                            <div style={{
                                height: '100%',
                                width: `${monthlyPct}%`,
                                background: 'linear-gradient(90deg, #0F7B6C, #059669)',
                                borderRadius: 99,
                                transition: 'width 0.5s ease',
                                minWidth: monthlyPct > 0 ? 12 : 0,
                            }} />
                        </div>

                        {/* Meta */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7A8BA8', marginBottom: 16 }}>
                            <span>المستخدم: <span style={{ fontWeight: 700, color: '#0F1923' }}>{budget.this_month_used.toLocaleString()} ر</span></span>
                            <span>الإجمالي السنوي: <span style={{ fontWeight: 700, color: '#0F1923' }}>{budget.total_used.toLocaleString()} ر</span></span>
                        </div>

                        {/* Separator */}
                        <div style={{ height: 1, background: '#E5E7EB', marginBottom: 14 }} />

                        {/* Renewal date */}
                        <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 14 }}>
                            🔄 تجدد ميزانيتك في{' '}
                            <span style={{ fontWeight: 700, color: '#0F1923' }}>{budget.renewal_date}</span>
                        </div>

                        {/* Category breakdown pills */}
                        {budget.breakdown.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {budget.breakdown.map((item, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            background: '#EBF0FE',
                                            color: '#1A56DB',
                                            borderRadius: 99,
                                            padding: '5px 14px',
                                            fontSize: 13,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {item.category_name}: {item.amount.toLocaleString()} ر
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* My Stats Card */}
                <div ref={statsRef} style={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #E5E7EB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>إحصائياتي</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="no-print" onClick={() => printCard(statsRef.current, 'إحصائياتي')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', color: '#7A8BA8', display: 'flex', alignItems: 'center', gap: 3 }}>
                                ⬇️ تحميل
                            </button>
                            <span style={{ fontSize: 18 }}>⭐</span>
                        </div>
                    </div>

                    <div style={{ padding: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                            {/* Favorite Activity */}
                            <div style={{
                                background: '#F9FAFB',
                                borderRadius: 10,
                                padding: '14px 12px',
                            }}>
                                <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 8, fontWeight: 600 }}>نشاطي المفضل</div>
                                {myStats.favorite_activity ? (
                                    <>
                                        <div style={{ fontSize: 20, marginBottom: 4 }}>
                                            {myStats.favorite_activity.icon ?? '🏃'}
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1923', marginBottom: 3 }}>
                                            {myStats.favorite_activity.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#7A8BA8' }}>
                                            {myStats.favorite_activity.count} من {myStats.total_activities} نشاط
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: 12, color: '#7A8BA8' }}>لا يوجد بعد</div>
                                )}
                            </div>

                            {/* Longest Streak */}
                            <div style={{
                                background: '#F9FAFB',
                                borderRadius: 10,
                                padding: '14px 12px',
                            }}>
                                <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 8, fontWeight: 600 }}>أطول streak</div>
                                <div style={{ fontSize: 22, marginBottom: 4 }}>🔥</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1923', marginBottom: 3 }}>
                                    {myStats.longest_streak} أسابيع
                                </div>
                                <div style={{ fontSize: 11, color: '#7A8BA8' }}>متواصلة</div>
                            </div>

                            {/* This Month */}
                            <div style={{
                                background: '#F9FAFB',
                                borderRadius: 10,
                                padding: '14px 12px',
                            }}>
                                <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 8, fontWeight: 600 }}>هذا الشهر</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#1A56DB', marginBottom: 3 }}>
                                    {myStats.events_this_month}
                                </div>
                                <div style={{ fontSize: 12, color: '#7A8BA8' }}>أنشطة</div>
                            </div>

                            {/* Community Rank */}
                            <div style={{
                                background: '#F9FAFB',
                                borderRadius: 10,
                                padding: '14px 12px',
                            }}>
                                <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 8, fontWeight: 600 }}>ترتيبي في المجتمع</div>
                                {myStats.community_rank ? (
                                    <>
                                        <div style={{ fontSize: 22, marginBottom: 4 }}>
                                            {getRankEmoji(myStats.community_rank.rank)}
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1923', marginBottom: 3 }}>
                                            {myStats.community_rank.community_name}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#7A8BA8' }}>
                                            من {myStats.community_rank.total} عضو
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: 12, color: '#7A8BA8' }}>غير مصنّف بعد</div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Log Card */}
            <div ref={activityRef} style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 24,
            }}>
                {/* Card Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>سجل أنشطتي</div>
                    <button className="no-print" onClick={() => printCard(activityRef.current, 'سجل أنشطتي')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', color: '#7A8BA8', display: 'flex', alignItems: 'center', gap: 3 }}>
                        ⬇️ تحميل
                    </button>
                </div>

                {/* Filter Buttons */}
                <div style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    flexWrap: 'nowrap',
                }}>
                    {/* All button */}
                    <button
                        onClick={() => handleFilter(null)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 13,
                            border: currentFilter === null ? '1px solid #1A56DB' : '1px solid #E5E7EB',
                            background: currentFilter === null ? '#EBF0FE' : '#fff',
                            color: currentFilter === null ? '#1A56DB' : '#4A5C78',
                            fontWeight: currentFilter === null ? 600 : 400,
                            cursor: 'pointer',
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        الكل
                    </button>

                    {/* Category filter buttons */}
                    {categories.map((cat) => {
                        const isActive = currentFilter === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => handleFilter(cat)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    border: isActive ? '1px solid #1A56DB' : '1px solid #E5E7EB',
                                    background: isActive ? '#EBF0FE' : '#fff',
                                    color: isActive ? '#1A56DB' : '#4A5C78',
                                    fontWeight: isActive ? 600 : 400,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* Activity Timeline */}
                <div style={{ padding: '0 20px' }}>
                    {activityLog.length > 0 ? (
                        activityLog.map((item, idx) => {
                            const color = getCategoryColor(item.category_name);
                            const isLast = idx === activityLog.length - 1;
                            const colleagues = Math.max(0, item.participants_count - 1);

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        gap: 16,
                                        padding: '14px 0',
                                        borderBottom: isLast ? 'none' : '1px solid #E5E7EB',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    {/* Category Icon */}
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        background: `${color}18`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 18,
                                        flexShrink: 0,
                                    }}>
                                        {item.category_icon ?? '🏃'}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1923', marginBottom: 4 }}>
                                            {item.category_name}
                                            {item.business_name && (
                                                <span style={{ fontWeight: 400, color: '#7A8BA8' }}>
                                                    {' — '}{item.business_name}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#7A8BA8', lineHeight: 1.6 }}>
                                            {formatArabicDate(item.event_date)}
                                            {' · '}
                                            {formatArabicTime(item.start_time)}
                                            {colleagues > 0 && (
                                                <span> · مع {colleagues} زملاء</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div style={{
                                        fontWeight: 700,
                                        fontSize: 14,
                                        color: '#1A56DB',
                                        flexShrink: 0,
                                        paddingTop: 2,
                                    }}>
                                        {item.company_subsidy} ر
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '32px 20px',
                            color: '#7A8BA8',
                            fontSize: 13,
                        }}>
                            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                            <div>لا توجد أنشطة مسجّلة</div>
                        </div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
}
