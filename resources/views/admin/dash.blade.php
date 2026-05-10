<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — لوحة التحكم</title>
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
    <div class="ni on" onclick="window.location='/admin/dash'"><span>📊</span><span class="nl">لوحة التحكم</span></div>
    <div class="ni" onclick="window.location='/admin/companies'"><span>🏢</span><span class="nl">الشركات</span>@if($companyStats['pending'] + $companyStats['review'] > 0)<span class="nb">{{ $companyStats['pending'] + $companyStats['review'] }}</span>@endif</div>
    <div class="ni" onclick="window.location='/admin/clubs'"><span>🏟️</span><span class="nl">الأندية</span>@if($clubStats['pending'] > 0)<span class="nb">{{ $clubStats['pending'] }}</span>@endif</div>
    <div class="ni" onclick="window.location='/admin/employees'"><span>👥</span><span class="nl">الموظفون</span></div>
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

<div class="sc on" id="dash">
  <div class="page-title">لوحة التحكم</div>
  <div class="page-sub">نظرة عامة على المنصة — {{ now()->translatedFormat('F Y') }}</div>

  <div class="stat-row">
    <div class="stat" style="border-top:3px solid #009E82;">
      <div class="ico">🏢</div><div class="val" style="color:#009E82;">{{ $companyStats['active'] }}</div>
      <div class="lbl">شركة مفعّلة</div>
      <div class="chg" style="color:#009E82;">+{{ $companiesThisMonth }} هذا الشهر</div>
    </div>
    <div class="stat" style="border-top:3px solid #5B7EFF;">
      <div class="ico">🏟️</div><div class="val" style="color:#5B7EFF;">{{ $clubStats['active'] }}</div>
      <div class="lbl">نادٍ مفعّل</div>
      <div class="chg" style="color:#5B7EFF;">+{{ $clubsThisMonth }} هذا الشهر</div>
    </div>
    <div class="stat" style="border-top:3px solid #D4820A;">
      <div class="ico">👥</div><div class="val" style="color:#D4820A;">{{ number_format($totalEmployees) }}</div>
      <div class="lbl">موظف مسجّل</div>
      <div class="chg" style="color:#D4820A;">+{{ $employeesThisMonth }} هذا الشهر</div>
    </div>
    <div class="stat" style="border-top:3px solid #E03050;">
      <div class="ico">💰</div><div class="val" style="color:#E03050;">{{ number_format($monthlyRevenue) }}</div>
      <div class="lbl">إيرادات الشهر (ريال)</div>
      <div class="chg" style="color:#E03050;">{{ $revenueGrowth >= 0 ? '+' : '' }}{{ $revenueGrowth }}% عن الشهر السابق</div>
    </div>
    <div class="stat" style="border-top:3px solid #C8A600;">
      <div class="ico">⏳</div><div class="val" style="color:#C8A600;">{{ $pendingRequests }}</div>
      <div class="lbl">طلبات تحتاج مراجعة</div>
      <div class="chg" style="color:#C8A600;">{{ $pendingCompanies }} شركة · {{ $pendingClubs }} نادي</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:16px;margin-bottom:16px;">
    <div class="card">
      <div class="card-title">إيرادات آخر 6 أشهر (ريال)</div>
      <div class="rev-bar-wrap">
        @foreach($last6Months as $monthData)
        <div class="rev-bar" style="height:{{ $maxRevenue > 0 ? round(($monthData->total / $maxRevenue) * 100) : 0 }}%;@if($loop->last)background:linear-gradient(180deg,#E03050,#B8001A);@elseif($loop->iteration == $loop->count - 1)background:linear-gradient(180deg,#D4820A,#A05800);@endif"></div>
        @endforeach
      </div>
      <div class="rev-label">
        @foreach($last6Months as $monthData)
        <span>{{ $monthData->month }}</span>
        @endforeach
      </div>
    </div>
    <div class="card">
      <div class="card-title">آخر الطلبات</div>
      @forelse($recentRequests as $request)
      <div onclick="openPanel('{{ $request->type }}','{{ $request->name }}')" style="background:#0F1117;border:1px solid #232A3E;border-right:3px solid @if($request->status === 'pending')#D4820A @elseif($request->status === 'review')#5B7EFF @else #232A3E @endif;border-radius:10px;padding:10px 12px;cursor:pointer;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;"><span style="font-size:13px;font-weight:700;color:#fff;">{{ $request->name }}</span><span class="badge @if($request->status === 'pending')b-pending @elseif($request->status === 'review')b-review @else b-active @endif">@if($request->status === 'pending')⏳ معلق @elseif($request->status === 'review')🔍 قيد المراجعة @else ● نشط @endif</span></div>
        <div style="font-size:11px;color:#6B7A99;">{{ $request->type_label }} · {{ $request->created_at->diffForHumans() }}</div>
      </div>
      @empty
      <div style="padding:20px;text-align:center;color:#6B7A99;font-size:13px;">لا توجد طلبات معلقة</div>
      @endforelse
    </div>
  </div>

  <div class="card">
    <div class="card-title">أكثر الشركات نشاطاً</div>
    <table>
      <thead><tr><th>الشركة</th><th>الموظفون</th><th>الفعاليات</th><th>الإنفاق</th><th>الحالة</th></tr></thead>
      <tbody>
        @forelse($topCompanies as $company)
        <tr><td style="font-weight:700;color:#fff;">{{ $company->name }}</td><td>{{ $company->employees_count }}</td><td style="color:#009E82;font-weight:700;">{{ $company->events_count }}</td><td style="color:#D4820A;font-weight:700;">{{ number_format($company->settlements->first()?->total_spend ?? 0) }} ر</td><td><span class="badge b-active">● نشط</span></td></tr>
        @empty
        <tr><td colspan="5" style="text-align:center;color:#6B7A99;">لا توجد بيانات</td></tr>
        @endforelse
      </tbody>
    </table>
  </div>
