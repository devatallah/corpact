<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Services\Notifications\PreferenceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * تفضيلات الإشعارات في ملف الموظف (H §14).
 *
 * «المستخدم يستطيع إيقاف الإشعارات الاختيارية فقط، ولا يستطيع إيقاف
 * الإلزامية». الشاشة لا تعرض الإلزامية أصلاً، **والخدمة ترفضها حتى لو أُرسل
 * مفتاحها في الطلب مباشرة** — الحماية في الخادم لا في الواجهة.
 */
class NotificationPreferenceController extends Controller
{
    public function __construct(private PreferenceService $preferences) {}

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'preferences' => ['required', 'array'],
            'preferences.*' => ['boolean'],
        ], [
            'preferences.required' => 'لا توجد تفضيلات لحفظها.',
        ]);

        $employee = $request->user('employee');

        /** @var array<string, bool> $values */
        $values = $data['preferences'];

        $applied = $this->preferences->setMany($employee, $values);
        $ignored = count($values) - $applied;

        return back()->with('success', $ignored > 0
            ? "حُفظت تفضيلاتك. {$ignored} إشعاراً إلزامياً لا يمكن إيقافه."
            : 'حُفظت تفضيلات الإشعارات.');
    }
}
