import { Head, router, useForm } from '@inertiajs/react';
import {
    CircleCheckBig,
    Download,
    Send,
    TriangleAlert,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink, ListStates } from '@/components/list-states';
import { FormActions, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    Note,
    PageHeader,
    StatCard,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';

/**
 * H §5 — استيراد ملف الموظفين.
 *
 * The order is fixed and the screen makes it visible: upload → per-row
 * validation → download the error report → fix and re-upload → only then can
 * invitations be sent. The send button is genuinely disabled while any row
 * carries an error, because half-importing a workforce file leaves a company
 * with employees it can't account for.
 */
type ImportRow = {
    id: number;
    row_number: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    normalized_phone: string | null;
    department_name: string | null;
    employee_number: string | null;
    errors: string[] | null;
};

type ImportRecord = {
    id: number;
    original_filename: string;
    status: string;
    total_rows: number;
    valid_rows: number;
    error_rows: number;
    invited_at: string | null;
    created_at: string | null;
    rows?: ImportRow[];
};

const IMPORT_STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
    needs_correction: { label: 'يحتاج تصحيحاً', tone: 'danger' },
    ready: { label: 'جاهز لإرسال الدعوات', tone: 'warning' },
    invited: { label: 'أُرسلت الدعوات', tone: 'success' },
};

