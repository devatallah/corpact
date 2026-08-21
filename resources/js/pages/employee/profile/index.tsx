import EmployeeLayout from '@/layouts/employee-layout';
import CategoryIcon from '@/components/category-icon';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Employee, Community, Event, Partner, Category, Company, NotificationPreferenceRow } from '@/types/models';
import { useState, useRef } from 'react';
import toastr from 'toastr';

// آلة حالات H §9 (A7)
const statusMap: Record<string, { label: string; color: string }> = {
    pending_approval: { label: 'بانتظار الاعتماد', color: '#D97706' },
    open: { label: 'مفتوح', color: '#18A86B' },
    pending_provider: { label: 'بانتظار المزوّد', color: '#D97706' },
    provider_alternative: { label: 'بديل مقترح', color: '#D97706' },
    booked: { label: 'محجوزة', color: '#18A86B' },
    awaiting_payment: { label: 'بانتظار الدفع', color: '#D97706' },
    confirmed: { label: 'مؤكد', color: '#2563EB' },
    in_progress: { label: 'جارية الآن', color: '#2563EB' },
    completed: { label: 'منتهي', color: '#666' },
    settled: { label: 'مسوّاة', color: '#666' },
    expired: { label: 'منتهية دون اكتمال العدد', color: '#EF4444' },
    rejected: { label: 'اقتراح مرفوض', color: '#EF4444' },
    cancelled_min_not_met: { label: 'ملغاة — لم يبلغ الحد الأدنى', color: '#EF4444' },
    cancelled_provider: { label: 'ملغاة من المزوّد', color: '#EF4444' },
    cancelled_company: { label: 'ملغاة من الشركة', color: '#EF4444' },
    cancelled_payment_failed: { label: 'ملغاة — فشل التحصيل', color: '#EF4444' },
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
    events: (Event & { partner: Partner; community: Community; category?: Category })[];
    communities: (Community & { category?: Category; members_count: number })[];
    notificationPreferences: NotificationPreferenceRow[];
}

type ProfileTab = 'events' | 'communities' | 'notifications';

export default function ProfileIndex({ employee, stats, activityStats, events, communities, notificationPreferences }: Props) {
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
                            src={employee.avatar}
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
                <button
                    className={`pill${activeTab === 'notifications' ? ' on' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    الإشعارات
                </button>
            </div>

            {/* Notification preferences — H §14: الاختيارية فقط تُوقَف */}
            {activeTab === 'notifications' && (
                <div className="section">
                    <NotificationPreferences rows={notificationPreferences} />
                </div>
            )}

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
                                                <div style={{ fontSize: 15, fontWeight: 700 }}>{event.partner?.name}</div>
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

/**
 * تفضيلات الإشعارات (H §14).
 *
 * لا تظهر هنا إلا القوالب **الاختيارية** — الإلزامية (رمز الدخول، مطالبة
 * الدفع، التأكيد، الإلغاء، الفاتورة) غير قابلة للإيقاف أصلاً، والخادم يرفض
 * إيقافها حتى لو أُرسل مفتاحها مباشرة.
 */
function NotificationPreferences({ rows }: { rows: NotificationPreferenceRow[] }) {
    const [values, setValues] = useState<Record<string, boolean>>(
        () => Object.fromEntries(rows.map((row) => [row.key, row.enabled])),
    );
    const [saving, setSaving] = useState(false);

    function toggle(key: string) {
        setValues((current) => ({ ...current, [key]: !current[key] }));
    }

    function save() {
        setSaving(true);
        router.put(
            '/employee/profile/notification-preferences',
            { preferences: values },
            {
                preserveScroll: true,
                onSuccess: () => toastr.success('حُفظت تفضيلات الإشعارات.'),
                onFinish: () => setSaving(false),
            },
        );
    }

    if (rows.length === 0) {
        return (
            <div className="empty">
                <div className="ico">🔔</div>
                <div className="txt">لا توجد إشعارات اختيارية حالياً</div>
            </div>
        );
    }

    return (
        <div className="list-card">
            <div style={{ padding: '14px 16px', fontSize: 13, color: '#666', lineHeight: 1.9 }}>
                تستطيع إيقاف الإشعارات الاختيارية فقط. الإشعارات الإلزامية — رمز الدخول، تأكيد الفعالية، المطالبة
                بالدفع، الإلغاء وتغيير الموعد، الفاتورة — تصلك دائماً ولا يمكن إيقافها.
            </div>

            {rows.map((row) => (
                <label
                    key={row.key}
                    className="list-row"
                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                >
                    <input type="checkbox" checked={values[row.key] ?? true} onChange={() => toggle(row.key)} />
                    <span style={{ flex: 1 }}>
                        <span style={{ display: 'block', fontWeight: 700 }}>{row.title}</span>
                        {row.audience && <span style={{ fontSize: 12, color: '#999' }}>{row.audience}</span>}
                    </span>
                </label>
            ))}

            <div style={{ padding: '14px 16px' }}>
                <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
                    حفظ التفضيلات
                </button>
            </div>
        </div>
    );
}
