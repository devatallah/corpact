<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تيمات — الباقات</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('landing/styles.css') }}">
  <style>
    body { background: #F0EDE6; color: #0A0A0A; font-family: 'Almarai', sans-serif; line-height: 1.8; }
    .header { padding: 24px 0; border-bottom: 1px solid rgba(10,10,10,0.08); background: #F0EDE6; }
    .page-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .page-container-narrow { max-width: 800px; margin: 0 auto; padding: 0 24px; }
    .logo-row { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #0A0A0A; }
    .logo-text { font-size: 20px; font-weight: 800; }

    .hero { background: #0A0A0A; padding: 140px 0 60px; text-align: center; }
    .hero h1 { font-size: 40px; font-weight: 800; color: #fff; margin-bottom: 12px; }
    .hero .subtitle { font-size: 16px; color: rgba(255,255,255,0.6); }

    .cards-section { background: #F0EDE6; padding: 60px 0 20px; }
    .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    @media (max-width: 768px) { .cards-grid { grid-template-columns: 1fr; } }

    .card { background: #fff; border-radius: 16px; border: 2px solid rgba(10,10,10,0.08); padding: 36px 28px; display: flex; flex-direction: column; }
    .card.featured { border-color: #C8FF00; }
    .card-badge { display: inline-block; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: rgba(10,10,10,0.06); color: rgba(10,10,10,0.6); margin-bottom: 16px; align-self: flex-start; }
    .card.featured .card-badge { background: #C8FF00; color: #0A0A0A; }
    .card-title { font-size: 24px; font-weight: 800; color: #0A0A0A; margin-bottom: 8px; }
    .card-desc { font-size: 14px; color: rgba(10,10,10,0.6); margin-bottom: 20px; min-height: 44px; }
    .card-size { font-size: 13px; font-weight: 700; color: rgba(10,10,10,0.5); margin-bottom: 24px; padding: 8px 12px; background: #F0EDE6; border-radius: 8px; text-align: center; }
    .card-features { list-style: none; margin-bottom: 32px; flex-grow: 1; }
    .card-features li { font-size: 14px; color: rgba(10,10,10,0.7); padding: 8px 0; border-bottom: 1px solid rgba(10,10,10,0.06); display: flex; align-items: center; gap: 8px; }
    .card-features li::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #C8FF00; flex-shrink: 0; }
    .card-cta { display: block; text-align: center; padding: 14px 24px; border-radius: 12px; font-size: 15px; font-weight: 700; text-decoration: none; transition: all 0.2s ease; }
    .card-cta-primary { background: #0A0A0A; color: #C8FF00; }
    .card-cta-primary:hover { background: #2A2A28; }
    .card-cta-outline { background: transparent; color: #0A0A0A; border: 2px solid rgba(10,10,10,0.15); }
    .card-cta-outline:hover { border-color: #0A0A0A; }

    .compare-section { background: #F0EDE6; padding: 40px 0 60px; }
    .compare-section h2 { font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 32px; }
    .table-wrap { overflow-x: auto; background: #fff; border-radius: 16px; border: 1px solid rgba(10,10,10,0.08); }
    table.compare { width: 100%; border-collapse: collapse; min-width: 640px; }
    .compare th, .compare td { padding: 14px 20px; text-align: center; font-size: 14px; border-bottom: 1px solid rgba(10,10,10,0.06); }
    .compare th:first-child, .compare td:first-child { text-align: right; }
    .compare thead th { font-size: 16px; font-weight: 800; background: #0A0A0A; color: #fff; padding: 18px 20px; }
    .compare thead th.tier-featured { background: #C8FF00; color: #0A0A0A; }
    .compare td.cat { background: #F0EDE6; font-weight: 800; font-size: 14px; color: #0A0A0A; text-align: right; }
    .compare td.feat { color: rgba(10,10,10,0.75); }
    .compare .yes { color: #1e7a46; font-weight: 800; }
    .compare .no { color: rgba(10,10,10,0.25); }
    .compare td.col-featured { background: rgba(200,255,0,0.07); }

    .contact-cta { background: #0A0A0A; padding: 60px 0; text-align: center; }
    .contact-cta h2 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 12px; }
    .contact-cta p { font-size: 15px; color: rgba(255,255,255,0.6); margin-bottom: 28px; }
    .contact-cta a { display: inline-flex; align-items: center; gap: 6px; padding: 14px 32px; background: #C8FF00; color: #0A0A0A; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 700; transition: background 0.2s; }
    .contact-cta a:hover { background: #d4ff33; }
  </style>
</head>
<body>
  @include('partials.site-nav')

  <div class="hero">
    <div class="page-container">
      <h1>باقات تيمات للشركاء</h1>
      <p class="subtitle">بدون رسوم شهرية — عمولة على الحجوزات الناجحة فقط. اختر الباقة المناسبة لحجم منشأتك.</p>
    </div>
  </div>

  <div class="cards-section">
    <div class="page-container">
      <div class="cards-grid">

        <div class="card">
          <span class="card-badge">أساسية</span>
          <h3 class="card-title">الباقة الأساسية</h3>
          <p class="card-desc">للمرافق الصغيرة التي تبدأ باستقبال الحجوزات المؤسسية.</p>
          <div class="card-size">حتى 3 ملاعب</div>
          <ul class="card-features">
            <li>طلبات حجز من شركات موثوقة</li>
            <li>تقويم أسبوعي موحد لكل الملاعب</li>
            <li>أسعار حسب مدة الحجز</li>
            <li>تسويات شهرية تلقائية</li>
            <li>دعم عبر البريد الإلكتروني</li>
          </ul>
          <a href="/partners#register" class="card-cta card-cta-outline">سجّل كشريك</a>
        </div>

        <div class="card featured">
          <span class="card-badge">الأكثر طلباً</span>
          <h3 class="card-title">الباقة المتقدمة</h3>
          <p class="card-desc">للأندية النشطة التي تريد ملء الأوقات الهادئة وزيادة الإيراد.</p>
          <div class="card-size">حتى 10 ملاعب</div>
          <ul class="card-features">
            <li>كل مزايا الباقة الأساسية</li>
            <li>أسعار الذروة وخارج الذروة</li>
            <li>أسعار مخصصة حسب اليوم</li>
            <li>خصومات مستهدفة للشركات والمجتمعات</li>
            <li>تقارير أداء وإيرادات</li>
            <li>دعم ذو أولوية</li>
          </ul>
          <a href="/partners#register" class="card-cta card-cta-primary">سجّل كشريك</a>
        </div>

        <div class="card">
          <span class="card-badge">مميزة</span>
          <h3 class="card-title">الباقة المميزة</h3>
          <p class="card-desc">للسلاسل والمنشآت الرياضية متعددة الفروع.</p>
          <div class="card-size">ملاعب وفروع بدون حد</div>
          <ul class="card-features">
            <li>كل مزايا الباقة المتقدمة</li>
            <li>أولوية الظهور في نتائج البحث</li>
            <li>تقارير قابلة للتصدير</li>
            <li>شروط عمولة تفضيلية</li>
            <li>مدير حساب مخصص</li>
          </ul>
          <a href="/partners#register" class="card-cta card-cta-outline">سجّل كشريك</a>
        </div>

      </div>
    </div>
  </div>

  <div class="compare-section">
    <div class="page-container">
      <h2>قارن المزايا بالتفصيل</h2>
      <div class="table-wrap">
        <table class="compare">
          <thead>
            <tr>
              <th>الميزة</th>
              <th>الأساسية</th>
              <th class="tier-featured">المتقدمة</th>
              <th>المميزة</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="cat" colspan="4">الملاعب والمرافق</td></tr>
            <tr><td class="feat">عدد الملاعب</td><td>حتى 3</td><td class="col-featured">حتى 10</td><td>بدون حد</td></tr>
            <tr><td class="feat">إدارة الملاعب حسب الرياضة</td><td class="yes">✓</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">تقويم أسبوعي موحد لكل الملاعب</td><td class="yes">✓</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">فروع متعددة بحساب واحد</td><td class="no">—</td><td class="col-featured no">—</td><td class="yes">✓</td></tr>

            <tr><td class="cat" colspan="4">الأسعار والخصومات</td></tr>
            <tr><td class="feat">أسعار حسب مدة الحجز (60/90/120 دقيقة)</td><td class="yes">✓</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">أسعار الذروة وخارج الذروة</td><td class="no">—</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">أسعار مخصصة حسب اليوم</td><td class="no">—</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">خصومات مستهدفة لشركات أو مجتمعات محددة</td><td class="no">—</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>

            <tr><td class="cat" colspan="4">الحجوزات والعملاء</td></tr>
            <tr><td class="feat">طلبات حجز جماعية من شركات موثوقة</td><td class="yes">✓</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">قبول أو رفض أو اقتراح بديل لكل طلب</td><td class="yes">✓</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">أولوية الظهور في نتائج البحث</td><td class="no">—</td><td class="col-featured no">—</td><td class="yes">✓</td></tr>

            <tr><td class="cat" colspan="4">التسويات والتقارير</td></tr>
            <tr><td class="feat">تسويات شهرية تلقائية وشفافة</td><td class="yes">✓</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">تقارير أداء وإيرادات</td><td class="no">—</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">تقارير قابلة للتصدير</td><td class="no">—</td><td class="col-featured no">—</td><td class="yes">✓</td></tr>
            <tr><td class="feat">شروط عمولة تفضيلية</td><td class="no">—</td><td class="col-featured no">—</td><td class="yes">✓</td></tr>

            <tr><td class="cat" colspan="4">الدعم</td></tr>
            <tr><td class="feat">دعم عبر البريد الإلكتروني</td><td class="yes">✓</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">دعم ذو أولوية</td><td class="no">—</td><td class="col-featured yes">✓</td><td class="yes">✓</td></tr>
            <tr><td class="feat">مدير حساب مخصص</td><td class="no">—</td><td class="col-featured no">—</td><td class="yes">✓</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="contact-cta">
    <div class="page-container">
      <h2>غير متأكد من الباقة المناسبة؟</h2>
      <p>سجّل منشأتك وسيتواصل معك فريق الشراكات خلال 48 ساعة لاختيار الأنسب لك.</p>
      <a href="/partners#register">
        سجّل كشريك
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="transform:scaleX(-1)"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </a>
    </div>
  </div>
@include('partials.site-footer')
</body>
</html>
