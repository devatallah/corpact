<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — الرئيسية</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
@vite(['resources/css/main.css', 'resources/css/employee.css'])
</head>
<body>
<div class="phone">
<div class="topbar">
  <form method="POST" action="{{ route('employee.logout') }}" style="display:inline;margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="background:#fff;border:1px solid #E4E9F2;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;color:#4A5C78;font-family:inherit;">← خروج</button></form>
  <div><div class="logo-ar">تيمات</div><div class="logo-en">TEAMAT</div></div>
  <div style="margin-right:auto;font-size:10px;color:#7A8BA8;letter-spacing:1px;">EMPLOYEE</div>
</div>
<div class="content">

<div class="screen on" id="sHome">
  <div style="padding:16px 0 20px;display:flex;justify-content:space-between;align-items:center;">
    <div><div style="font-size:13px;color:#7A8BA8;">مرحباً،</div><div style="font-size:20px;font-weight:800;">{{ $employee->name }} 👋</div></div>
    <div style="display:flex;gap:8px;align-items:center;">
      <button onclick="window.location='{{ route('employee.notifications.index') }}'" style="width:42px;height:42px;border-radius:50%;background:#fff;border:1px solid #E4E9F2;cursor:pointer;font-size:18px;position:relative;">🔔<div class="notif-dot"></div></button>
      <button onclick="window.location='{{ route('employee.profile.index') }}'" style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#009E82,#5B3FCC);border:none;cursor:pointer;font-size:18px;color:#fff;font-weight:700;">{{ mb_substr($employee->name, 0, 1) }}</button>
    </div>
  </div>
  <!-- Communities -->
  <div style="margin-bottom:20px;">
    <div style="font-size:15px;font-weight:700;margin-bottom:12px;">مجتمعاتي</div>
    <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;">
      @forelse($communities as $community)
      <div onclick="window.location='{{ route('employee.community.show', $community) }}'" class="card" style="min-width:120px;flex-shrink:0;cursor:pointer;border-color:{{ $community->color ?? '#009E82' }}33;margin-bottom:0;">
        <div style="font-size:28px;margin-bottom:6px;">{{ $community->icon ?? $community->sport->icon ?? '🏅' }}</div><div style="font-size:13px;font-weight:700;">{{ $community->name }}</div><div style="font-size:11px;color:#7A8BA8;margin-top:2px;">{{ $community->members_count }} عضو</div>
      </div>
      @empty
      <div style="font-size:13px;color:#7A8BA8;padding:12px;">لم تنضم لأي مجتمع بعد</div>
      @endforelse
    </div>
  </div>
  <!-- Explore Banner -->
  <div onclick="window.location='{{ route('employee.explore.index') }}'" style="background:linear-gradient(135deg,#009E82,#2563EB);border-radius:18px;padding:18px 20px;margin-bottom:24px;cursor:pointer;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(0,158,130,.3);">
    <div style="font-size:36px;">🔍</div>
    <div style="flex:1;"><div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:3px;">اكتشف مجتمعات جديدة</div><div style="font-size:12px;color:rgba(255,255,255,.8);">انضم لمجتمعات شركتك الرياضية</div></div>
    <div style="background:rgba(255,255,255,.2);border-radius:12px;padding:8px 14px;font-size:13px;font-weight:700;color:#fff;">استكشف ←</div>
  </div>
  <!-- Upcoming -->
  <div>
    <div style="font-size:15px;font-weight:700;margin-bottom:12px;">فعالياتي القادمة</div>
    <div style="display:flex;gap:8px;margin-bottom:14px;overflow-x:auto;">
      <button class="pill on-pill" onclick="filterG('all',this)" style="background:#009E82;color:#fff;flex-shrink:0;">الكل</button>
      @foreach($communities as $community)
      <button class="pill" onclick="filterG('{{ $community->name }}',this)" style="background:#E4E9F2;color:#7A8BA8;flex-shrink:0;">{{ $community->icon ?? $community->sport->icon ?? '🏅' }} {{ $community->name }}</button>
      @endforeach
    </div>
    <div id="gameCards">
      @forelse($events as $event)
      @php $color = $event->community->color ?? '#009E82'; @endphp
      <div onclick="window.location='{{ route('employee.events.show', $event) }}'" class="card" data-c="{{ $event->community->name }}" style="cursor:pointer;border-right:3px solid {{ $color }};">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><div><div style="font-size:13px;font-weight:700;">{{ $event->business->name }}</div><div style="font-size:11px;color:#7A8BA8;">{{ $event->business->district }}</div></div><span class="badge" style="background:{{ $color }}18;color:{{ $color }};">● {{ $event->status === 'open' ? 'مفتوح' : ($event->status === 'full' ? 'مكتمل' : $event->status) }}</span></div>
        <div style="display:flex;gap:16px;margin-bottom:12px;"><span style="font-size:12px;color:#4A5C78;">📅 {{ $event->event_date->translatedFormat('l j F') }}</span><span style="font-size:12px;color:#4A5C78;">🕐 {{ \Carbon\Carbon::parse($event->start_time)->format('g:i') }}</span></div>
        <div class="bar-wrap"><div class="bar-fill" style="width:{{ $event->capacity > 0 ? round($event->participants_count / $event->capacity * 100) : 0 }}%;background:{{ $color }};"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#7A8BA8;margin:4px 0 12px;"><span>{{ $event->participants_count }} منضم</span><span>من {{ $event->capacity }}</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          @if($event->player_payment <= 0)
          <span style="font-size:11px;color:{{ $color }};font-weight:600;">✓ مغطى من الشركة</span>
          @else
          <span style="font-size:11px;color:{{ $color }};font-weight:600;">{{ number_format($event->cost_per_person) }} ر/شخص</span>
          @endif
          <span style="background:{{ $color }}18;color:{{ $color }};border:1px solid {{ $color }}44;border-radius:20px;padding:6px 16px;font-size:12px;font-weight:700;">{{ $event->community->icon ?? $event->sport->icon ?? '🏅' }} {{ $event->community->name }}</span>
        </div>
      </div>
      @empty
      <div style="text-align:center;padding:24px;color:#7A8BA8;font-size:13px;">لا توجد فعاليات قادمة حالياً</div>
      @endforelse
    </div>
  </div>
</div>

</div><!-- end content -->

<!-- Bottom Nav -->
<div class="bottom-nav">
  <button class="nb on" onclick="window.location='{{ route('employee.home') }}'"><span class="ico">🏠</span><small class="lbl">الرئيسية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.community.index') }}'"><span class="ico">👥</span><small class="lbl">مجتمعاتي</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.events.create') }}'"><div class="nav-special">➕</div><small class="lbl">فعالية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.explore.index') }}'"><span class="ico">🔍</span><small class="lbl">استكشف</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.profile.index') }}'"><span class="ico">👤</span><small class="lbl">ملفي</small></button>
</div>
</div>

<script>
function filterG(c,btn){
  document.querySelectorAll('.pill').forEach(p=>{p.style.background='#E4E9F2';p.style.color='#7A8BA8';});
  btn.style.background='#009E82';btn.style.color='#fff';
  document.querySelectorAll('#gameCards [data-c]').forEach(el=>{
    el.style.display=(c==='all'||el.dataset.c===c)?'block':'none';
  });
}
</script>
</body></html>
