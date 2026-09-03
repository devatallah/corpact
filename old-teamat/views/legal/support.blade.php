<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تيمات — الدعم والمساعدة</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('landing/styles.css') }}">
  <style>
    body { padding-top: 72px; background: #F0EDE6; color: #0A0A0A; font-family: 'Almarai', sans-serif; line-height: 1.8; }
    .header { padding: 24px 0; border-bottom: 1px solid rgba(10,10,10,0.08); }
    .page-container { max-width: 800px; margin: 0 auto; padding: 0 24px; }
    .logo-row { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #0A0A0A; }
    .logo-text { font-size: 20px; font-weight: 800; }
    .content { padding: 48px 0 80px; }
    h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: rgba(10,10,10,0.5); margin-bottom: 48px; }
    h2 { font-size: 20px; font-weight: 700; margin-top: 40px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #C8FF00; display: inline-block; }
    p { font-size: 15px; color: rgba(10,10,10,0.75); margin-bottom: 16px; }
    .contact-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; margin-bottom: 48px; }
    @media (max-width: 600px) { .contact-cards { grid-template-columns: 1fr; } }
    .contact-card { background: #fff; border: 1px solid rgba(10,10,10,0.08); border-radius: 16px; padding: 24px; text-align: center; text-decoration: none; color: #0A0A0A; transition: border-color 0.2s, box-shadow 0.2s; }
    .contact-card:hover { border-color: #C8FF00; box-shadow: 0 4px 20px rgba(10,10,10,0.08); }
    .contact-card .icon { font-size: 32px; margin-bottom: 12px; }
    .contact-card .label { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
    .contact-card .value { font-size: 13px; color: rgba(10,10,10,0.6); }
    .faq-item { background: #fff; border: 1px solid rgba(10,10,10,0.08); border-radius: 12px; padding: 20px 24px; margin-bottom: 12px; }
    .faq-question { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .faq-answer { font-size: 14px; color: rgba(10,10,10,0.65); }
    .back-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 48px; padding: 12px 24px; background: #0A0A0A; color: #C8FF00; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 700; }
    .back-link:hover { background: #2A2A28; }
    .whatsapp-btn { display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; transition: background 0.2s; }
    .whatsapp-btn:hover { background: #1DA851; }

    .support-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; margin-bottom: 48px; }
    @media (max-width: 768px) { .support-grid { grid-template-columns: 1fr; } }
    .form-card { background: #fff; border: 1px solid rgba(10,10,10,0.08); border-radius: 16px; padding: 28px; }
    .form-card label { display: block; font-size: 13px; color: rgba(10,10,10,0.6); font-weight: 500; margin-bottom: 6px; }
    .form-card input, .form-card textarea { width: 100%; padding: 12px 14px; border: 1px solid rgba(10,10,10,0.1); border-radius: 12px; font-size: 14px; color: #0A0A0A; background: #F0EDE6; outline: none; font-family: 'Almarai', sans-serif; resize: vertical; }
    .form-card .field { margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
    .ferr { display: block; margin-top: 6px; font-size: 12px; color: #c0392b; font-weight: 600; }
    .ok-banner { background: rgba(39,140,80,0.08); border: 1px solid rgba(39,140,80,0.3); color: #1e7a46; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; font-weight: 600; }
    .err-banner { background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.25); color: #c0392b; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; font-weight: 600; }
    .submit-btn { width: 100%; padding: 14px; background: #0A0A0A; color: #C8FF00; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Almarai', sans-serif; transition: background 0.2s; }
    .submit-btn:hover { background: #2A2A28; }
    .side-card { background: #0A0A0A; border-radius: 16px; padding: 28px; color: #F0EDE6; display: flex; flex-direction: column; gap: 18px; }
    .side-card .t { font-size: 18px; font-weight: 800; }
    .side-card .d { font-size: 13px; color: rgba(240,237,230,0.6); line-height: 1.9; }
    .wa-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px 20px; border: 1px solid rgba(240,237,230,0.2); border-radius: 12px; color: #F0EDE6; text-decoration: none; font-size: 14px; font-weight: 700; transition: all 0.2s; background: rgba(255,255,255,0.05); }
    .wa-btn:hover { border-color: #25D366; background: rgba(37,211,102,0.1); }
    .wa-btn svg { color: #25D366; flex-shrink: 0; }
  </style>
</head>
<body>
  @include('partials.site-nav')
  <div class="content">
    <div class="page-container">
      <h1>الدعم والمساعدة</h1>
      <p class="subtitle">نحن هنا لمساعدتك. تواصل معنا بالطريقة التي تناسبك.</p>

      <div id="contact" class="support-grid" style="scroll-margin-top:96px;">
        <div class="form-card">
          @if (session('success'))
          <div class="ok-banner">{{ session('success') }}</div>
          @endif
          @if ($errors->any())
          <div class="err-banner">يرجى مراجعة الحقول المطلوبة أدناه.</div>
          @endif
          <form method="POST" action="/support">
            @csrf
            <div class="form-row">
              <div class="field">
                <label for="s-name">الاسم <span style="color:#c0392b">*</span></label>
                <input id="s-name" name="name" type="text" value="{{ old('name') }}" required maxlength="100">
                @error('name')<span class="ferr">{{ $message }}</span>@enderror
              </div>
              <div class="field">
                <label for="s-email">البريد الإلكتروني <span style="color:#c0392b">*</span></label>
                <input id="s-email" name="email" type="email" dir="ltr" value="{{ old('email') }}" required placeholder="you@company.sa">
                @error('email')<span class="ferr">{{ $message }}</span>@enderror
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label for="s-phone">رقم الجوال (اختياري)</label>
                <input id="s-phone" name="phone" type="tel" dir="ltr" value="{{ old('phone') }}" placeholder="05xxxxxxxx" maxlength="20">
                @error('phone')<span class="ferr">{{ $message }}</span>@enderror
              </div>
              <div class="field">
                <label for="s-subject">الموضوع (اختياري)</label>
                <input id="s-subject" name="subject" type="text" value="{{ old('subject') }}" maxlength="150">
                @error('subject')<span class="ferr">{{ $message }}</span>@enderror
              </div>
            </div>
            <div class="field">
              <label for="s-message">رسالتك <span style="color:#c0392b">*</span></label>
              <textarea id="s-message" name="message" rows="5" required maxlength="3000" placeholder="اكتب تفاصيل استفسارك أو مشكلتك...">{{ old('message') }}</textarea>
              @error('message')<span class="ferr">{{ $message }}</span>@enderror
            </div>
            <button type="submit" class="submit-btn">أرسل رسالتك</button>
          </form>
        </div>
        <div class="side-card">
          <div>
            <div class="t">قنوات أخرى</div>
            <div class="d">تفضّل التواصل المباشر؟ نحن متاحون أيضاً عبر:</div>
          </div>
          <a href="https://wa.me/966500000000" target="_blank" rel="noopener" class="wa-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>تواصل عبر واتساب</a>
          <div class="d">أو راسلنا على <a href="mailto:hello@teamat.sa" style="color:#C8FF00;text-decoration:none;" dir="ltr">hello@teamat.sa</a></div>
          <div class="d" style="margin-top:auto;border-top:1px solid rgba(240,237,230,0.1);padding-top:16px;">فريق الدعم متاح من الأحد إلى الخميس، من 9 صباحاً حتى 6 مساءً بتوقيت المملكة.</div>
        </div>
      </div>
      @if (session('success') || $errors->any())
      <script>document.getElementById('contact').scrollIntoView({block: 'start'});</script>
      @endif

      <h2>أسئلة شائعة</h2>

      <div class="faq-item" style="margin-top:24px;">
        <div class="faq-question">كيف أتواصل؟</div>
        <div class="faq-answer">يمكنك التواصل معنا عبر البريد الإلكتروني hello@teamat.sa أو عبر واتساب في أي وقت. فريق الدعم سيردّ عليك في أقرب وقت ممكن خلال ساعات العمل الرسمية.</div>
      </div>

      <div class="faq-item">
        <div class="faq-question">ما أوقات الدعم؟</div>
        <div class="faq-answer">فريق الدعم متاح من الأحد إلى الخميس، من الساعة 9 صباحًا حتى 6 مساءً بتوقيت المملكة العربية السعودية. الرسائل المرسلة خارج ساعات العمل ستتم معالجتها في بداية يوم العمل التالي.</div>
      </div>

      <div class="faq-item">
        <div class="faq-question">كيف أبلغ عن مشكلة؟</div>
        <div class="faq-answer">إذا واجهت مشكلة تقنية أو لديك شكوى، أرسل لنا تفاصيل المشكلة عبر البريد الإلكتروني مع ذكر اسم حسابك ونوع المشكلة. سنعمل على حلّها بأسرع وقت ممكن وسنُطلعك على التحديثات.</div>
      </div>

      <a href="/" class="back-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="transform:scaleX(-1)"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        العودة للرئيسية
      </a>
    </div>
  </div>
@include('partials.site-footer')
</body>
</html>
