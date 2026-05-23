<?php

namespace App\Http\Requests\Club;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:fixed,percentage'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'usage' => ['required', 'in:one_time,date_range'],
            'starts_at' => ['nullable', 'date', 'required_if:usage,date_range'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at', 'required_if:usage,date_range'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'company_id.required' => 'الشركة مطلوبة.',
            'company_id.exists' => 'الشركة المحددة غير موجودة.',
            'community_id.required' => 'المجتمع مطلوب.',
            'community_id.exists' => 'المجتمع المحدد غير موجود.',
            'type.required' => 'نوع الخصم مطلوب.',
            'type.in' => 'نوع الخصم غير صالح.',
            'value.required' => 'قيمة الخصم مطلوبة.',
            'value.min' => 'قيمة الخصم يجب أن تكون أكبر من 0.',
            'usage.required' => 'نوع الاستخدام مطلوب.',
            'usage.in' => 'نوع الاستخدام غير صالح.',
            'starts_at.required_if' => 'تاريخ البداية مطلوب عند اختيار فترة زمنية.',
            'expires_at.required_if' => 'تاريخ الانتهاء مطلوب عند اختيار فترة زمنية.',
            'expires_at.after_or_equal' => 'تاريخ الانتهاء يجب أن يكون بعد أو يساوي تاريخ البداية.',
        ];
    }
}
