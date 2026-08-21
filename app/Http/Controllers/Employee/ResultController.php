<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\CompetitionResult;
use App\Models\Employee;
use App\Models\Event;
use App\Services\Competition\ResultService;
use App\Support\Competition\MeasurementUnits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use RuntimeException;

/**
 * إدخال النتائج وتصحيحها من القائد أو المنسّق (H §13). التصحيح يمر بمسار
 * منفصل يفرض السبب والتدقيق وإعادة احتساب اللوحة.
 */
class ResultController extends Controller
{
    public function __construct(private ResultService $results) {}

    public function store(Request $request, Event $event, Employee $employee): RedirectResponse
    {
        $data = $request->validate([
            'unit' => ['required', Rule::in(MeasurementUnits::keys())],
            'value' => ['required', 'numeric'],
            'notes' => ['nullable', 'string', 'max:500'],
        ], [
            'unit.required' => 'وحدة القياس مطلوبة.',
            'unit.in' => 'وحدة القياس يجب أن تكون من الكتالوج المركزي.',
            'value.required' => 'قيمة النتيجة مطلوبة.',
            'value.numeric' => 'قيمة النتيجة يجب أن تكون رقماً.',
        ]);

        $actor = auth('employee')->user();

        try {
            $this->results->record(
                $event,
                $employee,
                $data['unit'],
                $data['value'],
                $actor?->user,
                $data['notes'] ?? null,
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'سُجّلت النتيجة.');
    }

    public function correct(Request $request, CompetitionResult $result): RedirectResponse
    {
        $data = $request->validate([
            'value' => ['required', 'numeric'],
            'unit' => ['nullable', Rule::in(MeasurementUnits::keys())],
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ], [
            'value.required' => 'القيمة المصحَّحة مطلوبة.',
            'reason.required' => 'سبب التصحيح إلزامي ويُسجَّل في سجل التدقيق (H §13).',
            'reason.min' => 'اكتب سبباً مفهوماً للتصحيح.',
        ]);

        $actor = auth('employee')->user();

        try {
            $this->results->correct(
                $result,
                $data['value'],
                $actor?->user,
                $data['reason'],
                $data['unit'] ?? null,
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'صُحِّحت النتيجة وأُعيد احتساب اللوحة.');
    }
}
