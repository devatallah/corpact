<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlackoutDate;
use App\Services\ActivityLogService;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * أيام الحظر — أدمن تيمات (H §8): إجازات/رمضان. الفعالية المولَّدة من قالب
 * والواقعة في نطاق حظر تُتخطى افتراضياً أو تُزاح أسبوعاً حسب إعداد القالب.
 * CRUD أدنى — يوسّعه A15.
 */
class BlackoutDateController extends Controller
{
    /**
     * الأعمدة المسموح الترتيب بها — الاسم ونطاق التاريخ، وهي كل ما تعرضه
     * البطاقة (H §18). الافتراضي هو ترتيب الشاشة اليوم: الأحدث بداية أولاً.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'starts_on' => 'starts_on',
            'ends_on' => 'ends_on',
            'name' => 'name',
        ], 'starts_on', ListSort::DESC, 'id');
    }

    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $search = is_string($search) && trim($search) !== '' ? trim($search) : null;

        // H §18 — الترتيب: القيمتان مفتاحان من قائمة بيضاء، لا اسما عمودين.
        $sortKey = is_string($request->query('sort')) ? $request->query('sort') : null;
        $sortDir = is_string($request->query('dir')) ? $request->query('dir') : null;

        $query = BlackoutDate::query()
            ->when($search !== null, fn ($q) => $q->where('name', 'like', '%'.$search.'%'));

        return Inertia::render('admin/blackouts/index', [
            'blackouts' => self::sort()
                ->apply($query, $sortKey, $sortDir)
                ->paginate(20)
                ->withQueryString(),
            'totalBlackouts' => BlackoutDate::count(),
            'filters' => ['search' => $search, 'sort' => $sortKey, 'dir' => $sortDir],
            'sort' => self::sort()->state($sortKey, $sortDir),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['required', 'date', 'after_or_equal:starts_on'],
        ]);

        $blackout = BlackoutDate::create([
            ...$data,
            'created_by' => auth('admin')->id(),
        ]);

        ActivityLogService::log(
            null,
            $blackout,
            'blackout_created',
            "أُضيف نطاق حظر «{$blackout->name}» ({$blackout->starts_on->format('Y-m-d')} — {$blackout->ends_on->format('Y-m-d')})",
        );

        return back()->with('success', 'أُضيف نطاق الحظر — يسري على التوليد القادم فقط.');
    }

    public function update(Request $request, BlackoutDate $blackout): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['required', 'date', 'after_or_equal:starts_on'],
        ]);

        $blackout->update($data);

        return back()->with('success', 'عُدّل نطاق الحظر.');
    }

    public function destroy(BlackoutDate $blackout): RedirectResponse
    {
        $blackout->delete();

        return back()->with('success', 'حُذف نطاق الحظر.');
    }
}
