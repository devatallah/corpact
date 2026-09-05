<?php

namespace App\Http\Requests\Employee;

use App\Models\Event;
use App\Models\Venue;
use App\Models\VenuePricing;
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
     * الحقول الاختيارية الفارغة تصير `null` بدل سلسلة خاوية.
     *
     * «دعم الشركة» متروكاً فارغاً كان يصل `''`، فيمرّ على `sometimes` ويسقط
     * على `numeric` برسالة إنجليزية لا معنى لها لمن ترك الحقل عمداً — ولم
     * يكن يمكن إنشاء فعالية بلا رقم فيه إطلاقاً.
     *
     * و`null` لا مجرد قيمة صالحة: `isset()` عليها false، فتقرأ الخدمة الفراغ
     * على وجهه الصحيح «استعمل افتراضي إعدادات الشركة» (H §12.2) بدل أن
     * تحسبه دعماً صفرياً صريحاً يلغي الافتراضي.
     *
     * (`merge` لا `request->remove`: طلب Inertia يصل JSON، وحقيبة الـ form
     * التي يعمل عليها `remove` ليست التي يُقرأ منها الإدخال.)
     */
    protected function prepareForValidation(): void
    {
        $blank = [];

        foreach (['company_subsidy', 'discount_id', 'quick_match_id'] as $field) {
            if ($this->input($field) === '') {
                $blank[$field] = null;
            }
        }

        if ($blank !== []) {
            $this->merge($blank);
        }
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
            'partner_id' => ['required', 'integer', 'exists:partners,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'venue_pricing_id' => ['required', 'integer', 'exists:venue_pricings,id'],
            // التسعيرات التي عرضتها الشاشة فعلاً — واحدة لكل مرفق مختار.
            // إرسالها يجعل المعروض هو المحتسَب بلا استنتاج.
            'venue_pricing_ids' => ['sometimes', 'array'],
            'venue_pricing_ids.*' => ['integer', 'exists:venue_pricings,id'],
            'venue_ids' => ['required', 'array', 'min:1'],
            'venue_ids.*' => ['integer', 'exists:venues,id'],
            'date' => ['required', 'date', 'after:today'],
            'time' => ['required', 'date_format:H:i'],
            'capacity' => ['required', 'integer', 'min:2'],
            // H §7: الحد الأدنى مطلوب لآلة الحالات (بلوغه يرسل الطلب للمزوّد)
            // ومقيد بالسعة؛ افتراضيه 2 حين لا ترسله الواجهة.
            'min_participants' => ['sometimes', 'integer', 'min:2', 'lte:capacity'],
            'company_subsidy' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'quick_match_id' => ['nullable', 'integer', 'exists:quick_matches,id'],
            // A17 — تخفيض المزوّد. الانطباق (النافذة، والاستهلاك لتخفيض
            // «مرة واحدة») يُفحص في الخدمة على موعد الفعالية نفسه، لا هنا.
            'discount_id' => ['nullable', 'integer', 'exists:discounts,id'],
            /*
             * A17 — التكرار عاد إلى هذه الشاشة **مدخلاً** لا تخزيناً: A8 يبقى
             * قائماً، فالقالب هو المصدر الوحيد للتكرار. اختيار غير `none`
             * يُنشئ `event_template` بدل فعالية مفردة.
             *
             * لا `daily`: H §8 لا يعرّفه، وA8 حوّل ما كان منه إلى أسبوعي.
             */
            'recurrence' => ['sometimes', 'in:none,weekly,monthly'],
            'notes' => ['nullable', 'string', 'max:500'],
            // A9: سبب تجاوز الاقتراح الآلي — يفرضه الحارس عند الحاجة (H §11)
            'override_reason' => ['nullable', 'string', 'max:500'],
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

            // Validate selected venues belong to the partner and sport
            $validVenues = Venue::where('partner_id', $this->input('partner_id'))
                ->where('category_id', $this->input('category_id'))
                ->active()
                ->whereIn('id', $venueIds)
                ->count();

            if ($validVenues !== $venuesCount) {
                $validator->errors()->add('venue_ids', 'أحد المرافق المختارة لا ينتمي لالشريك أو الفئة المحددة.');

                return;
            }

            $overlapping = Event::overlappingvenuesCount(
                (int) $this->input('partner_id'),
                $this->input('date'),
                $this->input('time'),
                $pricing->duration_minutes,
            );

            $availableVenues = Venue::where('partner_id', $this->input('partner_id'))
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
            'partner_id.required' => 'الشريك مطلوبة.',
            'partner_id.exists' => 'الشريك المحددة غير موجودة.',
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
            'notes.max' => 'الملاحظات يجب ألا تتجاوز 500 حرف.',
        ];
    }
}
