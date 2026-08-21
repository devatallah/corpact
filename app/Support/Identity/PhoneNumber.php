<?php

namespace App\Support\Identity;

/**
 * Canonical phone form used as the global-account dedup key (H §3/§4:
 * the same phone under a second company is the SAME user, never a
 * duplicate account). Saudi numbers normalize to `9665XXXXXXXX`.
 */
class PhoneNumber
{
    public static function normalize(?string $phone): ?string
    {
        if ($phone === null || trim($phone) === '') {
            return null;
        }

        // Convert Arabic-Indic digits, then strip everything but digits.
        $digits = strtr($phone, [
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);
        $digits = preg_replace('/\D+/', '', $digits) ?? '';

        if ($digits === '') {
            return null;
        }

        // International prefix written as 00…
        $digits = preg_replace('/^0{2,}(?=966)/', '', $digits) ?? $digits;

        if (str_starts_with($digits, '05') && strlen($digits) === 10) {
            return '966'.substr($digits, 1);
        }

        if (str_starts_with($digits, '5') && strlen($digits) === 9) {
            return '966'.$digits;
        }

        return $digits;
    }

    /**
     * Local display form (05XXXXXXXX) when the number is Saudi.
     */
    public static function display(?string $phone): ?string
    {
        $normalized = self::normalize($phone);

        if ($normalized === null) {
            return null;
        }

        if (str_starts_with($normalized, '9665') && strlen($normalized) === 12) {
            return '0'.substr($normalized, 3);
        }

        return $normalized;
    }
}
