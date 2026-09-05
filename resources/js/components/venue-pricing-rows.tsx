import { FormGrid } from '@/components/portal/form';
import { Field, INPUT } from '@/components/portal/ui';
import TimeSelect from '@/components/time-select';

/** أيام الأسبوع بترتيب التقويم السعودي — الأحد أولاً (H §8). */
const DAYS = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
];

/**
 * صفوف تسعيرة الملعب: الفترة، والأيام، والمدة، والسعر.
 *
 * شاشتا إنشاء الملعب وتعديله تحرّران الشكل نفسه، وكانت الأولى تستورده من
 * الثانية. التسعيرة عقد مالي — اختلاف الحقول بين الشاشتين يعني سعرين.
 */
export type PricingDraft = {
    duration_minutes: string;
    price: string;
    is_peak: boolean;
    label: string;
    start_time: string;
    end_time: string;
    days: number[];
};

export const BLANK_PRICING: PricingDraft = {
    duration_minutes: '60',
    price: '',
    is_peak: false,
    label: '',
    start_time: '',
    end_time: '',
    days: [],
};

export function PricingRows({
    rows,
    errors,
    onChange,
}: {
    rows: PricingDraft[];
    errors: Record<string, string>;
    onChange: (rows: PricingDraft[]) => void;
}) {
    const update = (index: number, patch: Partial<PricingDraft>) => {
        onChange(
            rows.map((row, position) =>
                position === index ? { ...row, ...patch } : row,
            ),
        );
    };

    return (
        <div className="space-y-4">
            {rows.map((row, index) => (
                <div
                    key={index}
                    className="space-y-3 rounded-2xl border-[0.5px] border-ink/12 bg-page p-3.5"
                >
                    <FormGrid>
                        <Field
                            label="المدة"
                            error={errors[`pricings.${index}.duration_minutes`]}
                            required
                        >
                            <select
                                className={INPUT}
                                value={row.duration_minutes}
                                onChange={(event) =>
                                    update(index, {
                                        duration_minutes: event.target.value,
                                    })
                                }
                            >
                                <option value="60">60 دقيقة</option>
                                <option value="90">90 دقيقة</option>
                                <option value="120">120 دقيقة</option>
                            </select>
                        </Field>

                        <Field
                            label="السعر (شامل الضريبة)"
                            error={errors[`pricings.${index}.price`]}
                            required
                        >
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                dir="ltr"
                                className={INPUT}
                                value={row.price}
                                onChange={(event) =>
                                    update(index, { price: event.target.value })
                                }
                            />
                        </Field>

                        <Field
                            label="الوسم"
                            error={errors[`pricings.${index}.label`]}
                            hint="«سعر الصباح» مثلاً."
                        >
                            <input
                                className={INPUT}
                                value={row.label}
                                onChange={(event) =>
                                    update(index, { label: event.target.value })
                                }
                            />
                        </Field>

                        <Field
                            label="من الساعة"
                            error={errors[`pricings.${index}.start_time`]}
                        >
                            <TimeSelect
                                value={row.start_time}
                                onChange={(next) =>
                                    update(index, {
                                        start_time: next,
                                    })
                                }
                            />
                        </Field>

                        <Field
                            label="إلى الساعة"
                            error={errors[`pricings.${index}.end_time`]}
                        >
                            <TimeSelect
                                value={row.end_time}
                                onChange={(next) =>
                                    update(index, {
                                        end_time: next,
                                    })
                                }
                            />
                        </Field>
                    </FormGrid>

                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-ink/80">
                            <input
                                type="checkbox"
                                checked={row.is_peak}
                                onChange={(event) =>
                                    update(index, {
                                        is_peak: event.target.checked,
                                    })
                                }
                                className="h-4 w-4 rounded border-ink/25 accent-ink"
                            />
                            سعر ذروة
                        </label>

                        <div className="flex flex-wrap items-center gap-1">
                            <span className="me-1 text-[11px] text-ink/55">
                                الأيام:
                            </span>
                            {DAYS.map((day, dayIndex) => {
                                const on = row.days.includes(dayIndex);

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() =>
                                            update(index, {
                                                days: on
                                                    ? row.days.filter(
                                                          (value) =>
                                                              value !==
                                                              dayIndex,
                                                      )
                                                    : [...row.days, dayIndex],
                                            })
                                        }
                                        className={`rounded-full border-[0.5px] px-2 py-1 text-[10px] font-bold transition-colors ${
                                            on
                                                ? 'border-ink bg-ink text-lime'
                                                : 'border-ink/15 bg-surface text-ink/60 hover:border-ink/35'
                                        }`}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                );
                            })}
                            {row.days.length === 0 && (
                                <span className="ms-1 text-[10px] text-ink/45">
                                    كل الأيام
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