</div>

</div><!-- main -->

<!-- Detail Panel Overlay -->
<div class="detail-overlay" id="overlay" onclick="closePanel(event)">
  <div class="detail-panel" onclick="event.stopPropagation()">
    <h3 id="panelTitle">تفاصيل <button class="close-btn" onclick="closePanel()">✕</button></h3>
    <div id="panelBody"></div>
    <div class="panel-actions" id="panelActions"></div>
  </div>
</div>

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

var panelData={
  company:{
    @foreach(\App\Models\Company::whereIn('status', ['pending', 'review', 'active'])->get() as $c)
    '{{ $c->name }}':[['اسم الشركة','{{ $c->name }}'],['القطاع','{{ $c->sector }}'],['عدد الموظفين','{{ $c->employee_count }}'],['الدومين','{{ $c->domain }}'],['المدينة','{{ $c->city }}'],['المسؤول','{{ $c->hr_name ?? "-" }}'],['البريد','{{ $c->email ?? "-" }}'],['الجوال','{{ $c->hr_phone ?? "-" }}'],@if($c->status === 'active')['تاريخ التفعيل','{{ $c->approved_at?->format("j F Y") }}'],['الحالة','نشط ✅']@else['تاريخ الطلب','{{ $c->created_at->diffForHumans() }}']@endif],
    @endforeach
  },
  club:{
    @foreach(\App\Models\Club::whereIn('status', ['pending', 'active'])->get() as $cl)
    '{{ $cl->name }}':[['اسم النادي','{{ $cl->name }}'],['المدينة','{{ $cl->city }}@if($cl->district) · {{ $cl->district }}@endif'],['ساعات العمل','{{ $cl->working_hours ?? "-" }}'],['البريد','{{ $cl->email ?? "-" }}'],['جوال التواصل','{{ $cl->contact_phone ?? "-" }}'],@if($cl->status === 'active')['تاريخ التفعيل','{{ $cl->approved_at?->format("j F Y") }}'],['الحالة','نشط ✅']@else['تاريخ الطلب','{{ $cl->created_at->diffForHumans() }}']@endif],
    @endforeach
  }
};

function openPanel(type,name){
  var data=(panelData[type]||{})[name]||[];
  var isPending=data.some(r=>r[0]==='تاريخ الطلب');
  currentPanelType=type; currentPanelName=name; currentPanelData=data; editMode=false;

  document.getElementById('panelTitle').childNodes[0].textContent=(type==='company'?'شركة: ':'نادي: ')+name+' ';
  renderPanelView(data, isPending);
  document.getElementById('overlay').classList.add('open');
}

var currentPanelType='', currentPanelName='', currentPanelData=[], editMode=false;

