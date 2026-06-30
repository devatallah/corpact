<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — إضافة ملعب</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
@vite(['resources/css/main.css', 'resources/css/business.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">تيمات</div><div class="en">business PORTAL</div></div>
  <div class="co-info"><div class="lbl">النادي</div><div class="nm">{{ auth('business')->user()->name }}</div></div>
  <nav>
    <div class="ni" onclick="window.location='/business/dash'"><span>📊</span><span class="nl"> الرئيسية</span></div>
    <div class="ni" onclick="window.location='/business/requests'"><span>📋</span><span class="nl"> طلبات الحجز</span></div>
    <div class="ni" onclick="window.location='/business/schedule'"><span>📅</span><span class="nl"> التقويم</span></div>
    <div class="ni on" onclick="window.location='/business/venues'"><span>🏟️</span><span class="nl"> إدارة الملاعب</span></div>
    <div class="ni" onclick="window.location='/business/settlements'"><span>💰</span><span class="nl"> التسويات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('business.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">
<div class="sc on">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
    <a href="{{ route('business.venues.index') }}" style="color:#8A7868;text-decoration:none;font-size:14px;">← الملاعب</a>
    <span style="color:#C8D0E0;">/</span>
    <span style="font-weight:700;">إضافة ملعب</span>
  </div>

  @if ($errors->any())
  <div style="background:#C8410A10;border:1px solid #C8410A33;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
    @foreach ($errors->all() as $error)<p style="font-size:12px;color:#C8410A;margin:0 0 4px;">{{ $error }}</p>@endforeach
  </div>
  @endif

  <div style="background:#fff;border:1px solid #E2E8F4;border-radius:16px;padding:32px;max-width:500px;">
    <div style="font-size:18px;font-weight:700;margin-bottom:20px;">إضافة ملعب جديد</div>
    <form method="POST" action="{{ route('business.venues.store') }}">
      @csrf

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">اسم الملعب *</label>
        <input type="text" name="name" value="{{ old('name') }}" required style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;" placeholder="مثال: ملعب 1">
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">معرّف الرياضة *</label>
        <input type="number" name="sport_id" value="{{ old('sport_id') }}" required min="1" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;">
      </div>

      <div style="margin-bottom:24px;">
        <label style="display:block;font-size:12px;font-weight:600;color:#4A5C78;margin-bottom:6px;">الحالة</label>
        <select name="status" style="width:100%;padding:10px 14px;background:#F0F2F8;border:1px solid #E2E8F4;border-radius:10px;font-size:14px;font-family:inherit;outline:none;">
          <option value="active" {{ old('status', 'active') === 'active' ? 'selected' : '' }}>نشط</option>
          <option value="inactive" {{ old('status') === 'inactive' ? 'selected' : '' }}>غير نشط</option>
        </select>
      </div>

      <div style="display:flex;gap:10px;">
        <button type="submit" style="flex:1;padding:12px;background:#C8410A;border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">حفظ</button>
        <a href="{{ route('business.venues.index') }}" style="padding:12px 24px;background:#E2E8F4;border-radius:10px;color:#4A5C78;font-size:14px;font-weight:700;text-decoration:none;text-align:center;">إلغاء</a>
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
