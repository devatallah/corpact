<?php

namespace App\Services\Events;

/**
 * خريطة ترحيل حالات الفعاليات القديمة (ما قبل A7) إلى حالات آلة H §9.
 *
 * تستخدمها migration الترحيل (2026_08_20_700001) ويثبتها اختبار
 * tests/Feature/Events/LegacyStatusMigrationTest.php:
 *
 * - open                 → open                (كما هي)
 * - full                 → open + is_full=1    («الامتلاء» عَلَم لا حالة — H §9 قاعدة 3)
 * - waiting_business     → pending_provider    (طلب مُرسَل للمزوّد بانتظار رده)
 * - waiting_partner      → pending_provider
 * - alternative_proposed → provider_alternative
 * - confirmed            → confirmed
 * - in_progress          → in_progress
 * - rejected             → cancelled_provider  (الرفض القديم كان رفض المزوّد أو
 *                          رفض المنشئ للبديل — كلاهما cancelled_provider في §9)
 * - completed            → completed
 * - cancelled            → cancelled_payment_failed إذا كان سبب الإلغاء انتهاء
 *                          «مهلة الدفع» القديمة، وإلا cancelled_company (الإلغاء
 *                          القديم كان دائماً قرار منشئ/شركة/أدمن)
 */
class LegacyStatusMap
{
    /** @var array<string, string> */
    public const MAP = [
        'open' => 'open',
        'full' => 'open',
        'waiting_business' => 'pending_provider',
        'waiting_partner' => 'pending_provider',
        'alternative_proposed' => 'provider_alternative',
        'confirmed' => 'confirmed',
        'in_progress' => 'in_progress',
        'rejected' => 'cancelled_provider',
        'completed' => 'completed',
        'cancelled' => 'cancelled_company',
    ];

    /**
     * جملة إلغاء «مهلة الدفع» القديمة — صفوف cancelled التي تحملها تُرحَّل إلى
     * cancelled_payment_failed بدل cancelled_company.
     */
    public const PAYMENT_EXPIRY_MARKER = 'مهلة الدفع';
}
