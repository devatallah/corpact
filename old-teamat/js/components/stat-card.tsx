import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    /** Preferred. The prototype's tiles are lucide glyphs, never emoji. */
    icon?: LucideIcon;
    /** Pre-port callers still pass an emoji; it renders until they're converted. */
    emoji?: string;
    label: string;
    value: string | number;
    change?: string;
    /**
     * Accents the delta line only. The prototype carries no coloured card edge
     * — depth comes from the hairline border, so a tinted top rule would read
     * as a different design system.
     */
    color?: string;
}

export default function StatCard({ icon: Icon, emoji, label, value, change, color }: StatCardProps) {
    return (
        <div className="bg-white p-5 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 hover:border-[#0A0A0A]/30 transition-colors space-y-1">
            {Icon ? (
                <Icon className="w-4 h-4 text-[#0A0A0A]/40" aria-hidden="true" />
            ) : emoji ? (
                <div className="text-lg" aria-hidden>
                    {emoji}
                </div>
            ) : null}
            <div className="text-2xl font-black text-[#0A0A0A]">{value}</div>
            <div className="text-[11px] text-[#0A0A0A]/50 font-bold">{label}</div>
            {change && (
                <div className="text-[11px] font-bold" style={color ? { color } : undefined}>
                    {change}
                </div>
            )}
        </div>
    );
}
