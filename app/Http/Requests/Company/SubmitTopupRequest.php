<?php

namespace App\Http\Requests\Company;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * طلب شحن المحفظة بتحويل بنكي (H §12.5): المبلغ، تاريخ التحويل، آخر 4
 * أرقام من حساب المُرسِل، مرجع العملية، وصورة الإشعار.
 */
class SubmitTopupRequest extends FormRequest
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
            'amount' => ['required', 'numeric', 'min:1'],
            'transfer_date' => ['required', 'date', 'before_or_equal:today'],
            'sender_account_last4' => ['required', 'digits:4'],
            'bank_reference' => ['required', 'string', 'max:100'],
            'receipt' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'المبلغ مطلوب.',
            'amount.numeric' => 'المبلغ يجب أن يكون رقماً.',
            'amount.min' => 'المبلغ يجب أن يكون 1 على الأقل.',
            'transfer_date.required' => 'تاريخ التحويل مطلوب.',
            'transfer_date.date' => 'تاريخ التحويل غير صالح.',
            'transfer_date.before_or_equal' => 'تاريخ التحويل لا يكون في المستقبل.',
            'sender_account_last4.required' => 'آخر 4 أرقام من حساب المُرسِل مطلوبة.',
            'sender_account_last4.digits' => 'أدخل آخر 4 أرقام فقط.',
            'bank_reference.required' => 'مرجع العملية مطلوب.',
            'receipt.required' => 'صورة إشعار التحويل مطلوبة.',
            'receipt.mimes' => 'الإشعار يجب أن يكون صورة (jpg/png) أو PDF.',
            'receipt.max' => 'حجم الإشعار لا يتجاوز 5 ميجابايت.',
        ];
    }
}
