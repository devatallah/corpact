<?php

namespace App\Support\Lists;

use InvalidArgumentException;

/**
 * H §18 — «كل قائمة: بحث + فلترة + **ترتيب** + ترقيم صفحات (20 عنصراً)».
 *
 * الترتيب هو الفجوة الوحيدة التي كانت غائبة عن القوائم كلها، وبناؤها ٢٣ مرة
 * يدوياً يعني ٢٣ فرصة لتمرير اسم عمود قادم من المستخدم إلى SQL. هذه الفئة هي
 * البوابة الوحيدة: المتحكّم يُعلن **قائمة بيضاء** من مفاتيح الترتيب المسموحة
 * وما يقابلها من أعمدة حقيقية، والطلب لا يفعل أكثر من **اختيار مفتاح** منها.
 *
 * الضمانات الأمنية:
 *
 * 1. قيمة `sort` القادمة من المستخدم تُستعمل **مفتاح مصفوفة فقط** — لا تُدمج
 *    في نص SQL ولا تُمرَّر إلى `orderByRaw`. مفتاح غير معروف ⟶ الترتيب
 *    الافتراضي، بلا خطأ وبلا تسريب.
 * 2. تعبيرات الأعمدة نفسها تُتحقَّق **عند الإنشاء** ضد نمط معرّف SQL بسيط،
 *    فحتى خطأ مبرمج لا يفتح ثغرة حقن.
 * 3. `dir` تُقارن مقارنة صارمة بـ`asc`/`desc` وأي شيء آخر يسقط للافتراضي.
 *    والمَعلمان `mixed` عمداً: `?sort[]=x` يصل مصفوفةً، ولو كان التوقيع
 *    `?string` لأسقط الصفحة بـ`TypeError` — خطأ 500 يصنعه رابط عابث.
 * 4. العمود الذي لا يراه صاحب الشاشة لا يُسجَّل أصلاً في القائمة البيضاء —
 *    فالترتيب لا يوسّع ما يستطيع المستخدم قراءته أو استنتاجه.
 */
final class ListSort
{
    public const ASC = 'asc';

    public const DESC = 'desc';

    /**
     * معرّف SQL بسيط: `column` أو `table.column` أو اسم تجميع (`members_count`).
     * لا مسافات، لا أقواس، لا فواصل — فلا مكان لتعبير مركّب.
     */
    private const IDENTIFIER = '/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)?$/';

    /**
     * @param  array<string, list<string>>  $columns
     * @param  list<string>  $tiebreakers
     */
    private function __construct(
        private readonly array $columns,
        private readonly string $defaultKey,
        private readonly string $defaultDirection,
        private readonly array $tiebreakers,
    ) {}

    /**
     * @param  array<string, string|list<string>>  $columns  مفتاح الطلب ⟶ العمود الحقيقي (أو أعمدة متتابعة)
     * @param  string|null  $default  مفتاح الترتيب الافتراضي؛ أول مفتاح إن أُهمل
     * @param  string  $direction  اتجاه افتراضي — عادةً `desc` (الأحدث أولاً)
     * @param  string|list<string>  $tiebreakers  عمود قاطع للتعادل يضمن ترتيباً مستقراً عبر الصفحات
     */
    public static function make(
        array $columns,
        ?string $default = null,
        string $direction = self::DESC,
        string|array $tiebreakers = [],
    ): self {
        if ($columns === []) {
            throw new InvalidArgumentException('ListSort needs at least one sortable column.');
        }

        $normalised = [];

        foreach ($columns as $key => $expression) {
            if (! is_string($key) || $key === '') {
                throw new InvalidArgumentException('A sortable column key must be a non-empty string.');
            }

            $normalised[$key] = self::guard(is_array($expression) ? $expression : [$expression]);
        }

        $defaultKey = $default ?? array_key_first($normalised);

        if (! array_key_exists($defaultKey, $normalised)) {
            throw new InvalidArgumentException("Default sort key [{$defaultKey}] is not in the allow-list.");
        }

        return new self(
            $normalised,
            $defaultKey,
            self::normaliseDirection($direction) ?? self::DESC,
            self::guard(is_array($tiebreakers) ? $tiebreakers : [$tiebreakers]),
        );
    }

