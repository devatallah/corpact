<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تيمات — عن تيمات</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('landing/styles.css') }}">
  <style>
    body { background: #F0EDE6; color: #0A0A0A; font-family: 'Almarai', sans-serif; line-height: 1.8; }
    .header { padding: 24px 0; border-bottom: 1px solid rgba(10,10,10,0.08); background: #F0EDE6; }
    .page-container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
    .page-container-narrow { max-width: 800px; margin: 0 auto; padding: 0 24px; }
    .logo-row { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #0A0A0A; }
    .logo-text { font-size: 20px; font-weight: 800; }

    .hero { background: #0A0A0A; padding: 140px 0 60px; text-align: center; }
    .hero h1 { font-size: 40px; font-weight: 800; color: #fff; margin-bottom: 12px; }
    .hero .subtitle { font-size: 16px; color: rgba(255,255,255,0.6); max-width: 500px; margin: 0 auto; }

    .section-cream { background: #F0EDE6; padding: 60px 0; }
    .section-dark { background: #0A0A0A; padding: 60px 0; }

    .section-title { font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #0A0A0A; padding-bottom: 8px; border-bottom: 3px solid #C8FF00; display: inline-block; }
    .section-title-light { color: #fff; }
    .section-text { font-size: 15px; color: rgba(10,10,10,0.75); line-height: 2; max-width: 700px; }
    .section-text-light { color: rgba(255,255,255,0.7); }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    .stat-item { padding: 24px 16px; }
    .stat-number { font-size: 36px; font-weight: 800; color: #C8FF00; margin-bottom: 8px; letter-spacing: -0.03em; }
    .stat-label { font-size: 14px; color: rgba(255,255,255,0.6); }

    .vision-mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
    @media (max-width: 768px) { .vision-mission-grid { grid-template-columns: 1fr; gap: 32px; } }
    .vm-card { background: #fff; border-radius: 16px; padding: 32px; border: 1px solid rgba(10,10,10,0.08); }
    .vm-card h3 { font-size: 20px; font-weight: 800; color: #0A0A0A; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .vm-card h3::before { content: ''; display: inline-block; width: 4px; height: 24px; background: #C8FF00; border-radius: 2px; flex-shrink: 0; }
    .vm-card p { font-size: 15px; color: rgba(10,10,10,0.7); line-height: 1.9; }

    .cta-section { background: #C8FF00; padding: 60px 0; text-align: center; }
    .cta-section h2 { font-size: 32px; font-weight: 800; color: #0A0A0A; margin-bottom: 12px; }
    .cta-section p { font-size: 15px; color: rgba(10,10,10,0.7); margin-bottom: 28px; }
    .cta-buttons { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    .cta-btn-dark { display: inline-flex; align-items: center; gap: 6px; padding: 14px 28px; background: #0A0A0A; color: #C8FF00; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 700; transition: background 0.2s; }
    .cta-btn-dark:hover { background: #2A2A28; }
    .cta-btn-outline { display: inline-flex; align-items: center; gap: 6px; padding: 14px 28px; background: transparent; color: #0A0A0A; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 700; border: 2px solid rgba(10,10,10,0.2); transition: border-color 0.2s; }
    .cta-btn-outline:hover { border-color: #0A0A0A; }

    .back-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 48px; padding: 12px 24px; background: #0A0A0A; color: #C8FF00; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 700; }
    .back-link:hover { background: #2A2A28; }
  </style>
</head>
<body>
  @include('partials.site-nav')

  <div class="hero">
    <div class="page-container">
      <h1>عن تيمات</h1>
      <p class="subtitle">منصة الرياضة المؤسسية الأولى في المملكة</p>
    </div>
  </div>

  <div class="section-cream">
    <div class="page-container">
      <h2 class="section-title">قصتنا</h2>
      <p class="section-text">بدأت تيمات من فكرة بسيطة: ماذا لو استطاعت كل شركة أن توفّر لموظفيها تجربة رياضية حقيقية دون عناء التنسيق اليدوي؟ من هنا، بنينا منصة تربط الشركات بأفضل المرافق الرياضية في المملكة — من ملاعب البادل والتنس إلى الأندية الرياضية المتكاملة. تيمات تُحوّل زملاء العمل إلى فريق رياضي حقيقي عبر تقنية تُسهّل الحجز، تُدير الميزانيات، وتبني مجتمعات رياضية نابضة بالحياة داخل كل شركة.</p>

      <div class="vision-mission-grid">
        <div class="vm-card">
          <h3>رؤيتنا</h3>
          <p>أن تصبح كل شركة في المملكة مجتمعاً رياضياً نابضاً بالحياة.</p>
        </div>
        <div class="vm-card">
          <h3>مهمتنا</h3>
          <p>تمكين الشركات من بناء ثقافة عافية حقيقية لموظفيها عبر التقنية.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="section-dark">
    <div class="page-container">
      <h2 class="section-title section-title-light" style="text-align: center; display: block; border-bottom: none; margin-bottom: 40px;">أرقامنا</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">+240</div>
          <div class="stat-label">مزود خدمة</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">20</div>
          <div class="stat-label">مدينة</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">+500</div>
          <div class="stat-label">شركة</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">+10,000</div>
          <div class="stat-label">موظف</div>
        </div>
      </div>
    </div>
  </div>

  <div class="cta-section">
    <div class="page-container">
      <h2>انضم إلى تيمات</h2>
      <p>ابدأ رحلتك مع منصة الرياضة المؤسسية الأولى في المملكة.</p>
      <div class="cta-buttons">
        <a href="/company/register" class="cta-btn-dark">سجّل شركتك</a>
        <a href="/business/register" class="cta-btn-outline">سجّل كمزود خدمة</a>
        <a href="/employees?login=1" class="cta-btn-outline">دخول الموظفين</a>
      </div>
    </div>
  </div>
@include('partials.site-footer')
</body>
</html>
