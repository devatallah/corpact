<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — التقارير</title>
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
    <div class="ni" onclick="window.location='/company/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni on" onclick="window.location='/company/reports'"><span>📈</span><span class="nl">التقارير</span></div>
    <div class="ni" onclick="window.location='/company/notifications'" style="position:relative;"><span>🔔</span><span class="nl">الإشعارات</span>@if($unreadNotifications > 0)<span class="nl" style="background:#E03050;color:#fff;font-size:10px;padding:1px 7px;border-radius:20px;margin-right:auto;">{{ $unreadNotifications }}</span>@endif</div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('company.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">

<div class="sc on" id="reports">
  <div style="margin-bottom:24px;"><div style="font-size:22px;font-weight:900;">التقارير والإحصائيات</div><div style="font-size:13px;color:#7A8BA8;">ملخص أداء المجتمعات — {{ now()->translatedFormat('F Y') }}</div></div>
  <div class="stat-row">
    <div class="stat" style="border-top:3px solid #3B5BDB;"><div style="font-size:24px;margin-bottom:8px;">📊</div><div style="font-size:26px;font-weight:900;color:#3B5BDB;">{{ $participation['rate'] }}%</div><div style="font-size:12px;font-weight:600;">نسبة المشاركة</div><div style="font-size:11px;color:#7A8BA8;">{{ $participation['participating_employees'] }} من {{ $participation['total_employees'] }} موظف</div></div>
    <div class="stat" style="border-top:3px solid #D4820A;"><div style="font-size:24px;margin-bottom:8px;">🏆</div><div style="font-size:26px;font-weight:900;color:#D4820A;">{{ $mostActive['community_name'] ?? '—' }}</div><div style="font-size:12px;font-weight:600;">أكثر نشاطاً</div><div style="font-size:11px;color:#7A8BA8;">@if($mostActive){{ $mostActive['event_count'] }} فعاليات@else لا توجد بيانات @endif</div></div>
    <div class="stat" style="border-top:3px solid #0CA678;"><div style="font-size:24px;margin-bottom:8px;">💸</div><div style="font-size:26px;font-weight:900;color:#0CA678;">{{ $budget['utilization_rate'] }}%</div><div style="font-size:12px;font-weight:600;">نسبة صرف الميزانية</div><div style="font-size:11px;color:#7A8BA8;">{{ number_format($budget['total_distributed'] + $budget['total_spent_on_events']) }} من {{ number_format($budget['total_credited']) }}</div></div>
  </div>
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
</script>
</body></html>
