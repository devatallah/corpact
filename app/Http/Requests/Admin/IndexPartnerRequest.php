<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IndexPartnerRequest extends FormRequest
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
            'status' => ['sometimes', 'string', 'in:pending,active,rejected,suspended'],
            'search' => ['sometimes', 'string', 'max:255'],
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
            'status.in' => 'حالة الشريك غير صالحة.',
            'search.max' => 'نص البحث يجب ألا يتجاوز 255 حرفاً.',
            'per_page.min' => 'عدد العناصر في الصفحة يجب أن يكون 5 على الأقل.',
            'per_page.max' => 'عدد العناصر في الصفحة يجب ألا يتجاوز 100.',
        ];
    }
}
