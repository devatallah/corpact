<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — تعديل مجتمع</title>
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
    <div class="ni on" onclick="window.location='/company/communities'"><span>🏘️</span><span class="nl">المجتمعات</span></div>
    <div class="ni" onclick="window.location='/company/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
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
    <a href="{{ route('company.communities.index') }}" style="color:#7A8BA8;text-decoration:none;font-size:14px;">← المجتمعات</a>
    <span style="color:#C8D0E0;">/</span>
    <span style="font-weight:700;">تعديل: {{ $community->name }}</span>
  </div>

  @if (session('success'))
  <div style="background:#0CA67818;border:1px solid #0CA67833;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
    <p style="font-size:12px;color:#0CA678;margin:0;">{{ session('success') }}</p>
  </div>
  @endif

  @if ($errors->any())
  <div style="background:#E0305010;border:1px solid #E0305033;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
    @foreach ($errors->all() as $error)<p style="font-size:12px;color:#E03050;margin:0 0 4px;">{{ $error }}</p>@endforeach
  </div>
  @endif

  <div style="background:#fff;border:1px solid #E2E8F4;border-radius:16px;padding:32px;max-width:600px;">
    <div style="font-size:18px;font-weight:700;margin-bottom:20px;">تعديل المجتمع</div>
    <form method="POST" action="{{ route('company.communities.update', $community) }}">
      @csrf
      @method('PUT')

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">اسم المجتمع</label>
        <input type="text" name="name" value="{{ old('name', $community->name) }}" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;">
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">الوصف</label>
        <textarea name="description" rows="3" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;resize:vertical;">{{ old('description', $community->description) }}</textarea>
      </div>

      <div style="margin-bottom:24px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">معرّف القائد الجديد</label>
        <input type="number" name="leader_id" value="{{ old('leader_id') }}" min="1" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;" placeholder="اتركه فارغاً للإبقاء على القائد الحالي">
      </div>

      <div style="display:flex;gap:10px;">
        <button type="submit" style="flex:1;padding:12px;background:#3B5BDB;border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">حفظ التعديلات</button>
        <a href="{{ route('company.communities.index') }}" style="padding:12px 24px;background:#E2E8F4;border-radius:10px;color:#4A5C78;font-size:14px;font-weight:700;text-decoration:none;text-align:center;">إلغاء</a>
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
