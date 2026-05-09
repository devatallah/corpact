<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — لوحة التحكم</title>
@vite(['resources/css/main.css', 'resources/css/company.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">كورباكت</div><div class="en">COMPANY</div></div>
  <div class="co-info"><div class="lbl">الشركة</div><div class="nm">{{ $company->name }}</div><div class="sb">الشركة · {{ auth('company')->user()->hr_name }}</div></div>
  <nav>
    <div class="ni on" onclick="window.location='/company/dash'"><span>📊</span><span class="nl">لوحة التحكم</span></div>
    <div class="ni" onclick="window.location='/company/communities'"><span>🏘️</span><span class="nl">المجتمعات</span></div>
    <div class="ni" onclick="window.location='/company/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni" onclick="window.location='/company/wallet'"><span>💰</span><span class="nl">المحفظة</span></div>
    <div class="ni" onclick="window.location='/company/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni" onclick="window.location='/company/reports'"><span>📈</span><span class="nl">التقارير</span></div>
    <div class="ni" onclick="window.location='/company/notifications'" style="position:relative;"><span>🔔</span><span class="nl">الإشعارات</span>@if($unreadNotifications > 0)<span class="nl" style="background:#E03050;color:#fff;font-size:10px;padding:1px 7px;border-radius:20px;margin-right:auto;">{{ $unreadNotifications }}</span>@endif</div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('company.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">

<div class="sc on" id="dash">
  <div style="margin-bottom:24px;"><div style="font-size:22px;font-weight:900;">لوحة التحكم</div><div style="font-size:13px;color:#7A8BA8;">{{ $company->name }} · {{ now()->translatedFormat('F Y') }}</div></div>
  <div class="stat-row">
    <div class="stat" style="border-top:3px solid #3B5BDB;"><div style="font-size:24px;margin-bottom:8px;">👥</div><div style="font-size:26px;font-weight:900;color:#3B5BDB;">{{ $stats['active_employees'] }}</div><div style="font-size:12px;font-weight:600;">الموظفون النشطون</div><div style="font-size:11px;color:#7A8BA8;">من {{ $company->employee_count }} موظف</div></div>
    <div class="stat" style="border-top:3px solid #0CA678;"><div style="font-size:24px;margin-bottom:8px;">🏘️</div><div style="font-size:26px;font-weight:900;color:#0CA678;">{{ $stats['communities'] }}</div><div style="font-size:12px;font-weight:600;">المجتمعات النشطة</div></div>
    <div class="stat" style="border-top:3px solid #D4820A;"><div style="font-size:24px;margin-bottom:8px;">📅</div><div style="font-size:26px;font-weight:900;color:#D4820A;">{{ $stats['monthly_events'] }}</div><div style="font-size:12px;font-weight:600;">الفعاليات هذا الشهر</div></div>
    <div class="stat" style="border-top:3px solid #E03050;"><div style="font-size:24px;margin-bottom:8px;">💰</div><div style="font-size:26px;font-weight:900;color:#E03050;" id="dBal">{{ number_format($stats['wallet_balance']) }} ر</div><div style="font-size:12px;font-weight:600;">الرصيد المتبقي</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;">
    <div class="card" style="margin-bottom:0;">
      <div class="sec-title">نشاط المجتمعات</div>
      @forelse($communityParticipation as $cp)
      <div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;font-weight:700;">{{ $cp['community_name'] }}</span><span style="font-size:11px;color:#7A8BA8;">{{ $cp['member_count'] }}/{{ $cp['total_employees'] }}</span></div><div class="bar-w"><div class="bar-f" style="width:{{ $cp['rate'] }}%;background:#0CA678;"></div></div></div>
      @empty
      <div style="font-size:13px;color:#7A8BA8;padding:16px 0;">لا توجد مجتمعات بعد</div>
      @endforelse
    </div>
    <div class="card" style="margin-bottom:0;">
      <div class="sec-title">آخر النشاطات</div>
      @forelse($recentActivity as $activity)
      <div style="display:flex;gap:10px;margin-bottom:12px;"><div style="width:34px;height:34px;border-radius:10px;background:#0CA67818;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">📋</div><div><div style="font-size:12px;line-height:1.4;">{{ $activity->description }}</div><div style="font-size:10px;color:#7A8BA8;margin-top:3px;">{{ $activity->created_at->diffForHumans() }}</div></div></div>
      @empty
      <div style="font-size:13px;color:#7A8BA8;padding:16px 0;">لا توجد نشاطات حديثة</div>
      @endforelse
    </div>
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
