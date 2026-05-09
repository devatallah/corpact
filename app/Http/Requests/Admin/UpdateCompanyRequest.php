<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
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
            'email' => ['sometimes', 'email', 'max:255', 'unique:companies,email,'.$this->route('company')->id],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'domain' => ['sometimes', 'string', 'max:255'],
            'sector' => ['sometimes', 'string', 'max:255'],
            'employee_count' => ['sometimes', 'integer', 'min:1'],
            'hr_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'hr_phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'city' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string', 'in:pending,review,active,rejected'],
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
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرف.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'domain.max' => 'نطاق الشركة يجب ألا يتجاوز 255 حرف.',
            'sector.max' => 'قطاع الشركة يجب ألا يتجاوز 255 حرف.',
            'employee_count.integer' => 'عدد الموظفين يجب أن يكون رقماً صحيحاً.',
            'employee_count.min' => 'عدد الموظفين يجب أن يكون 1 على الأقل.',
            'hr_name.max' => 'اسم مسؤول الموارد البشرية يجب ألا يتجاوز 255 حرف.',
            'hr_phone.max' => 'رقم جوال الموارد البشرية يجب ألا يتجاوز 20 حرف.',
            'city.max' => 'المدينة يجب ألا تتجاوز 255 حرف.',
            'status.in' => 'حالة الشركة غير صالحة.',
        ];
    }
}
