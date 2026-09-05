<?php

namespace App\Http\Requests\Partner;

use App\Models\Discount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * A17 — تعديل تخفيض قائم. الشركة والمجتمع لا يُنقلان بعد الإنشاء: تحويل
 * تخفيض من مجتمع لآخر يغيّر الطرف المستفيد من اتفاق قائم، فيُحذف ويُنشأ.
 */
class UpdateDiscountRequest extends FormRequest
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
            'name' => ['nullable', 'string', 'max:120'],
            'type' => ['required', 'in:fixed,percentage'],
            'value' => ['required', 'numeric', 'min:0'],
            'usage' => ['required', 'in:one_time,date_range'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
            'status' => ['sometimes', 'in:active,expired'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('type') === Discount::TYPE_PERCENTAGE && (float) $this->input('value') > 100) {
                $validator->errors()->add('value', 'النسبة لا تتجاوز 100٪.');
            }
        });
    }
}
