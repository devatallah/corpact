import { AppLogo } from 'teamat-ui';

// AppLogo renders a fragment (icon tile + wordmark) meant to sit inside a
// flex row (the sidebar-header menu button). The flex wrapper here mirrors
// that context on the sidebar background and on a dark panel.
export const SidebarHeader = () => (
    <div style={{ background: 'oklch(0.985 0 0)', padding: 20, width: 280 }}>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 8,
                borderRadius: 8,
            }}
        >
            <AppLogo />
        </div>
    </div>
);

export const OnDark = () => (
    <div style={{ background: '#18181b', padding: 20, width: 280 }}>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 8,
                borderRadius: 8,
                color: '#fafafa',
            }}
        >
            <AppLogo />
        </div>
    </div>
);
