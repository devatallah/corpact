import { Toggle } from 'teamat-ui';
import { Bold, Italic, Underline } from 'lucide-react';

export const Variants = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Toggle aria-label="Toggle bold">
            <Bold />
        </Toggle>
        <Toggle variant="outline" aria-label="Toggle italic">
            <Italic />
        </Toggle>
        <Toggle variant="outline">
            <Bold />
            Bold
        </Toggle>
    </div>
);

export const Pressed = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Toggle defaultPressed aria-label="Toggle bold">
            <Bold />
        </Toggle>
        <Toggle variant="outline" defaultPressed>
            <Italic />
            Italic
        </Toggle>
    </div>
);

export const Sizes = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Toggle size="sm" variant="outline" aria-label="Small">
            <Bold />
        </Toggle>
        <Toggle size="default" variant="outline" aria-label="Default">
            <Bold />
        </Toggle>
        <Toggle size="lg" variant="outline" aria-label="Large">
            <Bold />
        </Toggle>
    </div>
);

export const Disabled = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Toggle disabled>
            <Underline />
            Underline
        </Toggle>
        <Toggle variant="outline" disabled defaultPressed aria-label="Disabled pressed">
            <Bold />
        </Toggle>
    </div>
);
