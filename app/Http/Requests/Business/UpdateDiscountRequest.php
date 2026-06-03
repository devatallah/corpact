<?php

namespace App\Http\Requests\Business;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDiscountRequest extends FormRequest
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
            'name' => ['nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'in:fixed,percentage'],
            'value' => ['sometimes', 'numeric', 'min:0.01'],
            'usage' => ['sometimes', 'in:one_time,date_range'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'status' => ['sometimes', 'in:active,expired'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.in' => 'نوع الخصم غير صالح.',
            'value.min' => 'قيمة الخصم يجب أن تكون أكبر من 0.',
            'usage.in' => 'نوع الاستخدام غير صالح.',
            'expires_at.after_or_equal' => 'تاريخ الانتهاء يجب أن يكون بعد أو يساوي تاريخ البداية.',
            'status.in' => 'الحالة غير صالحة.',
        ];
    }
}
