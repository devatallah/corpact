<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — الإشعارات</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
@vite(['resources/css/admin.css'])
</head>
<body>

<!-- Mobile hamburger -->
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>

<!-- Sidebar -->
<div class="sidebar" id="sb">
  <div class="logo">
    <div class="ar">تيمات</div>
    <div class="en">TEAMAT</div>
    <div class="tag">ADMIN</div>
  </div>
  <div class="admin-info">
    <div class="admin-avatar">م</div>
    <div><div class="admin-name">مشرف النظام</div><div class="admin-role">Super Admin</div></div>
  </div>
  <nav>
    <div class="ni" onclick="window.location='/admin/dash'"><span>📊</span><span class="nl">لوحة التحكم</span></div>
    <div class="ni" onclick="window.location='/admin/companies'"><span>🏢</span><span class="nl">الشركات</span></div>
    <div class="ni" onclick="window.location='/admin/businesss'"><span>🏟️</span><span class="nl">مزودو الخدمة</span></div>
    <div class="ni" onclick="window.location='/admin/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni" onclick="window.location='/admin/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni" onclick="window.location='/admin/revenue'"><span>💰</span><span class="nl">الإيرادات</span></div>
    <div class="ni on" onclick="window.location='/admin/notifs'"><span>🔔</span><span class="nl">الإشعارات</span>@if($unreadCount > 0)<span class="nb">{{ $unreadCount }}</span>@endif</div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('admin.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>

<div class="main">

<div class="sc on" id="notifs">
  <div class="page-title">الإشعارات</div>
  <div class="page-sub">{{ $unreadCount }} إشعارات تحتاج تدخلاً</div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    @forelse($notifications as $notification)
    @php
      $isUnread = !$notification->isRead();
      $icon = match($notification->type) {
        'company_registration' => '🏢',
        'business_registration' => '🏟️',
        'event_created' => '📅',
        'settlement' => '💰',
        default => $isUnread ? '🔔' : '✅',
      };
    @endphp
    <div class="card" style="@if($isUnread)border-right:4px solid #D4820A;@endif display:flex;gap:14px;align-items:flex-start;@if(!$isUnread)opacity:.6;@endif">
      <div style="width:42px;height:42px;border-radius:12px;background:@if($isUnread)#D4820A20 @else #232A3E @endif;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">{{ $icon }}</div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;">{{ $notification->title }}</div>
        @if($notification->body)
        <div style="font-size:12px;color:#C8D0E0;line-height:1.5;">{{ $notification->body }}</div>
        @endif
        <div style="font-size:11px;color:#6B7A99;margin-top:4px;">{{ $notification->created_at->diffForHumans() }}</div>
      </div>
      @if($isUnread)
      <div style="width:8px;height:8px;border-radius:50%;background:#D4820A;flex-shrink:0;margin-top:6px;"></div>
      @endif
    </div>
    @empty
    <div class="card" style="display:flex;gap:14px;align-items:center;justify-content:center;padding:30px;">
      <div style="font-size:14px;color:#6B7A99;">لا توجد إشعارات</div>
    </div>
    @endforelse
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
</script>
</body></html>
