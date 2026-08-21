<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\ActivityUnit;
use App\Models\Category;
use App\Models\Partner;
use App\Models\ProviderBranch;
use App\Models\UnitPriceChange;
use App\Support\Lists\ListSort;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * الفروع ووحدات النشاط — ما ينجزه المزوّد ذاتياً (H §17). الأنشطة تُختار
 * من الكتالوج المركزي فقط.
 */
class BranchController extends Controller
{
    /**
     * الأعمدة المسموح الترتيب بها — الاسم والمدينة والحالة وتاريخ الإضافة،
     * وكلها معروضة على بطاقة الفرع أصلاً (H §18).
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'name' => 'name',
            'city' => 'city',
            'status' => 'status',
            'created_at' => 'created_at',
        ], 'created_at', ListSort::ASC, 'id');
    }

    public function index(Request $request): Response
    {
        $partner = $this->provider();

        // H §18 — بحث + ترتيب + ترقيم. قيمة `sort` مفتاح من قائمة بيضاء في
        // `ListSort` لا اسم عمود؛ التحقق هنا يمنع الحشو فقط.
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $query = ProviderBranch::query()
            ->where('partner_id', $partner->id)
            ->with(['units.category', 'units.priceChanges' => fn ($q) => $q->where('status', 'pending')])
            ->when(filled($filters['search'] ?? null), fn ($q) => $q->where(fn ($inner) => $inner
                ->where('name', 'like', '%'.$filters['search'].'%')
                ->orWhere('city', 'like', '%'.$filters['search'].'%')));

        $branches = self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('partner/branches/index', [
            'partner' => [
                'id' => $partner->id,
                'name' => $partner->name,
                'trade_name' => $partner->trade_name,
                'has_price_contract' => (bool) $partner->has_price_contract,
            ],
            'branches' => $branches,
            'filters' => $filters,
            'sort' => self::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateBranch($request);

        ProviderBranch::create(['partner_id' => $this->provider()->id] + $data);

        return back()->with('success', 'أُضيف الفرع بنجاح.');
    }

    public function update(Request $request, ProviderBranch $branch): RedirectResponse
    {
        $this->ensureOwned($branch);

        $branch->update($this->validateBranch($request));

        return back()->with('success', 'حُدّث الفرع بنجاح.');
    }

    public function destroy(ProviderBranch $branch): RedirectResponse
    {
        $this->ensureOwned($branch);

        $branch->delete();

        return back()->with('success', 'حُذف الفرع.');
    }

    public function storeUnit(Request $request, ProviderBranch $branch): RedirectResponse
    {
        $this->ensureOwned($branch);

        $data = $this->validateUnit($request);

        ActivityUnit::create(['provider_branch_id' => $branch->id] + $data);

        return back()->with('success', 'أُضيفت وحدة النشاط.');
    }

    public function updateUnit(Request $request, ActivityUnit $unit): RedirectResponse
    {
        $this->ensureOwned($unit->branch);

        $partner = $this->provider();
        $data = $this->validateUnit($request);

        $newPrice = (float) $data['price'];
        $oldPrice = (float) $unit->price;

        // تحديث السعر تحت عقد سعر: يسري بعد اعتماد أدمن تيمات (H §17).
        if ($newPrice !== $oldPrice && $partner->has_price_contract) {
            UnitPriceChange::create([
                'activity_unit_id' => $unit->id,
                'old_price' => $oldPrice,
                'new_price' => $newPrice,
                'status' => 'pending',
                'requested_by' => auth('partner')->id(),
            ]);

            $data['price'] = $oldPrice; // السعر القائم يبقى حتى الاعتماد

            $unit->update($data);

            return back()->with('success', 'حُدّثت الوحدة — تعديل السعر بانتظار اعتماد أدمن تيمات (عقد سعر).');
        }

        $unit->update($data);

        return back()->with('success', 'حُدّثت وحدة النشاط.');
    }

    public function destroyUnit(ActivityUnit $unit): RedirectResponse
    {
        $this->ensureOwned($unit->branch);

        $unit->delete();

        return back()->with('success', 'حُذفت وحدة النشاط.');
    }

    private function provider(): Partner
    {
        return auth('partner')->user()->resolvedPartner();
    }

    private function ensureOwned(?ProviderBranch $branch): void
    {
        if ($branch === null || $branch->partner_id !== $this->provider()->id) {
            // كيان أجنبي → 404 لا 403 (H §4)
            throw (new ModelNotFoundException)->setModel(ProviderBranch::class);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function validateBranch(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:60'],
            'district' => ['nullable', 'string', 'max:60'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'working_hours' => ['nullable', 'array'],
            'working_hours.*' => ['array'],
            'working_hours.*.*.from' => ['required_with:working_hours.*.*', 'date_format:H:i'],
            'working_hours.*.*.to' => ['required_with:working_hours.*.*', 'date_format:H:i'],
            'contact_name' => ['nullable', 'string', 'max:120'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateUnit(Request $request): array
    {
        return $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:120'],
            'min_capacity' => ['required', 'integer', 'min:1'],
            'max_capacity' => ['required', 'integer', 'gte:min_capacity'],
            'pricing_type' => ['required', 'in:unit_hour,package,per_person'],
            'price' => ['required', 'numeric', 'min:0'],
            'default_duration_minutes' => ['required', 'integer', 'min:15', 'max:600'],
            'status' => ['nullable', 'in:active,maintenance,disabled'],
        ]);
    }
}
