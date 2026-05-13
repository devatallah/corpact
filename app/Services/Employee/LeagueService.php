<?php

namespace App\Services\Employee;

use App\Models\Department;
use App\Models\League;
use App\Models\LeagueMatch;
use Illuminate\Support\Collection;

class LeagueService
{
    /**
     * Create a league and generate its matches.
     *
     * @param  array{name: string, format: string, community_id: int, created_by: int}  $data
     * @param  array<int, int>  $departmentIds  Ordered by seed for knockout
     */
    public function create(array $data, array $departmentIds): League
    {
        $league = League::create($data);

        // Attach departments with seed order
        $pivot = [];
        foreach ($departmentIds as $i => $deptId) {
            $pivot[$deptId] = ['seed_order' => $i + 1];
        }
        $league->departments()->attach($pivot);

        $this->generateMatches($league, $departmentIds);

        return $league;
    }

    /**
     * Generate matches based on format.
     */
    private function generateMatches(League $league, array $departmentIds): void
    {
        match ($league->format) {
            'single_round_robin' => $this->generateRoundRobin($league, $departmentIds, false),
            'double_round_robin' => $this->generateRoundRobin($league, $departmentIds, true),
            'knockout' => $this->generateKnockout($league, $departmentIds),
        };
    }

    /**
     * Generate round-robin matches.
     */
    private function generateRoundRobin(League $league, array $teams, bool $double): void
    {
        $matchNumber = 1;
        $round = 1;

        // Single round-robin: every pair plays once, randomize home/away
        $pairs = [];
        for ($i = 0; $i < count($teams); $i++) {
            for ($j = $i + 1; $j < count($teams); $j++) {
                $pairs[] = random_int(0, 1)
                    ? [$teams[$i], $teams[$j]]
                    : [$teams[$j], $teams[$i]];
            }
        }
        shuffle($pairs);

        foreach ($pairs as [$home, $away]) {
            LeagueMatch::create([
                'league_id' => $league->id,
                'department_a_id' => $home,
                'department_b_id' => $away,
                'round' => $round,
                'match_number' => $matchNumber++,
            ]);
        }

        // Double round-robin: reverse fixtures (swap home/away from first leg)
        if ($double) {
            $round++;
            $reversePairs = array_map(fn ($p) => [$p[1], $p[0]], $pairs);
            shuffle($reversePairs);

            foreach ($reversePairs as [$home, $away]) {
                LeagueMatch::create([
                    'league_id' => $league->id,
                    'department_a_id' => $home,
                    'department_b_id' => $away,
                    'round' => $round,
                    'match_number' => $matchNumber++,
                ]);
            }
        }
    }

    /**
     * Generate knockout bracket matches (only round 1 with assigned teams).
     * Later rounds are created with null departments, filled when winners advance.
     */
    private function generateKnockout(League $league, array $teams): void
    {
        $count = count($teams);
        $totalRounds = (int) log($count, 2);
        $matchNumber = 1;

        $roundLabels = $this->getKnockoutRoundLabels($count);

        // Round 1: assign teams based on seed order
        $round1Matches = [];
        for ($i = 0; $i < $count; $i += 2) {
            $match = LeagueMatch::create([
                'league_id' => $league->id,
                'department_a_id' => $teams[$i],
                'department_b_id' => $teams[$i + 1],
                'round' => 1,
                'match_number' => $matchNumber++,
                'round_label' => $roundLabels[1],
            ]);
            $round1Matches[] = $match;
        }

        // Later rounds: create placeholder matches (no teams yet)
        for ($round = 2; $round <= $totalRounds; $round++) {
            $matchesInRound = $count / pow(2, $round);
            for ($i = 0; $i < $matchesInRound; $i++) {
                LeagueMatch::create([
                    'league_id' => $league->id,
                    'department_a_id' => null,
                    'department_b_id' => null,
                    'round' => $round,
                    'match_number' => $matchNumber++,
                    'round_label' => $roundLabels[$round],
                ]);
            }
        }

        // Third-place match (only if 4+ teams)
        if ($count >= 4) {
            LeagueMatch::create([
                'league_id' => $league->id,
                'department_a_id' => null,
                'department_b_id' => null,
                'round' => $totalRounds,
                'match_number' => $matchNumber,
                'round_label' => 'المركز الثالث',
                'is_third_place' => true,
            ]);
        }
    }

