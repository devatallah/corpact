<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateClubRequest extends FormRequest
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
            'city' => ['sometimes', 'string', 'max:255'],
            'district' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255'],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'contact_phone' => ['sometimes', 'string', 'max:20'],
            'commission_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'status' => ['sometimes', 'string', 'in:pending,active,rejected,suspended'],
            'sport_ids' => ['sometimes', 'array'],
            'sport_ids.*' => ['integer', 'exists:sports,id'],
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
            'name.string' => 'اسم النادي يجب أن يكون نصاً.',
            'name.max' => 'اسم النادي يجب ألا يتجاوز 255 حرف.',
            'city.string' => 'المدينة يجب أن تكون نصاً.',
            'city.max' => 'المدينة يجب ألا تتجاوز 255 حرف.',
            'district.string' => 'الحي يجب أن يكون نصاً.',
            'district.max' => 'الحي يجب ألا يتجاوز 255 حرف.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرف.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'contact_phone.max' => 'رقم الهاتف يجب ألا يتجاوز 20 حرف.',
            'commission_rate.numeric' => 'نسبة العمولة يجب أن تكون رقماً.',
            'commission_rate.min' => 'نسبة العمولة يجب أن تكون 0 على الأقل.',
            'commission_rate.max' => 'نسبة العمولة يجب ألا تتجاوز 100.',
            'status.in' => 'حالة النادي غير صالحة.',
            'sport_ids.*.exists' => 'الرياضة المحددة غير موجودة.',
        ];
    }
}
