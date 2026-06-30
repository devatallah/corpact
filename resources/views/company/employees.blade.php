<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — الموظفون</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
@vite(['resources/css/main.css', 'resources/css/company.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">تيمات</div><div class="en">COMPANY</div></div>
  <div class="co-info"><div class="lbl">الشركة</div><div class="nm">{{ $company->name }}</div><div class="sb">الشركة · {{ auth('company')->user()->hr_name }}</div></div>
  <nav>
    <div class="ni" onclick="window.location='/company/dash'"><span>📊</span><span class="nl">لوحة التحكم</span></div>
    <div class="ni" onclick="window.location='/company/communities'"><span>🏘️</span><span class="nl">المجتمعات</span></div>
    <div class="ni" onclick="window.location='/company/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni" onclick="window.location='/company/wallet'"><span>💰</span><span class="nl">المحفظة</span></div>
    <div class="ni on" onclick="window.location='/company/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni" onclick="window.location='/company/reports'"><span>📈</span><span class="nl">التقارير</span></div>
    <div class="ni" onclick="window.location='/company/notifications'" style="position:relative;"><span>🔔</span><span class="nl">الإشعارات</span>@if($unreadNotifications > 0)<span class="nl" style="background:#E03050;color:#fff;font-size:10px;padding:1px 7px;border-radius:20px;margin-right:auto;">{{ $unreadNotifications }}</span>@endif</div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('company.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">

<div class="sc on" id="emps">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:10px;">
    <div><div style="font-size:22px;font-weight:900;">الموظفون</div><div style="font-size:13px;color:#7A8BA8;">{{ $activeCount }} نشط من {{ $totalCount }}</div></div>
    <div style="display:flex;gap:10px;">
      <form method="GET" action="/company/employees" style="display:flex;gap:10px;">
        <input name="search" value="{{ $filters['search'] ?? '' }}" placeholder="🔍 ابحث..." style="padding:9px 14px;border-radius:10px;border:1px solid #E2E8F4;font-size:13px;background:#fff;outline:none;direction:rtl;width:180px;">
      </form>
      <button onclick="tog('inv')" style="background:#3B5BDB;color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">+ دعوة موظف</button>
    </div>
  </div>
  <div id="inv" style="display:none;background:#fff;border:1px solid #3B5BDB44;border-radius:16px;padding:20px;margin-bottom:16px;">
    <div style="font-size:14px;font-weight:700;margin-bottom:4px;">دعوة موظف جديد</div>
    <div style="font-size:12px;color:#7A8BA8;margin-bottom:12px;">سيصله إيميل دعوة للانضمام للمنصة</div>
    <form method="POST" action="/company/employees" style="display:flex;gap:10px;">
      @csrf
      <input name="email" id="ie" placeholder="البريد الإلكتروني..." style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid #E2E8F4;font-size:13px;background:#F0F2F8;outline:none;direction:ltr;">
      <button type="submit" style="background:#3B5BDB;color:#fff;border:none;border-radius:10px;padding:10px 22px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">إرسال</button>
    </form>
    @if(session('success'))
    <div style="margin-top:10px;padding:8px 14px;background:#0CA67818;border:1px solid #0CA67833;border-radius:10px;font-size:13px;color:#0CA678;font-weight:600;">{{ session('success') }}</div>
    @endif
    @if($errors->any())
    <div style="margin-top:10px;padding:8px 14px;background:#E0305018;border:1px solid #E0305033;border-radius:10px;font-size:13px;color:#E03050;font-weight:600;">{{ $errors->first() }}</div>
    @endif
  </div>
  <div style="background:#fff;border:1px solid #E2E8F4;border-radius:16px;overflow:auto;">
    <table>
      <thead><tr><th>الموظف</th><th>القسم</th><th>المجتمعات</th><th>الفعاليات</th><th>الحالة</th></tr></thead>
      <tbody>
        @forelse($employees as $employee)
        <tr>
          <td><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:50%;background:#3B5BDB18;color:#3B5BDB;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">{{ mb_substr($employee->name, 0, 1) }}</div><span style="font-size:13px;font-weight:600;">{{ $employee->name }}</span></div></td>
          <td style="color:#7A8BA8;font-size:12px;">{{ $employee->department ?? '—' }}</td>
          <td>
            @forelse($employee->communities as $community)
            <span class="badge" style="background:#0CA67818;color:#0CA678;margin-left:4px;">{{ $community->sport?->icon }} {{ $community->name }}</span>
            @empty
            <span style="color:#7A8BA8;font-size:12px;">—</span>
            @endforelse
          </td>
          <td style="font-weight:700;{{ $employee->events_count === 0 ? 'color:#7A8BA8;' : '' }}">{{ $employee->events_count ?? 0 }}</td>
          <td>
            @if($employee->status === 'active')
            <span class="badge" style="background:#0CA67818;color:#0CA678;">نشط</span>
            @else
            <span class="badge" style="background:#E0305018;color:#E03050;">غير نشط</span>
            @endif
          </td>
        </tr>
        @empty
        <tr><td colspan="5" style="text-align:center;padding:24px;color:#7A8BA8;font-size:13px;">لا يوجد موظفون بعد</td></tr>
        @endforelse
      </tbody>
    </table>
  </div>
  @if($employees->hasPages())
  <div style="margin-top:16px;display:flex;justify-content:center;">
    {{ $employees->appends($filters)->links() }}
  </div>
  @endif
</div>

</div><!-- main -->
<script>
function togMobile(){document.getElementById('sb').classList.toggle('open');document.getElementById('sbBackdrop').classList.toggle('open');}
function closeMobile(){document.getElementById('sb').classList.remove('open');document.getElementById('sbBackdrop').classList.remove('open');}
function togSB(){
  var s=document.getElementById('sb');
  s.classList.toggle('small');
  s.querySelector('.tog').textContent=s.classList.contains('small')?'←':'→';
  document.querySelectorAll('.nl').forEach(n=>n.style.display=s.classList.contains('small')?'none':'');
}
function tog(id){var el=document.getElementById(id);el.style.display=el.style.display==='none'?'block':'none';}
</script>
</body></html>