    /**
     * Get round labels for knockout format.
     */
    private function getKnockoutRoundLabels(int $teamCount): array
    {
        $totalRounds = (int) log($teamCount, 2);
        $labels = [];

        for ($round = 1; $round <= $totalRounds; $round++) {
            $matchesInRound = $teamCount / pow(2, $round);
            $labels[$round] = match (true) {
                $round === $totalRounds => 'النهائي',
                $round === $totalRounds - 1 => 'نصف النهائي',
                $round === $totalRounds - 2 => 'ربع النهائي',
                $matchesInRound === 8 => 'دور الـ16',
                default => 'الدور ' . $round,
            };
        }

        return $labels;
    }

    /**
     * Record a match result and handle knockout advancement.
     */
    public function recordResult(LeagueMatch $match, int $scoreA, int $scoreB): LeagueMatch
    {
        $league = $match->league;
        $previouslyPlayed = $match->status === 'played';
        $previousWinnerA = $previouslyPlayed ? ($match->score_a > $match->score_b ? $match->department_a_id : $match->department_b_id) : null;

        $match->update([
            'score_a' => $scoreA,
            'score_b' => $scoreB,
            'status' => 'played',
        ]);

        if ($league->isKnockout()) {
            $newWinner = $scoreA > $scoreB ? $match->department_a_id : $match->department_b_id;
            $newLoser = $scoreA > $scoreB ? $match->department_b_id : $match->department_a_id;

            // Only update bracket if winner changed or first time
            if (! $previouslyPlayed || $previousWinnerA !== $newWinner) {
                $this->advanceWinner($match, $newWinner, $newLoser);
            }
        }

        // Check if league is complete
        $this->checkLeagueCompletion($league);

        return $match->fresh();
    }

    /**
     * Advance winner to the next round in knockout.
     */
    private function advanceWinner(LeagueMatch $match, int $winnerId, int $loserId): void
    {
        $league = $match->league;
        $totalTeams = $league->departments()->count();
        $totalRounds = (int) log($totalTeams, 2);

        if ($match->is_third_place) {
            return;
        }

        $currentRound = $match->round;

        // If this is a semi-final, also place loser in third-place match
        if ($currentRound === $totalRounds - 1) {
            $thirdPlaceMatch = LeagueMatch::where('league_id', $league->id)
                ->where('is_third_place', true)
                ->first();

            if ($thirdPlaceMatch) {
                // Determine which slot (A or B) based on match position in the round
                $semiMatches = LeagueMatch::where('league_id', $league->id)
                    ->where('round', $currentRound)
                    ->where('is_third_place', false)
                    ->orderBy('match_number')
                    ->get();

                $index = $semiMatches->search(fn ($m) => $m->id === $match->id);

                if ($index === 0) {
                    $thirdPlaceMatch->update(['department_a_id' => $loserId]);
                } else {
                    $thirdPlaceMatch->update(['department_b_id' => $loserId]);
                }

                // Reset third-place result if it was already played
                if ($thirdPlaceMatch->status === 'played') {
                    $thirdPlaceMatch->update(['score_a' => null, 'score_b' => null, 'status' => 'pending']);
                }
            }
        }

        // If final round, no next match to advance to
        if ($currentRound >= $totalRounds) {
            return;
        }

        // Find the next round match this winner should go to
        $nextRound = $currentRound + 1;
        $nextRoundMatches = LeagueMatch::where('league_id', $league->id)
            ->where('round', $nextRound)
            ->where('is_third_place', false)
            ->orderBy('match_number')
            ->get();

        // Which match in current round is this?
        $currentRoundMatches = LeagueMatch::where('league_id', $league->id)
            ->where('round', $currentRound)
            ->where('is_third_place', false)
            ->orderBy('match_number')
            ->get();

        $matchIndex = $currentRoundMatches->search(fn ($m) => $m->id === $match->id);
        $nextMatchIndex = intdiv($matchIndex, 2);
        $slot = $matchIndex % 2 === 0 ? 'department_a_id' : 'department_b_id';

        if (isset($nextRoundMatches[$nextMatchIndex])) {
            $nextMatch = $nextRoundMatches[$nextMatchIndex];
            $nextMatch->update([$slot => $winnerId]);

            // If result was edited and winner changed, reset future match result
            if ($nextMatch->status === 'played') {
                $nextMatch->update(['score_a' => null, 'score_b' => null, 'status' => 'pending']);
                // Cascade reset for further rounds
                if ($nextMatch->department_a_id && $nextMatch->department_b_id) {
                    // Just reset — leader will re-enter results
                }
            }
        }
    }

