<?php

namespace App\Http\Requests\Business;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVenueRequest extends FormRequest
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
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'status' => ['sometimes', 'string', 'in:active,closed,maintenance'],
            'pricings' => ['sometimes', 'array'],
            'pricings.*.duration_minutes' => ['required', 'integer', 'in:60,90,120'],
            'pricings.*.price' => ['required', 'numeric', 'min:0'],
            'pricings.*.is_peak' => ['sometimes'],
            'pricings.*.label' => ['nullable', 'string', 'max:255'],
            'pricings.*.start_time' => ['nullable'],
            'pricings.*.end_time' => ['nullable'],
            'pricings.*.days' => ['nullable', 'array'],
            'pricings.*.days.*' => ['integer', 'min:0', 'max:6'],
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
            'name.required' => 'اسم المرفق مطلوب.',
            'name.max' => 'اسم المرفق يجب ألا يتجاوز 255 حرف.',
            'category_id.required' => 'الفئة مطلوبة.',
            'category_id.exists' => 'الفئة المحددة غير موجودة.',
            'status.in' => 'حالة المرفق غير صالحة.',
            'pricings.*.price.required' => 'السعر مطلوب.',
            'pricings.*.price.numeric' => 'السعر يجب أن يكون رقماً.',
            'pricings.*.price.min' => 'السعر يجب أن يكون 0 على الأقل.',
            'pricings.*.label.max' => 'التسمية يجب ألا تتجاوز 255 حرف.',
        ];
    }
}
