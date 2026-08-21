import { Progress } from 'teamat-ui';

export const Values = () => (
    <div style={{ display: 'grid', gap: 20, maxWidth: 380 }}>
        <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Uploading files</span>
                <span>25%</span>
            </div>
            <Progress value={25} />
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Profile completion</span>
                <span>60%</span>
            </div>
            <Progress value={60} />
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Storage used</span>
                <span>90%</span>
            </div>
            <Progress value={90} />
        </div>
    </div>
);

export const CustomMax = () => (
    <div style={{ display: 'grid', gap: 6, maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span>Seats filled</span>
            <span>9 / 12</span>
        </div>
        <Progress value={9} max={12} />
    </div>
);
