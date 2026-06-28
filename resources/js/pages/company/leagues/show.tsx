import CompanyLayout from '@/layouts/company-layout';
import { Head, Link } from '@inertiajs/react';
import type { League, LeagueMatch, LeagueStanding } from '@/types/models';
import { useState } from 'react';

interface Props {
    league: League;
    standings: LeagueStanding[] | null;
}

export default function LeagueShow({ league, standings }: Props) {
    const matches = league.matches ?? [];
    const isKnockout = league.format === 'knockout';
    const formatLabel = league.format === 'knockout' ? 'خروج المغلوب'
        : league.format === 'double_round_robin' ? 'دوري ذهاب وإياب' : 'دوري دور واحد';

    const [activeView, setActiveView] = useState<'standings' | 'matches' | 'bracket'>(isKnockout ? 'bracket' : 'standings');

    const playedCount = matches.filter(m => m.status === 'played').length;
    const totalCount = matches.filter(m => m.department_a_id && m.department_b_id).length;

    const rounds = isKnockout ? groupByRound(matches) : {};

    const views = isKnockout
        ? [{ key: 'bracket' as const, label: 'الشجرة' }, { key: 'matches' as const, label: 'المباريات' }]
        : [{ key: 'standings' as const, label: 'الترتيب' }, { key: 'matches' as const, label: 'المباريات' }];

    const accent = '#3B5BDB';

    return (
        <CompanyLayout>
            <Head title={league.name} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Link href="/company/leagues" style={{ color: '#7A8BA8', textDecoration: 'none', fontSize: 13 }}>← البطولات</Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700 }}>{league.name}</span>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>{league.name}</div>
                        <div style={{ fontSize: 12, color: '#7A8BA8', marginTop: 4 }}>
                            {formatLabel} · {league.community?.name} · {league.departments?.length ?? 0} أقسام · {playedCount}/{totalCount} مباراة
                        </div>
                    </div>
                    <span className="badge" style={league.status === 'active' ? { background: '#009E8218', color: '#009E82' } : { background: '#6B7A9918', color: '#6B7A99' }}>
                        {league.status === 'active' ? 'جارية' : 'منتهية'}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {views.map((v) => (
                    <button
                        key={v.key}
                        onClick={() => setActiveView(v.key)}
                        style={{
                            padding: '8px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                            border: activeView === v.key ? `2px solid ${accent}` : '2px solid #E2E8F4',
                            background: activeView === v.key ? `${accent}10` : '#fff',
                            color: activeView === v.key ? accent : '#7A8BA8',
                        }}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            {/* Standings */}
            {activeView === 'standings' && standings && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ background: '#F7F8FA', textAlign: 'center' }}>
                                <th style={{ padding: '10px 12px', textAlign: 'right' }}>#</th>
                                <th style={{ padding: '10px 12px', textAlign: 'right' }}>القسم</th>
                                <th style={{ padding: '10px 6px' }}>لعب</th>
                                <th style={{ padding: '10px 6px' }}>فوز</th>
                                <th style={{ padding: '10px 6px' }}>تعادل</th>
                                <th style={{ padding: '10px 6px' }}>خسارة</th>
                                <th style={{ padding: '10px 6px' }}>له</th>
                                <th style={{ padding: '10px 6px' }}>عليه</th>
                                <th style={{ padding: '10px 6px' }}>فارق</th>
                                <th style={{ padding: '10px 6px', fontWeight: 900, color: accent }}>نقاط</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((row, i) => (
                                <tr key={row.department.id} style={{ borderTop: '1px solid #E4E9F2', textAlign: 'center' }}>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: i < 1 ? accent : '#4A5C78' }}>{i + 1}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{row.department.name}</td>
                                    <td style={{ padding: '10px 6px' }}>{row.played}</td>
                                    <td style={{ padding: '10px 6px' }}>{row.won}</td>
                                    <td style={{ padding: '10px 6px' }}>{row.drawn}</td>
                                    <td style={{ padding: '10px 6px' }}>{row.lost}</td>
                                    <td style={{ padding: '10px 6px' }}>{row.gf}</td>
                                    <td style={{ padding: '10px 6px' }}>{row.ga}</td>
                                    <td style={{ padding: '10px 6px', color: row.gd > 0 ? '#009E82' : row.gd < 0 ? '#E03050' : '#7A8BA8' }}>
                                        {row.gd > 0 ? '+' : ''}{row.gd}
                                    </td>
                                    <td style={{ padding: '10px 6px', fontWeight: 900, fontSize: 14, color: accent }}>{row.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Matches */}
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
                                        <div key={match.id} style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 12, padding: 14, marginBottom: 8 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>{match.department_a?.name ?? '—'}</div>
                                                <div style={{
                                                    minWidth: 70, textAlign: 'center', padding: '6px 12px', borderRadius: 8, fontWeight: 900, fontSize: 16,
                                                    background: match.status === 'played' ? `${accent}10` : '#F7F8FA',
                                                    color: match.status === 'played' ? accent : '#7A8BA8',
                                                }}>
                                                    {match.status === 'played' ? `${match.score_a} - ${match.score_b}` : 'vs'}
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>{match.department_b?.name ?? '—'}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {thirdPlace && (
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: '#7A8BA8', marginBottom: 6, marginTop: 10, paddingRight: 4 }}>المركز الثالث</div>
                                            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 12, padding: 14, marginBottom: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>{thirdPlace.department_a?.name ?? '—'}</div>
                                                    <div style={{
                                                        minWidth: 70, textAlign: 'center', padding: '6px 12px', borderRadius: 8, fontWeight: 900, fontSize: 16,
                                                        background: thirdPlace.status === 'played' ? `${accent}10` : '#F7F8FA',
                                                        color: thirdPlace.status === 'played' ? accent : '#7A8BA8',
                                                    }}>
                                                        {thirdPlace.status === 'played' ? `${thirdPlace.score_a} - ${thirdPlace.score_b}` : 'vs'}
                                                    </div>
                                                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>{thirdPlace.department_b?.name ?? '—'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })()}

            {/* Bracket */}
            {activeView === 'bracket' && isKnockout && (
                <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 24, minWidth: 'max-content', alignItems: 'flex-start' }}>
                        {Object.entries(rounds).map(([roundNum, roundMatches]) => {
                            const regular = roundMatches.filter(m => !m.is_third_place);
                            const thirdPlace = roundMatches.find(m => m.is_third_place);
                            const label = regular[0]?.round_label ?? `الدور ${roundNum}`;
                            return (
                                <div key={roundNum} style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 180 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7A8BA8', textAlign: 'center', marginBottom: 4 }}>{label}</div>
                                    {regular.map((match) => (
                                        <BracketMatch key={match.id} match={match} accent={accent} />
                                    ))}
                                    {thirdPlace && (
                                        <>
                                            <div style={{ fontSize: 10, color: '#7A8BA8', textAlign: 'center', fontWeight: 600 }}>المركز الثالث</div>
                                            <BracketMatch match={thirdPlace} accent={accent} />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </CompanyLayout>
    );
}

function BracketMatch({ match, accent }: { match: LeagueMatch; accent: string }) {
    const winnerA = match.status === 'played' && match.score_a !== null && match.score_b !== null && match.score_a > match.score_b;
    const winnerB = match.status === 'played' && match.score_a !== null && match.score_b !== null && match.score_b > match.score_a;

    return (
        <div style={{ border: '1px solid #E2E8F4', borderRadius: 10, overflow: 'hidden', background: '#fff', minWidth: 170 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid #E2E8F4', background: winnerA ? `${accent}08` : undefined, fontWeight: winnerA ? 800 : 500 }}>
                <span style={{ fontSize: 12, color: match.department_a_id ? '#1A1A2E' : '#C8D0E0' }}>{match.department_a?.name ?? '—'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: winnerA ? accent : '#7A8BA8' }}>{match.score_a ?? ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: winnerB ? `${accent}08` : undefined, fontWeight: winnerB ? 800 : 500 }}>
                <span style={{ fontSize: 12, color: match.department_b_id ? '#1A1A2E' : '#C8D0E0' }}>{match.department_b?.name ?? '—'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: winnerB ? accent : '#7A8BA8' }}>{match.score_b ?? ''}</span>
            </div>
        </div>
    );
}

function groupByRound(matches: LeagueMatch[]): Record<number, LeagueMatch[]> {
    const groups: Record<number, LeagueMatch[]> = {};
    matches.forEach((m) => {
        if (!groups[m.round]) groups[m.round] = [];
        groups[m.round].push(m);
    });
    Object.values(groups).forEach(arr => arr.sort((a, b) => a.match_number - b.match_number));
    return groups;
}
