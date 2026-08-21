import { AlertError } from 'teamat-ui';

// AlertError renders validation errors in the Arabic RTL product.

export const ValidationErrors = () => (
    <div dir="rtl" style={{ maxWidth: 480 }}>
        <AlertError
            title="تعذّر حفظ البيانات"
            errors={[
                'حقل البريد الإلكتروني مطلوب.',
                'رقم الجوال يجب أن يبدأ بـ 05.',
                'كلمة المرور يجب ألا تقل عن 8 أحرف.',
            ]}
        />
    </div>
);

export const DefaultTitle = () => (
    <div dir="rtl" style={{ maxWidth: 480 }}>
        <AlertError errors={['انتهت صلاحية رابط التفعيل. يرجى طلب رابط جديد.']} />
    </div>
);
