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
            'partner_id' => ['sometimes', 'integer', 'exists:partners,id'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'date_from' => ['sometimes', 'date'],
            'date_to' => ['sometimes', 'date', 'after_or_equal:date_from'],
            'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
            // H §18 — الترتيب. القيمة مفتاح من قائمة بيضاء في `ListSort`، لا
            // اسم عمود؛ التحقق هنا يمنع الحشو فقط.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
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
            'partner_id.exists' => 'الشريك المحددة غير موجودة.',
            'category_id.exists' => 'الفئة المحددة غير موجودة.',
            'date_to.after_or_equal' => 'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية.',
            'per_page.min' => 'عدد العناصر في الصفحة يجب أن يكون 5 على الأقل.',
            'per_page.max' => 'عدد العناصر في الصفحة يجب ألا يتجاوز 100.',
        ];
    }
}
