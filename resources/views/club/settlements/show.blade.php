<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — تفاصيل التسوية</title>
@vite(['resources/css/main.css', 'resources/css/club.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">تيمات</div><div class="en">CLUB PORTAL</div></div>
  <div class="co-info"><div class="lbl">النادي</div><div class="nm">{{ auth('club')->user()->name }}</div></div>
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
<div class="sc on">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
    <a href="{{ route('club.settlements.index') }}" style="color:#8A7868;text-decoration:none;font-size:14px;">← التسويات</a>
    <span style="color:#C8D0E0;">/</span>
    <span style="font-weight:700;">تسوية #{{ $settlement->id }}</span>
  </div>

  @php
    $statusBadge = match($settlement->status) {
      'paid' => ['bg' => '#1A7A4A18', 'color' => '#1A7A4A', 'label' => 'مستلم'],
      'pending' => ['bg' => '#B8860A18', 'color' => '#B8860A', 'label' => 'معلق'],
      'processing' => ['bg' => '#1A5FAB18', 'color' => '#1A5FAB', 'label' => 'قيد التحويل'],
      default => ['bg' => '#8A786818', 'color' => '#8A7868', 'label' => $settlement->status],
    };
  @endphp

  <div style="background:#fff;border:1px solid #E2E8F4;border-radius:16px;padding:32px;max-width:600px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <div style="font-size:18px;font-weight:700;">تفاصيل التسوية</div>
      <span style="background:{{ $statusBadge['bg'] }};color:{{ $statusBadge['color'] }};font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;">{{ $statusBadge['label'] }}</span>
    </div>

    <div style="display:grid;gap:16px;">
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #E2E8F4;">
        <span style="font-size:13px;color:#7A8BA8;">رقم التسوية</span>
        <span style="font-size:13px;font-weight:600;">#{{ $settlement->id }}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #E2E8F4;">
        <span style="font-size:13px;color:#7A8BA8;">المبلغ الإجمالي</span>
        <span style="font-size:13px;font-weight:600;">{{ number_format($settlement->gross_amount ?? $settlement->amount ?? 0) }} ر</span>
      </div>
      @if($settlement->commission_amount ?? false)
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #E2E8F4;">
        <span style="font-size:13px;color:#7A8BA8;">العمولة</span>
        <span style="font-size:13px;font-weight:600;color:#C8410A;">-{{ number_format($settlement->commission_amount) }} ر</span>
      </div>
      @endif
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #E2E8F4;">
        <span style="font-size:13px;color:#7A8BA8;">صافي المبلغ</span>
        <span style="font-size:16px;font-weight:900;color:#1A7A4A;">{{ number_format($settlement->net_amount ?? $settlement->amount ?? 0) }} ر</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #E2E8F4;">
        <span style="font-size:13px;color:#7A8BA8;">تاريخ الإنشاء</span>
        <span style="font-size:13px;font-weight:600;">{{ $settlement->created_at?->format('j F Y') ?? '-' }}</span>
      </div>
      @if($settlement->paid_at ?? false)
      <div style="display:flex;justify-content:space-between;padding:12px 0;">
        <span style="font-size:13px;color:#7A8BA8;">تاريخ الدفع</span>
        <span style="font-size:13px;font-weight:600;">{{ $settlement->paid_at->format('j F Y') }}</span>
      </div>
      @endif
    </div>

    <div style="margin-top:24px;">
      <a href="{{ route('club.settlements.index') }}" style="display:block;text-align:center;padding:12px;background:#E2E8F4;border-radius:10px;color:#4A5C78;font-size:14px;font-weight:700;text-decoration:none;">العودة للتسويات</a>
    </div>
  </div>
</div>
</div>

<script>
function togMobile(){document.getElementById('sb').classList.toggle('open');document.getElementById('sbBackdrop').classList.toggle('open');}
function closeMobile(){document.getElementById('sb').classList.remove('open');document.getElementById('sbBackdrop').classList.remove('open');}
function togSB(){var s=document.getElementById('sb');s.classList.toggle('small');s.querySelector('.tog').textContent=s.classList.contains('small')?'←':'→';document.querySelectorAll('.nl,.nb,.co-info,.logo .en').forEach(n=>n.style.display=s.classList.contains('small')?'none':'');}
</script>
</body></html>
