import { router } from '@inertiajs/react';

/**
 * H §18 — «كل قائمة: بحث + فلترة + **ترتيب** + ترقيم صفحات».
 *
 * رأس عمود قابل للفرز، مشترك بين البوابات الأربع. يتبع اتفاقية
 * `use-debounced-search` نفسها: `router.get` مع `preserveState` و`replace`،
 * مع الحفاظ على بقية معاملات الرابط (بحث وفلاتر) وإعادة `page` إلى الأولى —
 * لأن الصفحة الثالثة من ترتيب قديم لا معنى لها بعد تغيير الترتيب.
 *
 * المفتاح المرسل (`sort`) ليس اسم عمود بل **مفتاح من قائمة بيضاء** يقابله
 * عمودٌ حقيقي معرّف في الخادم — انظر {@link \App\Support\Lists\ListSort}.
 *
 * RTL: الجدول كله `text-align:right`، والسهم يوضع **بعد** النص في ترتيب
 * الـDOM فيظهر يساره بصرياً، وهو موضعه الطبيعي في واجهة عربية. السهمان
 * رأسيان (▲/▼) فلا ينقلبان مع اتجاه الكتابة.
 */

export interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}

type Direction = 'asc' | 'desc';

/**
 * ينتقل إلى ترتيب جديد مع الحفاظ على البحث والفلاتر القائمة.
 */
export function applySort(key: string, direction: Direction) {
    const url = new URL(window.location.href);
    const params: Record<string, string> = {};

    url.searchParams.forEach((value, name) => {
        // `page` تسقط عمداً: الترتيب الجديد يبدأ من الصفحة الأولى.
        if (name !== 'sort' && name !== 'dir' && name !== 'page') {
            params[name] = value;
        }
    });

    router.get(
        window.location.pathname,
        { ...params, sort: key, dir: direction },
        { preserveState: true, replace: true },
    );
}

const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'none',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    textAlign: 'inherit' as React.CSSProperties['textAlign'],
};

export default function SortableHeader({
    label,
    sortKey,
    sort,
    initialDirection = 'asc',
    style,
    title,
}: {
    label: string;
    /** مفتاح من القائمة البيضاء في الخادم. */
    sortKey: string;
    /** الترتيب النشط القادم من الخادم. */
    sort?: SortState | null;
    /** اتجاه أول نقرة — `desc` للتواريخ والأرقام، `asc` للنصوص. */
    initialDirection?: Direction;
    style?: React.CSSProperties;
    title?: string;
}) {
    const active = sort?.key === sortKey;
    const direction: Direction | null = active ? (sort?.direction === 'asc' ? 'asc' : 'desc') : null;
    const next: Direction = active ? (direction === 'asc' ? 'desc' : 'asc') : initialDirection;

    const hint = active
        ? direction === 'asc'
            ? 'مرتَّب تصاعدياً — اضغط للتنازلي'
            : 'مرتَّب تنازلياً — اضغط للتصاعدي'
        : 'اضغط للترتيب بهذا العمود';

    return (
        <th
            aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
            style={{ whiteSpace: 'nowrap', ...style }}
        >
            <button type="button" onClick={() => applySort(sortKey, next)} style={buttonStyle} title={title ?? hint}>
                <span style={active ? { textDecoration: 'underline', textUnderlineOffset: 3 } : undefined}>{label}</span>
                <span aria-hidden style={{ fontSize: 9, opacity: active ? 1 : 0.4, lineHeight: 1 }}>
                    {active ? (direction === 'asc' ? '▲' : '▼') : '⇅'}
                </span>
                <span className="sr-only">{hint}</span>
            </button>
        </th>
    );
}

/**
 * بديل الرأس القابل للفرز حين لا يكون العنصر جدولاً — بطاقات الجوال في شاشات
 * الموظف مثلاً: شريط أزرار صغير يعرض الترتيب النشط ويبدّله.
 */
export function SortBar({
    options,
    sort,
    label = 'الترتيب',
}: {
    options: { key: string; label: string; initialDirection?: Direction }[];
    sort?: SortState | null;
    label?: string;
}) {
    return (
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4 }}>{label}:</span>
            {options.map((option) => {
                const active = sort?.key === option.key;
                const direction: Direction = active ? (sort?.direction === 'asc' ? 'asc' : 'desc') : (option.initialDirection ?? 'asc');
                const next: Direction = active ? (direction === 'asc' ? 'desc' : 'asc') : direction;

                return (
                    <button
                        key={option.key}
                        type="button"
                        className={`fbtn${active ? ' on' : ''}`}
                        aria-pressed={active}
                        onClick={() => applySort(option.key, next)}
                    >
                        {option.label}
                        {active ? ` ${direction === 'asc' ? '▲' : '▼'}` : ''}
                    </button>
                );
            })}
        </div>
    );
}
