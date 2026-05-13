import EmployeeLayout from '@/layouts/employee-layout';
import ConfirmModal from '@/components/confirm-modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import type { Community, League, LeagueMatch, LeagueStanding, Sport } from '@/types/models';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    community: Community & { sport?: Sport };
    league: League;
    standings: LeagueStanding[] | null;
    isLeader: boolean;
}

export default function LeagueShow({ community, league, standings, isLeader }: Props) {
    const color = community.sport?.color ?? community.color ?? '#009E82';
    const matches = league.matches ?? [];
    const isKnockout = league.format === 'knockout';
    const formatLabel = league.format === 'knockout' ? 'خروج المغلوب'
        : league.format === 'double_round_robin' ? 'دوري ذهاب وإياب' : 'دوري دور واحد';

    const [activeView, setActiveView] = useState<'standings' | 'matches' | 'bracket'>(isKnockout ? 'bracket' : 'standings');
    const [editingMatch, setEditingMatch] = useState<LeagueMatch | null>(null);
    const [showDelete, setShowDelete] = useState(false);

    const scoreForm = useForm({ score_a: '', score_b: '' });

    function openScoreModal(match: LeagueMatch) {
        setEditingMatch(match);
        scoreForm.setData({
            score_a: match.score_a !== null ? String(match.score_a) : '',
            score_b: match.score_b !== null ? String(match.score_b) : '',
        });
    }

    function submitScore(e: React.FormEvent) {
        e.preventDefault();
        if (!editingMatch) return;
        scoreForm.post(`/employee/community/${community.id}/leagues/${league.id}/matches/${editingMatch.id}/result`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingMatch(null);
                toastr.success('تم تسجيل النتيجة');
            },
        });
    }

    function handleDelete() {
        router.delete(`/employee/community/${community.id}/leagues/${league.id}`, {
            onSuccess: () => toastr.success('تم حذف البطولة'),
        });
    }

    const playedCount = matches.filter(m => m.status === 'played').length;
    const totalCount = matches.filter(m => m.department_a_id && m.department_b_id).length;

    // For knockout bracket
    const rounds = isKnockout ? groupByRound(matches) : {};

    const views = isKnockout
        ? [
            { key: 'bracket' as const, label: 'الشجرة' },
            { key: 'matches' as const, label: 'المباريات' },
        ]
        : [
            { key: 'standings' as const, label: 'الترتيب' },
            { key: 'matches' as const, label: 'المباريات' },
        ];

    return (
        <EmployeeLayout>
            <Head title={league.name} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 16 }}>
                <Link href={`/employee/community/${community.id}?tab=leagues`} style={{ color: '#7A8BA8', textDecoration: 'none', fontSize: 13 }}>← {community.name}</Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{league.name}</span>
            </div>

            {/* Header */}
            <div className="card" style={{ borderColor: `${color}33`, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>{league.name}</div>
                        <div style={{ fontSize: 12, color: '#7A8BA8', marginTop: 4 }}>
                            {formatLabel} · {league.departments?.length ?? 0} أقسام · {playedCount}/{totalCount} مباراة
                        </div>
                    </div>
                    <span className="badge" style={league.status === 'active' ? { background: '#009E8218', color: '#009E82' } : { background: '#6B7A9918', color: '#6B7A99' }}>
                        {league.status === 'active' ? 'جارية' : 'منتهية'}
                    </span>
                </div>
                {isLeader && (
                    <div style={{ marginTop: 10 }}>
                        <button
                            onClick={() => setShowDelete(true)}
                            style={{ fontSize: 11, color: '#E03050', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            حذف البطولة
                        </button>
                    </div>
                )}
            </div>

            {/* View tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {views.map((v) => (
                    <button
                        key={v.key}
                        className="pill"
                        onClick={() => setActiveView(v.key)}
                        style={activeView === v.key ? { background: color, color: '#fff' } : { background: '#E4E9F2', color: '#7A8BA8' }}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            {/* Standings (round-robin only) */}
            {activeView === 'standings' && standings && (
                <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, whiteSpace: 'nowrap' }}>
                        <thead>
                            <tr style={{ background: '#F7F8FA' }}>
                                <th style={{ padding: '10px 8px', textAlign: 'center', width: 30 }}>#</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right' }}>القسم</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>لع</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>ف</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>ت</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>خ</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>+</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>-</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 30 }}>+/-</th>
                                <th style={{ padding: '10px 8px', textAlign: 'center', width: 36, fontWeight: 900, color }}>نق</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((row, i) => (
                                <tr key={row.department.id} style={{ borderTop: '1px solid #F0F2F6', background: i === 0 ? `${color}06` : undefined }}>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: i === 0 ? color : '#7A8BA8' }}>{i + 1}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#1A1A2E' }}>{row.department.name}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#4A5C78' }}>{row.played}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#009E82', fontWeight: 600 }}>{row.won}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#7A8BA8' }}>{row.drawn}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#E03050', fontWeight: 600 }}>{row.lost}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#4A5C78' }}>{row.gf}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#4A5C78' }}>{row.ga}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600, color: row.gd > 0 ? '#009E82' : row.gd < 0 ? '#E03050' : '#7A8BA8' }}>
                                        {row.gd > 0 ? '+' : ''}{row.gd}
                                    </td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 900, fontSize: 14, color }}>{row.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Match list */}
            {activeView === 'matches' && (() => {
                const assignedMatches = matches.filter(m => m.department_a_id && m.department_b_id);
                if (assignedMatches.length === 0) {
                    return <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لا توجد مباريات بعد</div>;
                }
                const grouped = groupByRound(assignedMatches);
                const getRoundLabel = (roundNum: string, roundMatches: LeagueMatch[]) => {
                    if (isKnockout) return roundMatches[0]?.round_label ?? `الدور ${roundNum}`;
                    if (league.format === 'double_round_robin') return roundNum === '1' ? 'الذهاب' : 'الإياب';
                    return `الجولة ${roundNum}`;
                };
                return (
                    <div>
                        {Object.entries(grouped).map(([roundNum, roundMatches]) => {
                            const regular = roundMatches.filter(m => !m.is_third_place);
                            const thirdPlace = roundMatches.find(m => m.is_third_place);
                            return (
                                <div key={roundNum} style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#7A8BA8', marginBottom: 8, paddingRight: 4 }}>
                                        {getRoundLabel(roundNum, roundMatches)}
                                    </div>
                                    {regular.map((match) => (
                                        <div key={match.id} className="card" style={{ marginBottom: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
                                                    {match.department_a?.name ?? '—'}
                                                </div>
                                                <div style={{
                                                    minWidth: 70, textAlign: 'center', padding: '6px 12px',
                                                    borderRadius: 8, fontWeight: 900, fontSize: 16,
                                                    background: match.status === 'played' ? `${color}15` : '#F7F8FA',
                                                    color: match.status === 'played' ? color : '#7A8BA8',
                                                }}>
                                                    {match.status === 'played'
                                                        ? `${match.score_a} - ${match.score_b}`
                                                        : 'vs'}
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
                                                    {match.department_b?.name ?? '—'}
                                                </div>
                                            </div>
                                            {isLeader && (
                                                <div style={{ textAlign: 'center', marginTop: 8 }}>
                                                    <button
                                                        onClick={() => openScoreModal(match)}
                                                        style={{ fontSize: 11, color, background: 'none', border: `1px solid ${color}33`, borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit' }}
                                                    >
                                                        {match.status === 'played' ? 'تعديل النتيجة' : 'تسجيل النتيجة'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {thirdPlace && (
                                        <div key={thirdPlace.id}>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: '#7A8BA8', marginBottom: 6, marginTop: 10, paddingRight: 4 }}>المركز الثالث</div>
                                            <div className="card" style={{ marginBottom: 6 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
                                                        {thirdPlace.department_a?.name ?? '—'}
                                                    </div>
                                                    <div style={{
                                                        minWidth: 70, textAlign: 'center', padding: '6px 12px',
                                                        borderRadius: 8, fontWeight: 900, fontSize: 16,
                                                        background: thirdPlace.status === 'played' ? `${color}15` : '#F7F8FA',
                                                        color: thirdPlace.status === 'played' ? color : '#7A8BA8',
                                                    }}>
                                                        {thirdPlace.status === 'played'
                                                            ? `${thirdPlace.score_a} - ${thirdPlace.score_b}`
                                                            : 'vs'}
                                                    </div>
                                                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
                                                        {thirdPlace.department_b?.name ?? '—'}
                                                    </div>
                                                </div>
                                                {isLeader && (
                                                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                                                        <button
                                                            onClick={() => openScoreModal(thirdPlace)}
                                                            style={{ fontSize: 11, color, background: 'none', border: `1px solid ${color}33`, borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit' }}
                                                        >
                                                            {thirdPlace.status === 'played' ? 'تعديل النتيجة' : 'تسجيل النتيجة'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })()}

            {/* Knockout bracket */}
            {activeView === 'bracket' && isKnockout && (
                <div style={{ overflowX: 'auto', paddingBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 20, minWidth: 'max-content', alignItems: 'stretch' }}>
                        {Object.entries(rounds).map(([roundNum, roundMatches]) => {
                            const regularMatches = roundMatches.filter(m => !m.is_third_place);
                            const thirdPlace = roundMatches.find(m => m.is_third_place);
                            const label = regularMatches[0]?.round_label ?? `الدور ${roundNum}`;
                            return (
                                <div key={roundNum} style={{ display: 'flex', flexDirection: 'column', minWidth: 190 }}>
                                    <div style={{
                                        fontSize: 11, fontWeight: 700, color: '#fff', textAlign: 'center',
                                        marginBottom: 12, background: color, borderRadius: 8, padding: '6px 12px',
                                    }}>
                                        {label}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
                                        {regularMatches.map((match) => (
                                            <BracketMatch key={match.id} match={match} color={color} isLeader={isLeader} onEdit={openScoreModal} />
                                        ))}
                                    </div>
                                    {thirdPlace && (
                                        <div style={{ marginTop: 16 }}>
                                            <div style={{
                                                fontSize: 11, fontWeight: 700, color: '#7A8BA8', textAlign: 'center',
                                                marginBottom: 8, background: '#F0F2F6', borderRadius: 8, padding: '4px 10px',
                                            }}>
                                                المركز الثالث
                                            </div>
                                            <BracketMatch match={thirdPlace} color={color} isLeader={isLeader} onEdit={openScoreModal} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Score entry modal */}
            {editingMatch && (
                <div
                    onClick={() => setEditingMatch(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 16,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#fff', borderRadius: 16, padding: 24,
                            width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.2)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontSize: 16, fontWeight: 800 }}>تسجيل النتيجة</div>
                            <button
                                onClick={() => setEditingMatch(null)}
                                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F4', background: '#F7F8FA', cursor: 'pointer', fontSize: 16, color: '#7A8BA8' }}
                            >×</button>
                        </div>

                        {editingMatch.round_label && (
                            <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 16, textAlign: 'center', background: '#F7F8FA', borderRadius: 8, padding: '6px 12px' }}>
                                {editingMatch.round_label}{editingMatch.is_third_place ? ' (المركز الثالث)' : ''}
                            </div>
                        )}

                        <form onSubmit={submitScore}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#4A5C78' }}>{editingMatch.department_a?.name ?? '—'}</div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={scoreForm.data.score_a}
                                        onChange={(e) => scoreForm.setData('score_a', e.target.value)}
                                        required
                                        style={{
                                            width: '100%', textAlign: 'center', padding: '14px 8px',
                                            fontSize: 28, fontWeight: 900, border: `2px solid #E2E8F4`,
                                            borderRadius: 12, outline: 'none', fontFamily: 'inherit',
                                            background: '#F7F8FA',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = color}
                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F4'}
                                    />
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#C8D0E0', marginTop: 28 }}>:</div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#4A5C78' }}>{editingMatch.department_b?.name ?? '—'}</div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={scoreForm.data.score_b}
                                        onChange={(e) => scoreForm.setData('score_b', e.target.value)}
                                        required
                                        style={{
                                            width: '100%', textAlign: 'center', padding: '14px 8px',
                                            fontSize: 28, fontWeight: 900, border: `2px solid #E2E8F4`,
                                            borderRadius: 12, outline: 'none', fontFamily: 'inherit',
                                            background: '#F7F8FA',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = color}
                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F4'}
                                    />
                                </div>
                            </div>

                            {isKnockout && (
                                <div style={{ fontSize: 11, color: '#E03050', textAlign: 'center', marginBottom: 12, background: '#E0305008', borderRadius: 8, padding: '6px 12px' }}>
                                    لا يمكن التعادل في نظام خروج المغلوب
                                </div>
                            )}

                            {Object.values(scoreForm.errors).map((err, i) => (
                                <div key={i} style={{ fontSize: 12, color: '#E03050', marginBottom: 4, textAlign: 'center' }}>{err}</div>
                            ))}

                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <button
                                    type="submit"
                                    disabled={scoreForm.processing}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                                        background: color, color: '#fff', fontSize: 14, fontWeight: 700,
                                        cursor: scoreForm.processing ? 'not-allowed' : 'pointer',
                                        opacity: scoreForm.processing ? 0.6 : 1,
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    حفظ النتيجة
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingMatch(null)}
                                    style={{
                                        padding: '12px 20px', borderRadius: 10,
                                        border: '1px solid #E2E8F4', background: '#F7F8FA',
                                        color: '#7A8BA8', fontSize: 14, fontWeight: 700,
                                        cursor: 'pointer', fontFamily: 'inherit',
                                    }}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={showDelete}
                title="حذف البطولة"
                message={`هل تريد حذف بطولة "${league.name}"؟ سيتم حذف جميع المباريات والنتائج.`}
                confirmLabel="حذف"
                onConfirm={handleDelete}
                onCancel={() => setShowDelete(false)}
            />
        </EmployeeLayout>
    );
}

function BracketMatch({ match, color, isLeader, onEdit }: { match: LeagueMatch; color: string; isLeader: boolean; onEdit: (m: LeagueMatch) => void }) {
    const hasTeams = match.department_a_id && match.department_b_id;
    const isPlayed = match.status === 'played';
    const winnerA = isPlayed && match.score_a !== null && match.score_b !== null && match.score_a > match.score_b;
    const winnerB = isPlayed && match.score_a !== null && match.score_b !== null && match.score_b > match.score_a;

    return (
        <div
            style={{
                borderRadius: 12, overflow: 'hidden', minWidth: 180,
                background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                border: isPlayed ? `1px solid ${color}33` : '1px solid #E4E9F2',
            }}
        >
            {/* Team A */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderBottom: '1px solid #F0F2F6',
                background: winnerA ? `${color}0A` : '#fff',
            }}>
                <span style={{
                    fontSize: 13, fontWeight: winnerA ? 800 : 500,
                    color: match.department_a_id ? (winnerA ? '#1A1A2E' : '#4A5C78') : '#C8D0E0',
                }}>
                    {match.department_a?.name ?? '—'}
                </span>
                <span style={{
                    fontSize: 14, fontWeight: 800, minWidth: 22, textAlign: 'center',
                    color: winnerA ? color : '#7A8BA8',
                }}>
                    {match.score_a ?? ''}
                </span>
            </div>
            {/* Team B */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px',
                background: winnerB ? `${color}0A` : '#fff',
            }}>
                <span style={{
                    fontSize: 13, fontWeight: winnerB ? 800 : 500,
                    color: match.department_b_id ? (winnerB ? '#1A1A2E' : '#4A5C78') : '#C8D0E0',
                }}>
                    {match.department_b?.name ?? '—'}
                </span>
                <span style={{
                    fontSize: 14, fontWeight: 800, minWidth: 22, textAlign: 'center',
                    color: winnerB ? color : '#7A8BA8',
                }}>
                    {match.score_b ?? ''}
                </span>
            </div>
            {/* Leader action */}
            {isLeader && hasTeams && (
                <div
                    onClick={() => onEdit(match)}
                    style={{
                        textAlign: 'center', padding: '6px', fontSize: 11, fontWeight: 600,
                        color, cursor: 'pointer', borderTop: '1px solid #F0F2F6',
                        background: '#FAFBFC',
                    }}
                >
                    {isPlayed ? 'تعديل' : 'تسجيل النتيجة'}
                </div>
            )}
        </div>
    );
}

function groupByRound(matches: LeagueMatch[]): Record<number, LeagueMatch[]> {
    const groups: Record<number, LeagueMatch[]> = {};
    matches.forEach((m) => {
        if (!groups[m.round]) groups[m.round] = [];
        groups[m.round].push(m);
    });
    // Sort matches within each round
    Object.values(groups).forEach(arr => arr.sort((a, b) => a.match_number - b.match_number));
    return groups;
}
