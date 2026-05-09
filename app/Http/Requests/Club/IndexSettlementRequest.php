<?php

namespace App\Http\Requests\Club;

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
            'search' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string'],
            'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'search.max' => 'نص البحث يجب ألا يتجاوز 255 حرف.',
            'per_page.min' => 'عدد العناصر يجب أن يكون 5 على الأقل.',
            'per_page.max' => 'عدد العناصر يجب ألا يتجاوز 100.',
        ];
    }
}
