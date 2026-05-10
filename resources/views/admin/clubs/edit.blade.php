<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — تعديل نادي</title>
@vite(['resources/css/admin.css'])
</head>
<body>

<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>

<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">تيمات</div><div class="en">TEAMAT</div><div class="tag">ADMIN</div></div>
  <div class="admin-info"><div class="admin-avatar">م</div><div><div class="admin-name">مشرف النظام</div><div class="admin-role">Super Admin</div></div></div>
  <nav>
    <div class="ni" onclick="window.location='/admin/dash'"><span>📊</span><span class="nl">لوحة التحكم</span></div>
    <div class="ni" onclick="window.location='/admin/companies'"><span>🏢</span><span class="nl">الشركات</span></div>
    <div class="ni on" onclick="window.location='/admin/clubs'"><span>🏟️</span><span class="nl">الأندية</span></div>
    <div class="ni" onclick="window.location='/admin/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni" onclick="window.location='/admin/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni" onclick="window.location='/admin/revenue'"><span>💰</span><span class="nl">الإيرادات</span></div>
    <div class="ni" onclick="window.location='/admin/notifs'"><span>🔔</span><span class="nl">الإشعارات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('admin.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>

<div class="main">
<div class="sc on">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
    <a href="{{ route('admin.clubs.index') }}" style="color:#6B7A99;text-decoration:none;font-size:14px;">← الأندية</a>
    <span style="color:#3D4A60;">/</span>
    <span style="color:#fff;font-weight:700;">تعديل: {{ $club->name }}</span>
  </div>

  @if (session('success'))
  <div style="background:rgba(0,158,130,.1);border:1px solid rgba(0,158,130,.25);border-radius:10px;padding:12px 16px;margin-bottom:20px;">
    <p style="font-size:12px;color:#009E82;margin:0;">{{ session('success') }}</p>
  </div>
  @endif

  @if ($errors->any())
  <div style="background:rgba(224,48,80,.1);border:1px solid rgba(224,48,80,.25);border-radius:10px;padding:12px 16px;margin-bottom:20px;">
    @foreach ($errors->all() as $error)<p style="font-size:12px;color:#E03050;margin:0 0 4px;">{{ $error }}</p>@endforeach
  </div>
  @endif

  <div class="card" style="max-width:600px;">
    <div style="font-size:18px;font-weight:700;margin-bottom:20px;">تعديل بيانات النادي</div>
    <form method="POST" action="{{ route('admin.clubs.update', $club) }}">
      @csrf
      @method('PUT')

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:6px;">اسم النادي</label>
        <input type="text" name="name" value="{{ old('name', $club->name) }}" style="width:100%;padding:10px 14px;background:#0F1117;border:1px solid #232A3E;border-radius:10px;color:#E8EAF0;font-size:14px;font-family:inherit;outline:none;">
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:6px;">المدينة</label>
          <input type="text" name="city" value="{{ old('city', $club->city) }}" style="width:100%;padding:10px 14px;background:#0F1117;border:1px solid #232A3E;border-radius:10px;color:#E8EAF0;font-size:14px;font-family:inherit;outline:none;">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:6px;">الحي</label>
          <input type="text" name="district" value="{{ old('district', $club->district) }}" style="width:100%;padding:10px 14px;background:#0F1117;border:1px solid #232A3E;border-radius:10px;color:#E8EAF0;font-size:14px;font-family:inherit;outline:none;">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:6px;">البريد الإلكتروني</label>
          <input type="email" name="email" value="{{ old('email', $club->email) }}" dir="ltr" style="width:100%;padding:10px 14px;background:#0F1117;border:1px solid #232A3E;border-radius:10px;color:#E8EAF0;font-size:14px;font-family:inherit;outline:none;">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:6px;">رقم الهاتف</label>
          <input type="text" name="contact_phone" value="{{ old('contact_phone', $club->contact_phone) }}" dir="ltr" style="width:100%;padding:10px 14px;background:#0F1117;border:1px solid #232A3E;border-radius:10px;color:#E8EAF0;font-size:14px;font-family:inherit;outline:none;">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:6px;">نسبة العمولة (%)</label>
          <input type="number" name="commission_rate" value="{{ old('commission_rate', $club->commission_rate) }}" min="0" max="100" step="0.1" style="width:100%;padding:10px 14px;background:#0F1117;border:1px solid #232A3E;border-radius:10px;color:#E8EAF0;font-size:14px;font-family:inherit;outline:none;">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:6px;">الحالة</label>
          <select name="status" style="width:100%;padding:10px 14px;background:#0F1117;border:1px solid #232A3E;border-radius:10px;color:#E8EAF0;font-size:14px;font-family:inherit;outline:none;">
            <option value="pending" {{ old('status', $club->status) === 'pending' ? 'selected' : '' }}>معلق</option>
            <option value="active" {{ old('status', $club->status) === 'active' ? 'selected' : '' }}>نشط</option>
            <option value="rejected" {{ old('status', $club->status) === 'rejected' ? 'selected' : '' }}>مرفوض</option>
            <option value="suspended" {{ old('status', $club->status) === 'suspended' ? 'selected' : '' }}>معلّق</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:24px;">
        <button type="submit" style="flex:1;padding:12px;background:linear-gradient(135deg,#009E82,#00B894);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">حفظ التعديلات</button>
        <a href="{{ route('admin.clubs.index') }}" style="padding:12px 24px;background:#232A3E;border-radius:10px;color:#6B7A99;font-size:14px;font-weight:700;text-decoration:none;text-align:center;">إلغاء</a>
      </div>
    </form>
  </div>
</div>
</div>

<script>
function togMobile(){document.getElementById('sb').classList.toggle('open');document.getElementById('sbBackdrop').classList.toggle('open');}
function closeMobile(){document.getElementById('sb').classList.remove('open');document.getElementById('sbBackdrop').classList.remove('open');}
function togSB(){var s=document.getElementById('sb');s.classList.toggle('small');s.querySelector('.tog').textContent=s.classList.contains('small')?'←':'→';document.querySelectorAll('.nl,.nb,.admin-name,.admin-role,.logo .en,.logo .tag').forEach(n=>n.style.display=s.classList.contains('small')?'none':'');}
</script>
</body></html>
