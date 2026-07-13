<?php

namespace App\Services\Partner;

use App\Models\Partner;
use App\Models\Community;
use App\Models\Company;
use App\Models\Discount;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;

class DiscountService
{
    /**
     * List all discounts for a partner.
     */
    public function listForpartner(Partner $partner): Collection
    {
        return Discount::query()
            ->with(['company', 'community.category'])
            ->withCount('events as used_count')
            ->where('partner_id', $partner->id)
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get all active companies on the platform.
     *
     * @return Collection<int, Company>
     */
    public function getCompanies(): Collection
    {
        return Company::query()->active()->orderBy('name')->get(['id', 'name', 'city']);
    }

    /**
     * Get communities for a specific company.
     *
     * @return Collection<int, Community>
     */
    public function getCommunitiesForCompany(int $companyId): Collection
    {
        return Community::query()
            ->with('category')
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'company_id', 'category_id']);
    }

    /**
     * Create a new discount.
     *
     * @param  array{company_id: int, community_id: int, name?: string, type: string, value: float, usage: string, starts_at?: string, expires_at?: string, start_time?: string, end_time?: string}  $data
     */
    public function create(Partner $partner, array $data): Discount
    {
        return Discount::create([
            'partner_id' => $partner->id,
            'company_id' => $data['company_id'],
            'community_id' => $data['community_id'],
            'name' => $data['name'] ?? null,
            'type' => $data['type'],
            'value' => $data['value'],
            'usage' => $data['usage'],
            'starts_at' => $data['starts_at'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'start_time' => $data['start_time'] ?? null,
            'end_time' => $data['end_time'] ?? null,
            'status' => 'active',
        ]);
    }

    /**
     * Update an existing discount.
     *
     * @param  array{name?: string, type?: string, value?: float, usage?: string, starts_at?: string, expires_at?: string, start_time?: string, end_time?: string, status?: string}  $data
     */
    public function update(Partner $partner, Discount $discount, array $data): Discount
    {
        $this->ensureDiscountBelongsTopartner($partner, $discount);

        $discount->update($data);

        return $discount->fresh(['company', 'community.category']);
    }

    /**
     * Delete a discount.
     */
    public function delete(Partner $partner, Discount $discount): void
    {
        $this->ensureDiscountBelongsTopartner($partner, $discount);

        $discount->delete();
    }

    /**
     * Verify that a discount belongs to the given partner.
     */
    private function ensureDiscountBelongsTopartner(Partner $partner, Discount $discount): void
    {
        if ($discount->partner_id !== $partner->id) {
            throw new AuthorizationException('This discount does not belong to your partner.');
        }
    }
}
