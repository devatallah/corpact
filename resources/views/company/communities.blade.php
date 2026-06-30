<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — المجتمعات</title>
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
    <div class="ni on" onclick="window.location='/company/communities'"><span>🏘️</span><span class="nl">المجتمعات</span></div>
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

<div class="sc on" id="comms">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;"><div><div style="font-size:22px;font-weight:900;">إدارة المجتمعات</div><div style="font-size:13px;color:#7A8BA8;">{{ $communities->count() }} مجتمعات نشطة</div></div><button style="background:#3B5BDB;color:#fff;border:none;border-radius:12px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">+ إنشاء مجتمع</button></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
    @php
      $colors = ['#0CA678', '#D4820A', '#5B3FCC', '#3B5BDB', '#E03050', '#8B5CF6'];
    @endphp
    @forelse($communities as $index => $community)
    @php
      $color = $community->color ?? $colors[$index % count($colors)];
      $activeMembers = $community->members_count ?? 0;
      $totalMembers = $community->member_count ?? $activeMembers;
      $participation = $totalMembers > 0 ? round(($activeMembers / $totalMembers) * 100) : 0;
      $eventCount = $community->events_count ?? $community->events()->count();
    @endphp
    <div class="card" style="border-top:4px solid {{ $color }};margin-bottom:0;cursor:pointer;">
      <div style="display:flex;justify-content:space-between;margin-bottom:14px;"><div style="font-size:32px;">{{ $community->sport?->icon ?? $community->icon }}</div><span class="badge" style="background:{{ $color }}18;color:{{ $color }};">{{ $eventCount }} فعالية</span></div>
      <div style="font-size:16px;font-weight:800;margin-bottom:6px;">{{ $community->name }}</div>
      <div style="font-size:12px;color:#7A8BA8;margin-bottom:14px;display:flex;align-items:center;gap:6px;">قائد: {{ $community->leader?->name ?? '—' }}</div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:12px;color:#7A8BA8;">{{ $activeMembers }} نشط من {{ $totalMembers }}</span><span style="font-size:12px;color:{{ $color }};font-weight:700;">{{ $participation }}%</span></div><div class="bar-w"><div class="bar-f" style="width:{{ $participation }}%;background:{{ $color }};"></div></div>
    </div>
    @empty
    <div class="card" style="grid-column:span 2;text-align:center;padding:32px;"><div style="font-size:13px;color:#7A8BA8;">لا توجد مجتمعات بعد</div></div>
    @endforelse
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
