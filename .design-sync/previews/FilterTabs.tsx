import { FilterTabs } from 'teamat-ui';

// .fbtn styling is scoped to portal classes (.portal-admin dark,
// .portal-company light) — compose inside a portal wrapper as the app does.

export const AdminPortal = () => (
    <div
        className="portal-admin"
        dir="rtl"
        style={{ minHeight: 0, padding: 20, display: 'block' }}
    >
        <FilterTabs
            options={[
                { label: 'الكل', value: '' },
                { label: 'قيد المراجعة', value: 'pending' },
                { label: 'مقبول', value: 'approved' },
                { label: 'مرفوض', value: 'rejected' },
            ]}
            current="pending"
        />
    </div>
);

export const CompanyPortal = () => (
    <div
        className="portal-company"
        dir="rtl"
        style={{ minHeight: 0, padding: 20, display: 'block' }}
    >
        <FilterTabs
            options={[
                { label: 'الكل', value: '' },
                { label: 'معلق', value: 'pending' },
                { label: 'نشط', value: 'active' },
                { label: 'مرفوض', value: 'rejected' },
            ]}
            current=""
        />
    </div>
);
