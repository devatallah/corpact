<?php

namespace App\Support\Competition;

/**
 * كتالوج وحدات القياس المركزي (H §13 — `config/results.php`).
 *
 * الإصدار الأول يدعم نوعين فقط من القياس، و«القيمة الفردية» تُدخل دائماً
 * بوحدة **من هذه القائمة** لا بنص حر — وإلا صارت اللوحة غير قابلة للترتيب.
 * اتجاه الأفضلية جزء من تعريف الوحدة: الزمن الأقل أفضل، والمسافة والعدد
 * الأكثر أفضل.
 */
class MeasurementUnits
{
    public const LOWER_IS_BETTER = 'lower_is_better';

    public const HIGHER_IS_BETTER = 'higher_is_better';

    /**
     * @return array<string, array{label: string, kind: string, direction: string, precision: int}>
     */
    public static function all(): array
    {
        /** @var array<string, array{label: string, kind: string, direction: string, precision: int}> */
        return config('results.units', []);
    }

    /**
     * @return array<int, string>
     */
    public static function keys(): array
    {
        return array_keys(self::all());
    }

    public static function exists(?string $unit): bool
    {
        return $unit !== null && array_key_exists($unit, self::all());
    }

    /**
     * @return array{label: string, kind: string, direction: string, precision: int}|null
     */
    public static function get(?string $unit): ?array
    {
        return self::all()[$unit] ?? null;
    }

    public static function label(?string $unit): string
    {
        return self::get($unit)['label'] ?? (string) $unit;
    }

    public static function direction(?string $unit): string
    {
        return self::get($unit)['direction'] ?? self::HIGHER_IS_BETTER;
    }

    public static function lowerIsBetter(?string $unit): bool
    {
        return self::direction($unit) === self::LOWER_IS_BETTER;
    }

    public static function precision(?string $unit): int
    {
        return (int) (self::get($unit)['precision'] ?? 2);
    }

    public static function format(?string $unit, float $value): string
    {
        return number_format($value, self::precision($unit), '.', '').' '.self::label($unit);
    }

    /**
     * الكتالوج بصيغة قوائم للواجهة.
     *
     * @return array<int, array{key: string, label: string, kind: string, direction: string, precision: int}>
     */
    public static function forUi(): array
    {
        $out = [];

        foreach (self::all() as $key => $unit) {
            $out[] = [
                'key' => $key,
                'label' => $unit['label'],
                'kind' => $unit['kind'],
                'direction' => $unit['direction'],
                'precision' => (int) $unit['precision'],
            ];
        }

        return $out;
    }
}
