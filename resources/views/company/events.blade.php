<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — الفعاليات</title>
@vite(['resources/css/main.css', 'resources/css/company.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">كورباكت</div><div class="en">COMPANY</div></div>
  <div class="co-info"><div class="lbl">الشركة</div><div class="nm">{{ $company->name }}</div><div class="sb">الشركة · {{ auth('company')->user()->hr_name }}</div></div>
  <nav>
    <div class="ni" onclick="window.location='/company/dash'"><span>📊</span><span class="nl">لوحة التحكم</span></div>
    <div class="ni" onclick="window.location='/company/communities'"><span>🏘️</span><span class="nl">المجتمعات</span></div>
    <div class="ni on" onclick="window.location='/company/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni" onclick="window.location='/company/wallet'"><span>💰</span><span class="nl">المحفظة</span></div>
    <div class="ni" onclick="window.location='/company/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni" onclick="window.location='/company/reports'"><span>📈</span><span class="nl">التقارير</span></div>
    <div class="ni" onclick="window.location='/company/notifications'" style="position:relative;"><span>🔔</span><span class="nl">الإشعارات</span>@if($unreadNotifications > 0)<span class="nl" style="background:#E03050;color:#fff;font-size:10px;padding:1px 7px;border-radius:20px;margin-right:auto;">{{ $unreadNotifications }}</span>@endif</div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('company.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">

<div class="sc on" id="evts">
  <div style="margin-bottom:24px;"><div style="font-size:22px;font-weight:900;">الفعاليات</div><div style="font-size:13px;color:#7A8BA8;">{{ $totalEvents }} فعاليات — {{ $activeEvents }} نشطة</div></div>
  <div style="margin-bottom:16px;">
    <a href="/company/events" class="fbtn {{ empty($filters['status']) ? 'on' : '' }}" style="text-decoration:none;">الكل</a>
    <a href="/company/events?status=open" class="fbtn {{ ($filters['status'] ?? '') === 'open' ? 'on' : '' }}" style="text-decoration:none;">مفتوحة</a>
    <a href="/company/events?status=waiting_club" class="fbtn {{ ($filters['status'] ?? '') === 'waiting_club' ? 'on' : '' }}" style="text-decoration:none;">انتظار النادي</a>
    <a href="/company/events?status=confirmed" class="fbtn {{ ($filters['status'] ?? '') === 'confirmed' ? 'on' : '' }}" style="text-decoration:none;">مؤكدة</a>
    <a href="/company/events?status=completed" class="fbtn {{ ($filters['status'] ?? '') === 'completed' ? 'on' : '' }}" style="text-decoration:none;">منتهية</a>
  </div>
  <div style="background:#fff;border:1px solid #E2E8F4;border-radius:16px;overflow:auto;">
    <table>
      <thead><tr><th>المجتمع</th><th>النادي</th><th>التاريخ</th><th>اللاعبون</th><th>المنشئ</th><th>الحالة</th></tr></thead>
      <tbody>
        @forelse($events as $event)
        @php
          $fillPercent = $event->capacity > 0 ? round(($event->participants_count / $event->capacity) * 100) : 0;
          $statusBadge = match($event->status) {
            'open' => ['background:#3B5BDB18;color:#3B5BDB;', 'مفتوحة'],
            'waiting_club' => ['background:#D4820A18;color:#D4820A;', 'انتظار النادي'],
            'confirmed' => ['background:#0CA67818;color:#0CA678;', 'مؤكدة'],
            'completed' => ['background:#7A8BA818;color:#7A8BA8;', 'منتهية'],
            'cancelled' => ['background:#E0305018;color:#E03050;', 'ملغية'],
            default => ['background:#7A8BA818;color:#7A8BA8;', $event->status],
          };
        @endphp
        <tr>
          <td><span style="font-weight:600;">{{ $event->sport?->icon }} {{ $event->community?->name }}</span></td>
          <td style="color:#4A5C78;">{{ $event->club?->name ?? '—' }}</td>
          <td><div style="font-size:12px;">{{ $event->event_date?->translatedFormat('l j F') }}</div><div style="font-size:11px;color:#7A8BA8;">{{ $event->start_time }}</div></td>
          <td><div style="font-weight:700;{{ $event->participants_count >= $event->capacity ? 'color:#0CA678;' : '' }}">{{ $event->participants_count }}/{{ $event->capacity }}</div><div class="bar-w" style="width:50px;margin-top:4px;"><div class="bar-f" style="width:{{ $fillPercent }}%;background:#0CA678;"></div></div></td>
          <td style="font-size:12px;color:#7A8BA8;">{{ $event->creator?->name ?? '—' }}</td>
          <td><span class="badge" style="{{ $statusBadge[0] }}">{{ $statusBadge[1] }}</span></td>
        </tr>
        @empty
        <tr><td colspan="6" style="text-align:center;padding:24px;color:#7A8BA8;font-size:13px;">لا توجد فعاليات بعد</td></tr>
        @endforelse
      </tbody>
    </table>
  </div>
  @if($events->hasPages())
  <div style="margin-top:16px;display:flex;justify-content:center;">
    {{ $events->appends($filters)->links() }}
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
