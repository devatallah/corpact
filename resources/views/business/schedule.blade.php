<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — التقويم</title>
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
  <div class="co-info"><div class="lbl">مزود الخدمة</div><div class="nm">{{ $business->name }}</div><div class="sb">{{ $business->district }}، {{ $business->city }}</div></div>
  <nav>
    <div class="ni" onclick="window.location='/business/dash'"><span>📊</span><span class="nl"> الرئيسية</span></div>
    <div class="ni" onclick="window.location='/business/requests'"><span>📋</span><span class="nl"> طلبات الحجز</span></div>
    <div class="ni on" onclick="window.location='/business/schedule'"><span>📅</span><span class="nl"> التقويم</span></div>
    <div class="ni" onclick="window.location='/business/venues'"><span>🏟️</span><span class="nl"> إدارة الملاعب</span></div>
    <div class="ni" onclick="window.location='/business/settlements'"><span>💰</span><span class="nl"> التسويات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('business.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">

<!-- SCHEDULE -->
@php
  $parsedDate = \Carbon\Carbon::parse($date);
  $venues = $schedule['venues'] ?? collect();
  $grid = $schedule['grid'] ?? collect();
  // Generate time slots from working hours or default 5PM-10PM
  $timeSlots = [];
  for ($h = 17; $h <= 22; $h++) {
    $timeSlots[] = sprintf('%02d:00', $h);
  }
  // Build a lookup: venueId -> time -> event data
  $bookingLookup = [];
  foreach ($grid as $venueData) {
    $venueId = $venueData['venue_id'];
    foreach ($venueData['events'] as $event) {
      $time = \Carbon\Carbon::parse($event['start_time'])->format('H:i');
      $bookingLookup[$venueId][$time] = $event;
    }
  }
@endphp
<div class="sc on" id="csched">
  <div style="margin-bottom:24px;"><div style="font-size:22px;font-weight:900;">تقويم الحجوزات</div><div style="font-size:13px;color:#8A7868;">الحجوزات المؤكدة والمعلقة — {{ $parsedDate->translatedFormat('l j F Y') }}</div></div>
  <div style="display:flex;gap:8px;margin-bottom:20px;overflow-x:auto;">
    @for($i = 0; $i < 5; $i++)
    @php $dayDate = \Carbon\Carbon::now()->addDays($i); @endphp
    <a href="{{ route('business.schedule.index', ['date' => $dayDate->toDateString()]) }}" style="padding:8px 18px;border-radius:20px;{{ $dayDate->toDateString() === $parsedDate->toDateString() ? 'background:#C8410A;color:#fff;border:none;' : 'background:#fff;color:#8A7868;border:1px solid #EAE4DC;' }}cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;flex-shrink:0;text-decoration:none;">{{ $i === 0 ? 'اليوم' : $dayDate->translatedFormat('l') }}</a>
    @endfor
  </div>
  <div style="display:flex;gap:12px;margin-bottom:16px;">
    <div style="display:flex;align-items:center;gap:6px;"><div style="width:12px;height:12px;border-radius:4px;background:#1A7A4A;"></div><span style="font-size:12px;color:#8A7868;">مؤكد</span></div>
    <div style="display:flex;align-items:center;gap:6px;"><div style="width:12px;height:12px;border-radius:4px;background:#B8860A;"></div><span style="font-size:12px;color:#8A7868;">معلق</span></div>
  </div>
  <div style="background:#fff;border:1px solid #EAE4DC;border-radius:16px;overflow:auto;">
    <table style="min-width:520px;">
      <thead><tr><th style="background:#F7F4F0;">الوقت</th>@foreach($venues as $venue)<th style="background:#F7F4F0;">{{ $venue->name }}</th>@endforeach</tr></thead>
      <tbody>
        @foreach($timeSlots as $slot)
        @php $slotFormatted = \Carbon\Carbon::createFromFormat('H:i', $slot)->format('g:i') . ' م'; @endphp
        <tr>
          <td style="font-size:12px;color:#8A7868;font-weight:600;padding:10px 16px;">{{ $slotFormatted }}</td>
          @foreach($venues as $venue)
          @php $booking = $bookingLookup[$venue->id][$slot] ?? null; @endphp
          @if($booking)
          @php $isConfirmed = $booking['status'] === 'confirmed' || $booking['status'] === 'completed'; @endphp
          <td style="background:{{ $isConfirmed ? '#1A7A4A' : '#B8860A' }}15;padding:8px;">
            <div style="background:{{ $isConfirmed ? '#1A7A4A' : '#B8860A' }};border-radius:6px;padding:6px 10px;">
              <div style="font-size:11px;font-weight:700;color:#fff;">{{ $booking['company_name'] ?? '' }}</div>
              <div style="font-size:10px;color:rgba(255,255,255,.7);">{{ $isConfirmed ? 'مؤكد' : 'معلق' }}</div>
            </div>
          </td>
          @else
          <td></td>
          @endif
          @endforeach
        </tr>
        @endforeach
      </tbody>
    </table>
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
