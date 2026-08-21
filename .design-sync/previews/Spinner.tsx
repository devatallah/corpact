import { Spinner, Button } from 'teamat-ui';

// Spinner has no size prop — size is set via className (defaults to size-4).

export const Sizes = () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <Spinner />
        <Spinner className="size-5" />
        <Spinner className="size-8" />
    </div>
);

export const InButton = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button disabled>
            <Spinner /> Saving…
        </Button>
        <Button variant="outline" disabled>
            <Spinner /> Loading data
        </Button>
    </div>
);
