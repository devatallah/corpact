<?php

/*
 * إعدادات آلة الفعاليات على مستوى المنصة (A7 — H §9/§10).
 *
 * H §10 ينص أن مهلة عرض مقعد قائمة الانتظار «قابلة للإعداد من أدمن تيمات على
 * مستوى المنصة فقط، لا من القالب». لا يوجد جدول إعدادات منصة بعد (واجهة إدارته
 * لـ A15) — القيم هنا config على مستوى المنصة، موثَّق في divergences.md.
 */
return [
    'waitlist' => [
        // مهلة تأكيد عرض المقعد الافتراضية (بالدقائق).
        'offer_minutes' => (int) env('EVENTS_WAITLIST_OFFER_MINUTES', 120),
        // تنخفض إلى هذه المهلة إذا تبقى أقل من near_close_hours على إغلاق التسجيل.
        'offer_minutes_near_close' => (int) env('EVENTS_WAITLIST_OFFER_MINUTES_NEAR_CLOSE', 30),
        'near_close_hours' => 6,
        // أقل من ساعة على الإغلاق: الترقية فورية — الأسبق يفوز بلا عرض.
        'instant_promotion_within_hours' => 1,
    ],

    // مهلة اعتماد اقتراح الموظف قبل الرفض التلقائي (H §7).
    'proposal_approval_hours' => 48,

    // مهلة رد المزوّد: 12 ساعة أو حتى 6 ساعات قبل الموعد أيهما أقرب (H §9).
    // القناة نفسها (روابط موقعة/الأسبق يفوز) عند A9.
    'provider_response_hours' => 12,
    'provider_response_min_hours_before_start' => 6,

    // مهلة رد منشئ الفعالية على البديل المقترح (H §9).
    'alternative_response_hours' => 12,

    // نافذة الانسحاب الحر بعد قبول الوقت البديل (H §9/§10).
    'alternative_free_withdrawal_hours' => 6,
];
