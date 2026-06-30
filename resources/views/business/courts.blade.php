<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — إدارة الملاعب</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
@vite(['resources/css/main.css', 'resources/css/business.css'])
</head>
<body>
<button class="menu-toggle" id="menuBtn" onclick="togMobile()">☰</button>
<div class="sidebar-backdrop" id="sbBackdrop" onclick="closeMobile()"></div>
<div class="sidebar" id="sb">
  <div class="logo"><div class="ar">تيمات</div><div class="en">business PORTAL</div></div>
  <div class="co-info"><div class="lbl">مزود الخدمة</div><div class="nm">{{ $business->name }}</div><div class="sb">{{ $business->district }}، {{ $business->city }}</div></div>
  <nav>
    <div class="ni" onclick="window.location='/business/dash'"><span>📊</span><span class="nl"> الرئيسية</span></div>
    <div class="ni" onclick="window.location='/business/requests'"><span>📋</span><span class="nl"> طلبات الحجز</span></div>
    <div class="ni" onclick="window.location='/business/schedule'"><span>📅</span><span class="nl"> التقويم</span></div>
    <div class="ni on" onclick="window.location='/business/venues'"><span>🏟️</span><span class="nl"> إدارة الملاعب</span></div>
    <div class="ni" onclick="window.location='/business/settlements'"><span>💰</span><span class="nl"> التسويات</span></div>
    <div style="margin-top:auto;padding-top:12px;border-top:1px solid #232A3E;margin:16px 4px 0;">
      <form method="POST" action="{{ route('business.logout') }}" style="margin:0;"><input type="hidden" name="_token" value="{{ csrf_token() }}"><button type="submit" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-size:13px;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .15s;" onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background='transparent'"><span>🚪</span><span>تسجيل الخروج</span></button></form>
    </div>
  </nav>
  <div class="tog" onclick="togSB()">→</div>
</div>
<div class="main">

