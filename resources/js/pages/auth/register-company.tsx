import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

const sectors = [
    'تقنية المعلومات', 'البنوك والخدمات المالية', 'الاتصالات', 'التعليم',
    'الرعاية الصحية', 'العقارات', 'الطاقة والبترول', 'التجزئة والتجارة', 'الحكومي', 'أخرى',
];

const employeeCounts = ['أقل من 50', '50 – 100', '101 – 500', '501 – 1000', 'أكثر من 1000'];

const cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'أخرى'];

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #E8E2D8',
    borderRadius: 12,
    fontSize: 14,
    color: '#1A1A18',
    background: '#F5F0E8',
    outline: 'none',
    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
};

const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'auto' as const,
};

const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'vertical' as const,
    minHeight: 80,
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: '#8A8A7A',
    fontWeight: 500,
    marginBottom: 6,
    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
};

const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: 14,
    background: '#1A1A18',
    color: '#C8F135',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
};

const sectionLabel: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: '#1A1A18',
    margin: '20px 0 14px',
    paddingBottom: 8,
    borderBottom: '1px solid #E8E2D8',
    fontFamily: "'Cairo', sans-serif",
};

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
                <div dir="rtl" style={{
                    minHeight: '100vh',
                    background: '#F5F0E8',
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                }}>
                    {/* Nav bar */}
                    <nav style={{
                        position: 'sticky', top: 0, zIndex: 50,
                        background: 'rgba(245,240,232,.8)', backdropFilter: 'blur(8px)',
                        borderBottom: '1px solid #E8E2D8',
                    }}>
                        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                                <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 22, color: '#1A1A18' }}>تيمات</span>
                            </a>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <a href="/companies" style={{ fontSize: 14, fontWeight: 600, color: '#8A8A7A', textDecoration: 'none', fontFamily: "'Cairo', sans-serif" }}>للشركات</a>
                                <a href="/employees" style={{ fontSize: 14, fontWeight: 600, color: '#8A8A7A', textDecoration: 'none', fontFamily: "'Cairo', sans-serif" }}>للموظفين</a>
                                <a href="/businesses" style={{ fontSize: 14, fontWeight: 600, color: '#8A8A7A', textDecoration: 'none', fontFamily: "'Cairo', sans-serif" }}>لمزودي الخدمة</a>
                            </div>
                        </div>
                    </nav>

                    {/* Center content */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 16px' }}>
                        <div style={{
                            background: '#fff',
                            border: '1px solid #E8E2D8',
                            borderRadius: 20,
                            padding: '36px 32px',
                            width: '100%',
                            maxWidth: 460,
                            boxShadow: '0 4px 24px rgba(26,26,24,.06)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
                            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A18', marginBottom: 8, fontFamily: "'Cairo', sans-serif" }}>تم إرسال طلبك!</h2>
                            <p style={{ fontSize: 14, color: '#8A8A7A', marginBottom: 28, lineHeight: 1.7 }}>
                                استلمنا طلب تسجيل شركتك وسيتواصل معك فريقنا خلال 48 ساعة.
                            </p>

                            <div style={{ background: '#F5F0E8', borderRadius: 12, padding: '16px 20px', textAlign: 'right', marginBottom: 24, border: '1px solid #E8E2D8' }}>
                                {[
                                    { n: '1', t: 'يراجع فريق تيمات بيانات شركتك' },
                                    { n: '2', t: 'يتواصل معك لشرح آلية الاشتراك والتسعير' },
                                    { n: '3', t: 'بعد الاعتماد، يصلك رابط تفعيل حساب الشركة' },
                                    { n: '4', t: 'تبدأ تفعيل مجتمعات موظفيك فوراً' },
                                ].map(step => (
                                    <div key={step.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: '#8A8A7A' }}>
                                        <div style={{
                                            width: 22, height: 22, borderRadius: '50%', background: '#1A1A18', color: '#C8F135',
                                            fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                                        }}>{step.n}</div>
                                        <span>{step.t}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/company/login" style={{
                                display: 'inline-block', fontSize: 13, color: '#C4622D', fontWeight: 600, textDecoration: 'none',
                            }}>
                                العودة لتسجيل الدخول
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', padding: '20px', fontSize: 12, color: '#8A8A7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                        &copy; 2026 تيمات. جميع الحقوق محفوظة.
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="تسجيل شركة — تيمات" />
            <div dir="rtl" style={{
                minHeight: '100vh',
                background: '#F5F0E8',
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            }}>
                {/* Nav bar */}
                <nav style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(245,240,232,.8)', backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #E8E2D8',
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 22, color: '#1A1A18' }}>تيمات</span>
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <a href="/companies" style={{ fontSize: 14, fontWeight: 600, color: '#8A8A7A', textDecoration: 'none', fontFamily: "'Cairo', sans-serif" }}>للشركات</a>
                            <a href="/employees" style={{ fontSize: 14, fontWeight: 600, color: '#8A8A7A', textDecoration: 'none', fontFamily: "'Cairo', sans-serif" }}>للموظفين</a>
                            <a href="/businesses" style={{ fontSize: 14, fontWeight: 600, color: '#8A8A7A', textDecoration: 'none', fontFamily: "'Cairo', sans-serif" }}>لمزودي الخدمة</a>
                        </div>
                    </div>
                </nav>

                {/* Center content */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 16px' }}>
                    <div style={{
                        background: '#fff',
                        border: '1px solid #E8E2D8',
                        borderRadius: 20,
                        padding: '36px 32px',
                        width: '100%',
                        maxWidth: 460,
                        boxShadow: '0 4px 24px rgba(26,26,24,.06)',
                    }}>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', marginBottom: 4, fontFamily: "'Cairo', sans-serif" }}>تسجيل شركة جديدة</h1>
                        <p style={{ fontSize: 13, color: '#8A8A7A', marginBottom: 28, lineHeight: 1.5 }}>
                            سيتم مراجعة طلبك من فريق تيمات والتواصل معك خلال 48 ساعة
                        </p>

                        <div style={{ background: '#1A1A1808', border: '1px solid #C8F13540', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: '#1A1A18', lineHeight: 1.7 }}>
                            <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>ماذا يحدث بعد التسجيل؟</strong>
                            سيستلم فريقنا طلبك، يراجع بيانات الشركة، ويتواصل مع مسؤول الشركة لتفعيل الحساب وشرح آلية الاستخدام.
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div style={{ background: '#c0392b10', border: '1px solid #c0392b30', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
                                {Object.values(errors).map((err, i) => (
                                    <p key={i} style={{ fontSize: 12, color: '#c0392b', margin: '0 0 4px', fontWeight: 600 }}>{err}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            {/* Company Info */}
                            <div style={sectionLabel}>بيانات الشركة</div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>اسم الشركة *</label>
                                <input style={inputStyle} type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="شركة التقنية المتقدمة" required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>القطاع *</label>
                                    <select style={selectStyle} value={data.sector} onChange={e => setData('sector', e.target.value)} required>
                                        <option value="">اختر القطاع</option>
                                        {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>عدد الموظفين *</label>
                                    <select style={selectStyle} value={data.employee_count_range} onChange={e => setData('employee_count_range', e.target.value)} required>
                                        <option value="">اختر</option>
                                        {employeeCounts.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>نطاق الشركة *</label>
                                <input style={{ ...inputStyle, direction: 'ltr' }} type="text" value={data.domain} onChange={e => setData('domain', e.target.value)} placeholder="company.com" required />
                                <div style={{ fontSize: 11, color: '#8A8A7A', marginTop: 5, lineHeight: 1.5 }}>
                                    الجزء الذي يأتي بعد <strong style={{ color: '#C4622D' }}>@</strong> في إيميل موظفيك
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>البريد الإلكتروني للموارد البشرية *</label>
                                <input style={{ ...inputStyle, direction: 'ltr' }} type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="hr@company.com" required />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>المدينة *</label>
                                <select style={selectStyle} value={data.city} onChange={e => setData('city', e.target.value)} required>
                                    <option value="">اختر المدينة</option>
                                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Company Contact Info */}
                            <div style={sectionLabel}>بيانات مسؤول الشركة</div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>الاسم الكامل *</label>
                                    <input style={inputStyle} type="text" value={data.hr_name} onChange={e => setData('hr_name', e.target.value)} placeholder="نورة السعيد" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>المسمى الوظيفي *</label>
                                    <input style={inputStyle} type="text" value={data.hr_title} onChange={e => setData('hr_title', e.target.value)} placeholder="مدير الموارد البشرية" required />
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>رقم الجوال *</label>
                                <input style={{ ...inputStyle, direction: 'ltr' }} type="tel" value={data.hr_phone} onChange={e => setData('hr_phone', e.target.value)} placeholder="05XXXXXXXX" required />
                            </div>

                            {/* Notes */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>ملاحظات إضافية (اختياري)</label>
                                <textarea style={textareaStyle} value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="أي تفاصيل إضافية تودّ مشاركتها..." />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{ ...btnStyle, opacity: processing ? 0.6 : 1, marginBottom: 16 }}
                            >
                                {processing ? 'جارٍ الإرسال...' : 'إرسال طلب التسجيل'}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: 13, color: '#8A8A7A' }}>
                                لديك حساب بالفعل؟{' '}
                                <Link href="/company/login" style={{ color: '#C4622D', fontWeight: 600, textDecoration: 'none' }}>
                                    سجّل دخولك
                                </Link>
                            </p>

                            <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: 16, marginTop: 16, textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: '#8A8A7A', marginBottom: 8 }}>بوابات أخرى</div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                    <Link href="/business/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>المنشآت</Link>
                                    <Link href="/employee/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>الموظفون</Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', padding: '20px', fontSize: 12, color: '#8A8A7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                    &copy; 2026 تيمات. جميع الحقوق محفوظة.
                </div>
            </div>
        </>
    );
}
