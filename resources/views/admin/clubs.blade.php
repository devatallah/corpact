<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — إدارة الأندية</title>
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
    <div class="ni on" onclick="window.location='/admin/businesss'"><span>🏟️</span><span class="nl">الأندية</span>@if($stats['pending'] > 0)<span class="nb">{{ $stats['pending'] }}</span>@endif</div>
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

<div class="sc on" id="businesss">
  <div class="page-title">إدارة الأندية</div>
  <div class="page-sub">{{ $stats['active'] }} أندية مفعّلة · {{ $stats['pending'] }} طلبات معلقة</div>
  <div style="margin-bottom:16px;">
    <button class="fbtn on" onclick="filt(this,'all','.cl-row')">الكل</button>
    <button class="fbtn" onclick="filt(this,'معلق','.cl-row')">معلق</button>
    <button class="fbtn" onclick="filt(this,'نشط','.cl-row')">نشط</button>
    <button class="fbtn" onclick="filt(this,'مرفوض','.cl-row')">مرفوض</button>
  </div>
  <div class="card" style="padding:0;overflow:hidden;">
    <table>
      <thead><tr><th>النادي</th><th>المدينة</th><th>الرياضات</th><th>الملاعب</th><th>مسؤول النادي</th><th>الحالة</th><th>إجراء</th></tr></thead>
      <tbody>
        @forelse($businesss as $business)
        <tr class="cl-row" data-s="@if($business->status === 'pending')معلق @elseif($business->status === 'active')نشط @elseif($business->status === 'rejected')مرفوض @else معلق @endif">
          <td><div style="font-weight:700;color:#fff;">{{ $business->name }}</div><div style="font-size:10px;color:#6B7A99;">@if($business->status === 'active'){{ $business->district }}@else{{ $business->created_at->diffForHumans() }}@endif</div></td>
          <td style="color:#C8D0E0;">{{ $business->city }}</td>
          <td><span style="font-size:12px;">@if($business->sports && $business->sports->count()){{ $business->sports->map(fn($s) => ($s->icon ?? '') . ' ' . $s->name)->implode(' · ') }}@else -@endif</span></td><td>{{ $business->venues_count ?? $business->venues()->count() }}</td>
          <td><div style="font-size:12px;">{{ $business->email ?? '-' }}</div><div style="font-size:10px;color:#6B7A99;">{{ $business->contact_phone ?? '-' }}</div></td>
          <td>
            @if($business->status === 'pending')
            <span class="badge b-pending">⏳ معلق</span>
            @elseif($business->status === 'active')
            <span class="badge b-active">● نشط</span>
            @elseif($business->status === 'rejected')
            <span class="badge b-rejected">❌ مرفوض</span>
            @elseif($business->status === 'suspended')
            <span class="badge b-rejected">⛔ معلّق</span>
            @endif
          </td>
          <td>
            @if($business->status === 'pending')
            <div style="display:flex;gap:6px;">
              <form method="POST" action="{{ route('admin.businesss.approve', $business) }}" style="margin:0;">@csrf<button type="submit" class="act-btn btn-approve">قبول</button></form>
              <form method="POST" action="{{ route('admin.businesss.reject', $business) }}" style="margin:0;">@csrf<button type="submit" class="act-btn btn-reject">رفض</button></form>
              <button class="act-btn btn-view" onclick="openPanel('business','{{ $business->name }}')">تفاصيل</button>
            </div>
            @else
            <button class="act-btn btn-view" onclick="openPanel('business','{{ $business->name }}')">تفاصيل</button>
            @endif
          </td>
        </tr>
        @empty
        <tr><td colspan="7" style="text-align:center;color:#6B7A99;padding:20px;">لا توجد أندية</td></tr>
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
function filt(btn,f,cls){
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  document.querySelectorAll(cls).forEach(r=>r.style.display=(f==='all'||r.dataset.s===f)?'':'none');
}

var panelData={
  business:{
    @foreach($businesss as $cl)
    '{{ $cl->name }}':{id:{{ $cl->id }},rows:[['اسم النادي','{{ $cl->name }}'],['المدينة','{{ $cl->city }}@if($cl->district) · {{ $cl->district }}@endif'],['الرياضات','{{ $cl->sports?->map(fn($s) => ($s->icon ?? "") . " " . $s->name)->implode(" · ") ?? "-" }}'],['عدد الملاعب','{{ $cl->venues_count ?? $cl->venues()->count() }}'],['ساعات العمل','{{ $cl->working_hours ?? "-" }}'],['البريد','{{ $cl->email ?? "-" }}'],['جوال التواصل','{{ $cl->contact_phone ?? "-" }}'],@if($cl->status === 'active')['تاريخ التفعيل','{{ $cl->approved_at?->format("j F Y") }}'],['الحالة','نشط ✅']@else['تاريخ الطلب','{{ $cl->created_at->diffForHumans() }}']@endif]},
    @endforeach
  }
};

function openPanel(type,name){
  var entry=(panelData[type]||{})[name]||{id:0,rows:[]};
  var data=entry.rows;
  var isPending=data.some(r=>r[0]==='تاريخ الطلب');
  currentPanelType=type; currentPanelName=name; currentPanelData=data; currentPanelId=entry.id; editMode=false;

  document.getElementById('panelTitle').childNodes[0].textContent=(type==='company'?'شركة: ':'نادي: ')+name+' ';
  renderPanelView(data, isPending);
  document.getElementById('overlay').classList.add('open');
}

var currentPanelType='', currentPanelName='', currentPanelData=[], currentPanelId=0, editMode=false;

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
  submitAction('/admin/businesss/'+currentPanelId+'/approve');
}
function doReject(){
  submitAction('/admin/businesss/'+currentPanelId+'/reject');
}
function submitAction(url){
  var form=document.createElement('form');
  form.method='POST';form.action=url;form.style.display='none';
  var csrf=document.createElement('input');csrf.type='hidden';csrf.name='_token';csrf.value='{{ csrf_token() }}';
  form.appendChild(csrf);document.body.appendChild(form);form.submit();
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
