<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — إنشاء فعالية</title>
@vite(['resources/css/main.css', 'resources/css/employee.css'])
</head>
<body>
<div class="phone">
<div class="topbar">
  <form method="POST" action="{{ route('employee.logout') }}" style="display:inline;margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="background:#fff;border:1px solid #E4E9F2;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;color:#4A5C78;font-family:inherit;">← خروج</button></form>
  <div><div class="logo-ar">كورباكت</div><div class="logo-en">CORPACT</div></div>
  <div style="margin-right:auto;font-size:10px;color:#7A8BA8;letter-spacing:1px;">EMPLOYEE</div>
</div>
<div class="content">

<div class="screen on" id="sCreate">
  <div style="padding:16px 0 20px;"><div style="font-size:11px;color:#7A8BA8;">إنشاء فعالية جديدة</div><div style="font-size:20px;font-weight:800;">اختر التفاصيل</div></div>
  <div style="display:flex;gap:6px;margin-bottom:24px;">
    <div id="sb1" style="flex:1;height:4px;border-radius:4px;background:#009E82;"></div>
    <div id="sb2" style="flex:1;height:4px;border-radius:4px;background:#E4E9F2;"></div>
    <div id="sb3" style="flex:1;height:4px;border-radius:4px;background:#E4E9F2;"></div>
  </div>

  <form id="eventForm" action="{{ route('employee.events.store') }}" method="POST">
    @csrf
    <input type="hidden" name="community_id" id="inputCommunityId" value="">
    <input type="hidden" name="sport_id" id="inputSportId" value="">
    <input type="hidden" name="club_id" id="inputClubId" value="">
    <input type="hidden" name="court_pricing_id" id="inputCourtPricingId" value="">
    <input type="hidden" name="courts_count" id="inputCourtsCount" value="1">
    <input type="hidden" name="capacity" id="inputCapacity" value="4">
    <input type="hidden" name="company_subsidy" id="inputSubsidy" value="0">

    <div id="step1">
      <div style="font-size:14px;font-weight:700;margin-bottom:12px;">اختر المجتمع</div>
      @forelse($communities as $index => $community)
      <div onclick="pickC({{ $community->id }}, {{ $community->sport_id }}, '{{ $community->name }}', this)" class="card sel-c" style="display:flex;align-items:center;gap:12px;cursor:pointer;border:2px solid {{ $index === 0 ? '#009E82' : '#E4E9F2' }};margin-bottom:10px;">
        <div style="font-size:28px;">{{ $community->icon ?? $community->sport->icon ?? '🏅' }}</div><div style="flex:1;"><div style="font-size:14px;font-weight:700;">{{ $community->name }}</div><div style="font-size:11px;color:#7A8BA8;">{{ $community->members_count }} عضو</div></div>@if($index === 0)<div class="ck" style="color:#009E82;font-weight:700;">✓</div>@endif
      </div>
      @empty
      <div style="text-align:center;padding:24px;color:#7A8BA8;font-size:13px;">لم تنضم لأي مجتمع بعد. انضم لمجتمع أولاً.</div>
      @endforelse
      <button type="button" onclick="gostep(2)" style="width:100%;padding:16px;background:#009E82;color:#000;border:none;border-radius:16px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;margin-top:14px;">التالي</button>
    </div>

    <div id="step2" style="display:none;">
      <div style="font-size:14px;font-weight:700;margin-bottom:12px;">النادي والموعد</div>
      <div style="font-size:12px;color:#7A8BA8;margin-bottom:6px;">اختر النادي</div>
      <div style="position:relative;margin-bottom:16px;">
        <select id="clubSelect" onchange="onClubChange(this)" style="width:100%;padding:12px 14px;background:#fff;border:1px solid #E4E9F2;border-radius:12px;font-size:13px;appearance:none;cursor:pointer;outline:none;direction:rtl;font-family:inherit;">
          <option value="">اختر النادي...</option>
          @foreach($clubs as $club)
          @php
            $courtsData = $club->courts->map(function ($court) {
              return [
                'id' => $court->id,
                'name' => $court->name,
                'pricings' => $court->pricings->map(function ($p) {
                  return ['id' => $p->id, 'duration' => $p->duration_minutes, 'price' => $p->price];
                })->values(),
              ];
            })->values();
          @endphp
          <option value="{{ $club->id }}" data-courts='@json($courtsData)'>{{ $club->name }}</option>
          @endforeach
        </select>
        <div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#7A8BA8;pointer-events:none;">▼</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <div><div style="font-size:12px;color:#7A8BA8;margin-bottom:6px;">التاريخ</div><input type="date" name="date" id="inputDate" style="width:100%;background:#fff;border:1px solid #E4E9F2;border-radius:10px;padding:10px 12px;font-size:13px;font-family:inherit;"></div>
        <div><div style="font-size:12px;color:#7A8BA8;margin-bottom:6px;">الوقت</div><input type="time" name="time" id="inputTime" style="width:100%;background:#fff;border:1px solid #E4E9F2;border-radius:10px;padding:10px 12px;font-size:13px;font-family:inherit;"></div>
      </div>

      <!-- Duration -->
      <div style="margin-bottom:16px;">
        <div style="font-size:12px;color:#7A8BA8;font-weight:600;margin-bottom:8px;">مدة الحجز</div>
        <div id="durationOptions" style="display:flex;flex-direction:column;gap:8px;">
          <div style="padding:12px 14px;background:#fff;border:2px solid #E4E9F2;border-radius:12px;font-size:13px;color:#7A8BA8;text-align:center;">اختر النادي أولاً</div>
        </div>
      </div>

      <!-- Courts count -->
      <div style="margin-bottom:16px;">
        <div style="font-size:12px;color:#7A8BA8;font-weight:600;margin-bottom:8px;">عدد الملاعب</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button type="button" onclick="adjCourts(-1)" style="width:40px;height:40px;border-radius:10px;border:1px solid #E4E9F2;background:#fff;font-size:20px;cursor:pointer;font-family:inherit;">−</button>
          <input type="number" id="courtsCount" value="1" min="1" oninput="calcPrice()" style="flex:1;text-align:center;padding:10px;background:#fff;border:1px solid #009E82;border-radius:10px;font-size:18px;font-weight:800;outline:none;">
          <button type="button" onclick="adjCourts(1)" style="width:40px;height:40px;border-radius:10px;border:1px solid #E4E9F2;background:#fff;font-size:20px;cursor:pointer;font-family:inherit;">+</button>
        </div>
      </div>

      <!-- Players count -->
      <div style="margin-bottom:16px;">
        <div style="font-size:12px;color:#7A8BA8;font-weight:600;margin-bottom:8px;">عدد اللاعبين</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button type="button" onclick="adj(-1)" style="width:40px;height:40px;border-radius:10px;border:1px solid #E4E9F2;background:#fff;font-size:20px;cursor:pointer;font-family:inherit;">−</button>
          <input type="number" id="pc" value="4" min="2" oninput="calcPrice()" style="flex:1;text-align:center;padding:10px;background:#fff;border:1px solid #009E82;border-radius:10px;font-size:18px;font-weight:800;outline:none;">
          <button type="button" onclick="adj(1)" style="width:40px;height:40px;border-radius:10px;border:1px solid #E4E9F2;background:#fff;font-size:20px;cursor:pointer;font-family:inherit;">+</button>
        </div>
      </div>

      <!-- Live price summary -->
      <div id="priceSummary" style="background:#009E8210;border:1px solid #009E8233;border-radius:14px;padding:14px 16px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:12px;color:#7A8BA8;">إجمالي الحجز</span>
          <span style="font-size:13px;font-weight:700;color:#0F1923;" id="totalPrice">0 ريال</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:12px;color:#7A8BA8;">الحساب</span>
          <span style="font-size:11px;color:#7A8BA8;" id="priceCalc">—</span>
        </div>
        <div style="height:1px;background:#009E8222;margin:8px 0;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:#7A8BA8;">حصة كل لاعب</span>
          <span style="font-size:18px;font-weight:900;color:#009E82;" id="perPlayer">0 ريال</span>
        </div>
      </div>

      <div style="display:flex;gap:10px;">
        <button type="button" onclick="gostep(1)" style="flex:1;padding:16px;background:#E4E9F2;color:#7A8BA8;border:none;border-radius:16px;font-size:14px;cursor:pointer;font-family:inherit;">رجوع</button>
        <button type="button" onclick="gostep(3)" style="flex:2;padding:16px;background:#009E82;color:#000;border:none;border-radius:16px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;">التالي</button>
      </div>
    </div>

    <div id="step3" style="display:none;">
      <div style="font-size:14px;font-weight:700;margin-bottom:16px;">مراجعة الفعالية</div>
      <div class="card" style="border-color:#009E8233;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E4E9F2;"><span style="font-size:12px;color:#7A8BA8;">المجتمع</span><span style="font-size:13px;font-weight:700;" id="rC">—</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E4E9F2;"><span style="font-size:12px;color:#7A8BA8;">النادي</span><span style="font-size:13px;font-weight:700;" id="rClub">—</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E4E9F2;"><span style="font-size:12px;color:#7A8BA8;">التاريخ</span><span style="font-size:13px;font-weight:700;" id="rDate">—</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E4E9F2;"><span style="font-size:12px;color:#7A8BA8;">مدة الحجز</span><span style="font-size:13px;font-weight:700;" id="rDurVal">—</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E4E9F2;"><span style="font-size:12px;color:#7A8BA8;">عدد الملاعب</span><span style="font-size:13px;font-weight:700;" id="rCourts">—</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E4E9F2;"><span style="font-size:12px;color:#7A8BA8;">عدد اللاعبين</span><span style="font-size:13px;font-weight:700;" id="rN">—</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E4E9F2;"><span style="font-size:12px;color:#7A8BA8;">إجمالي الحجز</span><span style="font-size:13px;font-weight:700;" id="rPrice">—</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;"><span style="font-size:12px;color:#7A8BA8;">حصة كل لاعب</span><span style="font-size:15px;font-weight:900;color:#009E82;" id="rPerPlayer">—</span></div>
      </div>
      <div style="background:#009E8218;border:1px solid #009E8233;border-radius:12px;padding:10px 14px;font-size:12px;color:#009E82;margin-bottom:20px;">📢 سيُرسل طلب الحجز للنادي بعد اكتمال عدد اللاعبين</div>
      <div style="display:flex;gap:10px;">
        <button type="button" onclick="gostep(2)" style="flex:1;padding:16px;background:#E4E9F2;color:#7A8BA8;border:none;border-radius:16px;font-size:14px;cursor:pointer;font-family:inherit;">رجوع</button>
        <button type="submit" style="flex:2;padding:16px;background:linear-gradient(135deg,#009E82,#00A888);color:#000;border:none;border-radius:16px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 8px 24px rgba(0,158,130,.3);">نشر الفعالية 🚀</button>
      </div>
    </div>
  </form>
