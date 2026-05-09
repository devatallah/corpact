import { useEffect, useMemo, useState } from 'react';

interface TimePickerProps {
    value: string; // "HH:mm" 24h format
    onChange: (value: string) => void;
    style?: React.CSSProperties;
    className?: string;
    dir?: string;
    required?: boolean;
}

export default function TimePicker({ value, onChange, style, className, dir, required }: TimePickerProps) {
    const parsed = useMemo(() => {
        if (!value) return { h: '', m: '', p: 'PM' };
        const [hh, mm] = value.split(':').map(Number);
        const p = hh >= 12 ? 'PM' : 'AM';
        const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
        return { h: String(h12), m: String(mm).padStart(2, '0'), p };
    }, [value]);

    const [hour, setHour] = useState(parsed.h);
    const [minute, setMinute] = useState(parsed.m);
    const [period, setPeriod] = useState(parsed.p);

    useEffect(() => {
        setHour(parsed.h);
        setMinute(parsed.m);
        setPeriod(parsed.p);
    }, [parsed.h, parsed.m, parsed.p]);

    function emit(h: string, m: string, p: string) {
        if (!h || !m) return;
        let h24 = Number(h);
        if (p === 'AM' && h24 === 12) h24 = 0;
        if (p === 'PM' && h24 !== 12) h24 += 12;
        onChange(`${String(h24).padStart(2, '0')}:${m}`);
    }

    const selectBase: React.CSSProperties = {
        appearance: 'none',
        WebkitAppearance: 'none',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: 13,
        fontFamily: 'inherit',
        textAlign: 'center',
        cursor: 'pointer',
        padding: '0 2px',
    };

    const wrapStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#fff',
        border: '1px solid #E4E9F2',
        borderRadius: 10,
        padding: '10px 12px',
        ...style,
    };

    return (
        <div style={wrapStyle} className={className} dir={dir || 'ltr'}>
            <select
                value={hour}
                onChange={(e) => { setHour(e.target.value); emit(e.target.value, minute, period); }}
                style={{ ...selectBase, width: 32 }}
                required={required}
            >
                <option value="">--</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={String(h)}>{String(h).padStart(2, '0')}</option>
                ))}
            </select>
            <span style={{ fontSize: 13, color: '#666' }}>:</span>
            <select
                value={minute}
                onChange={(e) => { setMinute(e.target.value); emit(hour, e.target.value, period); }}
                style={{ ...selectBase, width: 32 }}
                required={required}
            >
                <option value="">--</option>
                <option value="00">00</option>
                <option value="30">30</option>
            </select>
            <select
                value={period}
                onChange={(e) => { setPeriod(e.target.value); emit(hour, minute, e.target.value); }}
                style={{ ...selectBase, width: 36, marginRight: 2 }}
            >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    );
}
