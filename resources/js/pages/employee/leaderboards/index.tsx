import EmployeeLayout from '@/layouts/employee-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

/*
 * H §13 — لوحتا الصدارة: المواظبة أولاً («أهم من لوحة المهارة سلوكياً»)
 * ثم المهارة، كلٌّ منهما فردياً وعلى مستوى الإدارة، بمنتقي الموسم.
 * لا مقارنة بين الشركات في أي مكان.
 */

interface SeasonRow {
    id: number;
    name: string;
    starts_on: string;
    ends_on: string;
    status: string;
    is_auto: boolean;
}

interface CommunityRow {
    id: number;
    name: string;
}

interface ConsistencyRow {
    rank: number;
    employee_id?: number;
    department_id?: number | null;
    name: string | null;
    avatar?: string | null;
    events_count: number;
    points: number;
    members_count?: number;
    first_participation_at?: string | null;
}

interface SkillRow {
    rank: number;
    employee_id?: number;
    department_id?: number | null;
    name: string | null;
    avatar?: string | null;
    unit: string;
    unit_label: string;
    best_value: number;
    best_value_formatted: string;
    results_count: number;
    members_count?: number;
}

interface Boards {
    archived: boolean;
    units: string[];
    unit: string | null;
    consistency: { individual: ConsistencyRow[]; department: ConsistencyRow[] };
    skill: { individual: SkillRow[]; department: SkillRow[] };
}

interface Props {
    communities: CommunityRow[];
    community: CommunityRow | null;
    seasons: SeasonRow[];
    season: SeasonRow | null;
    boards: Boards | null;
    canManageSeasons: boolean;
    myEmployeeId: number;
}

function medal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

