<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * A10 — قواعد المال الحسابية (H §12.1):
 *
 * - العملة ريال سعودي فقط، والمبالغ تُخزَّن أعداداً صحيحة بالهللة — لا float
 *   في أي حساب مالي. التحويل من/إلى الريال يقع حصراً على حدود العرض
 *   والإدخال.
 * - كل الأسعار شاملة ضريبة القيمة المضافة 15% وتُفكَّك إلى base_amount
 *   و vat_amount.
 * - «منزلتان عشريتان بلا تقريب لأعلى»: القسمة الصحيحة (floor) في كل موضع،
 *   وفرق الكسور يُحمَّل على جانب عمولة تيمات (بند معلّق H §24 — موثَّق في
 *   divergences.md).
 */
final class Money
{
    public const CURRENCY = 'SAR';

    /** نسبة ضريبة القيمة المضافة (H §12.1). */
    public const VAT_RATE_PERCENT = 15;

    private function __construct() {}

    /**
     * تحويل مبلغ ريالات (إدخال مستخدم/عمود قديم) إلى هللات صحيحة.
     * يُستخدم على الحدود فقط — الحساب الداخلي كله هللات.
     */
    public static function toHalalas(float|int|string $sar): int
    {
        return (int) round(((float) $sar) * 100);
    }

    /**
     * قيمة العرض بالريال بصيغة منزلتين ("33.33") — عرض فقط، لا حساب عليها.
     */
    public static function format(int $halalas): string
    {
        $sign = $halalas < 0 ? '-' : '';
        $abs = abs($halalas);

        return $sign.intdiv($abs, 100).'.'.str_pad((string) ($abs % 100), 2, '0', STR_PAD_LEFT);
    }

    /**
     * تفكيك مبلغ شامل الضريبة إلى أساس + ضريبة (15%) بالهللة:
     * الأساس = floor(الإجمالي × 100 ÷ 115) — بلا تقريب لأعلى — والضريبة
     * الباقي، فيجمعان دائماً إلى الإجمالي بالهللة.
     *
     * @return array{base: int, vat: int}
     */
    public static function decomposeVat(int $grossHalalas): array
    {
        if ($grossHalalas < 0) {
            throw new InvalidArgumentException('لا يُفكَّك مبلغ سالب.');
        }

        $base = intdiv($grossHalalas * 100, 100 + self::VAT_RATE_PERCENT);

        return ['base' => $base, 'vat' => $grossHalalas - $base];
    }

    /**
     * قسمة حصص بلا تقريب لأعلى: الحصة = floor(المبلغ ÷ العدد) والباقي
     * (فرق الكسور) يُعاد ليُحمَّل على جانب عمولة تيمات.
     *
     * @return array{share: int, remainder: int}
     */
    public static function splitShare(int $amountHalalas, int $count): array
    {
        if ($count < 1) {
            throw new InvalidArgumentException('عدد الحصص يجب أن يكون 1 على الأقل.');
        }

        $share = intdiv($amountHalalas, $count);

        return ['share' => $share, 'remainder' => $amountHalalas - ($share * $count)];
    }
}