    /**
     * مفتاح الترتيب الفعلي — من القائمة البيضاء وحدها.
     */
    public function key(mixed $requested): string
    {
        if (is_string($requested) && array_key_exists($requested, $this->columns)) {
            return $requested;
        }

        return $this->defaultKey;
    }

    /**
     * الاتجاه الفعلي.
     *
     * توافق للخلف: خمس شاشات سبقت هذه الموجة تستعمل `?sort=asc|desc` اتجاهاً
     * لا عموداً (سجل التدقيق للأدمن والشركة · الأحداث الأمنية · مراجعة
     * الصلاحيات · فواتير الشركة)، فالرابط المحفوظ منها يبقى عاملاً.
     */
    public function direction(mixed $sort, mixed $dir = null): string
    {
        $explicit = self::normaliseDirection($dir);

        if ($explicit !== null) {
            return $explicit;
        }

        if (is_string($sort) && ! array_key_exists($sort, $this->columns)) {
            $legacy = self::normaliseDirection($sort);

            if ($legacy !== null) {
                return $legacy;
            }
        }

        return $this->defaultDirection;
    }

    /**
     * يطبّق `ORDER BY` على أي بانٍ (Eloquent أو Query أو علاقة).
     *
     * @template TQuery of object
     *
     * @param  TQuery  $query
     * @return TQuery
     */
    public function apply(object $query, mixed $sort, mixed $dir = null): object
    {
        $key = $this->key($sort);
        $direction = $this->direction($sort, $dir);

        foreach ($this->columns[$key] as $column) {
            $query->orderBy($column, $direction);
        }

        foreach ($this->tiebreakers as $tiebreaker) {
            if (! in_array($tiebreaker, $this->columns[$key], true)) {
                $query->orderBy($tiebreaker, $direction);
            }
        }

        return $query;
    }

    /**
     * ترتيب مصفوفة محسوبة في الذاكرة — للقوائم المشتقّة من تجميع لا من استعلام.
     *
     * @param  list<array<string, mixed>>  $rows
     * @return list<array<string, mixed>>
     */
    public function sortRows(array $rows, mixed $sort, mixed $dir = null): array
    {
        $key = $this->key($sort);
        $descending = $this->direction($sort, $dir) === self::DESC;
        $fields = $this->columns[$key];

        usort($rows, function (array $a, array $b) use ($fields, $descending) {
            foreach ($fields as $field) {
                $comparison = self::compare($a[$field] ?? null, $b[$field] ?? null);

                if ($comparison !== 0) {
                    return $descending ? -$comparison : $comparison;
                }
            }

            return 0;
        });

        return $rows;
    }

    /**
     * الحمولة التي تصل الواجهة: المفتاح النشط واتجاهه — ما يجعل الترتيب مرئياً.
     *
     * @return array{key: string, direction: string}
     */
    public function state(mixed $sort, mixed $dir = null): array
    {
        return [
            'key' => $this->key($sort),
            'direction' => $this->direction($sort, $dir),
        ];
    }

    /**
     * المفاتيح المسموحة — للتحقق في `FormRequest` أو للاختبارات.
     *
     * @return list<string>
     */
    public function keys(): array
    {
        return array_keys($this->columns);
    }

    public function allows(mixed $key): bool
    {
        return is_string($key) && array_key_exists($key, $this->columns);
    }

    /**
     * @param  list<string>  $expressions
     * @return list<string>
     */
    private static function guard(array $expressions): array
    {
        foreach ($expressions as $expression) {
            if (! is_string($expression) || preg_match(self::IDENTIFIER, $expression) !== 1) {
                throw new InvalidArgumentException(
                    'Sortable columns must be plain SQL identifiers; got ['.(is_string($expression) ? $expression : gettype($expression)).'].'
                );
            }
        }

        return array_values($expressions);
    }

    private static function normaliseDirection(mixed $direction): ?string
    {
        if (! is_string($direction)) {
            return null;
        }

        $lowered = strtolower(trim($direction));

        return match ($lowered) {
            self::ASC => self::ASC,
            self::DESC => self::DESC,
            default => null,
        };
    }

    private static function compare(mixed $a, mixed $b): int
    {
        if (is_string($a) && is_string($b)) {
            return strcmp($a, $b);
        }

        return $a <=> $b;
    }
}
