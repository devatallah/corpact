<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — الرئيسية</title>
@vite(['resources/css/main.css', 'resources/css/club.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">تيمات</div><div class="en">CLUB PORTAL</div></div>
  <div class="co-info"><div class="lbl">النادي</div><div class="nm">{{ $club->name }}</div><div class="sb">{{ $club->district }}، {{ $club->city }}</div></div>
  <nav>
    <div class="ni on" onclick="window.location='/club/dash'"><span>📊</span><span class="nl"> الرئيسية</span></div>
    <div class="ni" onclick="window.location='/club/requests'"><span>📋</span><span class="nl"> طلبات الحجز</span>@if($stats['pending_requests'] > 0)<span class="nl" style="background:#C8410A;color:#fff;font-size:10px;padding:1px 7px;border-radius:20px;margin-right:auto;">{{ $stats['pending_requests'] }}</span>@endif</div>
    <div class="ni" onclick="window.location='/club/schedule'"><span>📅</span><span class="nl"> التقويم</span></div>
    <div class="ni" onclick="window.location='/club/courts'"><span>🏟️</span><span class="nl"> إدارة الملاعب</span></div>
    <div class="ni" onclick="window.location='/club/settlements'"><span>💰</span><span class="nl"> التسويات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('club.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">

<!-- DASH -->
<div class="sc on" id="cdash">
  <div style="background:linear-gradient(135deg,#1C1410,#2A1F18);border-radius:20px;padding:24px 28px;margin-bottom:24px;color:#fff;display:flex;justify-content:space-between;align-items:center;">
    <div><div style="font-size:11px;color:rgba(255,255,255,.4);letter-spacing:2px;margin-bottom:4px;">TEAMAT · CLUB PORTAL</div><div style="font-size:24px;font-weight:900;">{{ $club->name }}</div><div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:4px;">{{ $club->district }}، {{ $club->city }}</div></div>
    <div style="text-align:left;"><div style="font-size:32px;font-weight:900;color:#F5A623;">{{ $club->rating ?? '0.0' }} ⭐</div><div style="font-size:11px;color:rgba(255,255,255,.4);">{{ number_format($club->total_bookings ?? 0) }} حجز إجمالي</div></div>
  </div>
  <div class="stat-row">
    <div class="stat" style="border-top:3px solid #C8410A;"><div style="font-size:24px;margin-bottom:8px;">⏳</div><div style="font-size:26px;font-weight:900;color:#C8410A;" id="dPend">{{ $stats['pending_requests'] }}</div><div style="font-size:12px;font-weight:600;">طلبات معلقة</div><div style="font-size:11px;color:#8A7868;">تحتاج ردك الآن</div></div>
    <div class="stat" style="border-top:3px solid #1A7A4A;"><div style="font-size:24px;margin-bottom:8px;">✅</div><div style="font-size:26px;font-weight:900;color:#1A7A4A;">{{ $stats['monthly_bookings'] }}</div><div style="font-size:12px;font-weight:600;">حجوزات هذا الشهر</div><div style="font-size:11px;color:#8A7868;">هذا الشهر</div></div>
    <div class="stat" style="border-top:3px solid #B8860A;"><div style="font-size:24px;margin-bottom:8px;">💰</div><div style="font-size:26px;font-weight:900;color:#B8860A;">{{ number_format($stats['monthly_revenue']) }} ر</div><div style="font-size:12px;font-weight:600;">الإيرادات</div><div style="font-size:11px;color:#8A7868;">هذا الشهر</div></div>
    <div class="stat" style="border-top:3px solid #1A5FAB;"><div style="font-size:24px;margin-bottom:8px;">🏢</div><div style="font-size:26px;font-weight:900;color:#1A5FAB;">{{ $stats['partner_companies'] }}</div><div style="font-size:12px;font-weight:600;">شركات شريكة</div></div>
  </div>
  <div class="card">
    <div style="font-size:15px;font-weight:800;margin-bottom:14px;display:flex;justify-content:space-between;">
      طلبات تحتاج ردك
      <button onclick="window.location='/club/requests'" style="background:#C8410A18;color:#C8410A;border:none;border-radius:10px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">عرض الكل</button>
    </div>
    @forelse($pendingEvents as $event)
    <div onclick="window.location='/club/requests'" style="background:#F7F4F0;border:1px solid #EAE4DC;border-right:3px solid #C8410A;border-radius:12px;padding:12px 14px;cursor:pointer;{{ !$loop->last ? 'margin-bottom:10px;' : '' }}">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><div style="font-size:13px;font-weight:700;">{{ $event->company?->name }}</div><div style="font-size:11px;color:#8A7868;">{{ $event->created_at->diffForHumans() }}</div></div>
      <div style="display:flex;gap:14px;"><span style="font-size:11px;color:#8A7868;">{{ $event->sport?->icon }} {{ $event->sport?->name }} · {{ $event->courts_count }} {{ $event->courts_count > 1 ? 'ملاعب' : 'ملعب' }} · {{ $event->event_date->translatedFormat('l j F') }} · {{ \Carbon\Carbon::parse($event->start_time)->format('g:i') }}</span><span style="font-size:12px;font-weight:700;color:#B8860A;">{{ number_format($event->total_amount) }} ريال</span></div>
    </div>
    @empty
    <div style="text-align:center;padding:20px;color:#8A7868;font-size:13px;">لا توجد طلبات معلقة حالياً</div>
    @endforelse
  </div>
</div>

</div>
<script>
function togMobile(){document.getElementById('sb').classList.toggle('open');document.getElementById('sbBackdrop').classList.toggle('open');}
function closeMobile(){document.getElementById('sb').classList.remove('open');document.getElementById('sbBackdrop').classList.remove('open');}
function togSB(){
  var s=document.getElementById('sb');s.classList.toggle('small');
  s.querySelector('.tog').textContent=s.classList.contains('small')?'←':'→';
  document.querySelectorAll('.nl').forEach(n=>n.style.display=s.classList.contains('small')?'none':'');
}
</script>
</body></html>