</div>

</div><!-- end content -->

<!-- Bottom Nav -->
<div class="bottom-nav">
  <button class="nb" onclick="window.location='{{ route('employee.home') }}'"><span class="ico">🏠</span><small class="lbl">الرئيسية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.community.index') }}'"><span class="ico">👥</span><small class="lbl">مجتمعاتي</small></button>
  <button class="nb on" onclick="window.location='{{ route('employee.events.create') }}'"><div class="nav-special">➕</div><small class="lbl">فعالية</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.explore.index') }}'"><span class="ico">🔍</span><small class="lbl">استكشف</small></button>
  <button class="nb" onclick="window.location='{{ route('employee.profile.index') }}'"><span class="ico">👤</span><small class="lbl">ملفي</small></button>
</div>
</div>

<script>
var selDur='', selPrice=0, selPricingId=0, selCommunityName='';

@if($communities->isNotEmpty())
  // Auto-select first community
  document.addEventListener('DOMContentLoaded', function(){
    var first = @json($communities->first());
    if(first){
      document.getElementById('inputCommunityId').value = first.id;
      document.getElementById('inputSportId').value = first.sport_id;
      selCommunityName = first.name;
    }
  });
@endif

function pickC(id, sportId, name, el){
  document.getElementById('inputCommunityId').value = id;
  document.getElementById('inputSportId').value = sportId;
  selCommunityName = name;
  document.querySelectorAll('.sel-c').forEach(c=>{c.style.borderColor='#E4E9F2';var ck=c.querySelector('.ck');if(ck)ck.remove();});
  el.style.borderColor='#009E82';
  var ckDiv=document.createElement('div');ckDiv.className='ck';ckDiv.style.color='#009E82';ckDiv.style.fontWeight='700';ckDiv.textContent='✓';el.appendChild(ckDiv);
  document.getElementById('rC').textContent=name;
}

