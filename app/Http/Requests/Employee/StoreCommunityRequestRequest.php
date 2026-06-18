<?php

namespace App\Http\Requests\Employee;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCommunityRequestRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:1000'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'reason' => ['sometimes', 'string', 'max:1000'],
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
            'name.required' => 'اسم المجتمع مطلوب.',
            'name.max' => 'اسم المجتمع يجب ألا يتجاوز 255 حرف.',
            'description.max' => 'وصف المجتمع يجب ألا يتجاوز 1000 حرف.',
            'category_id.required' => 'الفئة مطلوبة.',
            'category_id.exists' => 'الفئة المحددة غير موجودة.',
            'reason.max' => 'سبب الطلب يجب ألا يتجاوز 1000 حرف.',
        ];
    }
}
