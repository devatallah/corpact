<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAlert;
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
    public function index(Request $request): Response
    {
        $showAcknowledged = $request->boolean('acknowledged');

        $alerts = AdminAlert::query()
            ->when(! $showAcknowledged, fn ($q) => $q->whereNull('acknowledged_at'))
            ->with('acknowledgedBy:id,name')
            ->orderByRaw('acknowledged_at is null desc')
            ->latest('last_seen_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/alerts/index', [
            'alerts' => $alerts,
            'stats' => [
                'open' => AdminAlert::query()->open()->count(),
                'critical' => AdminAlert::query()->open()->where('level', AdminAlert::LEVEL_CRITICAL)->count(),
            ],
            'filters' => ['acknowledged' => $showAcknowledged],
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
