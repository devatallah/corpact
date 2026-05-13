<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
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
            'email' => ['sometimes', 'email', 'max:255', 'unique:employees,email,'.$this->route('employee')->id],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'department_id' => ['sometimes', 'nullable', 'integer', 'exists:departments,id'],
            'status' => ['sometimes', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.string' => 'الاسم يجب أن يكون نصاً.',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرف.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
            'phone.max' => 'رقم الجوال يجب ألا يتجاوز 20 حرف.',
            'company_id.exists' => 'الشركة المحددة غير موجودة.',
            'department_id.exists' => 'القسم المحدد غير موجود.',
        ];
    }
}
