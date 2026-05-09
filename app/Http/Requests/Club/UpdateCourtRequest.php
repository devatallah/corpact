<?php

namespace App\Http\Requests\Club;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCourtRequest extends FormRequest
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
            'sport_id' => ['sometimes', 'integer', 'exists:sports,id'],
            'status' => ['sometimes', 'string', 'in:active,inactive'],
            'pricings' => ['sometimes', 'array'],
            'pricings.*' => ['numeric', 'min:0'],
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
            'name.max' => 'اسم الملعب يجب ألا يتجاوز 255 حرف.',
            'sport_id.exists' => 'الرياضة المحددة غير موجودة.',
            'status.in' => 'حالة الملعب غير صالحة.',
            'pricings.*.numeric' => 'السعر يجب أن يكون رقماً.',
            'pricings.*.min' => 'السعر يجب أن يكون 0 على الأقل.',
        ];
    }
}
