<?php

namespace App\Http\Requests\Company;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCommunityRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:1000'],
            'sport_id' => ['sometimes', 'integer', 'exists:sports,id'],
            'leader_id' => ['sometimes', 'integer', 'exists:employees,id'],
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
            'name.string' => 'اسم المجتمع يجب أن يكون نصاً.',
            'name.max' => 'اسم المجتمع يجب ألا يتجاوز 255 حرف.',
            'description.string' => 'الوصف يجب أن يكون نصاً.',
            'description.max' => 'وصف المجتمع يجب ألا يتجاوز 1000 حرف.',
            'sport_id.exists' => 'الرياضة المحددة غير موجودة.',
            'leader_id.exists' => 'قائد المجتمع المحدد غير موجود.',
        ];
    }
}
