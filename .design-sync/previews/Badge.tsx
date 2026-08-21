import { Badge } from 'teamat-ui';
import { CheckIcon, ClockIcon, XIcon } from 'lucide-react';

export const Variants = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
    </div>
);

export const WithIcons = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Badge>
            <CheckIcon /> Verified
        </Badge>
        <Badge variant="secondary">
            <ClockIcon /> Pending review
        </Badge>
        <Badge variant="destructive">
            <XIcon /> Failed
        </Badge>
    </div>
);

export const Counts = () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Badge>12 new</Badge>
        <Badge variant="secondary">v2.4.0</Badge>
        <Badge variant="outline">Beta</Badge>
    </div>
);
