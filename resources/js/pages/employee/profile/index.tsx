import EmployeeLayout from '@/layouts/employee-layout';
import SportIcon from '@/components/sport-icon';
import { Head, Link, useForm } from '@inertiajs/react';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Employee, Community, Event, Club, Sport, Company } from '@/types/models';
import { useState, useRef } from 'react';
import toastr from 'toastr';

const statusMap: Record<string, { label: string; color: string }> = {
    open: { label: 'مفتوح', color: '#009E82' },
    confirmed: { label: 'مؤكد', color: '#2563EB' },
    waiting_club: { label: 'معلق', color: '#F59E0B' },
    full: { label: 'مكتمل', color: '#8B5CF6' },
    completed: { label: 'منتهي', color: '#6B7280' },
    cancelled: { label: 'ملغي', color: '#EF4444' },
    rejected: { label: 'مرفوض', color: '#EF4444' },
    alternative_proposed: { label: 'بديل مقترح', color: '#F59E0B' },
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
    top_sport: string | null;
}

interface Props {
    employee: Employee & { company: Company };
    stats: ProfileStats;
    activityStats: ActivityStats;
    events: (Event & { club: Club; community: Community; sport?: Sport })[];
    communities: (Community & { sport?: Sport; members_count: number })[];
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
            <div style={{ padding: '20px 0 24px', textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                    {employee.avatar ? (
                        <img
                            src={`/storage/${employee.avatar}`}
                            alt={employee.name}
                            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto', background: 'linear-gradient(135deg,#009E82,#5B3FCC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff' }}>
                            {employee.name?.charAt(0)}
                        </div>
                    )}
                    {editing && (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: '#009E82', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}
                        >
                            📷
                        </button>
                    )}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{employee.name}</div>
                <div style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 16 }}>
                    {employee.department?.name ?? '—'} · {employee.company?.name}
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', background: '#fff', border: '1px solid #E4E9F2', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderLeft: '1px solid #E4E9F2' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#009E82' }}>{stats.events_participated}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 2 }}>فعالية شاركت</div>
                    </div>
                    <div style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderLeft: '1px solid #E4E9F2' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#009E82' }}>{stats.communities_joined}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 2 }}>مجتمعات</div>
                    </div>
                    <div style={{ flex: 1, padding: '14px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#009E82' }}>{stats.events_created}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 2 }}>فعاليات أنشأت</div>
                    </div>
                </div>
            </div>

            {/* Activity Streak */}
            <div style={{ background: '#fff', border: '1px solid #E4E9F2', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: activityStats.streak > 0 ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : '#E4E9F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {activityStats.streak > 0 ? '🔥' : '⭐'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F1923' }}>
                            {activityStats.streak > 0
                                ? `🔥 ${activityStats.streak} أسابيع متتالية`
                                : 'ابدأ سلسلتك!'}
                        </div>
                        <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>
                            {activityStats.streak > 0 ? 'استمر في النشاط!' : 'شارك في فعالية هذا الأسبوع'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, background: '#F7F9FC', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#009E82' }}>{activityStats.total_events}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 2 }}>إجمالي الفعاليات</div>
                    </div>
                    <div style={{ flex: 1, background: '#F7F9FC', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#009E82' }}>{activityStats.events_this_month}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 2 }}>هذا الشهر</div>
                    </div>
                    <div style={{ flex: 1, background: '#F7F9FC', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#009E82' }}>{activityStats.top_sport ?? '—'}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 2 }}>الرياضة الأكثر</div>
                    </div>
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
                        <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 6 }}>الاسم</div>
                        <input
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: '#fff', border: '1px solid #E4E9F2', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                        />
                        {form.errors.name && (
                            <div style={{ fontSize: 11, color: '#E03050', marginTop: 4 }}>{form.errors.name}</div>
                        )}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 6 }}>رقم الجوال</div>
                        <input
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                            dir="ltr"
                            style={{ width: '100%', padding: '10px 12px', background: '#fff', border: '1px solid #E4E9F2', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                        />
                        {form.errors.phone && (
                            <div style={{ fontSize: 11, color: '#E03050', marginTop: 4 }}>{form.errors.phone}</div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            style={{ flex: 1, padding: 14, background: '#E4E9F2', color: '#7A8BA8', border: 'none', borderRadius: 16, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            style={{ flex: 1, padding: 14, background: '#009E82', color: '#fff', border: 'none', borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            حفظ
                        </button>
                    </div>
                </form>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <button
                        onClick={() => setEditing(true)}
                        style={{ background: '#fff', border: '1px solid #E4E9F2', borderRadius: 12, padding: '8px 20px', fontSize: 12, fontWeight: 700, color: '#4A5C78', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        تعديل الملف الشخصي
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                    className="pill"
                    onClick={() => setActiveTab('events')}
                    style={activeTab === 'events' ? { background: '#009E82', color: '#fff' } : { background: '#E4E9F2', color: '#7A8BA8' }}
                >
                    فعالياتي
                </button>
                <button
                    className="pill"
                    onClick={() => setActiveTab('communities')}
                    style={activeTab === 'communities' ? { background: '#009E82', color: '#fff' } : { background: '#E4E9F2', color: '#7A8BA8' }}
                >
                    مجتمعاتي
                </button>
            </div>

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div>
                    {events.length > 0 ? (
                        events.map((event) => {
                            const color = event.sport?.color ?? event.community?.color ?? '#009E82';
                            const pct = event.capacity > 0
                                ? Math.round((event.participants_count / event.capacity) * 100)
                                : 0;
                            const statusInfo = statusMap[event.status] ?? { label: event.status, color: '#6B7280' };

                            return (
                                <Link
                                    key={event.id}
                                    href={`/employee/detail/${event.id}`}
                                    style={{ display: 'block', background: '#fff', border: '1px solid #E4E9F2', borderRadius: 16, padding: 16, marginBottom: 12, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ background: `${statusInfo.color}15`, color: statusInfo.color, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, flexShrink: 0 }} />
                                            {statusInfo.label}
                                        </span>
                                        <div style={{ textAlign: 'right', marginRight: 12 }}>
                                            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{event.club?.name}</div>
                                            <div style={{ fontSize: 12, color: '#7A8BA8' }}>{event.community?.name}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, margin: '14px 0' }}>
                                        <span style={{ fontSize: 13, color: '#4A5C78' }}>📅 {fmtDate(event.event_date)}</span>
                                        <span style={{ fontSize: 13, color: '#4A5C78' }}>🕐 {fmtTime(event.start_time)}</span>
                                    </div>

                                    <div style={{ height: 6, background: '#E4E9F2', borderRadius: 6, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 6 }} />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7A8BA8', marginTop: 6 }}>
                                        <span>{event.participants_count} منضم</span>
                                        <span>من {event.capacity}</span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لم تشارك في أي فعالية بعد</div>
                    )}
                </div>
            )}

            {/* Communities Tab */}
            {activeTab === 'communities' && (
                <div>
                    {communities.length > 0 ? (
                        communities.map((community) => {
                            const cColor = community.sport?.color ?? community.color ?? '#009E82';
                            return (
                                <Link
                                    key={community.id}
                                    href={`/employee/community/${community.id}`}
                                    className="card"
                                    style={{ cursor: 'pointer', borderColor: `${cColor}33`, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div style={{ width: 46, height: 46, borderRadius: 12, background: `${cColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SportIcon icon={community.sport?.icon} size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{community.name}</div>
                                        <div style={{ fontSize: 11, color: '#7A8BA8' }}>{community.members_count} عضو</div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>
                            لم تنضم لأي مجتمع بعد.{' '}
                            <Link href="/employee/explore" style={{ color: '#009E82', fontWeight: 700 }}>اكتشف المجتمعات</Link>
                        </div>
                    )}
                </div>
            )}
        </EmployeeLayout>
    );
}
