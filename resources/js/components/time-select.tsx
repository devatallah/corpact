import { INPUT } from '@/components/portal/ui';

/**
 * منتقي وقت من ثلاث قوائم: الساعة (01–12)، الدقيقة (00/30)، ثم ص/م.
 *
 * منتقي المتصفح الأصلي يعطي القوائم نفسها، لكن شكله ولغته وحتى نظام ساعته
 * تتبع المتصفح ونظام التشغيل: نفس الحقل يظهر بثلاث هيئات على ثلاثة أجهزة،
 * وبنظام 24 ساعة على بعضها. القوائم هنا مرسومة في الصفحة، فما يراه منشئ
 * الفعالية واحد أينما فتحها.
 *
 * القيمة تبقى `HH:mm` بنظام 24 ساعة — لا يتغيّر شيء خلف الحقل: `12 ص` تعني
 * منتصف الليل `00`، و`12 م` تعني الظهر `12`.
 *
 * ونصف الساعة ليس ذوقاً: المرافق تُعرض بنوافذ عمل وتُباع بمدد 60 و90 دقيقة،
 * فبداية على 19:17 لا تقابل شيئاً في الجدول.
 */
const HOURS = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0'),
);
const MINUTES = ['00', '30'];

/**
 * الدقائق المعروضة، ومعها الدقيقة المخزَّنة إن كانت خارج الشبكة.
 *
 * قيمة قديمة مثل `19:15` لا تقابل خياراً، فتظهر القائمة فارغة ويُحفظ النموذج
 * على وقت غير الذي فُتح عليه — تلفٌ صامت لبيانات لم يطلب أحد تغييرها. تُضاف
 * القيمة الشاذّة خياراً حتى تُرى وتُحفظ كما هي، ما لم يغيّرها صاحبها.
 */
function minuteOptions(current: string): string[] {
    return current === '' || MINUTES.includes(current)
        ? MINUTES
        : [...MINUTES, current].sort();
}

/** `HH:mm` (24س) ← أجزاء العرض. */
function toParts(value: string): {
    hour: string;
    minute: string;
    meridiem: '' | 'am' | 'pm';
} {
    const match = /^(\d{2}):(\d{2})/.exec(value);

    if (match === null) {
        return { hour: '', minute: '', meridiem: '' };
    }

    const hour24 = Number(match[1]);
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

    return {
        hour: String(hour12).padStart(2, '0'),
        minute: match[2],
        meridiem: hour24 < 12 ? 'am' : 'pm',
    };
}

/** أجزاء العرض ← `HH:mm`؛ وفراغٌ ما لم تكتمل الثلاثة. */
function toValue(hour: string, minute: string, meridiem: string): string {
    if (hour === '' || minute === '' || meridiem === '') {
        return '';
    }

    const hour12 = Number(hour) % 12;
    const hour24 = meridiem === 'pm' ? hour12 + 12 : hour12;

    return `${String(hour24).padStart(2, '0')}:${minute}`;
}

export default function TimeSelect({
    value,
    onChange,
    id,
    required,
    className = '',
}: {
    /** `HH:mm` بنظام 24 ساعة، أو فراغ. */
    value: string;
    onChange: (next: string) => void;
    id?: string;
    required?: boolean;
    className?: string;
}) {
    const parts = toParts(value);

    /*
     * الأجزاء تُشتق من القيمة في كل رسم، ولا تُحفظ في حالة موازية: حالةٌ
     * ثانية بجانب `value` تفترق عنها عند إعادة التعيين من الأب فتعرض وقتاً
     * غير الذي سيُرسَل.
     *
     * وثمنها أن الاختيار الجزئي لا يُحفظ — ولذلك تبدأ الدقيقة من «00» وص/م
     * من «ص» بمجرد اختيار ساعة: الحقل يصير قيمةً كاملة من أول قائمة، ثم
     * يُعدَّل، بدل أن يبتلع اختياراً لا يظهر أثره.
     */
    const set = (
        next: Partial<{ hour: string; minute: string; meridiem: string }>,
    ) => {
        const hour = next.hour ?? parts.hour;
        const minute = next.minute ?? (parts.minute || '00');
        const meridiem = next.meridiem ?? (parts.meridiem || 'am');

        onChange(hour === '' ? '' : toValue(hour, minute, meridiem));
    };

    const select = `${INPUT} cursor-pointer text-center font-mono`;

    return (
        <div
            className={`flex items-center gap-1.5 ${className}`.trim()}
            dir="ltr"
        >
            <select
                id={id}
                aria-label="الساعة"
                required={required}
                className={select}
                value={parts.hour}
                onChange={(event) => set({ hour: event.target.value })}
            >
                <option value="">--</option>
                {HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                        {hour}
                    </option>
                ))}
            </select>

            <span
                aria-hidden="true"
                className="font-mono text-sm font-black text-ink/40"
            >
                :
            </span>

            <select
                aria-label="الدقيقة"
                className={select}
                value={parts.minute}
                onChange={(event) => set({ minute: event.target.value })}
            >
                <option value="">--</option>
                {minuteOptions(parts.minute).map((minute) => (
                    <option key={minute} value={minute}>
                        {minute}
                    </option>
                ))}
            </select>

            <select
                aria-label="صباحاً أو مساءً"
                className={select}
                value={parts.meridiem}
                onChange={(event) => set({ meridiem: event.target.value })}
            >
                <option value="">--</option>
                <option value="am">ص</option>
                <option value="pm">م</option>
            </select>
        </div>
    );
}
