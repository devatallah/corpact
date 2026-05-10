<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — مجتمعاتي</title>
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

@php
  $selected = $selectedCommunity ?? $communities->first();
  $color = $selected->color ?? '#009E82';
@endphp

<div class="screen on" id="sCommunity">
  <div style="padding:16px 0 20px;">
    <div style="font-size:13px;color:#7A8BA8;margin-bottom:8px;">المجتمعات</div>
    <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:12px;">
      @forelse($communities as $community)
      @php $cColor = $community->color ?? '#009E82'; @endphp
      <div onclick="window.location='{{ route('employee.community.show', $community) }}'" class="comm-ico" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;flex-shrink:0;">
        <div class="ci-box{{ $selected && $selected->id === $community->id ? ' active-ci' : '' }}" style="width:52px;height:52px;border-radius:16px;background:{{ $selected && $selected->id === $community->id ? $cColor.'33' : '#fff' }};border:2px solid {{ $selected && $selected->id === $community->id ? $cColor : '#E4E9F2' }};display:flex;align-items:center;justify-content:center;font-size:24px;">{{ $community->icon ?? $community->sport->icon ?? '🏅' }}</div>
        <div class="ci-lbl" style="font-size:10px;color:{{ $selected && $selected->id === $community->id ? $cColor : '#7A8BA8' }};{{ $selected && $selected->id === $community->id ? 'font-weight:700;' : '' }}">{{ $community->name }}</div>
      </div>
      @empty
      <div style="font-size:13px;color:#7A8BA8;padding:12px;">لم تنضم لأي مجتمع بعد</div>
      @endforelse
    </div>
  </div>

  @if($selected)
  <div class="card" id="cInfo" style="border-color:{{ $color }}33;margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:18px;font-weight:800;" id="cName">{{ $selected->icon ?? $selected->sport->icon ?? '🏅' }} مجتمع {{ $selected->name }}</div><span class="badge" style="background:{{ $color }}18;color:{{ $color }};">● {{ $selected->status === 'active' ? 'نشط' : $selected->status }}</span></div>
    <div style="display:flex;gap:20px;align-items:center;margin-bottom:14px;">
      <div style="text-align:center;"><div style="font-size:20px;font-weight:900;color:{{ $color }};">{{ $selected->member_count }}</div><div style="font-size:10px;color:#7A8BA8;">عضو</div></div>
      <div style="text-align:center;"><div style="font-size:20px;font-weight:900;color:{{ $color }};">{{ $selected->events_count ?? $selected->events()->whereIn('status', ['open','full','confirmed'])->count() }}</div><div style="font-size:10px;color:#7A8BA8;">فعالية نشطة</div></div>
      <div style="flex:1;"></div>
      <button onclick="window.location='{{ route('employee.events.create') }}'" style="background:{{ $color }};color:#000;border:none;border-radius:20px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">+ إنشاء فعالية</button>
    </div>
  </div>
  <div class="card" style="border-color:{{ $color }}44;margin-bottom:16px;">
    <div style="font-size:11px;color:#7A8BA8;margin-bottom:6px;font-weight:600;">رصيد المجتمع</div>
    <div style="font-size:26px;font-weight:900;color:{{ $color }};">{{ number_format($selected->balance) }} ريال</div>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:14px;">
    <button onclick="ctab(this,'ctE')" id="ctab1" class="pill" style="background:{{ $color }};color:#fff;">الفعاليات</button>
    <button onclick="ctab(this,'ctA')" class="pill" style="background:#E4E9F2;color:#7A8BA8;">الإعلانات</button>
    <button onclick="ctab(this,'ctM')" class="pill" style="background:#E4E9F2;color:#7A8BA8;">الأعضاء</button>
  </div>

  <!-- Events Tab -->
  <div id="ctE">
    @forelse($events ?? $selected->events()->with(['club','sport'])->whereIn('status', ['open','full','confirmed'])->latest('event_date')->get() as $event)
    <div onclick="window.location='{{ route('employee.events.show', $event) }}'" class="card" style="cursor:pointer;border-right:3px solid {{ $color }};">
      <div style="font-size:13px;font-weight:700;">{{ $event->club->name }}</div>
      <div style="font-size:11px;color:#7A8BA8;margin:4px 0 8px;">{{ $event->event_date->translatedFormat('l j F') }} · {{ \Carbon\Carbon::parse($event->start_time)->format('g:i') }}</div>
      <div class="bar-wrap"><div class="bar-fill" style="width:{{ $event->capacity > 0 ? round($event->participants_count / $event->capacity * 100) : 0 }}%;background:{{ $color }};"></div></div>
      <div style="font-size:10px;color:#7A8BA8;margin-top:4px;">{{ $event->participants_count }} من {{ $event->capacity }}</div>
    </div>
    @empty
    <div style="text-align:center;padding:24px;color:#7A8BA8;font-size:13px;">لا توجد فعاليات حالياً</div>
    @endforelse
  </div>

  <!-- Announcements Tab -->
  <div id="ctA" style="display:none;">
    @forelse($announcements ?? $selected->announcements()->with('employee')->latest()->get() as $announcement)
    <div class="card"><div style="font-size:13px;color:#4A5C78;line-height:1.6;">{{ $announcement->body }}</div><div style="font-size:10px;color:#7A8BA8;margin-top:6px;">{{ $announcement->created_at->diffForHumans() }} · {{ $announcement->employee->name }}</div></div>
    @empty
    <div style="text-align:center;padding:24px;color:#7A8BA8;font-size:13px;">لا توجد إعلانات</div>
    @endforelse
  </div>

  <!-- Members Tab -->
  <div id="ctM" style="display:none;">
    @forelse($members ?? $selected->members()->orderByPivot('role','asc')->get() as $member)
    <div class="card row" style="margin-bottom:8px;"><div class="avatar" style="background:{{ $color }}22;color:{{ $color }};">{{ mb_substr($member->name, 0, 1) }}</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;">{{ $member->name }}</div><div style="font-size:11px;color:#7A8BA8;">{{ $member->department }}</div></div>@if($member->pivot->role === 'captain' || $selected->leader_id === $member->id)<span class="badge" style="background:{{ $color }}18;color:{{ $color }};">{{ $selected->leader_id === $member->id ? 'قائد' : 'كابتن' }}</span>@endif</div>
    @empty
    <div style="text-align:center;padding:24px;color:#7A8BA8;font-size:13px;">لا يوجد أعضاء</div>
    @endforelse
  </div>
  @else
  <div style="text-align:center;padding:40px 20px;color:#7A8BA8;font-size:13px;">لم تنضم لأي مجتمع بعد. <a href="{{ route('employee.explore.index') }}" style="color:#009E82;font-weight:700;">اكتشف المجتمعات</a></div>
  @endif
</div>

</div><!-- end content -->

<!-- Bottom Nav -->
<div class="bottom-nav">
  <button class="nb" onclick="window.location='{{ route('employee.home') }}'"><span class="ico">🏠</span><small class="lbl">الرئيسية</small></button>
  <button class="nb on" onclick="window.location='{{ route('employee.community.index') }}'"><span class="ico">👥</span><small class="lbl">مجتمعاتي</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.events.create') }}'"><div class="nav-special">➕</div><small class="lbl">فعالية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.explore.index') }}'"><span class="ico">🔍</span><small class="lbl">استكشف</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.profile.index') }}'"><span class="ico">👤</span><small class="lbl">ملفي</small></button>
</div>
</div>

<script>
function ctab(btn,id){
  document.querySelectorAll('#sCommunity .pill').forEach(b=>{b.style.background='#E4E9F2';b.style.color='#7A8BA8';});
  btn.style.background='{{ $color }}';btn.style.color='#fff';
  ['ctE','ctA','ctM'].forEach(i=>document.getElementById(i).style.display='none');
  document.getElementById(id).style.display='block';
}
</script>
</body></html>
