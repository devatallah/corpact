<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — الإشعارات</title>
@vite(['resources/css/main.css', 'resources/css/employee.css'])
</head>
<body>
<div class="phone">
<div class="topbar">
  <form method="POST" action="{{ route('employee.logout') }}" style="display:inline;margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="background:#fff;border:1px solid #E4E9F2;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;color:#4A5C78;font-family:inherit;">← خروج</button></form>
  <div><div class="logo-ar">كورباكت</div><div class="logo-en">CORPACT</div></div>
  <div style="margin-right:auto;font-size:10px;color:#7A8BA8;letter-spacing:1px;">EMPLOYEE</div>
</div>
<div class="content">

<div class="screen on" id="sNotif">
  <div style="padding:16px 0 20px;display:flex;justify-content:space-between;align-items:center;">
    <div><div style="font-size:20px;font-weight:800;">الإشعارات</div><div style="font-size:12px;color:#7A8BA8;">{{ $unreadCount }} غير مقروءة</div></div>
    @if($unreadCount > 0)
    <form action="{{ route('employee.notifications.readAll') }}" method="POST" style="display:inline;">
      @csrf
      <button type="submit" style="background:transparent;border:none;font-size:12px;color:#009E82;font-weight:700;cursor:pointer;font-family:inherit;">تحديد الكل</button>
    </form>
    @endif
  </div>
  @forelse($notifications as $notification)
  @php $isUnread = is_null($notification->read_at); @endphp
  <div class="card" style="{{ $isUnread ? 'border-color:#009E8244;border-right:3px solid #009E82;' : '' }}display:flex;gap:12px;">
    <div style="width:40px;height:40px;border-radius:12px;background:{{ $isUnread ? '#009E8218' : '#F4F6FA' }};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🔔</div>
    <div style="flex:1;">
      <div style="font-size:13px;{{ $isUnread ? 'font-weight:600;' : 'color:#0F1923;' }}line-height:1.5;">{{ $notification->title ?? $notification->body }}</div>
      @if($notification->body && $notification->title)
      <div style="font-size:11px;color:#7A8BA8;margin-top:2px;">{{ $notification->body }}</div>
      @endif
      <div style="font-size:11px;color:#7A8BA8;margin-top:4px;">{{ $notification->created_at->diffForHumans() }}</div>
    </div>
    @if($isUnread)
    <div style="display:flex;align-items:start;">
      <div style="width:8px;height:8px;border-radius:50%;background:#009E82;margin-top:6px;flex-shrink:0;"></div>
    </div>
    @endif
  </div>
  @empty
  <div style="text-align:center;padding:40px 20px;color:#7A8BA8;font-size:13px;">لا توجد إشعارات</div>
  @endforelse

  @if($notifications->hasPages())
  <div style="padding:16px 0;text-align:center;">
    {{ $notifications->links() }}
  </div>
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
