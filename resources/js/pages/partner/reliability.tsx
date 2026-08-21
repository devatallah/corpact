import PartnerLayout from '@/layouts/partner-layout';
import type { ProviderBehaviors } from '@/types/models';
import { Head } from '@inertiajs/react';

interface Props {
    behaviors: ProviderBehaviors;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="card" style={{ textAlign: 'center', flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#1A5FAB' }}>{value}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{label}</div>
            {hint && <div style={{ fontSize: 11, color: '#8A7868', marginTop: 4 }}>{hint}</div>}
        </div>
    );
}

export default function Reliability({ behaviors }: Props) {
    const fmtMinutes = (m: number | null) => {
        if (m === null) return '—';
        if (m < 60) return `${m} دقيقة`;
        return `${Math.round(m / 6) / 10} ساعة`;
    };

    return (
        <PartnerLayout>
            <Head title="سلوكياتي" />
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>سلوكياتك مع الطلبات</h1>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                <Stat label="معدل القبول" value={behaviors.acceptance_rate === null ? '—' : `${behaviors.acceptance_rate}%`} hint={`${behaviors.accepted} قبول من ${behaviors.total_requests} طلب`} />
                <Stat label="متوسط زمن الرد" value={fmtMinutes(behaviors.avg_response_minutes)} hint="من وصول الطلب حتى قرارك" />
                <Stat label="طلبات سقطت بلا رد" value={String(behaviors.expired)} hint="انتهت مهلتها قبل قرارك" />
                <Stat label="الرفض" value={String(behaviors.rejected)} hint="الرفض السريع أفضل من التأخر" />
            </div>

            <div className="card" style={{ fontSize: 13, color: '#6A5C48', lineHeight: 2 }}>
                <b>كيف تحافظ على ترتيبك في الاقتراح الآلي؟</b>
                <ul style={{ paddingRight: 18, marginTop: 6 }}>
                    <li>قبول الطلب خلال المهلة يرفع موثوقيتك، والتأخر بعد المهلة يخفضها أكثر من الرفض نفسه.</li>
                    <li><b>الإلغاء بعد القبول هو الأشد أثراً</b> (−15) وتُطبَّق معه سياسة إلغاء المزوّد في عقدك.</li>
                    <li>إن لم تكن متأكداً من التوفر، ارفض أو اقترح بديلاً بدل أن تقبل ثم تعتذر.</li>
                    <li>مؤشر الموثوقية يؤثر مباشرة في ترتيبك داخل الاقتراح الآلي، أي في حجم الطلب الذي يصلك.</li>
                </ul>
                <div style={{ fontSize: 11, color: '#8A7868', marginTop: 6 }}>
                    لا يُعرض رقم المؤشر في الإصدار الأول — تُعرض سلوكياتك أعلاه فقط.
                </div>
            </div>
        </PartnerLayout>
    );
}
