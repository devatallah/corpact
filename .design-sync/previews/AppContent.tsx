import { AppContent } from 'teamat-ui';

// AppContent is the page-content wrapper: variant 'sidebar' renders a
// SidebarInset <main>, variant 'header' a centered max-w-7xl column.
// Inline minHeight overrides the in-app min-h-svh so the cell stays compact.

const PageBody = () => (
    <>
        <div style={{ padding: '20px 24px 0' }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: '#71717a', margin: '4px 0 0' }}>
                Overview of platform activity
            </p>
        </div>
        <div style={{ display: 'flex', gap: 16, padding: '16px 24px 24px' }}>
            {['Companies', 'Employees', 'Bookings'].map((label, i) => (
                <div
                    key={label}
                    style={{
                        flex: 1,
                        border: '1px solid #e4e4e7',
                        borderRadius: 12,
                        padding: 16,
                    }}
                >
                    <div style={{ fontSize: 12, color: '#71717a' }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
                        {[48, '1,284', 37][i]}
                    </div>
                </div>
            ))}
        </div>
    </>
);

export const SidebarVariant = () => (
    <div style={{ display: 'flex', width: '100%', background: '#fafafa', padding: 12 }}>
        <AppContent variant="sidebar" style={{ minHeight: 0, border: '1px solid #e4e4e7', borderRadius: 12 }}>
            <PageBody />
        </AppContent>
    </div>
);

export const HeaderVariant = () => (
    <div style={{ width: '100%', background: '#fafafa', padding: 12 }}>
        <AppContent variant="header" style={{ minHeight: 0, background: '#fff', border: '1px solid #e4e4e7' }}>
            <PageBody />
        </AppContent>
    </div>
);
