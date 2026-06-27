import EmployeeLayout from '@/layouts/employee-layout';
import CategoryIcon from '@/components/category-icon';
import { Head, Link, useForm } from '@inertiajs/react';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Employee, Community, Event, Business, Category, Company } from '@/types/models';
import { useState, useRef } from 'react';
import toastr from 'toastr';

const statusMap: Record<string, { label: string; color: string }> = {
    open: { label: 'مفتوح', color: '#18A86B' },
    confirmed: { label: 'مؤكد', color: '#2563EB' },
    waiting_business: { label: 'معلق', color: '#D97706' },
    full: { label: 'مكتمل', color: '#8B5CF6' },
    completed: { label: 'منتهي', color: '#666' },
    cancelled: { label: 'ملغي', color: '#EF4444' },
    rejected: { label: 'مرفوض', color: '#EF4444' },
    alternative_proposed: { label: 'بديل مقترح', color: '#D97706' },
};

interface ProfileStats {
    events_participated: number;
    communities_joined: number;
    events_created: number;
}

interface ActivityStats {
    streak: number;
    total_events: number;
    events_this_month: number;
    top_category: string | null;
}

interface Props {
    employee: Employee & { company: Company };
    stats: ProfileStats;
    activityStats: ActivityStats;
    events: (Event & { business: Business; community: Community; category?: Category })[];
    communities: (Community & { category?: Category; members_count: number })[];
}

type ProfileTab = 'events' | 'communities';

