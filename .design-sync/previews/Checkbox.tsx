import { Checkbox, Label } from 'teamat-ui';

export const WithLabel = () => (
    <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox id="remember" />
            <Label htmlFor="remember">Remember me on this device</Label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox id="confirmations" defaultChecked />
            <Label htmlFor="confirmations">Email me booking confirmations</Label>
        </div>
    </div>
);

export const States = () => (
    <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox id="cb-disabled" disabled />
            <Label htmlFor="cb-disabled" style={{ opacity: 0.5 }}>
                Disabled
            </Label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox id="cb-disabled-checked" disabled defaultChecked />
            <Label htmlFor="cb-disabled-checked" style={{ opacity: 0.5 }}>
                Disabled, checked
            </Label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox id="cb-invalid" aria-invalid />
            <Label htmlFor="cb-invalid">You must accept the terms</Label>
        </div>
    </div>
);
