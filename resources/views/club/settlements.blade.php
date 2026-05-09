<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — التسويات</title>
@vite(['resources/css/main.css', 'resources/css/club.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">كورباكت</div><div class="en">CLUB PORTAL</div></div>
  <div class="co-info"><div class="lbl">النادي</div><div class="nm">{{ $club->name }}</div><div class="sb">{{ $club->district }}، {{ $club->city }}</div></div>
  <nav>
    <div class="ni" onclick="window.location='/club/dash'"><span>📊</span><span class="nl"> الرئيسية</span></div>
    <div class="ni" onclick="window.location='/club/requests'"><span>📋</span><span class="nl"> طلبات الحجز</span></div>
    <div class="ni" onclick="window.location='/club/schedule'"><span>📅</span><span class="nl"> التقويم</span></div>
    <div class="ni" onclick="window.location='/club/courts'"><span>🏟️</span><span class="nl"> إدارة الملاعب</span></div>
    <div class="ni on" onclick="window.location='/club/settlements'"><span>💰</span><span class="nl"> التسويات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('club.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">

<!-- SETTLEMENTS -->
<div class="sc on" id="csettle">
  <div style="margin-bottom:24px;"><div style="font-size:22px;font-weight:900;">التسويات المالية</div><div style="font-size:13px;color:#8A7868;">الإيرادات القادمة من Corpact</div></div>
  <div class="stat-row">
    <div class="stat" style="border-top:3px solid #B8860A;"><div style="font-size:24px;margin-bottom:8px;">💰</div><div style="font-size:26px;font-weight:900;color:#B8860A;">{{ number_format($totals['total_net']) }} ر</div><div style="font-size:12px;font-weight:600;">إجمالي الإيرادات</div></div>
    <div class="stat" style="border-top:3px solid #1A7A4A;"><div style="font-size:24px;margin-bottom:8px;">✅</div><div style="font-size:26px;font-weight:900;color:#1A7A4A;">{{ number_format($totals['received']) }} ر</div><div style="font-size:12px;font-weight:600;">مستلم</div></div>
    <div class="stat" style="border-top:3px solid #1A5FAB;"><div style="font-size:24px;margin-bottom:8px;">⏳</div><div style="font-size:26px;font-weight:900;color:#1A5FAB;">{{ number_format($totals['pending'] + $totals['processing']) }} ر</div><div style="font-size:12px;font-weight:600;">في الطريق</div></div>
  </div>
  <div class="card">
    <table>
      <thead><tr><th>الشركة</th><th>الحجوزات</th><th>المبلغ</th><th>الحالة</th></tr></thead>
      <tbody>
        @forelse($settlements as $settlement)
        @php
          $statusBadge = match($settlement->status) {
            'paid' => ['bg' => '#1A7A4A18', 'color' => '#1A7A4A', 'label' => 'مستلم'],
            'pending' => ['bg' => '#B8860A18', 'color' => '#B8860A', 'label' => 'معلق'],
            'processing' => ['bg' => '#1A5FAB18', 'color' => '#1A5FAB', 'label' => 'قيد التحويل'],
            default => ['bg' => '#8A786818', 'color' => '#8A7868', 'label' => $settlement->status],
          };
        @endphp
        <tr>
          <td><div style="font-size:13px;font-weight:700;">{{ $settlement->company?->name }}</div><div style="font-size:11px;color:#8A7868;">{{ $settlement->period }}</div></td>
          <td style="font-weight:700;">{{ $settlement->events_count }} حجوزات</td>
          <td style="font-size:16px;font-weight:900;color:#1A7A4A;">{{ number_format($settlement->net_amount) }} ريال</td>
          <td><span class="badge" style="background:{{ $statusBadge['bg'] }};color:{{ $statusBadge['color'] }};">{{ $statusBadge['label'] }}</span></td>
        </tr>
        @empty
        <tr><td colspan="4" style="text-align:center;padding:30px;color:#8A7868;">لا توجد تسويات حالياً</td></tr>
        @endforelse
      </tbody>
    </table>
  </div>
  @if($settlements->hasPages())
  <div style="margin-top:20px;display:flex;justify-content:center;">
    {{ $settlements->links() }}
  </div>
  @endif
  <div style="background:#1A5FAB18;border:1px solid #1A5FAB33;border-radius:14px;padding:14px 18px;display:flex;gap:12px;">
    <div style="font-size:22px;">ℹ️</div>
    <div><div style="font-size:13px;font-weight:700;color:#1A5FAB;margin-bottom:4px;">كيف تعمل التسويات؟</div><div style="font-size:12px;color:#4A3828;line-height:1.6;">بعد خصم عمولة المنصة ({{ $club->commission_rate ?? 10 }}%)، يُحول الصافي لحسابك خلال 3 أيام عمل من تاريخ الفعالية.</div></div>
  </div>
</div>

</div>
<script>
function togMobile(){document.getElementById('sb').classList.toggle('open');document.getElementById('sbBackdrop').classList.toggle('open');}
function closeMobile(){document.getElementById('sb').classList.remove('open');document.getElementById('sbBackdrop').classList.remove('open');}
function togSB(){
  var s=document.getElementById('sb');s.classList.toggle('small');
  s.querySelector('.tog').textContent=s.classList.contains('small')?'←':'→';
  document.querySelectorAll('.nl').forEach(n=>n.style.display=s.classList.contains('small')?'none':'');
}
</script>
</body></html>
