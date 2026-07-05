<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تيمات — الباقات والأسعار</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #F0EDE6; color: #0A0A0A; font-family: 'Almarai', sans-serif; line-height: 1.8; }
    .header { padding: 24px 0; border-bottom: 1px solid rgba(10,10,10,0.08); background: #F0EDE6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .container-narrow { max-width: 800px; margin: 0 auto; padding: 0 24px; }
    .logo-row { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #0A0A0A; }
    .logo-text { font-size: 20px; font-weight: 800; }

    .hero { background: #0A0A0A; padding: 80px 0 60px; text-align: center; }
    .hero h1 { font-size: 40px; font-weight: 800; color: #fff; margin-bottom: 12px; }
    .hero .subtitle { font-size: 16px; color: rgba(255,255,255,0.6); }

    .cards-section { background: #F0EDE6; padding: 60px 0 40px; }
    .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    @media (max-width: 768px) { .cards-grid { grid-template-columns: 1fr; } }

    .card { background: #fff; border-radius: 16px; border: 2px solid rgba(10,10,10,0.08); padding: 36px 28px; display: flex; flex-direction: column; }
    .card.featured { border-color: #C8FF00; }
    .card-badge { display: inline-block; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: rgba(10,10,10,0.06); color: rgba(10,10,10,0.6); margin-bottom: 16px; align-self: flex-start; }
    .card.featured .card-badge { background: #C8FF00; color: #0A0A0A; }
    .card-title { font-size: 22px; font-weight: 800; color: #0A0A0A; margin-bottom: 8px; }
    .card-price { font-size: 28px; font-weight: 800; color: #0A0A0A; margin-bottom: 4px; }
    .card-price-note { font-size: 13px; color: rgba(10,10,10,0.5); margin-bottom: 24px; }
    .card-features { list-style: none; margin-bottom: 32px; flex-grow: 1; }
    .card-features li { font-size: 14px; color: rgba(10,10,10,0.7); padding: 8px 0; border-bottom: 1px solid rgba(10,10,10,0.06); display: flex; align-items: center; gap: 8px; }
    .card-features li::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #C8FF00; flex-shrink: 0; }
    .card-cta { display: block; text-align: center; padding: 14px 24px; border-radius: 12px; font-size: 15px; font-weight: 700; text-decoration: none; transition: all 0.2s ease; }
    .card-cta-primary { background: #0A0A0A; color: #C8FF00; }
    .card-cta-primary:hover { background: #2A2A28; }
    .card-cta-outline { background: transparent; color: #0A0A0A; border: 2px solid rgba(10,10,10,0.15); }
    .card-cta-outline:hover { border-color: #0A0A0A; }

    .bottom-note { text-align: center; padding: 0 0 40px; font-size: 13px; color: rgba(10,10,10,0.5); }

    .contact-cta { background: #0A0A0A; padding: 60px 0; text-align: center; }
    .contact-cta h2 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 12px; }
    .contact-cta p { font-size: 15px; color: rgba(255,255,255,0.6); margin-bottom: 28px; }
    .contact-cta a { display: inline-flex; align-items: center; gap: 6px; padding: 14px 32px; background: #C8FF00; color: #0A0A0A; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 700; transition: background 0.2s; }
    .contact-cta a:hover { background: #d4ff33; }

    .back-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 48px; padding: 12px 24px; background: #0A0A0A; color: #C8FF00; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 700; }
    .back-link:hover { background: #2A2A28; }
  </style>
</head>
<body>
  <div class="header">
    <div class="container-narrow">
      <a href="/" class="logo-row">
        <svg width="32" height="32" viewBox="0 0 52 52"><rect width="52" height="52" rx="13" fill="#C8FF00"/><rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A"/><rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A"/></svg>
        <span class="logo-text">تيمات</span>
      </a>
    </div>
  </div>

  <div class="hero">
    <div class="container">
      <h1>الباقات والأسعار</h1>
      <p class="subtitle">رسوم واضحة بدون مفاجآت</p>
    </div>
  </div>

  <div class="cards-section">
    <div class="container">
      <div class="cards-grid">

        <div class="card">
          <span class="card-badge">للشركات</span>
          <h3 class="card-title">باقة الشركات</h3>
          <div class="card-price">تواصل معنا</div>
          <div class="card-price-note">باقة مخصّصة حسب حجم شركتك</div>
          <ul class="card-features">
            <li>لوحة تحكم HR</li>
            <li>دعم ميزانية الموظفين</li>
            <li>تقارير شهرية</li>
            <li>مجتمعات رياضية</li>
            <li>بطولات داخلية</li>
            <li>دعم فني مخصص</li>
          </ul>
          <a href="/company/register" class="card-cta card-cta-primary">سجّل شركتك</a>
        </div>

        <div class="card featured">
          <span class="card-badge">للموظفين</span>
          <h3 class="card-title">مجاني للموظفين</h3>
          <div class="card-price" style="direction:rtl;">٠ ر.س</div>
          <div class="card-price-note">مجاني بالكامل للموظفين</div>
          <ul class="card-features">
            <li>حجز الملاعب</li>
            <li>دعوة الزملاء</li>
            <li>متابعة النشاط</li>
            <li>الانضمام للبطولات</li>
            <li>رصيد مدعوم من الشركة</li>
          </ul>
          <a href="/employees?login=1" class="card-cta card-cta-primary">سجّل دخولك</a>
        </div>

        <div class="card">
          <span class="card-badge">لمزودي الخدمة</span>
          <h3 class="card-title">باقة مزودي الخدمة</h3>
          <div class="card-price">عمولة على كل حجز</div>
          <div class="card-price-note">لا رسوم شهرية — تدفع فقط عند نجاح الحجز</div>
          <ul class="card-features">
            <li>عملاء مؤسسيون</li>
            <li>إدارة الحجوزات</li>
            <li>تسويات شهرية تلقائية</li>
            <li>تقارير الأداء</li>
            <li>دعم فني</li>
          </ul>
          <a href="/business/register" class="card-cta card-cta-outline">سجّل كمزود خدمة</a>
        </div>

      </div>
    </div>
  </div>

  <div class="bottom-note">
    <div class="container">
      <p>جميع الأسعار لا تشمل ضريبة القيمة المضافة (15%)</p>
    </div>
  </div>

  <div class="contact-cta">
    <div class="container">
      <h2>تواصل معنا للحصول على عرض مخصص</h2>
      <p>فريقنا جاهز لمساعدتك في اختيار الباقة المناسبة لاحتياجات شركتك.</p>
      <a href="/support">
        تواصل معنا
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="transform:scaleX(-1)"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </a>
    </div>
  </div>
</body>
</html>
