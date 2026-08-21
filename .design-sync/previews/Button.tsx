import { Button } from 'teamat-ui';
import { Plus, Trash2, Download, Loader2 } from 'lucide-react';

export const Variants = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button>Save changes</Button>
        <Button variant="secondary">Duplicate</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost">Dismiss</Button>
        <Button variant="link">Learn more</Button>
        <Button variant="destructive">Delete account</Button>
    </div>
);

export const Sizes = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Add">
            <Plus />
        </Button>
    </div>
);

export const WithIconsAndStates = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button>
            <Download /> Export report
        </Button>
        <Button variant="destructive">
            <Trash2 /> Remove
        </Button>
        <Button disabled>
            <Loader2 className="animate-spin" /> Saving…
        </Button>
        <Button variant="outline" disabled>
            Disabled
        </Button>
    </div>
);
