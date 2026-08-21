<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Event;
use App\Services\Attendance\AttendanceService;
use App\Support\Tenancy\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * تدخل أدمن تيمات في قائمة الحضور بعد إقفال نافذة الـ24 ساعة (H §13):
 * **استثناء لا إجراء روتيني** — السبب الموثَّق إلزامي، والتعديل يُسجَّل في
 * سجل التدقيق وفي `participant_events` معاً.
 */
class AttendanceController extends Controller
{
    public function __construct(private AttendanceService $attendance) {}

    public function update(Request $request, Event $event, Employee $employee): RedirectResponse
    {
        $data = $request->validate([
            'attendance_status' => ['required', 'in:attended,absent'],
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ], [
            'attendance_status.required' => 'حالة الحضور مطلوبة.',
            'reason.required' => 'السبب الموثَّق إلزامي — تعديل الحضور بعد النافذة استثناء لا إجراء روتيني (H §13).',
            'reason.min' => 'اكتب سبباً مفهوماً.',
        ]);

        $user = auth('admin')->user();

        try {
            app(CompanyContext::class)->bypass(function () use ($event, $employee, $data, $user): void {
                $this->attendance->mark(
                    $event,
                    $employee,
                    $data['attendance_status'],
                    $user,
                    $user,
                    $data['reason'],
                );
            });
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'عُدّلت قائمة الحضور بصفة استثنائية موثَّقة.');
    }
}