export default function EmployeeLeaderboards({
    communities,
    community,
    seasons,
    season,
    boards,
    canManageSeasons,
    myEmployeeId,
}: Props) {
    const [board, setBoard] = useState<'consistency' | 'skill'>('consistency');
    const [level, setLevel] = useState<'individual' | 'department'>('individual');
    const [showSeasonForm, setShowSeasonForm] = useState(false);

    const seasonForm = useForm({ name: '', starts_on: '', ends_on: '' });

    function pick(params: Record<string, number>) {
        router.get('/employee/leaderboards', params, { preserveScroll: true });
    }

    function submitSeason(e: React.FormEvent) {
        e.preventDefault();
        if (!community) return;
        seasonForm.post(`/employee/community/${community.id}/seasons`, {
            preserveScroll: true,
            onSuccess: () => {
                seasonForm.reset();
                setShowSeasonForm(false);
            },
        });
    }

    function closeSeason() {
        if (!season) return;
        router.post(`/employee/seasons/${season.id}/close`, {}, { preserveScroll: true });
    }

    const consistencyRows = boards ? boards.consistency[level] : [];
    const skillRows = boards ? boards.skill[level] : [];

    return (
        <EmployeeLayout>
            <Head title="لوحتا الصدارة" />

            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>🏆 لوحتا الصدارة</h1>
                <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                    المواظبة تكافئ الاستمرارية، والمهارة تعتمد نتائج المسابقات. الترتيب داخل مجتمعك وموسمك فقط.
                </p>
            </div>

            {/* منتقي المجتمع والموسم */}
            <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ minWidth: 180 }}>
                    <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>المجتمع</label>
                    <select
                        value={community?.id ?? ''}
                        onChange={(e) => pick({ community: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8 }}
                    >
                        {communities.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ minWidth: 220 }}>
                    <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>الموسم</label>
                    <select
                        value={season?.id ?? ''}
                        onChange={(e) => pick({ community: community?.id ?? 0, season: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8 }}
                    >
                        {seasons.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.starts_on} — {s.ends_on}){s.status === 'closed' ? ' — مؤرشف' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {canManageSeasons && community && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline" onClick={() => setShowSeasonForm((v) => !v)} style={{ fontSize: 13 }}>
                            ＋ موسم مخصص
                        </button>
                        {season && season.status !== 'closed' && (
                            <button className="btn btn-outline" onClick={closeSeason} style={{ fontSize: 13 }}>
                                إغلاق الموسم وأرشفة اللوحة
                            </button>
                        )}
                    </div>
                )}
            </div>

            {showSeasonForm && canManageSeasons && community && (
                <form className="card" onSubmit={submitSeason} style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ minWidth: 200 }}>
                        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>اسم الموسم</label>
                        <input
                            value={seasonForm.data.name}
                            onChange={(e) => seasonForm.setData('name', e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8 }}
                        />
                        {seasonForm.errors.name && <div style={{ color: '#DC2626', fontSize: 12 }}>{seasonForm.errors.name}</div>}
                    </div>
                    <div>
                        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>من</label>
                        <input type="date" value={seasonForm.data.starts_on} onChange={(e) => seasonForm.setData('starts_on', e.target.value)}
                            style={{ padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8 }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>إلى</label>
                        <input type="date" value={seasonForm.data.ends_on} onChange={(e) => seasonForm.setData('ends_on', e.target.value)}
                            style={{ padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8 }} />
                        {seasonForm.errors.ends_on && <div style={{ color: '#DC2626', fontSize: 12 }}>{seasonForm.errors.ends_on}</div>}
                    </div>
                    <button className="btn" type="submit" disabled={seasonForm.processing}>حفظ</button>
                </form>
            )}

            {boards?.archived && (
                <div className="card" style={{ marginBottom: 16, background: '#FFF8E6', border: '1px solid #F0D9A0', fontSize: 13 }}>
                    📦 هذا موسم مغلق — اللوحة المعروضة هي <b>النسخة النهائية المؤرشفة</b>. لا نتيجة حُذفت، والموسم التالي بدأ من الصفر.
                </div>
            )}

            {/* تبويبا اللوحة والمستوى */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <button className={`pill${board === 'consistency' ? ' on' : ''}`} onClick={() => setBoard('consistency')}>
                    🔁 المواظبة
                </button>
                <button className={`pill${board === 'skill' ? ' on' : ''}`} onClick={() => setBoard('skill')}>
                    ⚡ المهارة
                </button>
                <span style={{ flex: 1 }} />
                <button className={`pill${level === 'individual' ? ' on' : ''}`} onClick={() => setLevel('individual')}>
                    فردي
                </button>
                <button className={`pill${level === 'department' ? ' on' : ''}`} onClick={() => setLevel('department')}>
                    الإدارات
                </button>
            </div>

            {board === 'skill' && boards && boards.units.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {boards.units.map((u) => (
                        <button
                            key={u}
                            className={`pill${boards.unit === u ? ' on' : ''}`}
                            onClick={() => pick({ community: community?.id ?? 0, season: season?.id ?? 0 })}
                        >
                            {u}
                        </button>
                    ))}
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {board === 'consistency' && (
                    consistencyRows.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 14 }}>
                            لا مشاركات محتسبة في هذا الموسم بعد — نقاطك تبدأ من أول مشاركة.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ background: '#FAFAFA', textAlign: 'right' }}>
                                    <th style={{ padding: '10px 14px', width: 60 }}>الترتيب</th>
                                    <th style={{ padding: '10px 14px' }}>{level === 'individual' ? 'الموظف' : 'الإدارة'}</th>
                                    <th style={{ padding: '10px 14px' }}>فعاليات حضرها</th>
                                    <th style={{ padding: '10px 14px' }}>النقاط</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consistencyRows.map((row, i) => (
                                    <tr
                                        key={`${row.employee_id ?? row.department_id ?? i}`}
                                        style={{
                                            borderTop: '1px solid #F0EDE8',
                                            background: row.employee_id === myEmployeeId ? '#F2F7FF' : undefined,
                                        }}
                                    >
                                        <td style={{ padding: '10px 14px' }}>{medal(row.rank)}</td>
                                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                                            {row.name ?? '—'}
                                            {level === 'department' && row.members_count !== undefined && (
                                                <span style={{ color: '#888', fontWeight: 400, fontSize: 12 }}> · {row.members_count} مشارك</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 14px' }}>{row.events_count}</td>
                                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>{row.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

                {board === 'skill' && (
                    skillRows.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 14 }}>
                            لا نتائج مسابقات مسجَّلة في هذا الموسم.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ background: '#FAFAFA', textAlign: 'right' }}>
                                    <th style={{ padding: '10px 14px', width: 60 }}>الترتيب</th>
                                    <th style={{ padding: '10px 14px' }}>{level === 'individual' ? 'الموظف' : 'الإدارة'}</th>
                                    <th style={{ padding: '10px 14px' }}>أفضل نتيجة</th>
                                    <th style={{ padding: '10px 14px' }}>عدد النتائج</th>
                                </tr>
                            </thead>
                            <tbody>
                                {skillRows.map((row, i) => (
                                    <tr
                                        key={`${row.employee_id ?? row.department_id ?? i}`}
                                        style={{
                                            borderTop: '1px solid #F0EDE8',
                                            background: row.employee_id === myEmployeeId ? '#F2F7FF' : undefined,
                                        }}
                                    >
                                        <td style={{ padding: '10px 14px' }}>{medal(row.rank)}</td>
                                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{row.name ?? '—'}</td>
                                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>{row.best_value_formatted}</td>
                                        <td style={{ padding: '10px 14px' }}>{row.results_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </EmployeeLayout>
    );
}
