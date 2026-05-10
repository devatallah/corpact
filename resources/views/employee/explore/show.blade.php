<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — {{ $club->name }}</title>
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

<div class="screen on">
  <div style="padding:16px 0 8px;">
    <a href="{{ route('employee.explore.index') }}" style="font-size:13px;color:#7A8BA8;text-decoration:none;">← العودة للاستكشاف</a>
  </div>

  <div style="padding:12px 0 20px;">
    <div style="font-size:22px;font-weight:800;">{{ $club->name }}</div>
    <div style="font-size:13px;color:#7A8BA8;margin-top:4px;">{{ $club->district ?? '' }}{{ $club->district && $club->city ? '، ' : '' }}{{ $club->city ?? '' }}</div>
  </div>

  @if($club->sports && $club->sports->count())
  <div style="margin-bottom:20px;">
    <div style="font-size:13px;font-weight:700;margin-bottom:8px;">الرياضات</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      @foreach($club->sports as $sport)
      <span style="background:#009E8218;color:#009E82;font-size:12px;font-weight:600;padding:6px 12px;border-radius:20px;">{{ $sport->icon ?? '' }} {{ $sport->name }}</span>
      @endforeach
    </div>
  </div>
  @endif

  @if($club->courts && $club->courts->count())
  <div>
    <div style="font-size:13px;font-weight:700;margin-bottom:10px;">الملاعب ({{ $club->courts->count() }})</div>
    @foreach($club->courts as $court)
    <div class="card" style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:14px;font-weight:700;">{{ $court->name }}</div>
          <div style="font-size:11px;color:#7A8BA8;margin-top:2px;">{{ $court->sport?->name ?? '-' }}</div>
        </div>
        @php
          $badge = match($court->status) {
            'active' => ['bg' => '#0CA67818', 'color' => '#0CA678', 'label' => 'نشط'],
            default => ['bg' => '#E0305018', 'color' => '#E03050', 'label' => 'مغلق'],
          };
        @endphp
        <span style="background:{{ $badge['bg'] }};color:{{ $badge['color'] }};font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;">{{ $badge['label'] }}</span>
      </div>
    </div>
    @endforeach
  </div>
  @else
  <div style="text-align:center;padding:30px 20px;color:#7A8BA8;font-size:13px;">لا توجد ملاعب متاحة حالياً</div>
  @endif

  @if($club->contact_phone || $club->email)
  <div style="margin-top:20px;padding:16px;background:#F0F2F8;border-radius:12px;">
    <div style="font-size:13px;font-weight:700;margin-bottom:8px;">معلومات التواصل</div>
    @if($club->email)<div style="font-size:12px;color:#4A5C78;margin-bottom:4px;" dir="ltr">{{ $club->email }}</div>@endif
    @if($club->contact_phone)<div style="font-size:12px;color:#4A5C78;" dir="ltr">{{ $club->contact_phone }}</div>@endif
  </div>
  @endif
</div>

</div>

<div class="bottom-nav">
  <button class="nb" onclick="window.location='{{ route('employee.home') }}'"><span class="ico">🏠</span><small class="lbl">الرئيسية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.community.index') }}'"><span class="ico">👥</span><small class="lbl">مجتمعاتي</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.events.create') }}'"><div class="nav-special">➕</div><small class="lbl">فعالية</small></button>
  <button class="nb on" onclick="window.location='{{ route('employee.explore.index') }}'"><span class="ico">🔍</span><small class="lbl">استكشف</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.profile.index') }}'"><span class="ico">👤</span><small class="lbl">ملفي</small></button>
</div>
</div>
</body></html>
