import { Label, PasswordInput } from 'teamat-ui';

export const SignInField = () => (
    <div style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" defaultValue="correct-horse-battery" />
    </div>
);

export const Placeholder = () => (
    <div style={{ maxWidth: 320 }}>
        <PasswordInput placeholder="Enter your password" aria-label="Password" />
    </div>
);

export const Disabled = () => (
    <div style={{ maxWidth: 320 }}>
        <PasswordInput
            disabled
            defaultValue="hunter2hunter2"
            aria-label="Password (disabled)"
        />
    </div>
);
