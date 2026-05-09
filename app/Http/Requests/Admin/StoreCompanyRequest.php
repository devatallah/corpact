<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyRequest extends FormRequest
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
            'email' => ['required', 'email', 'max:255', 'unique:companies,email', 'unique:employees,email'],
            'password' => ['required', 'string', 'min:6'],
            'domain' => ['required', 'string', 'max:255'],
            'sector' => ['required', 'string', 'max:255'],
            'hr_name' => ['nullable', 'string', 'max:255'],
            'hr_phone' => ['nullable', 'string', 'max:20'],
            'city' => ['required', 'string', 'max:255'],
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
            'name.required' => 'اسم الشركة مطلوب.',
            'name.max' => 'اسم الشركة يجب ألا يتجاوز 255 حرف.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرف.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'domain.required' => 'نطاق الشركة مطلوب.',
            'domain.max' => 'نطاق الشركة يجب ألا يتجاوز 255 حرف.',
            'sector.required' => 'قطاع الشركة مطلوب.',
            'sector.max' => 'قطاع الشركة يجب ألا يتجاوز 255 حرف.',
            'hr_name.max' => 'اسم مسؤول الموارد البشرية يجب ألا يتجاوز 255 حرف.',
            'hr_phone.max' => 'رقم جوال الموارد البشرية يجب ألا يتجاوز 20 حرف.',
            'city.required' => 'المدينة مطلوبة.',
            'city.max' => 'المدينة يجب ألا تتجاوز 255 حرف.',
        ];
    }
}
