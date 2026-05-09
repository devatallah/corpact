import { Head, useForm, usePage } from '@inertiajs/react';
import SportIcon from '@/components/sport-icon';
import { useState, type FormEvent } from 'react';

interface Sport {
    id: number;
    name: string;
    icon: string | null;
}

interface Props {
    sports: Sport[];
}

const cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'أخرى'];

export default function RegisterClub({ sports }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [submitted, setSubmitted] = useState(!!flash?.success);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        city: '',
        district: '',
        sports: [] as number[],
        courts_count: 1,
        working_hours: '',
        contact_name: '',
        contact_title: '',
        contact_phone: '',
        notes: '',
    });

    function toggleSport(id: number) {
        setData('sports', data.sports.includes(id)
            ? data.sports.filter(s => s !== id)
            : [...data.sports, id]
        );
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/club/register', {
            onSuccess: () => setSubmitted(true),
        });
    }

    const css = `
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:Tahoma,Arial,sans-serif;min-height:100vh;background:linear-gradient(135deg,#1C1410,#2A1F18);display:flex;align-items:center;justify-content:center;padding:20px;}
        .rc-inp,.rc-sel,.rc-ta{width:100%;padding:12px 14px;border:1px solid #EAE4DC;border-radius:12px;font-size:14px;color:#1C1410;background:#F7F4F0;outline:none;font-family:inherit;direction:rtl;transition:border-color .15s;}
        .rc-inp:focus,.rc-sel:focus,.rc-ta:focus{border-color:#C8410A;background:#fff;}
        .rc-inp[dir="ltr"]{direction:ltr;}
        .rc-ta{resize:vertical;min-height:80px;}
    `;

    if (submitted) {
        return (
            <>
                <Head title="تم إرسال الطلب" />
                <style>{css}</style>
                <div style={{ width: '100%', maxWidth: 520 }} dir="rtl">
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(90deg,#F5A623,#C8410A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>كورباكت</div>
                        <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>CORPACT</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 24px 80px rgba(0,0,0,.5)', textAlign: 'center' }}>
                        <div style={{ fontSize: 60, marginBottom: 16 }}>🎯</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#1C1410', marginBottom: 8 }}>تم إرسال طلبك!</div>
                        <div style={{ fontSize: 14, color: '#7A8BA8', lineHeight: 1.6, marginBottom: 24 }}>
                            استلمنا طلب انضمام <strong>{data.name || 'ناديك'}</strong> وسيتواصل معك فريقنا على <strong>{data.email}</strong> خلال 48 ساعة.
                        </div>
                        <div style={{ background: '#F7F4F0', borderRadius: 14, padding: '16px 20px', textAlign: 'right', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: '#4A3828' }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#C8410A', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>1</div>
                                <span>يراجع فريق كورباكت بيانات ناديك</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: '#4A3828' }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#C8410A', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>2</div>
                                <span>يتواصل معك لشرح آلية العمل</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#4A3828' }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#C8410A', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>3</div>
                                <span>يُفعّل حسابك وتبدأ تستقبل الحجوزات</span>
                            </div>
                        </div>
                        <a href="/club/login" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#C8410A', fontWeight: 700, textDecoration: 'none' }}>← العودة للصفحة الرئيسية</a>
                    </div>
                </div>
            </>
        );
    }

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <>
            <Head title="تسجيل نادي — كورباكت" />
            <style>{css}</style>

            <div style={{ width: '100%', maxWidth: 520 }} dir="rtl">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(90deg,#F5A623,#C8410A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>كورباكت</div>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>CORPACT</div>
                </div>

                {/* Card */}
                <div style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 24px 80px rgba(0,0,0,.5)' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#1C1410', marginBottom: 4 }}>تسجيل نادٍ جديد</div>
                    <div style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 28, lineHeight: 1.5 }}>انضم لشبكة كورباكت واستقبل حجوزات من شركات ومجتمعات الموظفين</div>

                    {/* Info box */}
                    <div style={{ background: '#C8410A10', border: '1px solid #C8410A33', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: '#C8410A', lineHeight: 1.7 }}>
                        <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>🏟️ ماذا تستفيد كنادٍ؟</strong>
                        تصلك حجوزات جماعية منظمة من شركات شريكة، مع تسويات مالية واضحة وسهلة الإدارة.
                    </div>

                    {/* Error messages */}
                    {hasErrors && (
                        <div style={{ background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#E03050', fontWeight: 600, marginBottom: 14 }}>
                            {Object.values(errors).map((err, i) => (
                                <div key={i}>{err}</div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        {/* Section: Club info */}
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1C1410', margin: '20px 0 14px', paddingBottom: 8, borderBottom: '1px solid #EAE4DC' }}>بيانات النادي</div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>اسم النادي</label>
                            <input className="rc-inp" type="text" placeholder="نادي الرياضة الحديثة" value={data.name} onChange={e => setData('name', e.target.value)} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>المدينة</label>
                                <select className="rc-sel" value={data.city} onChange={e => setData('city', e.target.value)}>
                                    <option value="">اختر المدينة</option>
                                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>الحي / المنطقة</label>
                                <input className="rc-inp" type="text" placeholder="حي النرجس" value={data.district} onChange={e => setData('district', e.target.value)} />
                            </div>
                        </div>

                        {/* Sports checkboxes */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>الرياضات المتاحة في النادي</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
                                {sports.map(sport => {
                                    const checked = data.sports.includes(sport.id);
                                    return (
                                        <div
                                            key={sport.id}
                                            onClick={() => toggleSport(sport.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                padding: '10px 12px', border: `1px solid ${checked ? '#C8410A' : '#EAE4DC'}`,
                                                borderRadius: 10, cursor: 'pointer', transition: 'all .15s',
                                                background: checked ? '#C8410A10' : '#fff',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                readOnly
                                                style={{ width: 16, height: 16, accentColor: '#C8410A', cursor: 'pointer' }}
                                            />
                                            <label style={{ fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                                                <SportIcon icon={sport.icon} size={16} /> {sport.name}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>عدد الملاعب الإجمالي</label>
                                <input className="rc-inp" type="number" dir="ltr" placeholder="4" min={1} value={data.courts_count} onChange={e => setData('courts_count', parseInt(e.target.value) || 1)} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>ساعات العمل</label>
                                <input className="rc-inp" type="text" placeholder="6ص – 12م" value={data.working_hours} onChange={e => setData('working_hours', e.target.value)} />
                            </div>
                        </div>

                        {/* Section: Manager info */}
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1C1410', margin: '20px 0 14px', paddingBottom: 8, borderBottom: '1px solid #EAE4DC' }}>بيانات مسؤول النادي</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>الاسم الكامل</label>
                                <input className="rc-inp" type="text" placeholder="محمد العتيبي" value={data.contact_name} onChange={e => setData('contact_name', e.target.value)} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>المسمى الوظيفي</label>
                                <input className="rc-inp" type="text" placeholder="مدير النادي" value={data.contact_title} onChange={e => setData('contact_title', e.target.value)} />
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>البريد الإلكتروني</label>
                            <input className="rc-inp" type="email" dir="ltr" placeholder="info@club.com" value={data.email} onChange={e => setData('email', e.target.value)} />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>رقم الجوال</label>
                            <input className="rc-inp" type="tel" dir="ltr" placeholder="05xxxxxxxx" value={data.contact_phone} onChange={e => setData('contact_phone', e.target.value)} />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>ملاحظات إضافية (اختياري)</label>
                            <textarea className="rc-ta" placeholder="مثلاً: عندنا عروض خاصة للحجوزات الجماعية، أو تفاصيل أخرى..." value={data.notes} onChange={e => setData('notes', e.target.value)} />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            style={{
                                width: '100%', padding: 15, border: 'none', borderRadius: 14,
                                fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                                background: 'linear-gradient(135deg,#1C1410,#3A2820)', color: '#fff',
                                boxShadow: '0 6px 20px rgba(0,0,0,.3)', transition: 'transform .15s',
                                marginBottom: 14, opacity: processing ? 0.7 : 1,
                            }}
                        >
                            {processing ? 'جارٍ الإرسال...' : 'إرسال طلب الانضمام ←'}
                        </button>

                        <div style={{ textAlign: 'center', fontSize: 13, color: '#7A8BA8' }}>
                            لديك حساب؟ <a href="/club/login" style={{ color: '#C8410A', fontWeight: 700, textDecoration: 'none' }}>سجّل دخولك</a>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
