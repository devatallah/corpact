<?php

namespace App\Services\Partner;

use App\Models\Partner;
use App\Models\Venue;
use App\Models\VenuePricing;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VenueService
{
    /**
     * List all venues for a partner.
     */
    public function listForpartner(Partner $partner): Collection
    {
        return Venue::query()
            ->with(['category', 'pricings'])
            ->where('partner_id', $partner->id)
            ->orderBy('name')
            ->get();
    }

    /**
     * Create a new venue for a partner.
     *
     * @param  array{name: string, category_id: int, status?: string}  $data
     */
    public function create(Partner $partner, array $data): Venue
    {
        $venue = Venue::create([
            'partner_id' => $partner->id,
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'status' => $data['status'] ?? 'active',
        ]);

        if (! empty($data['pricings'])) {
            $this->syncPricings($venue, $data['pricings']);
        }

        return $venue;
    }

    /**
     * Update an existing venue.
     *
     * @param  array{name?: string, category_id?: int, status?: string}  $data
     */
    public function update(Partner $partner, Venue $venue, array $data): Venue
    {
        $this->ensureVenueBelongsToPartner($partner, $venue);

        $pricings = $data['pricings'] ?? null;
        unset($data['pricings']);

        $venue->update($data);

        if ($pricings !== null) {
            $this->syncPricings($venue, $pricings);
        }

        return $venue->fresh(['category', 'pricings']);
    }

    /**
     * Delete a venue (only if it has no active bookings).
     */
    public function delete(Partner $partner, Venue $venue): void
    {
        $this->ensureVenueBelongsToPartner($partner, $venue);

        $hasBookedSlots = $venue->slots()
            ->where('status', 'booked')
            ->exists();

        if ($hasBookedSlots) {
            throw ValidationException::withMessages([
                'venue' => ['Cannot delete a venue with active bookings.'],
            ]);
        }

        DB::transaction(function () use ($venue) {
            $venue->pricings()->delete();
            $venue->delete();
        });
    }

    /**
     * Add a pricing tier to a venue.
     *
     * @param  array<string, mixed>  $data
     */
    public function addPricing(Partner $partner, Venue $venue, array $data): VenuePricing
    {
        $this->ensureVenueBelongsToPartner($partner, $venue);

        $days = $data['days'] ?? null;
        if (is_array($days)) {
            $days = array_values(array_filter($days, fn ($v) => $v !== null && $v !== ''));
            if (empty($days)) {
                $days = null;
            }
        }

        return VenuePricing::create([
            'venue_id' => $venue->id,
            'duration_minutes' => (int) ($data['duration_minutes'] ?? 60),
            'price' => (float) $data['price'],
            'is_peak' => filter_var($data['is_peak'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'label' => ($data['label'] ?? '') !== '' ? $data['label'] : null,
            'start_time' => ($data['start_time'] ?? '') !== '' ? $data['start_time'] : null,
            'end_time' => ($data['end_time'] ?? '') !== '' ? $data['end_time'] : null,
            'days' => $days,
        ]);
    }

    /**
     * Update an existing pricing tier.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePricing(Partner $partner, Venue $venue, VenuePricing $pricing, array $data): VenuePricing
    {
        $this->ensureVenueBelongsToPartner($partner, $venue);

        if ($pricing->venue_id !== $venue->id) {
            throw new \InvalidArgumentException('Pricing does not belong to this venue.');
        }

        $days = $data['days'] ?? null;
        if (is_array($days)) {
            $days = array_values(array_filter($days, fn ($v) => $v !== null && $v !== ''));
            if (empty($days)) {
                $days = null;
            }
        }

        $pricing->update([
            'duration_minutes' => (int) ($data['duration_minutes'] ?? $pricing->duration_minutes),
            'price' => (float) ($data['price'] ?? $pricing->price),
            'is_peak' => filter_var($data['is_peak'] ?? $pricing->is_peak, FILTER_VALIDATE_BOOLEAN),
            'label' => ($data['label'] ?? '') !== '' ? $data['label'] : null,
            'start_time' => ($data['start_time'] ?? '') !== '' ? $data['start_time'] : null,
            'end_time' => ($data['end_time'] ?? '') !== '' ? $data['end_time'] : null,
            'days' => $days,
        ]);

        return $pricing->fresh();
    }

    /**
     * Delete a pricing tier.
     */
    public function deletePricing(Partner $partner, Venue $venue, VenuePricing $pricing): void
    {
        $this->ensureVenueBelongsToPartner($partner, $venue);

        if ($pricing->venue_id !== $venue->id) {
            throw new \InvalidArgumentException('Pricing does not belong to this venue.');
        }

        $pricing->delete();
    }

    /**
     * Sync pricing tiers for a venue.
     *
     * @param  array<int|string, mixed>  $pricings
     */
    private function syncPricings(Venue $venue, array $pricings): void
    {
        $venue->pricings()->delete();

        foreach ($pricings as $data) {
            if (! is_array($data)) {
                continue;
            }

            if (($data['price'] ?? '') === '' || $data['price'] === null) {
                continue;
            }

            $days = $data['days'] ?? null;
            if (is_array($days)) {
                $days = array_values(array_filter($days, fn ($v) => $v !== null && $v !== ''));
                if (empty($days)) {
                    $days = null;
                }
            }

            VenuePricing::create([
                'venue_id' => $venue->id,
                'duration_minutes' => (int) ($data['duration_minutes'] ?? 60),
                'price' => (float) $data['price'],
                'is_peak' => filter_var($data['is_peak'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'label' => ($data['label'] ?? '') !== '' ? $data['label'] : null,
                'start_time' => ($data['start_time'] ?? '') !== '' ? $data['start_time'] : null,
                'end_time' => ($data['end_time'] ?? '') !== '' ? $data['end_time'] : null,
                'days' => $days,
            ]);
        }
    }

    /**
     * Verify venue and pricing ownership.
     */
    public function ensureOwnership(Partner $partner, Venue $venue, VenuePricing $pricing): void
    {
        $this->ensureVenueBelongsToPartner($partner, $venue);

        if ($pricing->venue_id !== $venue->id) {
            throw new AuthorizationException('This pricing does not belong to this venue.');
        }
    }

    /**
     * Verify that a venue belongs to the given partner.
     */
    private function ensureVenueBelongsToPartner(Partner $partner, Venue $venue): void
    {
        if ($venue->partner_id !== $partner->id) {
            throw new AuthorizationException('This venue does not belong to your partner.');
        }
    }
}
