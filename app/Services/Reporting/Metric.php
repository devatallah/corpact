<?php

namespace App\Services\Reporting;

/**
 * A13 — نتيجة مؤشر واحد من قاموس المؤشرات (H §15).
 *
 * كل مؤشر يعود بـ**البسط والمقام والنسبة معاً** لا بالنسبة وحدها: «12 من 40»
 * قابلة للتدقيق، و«30%» ليست كذلك — وقاعدة القسمة على صفر تُحسم في موضع واحد
 * (المقام صفر ⇒ النسبة 0.0 لا خطأ ولا `null`).
 */
final class Metric
{
    public function __construct(
        public readonly string $key,
        public readonly string $label,
        public readonly int $numerator,
        public readonly int $denominator,
        /** وصف البسط والمقام بالعربية — يظهر تحت البطاقة كي لا يُقرأ المؤشر خطأ. */
        public readonly string $formula,
    ) {}

    /**
     * النسبة المئوية بمنزلة عشرية واحدة؛ المقام صفر ⇒ 0.0.
     */
    public function rate(): float
    {
        return $this->denominator === 0
            ? 0.0
            : round(($this->numerator / $this->denominator) * 100, 1);
    }

    /**
     * @return array{key: string, label: string, numerator: int, denominator: int, rate: float, formula: string}
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'numerator' => $this->numerator,
            'denominator' => $this->denominator,
            'rate' => $this->rate(),
            'formula' => $this->formula,
        ];
    }
}
