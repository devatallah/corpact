import { Input } from 'teamat-ui';

export const Default = () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 320 }}>
        <Input type="email" placeholder="Email address" />
        <Input defaultValue="Sara Ahmed" aria-label="Full name" />
    </div>
);

export const States = () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 320 }}>
        <Input disabled defaultValue="sara@teamat.app" aria-label="Disabled" />
        <Input
            aria-invalid
            type="email"
            defaultValue="sara.ahmed@"
            aria-label="Invalid email"
        />
    </div>
);

export const File = () => (
    <div style={{ maxWidth: 320 }}>
        <Input type="file" aria-label="Upload logo" />
    </div>
);
