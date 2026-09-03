interface StatCardProps {
    emoji: string;
    label: string;
    value: string | number;
    change?: string;
    color?: string;
}

export default function StatCard({ emoji, label, value, change, color }: StatCardProps) {
    return (
        <div className="stat" style={color ? { borderTop: `3px solid ${color}` } : undefined}>
            <div className="ico">{emoji}</div>
            <div className="val" style={color ? { color } : undefined}>{value}</div>
            <div className="lbl">{label}</div>
            {change && <div className="chg" style={color ? { color } : undefined}>{change}</div>}
        </div>
    );
}
