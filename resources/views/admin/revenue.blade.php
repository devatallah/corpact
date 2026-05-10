<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — الإيرادات</title>
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
    <div class="ni" onclick="window.location='/admin/clubs'"><span>🏟️</span><span class="nl">الأندية</span></div>
    <div class="ni" onclick="window.location='/admin/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni" onclick="window.location='/admin/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni on" onclick="window.location='/admin/revenue'"><span>💰</span><span class="nl">الإيرادات</span></div>
    <div class="ni" onclick="window.location='/admin/notifs'"><span>🔔</span><span class="nl">الإشعارات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('admin.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>

<div class="main">

<div class="sc on" id="revenue">
  <div class="page-title">الإيرادات</div>
  <div class="page-sub">إيرادات المنصة — عمولة على كل حجز</div>
  <div class="stat-row">
    <div class="stat" style="border-top:3px solid #E03050;"><div class="ico">💰</div><div class="val" style="color:#E03050;">{{ number_format($monthlyRevenue) }}</div><div class="lbl">إيرادات {{ now()->translatedFormat('F') }} (ريال)</div></div>
    <div class="stat" style="border-top:3px solid #009E82;"><div class="ico">✅</div><div class="val" style="color:#009E82;">{{ number_format($collected) }}</div><div class="lbl">مُحصَّل</div></div>
    <div class="stat" style="border-top:3px solid #D4820A;"><div class="ico">⏳</div><div class="val" style="color:#D4820A;">{{ number_format($pending) }}</div><div class="lbl">في انتظار التحصيل</div></div>
    <div class="stat" style="border-top:3px solid #5B7EFF;"><div class="ico">📈</div><div class="val" style="color:#5B7EFF;">{{ $revenueGrowth >= 0 ? '+' : '' }}{{ $revenueGrowth }}%</div><div class="lbl">نمو عن الشهر السابق</div></div>
  </div>
  <div class="card" style="padding:0;overflow:hidden;">
    <div style="padding:16px 20px;border-bottom:1px solid #232A3E;font-size:14px;font-weight:700;color:#fff;">تفصيل الإيرادات حسب الشركة</div>
    <table>
      <thead><tr><th>الشركة</th><th>عدد الفعاليات</th><th>إجمالي الحجوزات</th><th>عمولة المنصة</th><th>الحالة</th></tr></thead>
      <tbody>
        @forelse($perCompanyBreakdown as $row)
        <tr><td style="font-weight:700;color:#fff;">{{ $row->company_name }}</td><td>{{ $row->events_count }}</td><td style="color:#D4820A;font-weight:700;">{{ number_format($row->total_gross) }} ريال</td><td style="color:#E03050;font-weight:700;">{{ number_format($row->total_commission) }} ريال</td><td>@if($row->status === 'paid')<span class="badge b-active">مُحصَّل</span>@else<span class="badge b-pending">معلق</span>@endif</td></tr>
        @empty
        <tr><td colspan="5" style="text-align:center;color:#6B7A99;padding:20px;">لا توجد بيانات إيرادات</td></tr>
        @endforelse
      </tbody>
    </table>
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
