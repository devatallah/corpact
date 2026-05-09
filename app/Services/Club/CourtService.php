<?php

namespace App\Services\Club;

use App\Models\Club;
use App\Models\Court;
use App\Models\CourtPricing;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CourtService
{
    /**
     * List all courts for a club.
     */
    public function listForClub(Club $club): Collection
    {
        return Court::query()
            ->with(['sport', 'pricings'])
            ->where('club_id', $club->id)
            ->orderBy('name')
            ->get();
    }

    /**
     * Create a new court for a club.
     *
     * @param  array{name: string, sport_id: int, status?: string}  $data
     */
    public function create(Club $club, array $data): Court
    {
        $court = Court::create([
            'club_id' => $club->id,
            'sport_id' => $data['sport_id'],
            'name' => $data['name'],
            'status' => $data['status'] ?? 'active',
        ]);

        if (! empty($data['pricings'])) {
            $this->syncPricings($court, $data['pricings']);
        }

        return $court;
    }

    /**
     * Update an existing court.
     *
     * @param  array{name?: string, sport_id?: int, status?: string}  $data
     */
    public function update(Club $club, Court $court, array $data): Court
    {
        $this->ensureCourtBelongsToClub($club, $court);

        $pricings = $data['pricings'] ?? null;
        unset($data['pricings']);

        $court->update($data);

        if ($pricings !== null) {
            $this->syncPricings($court, $pricings);
        }

        return $court->fresh(['sport', 'pricings']);
    }

    /**
     * Delete a court (only if it has no active bookings).
     */
    public function delete(Club $club, Court $court): void
    {
        $this->ensureCourtBelongsToClub($club, $court);

        $hasBookedSlots = $court->slots()
            ->where('status', 'booked')
            ->exists();

        if ($hasBookedSlots) {
            throw ValidationException::withMessages([
                'court' => ['Cannot delete a court with active bookings.'],
            ]);
        }

        DB::transaction(function () use ($court) {
            $court->pricings()->delete();
            $court->delete();
        });
    }

    /**
     * Add a pricing tier to a court.
     *
     * @param  array{duration_minutes: int, price: float}  $data
     */
    public function addPricing(Club $club, Court $court, array $data): CourtPricing
    {
        $this->ensureCourtBelongsToClub($club, $court);

        $exists = $court->pricings()
            ->where('duration_minutes', $data['duration_minutes'])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'duration_minutes' => ['A pricing for this duration already exists.'],
            ]);
        }

        return CourtPricing::create([
            'court_id' => $court->id,
            'duration_minutes' => $data['duration_minutes'],
            'price' => $data['price'],
        ]);
    }

    /**
     * Update an existing pricing tier.
     *
     * @param  array{duration_minutes?: int, price?: float}  $data
     */
    public function updatePricing(Club $club, Court $court, CourtPricing $pricing, array $data): CourtPricing
    {
        $this->ensureCourtBelongsToClub($club, $court);

        if ($pricing->court_id !== $court->id) {
            throw new \InvalidArgumentException('Pricing does not belong to this court.');
        }

        $pricing->update($data);

        return $pricing->fresh();
    }

    /**
     * Delete a pricing tier.
     */
    public function deletePricing(Club $club, Court $court, CourtPricing $pricing): void
    {
        $this->ensureCourtBelongsToClub($club, $court);

        if ($pricing->court_id !== $court->id) {
            throw new \InvalidArgumentException('Pricing does not belong to this court.');
        }

        $pricing->delete();
    }

    /**
     * Sync pricing tiers for a court. Keys are duration_minutes, values are prices.
     *
     * @param  array<string, numeric-string>  $pricings
     */
    private function syncPricings(Court $court, array $pricings): void
    {
        $court->pricings()->delete();

        foreach ($pricings as $duration => $price) {
            if ($price === '' || $price === null) {
                continue;
            }

            CourtPricing::create([
                'court_id' => $court->id,
                'duration_minutes' => (int) $duration,
                'price' => (float) $price,
            ]);
        }
    }

    /**
     * Verify that a court belongs to the given club.
     */
    private function ensureCourtBelongsToClub(Club $club, Court $court): void
    {
        if ($court->club_id !== $club->id) {
            throw new AuthorizationException('This court does not belong to your club.');
        }
    }
}
