<?php

namespace App\Http\Requests\Company;

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
            'business_id' => ['sometimes', 'integer', 'exists:businesses,id'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'venue_ids' => ['sometimes', 'array', 'min:1'],
            'venue_ids.*' => ['integer', 'exists:venues,id'],
            'venue_pricing_id' => ['sometimes', 'integer', 'exists:venue_pricings,id'],
            'date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'string'],
            'end_time' => ['sometimes', 'string'],
            'time' => ['sometimes', 'string'],
            'capacity' => ['sometimes', 'integer', 'min:2'],
            'venues_count' => ['sometimes', 'integer', 'min:1'],
            'company_subsidy' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
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
            'business_id.exists' => 'مزود الخدمة المحددة غير موجودة.',
            'category_id.exists' => 'الفئة المحددة غير موجودة.',
            'venue_id.exists' => 'المرفق المحدد غير موجود.',
            'venue_pricing_id.exists' => 'تسعيرة المرفق المحددة غير موجودة.',
            'date.date' => 'التاريخ غير صالح.',
            'start_time.date_format' => 'صيغة وقت البداية غير صالحة.',
            'end_time.date_format' => 'صيغة وقت النهاية غير صالحة.',
            'capacity.min' => 'عدد اللاعبين يجب أن يكون 2 على الأقل.',
            'venues_count.min' => 'عدد المرافق يجب أن يكون 1 على الأقل.',
            'company_subsidy.min' => 'دعم الشركة يجب أن يكون 0 على الأقل.',
            'notes.max' => 'الملاحظات يجب ألا تتجاوز 500 حرف.',
        ];
    }
}
