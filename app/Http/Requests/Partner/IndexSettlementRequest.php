<?php

namespace App\Http\Requests\Partner;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IndexSettlementRequest extends FormRequest
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
            // A11: الكشف لكل مزوّد لا لكل (مزوّد + شركة) — لا بحث بالشركة.
            'status' => ['sometimes', 'string', 'in:draft,approved,paid'],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
            // H §18 — الترتيب. مفتاح من قائمة بيضاء في `ListSort`، لا اسم عمود.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'per_page.min' => 'عدد العناصر يجب أن يكون 5 على الأقل.',
            'per_page.max' => 'عدد العناصر يجب ألا يتجاوز 100.',
            'search.max' => 'نص البحث يجب ألا يتجاوز 255 حرفاً.',
        ];
    }
}
