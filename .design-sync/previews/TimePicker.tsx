import { TimePicker } from 'teamat-ui';

const noop = () => undefined;

export const MorningAndEvening = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <TimePicker value="09:30" onChange={noop} />
        <TimePicker value="18:00" onChange={noop} />
    </div>
);

export const Empty = () => (
    <div style={{ display: 'flex' }}>
        <TimePicker value="" onChange={noop} />
    </div>
);

// As used in the Arabic RTL admin portal (events form): RTL layout,
// picker itself kept LTR — matches admin/events/edit.tsx.
export const ArabicFormContext = () => (
    <div dir="rtl" style={{ display: 'grid', gap: 6, maxWidth: 220 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#3D3A34' }}>
            وقت البداية
        </label>
        <TimePicker value="16:30" onChange={noop} dir="ltr" />
    </div>
);
