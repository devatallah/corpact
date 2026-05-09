<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClubRequest extends FormRequest
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
            'email' => ['required', 'email', 'max:255', 'unique:clubs,email'],
            'password' => ['required', 'string', 'min:6'],
            'city' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:20'],
            'commission_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'sport_ids' => ['required', 'array', 'min:1'],
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
            'name.required' => 'اسم النادي مطلوب.',
            'name.max' => 'اسم النادي يجب ألا يتجاوز 255 حرف.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرف.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'city.required' => 'المدينة مطلوبة.',
            'city.max' => 'المدينة يجب ألا تتجاوز 255 حرف.',
            'district.required' => 'الحي مطلوب.',
            'district.max' => 'الحي يجب ألا يتجاوز 255 حرف.',
            'contact_phone.required' => 'رقم الهاتف مطلوب.',
            'contact_phone.max' => 'رقم الهاتف يجب ألا يتجاوز 20 حرف.',
            'commission_rate.required' => 'نسبة العمولة مطلوبة.',
            'commission_rate.numeric' => 'نسبة العمولة يجب أن تكون رقماً.',
            'commission_rate.min' => 'نسبة العمولة يجب أن تكون 0 على الأقل.',
            'commission_rate.max' => 'نسبة العمولة يجب ألا تتجاوز 100.',
            'sport_ids.required' => 'يجب اختيار رياضة واحدة على الأقل.',
            'sport_ids.min' => 'يجب اختيار رياضة واحدة على الأقل.',
            'sport_ids.*.exists' => 'الرياضة المحددة غير موجودة.',
        ];
    }
}
