import EmployeeLayout from '@/layouts/employee-layout';
import ConfirmModal from '@/components/confirm-modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import type { Community, League, LeagueMatch, LeagueStanding, Category } from '@/types/models';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    community: Community & { category?: Category };
    league: League;
    standings: LeagueStanding[] | null;
    isLeader: boolean;
}

export default function LeagueShow({ community, league, standings, isLeader }: Props) {
    const color = community.category?.color ?? community.color ?? '#18A86B';
    const matches = league.matches ?? [];
    const isKnockout = league.format === 'knockout';
    const formatLabel = league.format === 'knockout' ? 'خروج المغلوب'
        : league.format === 'double_round_robin' ? 'دوري ذهاب وإياب' : 'دوري دور واحد';

    const [activeView, setActiveView] = useState<'standings' | 'matches' | 'bracket'>(isKnockout ? 'bracket' : 'standings');
    const [editingMatch, setEditingMatch] = useState<LeagueMatch | null>(null);
    const [showDelete, setShowDelete] = useState(false);

    const scoreForm = useForm({ score_a: '', score_b: '', penalty_a: '', penalty_b: '' });
    const isDraw = scoreForm.data.score_a !== '' && scoreForm.data.score_b !== '' && scoreForm.data.score_a === scoreForm.data.score_b;

    function openScoreModal(match: LeagueMatch) {
        setEditingMatch(match);
        scoreForm.setData({
            score_a: match.score_a !== null ? String(match.score_a) : '',
            score_b: match.score_b !== null ? String(match.score_b) : '',
            penalty_a: match.penalty_a !== null ? String(match.penalty_a) : '',
            penalty_b: match.penalty_b !== null ? String(match.penalty_b) : '',
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

    function formatScore(m: LeagueMatch): string {
        if (m.status !== 'played') return 'vs';
        const base = `${m.score_a} - ${m.score_b}`;
        if (m.penalty_a !== null && m.penalty_b !== null) {
            return `${base}\n(${m.penalty_a} - ${m.penalty_b}) ر.ت`;
        }
        return base;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, paddingTop: 4 }}>
                <Link href={`/employee/community/${community.id}?tab=leagues`} style={{ color: '#999', textDecoration: 'none', fontSize: 13 }}>← {community.name}</Link>
                <span style={{ color: '#EBEBEB' }}>/</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{league.name}</span>
            </div>

            {/* Header */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{league.name}</div>
                        <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                            {formatLabel} · {league.departments?.length ?? 0} أقسام · {playedCount}/{totalCount} مباراة
                        </div>
                    </div>
                    <span className={`badge ${league.status === 'active' ? 'b-confirmed' : 'b-completed'}`}>
                        {league.status === 'active' ? 'جارية' : 'منتهية'}
                    </span>
                </div>
                {isLeader && (
                    <div style={{ marginTop: 12 }}>
                        <button
                            onClick={() => setShowDelete(true)}
                            className="btn btn-danger"
                            style={{ fontSize: 12, padding: '6px 14px' }}
                        >
                            حذف البطولة
                        </button>
                    </div>
                )}
            </div>

            {/* View tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {views.map((v) => (
                    <button
                        key={v.key}
                        className={`pill${activeView === v.key ? ' on' : ''}`}
                        onClick={() => setActiveView(v.key)}
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
                            <tr style={{ background: '#FAFAFA' }}>
                                <th style={{ padding: '10px 8px', textAlign: 'center', width: 30 }}>#</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right' }}>القسم</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>لع</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>ف</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>ت</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>خ</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>+</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 28 }}>-</th>
                                <th style={{ padding: '10px 4px', textAlign: 'center', width: 30 }}>+/-</th>
                                <th style={{ padding: '10px 8px', textAlign: 'center', width: 36, fontWeight: 700, color }}>نق</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((row, i) => (
                                <tr key={row.department.id} style={{ borderTop: '1px solid #EBEBEB', background: i === 0 ? `${color}06` : undefined }}>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, color: i === 0 ? color : '#999' }}>{i + 1}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, color: '#0A0A0A' }}>{row.department.name}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#666' }}>{row.played}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#18A86B', fontWeight: 600 }}>{row.won}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#999' }}>{row.drawn}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#EF4444', fontWeight: 600 }}>{row.lost}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#666' }}>{row.gf}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#666' }}>{row.ga}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600, color: row.gd > 0 ? '#18A86B' : row.gd < 0 ? '#EF4444' : '#999' }}>
                                        {row.gd > 0 ? '+' : ''}{row.gd}
                                    </td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, fontSize: 14, color }}>{row.points}</td>
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
                    return (
                        <div className="empty">
                            <div className="ico">⚽</div>
                            <div className="txt">لا توجد مباريات بعد</div>
                        </div>
                    );
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
                                <div key={roundNum} className="section">
                                    <div className="section-head">
                                        <div className="section-title" style={{ fontSize: 13, color: '#999' }}>
                                            {getRoundLabel(roundNum, roundMatches)}
                                        </div>
                                    </div>
                                    {regular.map((match) => (
                                        <div key={match.id} className="card">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                                                    {match.department_a?.name ?? '—'}
                                                </div>
                                                <div style={{
                                                    minWidth: 70, textAlign: 'center', padding: '6px 12px',
                                                    borderRadius: 10, fontWeight: 700, fontSize: 16,
                                                    background: match.status === 'played' ? `${color}12` : '#FAFAFA',
                                                    color: match.status === 'played' ? color : '#999',
                                                }}>
                                                    {formatScore(match)}
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                                                    {match.department_b?.name ?? '—'}
                                                </div>
                                            </div>
                                            {isLeader && (
                                                <div style={{ textAlign: 'center', marginTop: 10 }}>
                                                    <button
                                                        onClick={() => openScoreModal(match)}
                                                        className="btn btn-outline"
                                                        style={{ fontSize: 12, padding: '5px 14px' }}
                                                    >
                                                        {match.status === 'played' ? 'تعديل النتيجة' : 'تسجيل النتيجة'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {thirdPlace && (
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', marginBottom: 8, marginTop: 12 }}>المركز الثالث</div>
                                            <div className="card">
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                                                        {thirdPlace.department_a?.name ?? '—'}
                                                    </div>
                                                    <div style={{
                                                        minWidth: 70, textAlign: 'center', padding: '6px 12px',
                                                        borderRadius: 10, fontWeight: 700, fontSize: 16,
                                                        background: thirdPlace.status === 'played' ? `${color}12` : '#FAFAFA',
                                                        color: thirdPlace.status === 'played' ? color : '#999',
                                                    }}>
                                                        {thirdPlace.status === 'played'
                                                            ? `${thirdPlace.score_a} - ${thirdPlace.score_b}`
                                                            : 'vs'}
                                                    </div>
                                                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                                                        {thirdPlace.department_b?.name ?? '—'}
                                                    </div>
                                                </div>
                                                {isLeader && (
                                                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                                                        <button
                                                            onClick={() => openScoreModal(thirdPlace)}
                                                            className="btn btn-outline"
                                                            style={{ fontSize: 12, padding: '5px 14px' }}
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
                                        fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'center',
                                        marginBottom: 12, background: color, borderRadius: 10, padding: '6px 12px',
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
                                                fontSize: 12, fontWeight: 600, color: '#999', textAlign: 'center',
                                                marginBottom: 8, background: '#F0F0F0', borderRadius: 10, padding: '5px 10px',
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
                    className="modal-overlay"
                    onClick={() => setEditingMatch(null)}
                >
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>تسجيل النتيجة</div>
                            <button
                                onClick={() => setEditingMatch(null)}
                                className="btn btn-outline"
                                style={{ padding: '4px 12px', fontSize: 16 }}
                            >×</button>
                        </div>

                        {editingMatch.round_label && (
                            <div style={{ fontSize: 13, color: '#999', marginBottom: 20, textAlign: 'center', background: '#FAFAFA', borderRadius: 10, padding: '8px 12px' }}>
                                {editingMatch.round_label}{editingMatch.is_third_place ? ' (المركز الثالث)' : ''}
                            </div>
                        )}

                        <form onSubmit={submitScore}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#666' }}>{editingMatch.department_a?.name ?? '—'}</div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={scoreForm.data.score_a}
                                        onChange={(e) => scoreForm.setData('score_a', e.target.value)}
                                        required
                                        style={{
                                            textAlign: 'center', padding: '14px 8px',
                                            fontSize: 28, fontWeight: 700,
                                            background: '#FAFAFA',
                                        }}
                                    />
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#EBEBEB', marginTop: 28 }}>:</div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#666' }}>{editingMatch.department_b?.name ?? '—'}</div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={scoreForm.data.score_b}
                                        onChange={(e) => scoreForm.setData('score_b', e.target.value)}
                                        required
                                        style={{
                                            textAlign: 'center', padding: '14px 8px',
                                            fontSize: 28, fontWeight: 700,
                                            background: '#FAFAFA',
                                        }}
                                    />
                                </div>
                            </div>

                            {isKnockout && isDraw && (
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', color: '#D97706', marginBottom: 12, background: '#FEF3C7', borderRadius: 10, padding: '8px 12px' }}>
                                        تعادل — أدخل نتيجة ركلات الترجيح
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                min="0"
                                                value={scoreForm.data.penalty_a}
                                                onChange={(e) => scoreForm.setData('penalty_a', e.target.value)}
                                                required
                                                placeholder="0"
                                                style={{
                                                    textAlign: 'center', padding: '10px 8px',
                                                    fontSize: 22, fontWeight: 700,
                                                    borderColor: '#D97706',
                                                    background: '#FFFBF5',
                                                }}
                                            />
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#D97706' }}>:</div>
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                min="0"
                                                value={scoreForm.data.penalty_b}
                                                onChange={(e) => scoreForm.setData('penalty_b', e.target.value)}
                                                required
                                                placeholder="0"
                                                style={{
                                                    textAlign: 'center', padding: '10px 8px',
                                                    fontSize: 22, fontWeight: 700,
                                                    borderColor: '#D97706',
                                                    background: '#FFFBF5',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {Object.values(scoreForm.errors).map((err, i) => (
                                <div key={i} className="field-error" style={{ textAlign: 'center', marginBottom: 4 }}>{err}</div>
                            ))}

                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={scoreForm.processing}
                                    style={{
                                        flex: 1,
                                        opacity: scoreForm.processing ? 0.6 : 1,
                                    }}
                                >
                                    حفظ النتيجة
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingMatch(null)}
                                    className="btn btn-outline"
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
    const hasPenalties = match.penalty_a !== null && match.penalty_b !== null;
    const winnerA = isPlayed && match.score_a !== null && match.score_b !== null && (
        match.score_a > match.score_b || (match.score_a === match.score_b && hasPenalties && match.penalty_a! > match.penalty_b!)
    );
    const winnerB = isPlayed && match.score_a !== null && match.score_b !== null && (
        match.score_b > match.score_a || (match.score_a === match.score_b && hasPenalties && match.penalty_b! > match.penalty_a!)
    );

    return (
        <div style={{
            borderRadius: 12, overflow: 'hidden', minWidth: 180,
            background: '#fff', border: isPlayed ? `1px solid ${color}33` : '1px solid #EBEBEB',
        }}>
            {/* Team A */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderBottom: '1px solid #EBEBEB',
                background: winnerA ? `${color}08` : '#fff',
            }}>
                <span style={{
                    fontSize: 13, fontWeight: winnerA ? 700 : 400,
                    color: match.department_a_id ? (winnerA ? '#0A0A0A' : '#666') : '#EBEBEB',
                }}>
                    {match.department_a?.name ?? '—'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hasPenalties && (
                        <span style={{ fontSize: 10, color: '#D97706', fontWeight: 600 }}>({match.penalty_a})</span>
                    )}
                    <span style={{
                        fontSize: 14, fontWeight: 700, minWidth: 22, textAlign: 'center',
                        color: winnerA ? color : '#999',
                    }}>
                        {match.score_a ?? ''}
                    </span>
                </span>
            </div>
            {/* Team B */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px',
                background: winnerB ? `${color}08` : '#fff',
            }}>
                <span style={{
                    fontSize: 13, fontWeight: winnerB ? 700 : 400,
                    color: match.department_b_id ? (winnerB ? '#0A0A0A' : '#666') : '#EBEBEB',
                }}>
                    {match.department_b?.name ?? '—'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hasPenalties && (
                        <span style={{ fontSize: 10, color: '#D97706', fontWeight: 600 }}>({match.penalty_b})</span>
                    )}
                    <span style={{
                        fontSize: 14, fontWeight: 700, minWidth: 22, textAlign: 'center',
                        color: winnerB ? color : '#999',
                    }}>
                        {match.score_b ?? ''}
                    </span>
                </span>
            </div>
            {/* Leader action */}
            {isLeader && hasTeams && (
                <div
                    onClick={() => onEdit(match)}
                    style={{
                        textAlign: 'center', padding: '7px', fontSize: 12, fontWeight: 600,
                        color, cursor: 'pointer', borderTop: '1px solid #EBEBEB',
                        background: '#FAFAFA',
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
