<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityPreferredProvider;
use App\Models\Partner;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * إدارة المزوّدين المفضّلين للمجتمع — قائد المجتمع (H §11 + §18: «إدارة
 * المزوّدين المفضّلين» ضمن شاشات القائد). يُرتَّبون قبل غيرهم دائماً في
 * الاقتراح الآلي.
 */
class PreferredProviderController extends Controller
{
    /**
     * A15 — the leader-facing screen A9 left as endpoints only (H §18: «إدارة
     * المزوّدين المفضّلين» in the leader's page map).
     */
    public function index(Community $community): Response
    {
        $this->ensureLeader($community);

        $preferred = CommunityPreferredProvider::query()
            ->where('community_id', $community->id)
            ->with('partner:id,name,trade_name,city,district,reliability_score,reliability_samples')
            ->orderBy('position')
            ->get()
            ->map(fn (CommunityPreferredProvider $row) => [
                'id' => $row->id,
                'position' => (int) $row->position,
                'partner' => $row->partner === null ? null : [
                    'id' => $row->partner->id,
                    'name' => $row->partner->trade_name ?: $row->partner->name,
                    'city' => $row->partner->city,
                    'district' => $row->partner->district,
                    // H §11: المؤشر لا يُعرض قبل 10 عينات — قبلها لا معنى له.
                    'reliability' => (int) $row->partner->reliability_samples >= 10
                        ? (int) $row->partner->reliability_score
                        : null,
                    'reliability_samples' => (int) $row->partner->reliability_samples,
                ],
            ])
            ->all();

        $chosenIds = collect($preferred)->pluck('partner.id')->filter()->all();

        $available = Partner::query()
            ->whereNull('parent_id')
            ->where('status', 'active')
            ->whereNotIn('id', $chosenIds)
            ->orderBy('name')
            ->limit(100)
            ->get(['id', 'name', 'trade_name', 'city', 'district'])
            ->map(fn (Partner $partner) => [
                'id' => $partner->id,
                'name' => $partner->trade_name ?: $partner->name,
                'city' => $partner->city,
                'district' => $partner->district,
            ])
            ->all();

        return Inertia::render('employee/community/preferred-providers', [
            'community' => ['id' => $community->id, 'name' => $community->name],
            'preferred' => $preferred,
            'available' => $available,
        ]);
    }

    public function store(Request $request, Community $community): RedirectResponse
    {
        $this->ensureLeader($community);

        $data = $request->validate([
            'partner_id' => ['required', 'integer'],
        ]);

        $partner = Partner::query()
            ->whereNull('parent_id')
            ->where('status', 'active')
            ->whereKey($data['partner_id'])
            ->first();

        if ($partner === null) {
            return back()->withErrors(['partner_id' => 'المزوّد غير موجود أو غير نشط.']);
        }

        $position = (int) CommunityPreferredProvider::query()
            ->where('community_id', $community->id)
            ->max('position');

        CommunityPreferredProvider::firstOrCreate(
            ['community_id' => $community->id, 'partner_id' => $partner->id],
            ['position' => $position + 1, 'added_by' => Auth::guard('employee')->user()->user_id],
        );

        return back()->with('success', 'أُضيف المزوّد إلى قائمة المفضّلين — سيُرتَّب قبل غيره في الاقتراح.');
    }

    public function destroy(Community $community, Partner $partner): RedirectResponse
    {
        $this->ensureLeader($community);

        CommunityPreferredProvider::query()
            ->where('community_id', $community->id)
            ->where('partner_id', $partner->id)
            ->delete();

        return back()->with('success', 'أُزيل المزوّد من قائمة المفضّلين.');
    }

    private function ensureLeader(Community $community): void
    {
        $employee = Auth::guard('employee')->user();

        if ($community->company_id !== $employee->company_id) {
            throw (new ModelNotFoundException)->setModel(Community::class, [$community->id]);
        }

        if (! $community->isLeader($employee)) {
            abort(403, 'إدارة المزوّدين المفضّلين لقائد المجتمع.');
        }
    }
}
