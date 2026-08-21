<?php

use App\Models\Company;
use App\Support\Lists\ListSort;

/**
 * H §18 — «كل قائمة: بحث + فلترة + **ترتيب** + ترقيم صفحات».
 *
 * الترتيب هو المكان الذي يغري فيه الاختصار بتمرير اسم عمود من الطلب إلى
 * `orderBy`/`orderByRaw`. هذه الحزمة تثبت أن ذلك **مستحيل** عبر البوابة
 * المشتركة: القيمة القادمة من المستخدم مفتاح في قائمة بيضاء، لا نصّ SQL.
 */
function listSortFixture(): ListSort
{
    return ListSort::make([
        'name' => 'name',
        'created_at' => 'created_at',
        'status' => 'status',
    ], 'created_at', ListSort::DESC, 'id');
}

// ── القائمة البيضاء ───────────────────────────────────────────────────────

test('a key outside the allow-list falls back to the default instead of reaching SQL', function (string $attack) {
    $sort = listSortFixture();

    expect($sort->allows($attack))->toBeFalse()
        ->and($sort->key($attack))->toBe('created_at');

    $sql = $sort->apply(Company::query(), $attack)->toSql();

    expect($sql)->toContain('order by')
        ->and($sql)->toContain('created_at')
        // لا جزء من نص الهجوم يظهر في الاستعلام.
        ->and(strtolower($sql))->not->toContain('password')
        ->and($sql)->not->toContain('--')
        ->and($sql)->not->toContain(';')
        ->and($sql)->not->toContain('(select');
})->with([
    'عمود غير معلن' => 'password',
    'عمود من جدول آخر' => 'users.remember_token',
    'حقن كلاسيكي' => "name'; drop table companies; --",
    'استعلام فرعي' => '(select 1)',
    'تعليق SQL' => 'name -- ',
    'فراغ' => '',
    'مسافات' => '   ',
]);

test('an unknown key is silently ignored — no error, no leak', function () {
    $sort = listSortFixture();

    expect($sort->state('activation_token'))->toBe([
        'key' => 'created_at',
        'direction' => 'desc',
    ]);
});

test('only the declared keys are sortable', function () {
    expect(listSortFixture()->keys())->toBe(['name', 'created_at', 'status']);
});

test('an allow-listed key really is applied', function () {
    $sql = listSortFixture()->apply(Company::query(), 'name', 'asc')->toSql();

    expect($sql)->toContain('order by "name" asc')
        ->and($sql)->toContain('"id" asc');
});

// ── حارس التعريف نفسه — حتى خطأ المبرمج لا يفتح ثغرة ──────────────────────

test('a column expression that is not a plain identifier is refused at construction', function (mixed $expression) {
    expect(fn () => ListSort::make(['x' => $expression], 'x'))
        ->toThrow(InvalidArgumentException::class);
})->with([
    'حقن' => "name'; drop table companies; --",
    'استعلام فرعي' => '(select 1)',
    'تعبير مركّب' => 'COALESCE(a, b)',
    'أعمدة مفصولة بفاصلة' => 'name, id',
    'اتجاه ملحق' => 'name desc',
    'فراغ' => '',
    'ليس نصاً' => 1,
]);

test('the tiebreaker is guarded the same way', function () {
    expect(fn () => ListSort::make(['name' => 'name'], 'name', ListSort::ASC, 'id); drop table companies; --'))
        ->toThrow(InvalidArgumentException::class);
});

test('a default key outside the allow-list is a programming error, not a fallback', function () {
    expect(fn () => ListSort::make(['name' => 'name'], 'created_at'))
        ->toThrow(InvalidArgumentException::class);
});

test('an empty allow-list is refused', function () {
    expect(fn () => ListSort::make([], null))->toThrow(InvalidArgumentException::class);
});

// ── الاتجاه ───────────────────────────────────────────────────────────────

test('the direction accepts only asc and desc', function (?string $given, string $expected) {
    expect(listSortFixture()->direction('name', $given))->toBe($expected);
})->with([
    'تصاعدي' => ['asc', 'asc'],
    'تنازلي' => ['desc', 'desc'],
    'حالة أحرف مختلطة' => ['AsC', 'asc'],
    'بمسافات' => [' desc ', 'desc'],
    'حقن' => ['asc; drop table companies', 'desc'],
    'فارغ' => ['', 'desc'],
    'غائب' => [null, 'desc'],
]);

test('the five pre-existing screens that send ?sort=asc as a direction still work', function () {
    // سجل تدقيق الأدمن والشركة · الأحداث الأمنية · مراجعة الصلاحيات · فواتير
    // الشركة كانت تستعمل `sort` اتجاهاً لا عموداً — الرابط المحفوظ يبقى عاملاً.
    $sort = listSortFixture();

    expect($sort->state('asc'))->toBe(['key' => 'created_at', 'direction' => 'asc'])
        ->and($sort->state('desc'))->toBe(['key' => 'created_at', 'direction' => 'desc']);
});

test('an explicit dir wins over the legacy direction-in-sort form', function () {
    expect(listSortFixture()->direction('asc', 'desc'))->toBe('desc');
});

// ── ترتيب في الذاكرة (القوائم المشتقّة من تجميع) ──────────────────────────

test('in-memory row sorting honours the same allow-list', function () {
    $sort = ListSort::make(['name' => 'name', 'count' => 'count'], 'count', ListSort::DESC);

    $rows = [
        ['name' => 'ب', 'count' => 2],
        ['name' => 'أ', 'count' => 9],
        ['name' => 'ج', 'count' => 5],
    ];

    expect(array_column($sort->sortRows($rows, 'count'), 'count'))->toBe([9, 5, 2])
        ->and(array_column($sort->sortRows($rows, 'count', 'asc'), 'count'))->toBe([2, 5, 9])
        // مفتاح مجهول ⟶ الافتراضي، لا ترتيب عشوائي.
        ->and(array_column($sort->sortRows($rows, 'secret_column'), 'count'))->toBe([9, 5, 2]);
});

// ── قيم غير نصّية من الطلب — لا TypeError ولا 500 ─────────────────────────

test('a non-string sort or direction is ignored, never a fatal type error', function (mixed $sort, mixed $dir) {
    // `?sort[]=x` يصل مصفوفةً، و`?sort=1` قد يصل رقماً حسب المُحلِّل — توقيع
    // `?string` كان سيسقط الصفحة بـ500 على رابط عابث.
    $listSort = listSortFixture();

    expect($listSort->state($sort, $dir))->toBe(['key' => 'created_at', 'direction' => 'desc'])
        ->and($listSort->allows($sort))->toBeFalse();

    expect($listSort->apply(Company::query(), $sort, $dir)->toSql())->toContain('created_at');
})->with([
    'مصفوفة' => [['name'], ['asc']],
    'رقم' => [7, 7],
    'منطقي' => [true, false],
    'عدم' => [null, null],
    'كائن' => [new stdClass, new stdClass],
]);
