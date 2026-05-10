<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — استكشف</title>
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

<div class="screen on" id="sExplore">
  <div style="padding:16px 0 20px;"><div style="font-size:11px;color:#7A8BA8;">اكتشف واختر</div><div style="font-size:20px;font-weight:800;">المجتمعات المتاحة</div></div>
  @forelse($communities as $community)
  @php $color = $community->color ?? '#009E82'; @endphp
  <div class="card" style="margin-bottom:12px;{{ $community->is_member ? 'border-right:4px solid '.$color.';' : '' }}">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;"><div style="width:50px;height:50px;border-radius:14px;background:{{ $color }}18;display:flex;align-items:center;justify-content:center;font-size:26px;">{{ $community->icon ?? $community->sport->icon ?? '🏅' }}</div><div><div style="font-size:15px;font-weight:700;">{{ $community->name }}</div><div style="font-size:11px;color:#7A8BA8;">{{ $community->description }}</div></div></div>
    <div style="display:flex;gap:12px;margin-bottom:12px;"><span style="font-size:11px;color:#7A8BA8;">👥 {{ $community->members_count }} عضو</span><span style="font-size:11px;color:#7A8BA8;">📅 {{ $community->events_count ?? $community->events()->count() }} فعالية</span></div>
    @if($community->is_member)
    <form action="{{ route('employee.community.leave', $community) }}" method="POST">
      @csrf
      <button type="submit" style="width:100%;padding:10px;background:#E4E9F2;color:#7A8BA8;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">✓ منضم — اضغط للمغادرة</button>
    </form>
    @else
    <form action="{{ route('employee.community.join', $community) }}" method="POST">
      @csrf
      <button type="submit" style="width:100%;padding:10px;background:{{ $color }};color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">انضم لمجتمع {{ $community->name }}</button>
    </form>
    @endif
  </div>
  @empty
  <div style="text-align:center;padding:40px 20px;color:#7A8BA8;font-size:13px;">لا توجد مجتمعات متاحة حالياً</div>
  @endforelse
</div>

</div><!-- end content -->

<!-- Bottom Nav -->
<div class="bottom-nav">
  <button class="nb" onclick="window.location='{{ route('employee.home') }}'"><span class="ico">🏠</span><small class="lbl">الرئيسية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.community.index') }}'"><span class="ico">👥</span><small class="lbl">مجتمعاتي</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.events.create') }}'"><div class="nav-special">➕</div><small class="lbl">فعالية</small></button>
  <button class="nb on" onclick="window.location='{{ route('employee.explore.index') }}'"><span class="ico">🔍</span><small class="lbl">استكشف</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.profile.index') }}'"><span class="ico">👤</span><small class="lbl">ملفي</small></button>
</div>
</div>

</body></html>
