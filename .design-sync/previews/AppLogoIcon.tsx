import { AppLogoIcon } from 'teamat-ui';

// AppLogoIcon is a bare SVG that inherits fill — it paints nothing without
// explicit size + fill context, so each cell supplies both.
export const Sizes = () => (
    <div
        style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 24,
            padding: 20,
            background: '#ffffff',
        }}
    >
        <AppLogoIcon width={20} height={21} style={{ fill: '#18181b' }} />
        <AppLogoIcon width={32} height={34} style={{ fill: '#18181b' }} />
        <AppLogoIcon width={48} height={50} style={{ fill: '#18181b' }} />
        <AppLogoIcon width={64} height={67} style={{ fill: '#18181b' }} />
    </div>
);

export const OnDark = () => (
    <div
        style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 24,
            padding: 20,
            background: '#18181b',
        }}
    >
        <AppLogoIcon width={32} height={34} style={{ fill: '#fafafa' }} />
        <AppLogoIcon width={48} height={50} style={{ fill: '#fafafa' }} />
        <AppLogoIcon width={48} height={50} style={{ fill: '#E03050' }} />
    </div>
);
