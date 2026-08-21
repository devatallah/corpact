<?php

namespace App\Services\Admin;

use App\Models\Event;
use App\Support\Lists\ListSort;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminEventService
{
    /**
     * الأعمدة المسموح الترتيب بها — كلها معروضة في جدول الشاشة أصلاً (H §18).
     * الشركة والشريك والفئة أعمدة علاقات لا أعمدة على `events`، فلا مفاتيح لها
     * (لا تُضاف وصلات من أجل الترتيب). `total_amount` اسم عرض مشتق؛ العمود
     * الحقيقي هو `total_amount_halalas` وترتيبه هو نفسه ترتيب المبلغ المعروض.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'event_date' => 'event_date',
            'participants_count' => 'participants_count',
            'total_amount' => 'total_amount_halalas',
            'status' => 'status',
        ], 'event_date', ListSort::DESC, 'id');
    }

    /**
     * List all events with optional filters.
     *
     * @param  array{status?: string, company_id?: int, partner_id?: int, category_id?: int, date_from?: string, date_to?: string, sort?: string, dir?: string, per_page?: int}  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Event::query()
            ->with(['company', 'community', 'partner', 'category', 'creator', 'venuePricing', 'venues'])
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['partner_id']), fn ($query) => $query->where('partner_id', $filters['partner_id']))
            ->when(isset($filters['category_id']), fn ($query) => $query->where('category_id', $filters['category_id']))
            ->when(isset($filters['company_id']), fn ($query) => $query->whereHas('community', fn ($q) => $q->where('company_id', $filters['company_id'])
            ))
            ->when(isset($filters['date_from']), fn ($query) => $query->whereDate('event_date', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($query) => $query->whereDate('event_date', '<=', $filters['date_to']))
            ->when(isset($filters['search']), fn ($query) => $query->where(function ($q) use ($filters) {
                $q->whereHas('partner', fn ($c) => $c->where('name', 'like', "%{$filters['search']}%"))
                    ->orWhereHas('category', fn ($s) => $s->where('name', 'like', "%{$filters['search']}%"))
                    ->orWhereHas('community.company', fn ($co) => $co->where('name', 'like', "%{$filters['search']}%"));
            }));

        return self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();
    }
}
