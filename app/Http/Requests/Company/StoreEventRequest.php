<?php

namespace App\Http\Requests\Company;

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
            'capacity' => ['required', 'integer', 'min:2', 'max:100'],
            'company_subsidy' => ['sometimes', 'numeric', 'min:0'],
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
                $validator->errors()->add('venue_ids', 'أحد المرافق المختارة لا ينتمي للمنشأة أو الفئة المحددة.');
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
            'business_id.required' => 'المنشأة مطلوبة.',
            'business_id.exists' => 'المنشأة المحددة غير موجودة.',
            'category_id.required' => 'الفئة مطلوبة.',
            'category_id.exists' => 'الفئة المحددة غير موجودة.',
            'venue_pricing_id.required' => 'تسعيرة المرفق مطلوبة.',
            'venue_pricing_id.exists' => 'تسعيرة المرفق المحددة غير موجودة.',
            'date.required' => 'التاريخ مطلوب.',
            'date.after' => 'التاريخ يجب أن يكون بعد اليوم.',
            'time.required' => 'الوقت مطلوب.',
            'capacity.required' => 'عدد اللاعبين مطلوب.',
            'capacity.min' => 'عدد اللاعبين يجب أن يكون 2 على الأقل.',
            'capacity.max' => 'عدد اللاعبين يجب ألا يتجاوز 100.',
            'venue_ids.required' => 'اختيار المرافق مطلوب.',
            'venue_ids.min' => 'يجب اختيار مرفق واحد على الأقل.',
            'venue_ids.*.exists' => 'أحد المرافق المختارة غير موجود.',
            'company_subsidy.min' => 'دعم الشركة يجب أن يكون 0 على الأقل.',
            'notes.max' => 'الملاحظات يجب ألا تتجاوز 500 حرف.',
        ];
    }
}
