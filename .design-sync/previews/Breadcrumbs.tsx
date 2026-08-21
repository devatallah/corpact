import { Breadcrumbs } from 'teamat-ui';

// App-level breadcrumb trail (Arabic RTL product). Takes BreadcrumbItem[]
// ({ title, href }) exactly as the app layouts pass it.

export const ThreeLevels = () => (
    <div dir="rtl">
        <Breadcrumbs
            breadcrumbs={[
                { title: 'لوحة التحكم', href: '/dashboard' },
                { title: 'الحجوزات', href: '/bookings' },
                { title: 'تفاصيل الحجز', href: '/bookings/42' },
            ]}
        />
    </div>
);

export const TwoLevels = () => (
    <div dir="rtl">
        <Breadcrumbs
            breadcrumbs={[
                { title: 'لوحة التحكم', href: '/dashboard' },
                { title: 'الإعدادات', href: '/settings' },
            ]}
        />
    </div>
);
