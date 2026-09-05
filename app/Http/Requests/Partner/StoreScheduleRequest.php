<?php

namespace App\Http\Requests\Partner;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScheduleRequest extends FormRequest
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
            // النطاق للمزوّد لا للوجود المجرّد: `exists:venues,id` وحده يقبل
            // ملعب مزوّد آخر. ومنذ صار الحجز يحترم الساعات المعروضة، صار ذلك
            // بابَ تحكّم مزوّد في توفّر منافسه — لا خطأ عرضٍ فحسب.
            'venue_id' => [
                'required', 'integer',
                Rule::exists('venues', 'id')->where(
                    'partner_id',
                    optional(auth('partner')->user())->resolvedPartner()?->id,
                ),
            ],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'status' => ['sometimes', 'string'],
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
            'venue_id.required' => 'المرفق مطلوب.',
            'venue_id.exists' => 'المرفق المحدد غير موجود.',
            'date.required' => 'التاريخ مطلوب.',
            'start_time.required' => 'وقت البداية مطلوب.',
            'end_time.required' => 'وقت النهاية مطلوب.',
            'end_time.after' => 'وقت النهاية يجب أن يكون بعد وقت البداية.',
        ];
    }
}