    /**
     * Check if all matches are played and mark league as completed.
     */
    private function checkLeagueCompletion(League $league): void
    {
        $totalMatches = $league->matches()->count();
        $playedMatches = $league->matches()->where('status', 'played')->count();

        // For knockout, exclude matches with null departments (not yet determined)
        if ($league->isKnockout()) {
            $totalMatches = $league->matches()
                ->whereNotNull('department_a_id')
                ->whereNotNull('department_b_id')
                ->count();
            $playedMatches = $league->matches()
                ->where('status', 'played')
                ->count();

            // Only complete if ALL matches including third-place are played
            // and all departments are assigned (meaning bracket is fully resolved)
            $unassigned = $league->matches()
                ->where(fn ($q) => $q->whereNull('department_a_id')->orWhereNull('department_b_id'))
                ->count();

            if ($unassigned > 0) {
                return;
            }
        }

        if ($totalMatches > 0 && $playedMatches === $totalMatches) {
            $league->update(['status' => 'completed']);
        } elseif ($league->status === 'completed') {
            // If a result was edited, revert to active
            $league->update(['status' => 'active']);
        }
    }

    /**
     * Calculate round-robin standings.
     *
     * @return Collection<int, array>
     */
    public function standings(League $league): Collection
    {
        $departments = $league->departments()->get();
        $matches = $league->matches()->where('status', 'played')->get();

        $standings = [];
        foreach ($departments as $dept) {
            $standings[$dept->id] = [
                'department' => $dept,
                'played' => 0,
                'won' => 0,
                'drawn' => 0,
                'lost' => 0,
                'gf' => 0,
                'ga' => 0,
                'gd' => 0,
                'points' => 0,
            ];
        }

        foreach ($matches as $match) {
            $a = $match->department_a_id;
            $b = $match->department_b_id;

            if (! isset($standings[$a]) || ! isset($standings[$b])) {
                continue;
            }

            $standings[$a]['played']++;
            $standings[$b]['played']++;
            $standings[$a]['gf'] += $match->score_a;
            $standings[$a]['ga'] += $match->score_b;
            $standings[$b]['gf'] += $match->score_b;
            $standings[$b]['ga'] += $match->score_a;

            if ($match->score_a > $match->score_b) {
                $standings[$a]['won']++;
                $standings[$a]['points'] += 3;
                $standings[$b]['lost']++;
            } elseif ($match->score_a < $match->score_b) {
                $standings[$b]['won']++;
                $standings[$b]['points'] += 3;
                $standings[$a]['lost']++;
            } else {
                $standings[$a]['drawn']++;
                $standings[$b]['drawn']++;
                $standings[$a]['points'] += 1;
                $standings[$b]['points'] += 1;
            }
        }

        // Calculate goal difference and sort
        foreach ($standings as &$row) {
            $row['gd'] = $row['gf'] - $row['ga'];
        }
        unset($row);

        usort($standings, fn ($a, $b) => [$b['points'], $b['gd'], $b['gf']] <=> [$a['points'], $a['gd'], $a['gf']]);

        return collect($standings)->values();
    }
}
