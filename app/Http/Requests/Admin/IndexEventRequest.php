<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IndexEventRequest extends FormRequest
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
            'search' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string'],
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'club_id' => ['sometimes', 'integer', 'exists:clubs,id'],
            'sport_id' => ['sometimes', 'integer', 'exists:sports,id'],
            'date_from' => ['sometimes', 'date'],
            'date_to' => ['sometimes', 'date', 'after_or_equal:date_from'],
            'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
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
            'company_id.exists' => 'الشركة المحددة غير موجودة.',
            'club_id.exists' => 'النادي المحدد غير موجود.',
            'sport_id.exists' => 'الرياضة المحددة غير موجودة.',
            'date_to.after_or_equal' => 'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية.',
            'per_page.min' => 'عدد العناصر في الصفحة يجب أن يكون 5 على الأقل.',
            'per_page.max' => 'عدد العناصر في الصفحة يجب ألا يتجاوز 100.',
        ];
    }
}
