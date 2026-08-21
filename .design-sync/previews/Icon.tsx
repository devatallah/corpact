import { Icon } from 'teamat-ui';
import { Bell, Calendar, MapPin, Settings, Trophy, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const items: Array<[string, LucideIcon]> = [
    ['Calendar', Calendar],
    ['MapPin', MapPin],
    ['Users', Users],
    ['Trophy', Trophy],
    ['Bell', Bell],
    ['Settings', Settings],
];

export const LabeledRow = () => (
    <div style={{ display: 'flex', gap: 24 }}>
        {items.map(([name, IconNode]) => (
            <div
                key={name}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                }}
            >
                <Icon iconNode={IconNode} className="size-5" />
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                    {name}
                </span>
            </div>
        ))}
    </div>
);

export const Sizes = () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
        {(['size-3', 'size-4', 'size-5', 'size-8'] as const).map((cls) => (
            <div
                key={cls}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                }}
            >
                <Icon iconNode={Calendar} className={cls} />
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                    {cls}
                </span>
            </div>
        ))}
    </div>
);