export default function ProfileIndex({ employee, stats, activityStats, events, communities }: Props) {
    const [activeTab, setActiveTab] = useState<ProfileTab>('events');
    const [editing, setEditing] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        name: employee.name,
        phone: employee.phone ?? '',
        avatar: null as File | null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/employee/profile', {
            forceFormData: true,
            onSuccess: () => {
                setEditing(false);
                toastr.success('تم تحديث الملف الشخصي بنجاح');
            },
        });
    }

    return (
        <EmployeeLayout>
            <Head title="ملفي" />

            {/* Profile header */}
            <div style={{ paddingTop: 8, paddingBottom: 24, textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                    {employee.avatar ? (
                        <img
                            src={`/storage/${employee.avatar}`}
                            alt={employee.name}
                            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="avatar" style={{ width: 64, height: 64, margin: '0 auto', background: '#18A86B', color: '#fff', fontSize: 26, fontWeight: 700 }}>
                            {employee.name?.charAt(0)}
                        </div>
                    )}
                    {editing && (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: '#18A86B', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            📷
                        </button>
                    )}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.5px' }}>{employee.name}</div>
                <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                    {employee.department?.name ?? '—'} · {employee.company?.name}
                </div>
            </div>

            {/* Stats row */}
            <div className="metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
                <div className="metric" style={{ textAlign: 'center' }}>
                    <div className="value" style={{ color: '#18A86B' }}>{stats.events_participated}</div>
                    <div className="label">فعالية شاركت</div>
                </div>
                <div className="metric" style={{ textAlign: 'center' }}>
                    <div className="value" style={{ color: '#18A86B' }}>{stats.communities_joined}</div>
                    <div className="label">مجتمعات</div>
                </div>
                <div className="metric" style={{ textAlign: 'center' }}>
                    <div className="value" style={{ color: '#18A86B' }}>{stats.events_created}</div>
                    <div className="label">فعاليات أنشأت</div>
                </div>
            </div>

            {/* Activity Streak */}
            <div className="streak-bar">
                <div className="icon">{activityStats.streak > 0 ? '🔥' : '⭐'}</div>
                <div className="info">
                    <div className="num">
                        {activityStats.streak > 0
                            ? `${activityStats.streak} أسابيع متتالية`
                            : 'ابدأ سلسلتك!'}
                    </div>
                    <div className="sub">
                        {activityStats.streak > 0 ? 'استمر في النشاط!' : 'شارك في فعالية هذا الأسبوع'}
                    </div>
                </div>
            </div>

            {/* Activity sub-stats */}
            <div className="metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
                <div className="metric" style={{ textAlign: 'center' }}>
                    <div className="value" style={{ fontSize: 20, color: '#18A86B' }}>{activityStats.total_events}</div>
                    <div className="label">إجمالي الفعاليات</div>
                </div>
                <div className="metric" style={{ textAlign: 'center' }}>
                    <div className="value" style={{ fontSize: 20, color: '#18A86B' }}>{activityStats.events_this_month}</div>
                    <div className="label">هذا الشهر</div>
                </div>
                <div className="metric" style={{ textAlign: 'center' }}>
                    <div className="value" style={{ fontSize: 14, color: '#18A86B' }}>{activityStats.top_category ?? '—'}</div>
                    <div className="label">الفئة الأكثر</div>
                </div>
            </div>

            {/* Edit form */}
            {editing ? (
                <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                form.setData('avatar', e.target.files[0]);
                            }
                        }}
                    />
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>الاسم</label>
                        <input
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                        {form.errors.name && <div className="field-error">{form.errors.name}</div>}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>رقم الجوال</label>
                        <input
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                            dir="ltr"
                        />
                        {form.errors.phone && <div className="field-error">{form.errors.phone}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="btn btn-outline"
                            style={{ flex: 1, padding: '12px 20px' }}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '12px 20px', opacity: form.processing ? 0.6 : 1 }}
                        >
                            حفظ
                        </button>
                    </div>
                </form>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <button
                        onClick={() => setEditing(true)}
                        className="btn btn-outline"
                    >
                        تعديل الملف الشخصي
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button
                    className={`pill${activeTab === 'events' ? ' on' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    فعالياتي
                </button>
                <button
                    className={`pill${activeTab === 'communities' ? ' on' : ''}`}
                    onClick={() => setActiveTab('communities')}
                >
                    مجتمعاتي
                </button>
            </div>

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="section">
                    {events.length > 0 ? (
                        <div className="list-card">
                            {events.map((event) => {
                                const color = event.category?.color ?? event.community?.color ?? '#18A86B';
                                const pct = event.capacity > 0
                                    ? Math.round((event.participants_count / event.capacity) * 100)
                                    : 0;
                                const statusInfo = statusMap[event.status] ?? { label: event.status, color: '#666' };

                                return (
                                    <Link
                                        key={event.id}
                                        href={`/employee/detail/${event.id}`}
                                        className="list-row"
                                        style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: 16 }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                            <span className="badge" style={{ background: `${statusInfo.color}15`, color: statusInfo.color, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, flexShrink: 0 }} />
                                                {statusInfo.label}
                                            </span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 15, fontWeight: 700 }}>{event.business?.name}</div>
                                                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{event.community?.name}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginBottom: 10, fontSize: 13, color: '#666' }}>
                                            <span>📅 {fmtDate(event.event_date)}</span>
                                            <span>🕐 {fmtTime(event.start_time)}</span>
                                        </div>

                                        <div className="bar-wrap">
                                            <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginTop: 6 }}>
                                            <span>{event.participants_count} منضم</span>
                                            <span>من {event.capacity}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty">
                            <div className="ico">📭</div>
                            <div className="txt">لم تشارك في أي فعالية بعد</div>
                        </div>
                    )}
                </div>
            )}

            {/* Communities Tab */}
            {activeTab === 'communities' && (
                <div className="section">
                    {communities.length > 0 ? (
                        <div className="list-card">
                            {communities.map((community) => {
                                const cColor = community.category?.color ?? community.color ?? '#18A86B';
                                return (
                                    <Link
                                        key={community.id}
                                        href={`/employee/community/${community.id}`}
                                        className="list-row"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${cColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CategoryIcon icon={community.category?.icon} size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{community.name}</div>
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{community.members_count} عضو</div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty">
                            <div className="ico">📭</div>
                            <div className="txt">
                                لم تنضم لأي مجتمع بعد.{' '}
                                <Link href="/employee/explore" style={{ color: '#18A86B', fontWeight: 600 }}>اكتشف المجتمعات</Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </EmployeeLayout>
    );
}
