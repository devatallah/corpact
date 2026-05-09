<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — إضافة فعالية</title>
@vite(['resources/css/main.css', 'resources/css/company.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">كورباكت</div><div class="en">COMPANY</div></div>
  <div class="co-info"><div class="lbl">الشركة</div><div class="nm">{{ auth('company')->user()->name }}</div></div>
  <nav>
    <div class="ni" onclick="window.location='/company/dash'"><span>📊</span><span class="nl">لوحة التحكم</span></div>
    <div class="ni" onclick="window.location='/company/communities'"><span>🏘️</span><span class="nl">المجتمعات</span></div>
    <div class="ni on" onclick="window.location='/company/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni" onclick="window.location='/company/wallet'"><span>💰</span><span class="nl">المحفظة</span></div>
    <div class="ni" onclick="window.location='/company/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni" onclick="window.location='/company/reports'"><span>📈</span><span class="nl">التقارير</span></div>
    <div class="ni" onclick="window.location='/company/notifications'"><span>🔔</span><span class="nl">الإشعارات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('company.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">
<div class="sc on">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
    <a href="{{ route('company.events.index') }}" style="color:#7A8BA8;text-decoration:none;font-size:14px;">← الفعاليات</a>
    <span style="color:#C8D0E0;">/</span>
    <span style="font-weight:700;">إضافة فعالية</span>
  </div>

  @if ($errors->any())
  <div style="background:#E0305010;border:1px solid #E0305033;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
    @foreach ($errors->all() as $error)<p style="font-size:12px;color:#E03050;margin:0 0 4px;">{{ $error }}</p>@endforeach
  </div>
  @endif

  <div style="background:#fff;border:1px solid #E2E8F4;border-radius:16px;padding:32px;max-width:600px;">
    <div style="font-size:18px;font-weight:700;margin-bottom:20px;">إضافة فعالية جديدة</div>
    <form method="POST" action="{{ route('company.events.store') }}">
      @csrf

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">معرّف المجتمع *</label>
        <input type="number" name="community_id" value="{{ old('community_id') }}" required min="1" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;">
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">معرّف النادي *</label>
          <input type="number" name="club_id" value="{{ old('club_id') }}" required min="1" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">معرّف الرياضة *</label>
          <input type="number" name="sport_id" value="{{ old('sport_id') }}" required min="1" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;">
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">التاريخ *</label>
        <input type="date" name="date" value="{{ old('date') }}" required dir="ltr" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;">
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">وقت البداية *</label>
          <input type="time" name="start_time" value="{{ old('start_time') }}" required dir="ltr" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">وقت النهاية *</label>
          <input type="time" name="end_time" value="{{ old('end_time') }}" required dir="ltr" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;">
        </div>
      </div>

      <div style="display:flex;gap:10px;">
        <button type="submit" style="flex:1;padding:12px;background:#3B5BDB;border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">حفظ</button>
        <a href="{{ route('company.events.index') }}" style="padding:12px 24px;background:#E2E8F4;border-radius:10px;color:#4A5C78;font-size:14px;font-weight:700;text-decoration:none;text-align:center;">إلغاء</a>
      </div>
    </form>
  </div>
</div>
</div>

<script>
function togMobile(){document.getElementById('sb').classList.toggle('open');document.getElementById('sbBackdrop').classList.toggle('open');}
function closeMobile(){document.getElementById('sb').classList.remove('open');document.getElementById('sbBackdrop').classList.remove('open');}
function togSB(){var s=document.getElementById('sb');s.classList.toggle('small');s.querySelector('.tog').textContent=s.classList.contains('small')?'←':'→';document.querySelectorAll('.nl,.nb,.co-info,.logo .en').forEach(n=>n.style.display=s.classList.contains('small')?'none':'');}
</script>
</body></html>
