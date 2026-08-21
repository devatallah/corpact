import { Textarea } from 'teamat-ui';

export const Default = () => (
    <div style={{ maxWidth: 360 }}>
        <Textarea placeholder="Tell us a little about your team…" />
    </div>
);

export const WithValue = () => (
    <div style={{ maxWidth: 360 }}>
        <Textarea
            defaultValue="The padel court was great, but we'd love an earlier slot next month — 6 PM works better for most of the team."
            rows={4}
            aria-label="Feedback"
        />
    </div>
);

export const Disabled = () => (
    <div style={{ maxWidth: 360 }}>
        <Textarea
            disabled
            defaultValue="Bookings are closed while your subscription is paused."
            aria-label="Disabled notes"
        />
    </div>
);