function onClubChange(select){
  var opt = select.options[select.selectedIndex];
  document.getElementById('inputClubId').value = select.value;
  var courts = opt.dataset.courts ? JSON.parse(opt.dataset.courts) : [];
  var container = document.getElementById('durationOptions');
  container.innerHTML='';
  // Collect unique pricings
  var pricings = [];
  courts.forEach(function(c){
    c.pricings.forEach(function(p){
      if(!pricings.find(function(x){return x.id===p.id;})){
        pricings.push(p);
      }
    });
  });
  if(pricings.length===0){
    container.innerHTML='<div style="padding:12px 14px;background:#fff;border:2px solid #E4E9F2;border-radius:12px;font-size:13px;color:#7A8BA8;text-align:center;">لا توجد أسعار متاحة</div>';
    return;
  }
  pricings.forEach(function(p, i){
    var div=document.createElement('div');
    div.className='dur-opt';
    div.onclick=function(){pickDur(div, p.duration, p.price, p.id);};
    div.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:#fff;border:2px solid '+(i===0?'#009E82':'#E4E9F2')+';border-radius:12px;cursor:pointer;';
    div.innerHTML='<div style="display:flex;align-items:center;gap:8px;"><div class="dur-radio" style="width:18px;height:18px;border-radius:50%;'+(i===0?'background:#009E82;display:flex;align-items:center;justify-content:center;':'border:2px solid #E4E9F2;')+'">'+
      (i===0?'<div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>':'')+
      '</div><span style="font-size:14px;font-weight:700;">'+p.duration+' دقيقة</span></div>'+
      '<span style="font-size:13px;font-weight:700;color:'+(i===0?'#009E82':'#7A8BA8')+';">'+p.price.toLocaleString()+' ريال/ملعب</span>';
    container.appendChild(div);
    if(i===0){ pickDur(div, p.duration, p.price, p.id); }
  });
}

