import { Checkbox, Input, Label } from 'teamat-ui';

export const WithTextField = () => (
    <div style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <Label htmlFor="work-email">Work email</Label>
        <Input id="work-email" type="email" placeholder="you@company.com" />
    </div>
);

export const WithCheckbox = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Checkbox id="newsletter" defaultChecked />
        <Label htmlFor="newsletter">Send me the monthly activity digest</Label>
    </div>
);
