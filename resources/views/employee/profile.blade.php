<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — ملفي</title>
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

<div class="screen on" id="sProfile">
  <div style="padding:20px 0 24px;text-align:center;">
    <div style="width:80px;height:80px;border-radius:50%;margin:0 auto 12px;background:linear-gradient(135deg,#009E82,#5B3FCC);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#fff;">{{ mb_substr($employee->name, 0, 1) }}</div>
    <div style="font-size:20px;font-weight:800;">{{ $employee->name }}</div>
    <div style="font-size:13px;color:#7A8BA8;margin-bottom:16px;">{{ $employee->department }} · {{ $employee->company->name }}</div>
    <div style="display:flex;background:#fff;border:1px solid #E4E9F2;border-radius:16px;overflow:hidden;">
      <div style="flex:1;padding:14px 0;text-align:center;border-left:1px solid #E4E9F2;"><div style="font-size:20px;font-weight:900;color:#009E82;">{{ $stats['events_participated'] }}</div><div style="font-size:10px;color:#7A8BA8;margin-top:2px;">فعالية شاركت</div></div>
      <div style="flex:1;padding:14px 0;text-align:center;border-left:1px solid #E4E9F2;"><div style="font-size:20px;font-weight:900;color:#009E82;">{{ $stats['communities_joined'] }}</div><div style="font-size:10px;color:#7A8BA8;margin-top:2px;">مجتمعات</div></div>
      <div style="flex:1;padding:14px 0;text-align:center;"><div style="font-size:20px;font-weight:900;color:#009E82;">{{ $stats['events_created'] }}</div><div style="font-size:10px;color:#7A8BA8;margin-top:2px;">فعاليات أنشأت</div></div>
    </div>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:16px;">
    <button onclick="ptab(this,'ptE')" class="pill" style="background:#009E82;color:#fff;">فعالياتي</button>
    <button onclick="ptab(this,'ptC')" class="pill" style="background:#E4E9F2;color:#7A8BA8;">مجتمعاتي</button>
  </div>

  <!-- Events Tab -->
  <div id="ptE">
    @forelse($events as $event)
    @php $eColor = $event->community->color ?? '#009E82'; @endphp
    <div onclick="window.location='{{ route('employee.events.show', $event) }}'" class="card" style="cursor:pointer;border-right:3px solid {{ $eColor }};">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <div><div style="font-size:13px;font-weight:700;">{{ $event->business->name }}</div><div style="font-size:11px;color:#7A8BA8;">{{ $event->community->name }}</div></div>
        <span class="badge" style="background:{{ $event->status === 'confirmed' ? '#009E8218' : '#D4820A18' }};color:{{ $event->status === 'confirmed' ? '#009E82' : '#D4820A' }};">{{ $event->status === 'confirmed' ? 'مؤكدة' : ($event->status === 'open' ? 'مفتوح' : ($event->status === 'waiting_business' ? 'انتظار النادي' : $event->status)) }}</span>
      </div>
      <div style="display:flex;gap:14px;"><span style="font-size:11px;color:#7A8BA8;">📅 {{ $event->event_date->translatedFormat('l j F') }}</span><span style="font-size:11px;color:#7A8BA8;">👥 {{ $event->participants_count }}/{{ $event->capacity }}</span></div>
    </div>
    @empty
    <div style="text-align:center;padding:24px;color:#7A8BA8;font-size:13px;">لم تشارك في أي فعالية بعد</div>
    @endforelse
  </div>

  <!-- Communities Tab -->
  <div id="ptC" style="display:none;">
    @forelse($communities as $community)
    @php $cColor = $community->color ?? '#009E82'; @endphp
    <div onclick="window.location='{{ route('employee.community.show', $community) }}'" class="card" style="cursor:pointer;border-color:{{ $cColor }}33;display:flex;align-items:center;gap:12px;margin-bottom:10px;">
      <div style="width:46px;height:46px;border-radius:12px;background:{{ $cColor }}18;display:flex;align-items:center;justify-content:center;font-size:24px;">{{ $community->icon ?? $community->sport->icon ?? '🏅' }}</div>
      <div style="flex:1;"><div style="font-size:14px;font-weight:700;">{{ $community->name }}</div><div style="font-size:11px;color:#7A8BA8;">{{ $community->members_count }} عضو</div></div>
    </div>
    @empty
    <div style="text-align:center;padding:24px;color:#7A8BA8;font-size:13px;">لم تنضم لأي مجتمع بعد. <a href="{{ route('employee.explore.index') }}" style="color:#009E82;font-weight:700;">اكتشف المجتمعات</a></div>
    @endforelse
  </div>
</div>

</div><!-- end content -->

<!-- Bottom Nav -->
<div class="bottom-nav">
  <button class="nb" onclick="window.location='{{ route('employee.home') }}'"><span class="ico">🏠</span><small class="lbl">الرئيسية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.community.index') }}'"><span class="ico">👥</span><small class="lbl">مجتمعاتي</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.events.create') }}'"><div class="nav-special">➕</div><small class="lbl">فعالية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.explore.index') }}'"><span class="ico">🔍</span><small class="lbl">استكشف</small></button>
  <button class="nb on" onclick="window.location='{{ route('employee.profile.index') }}'"><span class="ico">👤</span><small class="lbl">ملفي</small></button>
</div>
</div>

<script>
function ptab(btn,id){
  document.querySelectorAll('#sProfile .pill').forEach(b=>{b.style.background='#E4E9F2';b.style.color='#7A8BA8';});
  btn.style.background='#009E82';btn.style.color='#fff';
  ['ptE','ptC'].forEach(i=>document.getElementById(i).style.display='none');
  document.getElementById(id).style.display='block';
}
</script>
</body></html>
