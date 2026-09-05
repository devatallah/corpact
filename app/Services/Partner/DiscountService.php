<?php

namespace App\Services\Partner;

use App\Models\Community;
use App\Models\Company;
use App\Models\Discount;
use App\Models\Partner;
use App\Support\Lists\ListSort;
use App\Support\Money;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * A17 — تخفيضات المزوّد.
 *
 * التخفيض يخصّ مجتمعاً واحداً لدى شركة واحدة: هذا ليس رمزاً ترويجياً عاماً
 * بل اتفاق ثنائي بين المزوّد وذلك المجتمع، ولذلك لا واجهة تُنشئ تخفيضاً
 * «للجميع».
 */
class DiscountService
{
    /**
     * الأعمدة المسموح الترتيب بها (H §18) — مفاتيح، لا أسماء أعمدة.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'name' => 'name',
            'value' => 'value',
            'status' => 'status',
            'expires_at' => 'expires_at',
            'created_at' => 'created_at',
        ], 'created_at', ListSort::DESC, 'id');
    }

    /**
     * قائمة تخفيضات المزوّد — بحث وتصفية وترتيب و20 للصفحة (H §18).
     * النطاق (`partner_id`) خارج أي تأثير للبحث أو الترتيب.
     *
     * @param  array{search?: string, status?: string, company_id?: int|string, sort?: string, dir?: string, per_page?: int}  $filters
     * @return LengthAwarePaginator<int, Discount>
     */
    public function listForPartner(Partner $partner, array $filters = []): LengthAwarePaginator
    {
        $query = Discount::query()
            ->with(['company:id,name', 'community:id,name'])
            ->withCount('events as used_count')
            // صفوف A10 المؤرشفة تاريخ لا يُدار من هنا.
            ->whereNull('archived_at')
            ->where('partner_id', $partner->id)
            ->when(filled($filters['search'] ?? null), fn ($q) => $q->where('name', 'like', '%'.$filters['search'].'%'))
            ->when(filled($filters['status'] ?? null), fn ($q) => $q->where('status', $filters['status']))
            ->when(filled($filters['company_id'] ?? null), fn ($q) => $q->where('company_id', $filters['company_id']));

        return self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();
    }

    /**
     * الشركات النشطة — الطرف الآخر في الاتفاق.
     *
     * @return Collection<int, Company>
     */
    public function companies(): Collection
    {
        return Company::query()->active()->orderBy('name')->get(['id', 'name', 'city']);
    }

    /**
     * مجتمعات شركة بعينها.
     *
     * @return Collection<int, Community>
     */
    public function communitiesFor(int $companyId): Collection
    {
        return Community::query()
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'company_id', 'category_id']);
    }

    /**
     * التخفيضات المنطبقة على حجز بعينه — ما يعرضه منشئ الفعالية.
     *
     * @return Collection<int, Discount>
     */
    public function applicableFor(Community $community, Partner $partner, string $date, string $time): Collection
    {
        return Discount::query()
            ->applicableOn($date, $time)
            ->where('partner_id', $partner->id)
            ->where('community_id', $community->id)
            ->orderBy('name')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Partner $partner, array $data): Discount
    {
        return Discount::create([
            ...$this->attributes($data),
            'partner_id' => $partner->id,
            'company_id' => $data['company_id'],
            'community_id' => $data['community_id'],
            'status' => 'active',
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Partner $partner, Discount $discount, array $data): Discount
    {
        $this->ensureOwned($partner, $discount);

        $discount->update($this->attributes($data));

        return $discount->fresh(['company', 'community']);
    }

    public function delete(Partner $partner, Discount $discount): void
    {
        $this->ensureOwned($partner, $discount);

        $discount->delete();
    }

    /**
     * القيمة تُخزَّن مرتين بقصد: `value` للنسبة والعرض، و`value_halalas`
     * للمبلغ الثابت — الحساب لا يلمس decimal أبداً (A9).
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data): array
    {
        $type = $data['type'] ?? Discount::TYPE_FIXED;
        $value = (float) ($data['value'] ?? 0);

        return [
            'name' => ($data['name'] ?? '') !== '' ? $data['name'] : null,
            'type' => $type,
            'value' => $value,
            'value_halalas' => $type === Discount::TYPE_FIXED ? Money::toHalalas($value) : 0,
            'usage' => $data['usage'] ?? Discount::USAGE_DATE_RANGE,
            'starts_at' => ($data['starts_at'] ?? '') !== '' ? $data['starts_at'] : null,
            'expires_at' => ($data['expires_at'] ?? '') !== '' ? $data['expires_at'] : null,
            'start_time' => ($data['start_time'] ?? '') !== '' ? $data['start_time'] : null,
            'end_time' => ($data['end_time'] ?? '') !== '' ? $data['end_time'] : null,
            ...(isset($data['status']) ? ['status' => $data['status']] : []),
        ];
    }

    private function ensureOwned(Partner $partner, Discount $discount): void
    {
        if ($discount->partner_id !== $partner->id || $discount->archived_at !== null) {
            throw new AuthorizationException('This discount does not belong to your partner.');
        }
    }
}
