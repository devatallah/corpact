import { Skeleton } from 'teamat-ui';

export const LoadingCard = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 360 }}>
        <Skeleton className="rounded-full" style={{ width: 48, height: 48, flexShrink: 0 }} />
        <div style={{ display: 'grid', gap: 8, flex: 1 }}>
            <Skeleton style={{ height: 16, width: '75%' }} />
            <Skeleton style={{ height: 16, width: '50%' }} />
        </div>
    </div>
);

export const LoadingList = () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <Skeleton style={{ height: 96, width: '100%' }} />
        <Skeleton style={{ height: 16, width: '100%' }} />
        <Skeleton style={{ height: 16, width: '80%' }} />
        <Skeleton style={{ height: 16, width: '60%' }} />
    </div>
);
