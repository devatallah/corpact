<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
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
            'community_id' => ['sometimes', 'integer', 'exists:communities,id'],
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'club_id' => ['sometimes', 'integer', 'exists:clubs,id'],
            'sport_id' => ['sometimes', 'integer', 'exists:sports,id'],
            'court_ids' => ['sometimes', 'array', 'min:1'],
            'court_ids.*' => ['integer', 'exists:courts,id'],
            'court_pricing_id' => ['sometimes', 'integer', 'exists:court_pricings,id'],
            'date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'string'],
            'end_time' => ['sometimes', 'string'],
            'time' => ['sometimes', 'string'],
            'capacity' => ['sometimes', 'integer', 'min:2'],
            'courts_count' => ['sometimes', 'integer', 'min:1'],
            'company_subsidy' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'community_id.exists' => 'المجتمع المحدد غير موجود.',
            'company_id.exists' => 'الشركة المحددة غير موجودة.',
            'club_id.exists' => 'النادي المحدد غير موجود.',
            'sport_id.exists' => 'الرياضة المحددة غير موجودة.',
            'court_id.exists' => 'الملعب المحدد غير موجود.',
            'court_pricing_id.exists' => 'تسعيرة الملعب المحددة غير موجودة.',
            'date.date' => 'التاريخ غير صالح.',
            'start_time.date_format' => 'صيغة وقت البداية غير صالحة.',
            'end_time.date_format' => 'صيغة وقت النهاية غير صالحة.',
            'capacity.min' => 'عدد اللاعبين يجب أن يكون 2 على الأقل.',
            'courts_count.min' => 'عدد الملاعب يجب أن يكون 1 على الأقل.',
            'company_subsidy.min' => 'دعم الشركة يجب أن يكون 0 على الأقل.',
            'notes.max' => 'الملاحظات يجب ألا تتجاوز 1000 حرف.',
        ];
    }
}
