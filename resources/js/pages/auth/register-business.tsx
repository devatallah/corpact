import { Head, useForm, usePage } from '@inertiajs/react';
import CategoryIcon from '@/components/category-icon';
import { useState, type FormEvent } from 'react';

interface Category {
    id: number;
    name: string;
    icon: string | null;
    parent_id: number | null;
    children?: Category[];
}

interface Props {
    categories: Category[];
}

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

export default function Registerbusiness({ categories }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [submitted, setSubmitted] = useState(!!flash?.success);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        city: '',
        district: '',
        categories: [] as number[],
        venues_count: 1,
        working_hours: '',
        contact_name: '',
        contact_title: '',
        contact_phone: '',
        notes: '',
    });

    function toggleSport(id: number) {
        setData('categories', data.categories.includes(id)
            ? data.categories.filter(s => s !== id)
            : [...data.categories, id]
        );
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/business/register', {
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
                            <div style={{ fontSize: 60, marginBottom: 16 }}>🎯</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A18', marginBottom: 8, fontFamily: "'Cairo', sans-serif" }}>تم إرسال طلبك!</div>
                            <div style={{ fontSize: 14, color: '#8A8A7A', lineHeight: 1.6, marginBottom: 24 }}>
                                استلمنا طلب انضمام <strong>{data.name || 'منشأتك'}</strong> وسيتواصل معك فريقنا على <strong>{data.email}</strong> خلال 48 ساعة.
                            </div>
                            <div style={{ background: '#F5F0E8', borderRadius: 12, padding: '16px 20px', textAlign: 'right', marginBottom: 24, border: '1px solid #E8E2D8' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: '#8A8A7A' }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1A1A18', color: '#C8F135', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>1</div>
                                    <span>يراجع فريق تيمات بيانات منشأتك</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: '#8A8A7A' }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1A1A18', color: '#C8F135', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>2</div>
                                    <span>يتواصل معك لشرح آلية العمل</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#8A8A7A' }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1A1A18', color: '#C8F135', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>3</div>
                                    <span>يُفعّل حسابك وتبدأ تستقبل الحجوزات</span>
                                </div>
                            </div>
                            <a href="/business/login" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#C4622D', fontWeight: 600, textDecoration: 'none' }}>العودة للصفحة الرئيسية</a>
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

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <>
            <Head title="تسجيل منشأة — تيمات" />

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
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', marginBottom: 4, fontFamily: "'Cairo', sans-serif" }}>تسجيل منشأة جديدة</div>
                        <div style={{ fontSize: 13, color: '#8A8A7A', marginBottom: 28, lineHeight: 1.5 }}>انضم لشبكة تيمات واستقبل حجوزات من شركات ومجتمعات الموظفين</div>

                        {/* Info box */}
                        <div style={{ background: '#1A1A1808', border: '1px solid #C8F13540', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: '#1A1A18', lineHeight: 1.7 }}>
                            <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>ماذا تستفيد كمنشأة؟</strong>
                            تصلك حجوزات جماعية منظمة من شركات شريكة، مع تسويات مالية واضحة وسهلة الإدارة.
                        </div>

                        {/* Error messages */}
                        {hasErrors && (
                            <div style={{ background: '#c0392b10', border: '1px solid #c0392b30', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#c0392b', fontWeight: 600, marginBottom: 14 }}>
                                {Object.values(errors).map((err, i) => (
                                    <div key={i}>{err}</div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            {/* Section: Business info */}
                            <div style={sectionLabel}>بيانات المنشأة</div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>اسم المنشأة</label>
                                <input style={inputStyle} type="text" placeholder="منشأة الفئة الحديثة" value={data.name} onChange={e => setData('name', e.target.value)} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>المدينة</label>
                                    <select style={selectStyle} value={data.city} onChange={e => setData('city', e.target.value)}>
                                        <option value="">اختر المدينة</option>
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>الحي / المنطقة</label>
                                    <input style={inputStyle} type="text" placeholder="حي النرجس" value={data.district} onChange={e => setData('district', e.target.value)} />
                                </div>
                            </div>

                            {/* Category checkboxes */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>الفئات المتاحة في المنشأة</label>
                                {categories.map(cat => (
                                    <div key={cat.id} style={{ marginBottom: 10 }}>
                                        {cat.children && cat.children.length > 0 ? (
                                            <>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: '#8A8A7A', marginBottom: 6 }}>{cat.name}</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                    {cat.children.map(sub => {
                                                        const checked = data.categories.includes(sub.id);
                                                        return (
                                                            <div
                                                                key={sub.id}
                                                                onClick={() => toggleSport(sub.id)}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: 8,
                                                                    padding: '10px 12px', border: `1px solid ${checked ? '#C8F135' : '#E8E2D8'}`,
                                                                    borderRadius: 12, cursor: 'pointer', transition: 'all .15s',
                                                                    background: checked ? '#1A1A1808' : '#fff',
                                                                }}
                                                            >
                                                                <input type="checkbox" checked={checked} readOnly style={{ width: 16, height: 16, accentColor: '#C8F135', cursor: 'pointer' }} />
                                                                <label style={{ fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                                                                    <CategoryIcon icon={sub.icon} size={16} /> {sub.name}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                {(() => {
                                                    const checked = data.categories.includes(cat.id);
                                                    return (
                                                        <div
                                                            onClick={() => toggleSport(cat.id)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 8,
                                                                padding: '10px 12px', border: `1px solid ${checked ? '#C8F135' : '#E8E2D8'}`,
                                                                borderRadius: 12, cursor: 'pointer', transition: 'all .15s',
                                                                background: checked ? '#1A1A1808' : '#fff',
                                                            }}
                                                        >
                                                            <input type="checkbox" checked={checked} readOnly style={{ width: 16, height: 16, accentColor: '#C8F135', cursor: 'pointer' }} />
                                                            <label style={{ fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                                                                <CategoryIcon icon={cat.icon} size={16} /> {cat.name}
                                                            </label>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>عدد المرافق الإجمالي</label>
                                    <input style={{ ...inputStyle, direction: 'ltr' }} type="number" placeholder="4" min={1} value={data.venues_count} onChange={e => setData('venues_count', parseInt(e.target.value) || 1)} />
                                </div>
                                <div>
                                    <label style={labelStyle}>ساعات العمل</label>
                                    <input style={inputStyle} type="text" placeholder="6ص – 12م" value={data.working_hours} onChange={e => setData('working_hours', e.target.value)} />
                                </div>
                            </div>

                            {/* Section: Manager info */}
                            <div style={sectionLabel}>بيانات مسؤول المنشأة</div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>الاسم الكامل</label>
                                    <input style={inputStyle} type="text" placeholder="محمد العتيبي" value={data.contact_name} onChange={e => setData('contact_name', e.target.value)} />
                                </div>
                                <div>
                                    <label style={labelStyle}>المسمى الوظيفي</label>
                                    <input style={inputStyle} type="text" placeholder="مدير المنشأة" value={data.contact_title} onChange={e => setData('contact_title', e.target.value)} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>البريد الإلكتروني</label>
                                <input style={{ ...inputStyle, direction: 'ltr' }} type="email" placeholder="info@business.com" value={data.email} onChange={e => setData('email', e.target.value)} />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>رقم الجوال</label>
                                <input style={{ ...inputStyle, direction: 'ltr' }} type="tel" placeholder="05xxxxxxxx" value={data.contact_phone} onChange={e => setData('contact_phone', e.target.value)} />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>ملاحظات إضافية (اختياري)</label>
                                <textarea style={textareaStyle} placeholder="مثلاً: عندنا عروض خاصة للحجوزات الجماعية، أو تفاصيل أخرى..." value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{ ...btnStyle, opacity: processing ? 0.6 : 1, marginBottom: 14 }}
                            >
                                {processing ? 'جارٍ الإرسال...' : 'إرسال طلب الانضمام'}
                            </button>

                            <div style={{ textAlign: 'center', fontSize: 13, color: '#8A8A7A' }}>
                                لديك حساب؟ <a href="/business/login" style={{ color: '#C4622D', fontWeight: 600, textDecoration: 'none' }}>سجّل دخولك</a>
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
