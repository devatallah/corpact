<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — طلبات الحجز</title>
@vite(['resources/css/main.css', 'resources/css/club.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">تيمات</div><div class="en">CLUB PORTAL</div></div>
  <div class="co-info"><div class="lbl">النادي</div><div class="nm">{{ $club->name }}</div><div class="sb">{{ $club->district }}، {{ $club->city }}</div></div>
  <nav>
    <div class="ni" onclick="window.location='/club/dash'"><span>📊</span><span class="nl"> الرئيسية</span></div>
    <div class="ni on" onclick="window.location='/club/requests'"><span>📋</span><span class="nl"> طلبات الحجز</span>@if($pendingCount > 0)<span class="nl" id="pBadge" style="background:#C8410A;color:#fff;font-size:10px;padding:1px 7px;border-radius:20px;margin-right:auto;">{{ $pendingCount }}</span>@endif</div>
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

<!-- REQUESTS -->
<div class="sc on" id="creqs">
  <div style="margin-bottom:24px;"><div style="font-size:22px;font-weight:900;">طلبات الحجز</div><div style="font-size:13px;color:#8A7868;" id="rSub">{{ $pendingCount }} طلبات معلقة من أصل {{ $events->total() }}</div></div>
  <div style="margin-bottom:20px;">
    <a href="{{ route('club.bookings.index') }}" class="fbtn {{ !isset($filters['status']) ? 'on' : '' }}">الكل</a>
    <a href="{{ route('club.bookings.index', ['status' => 'waiting_club']) }}" class="fbtn {{ ($filters['status'] ?? '') === 'waiting_club' ? 'on' : '' }}">معلق</a>
    <a href="{{ route('club.bookings.index', ['status' => 'confirmed']) }}" class="fbtn {{ ($filters['status'] ?? '') === 'confirmed' ? 'on' : '' }}">مقبول</a>
    <a href="{{ route('club.bookings.index', ['status' => 'rejected']) }}" class="fbtn {{ ($filters['status'] ?? '') === 'rejected' ? 'on' : '' }}">مرفوض</a>
    <a href="{{ route('club.bookings.index', ['status' => 'alternative_proposed']) }}" class="fbtn {{ ($filters['status'] ?? '') === 'alternative_proposed' ? 'on' : '' }}">وقت بديل</a>
  </div>
  <div id="rList">

    @forelse($events as $event)
    @php
      $statusAr = match($event->status) {
        'waiting_club' => 'معلق',
        'confirmed' => 'مقبول',
        'rejected' => 'مرفوض',
        'alternative_proposed' => 'وقت بديل',
        default => $event->status,
      };
      $statusIcon = match($event->status) {
        'waiting_club' => '⏳',
        'confirmed' => '✅',
        'rejected' => '❌',
        'alternative_proposed' => '🔄',
        default => '',
      };
      $statusColor = match($event->status) {
        'waiting_club' => '#B8860A',
        'confirmed' => '#1A7A4A',
        'rejected' => '#C8410A',
        'alternative_proposed' => '#1A5FAB',
        default => '#8A7868',
      };
      $endTime = \Carbon\Carbon::parse($event->start_time)->addMinutes($event->duration_minutes)->format('g:i');
      $startTimeFormatted = \Carbon\Carbon::parse($event->start_time)->format('g:i');
    @endphp
    <div class="card req" data-s="{{ $statusAr }}" style="border-right:4px solid {{ $statusColor }};margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
        <div><div style="font-size:16px;font-weight:800;margin-bottom:6px;">{{ $event->company?->name }}</div><div style="display:flex;gap:8px;align-items:center;"><span class="badge" style="background:{{ $statusColor }}18;color:{{ $statusColor }};">{{ $event->sport?->icon }} {{ $event->sport?->name }}</span><span style="font-size:11px;color:#8A7868;">{{ $event->created_at->diffForHumans() }}</span></div></div>
        <span class="badge r-status" style="background:{{ $statusColor }}18;color:{{ $statusColor }};">{{ $statusIcon }} {{ $statusAr }}</span>
      </div>
      <div class="req-grid">
        <div class="ri"><div class="rl">📅 التاريخ</div><div class="rv">{{ $event->event_date->translatedFormat('l j F Y') }}</div></div>
        <div class="ri"><div class="rl">🕐 الوقت</div><div class="rv">{{ $startTimeFormatted }} — {{ $endTime }}</div></div>
        <div class="ri"><div class="rl">🏟️ عدد الملاعب</div><div class="rv">{{ $event->courts_count }} {{ $event->courts_count > 1 ? 'ملاعب' : 'ملعب' }}</div></div>
        <div class="ri"><div class="rl">👥 عدد اللاعبين</div><div class="rv">{{ $event->capacity }} لاعبين</div></div>
        <div class="ri"><div class="rl">💰 إجمالي المبلغ</div><div class="rv" style="color:#1A7A4A;font-size:16px;">{{ number_format($event->total_amount) }} ريال</div></div>
        <div class="ri"><div class="rl">📐 الحساب</div><div class="rv" style="color:#8A7868;font-size:11px;">{{ $event->courts_count }} ملعب × {{ $event->courts_count > 0 ? number_format($event->total_amount / $event->courts_count) : 0 }} ر</div></div>
      </div>
      @if($event->status === 'rejected' && $event->rejection_reason)
      <div style="background:#C8410A18;border:1px solid #C8410A33;border-radius:10px;padding:12px 16px;font-size:13px;color:#C8410A;font-weight:700;margin-top:10px;">❌ سبب الرفض: {{ $event->rejection_reason }}</div>
      @endif
      @if($event->status === 'waiting_club')
      <div id="af{{ $event->id }}" style="display:none;background:rgba(26,95,171,.06);border:1px solid rgba(26,95,171,.25);border-radius:12px;padding:16px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:700;color:#1A5FAB;margin-bottom:14px;">📤 اقتراح وقت وتفاصيل بديلة</div>
        <div class="frow">
          <div class="fg"><label>التاريخ البديل</label><input type="text" id="ad{{ $event->id }}" placeholder="{{ $event->event_date->translatedFormat('l j F Y') }}"></div>
          <div class="fg"><label>الوقت البديل</label><input type="text" id="at{{ $event->id }}" placeholder="{{ $startTimeFormatted }} — {{ $endTime }}"></div>
        </div>
        <div class="frow">
          <div class="fg"><label>عدد الملاعب المتاحة</label><select id="ac{{ $event->id }}">@for($i = 1; $i <= max($event->courts_count, 3); $i++)<option value="{{ $i }}" {{ $i == $event->courts_count ? 'selected' : '' }}>{{ $i }} {{ $i > 1 ? 'ملاعب' : 'ملعب' }}</option>@endfor</select></div>
          <div class="fg"><label>المبلغ المعدّل (ريال)</label><input type="number" id="ap{{ $event->id }}" placeholder="{{ number_format($event->total_amount, 0, '', '') }}"></div>
        </div>
        <div class="fg" style="margin-bottom:12px;"><label>ملاحظات إضافية للشركة</label><textarea id="an{{ $event->id }}" placeholder="اكتب أي تفاصيل إضافية..."></textarea></div>
        <div style="display:flex;gap:10px;">
          <button onclick="subAlt({{ $event->id }})" style="flex:2;padding:10px;background:#1A5FAB;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">إرسال الوقت البديل ←</button>
          <button onclick="document.getElementById('af{{ $event->id }}').style.display='none'" style="flex:1;padding:10px;background:#EAE4DC;color:#8A7868;border:none;border-radius:10px;font-size:13px;cursor:pointer;font-family:inherit;">إلغاء</button>
        </div>
      </div>
      <div style="display:flex;gap:10px;" id="ra{{ $event->id }}">
        <form action="{{ route('club.bookings.reject', $event) }}" method="POST" style="flex:1;" onsubmit="return confirm('هل أنت متأكد من رفض هذا الطلب؟')">
          @csrf
          <input type="hidden" name="reason" value="الملعب محجوز">
          <button type="submit" style="width:100%;padding:11px;background:#C8410A18;color:#C8410A;border:1px solid #C8410A33;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">رفض</button>
        </form>
        <button onclick="togAlt({{ $event->id }})" style="flex:1;padding:11px;background:#1A5FAB18;color:#1A5FAB;border:1px solid #1A5FAB33;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">وقت بديل</button>
        <form action="{{ route('club.bookings.approve', $event) }}" method="POST" style="flex:2;">
          @csrf
          <button type="submit" style="width:100%;padding:11px;background:#1A7A4A;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;">قبول الحجز ✓</button>
        </form>
      </div>
      @endif
    </div>
    @empty
    <div class="card" style="text-align:center;padding:40px;color:#8A7868;">
      <div style="font-size:40px;margin-bottom:12px;">📋</div>
      <div style="font-size:15px;font-weight:700;">لا توجد طلبات حجز</div>
    </div>
    @endforelse

  </div>

  @if($events->hasPages())
  <div style="margin-top:20px;display:flex;justify-content:center;">
    {{ $events->links() }}
  </div>
  @endif
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
function togAlt(n){var e=document.getElementById('af'+n);e.style.display=e.style.display==='none'?'block':'none';}
function subAlt(n){
  var d=document.getElementById('ad'+n).value;
  var t=document.getElementById('at'+n).value;
  var c=document.getElementById('ac'+n).value;
  var p=document.getElementById('ap'+n).value;
  var notes=document.getElementById('an'+n).value;
  var parts=[];
  if(d) parts.push('📅 '+d);
  if(t) parts.push('🕐 '+t);
  if(c) parts.push('🏟️ '+c+' ملعب');
  if(p) parts.push('💰 '+p+' ريال');
  var html='<div style="background:#1A5FAB18;border:1px solid #1A5FAB33;border-radius:10px;padding:12px 16px;font-size:13px;color:#1A5FAB;font-weight:700;">🔄 تم إرسال وقت بديل<br><span style="font-size:12px;font-weight:400;color:#3D4F6B;">'+parts.join('  ·  ')+(notes?'<br>📝 '+notes:'')+'</span></div>';
  document.getElementById('af'+n).style.display='none';
  document.getElementById('ra'+n).style.display='none';
  var rs=document.createElement('div');
  rs.innerHTML=html;
  document.getElementById('af'+n).parentNode.appendChild(rs);
}
</script>
</body></html>
