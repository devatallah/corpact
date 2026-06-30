<?php

namespace App\Http\Requests\Employee;

use App\Models\Venue;
use App\Models\VenuePricing;
use App\Models\Event;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
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
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'business_id' => ['required', 'integer', 'exists:businesses,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'venue_pricing_id' => ['required', 'integer', 'exists:venue_pricings,id'],
            'venue_ids' => ['required', 'array', 'min:1'],
            'venue_ids.*' => ['integer', 'exists:venues,id'],
            'date' => ['required', 'date', 'after:today'],
            'time' => ['required', 'date_format:H:i'],
            'capacity' => ['required', 'integer', 'min:2'],
            'company_subsidy' => ['sometimes', 'numeric', 'min:0'],
            'discount_id' => ['nullable', 'integer', 'exists:discounts,id'],
            'quick_match_id' => ['nullable', 'integer', 'exists:quick_matches,id'],
            'recurrence_type' => ['sometimes', 'string', 'in:none,daily,weekly,monthly'],
            'recurrence_end_date' => ['nullable', 'required_if:recurrence_type,daily', 'required_if:recurrence_type,weekly', 'required_if:recurrence_type,monthly', 'date', 'after:date'],
            'recurrence_days' => ['nullable', 'array'],
            'recurrence_days.*' => ['integer', 'between:0,6'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $pricing = VenuePricing::find($this->input('venue_pricing_id'));
            if (! $pricing) {
                return;
            }

            $venueIds = $this->input('venue_ids', []);
            $venuesCount = count($venueIds);

            // Validate selected venues belong to the business and sport
            $validVenues = Venue::where('business_id', $this->input('business_id'))
                ->where('category_id', $this->input('category_id'))
                ->active()
                ->whereIn('id', $venueIds)
                ->count();

            if ($validVenues !== $venuesCount) {
                $validator->errors()->add('venue_ids', 'أحد المرافق المختارة لا ينتمي لمزود الخدمة أو الفئة المحددة.');
                return;
            }

            $overlapping = Event::overlappingvenuesCount(
                (int) $this->input('business_id'),
                $this->input('date'),
                $this->input('time'),
                $pricing->duration_minutes,
            );

            $availableVenues = Venue::where('business_id', $this->input('business_id'))
                ->where('category_id', $this->input('category_id'))
                ->active()
                ->count();

            if ($overlapping + $venuesCount > $availableVenues) {
                $validator->errors()->add('time', 'الوقت المحدد يتعارض مع فعالية أخرى. لا تتوفر ملاعب كافية في هذا الوقت.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'community_id.required' => 'المجتمع مطلوب.',
            'community_id.exists' => 'المجتمع المحدد غير موجود.',
            'business_id.required' => 'مزود الخدمة مطلوبة.',
            'business_id.exists' => 'مزود الخدمة المحددة غير موجودة.',
            'category_id.required' => 'الفئة مطلوبة.',
            'category_id.exists' => 'الفئة المحددة غير موجودة.',
            'venue_pricing_id.required' => 'تسعيرة المرفق مطلوبة.',
            'venue_pricing_id.exists' => 'تسعيرة المرفق المحددة غير موجودة.',
            'date.required' => 'التاريخ مطلوب.',
            'date.after' => 'التاريخ يجب أن يكون بعد اليوم.',
            'time.required' => 'الوقت مطلوب.',
            'capacity.required' => 'السعة مطلوبة.',
            'capacity.min' => 'السعة يجب أن تكون 2 على الأقل.',
            'venue_ids.required' => 'اختيار المرافق مطلوب.',
            'venue_ids.min' => 'يجب اختيار مرفق واحد على الأقل.',
            'venue_ids.*.exists' => 'أحد المرافق المختارة غير موجود.',
            'company_subsidy.min' => 'دعم الشركة يجب أن يكون 0 على الأقل.',
            'recurrence_type.in' => 'نوع التكرار غير صالح.',
            'recurrence_end_date.required_if' => 'تاريخ انتهاء التكرار مطلوب عند اختيار التكرار.',
            'recurrence_end_date.after' => 'تاريخ انتهاء التكرار يجب أن يكون بعد تاريخ الفعالية.',
            'recurrence_days.array' => 'أيام التكرار يجب أن تكون قائمة.',
            'notes.max' => 'الملاحظات يجب ألا تتجاوز 500 حرف.',
        ];
    }
}
