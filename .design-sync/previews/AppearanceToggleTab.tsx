import { AppearanceToggleTab } from 'teamat-ui';

// Light / Dark / System appearance switcher (settings page). Initial
// selection comes from localStorage and defaults to 'system'.
export const Light = () => (
    <div style={{ padding: 20, background: '#ffffff' }}>
        <AppearanceToggleTab />
    </div>
);

// The app toggles a `.dark` ancestor class; the wrapper reproduces that so
// the dark:* styles of the tabs apply.
export const Dark = () => (
    <div className="dark" style={{ padding: 20, background: '#18181b' }}>
        <AppearanceToggleTab />
    </div>
);
