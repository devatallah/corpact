import { Head, useForm } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { FormActions, FormSection } from '@/components/portal/form';
import {
    Button,
    Card,
    Field,
    INPUT,
    Note,
    PageHeader,
} from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §10 — بطولة إدارات جديدة.
 *
 * Knockout needs a power-of-two field — 2, 4, 8 or 16 — otherwise the bracket
 * has a hole in it. The server enforces that, but discovering it only on
 * submit means re-picking departments after the fact, so the rule is checked
 * live and the picker says how many more (or fewer) are needed.
 */
const FORMATS: [string, string, string][] = [
    [
        'single_round_robin',
        'دوري من دور واحد',
        'كل إدارة تلاقي كل إدارة مرة واحدة.',
    ],
    [
        'double_round_robin',
        'دوري من دورين',
        'كل إدارة تلاقي كل إدارة مرتين — ذهاباً وإياباً.',
    ],
    [
        'knockout',
        'خروج المغلوب',
        'الخاسر يخرج. يتطلّب عدداً من الإدارات من قوى العدد اثنين: 2 أو 4 أو 8 أو 16.',
    ],
];

const isPowerOfTwo = (count: number) =>
    count >= 2 && (count & (count - 1)) === 0;

export default function EmployeeLeagueCreate({
    community,
    departments,
}: {
    community: {
        id: number;
        name: string;
        category?: { id: number; name: string } | null;
    };
    departments: { id: number; name: string }[];
}) {
    const form = useForm<{
        name: string;
        format: string;
        department_ids: number[];
    }>({
        name: '',
        format: 'single_round_robin',
        department_ids: [],
    });

    const picked = form.data.department_ids.length;
    const knockout = form.data.format === 'knockout';
    const bracketOk = !knockout || isPowerOfTwo(picked);
    const nextPower = [2, 4, 8, 16].find((size) => size >= picked) ?? 16;

    const toggle = (id: number) => {
        form.setData(
            'department_ids',
            form.data.department_ids.includes(id)
                ? form.data.department_ids.filter((value) => value !== id)
                : [...form.data.department_ids, id],
        );
    };

    return (
        <EmployeeLayout>
            <Head title="بطولة جديدة" />

            <BackLink
                href={`/employee/community/${community.id}`}
                label={`العودة إلى ${community.name}`}
            />

            <PageHeader
                icon={Trophy}
                title="بطولة إدارات جديدة"
                subtitle={community.name}
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(`/employee/community/${community.id}/leagues`);
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات البطولة">
                    <Field
                        label="اسم البطولة"
                        error={form.errors.name}
                        required
                    >
                        <input
                            className={INPUT}
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                        />
                    </Field>

                    <Field label="النظام" error={form.errors.format} required>
                        <div className="space-y-2">
                            {FORMATS.map(([value, label, hint]) => (
                                <label
                                    key={value}
                                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border-[0.5px] p-3 transition-colors ${
                                        form.data.format === value
                                            ? 'border-ink bg-lime/15'
                                            : 'border-ink/12 bg-page hover:border-ink/30'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="format"
                                        value={value}
                                        checked={form.data.format === value}
                                        onChange={() =>
                                            form.setData('format', value)
                                        }
                                        className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                                    />
                                    <span className="min-w-0">
                                        <span className="block text-xs font-extrabold text-ink">
                                            {label}
                                        </span>
                                        <span className="block text-[11px] leading-relaxed text-ink/55">
                                            {hint}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </Field>
                </FormSection>

                <FormSection
                    title={`الإدارات المشاركة (${picked})`}
                    hint="اختر قسمين على الأقل — كل قسم يمثّل فريقاً."
                >
                    <div className="flex flex-wrap gap-2">
                        {departments.map((department) => {
                            const on = form.data.department_ids.includes(
                                department.id,
                            );

                            return (
                                <button
                                    key={department.id}
                                    type="button"
                                    onClick={() => toggle(department.id)}
                                    className={`rounded-full border-[0.5px] px-3 py-1.5 text-[11px] font-bold transition-colors ${
                                        on
                                            ? 'border-ink bg-ink text-lime'
                                            : 'border-ink/15 bg-surface text-ink/70 hover:border-ink/35'
                                    }`}
                                >
                                    {department.name}
                                </button>
                            );
                        })}
                    </div>

                    {departments.length === 0 && (
                        <p className="text-xs text-ink/55">
                            لا أقسام في شركتك بعد — تُضاف الأقسام من بوابة مسؤول
                            الحساب.
                        </p>
                    )}

                    {form.errors.department_ids && (
                        <p className="text-[11px] text-danger">
                            {form.errors.department_ids}
                        </p>
                    )}

                    {knockout && !bracketOk && picked > 0 && (
                        <Note
                            tone="warning"
                            title="عدد الإدارات لا يكوّن شجرة مكتملة"
                        >
                            نظام خروج المغلوب يحتاج 2 أو 4 أو 8 أو 16 إدارة.
                            اخترتَ {picked} —{' '}
                            {nextPower > picked
                                ? `أضف ${nextPower - picked} لتصل إلى ${nextPower}`
                                : `احذف ${picked - 16} للوصول إلى 16`}
                            .
                        </Note>
                    )}

                    {picked >= 2 && bracketOk && (
                        <Card padding="p-3" className="bg-page">
                            <span className="text-[11px] text-ink/70">
                                {knockout
                                    ? `شجرة من ${picked} إدارات — ${Math.log2(picked)} أدوار حتى النهائي.`
                                    : `${(picked * (picked - 1)) / (form.data.format === 'single_round_robin' ? 2 : 1)} مباراة ستُولَّد.`}
                            </span>
                        </Card>
                    )}
                </FormSection>

                <FormActions cancelHref={`/employee/community/${community.id}`}>
                    <Button
                        type="submit"
                        disabled={
                            form.processing ||
                            picked < 2 ||
                            !bracketOk ||
                            !form.data.name.trim()
                        }
                    >
                        إنشاء البطولة
                    </Button>
                </FormActions>
            </form>
        </EmployeeLayout>
    );
}
