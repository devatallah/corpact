<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — الإشعارات</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
@vite(['resources/css/main.css', 'resources/css/company.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">تيمات</div><div class="en">COMPANY</div></div>
  <div class="co-info"><div class="lbl">الشركة</div><div class="nm">{{ $company->name }}</div><div class="sb">الشركة · {{ auth('company')->user()->hr_name }}</div></div>
  <nav>
    <div class="ni" onclick="window.location='/company/dash'"><span>📊</span><span class="nl">لوحة التحكم</span></div>
    <div class="ni" onclick="window.location='/company/communities'"><span>🏘️</span><span class="nl">المجتمعات</span></div>
    <div class="ni" onclick="window.location='/company/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni" onclick="window.location='/company/wallet'"><span>💰</span><span class="nl">المحفظة</span></div>
    <div class="ni" onclick="window.location='/company/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni" onclick="window.location='/company/reports'"><span>📈</span><span class="nl">التقارير</span></div>
    <div class="ni on" onclick="window.location='/company/notifications'" style="position:relative;"><span>🔔</span><span class="nl">الإشعارات</span>@if($unreadCount > 0)<span class="nl" style="background:#E03050;color:#fff;font-size:10px;padding:1px 7px;border-radius:20px;margin-right:auto;">{{ $unreadCount }}</span>@endif</div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('company.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">

<div class="sc on" id="notif">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <div><div style="font-size:22px;font-weight:900;">الإشعارات</div><div style="font-size:13px;color:#7A8BA8;">{{ $unreadCount }} غير مقروءة</div></div>
    @if($unreadCount > 0)
    <form method="POST" action="/company/notifications/mark-all-read">
      @csrf
      <button type="submit" style="background:#EEF2FF;color:#3B5BDB;border:none;border-radius:10px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">تحديد الكل</button>
    </form>
    @endif
  </div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    @forelse($notifications as $notification)
    @if(is_null($notification->read_at))
    <div style="background:#fff;border:1px solid #E0305044;border-right:4px solid #E03050;border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:14px;">
      <div style="width:40px;height:40px;border-radius:12px;background:#E0305018;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
        @if($notification->type === 'warning')⚠️@elseif($notification->type === 'success')✅@elseif($notification->type === 'error')🔴@else📢@endif
      </div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:700;line-height:1.5;">{{ $notification->title }}</div>
        @if($notification->body)<div style="font-size:12px;color:#4A5C78;line-height:1.4;margin-top:2px;">{{ $notification->body }}</div>@endif
        <div style="font-size:11px;color:#7A8BA8;margin-top:4px;">{{ $notification->created_at->diffForHumans() }}</div>
      </div>
      <div style="width:8px;height:8px;border-radius:50%;background:#E03050;flex-shrink:0;"></div>
    </div>
    @else
    <div style="background:#fff;border:1px solid #E2E8F4;border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:14px;">
      <div style="width:40px;height:40px;border-radius:12px;background:#F0F2F8;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
        @if($notification->type === 'warning')⚠️@elseif($notification->type === 'success')✅@elseif($notification->type === 'error')🔴@else📢@endif
      </div>
      <div>
        <div style="font-size:13px;color:#0F1923;line-height:1.5;">{{ $notification->title }}</div>
        @if($notification->body)<div style="font-size:12px;color:#7A8BA8;line-height:1.4;margin-top:2px;">{{ $notification->body }}</div>@endif
        <div style="font-size:11px;color:#7A8BA8;margin-top:4px;">{{ $notification->created_at->diffForHumans() }}</div>
      </div>
    </div>
    @endif
    @empty
    <div style="text-align:center;padding:32px;color:#7A8BA8;font-size:13px;">لا توجد إشعارات</div>
    @endforelse
  </div>
  @if($notifications->hasPages())
  <div style="margin-top:16px;display:flex;justify-content:center;">
    {{ $notifications->links() }}
  </div>
  @endif
</div>

</div><!-- main -->
<script>
function togMobile(){document.getElementById('sb').classList.toggle('open');document.getElementById('sbBackdrop').classList.toggle('open');}
function closeMobile(){document.getElementById('sb').classList.remove('open');document.getElementById('sbBackdrop').classList.remove('open');}
function togSB(){
  var s=document.getElementById('sb');
  s.classList.toggle('small');
  s.querySelector('.tog').textContent=s.classList.contains('small')?'←':'→';
  document.querySelectorAll('.nl').forEach(n=>n.style.display=s.classList.contains('small')?'none':'');
}
</script>
</body></html>
