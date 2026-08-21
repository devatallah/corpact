<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\ActivityUnit;
use App\Models\Partner;
use App\Models\UnitSlot;
use App\Services\Provider\AvailabilityService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * تقويم التوفر — «أهم مسؤولية يومية» على المزوّد (G/دليل المزوّد §2):
 * تقويم المنصة هو مصدر الحقيقة الوحيد، والحجوزات الخارجية تُسجَّل أولاً
 * بأول بوسم «حجز خارجي» حتى لا تُعرض تلك الأوقات.
 */
class AvailabilityController extends Controller
{
    public function __construct(private AvailabilityService $availability) {}

    public function index(Request $request): Response
    {
        $partner = $this->provider();

        $weekStart = Carbon::parse($request->query('date', now()->toDateString()))
            ->startOfWeek(Carbon::SUNDAY);
        $weekEnd = $weekStart->copy()->addDays(6);

        $units = ActivityUnit::query()
            ->whereHas('branch', fn ($q) => $q->where('partner_id', $partner->id))
            ->with('branch:id,name,working_hours')
            ->orderBy('provider_branch_id')
            ->get();

        $slots = UnitSlot::query()
            ->whereIn('activity_unit_id', $units->pluck('id'))
            ->whereBetween('date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('partner/availability', [
            'units' => $units,
            'slots' => $slots,
            'week_start' => $weekStart->toDateString(),
            'week_end' => $weekEnd->toDateString(),
        ]);
    }

    /**
     * تسجيل حجز خارجي («حجز خارجي») على وحدة.
     */
    public function storeExternal(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'activity_unit_id' => ['required', 'integer'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'note' => ['nullable', 'string', 'max:120'],
        ]);

        $unit = $this->ownedUnit((int) $data['activity_unit_id']);

        $this->availability->markExternal(
            $unit,
            $data['date'],
            $data['start_time'],
            $data['end_time'],
            $data['note'] ?? null,
        );

        return back()->with('success', 'سُجّل الحجز الخارجي — لن يُعرض هذا الوقت للحجز.');
    }

    /**
     * حذف حجز خارجي (الحجوزات الداخلية لا تُحذف من هنا — تُلغى من صفحة الطلب).
     */
    public function destroyExternal(UnitSlot $slot): RedirectResponse
    {
        $this->ownedUnit($slot->activity_unit_id);

        if ($slot->booking_type !== UnitSlot::TYPE_EXTERNAL) {
            return back()->withErrors(['slot' => 'حجوزات المنصة لا تُحذف من التقويم — تُدار من صفحة الطلب.']);
        }

        $slot->delete();

        return back()->with('success', 'حُذف الحجز الخارجي.');
    }

    private function provider(): Partner
    {
        return auth('partner')->user()->resolvedPartner();
    }

    private function ownedUnit(int $unitId): ActivityUnit
    {
        $unit = ActivityUnit::query()
            ->whereKey($unitId)
            ->whereHas('branch', fn ($q) => $q->where('partner_id', $this->provider()->id))
            ->first();

        if ($unit === null) {
            throw (new ModelNotFoundException)->setModel(ActivityUnit::class, [$unitId]);
        }

        return $unit;
    }
}
