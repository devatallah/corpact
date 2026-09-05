<?php

namespace App\Http\Requests\Partner;

use App\Models\Community;
use App\Models\Discount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * A17 — التخفيض يخصّ مجتمعاً بعينه لدى شركة بعينها. التحقق يمنع أن يُنشأ
 * تخفيض لمجتمع لا يتبع الشركة المختارة — وإلا صار مسار كتابة عابراً
 * للمستأجرين عبر تلفيق `community_id`.
 */
class StoreDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('partner')->check();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'name' => ['nullable', 'string', 'max:120'],
            'type' => ['required', 'in:fixed,percentage'],
            'value' => ['required', 'numeric', 'min:0'],
            'usage' => ['required', 'in:one_time,date_range'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('type') === Discount::TYPE_PERCENTAGE && (float) $this->input('value') > 100) {
                $validator->errors()->add('value', 'النسبة لا تتجاوز 100٪.');
            }

            $community = Community::find($this->input('community_id'));

            if ($community !== null && (int) $community->company_id !== (int) $this->input('company_id')) {
                $validator->errors()->add('community_id', 'هذا المجتمع لا يتبع الشركة المختارة.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'company_id' => 'الشركة',
            'community_id' => 'المجتمع',
            'type' => 'نوع التخفيض',
            'value' => 'القيمة',
            'usage' => 'الاستخدام',
        ];
    }
}
