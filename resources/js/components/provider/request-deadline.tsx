import { Clock } from 'lucide-react';
import { useMinutesLeft } from '@/components/list-controls';
import { Badge } from '@/components/portal/ui';

/**
 * مهلة الردّ على طلب الحجز، وصفّ الطلب الذي تصفه.
 *
 * الطابور وشاشة القرار يعرضان المهلة نفسها بالحساب نفسه؛ اختلافهما فيها
 * يعني أن المزوّد يقرأ رقمين لشيء واحد. كانت شاشة القرار تستوردهما من
 * الطابور — صفحةٌ تستورد من صفحة.
 */
export type ProviderRequestRow = {
    id: number;
    status: string;
    requested_date: string;
    start_time: string;
    duration_minutes: number;
    quantity: number;
    pricing_type: string;
    frozen_participants_count: number | null;
    total_amount: string | number | null;
    sent_at: string | null;
    deadline_at: string | null;
    responded_at: string | null;
    late_response: boolean;
    rejection_reason: string | null;
    cancellation_reason: string | null;
    unit: { id: number; name: string; pricing_type: string } | null;
    event: {
        id: number;
        community_name: string | null;
        company_name: string | null;
        participants_count: number;
        event_date: string | null;
        start_time: string;
        duration_minutes: number;
        status: string;
        creator_name: string | null;
        creator_phone: string | null;
    } | null;
};

export function Deadline({
    deadline,
    pending,
    late,
}: {
    deadline: string | null;
    pending: boolean;
    late?: boolean;
}) {
    const minutes = useMinutesLeft(deadline);

    if (deadline === null) {
        return <span className="text-ink/40">—</span>;
    }

    if (!pending) {
        return (
            <span
                className={`font-mono text-[11px] ${late ? 'text-warning' : 'text-ink/60'}`}
            >
                {new Date(deadline).toLocaleDateString('ar-SA')}
            </span>
        );
    }

    if (minutes === null) {
        return <span className="font-mono text-[11px] text-ink/60">—</span>;
    }

    if (minutes <= 0) {
        return <Badge tone="danger">انتهت المهلة</Badge>;
    }

    const hours = Math.floor(minutes / 60);
    const urgent = minutes < 120;

    return (
        <span
            className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${urgent ? 'text-danger' : 'text-ink'}`}
        >
            <Clock className="h-3 w-3" aria-hidden="true" />
            {hours > 0 ? `${hours} س ${minutes % 60} د` : `${minutes} د`}
        </span>
    );
}
