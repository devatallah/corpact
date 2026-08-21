import { StatusBadge } from 'teamat-ui';

// StatusBadge maps status keys to Arabic labels; colors come from the
// portal stylesheets (.b-active etc.), shown here in truthful portal context.

export const AdminPortal = () => (
    <div className="portal-admin" dir="rtl" style={{ minHeight: 0, padding: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status="active" />
            <StatusBadge status="pending" />
            <StatusBadge status="approved" />
            <StatusBadge status="rejected" />
            <StatusBadge status="completed" />
            <StatusBadge status="cancelled" />
            <StatusBadge status="paid" />
            <StatusBadge status="review" />
        </div>
    </div>
);

export const CompanyPortal = () => (
    <div className="portal-company" dir="rtl" style={{ minHeight: 0, padding: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status="active" />
            <StatusBadge status="pending" />
            <StatusBadge status="confirmed" />
            <StatusBadge status="waiting_business" />
            <StatusBadge status="unpaid" />
        </div>
    </div>
);