<!-- venueS MANAGEMENT -->
<div class="sc on" id="cvenues">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <div><div style="font-size:22px;font-weight:900;">إدارة الملاعب</div><div style="font-size:13px;color:#8A7868;">حدد الملاعب وأنواعها وأسعارها</div></div>
    <button onclick="document.getElementById('newForm').style.display='block';document.getElementById('newForm').scrollIntoView({behavior:'smooth'})" style="background:#C8410A;color:#fff;border:none;border-radius:12px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">+ إضافة ملعب</button>
  </div>
  <div id="cList">

    @forelse($venues as $venue)
    @php
      $sportIcon = $venue->sport?->icon ?? '🏟️';
      $sportName = $venue->sport?->name ?? '';
      $statusBadge = match($venue->status) {
        'active' => ['bg' => '#1A7A4A18', 'color' => '#1A7A4A', 'label' => '● نشط'],
        'closed' => ['bg' => '#C8410A18', 'color' => '#C8410A', 'label' => '● مغلق'],
        'maintenance' => ['bg' => '#B8860A18', 'color' => '#B8860A', 'label' => '🔧 صيانة'],
        default => ['bg' => '#8A786818', 'color' => '#8A7868', 'label' => $venue->status],
      };
      $pricingSummary = $venue->pricings->map(fn($p) => $p->duration_minutes . ' د: ' . number_format($p->price) . ' ر')->join(' · ');
      if (!$pricingSummary) {
        $pricingSummary = 'لم يُحدد سعر';
      }
    @endphp
    <div class="card" style="margin-bottom:14px;" id="ct{{ $venue->id }}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:48px;height:48px;border-radius:14px;background:{{ $statusBadge['color'] }}18;display:flex;align-items:center;justify-content:center;font-size:26px;">{{ $sportIcon }}</div>
          <div><div style="font-size:15px;font-weight:800;">{{ $venue->name }}</div><div style="font-size:12px;color:#8A7868;">{{ $sportName }} · {{ $pricingSummary }}</div></div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;"><span class="badge" style="background:{{ $statusBadge['bg'] }};color:{{ $statusBadge['color'] }};">{{ $statusBadge['label'] }}</span><button onclick="togEdit('e{{ $venue->id }}')" style="background:#F7F4F0;border:1px solid #EAE4DC;border-radius:8px;padding:5px 12px;font-size:12px;cursor:pointer;font-family:inherit;">تعديل</button></div>
      </div>
      @if($venue->pricings->isNotEmpty())
      <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;">
        @foreach($venue->pricings as $pricing)
        <span style="background:#F7F4F0;border:1px solid #EAE4DC;border-radius:8px;padding:4px 10px;font-size:11px;color:#1C1410;">{{ $pricing->duration_minutes }} دقيقة — {{ number_format($pricing->price) }} ريال</span>
        @endforeach
      </div>
      @endif
      <div id="e{{ $venue->id }}" style="display:none;background:#F7F4F0;border-radius:12px;padding:16px;margin-top:14px;">
        <form action="{{ route('business.venues.update', $venue) }}" method="POST">
          @csrf
          @method('PUT')
          <div class="frow"><div class="fg"><label>اسم الملعب</label><input type="text" name="name" value="{{ $venue->name }}"></div><div class="fg"><label>نوع الرياضة</label><select name="sport_id">@foreach($sports as $sport)<option value="{{ $sport->id }}" {{ $venue->sport_id == $sport->id ? 'selected' : '' }}>{{ $sport->icon }} {{ $sport->name }}</option>@endforeach</select></div></div>
          <div class="frow"><div class="fg"><label>الحالة</label><select name="status"><option value="active" {{ $venue->status === 'active' ? 'selected' : '' }}>● نشط</option><option value="closed" {{ $venue->status === 'closed' ? 'selected' : '' }}>● مغلق</option><option value="maintenance" {{ $venue->status === 'maintenance' ? 'selected' : '' }}>🔧 صيانة</option></select></div></div>
          <div style="display:flex;gap:10px;"><button type="submit" style="flex:2;padding:10px;background:#1A7A4A;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">حفظ ✓</button><button type="button" onclick="togEdit('e{{ $venue->id }}')" style="flex:1;padding:10px;background:#EAE4DC;color:#8A7868;border:none;border-radius:10px;font-size:13px;cursor:pointer;font-family:inherit;">إلغاء</button></div>
        </form>
      </div>
    </div>
    @empty
    <div class="card" style="text-align:center;padding:40px;color:#8A7868;">
      <div style="font-size:40px;margin-bottom:12px;">🏟️</div>
      <div style="font-size:15px;font-weight:700;">لا توجد ملاعب مسجلة</div>
      <div style="font-size:12px;margin-top:4px;">أضف ملعبك الأول من الزر أعلاه</div>
    </div>
    @endforelse

  </div>

  <!-- Add new venue -->
  <div id="newForm" style="display:none;background:#fff;border:2px dashed #C8410A66;border-radius:16px;padding:20px;margin-top:8px;">
    <div style="font-size:14px;font-weight:700;color:#C8410A;margin-bottom:16px;">+ إضافة ملعب جديد</div>
    <form action="{{ route('business.venues.store') }}" method="POST">
      @csrf
      <div class="frow">
        <div class="fg"><label>اسم الملعب</label><input type="text" name="name" placeholder="مثال: ملعب بادل 3" required></div>
        <div class="fg"><label>نوع الرياضة</label><select name="sport_id">@foreach($sports as $sport)<option value="{{ $sport->id }}">{{ $sport->icon }} {{ $sport->name }}</option>@endforeach</select></div>
      </div>
      <div class="fg" style="margin-bottom:16px;"><label>الحالة</label><select name="status"><option value="active">● نشط</option><option value="closed">● مغلق</option></select></div>
      <div style="display:flex;gap:10px;">
        <button type="submit" style="flex:2;padding:10px;background:#C8410A;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">إضافة الملعب</button>
        <button type="button" onclick="document.getElementById('newForm').style.display='none'" style="flex:1;padding:10px;background:#EAE4DC;color:#8A7868;border:none;border-radius:10px;font-size:13px;cursor:pointer;font-family:inherit;">إلغاء</button>
      </div>
    </form>
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
function togEdit(id){var e=document.getElementById(id);e.style.display=e.style.display==='none'?'block':'none';}
</script>
</body></html>