function pickDur(el,dur,price,pricingId){
  selDur=dur; selPrice=price; selPricingId=pricingId;
  document.getElementById('inputCourtPricingId').value = pricingId;
  document.querySelectorAll('.dur-opt').forEach(d=>{
    d.style.borderColor='#E4E9F2'; d.style.background='#fff';
    var r=d.querySelector('.dur-radio');
    if(r){r.style.background='transparent';r.style.border='2px solid #E4E9F2';r.innerHTML='';}
    d.querySelector('span:last-child').style.color='#7A8BA8';
  });
  el.style.borderColor='#009E82'; el.style.background='#009E8208';
  var r=el.querySelector('.dur-radio');
  if(r){r.style.background='#009E82';r.style.border='none';r.innerHTML='<div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>';}
  el.querySelector('span:last-child').style.color='#009E82';
  calcPrice();
}
function adjCourts(d){
  var el=document.getElementById('courtsCount');
  el.value=Math.max(1,parseInt(el.value||1)+d);
  calcPrice();
}
function calcPrice(){
  var courts=parseInt(document.getElementById('courtsCount').value)||1;
  var players=parseInt(document.getElementById('pc').value)||1;
  if(players<1) players=1;
  var total=selPrice*courts;
  var perPlayer=Math.ceil(total/players);
  document.getElementById('totalPrice').textContent=total.toLocaleString()+' ريال';
  document.getElementById('priceCalc').textContent=courts+' ملعب × '+selPrice.toLocaleString()+' ر';
  document.getElementById('perPlayer').textContent=perPlayer.toLocaleString()+' ريال';
  document.getElementById('inputCourtsCount').value=courts;
  document.getElementById('inputCapacity').value=players;
}
function gostep(n){
  ['step1','step2','step3'].forEach((id,i)=>document.getElementById(id).style.display=i+1===n?'block':'none');
  document.getElementById('sb2').style.background=n>=2?'#009E82':'#E4E9F2';
  document.getElementById('sb3').style.background=n>=3?'#009E82':'#E4E9F2';
  if(n===3){
    var courts=parseInt(document.getElementById('courtsCount').value)||1;
    var players=parseInt(document.getElementById('pc').value)||1;
    var total=selPrice*courts;
    var perPlayer=Math.ceil(total/players);
    document.getElementById('rC').textContent=selCommunityName;
    var clubSel=document.getElementById('clubSelect');
    document.getElementById('rClub').textContent=clubSel.options[clubSel.selectedIndex]?.text||'—';
    document.getElementById('rDate').textContent=document.getElementById('inputDate').value||'—';
    document.getElementById('rDurVal').textContent=selDur+' دقيقة';
    document.getElementById('rCourts').textContent=courts+(courts===1?' ملعب':' ملاعب');
    document.getElementById('rN').textContent=players+' لاعبين';
    document.getElementById('rPrice').textContent=total.toLocaleString()+' ريال';
    document.getElementById('rPerPlayer').textContent=perPlayer.toLocaleString()+' ريال';
  }
}
function adj(d){var el=document.getElementById('pc');el.value=Math.max(2,parseInt(el.value||2)+d);calcPrice();}
</script>
</body></html>
