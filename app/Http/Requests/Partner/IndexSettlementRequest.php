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
            'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
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
        ];
    }
}
