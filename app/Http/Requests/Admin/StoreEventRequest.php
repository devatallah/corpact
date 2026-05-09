<?php

namespace App\Http\Requests\Admin;

use App\Models\Court;
use App\Models\CourtPricing;
use App\Models\Event;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'club_id' => ['required', 'integer', 'exists:clubs,id'],
            'sport_id' => ['required', 'integer', 'exists:sports,id'],
            'court_pricing_id' => ['required', 'integer', 'exists:court_pricings,id'],
            'court_ids' => ['required', 'array', 'min:1'],
            'court_ids.*' => ['integer', 'exists:courts,id'],
            'date' => ['required', 'date', 'after:today'],
            'time' => ['required', 'date_format:H:i'],
            'capacity' => ['required', 'integer', 'min:2', 'max:100'],
            'company_subsidy' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $pricing = CourtPricing::find($this->input('court_pricing_id'));
            if (! $pricing) {
                return;
            }

            $courtIds = $this->input('court_ids', []);
            $courtsCount = count($courtIds);

            // Validate selected courts belong to the club and sport
            $validCourts = Court::where('club_id', $this->input('club_id'))
                ->where('sport_id', $this->input('sport_id'))
                ->active()
                ->whereIn('id', $courtIds)
                ->count();

            if ($validCourts !== $courtsCount) {
                $validator->errors()->add('court_ids', 'أحد الملاعب المختارة لا ينتمي للنادي أو الرياضة المحددة.');
                return;
            }

            $overlapping = Event::overlappingCourtsCount(
                (int) $this->input('club_id'),
                $this->input('date'),
                $this->input('time'),
                $pricing->duration_minutes,
            );

            $availableCourts = Court::where('club_id', $this->input('club_id'))
                ->where('sport_id', $this->input('sport_id'))
                ->active()
                ->count();

            if ($overlapping + $courtsCount > $availableCourts) {
                $validator->errors()->add('time', 'الوقت المحدد يتعارض مع فعالية أخرى. لا تتوفر ملاعب كافية في هذا الوقت.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'community_id.required' => 'المجتمع مطلوب.',
            'community_id.exists' => 'المجتمع المحدد غير موجود.',
            'company_id.required' => 'الشركة مطلوبة.',
            'company_id.exists' => 'الشركة المحددة غير موجودة.',
            'club_id.required' => 'النادي مطلوب.',
            'club_id.exists' => 'النادي المحدد غير موجود.',
            'sport_id.required' => 'الرياضة مطلوبة.',
            'sport_id.exists' => 'الرياضة المحددة غير موجودة.',
            'court_pricing_id.required' => 'تسعيرة الملعب مطلوبة.',
            'court_pricing_id.exists' => 'تسعيرة الملعب المحددة غير موجودة.',
            'date.required' => 'التاريخ مطلوب.',
            'date.after' => 'التاريخ يجب أن يكون بعد اليوم.',
            'time.required' => 'الوقت مطلوب.',
            'capacity.required' => 'عدد اللاعبين مطلوب.',
            'capacity.min' => 'عدد اللاعبين يجب أن يكون 2 على الأقل.',
            'capacity.max' => 'عدد اللاعبين يجب ألا يتجاوز 100.',
            'court_ids.required' => 'اختيار الملاعب مطلوب.',
            'court_ids.min' => 'يجب اختيار ملعب واحد على الأقل.',
            'court_ids.*.exists' => 'أحد الملاعب المختارة غير موجود.',
            'company_subsidy.min' => 'دعم الشركة يجب أن يكون 0 على الأقل.',
            'notes.max' => 'الملاحظات يجب ألا تتجاوز 500 حرف.',
        ];
    }
}
