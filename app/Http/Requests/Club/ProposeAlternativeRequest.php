<?php

namespace App\Http\Requests\Club;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProposeAlternativeRequest extends FormRequest
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
            'proposed_date' => ['required', 'date', 'after_or_equal:today'],
            'proposed_start_time' => ['required', 'date_format:H:i'],
            'proposed_end_time' => ['nullable', 'date_format:H:i', 'after:proposed_start_time'],
            'proposed_courts_count' => ['nullable', 'integer', 'min:1'],
            'proposed_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'proposed_date.required' => 'التاريخ البديل مطلوب.',
            'proposed_date.date' => 'التاريخ البديل غير صالح.',
            'proposed_date.after_or_equal' => 'التاريخ البديل يجب أن يكون اليوم أو بعده.',
            'proposed_start_time.required' => 'وقت البداية مطلوب.',
            'proposed_start_time.date_format' => 'صيغة وقت البداية غير صالحة.',
            'proposed_end_time.date_format' => 'صيغة وقت النهاية غير صالحة.',
            'proposed_end_time.after' => 'وقت النهاية يجب أن يكون بعد وقت البداية.',
            'proposed_courts_count.min' => 'عدد الملاعب يجب أن يكون 1 على الأقل.',
            'proposed_amount.min' => 'المبلغ يجب أن يكون 0 على الأقل.',
            'notes.max' => 'الملاحظات يجب ألا تتجاوز 500 حرف.',
        ];
    }
}
