<?php

/*
|--------------------------------------------------------------------------
| الحضور والنتائج والمواسم واللوحات — H §13 (A12)
|--------------------------------------------------------------------------
|
| كتالوج القياس المركزي: الإصدار الأول يدعم **نوعين فقط** من القياس —
| «قيمة فردية» (وقت · مسافة · عدد) و«المواظبة» (عدد الفعاليات المكتملة
| بحضور). أي وحدة قياس تُدخل مع نتيجة يجب أن تكون من هذه القائمة المركزية
| وحدها — لا نص حر، حتى تبقى اللوحات قابلة للترتيب والمقارنة.
|
| `direction` تحدد معنى «الأفضل»: الزمن الأقل أفضل، والمسافة والعدد الأكثر
| أفضل، ووحدة الثبات (hold_seconds) زمن الأطول فيه أفضل.
|
*/

return [

    /*
    | نافذة تعديل الحضور (H §13): 24 ساعة من اكتمال الفعالية، بعدها تُقفل
    | القائمة ولا يعدّلها إلا أدمن تيمات بسبب موثَّق.
    */
    'attendance' => [
        'edit_window_hours' => 24,
    ],

    /*
    | لوحة المواظبة: النقاط تبدأ من **أول مشاركة** — كل فعالية مكتملة حضرها
    | الموظف داخل الموسم نقطة. لا ربط بأي قيمة مالية ولا نقل بين المجتمعات
    | (ممنوع صراحة — H §24).
    */
    'consistency' => [
        'points_per_attendance' => 1,
    ],

    /*
    | الموسم الافتراضي ربع سنوي يُنشأ تلقائياً لكل مجتمع (H §13).
    */
    'seasons' => [
        'auto_length' => 'quarterly',
    ],

    /*
    | نوعا القياس الوحيدان في الإصدار الأول.
    */
    'measurement_types' => [
        'individual_value',
        'consistency',
    ],

    /*
    | كتالوج وحدات القياس المركزي.
    */
    'units' => [
        'seconds' => [
            'label' => 'ثانية',
            'kind' => 'time',
            'direction' => 'lower_is_better',
            'precision' => 2,
        ],
        'minutes' => [
            'label' => 'دقيقة',
            'kind' => 'time',
            'direction' => 'lower_is_better',
            'precision' => 2,
        ],
        'hold_seconds' => [
            'label' => 'ثانية ثبات (الأطول أفضل)',
            'kind' => 'time',
            'direction' => 'higher_is_better',
            'precision' => 2,
        ],
        'meters' => [
            'label' => 'متر',
            'kind' => 'distance',
            'direction' => 'higher_is_better',
            'precision' => 2,
        ],
        'kilometers' => [
            'label' => 'كيلومتر',
            'kind' => 'distance',
            'direction' => 'higher_is_better',
            'precision' => 3,
        ],
        'count' => [
            'label' => 'عدد',
            'kind' => 'count',
            'direction' => 'higher_is_better',
            'precision' => 0,
        ],
        'repetitions' => [
            'label' => 'تكرار',
            'kind' => 'count',
            'direction' => 'higher_is_better',
            'precision' => 0,
        ],
        'points' => [
            'label' => 'نقطة',
            'kind' => 'count',
            'direction' => 'higher_is_better',
            'precision' => 0,
        ],
    ],
];
