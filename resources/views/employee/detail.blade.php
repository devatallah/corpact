<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — تفاصيل الفعالية</title>
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

@php $color = $event->community->color ?? '#009E82'; @endphp
<div class="screen on" id="sDetail">
  <div style="padding:16px 0 20px;"><div style="font-size:11px;color:#7A8BA8;">تفاصيل الفعالية</div><div style="font-size:20px;font-weight:800;">{{ $event->club->name }}</div><div style="font-size:13px;color:#7A8BA8;">{{ $event->club->district }}</div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
    <div class="card" style="margin-bottom:0;"><div style="font-size:20px;margin-bottom:4px;">📅</div><div style="font-size:10px;color:#7A8BA8;">التاريخ</div><div style="font-size:13px;font-weight:700;">{{ $event->event_date->translatedFormat('l j F') }}</div></div>
    <div class="card" style="margin-bottom:0;"><div style="font-size:20px;margin-bottom:4px;">🕐</div><div style="font-size:10px;color:#7A8BA8;">الوقت</div><div style="font-size:13px;font-weight:700;">{{ \Carbon\Carbon::parse($event->start_time)->format('g:i') }}</div></div>
    <div class="card" style="margin-bottom:0;"><div style="font-size:20px;margin-bottom:4px;">👥</div><div style="font-size:10px;color:#7A8BA8;">اللاعبون</div><div style="font-size:13px;font-weight:700;">{{ $event->participants_count }}/{{ $event->capacity }}</div></div>
    <div class="card" style="margin-bottom:0;"><div style="font-size:20px;margin-bottom:4px;">🏘️</div><div style="font-size:10px;color:#7A8BA8;">المجتمع</div><div style="font-size:13px;font-weight:700;">{{ $event->community->name }}</div></div>
  </div>
  <div class="card">
    <div style="font-size:13px;font-weight:700;margin-bottom:12px;">اللاعبون ({{ $event->participants_count }}/{{ $event->capacity }})</div>
    <div class="bar-wrap" style="margin-bottom:12px;"><div class="bar-fill" style="width:{{ $event->capacity > 0 ? round($event->participants_count / $event->capacity * 100) : 0 }}%;background:{{ $color }};"></div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      @foreach($event->participants->where('pivot.status', 'joined') as $participant)
      <div style="display:flex;align-items:center;gap:6px;"><div class="avatar" style="width:32px;height:32px;background:{{ $color }}22;color:{{ $color }};font-size:14px;">{{ mb_substr($participant->name, 0, 1) }}</div><span style="font-size:11px;color:#4A5C78;">{{ $participant->name }}</span></div>
      @endforeach
      @for($i = $event->participants->where('pivot.status', 'joined')->count(); $i < $event->capacity; $i++)
      <div style="width:32px;height:32px;border-radius:50%;border:2px dashed #E4E9F2;display:flex;align-items:center;justify-content:center;color:#7A8BA8;font-size:14px;">+</div>
      @endfor
    </div>
  </div>
  <div class="card">
    <div style="font-size:13px;font-weight:700;margin-bottom:12px;">الدفع</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:12px;color:#7A8BA8;">تكلفة الحجز/شخص</span><span style="font-size:13px;font-weight:700;">{{ number_format($payment['cost_per_person']) }} ريال</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:12px;color:#7A8BA8;">دعم الشركة</span><span style="font-size:13px;font-weight:700;color:{{ $color }};">-{{ number_format($payment['company_subsidy']) }} ريال</span></div>
    <div style="height:1px;background:#E4E9F2;margin:8px 0;"></div>
    <div style="display:flex;justify-content:space-between;"><span style="font-size:13px;font-weight:700;">تدفع</span><span style="font-size:16px;font-weight:900;color:{{ $color }};">{{ number_format($payment['cost_per_person']) }} ريال</span></div>
    @if($payment['player_payment'] <= 0)
    <div style="margin-top:10px;background:{{ $color }}18;border:1px solid {{ $color }}33;border-radius:10px;padding:8px 12px;font-size:11px;color:{{ $color }};text-align:center;">✅ مغطى بالكامل من رصيد شركتك</div>
    @endif
  </div>
  @if($isJoined)
  <div style="background:{{ $color }}18;border:1px solid {{ $color }}44;border-radius:16px;padding:16px;text-align:center;font-size:15px;font-weight:700;color:{{ $color }};margin-bottom:12px;">✓ أنت منضم في هذه الفعالية</div>
  <form action="{{ route('employee.events.leave', $event) }}" method="POST">
    @csrf
    <button type="submit" style="width:100%;padding:14px;background:#E4E9F2;color:#7A8BA8;border:none;border-radius:16px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">مغادرة الفعالية</button>
  </form>
  @elseif($event->status === 'open')
  <form action="{{ route('employee.events.join', $event) }}" method="POST">
    @csrf
    <button type="submit" style="width:100%;padding:16px;background:{{ $color }};color:#fff;border:none;border-radius:16px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;">انضم للفعالية</button>
  </form>
  @else
  <div style="background:#E4E9F2;border-radius:16px;padding:16px;text-align:center;font-size:15px;font-weight:700;color:#7A8BA8;">{{ $event->status === 'full' ? 'الفعالية مكتملة' : $event->status }}</div>
  @endif
</div>

</div><!-- end content -->

<!-- Bottom Nav -->
<div class="bottom-nav">
  <button class="nb" onclick="window.location='{{ route('employee.home') }}'"><span class="ico">🏠</span><small class="lbl">الرئيسية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.community.index') }}'"><span class="ico">👥</span><small class="lbl">مجتمعاتي</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.events.create') }}'"><div class="nav-special">➕</div><small class="lbl">فعالية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.explore.index') }}'"><span class="ico">🔍</span><small class="lbl">استكشف</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.profile.index') }}'"><span class="ico">👤</span><small class="lbl">ملفي</small></button>
</div>
</div>

</body></html>
