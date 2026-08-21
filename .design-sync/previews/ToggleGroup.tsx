import { ToggleGroup, ToggleGroupItem } from 'teamat-ui';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    Underline,
} from 'lucide-react';

export const SingleSelection = () => (
    <ToggleGroup type="single" defaultValue="center" variant="outline">
        <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight />
        </ToggleGroupItem>
    </ToggleGroup>
);

export const MultipleSelection = () => (
    <ToggleGroup type="multiple" defaultValue={['bold', 'italic']}>
        <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic">
            <Italic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Toggle underline">
            <Underline />
        </ToggleGroupItem>
    </ToggleGroup>
);

export const TextSizesAndDisabled = () => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'flex-start',
        }}
    >
        <ToggleGroup type="single" size="sm" variant="outline" defaultValue="day">
            <ToggleGroupItem value="day">Day</ToggleGroupItem>
            <ToggleGroupItem value="week">Week</ToggleGroupItem>
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" size="lg" variant="outline" defaultValue="week" disabled>
            <ToggleGroupItem value="day">Day</ToggleGroupItem>
            <ToggleGroupItem value="week">Week</ToggleGroupItem>
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
    </div>
);
