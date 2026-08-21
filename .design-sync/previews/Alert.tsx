import { Alert, AlertDescription, AlertTitle } from 'teamat-ui';
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon } from 'lucide-react';

export const Default = () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
        <Alert>
            <CheckCircle2Icon />
            <AlertTitle>Payment received</AlertTitle>
            <AlertDescription>
                Your invoice #INV-2041 has been paid successfully.
            </AlertDescription>
        </Alert>
        <Alert>
            <InfoIcon />
            <AlertTitle>Scheduled maintenance</AlertTitle>
            <AlertDescription>
                The dashboard will be unavailable on Sunday from 02:00 to 04:00 UTC.
            </AlertDescription>
        </Alert>
    </div>
);

export const Destructive = () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Unable to process your payment</AlertTitle>
            <AlertDescription>
                <p>Please verify your billing information and try again.</p>
                <ul className="list-inside list-disc text-sm">
                    <li>Check your card details</li>
                    <li>Ensure sufficient funds</li>
                </ul>
            </AlertDescription>
        </Alert>
    </div>
);

export const TitleOnly = () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
        <Alert>
            <CheckCircle2Icon />
            <AlertTitle>Changes saved successfully.</AlertTitle>
        </Alert>
    </div>
);
