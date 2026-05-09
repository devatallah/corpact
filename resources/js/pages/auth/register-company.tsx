import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

const sectors = [
    'تقنية المعلومات', 'البنوك والخدمات المالية', 'الاتصالات', 'التعليم',
    'الرعاية الصحية', 'العقارات', 'الطاقة والبترول', 'التجزئة والتجارة', 'الحكومي', 'أخرى',
];

const employeeCounts = ['أقل من 50', '50 – 100', '101 – 500', '501 – 1000', 'أكثر من 1000'];

const cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'أخرى'];

export default function RegisterCompany() {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [submitted, setSubmitted] = useState(!!flash?.success);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        sector: '',
        employee_count_range: '',
        domain: '',
        city: '',
        hr_name: '',
        hr_title: '',
        hr_phone: '',
        notes: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/company/register', {
            onSuccess: () => setSubmitted(true),
        });
    }

    if (submitted) {
        return (
            <>
                <Head title="تم إرسال الطلب" />
                <div className="co-reg-page" dir="rtl">
                    <div className="co-reg-logo">
                        <div className="co-reg-logo-ar">كورباكت</div>
                        <div className="co-reg-logo-en">CORPACT</div>
                    </div>
                    <div className="co-reg-card" style={{ textAlign: 'center', maxWidth: 500 }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F1923', marginBottom: 8 }}>تم إرسال طلبك!</h2>
                        <p style={{ fontSize: 14, color: '#7A8BA8', marginBottom: 28, lineHeight: 1.7 }}>
                            استلمنا طلب تسجيل شركتك وسيتواصل معك فريقنا خلال 48 ساعة.
                        </p>

                        <div style={{ background: '#F4F6FA', borderRadius: 14, padding: '16px 20px', textAlign: 'right', marginBottom: 24 }}>
                            {[
                                { n: '1', t: 'يراجع فريق كورباكت بيانات شركتك' },
                                { n: '2', t: 'يتواصل معك لشرح آلية الاشتراك والتسعير' },
                                { n: '3', t: 'بعد الاعتماد، يصلك رابط تفعيل حساب الشركة' },
                                { n: '4', t: 'تبدأ تفعيل مجتمعات موظفيك فوراً' },
                            ].map(step => (
                                <div key={step.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: '#4A5C78' }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', background: '#3B5BDB', color: '#fff',
                                        fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                                    }}>{step.n}</div>
                                    <span>{step.t}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/company/login" style={{
                            display: 'inline-block', fontSize: 13, color: '#3B5BDB', fontWeight: 700, textDecoration: 'none',
                        }}>
                            ← العودة لتسجيل الدخول
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="تسجيل شركة — كورباكت" />
            <div className="co-reg-page" dir="rtl">
                <div className="co-reg-logo">
                    <div className="co-reg-logo-ar">كورباكت</div>
                    <div className="co-reg-logo-en">CORPACT</div>
                </div>
                <div className="co-reg-card">
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0F1923', marginBottom: 4 }}>تسجيل شركة جديدة</h1>
                    <p style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 28, lineHeight: 1.5 }}>
                        سيتم مراجعة طلبك من فريق كورباكت والتواصل معك خلال 48 ساعة
                    </p>

                    <div style={{ background: '#3B5BDB10', border: '1px solid #3B5BDB33', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: '#3B5BDB', lineHeight: 1.7 }}>
                        <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>📋 ماذا يحدث بعد التسجيل؟</strong>
                        سيستلم فريقنا طلبك، يراجع بيانات الشركة، ويتواصل مع مسؤول الشركة لتفعيل الحساب وشرح آلية الاستخدام.
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <div style={{ background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                            {Object.values(errors).map((err, i) => (
                                <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px', fontWeight: 600 }}>{err}</p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        {/* Company Info */}
                        <div className="co-section-label">بيانات الشركة</div>

                        <div className="co-field">
                            <label>اسم الشركة *</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="شركة التقنية المتقدمة" required />
                        </div>

                        <div className="co-frow">
                            <div className="co-field">
                                <label>القطاع *</label>
                                <select value={data.sector} onChange={e => setData('sector', e.target.value)} required>
                                    <option value="">اختر القطاع</option>
                                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="co-field">
                                <label>عدد الموظفين *</label>
                                <select value={data.employee_count_range} onChange={e => setData('employee_count_range', e.target.value)} required>
                                    <option value="">اختر</option>
                                    {employeeCounts.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="co-field">
                            <label>نطاق الشركة *</label>
                            <input type="text" dir="ltr" value={data.domain} onChange={e => setData('domain', e.target.value)} placeholder="company.com" required />
                            <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 5, lineHeight: 1.5 }}>
                                الجزء الذي يأتي بعد <strong style={{ color: '#3B5BDB' }}>@</strong> في إيميل موظفيك
                            </div>
                        </div>

                        <div className="co-field">
                            <label>البريد الإلكتروني للموارد البشرية *</label>
                            <input type="email" dir="ltr" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="hr@company.com" required />
                        </div>

                        <div className="co-field">
                            <label>المدينة *</label>
                            <select value={data.city} onChange={e => setData('city', e.target.value)} required>
                                <option value="">اختر المدينة</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Company Contact Info */}
                        <div className="co-section-label">بيانات مسؤول الشركة</div>

                        <div className="co-frow">
                            <div className="co-field">
                                <label>الاسم الكامل *</label>
                                <input type="text" value={data.hr_name} onChange={e => setData('hr_name', e.target.value)} placeholder="نورة السعيد" required />
                            </div>
                            <div className="co-field">
                                <label>المسمى الوظيفي *</label>
                                <input type="text" value={data.hr_title} onChange={e => setData('hr_title', e.target.value)} placeholder="مدير الموارد البشرية" required />
                            </div>
                        </div>

                        <div className="co-field">
                            <label>رقم الجوال *</label>
                            <input type="tel" dir="ltr" value={data.hr_phone} onChange={e => setData('hr_phone', e.target.value)} placeholder="05XXXXXXXX" required />
                        </div>

                        {/* Notes */}
                        <div className="co-field">
                            <label>ملاحظات إضافية (اختياري)</label>
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="أي تفاصيل إضافية تودّ مشاركتها..." />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="co-submit-btn"
                            style={{ opacity: processing ? 0.6 : 1 }}
                        >
                            {processing ? 'جارٍ الإرسال...' : 'إرسال طلب التسجيل ←'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: 13, color: '#7A8BA8' }}>
                            لديك حساب بالفعل؟{' '}
                            <Link href="/company/login" style={{ color: '#3B5BDB', fontWeight: 700, textDecoration: 'none' }}>
                                سجّل دخولك
                            </Link>
                        </p>

                        <div style={{ borderTop: '1px solid #E4E9F2', paddingTop: 16, marginTop: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 8 }}>بوابات أخرى</div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <Link href="/club/login" style={{ padding: '6px 12px', border: '1px solid #E4E9F2', borderRadius: 8, fontSize: 12, color: '#4A5C78', textDecoration: 'none' }}>🏟️ الأندية</Link>
                                <Link href="/employee/login" style={{ padding: '6px 12px', border: '1px solid #E4E9F2', borderRadius: 8, fontSize: 12, color: '#4A5C78', textDecoration: 'none' }}>👥 الموظفون</Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