function renderPanelView(data, isPending){
  editMode=false;
  var isPend=isPending!==undefined ? isPending : data.some(r=>r[0]==='تاريخ الطلب');
  document.getElementById('panelBody').innerHTML=
    (isPend ? '<div style="display:flex;justify-content:flex-end;margin-bottom:12px;"><button onclick="switchToEdit()" style="background:#5B7EFF20;color:#5B7EFF;border:1px solid #5B7EFF44;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">✏️ تعديل البيانات</button></div>' : '')
    + data.map(r=>'<div class="detail-row"><span class="k">'+r[0]+'</span><span class="v">'+r[1]+'</span></div>').join('');

  document.getElementById('panelActions').innerHTML = isPend
    ? '<button class="pa-approve" onclick="doApprove()">قبول وإرسال رابط التفعيل ✓</button><button class="pa-reject" onclick="doReject()">رفض الطلب</button>'
    : '<button style="flex:1;padding:11px;border-radius:12px;border:none;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;background:#232A3E;color:#6B7A99;" onclick="closePanel()">إغلاق</button>';
}

function switchToEdit(){
  editMode=true;
  var data=currentPanelData;
  var readonlyKeys=['تاريخ الطلب','تاريخ التفعيل','الحالة','الرياضات'];
  var html='<div style="margin-bottom:12px;font-size:12px;color:#5B7EFF;background:#5B7EFF10;border:1px solid #5B7EFF33;border-radius:8px;padding:8px 12px;">✏️ وضع التعديل — عدّل البيانات ثم وافق أو ارفض</div>';
  data.forEach(function(r,i){
    var isReadonly=readonlyKeys.includes(r[0]);
    html+='<div style="margin-bottom:10px;">';
    html+='<label style="display:block;font-size:11px;color:#6B7A99;font-weight:600;margin-bottom:4px;">'+r[0]+'</label>';
    if(isReadonly){
      html+='<div style="padding:9px 12px;background:#0F1117;border:1px solid #232A3E;border-radius:8px;font-size:13px;color:#6B7A99;">'+r[1]+'</div>';
    } else {
      html+='<input data-idx="'+i+'" value="'+r[1]+'" style="width:100%;padding:9px 12px;background:#0F1117;border:1px solid #5B7EFF44;border-radius:8px;font-size:13px;color:#E8EAF0;outline:none;font-family:inherit;direction:rtl;" onfocus="this.style.borderColor=\'#5B7EFF\'" onblur="this.style.borderColor=\'#5B7EFF44\'">';
    }
    html+='</div>';
  });
  document.getElementById('panelBody').innerHTML=html;
  document.getElementById('panelActions').innerHTML=
    '<button class="pa-approve" onclick="saveAndApprove()">حفظ التعديلات والموافقة ✓</button>'
    +'<button style="flex:1;padding:11px;border-radius:12px;border:none;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;background:#E0305020;color:#E03050;border:1px solid #E0305044;" onclick="doReject()">رفض</button>'
    +'<button style="padding:11px 16px;border-radius:12px;border:none;font-size:13px;cursor:pointer;font-family:inherit;background:#232A3E;color:#6B7A99;" onclick="renderPanelView(currentPanelData)">إلغاء</button>';
}

function saveAndApprove(){
  document.querySelectorAll('#panelBody input[data-idx]').forEach(function(inp){
    currentPanelData[parseInt(inp.dataset.idx)][1]=inp.value;
  });
  doApprove();
}

function doApprove(){
  closePanel();
  showToast('✅ تمت الموافقة — تم إرسال رابط التفعيل على البريد الإلكتروني','#009E82');
}
function doReject(){
  closePanel();
  showToast('❌ تم رفض الطلب وإشعار مقدم الطلب','#E03050');
}
function showToast(msg,color){
  var t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:'+color+';color:#fff;padding:12px 24px;border-radius:14px;font-size:14px;font-weight:700;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.4);font-family:Tahoma,Arial,sans-serif;';
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(function(){t.style.opacity='0';t.style.transition='opacity .4s';setTimeout(function(){t.remove();},400);},3000);
}
function closePanel(e){
  if(!e||e.target===document.getElementById('overlay'))
    document.getElementById('overlay').classList.remove('open');
}
</script>
</body></html>
