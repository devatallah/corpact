<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAlert;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * صندوق التنبيهات الحرجة (H §20 — المراقبة).
 *
 * «تنبيه فوري لأدمن تيمات عند: فشل ويبهوك دفع · فشل مهمة مجدولة حرجة · رصيد
 * محفظة سالب · فشل استرداد …». هذه الشاشة هي الوجهة داخل المنصة؛ الـ paging
 * الفعلي (بريد/Slack) بنية تحتية يملكها المالك.
 *
 * التنبيه **يُقَر** ولا يُحذف: «الصمت ليس دليل نجاح» — ومن أقرّ يُسجَّل.
 */
class AdminAlertController extends Controller
{
    /**
     * الأعمدة المسموح الترتيب بها — كلها معروضة في جدول الشاشة أصلاً، والخطورة
     * مقروءة من لون العنوان (H §18). كلها أعمدة بسيطة على `admin_alerts`.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'title' => 'title',
            'level' => 'level',
            'occurrences' => 'occurrences',
            'last_seen_at' => 'last_seen_at',
            'acknowledged_at' => 'acknowledged_at',
            'created_at' => 'created_at',
        ], 'last_seen_at', ListSort::DESC, 'id');
    }

    public function index(Request $request): Response
    {
        $showAcknowledged = $request->boolean('acknowledged');
        $search = $request->query('search');
        $search = is_string($search) && trim($search) !== '' ? trim($search) : null;

        // H §18 — الترتيب: القيمتان مفتاحان من قائمة بيضاء، لا اسما عمودين.
        $sortKey = is_string($request->query('sort')) ? $request->query('sort') : null;
        $sortDir = is_string($request->query('dir')) ? $request->query('dir') : null;

        $query = AdminAlert::query()
            ->when(! $showAcknowledged, fn ($q) => $q->whereNull('acknowledged_at'))
            ->when($search !== null, fn ($q) => $q->where(fn ($inner) => $inner
                ->where('title', 'like', '%'.$search.'%')
                ->orWhere('body', 'like', '%'.$search.'%')
                ->orWhere('key', 'like', '%'.$search.'%')))
            ->with('acknowledgedBy:id,name')
            // التجميع «المفتوح أولاً» ليس ترتيباً يختاره المستخدم بل بنية
            // الشاشة، ولا يدخله شيء من الطلب — فيبقى قبل ترتيب المستخدم.
            ->orderByRaw('acknowledged_at is null desc');

        $alerts = self::sort()
            ->apply($query, $sortKey, $sortDir)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/alerts/index', [
            'alerts' => $alerts,
            'stats' => [
                'open' => AdminAlert::query()->open()->count(),
                'critical' => AdminAlert::query()->open()->where('level', AdminAlert::LEVEL_CRITICAL)->count(),
            ],
            'filters' => [
                'acknowledged' => $showAcknowledged,
                'search' => $search,
                'sort' => $sortKey,
                'dir' => $sortDir,
            ],
            'sort' => self::sort()->state($sortKey, $sortDir),
        ]);
    }

    public function acknowledge(AdminAlert $adminAlert): RedirectResponse
    {
        if ($adminAlert->acknowledged_at === null) {
            $adminAlert->forceFill([
                'acknowledged_at' => now(),
                'acknowledged_by' => auth('admin')->id(),
            ])->save();
        }

        return back()->with('success', 'أُقر التنبيه.');
    }
}
