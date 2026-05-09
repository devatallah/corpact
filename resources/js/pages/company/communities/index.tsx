import CompanyLayout from '@/layouts/company-layout';
import SportIcon from '@/components/sport-icon';
import type { Community, Sport, Employee } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';

const COLORS = ['#0CA678', '#D4820A', '#5B3FCC', '#3B5BDB', '#E03050', '#8B5CF6'];

interface Props {
    communities: Community[];
    sports?: Sport[];
}

export default function CommunitiesIndex({ communities, sports }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Community | null>(null);

    const form = useForm({
        name: '',
        description: '',
        sport_id: '',
        leader_id: '',
    });

    // Leader search state
    const [leaderQuery, setLeaderQuery] = useState('');
    const [leaderResults, setLeaderResults] = useState<{ id: number; name: string; email: string }[]>([]);
    const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);
    const [selectedLeaderName, setSelectedLeaderName] = useState('');
    const leaderRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const searchLeader = useCallback((q: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            if (q.length === 0) { setLeaderResults([]); return; }
            const res = await fetch(`/company/employees/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setLeaderResults(data);
            setShowLeaderDropdown(true);
        }, 300);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (leaderRef.current && !leaderRef.current.contains(e.target as Node)) {
                setShowLeaderDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        if (editingItem) {
            form.setData({
                name: editingItem.name ?? '',
                description: editingItem.description ?? '',
                sport_id: editingItem.sport_id ? String(editingItem.sport_id) : '',
                leader_id: editingItem.leader_id ? String(editingItem.leader_id) : '',
            });
            setSelectedLeaderName(editingItem.leader?.name ?? '');
            setLeaderQuery(editingItem.leader?.name ?? '');
        }
    }, [editingItem]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (editingItem) {
            form.put(`/company/communities/${editingItem.id}`, {
                onSuccess: () => setEditingItem(null),
            });
        } else {
            form.post('/company/communities', {
                onSuccess: () => {
                    setShowCreate(false);
                    form.reset();
                },
            });
        }
    }

    return (
        <CompanyLayout>
            <Head title="المجتمعات" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div className="page-title">إدارة المجتمعات</div>
                    <div className="page-sub">{communities.length} مجتمعات نشطة</div>
                </div>
                <button
                    onClick={() => { setShowCreate(true); setEditingItem(null); form.reset(); setLeaderQuery(''); setSelectedLeaderName(''); setLeaderResults([]); }}
                    style={{ background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                    + إنشاء مجتمع
                </button>
            </div>

            {communities.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: 13, color: '#7A8BA8' }}>لا توجد مجتمعات بعد</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {communities.map((community, index) => {
                        const color = community.color ?? COLORS[index % COLORS.length];
                        const activeMembers = community.members_count ?? 0;
                        const eventCount = community.events_count ?? 0;
                        const balance = Number(community.balance ?? 0);

                        return (
                            <div
                                key={community.id}
                                style={{
                                    background: '#fff',
                                    borderRadius: 20,
                                    overflow: 'hidden',
                                    boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.03)',
                                }}
                            >
                                {/* Colored top band */}
                                <div style={{ height: 5, background: color }} />

                                <div style={{ padding: '28px 28px 24px' }}>
                                    {/* Row 1: Sport icon + name + edit */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                                        <SportIcon icon={community.sport?.icon ?? community.icon} size={38} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 20, fontWeight: 800 }}>{community.name}</div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingItem(community); setShowCreate(false); }}
                                            style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}
                                        >
                                            تعديل
                                        </button>
                                    </div>

                                    {/* Leader */}
                                    <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24, paddingRight: 54 }}>
                                        {community.leader?.name ?? '\u2014'}
                                    </div>

                                    {/* Stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, background: '#F8FAFC', borderRadius: 14, padding: '20px 0' }}>
                                        <div style={{ textAlign: 'center', borderLeft: '1px solid #E8ECF4' }}>
                                            <div style={{ fontSize: 26, fontWeight: 800, color: '#0F1923' }}>{activeMembers}</div>
                                            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>عضو</div>
                                        </div>
                                        <div style={{ textAlign: 'center', borderLeft: '1px solid #E8ECF4' }}>
                                            <div style={{ fontSize: 26, fontWeight: 800, color: '#0F1923' }}>{eventCount}</div>
                                            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>فعالية</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 22, fontWeight: 800, color }}>{balance.toLocaleString()}</div>
                                            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>ريال</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل المجتمع' : 'إضافة مجتمع'}
                            <button className="close-btn" onClick={() => { setShowCreate(false); setEditingItem(null); }}>×</button>
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="frow">
                                <div className="fg">
                                    <label>اسم المجتمع</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        required
                                    />
                                    {form.errors.name && <div className="field-error">{form.errors.name}</div>}
                                </div>
                                <div className="fg" ref={leaderRef} style={{ position: 'relative' }}>
                                    <label>القائد</label>
                                    <input
                                        type="text"
                                        placeholder="ابحث باسم الموظف..."
                                        value={leaderQuery}
                                        onChange={(e) => {
                                            setLeaderQuery(e.target.value);
                                            searchLeader(e.target.value);
                                            if (!e.target.value) {
                                                form.setData('leader_id', '');
                                                setSelectedLeaderName('');
                                            }
                                        }}
                                        onFocus={() => { if (leaderResults.length > 0) setShowLeaderDropdown(true); }}
                                    />
                                    {showLeaderDropdown && leaderResults.length > 0 && (
                                        <div style={{
                                            position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 50,
                                            background: '#fff', border: '1px solid #E4E9F2', borderRadius: 10,
                                            boxShadow: '0 8px 24px rgba(0,0,0,.1)', maxHeight: 200, overflowY: 'auto',
                                            marginTop: 4,
                                        }}>
                                            {leaderResults.map((emp) => (
                                                <div
                                                    key={emp.id}
                                                    onClick={() => {
                                                        form.setData('leader_id', String(emp.id));
                                                        setLeaderQuery(emp.name);
                                                        setSelectedLeaderName(emp.name);
                                                        setShowLeaderDropdown(false);
                                                    }}
                                                    style={{
                                                        padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                                                        borderBottom: '1px solid #F1F5F9',
                                                        background: String(emp.id) === form.data.leader_id ? '#3B5BDB08' : undefined,
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8F9FC')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = String(emp.id) === form.data.leader_id ? '#3B5BDB08' : '')}
                                                >
                                                    <div style={{ fontWeight: 600 }}>{emp.name}</div>
                                                    <div style={{ fontSize: 11, color: '#7A8BA8' }}>{emp.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {form.errors.leader_id && <div className="field-error">{form.errors.leader_id}</div>}
                                </div>
                            </div>
                            <div className="frow">
                                <div className="fg">
                                    <label>الرياضة</label>
                                    <select
                                        value={form.data.sport_id}
                                        onChange={(e) => form.setData('sport_id', e.target.value)}
                                    >
                                        <option value="">اختر الرياضة</option>
                                        {sports?.map((sport) => (
                                            <option key={sport.id} value={sport.id}>
                                                <SportIcon icon={sport.icon} size={16} /> {sport.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.sport_id && <div className="field-error">{form.errors.sport_id}</div>}
                                </div>
                                <div className="fg" />
                            </div>
                            <div className="frow">
                                <div className="fg">
                                    <label>الوصف</label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        rows={3}
                                    />
                                    {form.errors.description && <div className="field-error">{form.errors.description}</div>}
                                </div>
                                <div className="fg" />
                            </div>
                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={form.processing}>حفظ</button>
                                <button type="button" className="pa-reject" onClick={() => { setShowCreate(false); setEditingItem(null); }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CompanyLayout>
    );
}
