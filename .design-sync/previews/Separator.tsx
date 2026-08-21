import { Separator } from 'teamat-ui';

export const HorizontalAndVertical = () => (
    <div style={{ width: 320 }}>
        <div>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}>Teamat UI</div>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 6 }}>
                Book courts and manage your venues.
            </div>
        </div>
        <Separator style={{ marginTop: 16, marginBottom: 16 }} />
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                height: 20,
                gap: 16,
                fontSize: 13,
            }}
        >
            <span>Bookings</span>
            <Separator orientation="vertical" />
            <span>Venues</span>
            <Separator orientation="vertical" />
            <span>Reports</span>
        </div>
    </div>
);
