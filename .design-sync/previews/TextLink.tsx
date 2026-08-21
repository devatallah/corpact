import { TextLink } from 'teamat-ui';

export const InlineLinks = () => (
    <div dir="rtl" style={{ display: 'grid', gap: 14, fontSize: 14 }}>
        <p style={{ margin: 0 }}>
            هل نسيت كلمة المرور؟{' '}
            <TextLink href="/forgot-password">إعادة تعيين كلمة المرور</TextLink>
        </p>
        <p style={{ margin: 0 }}>
            ليس لديك حساب؟ <TextLink href="/register">إنشاء حساب جديد</TextLink>
        </p>
        <TextLink href="/login" style={{ width: 'fit-content' }}>
            العودة إلى تسجيل الدخول
        </TextLink>
    </div>
);
