<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — الفعاليات</title>
@vite(['resources/css/admin.css'])
</head>
<body>

<!-- Mobile hamburger -->
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>

<!-- Sidebar -->
<div class="sidebar" id="sb">
  <div class="logo">
    <div class="ar">كورباكت</div>
    <div class="en">CORPACT</div>
    <div class="tag">ADMIN</div>
  </div>
  <div class="admin-info">
    <div class="admin-avatar">م</div>
    <div><div class="admin-name">مشرف النظام</div><div class="admin-role">Super Admin</div></div>
  </div>
  <nav>
    <div class="ni" onclick="window.location='/admin/dash'"><span>📊</span><span class="nl">لوحة التحكم</span></div>
    <div class="ni" onclick="window.location='/admin/companies'"><span>🏢</span><span class="nl">الشركات</span></div>
    <div class="ni" onclick="window.location='/admin/clubs'"><span>🏟️</span><span class="nl">الأندية</span></div>
    <div class="ni" onclick="window.location='/admin/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni on" onclick="window.location='/admin/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni" onclick="window.location='/admin/revenue'"><span>💰</span><span class="nl">الإيرادات</span></div>
    <div class="ni" onclick="window.location='/admin/notifs'"><span>🔔</span><span class="nl">الإشعارات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('admin.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>

<div class="main">

<div class="sc on" id="events">
  <div class="page-title">الفعاليات</div>
  <div class="page-sub">{{ number_format($totalEvents) }} فعالية على المنصة</div>
  <div style="margin-bottom:16px;">
    <button class="fbtn on" onclick="filt(this,'all','.ev-row')">الكل</button>
    <button class="fbtn" onclick="filt(this,'مفتوحة','.ev-row')">مفتوحة</button>
    <button class="fbtn" onclick="filt(this,'مؤكدة','.ev-row')">مؤكدة</button>
    <button class="fbtn" onclick="filt(this,'منتهية','.ev-row')">منتهية</button>
  </div>
  <div class="card" style="padding:0;overflow:hidden;">
    <table>
      <thead><tr><th>الفعالية</th><th>الشركة</th><th>النادي</th><th>التاريخ</th><th>اللاعبون</th><th>المبلغ</th><th>الحالة</th></tr></thead>
      <tbody>
        @forelse($events as $event)
        @php
          $filterStatus = match($event->status) {
            'open', 'waiting_club', 'alternative_proposed' => 'مفتوحة',
            'confirmed', 'full' => 'مؤكدة',
            'completed' => 'منتهية',
            'cancelled', 'rejected' => 'ملغية',
            default => 'مفتوحة',
          };
        @endphp
        <tr class="ev-row" data-s="{{ $filterStatus }}"><td><span style="font-weight:600;color:#fff;">{{ $event->sport?->icon ?? '' }} {{ $event->sport?->name ?? '-' }}</span></td><td style="color:#C8D0E0;">{{ $event->company?->name ?? ($event->community?->company?->name ?? '-') }}</td><td style="color:#C8D0E0;">{{ $event->club?->name ?? '-' }}</td><td style="font-size:12px;color:#6B7A99;">{{ $event->event_date?->translatedFormat('l j F') }} · {{ $event->start_time }}</td><td>{{ $event->participants_count }}/{{ $event->capacity }}</td><td style="color:@if(in_array($event->status, ['completed']))#009E82 @else #D4820A @endif;font-weight:700;">{{ number_format($event->total_amount) }} ر</td><td>
          @if($event->status === 'open')
          <span class="badge b-review">🔍 مفتوحة</span>
          @elseif($event->status === 'waiting_club')
          <span class="badge b-pending">انتظار النادي</span>
          @elseif($event->status === 'confirmed')
          <span class="badge b-active">✅ مؤكدة</span>
          @elseif($event->status === 'full')
          <span class="badge b-active">✅ مكتملة</span>
          @elseif($event->status === 'completed')
          <span class="badge b-active">✅ منتهية</span>
          @elseif($event->status === 'cancelled')
          <span class="badge b-rejected">❌ ملغية</span>
          @elseif($event->status === 'rejected')
          <span class="badge b-rejected">❌ مرفوضة</span>
          @elseif($event->status === 'alternative_proposed')
          <span class="badge b-review">🔄 بديل مقترح</span>
          @endif
        </td></tr>
        @empty
        <tr><td colspan="7" style="text-align:center;color:#6B7A99;padding:20px;">لا توجد فعاليات</td></tr>
        @endforelse
      </tbody>
    </table>
  </div>
</div>

</div><!-- main -->

<script>
function togMobile(){
  document.getElementById('sb').classList.toggle('open');
  document.getElementById('sbBackdrop').classList.toggle('open');
}
function closeMobile(){
  document.getElementById('sb').classList.remove('open');
  document.getElementById('sbBackdrop').classList.remove('open');
}
function togSB(){
  var s=document.getElementById('sb');s.classList.toggle('small');
  s.querySelector('.tog').textContent=s.classList.contains('small')?'←':'→';
  document.querySelectorAll('.nl,.nb,.admin-name,.admin-role,.logo .en,.logo .tag').forEach(n=>n.style.display=s.classList.contains('small')?'none':'');
}
function filt(btn,f,cls){
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  document.querySelectorAll(cls).forEach(r=>r.style.display=(f==='all'||r.dataset.s===f)?'':'none');
}
</script>
</body></html>
