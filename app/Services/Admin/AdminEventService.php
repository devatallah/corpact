<?php

namespace App\Services\Admin;

use App\Models\Event;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminEventService
{
    /**
     * List all events with optional filters.
     *
     * @param  array{status?: string, company_id?: int, club_id?: int, sport_id?: int, date_from?: string, date_to?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        return Event::query()
            ->with(['company', 'community', 'club', 'sport', 'creator', 'courtPricing', 'courts'])
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['club_id']), fn ($query) => $query->where('club_id', $filters['club_id']))
            ->when(isset($filters['sport_id']), fn ($query) => $query->where('sport_id', $filters['sport_id']))
            ->when(isset($filters['company_id']), fn ($query) => $query->whereHas('community', fn ($q) => $q->where('company_id', $filters['company_id'])
            ))
            ->when(isset($filters['date_from']), fn ($query) => $query->whereDate('event_date', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($query) => $query->whereDate('event_date', '<=', $filters['date_to']))
            ->when(isset($filters['search']), fn ($query) => $query->where(function ($q) use ($filters) {
                $q->whereHas('club', fn ($c) => $c->where('name', 'like', "%{$filters['search']}%"))
                  ->orWhereHas('sport', fn ($s) => $s->where('name', 'like', "%{$filters['search']}%"))
                  ->orWhereHas('community.company', fn ($co) => $co->where('name', 'like', "%{$filters['search']}%"));
            }))
            ->latest('event_date')
            ->paginate($filters['per_page'] ?? 15);
    }
}
