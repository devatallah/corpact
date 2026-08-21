import { Input, InputError, Label } from 'teamat-ui';

export const InvalidEmail = () => (
    <div style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <Label htmlFor="email-err">Work email</Label>
        <Input id="email-err" type="email" defaultValue="sara.ahmed@" aria-invalid />
        <InputError message="Please enter a valid email address." />
    </div>
);

export const RequiredField = () => (
    <div style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <Label htmlFor="company-err">Company name</Label>
        <Input id="company-err" placeholder="e.g. Teamat Sports Co." aria-invalid />
        <InputError message="The company name field is required." />
    </div>
);
