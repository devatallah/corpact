<?php

namespace App\Services\Admin;

use App\Models\Event;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminEventService
{
    /**
     * List all events with optional filters.
     *
     * @param  array{status?: string, company_id?: int, business_id?: int, category_id?: int, date_from?: string, date_to?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        return Event::query()
            ->with(['company', 'community', 'business', 'category', 'creator', 'venuePricing', 'venues'])
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['business_id']), fn ($query) => $query->where('business_id', $filters['business_id']))
            ->when(isset($filters['category_id']), fn ($query) => $query->where('category_id', $filters['category_id']))
            ->when(isset($filters['company_id']), fn ($query) => $query->whereHas('community', fn ($q) => $q->where('company_id', $filters['company_id'])
            ))
            ->when(isset($filters['date_from']), fn ($query) => $query->whereDate('event_date', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($query) => $query->whereDate('event_date', '<=', $filters['date_to']))
            ->when(isset($filters['search']), fn ($query) => $query->where(function ($q) use ($filters) {
                $q->whereHas('business', fn ($c) => $c->where('name', 'like', "%{$filters['search']}%"))
                  ->orWhereHas('category', fn ($s) => $s->where('name', 'like', "%{$filters['search']}%"))
                  ->orWhereHas('community.company', fn ($co) => $co->where('name', 'like', "%{$filters['search']}%"));
            }))
            ->latest('event_date')
            ->paginate($filters['per_page'] ?? 15);
    }
}
