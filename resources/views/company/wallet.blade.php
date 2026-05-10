<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — المحفظة</title>
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
    <div class="ni on" onclick="window.location='/company/wallet'"><span>💰</span><span class="nl">المحفظة</span></div>
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

<div class="sc on" id="wallet">
  <div style="margin-bottom:24px;"><div style="font-size:22px;font-weight:900;">المحفظة والدعم</div><div style="font-size:13px;color:#7A8BA8;">إدارة الميزانية وشحن رصيد المجتمعات</div></div>
  <div style="background:linear-gradient(135deg,#1A2035,#252D45);border-radius:20px;padding:24px 28px;margin-bottom:20px;color:#fff;">
    <div style="font-size:12px;color:rgba(255,255,255,.5);letter-spacing:1px;margin-bottom:4px;">رصيد المحفظة المتاح</div>
    <div style="font-size:40px;font-weight:900;" id="wBal">{{ number_format($wallet?->balance ?? 0) }} <span style="font-size:18px;">ريال</span></div>
    <div style="margin-top:16px;text-align:left;"><button onclick="tog('cf')" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">+ شحن رصيد</button></div>
  </div>
  <div id="cf" style="display:none;background:#fff;border:1px solid #3B5BDB44;border-radius:16px;padding:20px;margin-bottom:16px;">
    <div style="font-size:14px;font-weight:700;margin-bottom:12px;">شحن رصيد جديد</div>
    <form method="POST" action="/company/wallet/charge" style="display:flex;gap:10px;">
      @csrf
      <input type="number" name="amount" id="ca" placeholder="المبلغ..." style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid #E2E8F4;font-size:14px;background:#F0F2F8;outline:none;direction:rtl;">
      <button type="submit" style="background:#3B5BDB;color:#fff;border:none;border-radius:10px;padding:10px 22px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">شحن</button>
    </form>
    @if(session('success'))
    <div style="margin-top:10px;padding:10px;background:#0CA67818;border:1px solid #0CA67833;border-radius:10px;font-size:13px;color:#0CA678;font-weight:600;">{{ session('success') }}</div>
    @endif
    @if($errors->any())
    <div style="margin-top:10px;padding:10px;background:#E0305018;border:1px solid #E0305033;border-radius:10px;font-size:13px;color:#E03050;font-weight:600;">{{ $errors->first() }}</div>
    @endif
  </div>
  <div style="background:#fff;border:2px solid #3B5BDB33;border-radius:16px;padding:22px;margin-bottom:16px;">
    <div style="font-size:15px;font-weight:800;margin-bottom:4px;">شحن رصيد مجتمع</div>
    <div style="font-size:12px;color:#7A8BA8;margin-bottom:16px;">اختر المجتمع وحدد المبلغ — يُخصم من المحفظة ويُضاف للمجتمع</div>
    <form method="POST" action="/company/wallet/distribute" id="distForm">
      @csrf
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;" id="dbs">
        @forelse($communities as $index => $community)
        @php
          $colors = ['#0CA678', '#D4820A', '#5B3FCC', '#3B5BDB', '#E03050', '#8B5CF6'];
          $color = $community->color ?? $colors[$index % count($colors)];
        @endphp
        <div onclick="pickD(this,'{{ $community->id }}','{{ $color }}')" class="db-btn" style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;cursor:pointer;border:2px solid {{ $index === 0 ? $color : '#E2E8F4' }};background:{{ $index === 0 ? $color.'12' : '#F0F2F8' }};"><span>{{ $community->sport?->icon }}</span><span style="font-size:13px;font-weight:700;color:{{ $index === 0 ? $color : '#4A5C78' }};">{{ $community->name }}</span></div>
        @empty
        <div style="font-size:13px;color:#7A8BA8;">لا توجد مجتمعات</div>
        @endforelse
      </div>
      <input type="hidden" name="community_id" id="distCommunityId" value="{{ $communities->first()?->id }}">
      <div style="display:flex;gap:10px;align-items:center;">
        <input type="number" name="amount" id="da" placeholder="المبلغ..." style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid #E2E8F4;font-size:15px;font-weight:700;background:#F0F2F8;outline:none;direction:rtl;">
        <button type="submit" style="background:#3B5BDB;color:#fff;border:none;border-radius:10px;padding:11px 26px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;">شحن ←</button>
      </div>
    </form>
    <div id="dm" style="display:none;margin-top:10px;"></div>
  </div>
  @if($transactions->isNotEmpty())
  <div style="background:#fff;border:1px solid #E2E8F4;border-radius:16px;padding:22px;">
    <div style="font-size:15px;font-weight:800;margin-bottom:14px;">آخر العمليات</div>
    @foreach($transactions as $transaction)
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;{{ !$loop->last ? 'border-bottom:1px solid #E2E8F4;' : '' }}">
      <div>
        <div style="font-size:13px;font-weight:600;">{{ $transaction->type === 'credit' ? 'شحن رصيد' : 'صرف لمجتمع' }}{{ $transaction->community ? ' — '.$transaction->community->name : '' }}</div>
        <div style="font-size:11px;color:#7A8BA8;">{{ $transaction->created_at->diffForHumans() }}</div>
      </div>
      <div style="font-size:14px;font-weight:800;color:{{ $transaction->type === 'credit' ? '#0CA678' : '#E03050' }};">{{ $transaction->type === 'credit' ? '+' : '-' }}{{ number_format($transaction->amount) }} ر</div>
    </div>
    @endforeach
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
function tog(id){var el=document.getElementById(id);el.style.display=el.style.display==='none'?'block':'none';}
function pickD(el,id,color){
  document.getElementById('distCommunityId').value=id;
  document.querySelectorAll('.db-btn').forEach(d=>{d.style.borderColor='#E2E8F4';d.style.background='#F0F2F8';d.querySelector('span:last-child').style.color='#4A5C78';});
  el.style.borderColor=color;el.style.background=color+'12';el.querySelector('span:last-child').style.color=color;
}
</script>
</body></html>