export default function CompanyEmployeeImport({
    latestImport,
    imports,
    invitations,
}: {
    latestImport: ImportRecord | null;
    imports: ImportRecord[];
    invitations: {
        id: number;
        email: string | null;
        name: string | null;
        phone: string | null;
        status: string;
        expires_at: string | null;
        last_sent_at: string | null;
        send_count: number;
    }[];
}) {
    const form = useForm<{ file: File | null }>({ file: null });
    const [inviting, setInviting] = useState(false);

    const clean =
        latestImport !== null &&
        latestImport.error_rows === 0 &&
        latestImport.total_rows > 0;
    const alreadyInvited = latestImport?.status === 'invited';

    return (
        <CompanyLayout>
            <Head title="استيراد الموظفين" />

            <BackLink href="/company/employees" label="العودة إلى الموظفين" />

            <PageHeader
                icon={Upload}
                title="استيراد ملف الموظفين"
                subtitle="ارفع الملف، صحّح ما يرفضه التحقق، ثم أرسل الدعوات — بهذا الترتيب."
            />

            {/* ── الرفع ── */}
            <Card padding="p-5">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/company/employees/import', {
                            forceFormData: true,
                        });
                    }}
                >
                    <FormSection
                        title="رفع الملف"
                        hint="CSV أو Excel (xlsx) بحد أقصى 5 ميجابايت. الأعمدة المتوقعة: الاسم، البريد، الجوال، القسم، الرقم الوظيفي."
                    >
                        <Field
                            label="ملف الموظفين"
                            error={form.errors.file}
                            required
                        >
                            <input
                                type="file"
                                accept=".csv,.txt,.xlsx"
                                className="w-full text-xs text-ink/80 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-2 file:text-[11px] file:font-bold file:text-lime"
                                onChange={(event) =>
                                    form.setData(
                                        'file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                        </Field>

                        <Note title="التحقق فوري وصف بصف">
                            لا يُنشأ أي موظف عند الرفع. يُقرأ الملف ويُفحص كل صف
                            على حدة، ثم تقرر أنت: تنزّل تقرير الأخطاء وتصحّح، أو
                            ترسل الدعوات إن كان الملف نظيفاً.
                        </Note>
                    </FormSection>

                    <FormActions>
                        <Button
                            type="submit"
                            disabled={form.processing || !form.data.file}
                            icon={Upload}
                        >
                            رفع الملف والتحقق
                        </Button>
                    </FormActions>
                </form>
            </Card>

            {/* ── نتيجة آخر رفع ── */}
            {latestImport && (
                <Card padding="p-4" className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-extrabold text-ink">
                                {latestImport.original_filename}
                            </h2>
                            <span className="font-mono text-[11px] text-ink/50">
                                {latestImport.created_at
                                    ? new Date(
                                          latestImport.created_at,
                                      ).toLocaleString('ar-SA')
                                    : '—'}
                            </span>
                        </div>
                        <Badge
                            tone={
                                IMPORT_STATUS[latestImport.status]?.tone ??
                                'neutral'
                            }
                        >
                            {IMPORT_STATUS[latestImport.status]?.label ??
                                latestImport.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <StatCard
                            label="إجمالي الصفوف"
                            value={latestImport.total_rows}
                        />
                        <StatCard
                            label="صفوف سليمة"
                            value={latestImport.valid_rows}
                            tone="success"
                        />
                        <StatCard
                            label="صفوف بأخطاء"
                            value={latestImport.error_rows}
                            tone={
                                latestImport.error_rows > 0
                                    ? 'danger'
                                    : 'success'
                            }
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {latestImport.error_rows > 0 && (
                            <a
                                href={`/company/employees/import/${latestImport.id}/errors`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-lime transition-opacity hover:opacity-90"
                            >
                                <Download
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                تنزيل تقرير الأخطاء
                            </a>
                        )}

                        <Button
                            type="button"
                            icon={Send}
                            disabled={!clean || alreadyInvited}
                            onClick={() => setInviting(true)}
                        >
                            {alreadyInvited
                                ? 'أُرسلت الدعوات'
                                : 'إرسال الدعوات'}
                        </Button>

                        {!clean && latestImport.total_rows > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-danger">
                                <TriangleAlert
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                الدعوات محظورة حتى يخلو الملف من الأخطاء.
                            </span>
                        )}
                    </div>

                    <TableShell>
                        <Thead>
                            <Th>السطر</Th>
                            <Th>الاسم</Th>
                            <Th>البريد</Th>
                            <Th>الجوال</Th>
                            <Th>القسم</Th>
                            <Th>النتيجة</Th>
                        </Thead>
                        <Tbody>
                            {(latestImport.rows ?? []).map((row) => (
                                <Tr key={row.id}>
                                    <Td className="font-mono text-[11px] text-ink/60">
                                        {row.row_number}
                                    </Td>
                                    <Td className="text-ink/85">
                                        {row.name ?? '—'}
                                    </Td>
                                    <Td
                                        className="font-mono text-[11px] text-ink/70"
                                        dir="ltr"
                                    >
                                        {row.email ?? '—'}
                                    </Td>
                                    <Td
                                        className="font-mono text-[11px] text-ink/70"
                                        dir="ltr"
                                    >
                                        {row.normalized_phone ??
                                            row.phone ??
                                            '—'}
                                    </Td>
                                    <Td className="text-ink/85">
                                        {row.department_name ?? '—'}
                                    </Td>
                                    <Td>
                                        {row.errors && row.errors.length > 0 ? (
                                            <ul className="space-y-0.5">
                                                {row.errors.map((error) => (
                                                    <li
                                                        key={error}
                                                        className="text-[11px] font-bold text-danger"
                                                    >
                                                        {error}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <Badge
                                                tone="success"
                                                icon={CircleCheckBig}
                                            >
                                                سليم
                                            </Badge>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                            <ListStates
                                count={(latestImport.rows ?? []).length}
                                colSpan={6}
                                empty="لا صفوف في هذا الملف."
                                emptyHint="تأكد أن الملف يحتوي صف عناوين وصفاً واحداً على الأقل من البيانات."
                            />
                        </Tbody>
                    </TableShell>

                    {latestImport.total_rows > 500 && (
                        <p className="text-[11px] text-ink/50">
                            يُعرض هنا أول 500 صف (الأخطاء أولاً). الصورة الكاملة
                            في تقرير الأخطاء القابل للتنزيل.
                        </p>
                    )}
                </Card>
            )}

            {/* ── الدعوات المعلّقة ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">
                    دعوات لم تُقبل بعد
                </h2>

                <TableShell>
                    <Thead>
                        <Th>المدعو</Th>
                        <Th>الجوال</Th>
                        <Th>الحالة</Th>
                        <Th>تنتهي في</Th>
                        <Th>مرات الإرسال</Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>
                    <Tbody>
                        {invitations.map((invitation) => (
                            <Tr key={invitation.id}>
                                <Td>
                                    <span className="block font-extrabold text-ink">
                                        {invitation.name ?? '—'}
                                    </span>
                                    <span
                                        className="block font-mono text-[11px] text-ink/50"
                                        dir="ltr"
                                    >
                                        {invitation.email ?? ''}
                                    </span>
                                </Td>
                                <Td
                                    className="font-mono text-[11px] text-ink/70"
                                    dir="ltr"
                                >
                                    {invitation.phone ?? '—'}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            invitation.status === 'expired'
                                                ? 'danger'
                                                : 'warning'
                                        }
                                    >
                                        {invitation.status === 'expired'
                                            ? 'انتهت صلاحيتها'
                                            : 'معلّقة'}
                                    </Badge>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {invitation.expires_at
                                        ? new Date(
                                              invitation.expires_at,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                                <Td className="font-mono text-ink/70">
                                    {invitation.send_count}
                                </Td>
                                <Td className="text-center">
                                    <Button
                                        type="button"
                                        tone="soft"
                                        onClick={() =>
                                            router.post(
                                                `/company/invitations/${invitation.id}/resend`,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        إعادة الإرسال
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={invitations.length}
                            colSpan={6}
                            empty="لا دعوات معلّقة."
                            emptyHint="كل من دعوتهم فعّلوا حساباتهم."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── سجل الرفعات ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">سجل الرفعات</h2>

                <TableShell>
                    <Thead>
                        <Th>الملف</Th>
                        <Th>التاريخ</Th>
                        <Th>الصفوف</Th>
                        <Th>الأخطاء</Th>
                        <Th>الحالة</Th>
                    </Thead>
                    <Tbody>
                        {imports.map((record) => (
                            <Tr key={record.id}>
                                <Td className="max-w-xs truncate font-extrabold text-ink">
                                    {record.original_filename}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {record.created_at
                                        ? new Date(
                                              record.created_at,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                                <Td className="font-mono text-ink/80">
                                    {record.total_rows}
                                </Td>
                                <Td
                                    className={`font-mono font-bold ${record.error_rows > 0 ? 'text-danger' : 'text-success'}`}
                                >
                                    {record.error_rows}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            IMPORT_STATUS[record.status]
                                                ?.tone ?? 'neutral'
                                        }
                                    >
                                        {IMPORT_STATUS[record.status]?.label ??
                                            record.status}
                                    </Badge>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={imports.length}
                            colSpan={5}
                            empty="لم تُرفع ملفات بعد."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            <ConfirmModal
                open={inviting}
                title="إرسال الدعوات"
                message="تُرسل دعوة واتساب لكل صف سليم في الملف، والرابط صالح 7 أيام. لا يمكن التراجع عن الإرسال."
                details={
                    latestImport && (
                        <>
                            <ConfirmRow
                                label="الملف"
                                value={latestImport.original_filename}
                                strong
                            />
                            <ConfirmRow
                                label="عدد الدعوات"
                                value={`${latestImport.valid_rows} دعوة`}
                                strong
                            />
                            <ConfirmRow label="صلاحية الرابط" value="7 أيام" />
                        </>
                    )
                }
                confirmLabel="نعم، أرسل الدعوات"
                onConfirm={() => {
                    router.post(
                        `/company/employees/import/${latestImport?.id}/invites`,
                    );
                    setInviting(false);
                }}
                onCancel={() => setInviting(false)}
            />
        </CompanyLayout>
    );
}
