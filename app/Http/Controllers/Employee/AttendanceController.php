<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Event;
use App\Services\Attendance\AttendanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * تعديل قائمة الحضور من قائد المجتمع أو المنسّق داخل نافذة الـ24 ساعة
 * (H §13). لا مسار هنا لأي أثر مالي — الغياب أثره غير مالي بالكامل.
 */
class AttendanceController extends Controller
{
    public function __construct(private AttendanceService $attendance) {}

    public function update(Request $request, Event $event, Employee $employee): RedirectResponse
    {
        $data = $request->validate([
            'attendance_status' => ['required', 'in:attended,absent'],
            'reason' => ['nullable', 'string', 'max:500'],
        ], [
            'attendance_status.required' => 'حالة الحضور مطلوبة.',
            'attendance_status.in' => 'حالة الحضور إما «حاضر» أو «غائب».',
        ]);

        $actor = auth('employee')->user();

        try {
            $this->attendance->mark(
                $event,
                $employee,
                $data['attendance_status'],
                $actor?->user,
                $actor,
                $data['reason'] ?? null,
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'حُدّثت قائمة الحضور.');
    }
}
