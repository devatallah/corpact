<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — الموظفون</title>
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
    <div class="ni on" onclick="window.location='/admin/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
    <div class="ni" onclick="window.location='/admin/events'"><span>📅</span><span class="nl">الفعاليات</span></div>
    <div class="ni" onclick="window.location='/admin/revenue'"><span>💰</span><span class="nl">الإيرادات</span></div>
    <div class="ni" onclick="window.location='/admin/notifs'"><span>🔔</span><span class="nl">الإشعارات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('admin.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>

<div class="main">

<div class="sc on" id="employees">
  <div class="page-title">الموظفون</div>
  <div class="page-sub">{{ number_format($totalEmployees) }} موظف مسجّل على المنصة</div>
  <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
    <input placeholder="🔍  ابحث باسم الموظف أو الشركة..." style="flex:1;min-width:200px;padding:10px 14px;background:#161B27;border:1px solid #232A3E;border-radius:10px;font-size:13px;color:#E8EAF0;outline:none;direction:rtl;">
    <select style="padding:10px 14px;background:#161B27;border:1px solid #232A3E;border-radius:10px;font-size:13px;color:#E8EAF0;outline:none;direction:rtl;">
      <option>كل الشركات</option>
      @foreach($companies as $company)
      <option value="{{ $company->id }}">{{ $company->name }}</option>
      @endforeach
    </select>
  </div>
  <div class="card" style="padding:0;overflow:hidden;">
    <table>
      <thead><tr><th>الموظف</th><th>الشركة</th><th>المجتمعات</th><th>الفعاليات</th><th>تاريخ التسجيل</th><th>الحالة</th></tr></thead>
      <tbody>
        @forelse($employees as $employee)
        <tr><td><div style="font-weight:700;color:#fff;">{{ $employee->name ?? '-' }}</div><div style="font-size:10px;color:#6B7A99;">{{ $employee->email ?? '-' }}</div></td><td style="color:#C8D0E0;">{{ $employee->company?->name ?? '-' }}</td><td>{{ $employee->communities_count ?? $employee->communities()->count() }}</td><td style="color:{{ ($employee->events_count ?? $employee->events()->count()) > 0 ? '#009E82' : '#6B7A99' }};font-weight:700;">{{ $employee->events_count ?? $employee->events()->count() }}</td><td style="font-size:12px;color:#6B7A99;">{{ $employee->created_at->format('j F') }}</td><td>@if($employee->status === 'active')<span class="badge b-active">● نشط</span>@else<span class="badge b-rejected">● غير نشط</span>@endif</td></tr>
        @empty
        <tr><td colspan="6" style="text-align:center;color:#6B7A99;padding:20px;">لا يوجد موظفون</td></tr>
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
