import { Heading } from 'teamat-ui';

export const Default = () => (
    <div style={{ width: 380 }}>
        <Heading
            title="Venue settings"
            description="Manage opening hours, pricing and availability."
        />
    </div>
);

export const SmallVariant = () => (
    <div style={{ width: 380 }}>
        <Heading
            variant="small"
            title="Profile information"
            description="Update your name and email address."
        />
    </div>
);

export const ArabicRTL = () => (
    <div dir="rtl" style={{ width: 380 }}>
        <Heading
            title="إعدادات المرفق"
            description="إدارة ساعات العمل والأسعار والتوافر."
        />
    </div>
);
